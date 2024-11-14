import React, { useEffect, useState } from 'react';

function EventosPage() {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEventos = async () => {
      try {
        const response = await fetch('http://localhost:8081/eventos');
        if (!response.ok) {
          throw new Error('Erro ao buscar eventos');
        }
        const data = await response.json();
        setEventos(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEventos();
  }, []);

  const handleComprarBilhete = async (id_evento) => {
    try {
      const token = localStorage.getItem('token'); 

      if (!token) {
        throw new Error('Token não encontrado');
      }

      const response = await fetch(`http://localhost:8081/comprar-bilhete/${id_evento}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,  // Envia o token JWT no cabeçalho
        },
      });

      if (!response.ok) {
      }

      // Atualiza a lista de eventos com a nova capacidade
      const data = await response.json();
      setEventos((prevEventos) =>
        prevEventos.map((evento) =>
          evento.id_evento === id_evento ? { ...evento, capacidade: data.capacidade } : evento
        )
      );
    } catch (error) {
      console.error(error.message);
      setError(error.message);  // Exibe o erro, caso ocorra
    }
  };

  // Se estiver carregando
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500 text-lg">A carregar eventos...</p>
      </div>
    );
  }

  // Se houver um erro
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500 text-lg">Erro: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-6">
      <h1 className="text-3xl font-semibold text-center text-gray-800 mb-8">Lista de Eventos</h1>
      <ul className="space-y-6 max-w-4xl mx-auto">
        {eventos.map((evento) => (
          <li
            key={evento.id_evento}
            className="bg-white shadow-md rounded-lg p-6 relative transition-transform transform hover:scale-105"
          >
            <h2 className="text-2xl font-semibold text-blue-600">{evento.nome_evento}</h2>
            <p className="text-gray-600 mt-2">
              <span className="font-semibold">Data:</span> {evento.data_inicio} - {evento.data_fim}
            </p>
            <p className="text-gray-600 mt-1">
              <span className="font-semibold">Categoria:</span> {evento.categoria}
            </p>
            <p className="text-gray-600 mt-1 mb-12">
              <span className="font-semibold">Sala:</span> {evento.nome_sala} (Capacidade: {evento.capacidade})
            </p>

            {/* Botão de compra de bilhete */}
            <button
              onClick={() => handleComprarBilhete(evento.id_evento)}
              className="absolute bottom-4 right-4 bg-blue-600 text-white font-semibold py-2 px-4 rounded-full shadow-lg hover:bg-blue-700 transition-transform transform hover:scale-105"
              disabled={evento.capacidade === 0} 
            >
              {evento.capacidade === 0 ? 'Esgotado' : 'Comprar Bilhete'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default EventosPage;