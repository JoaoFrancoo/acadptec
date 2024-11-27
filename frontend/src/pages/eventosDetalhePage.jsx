import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function EventoDetalhesPage() {
  const { id } = useParams();
  const [evento, setEvento] = useState(null);
  const [isInscrito, setIsInscrito] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Função para buscar detalhes do evento
  useEffect(() => {
    const fetchEvento = async () => {
      try {
        const response = await fetch(`http://localhost:8081/eventos/${id}`);
        if (!response.ok) {
          throw new Error('Erro ao buscar detalhes do evento');
        }
        const data = await response.json();
        setEvento(data);

        // Verificar se o utilizador está inscrito no evento
        const token = localStorage.getItem('token'); // Supõe que o token está armazenado no localStorage
        if (token) {
          const inscricaoResponse = await fetch(`http://localhost:8081/user/me/details`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (inscricaoResponse.ok) {
            const inscricaoData = await inscricaoResponse.json();
            const inscrito = inscricaoData.inscricoes.some(
              (inscricao) => inscricao.id_evento === parseInt(id)
            );
            setIsInscrito(inscrito);
          }
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvento();
  }, [id]);

  // Função para desinscrever do evento
  const handleDesinscrever = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Utilizador não autenticado');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8081/retirar-bilhete/${id}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        alert('Desinscrição realizada com sucesso');
        setIsInscrito(false);
      } else {
        const errorData = await response.json();
        alert(`Erro: ${errorData.error || 'Não foi possível desinscrever'}`);
      }
    } catch (error) {
      console.error('Erro ao desinscrever:', error);
      alert('Erro ao desinscrever');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500 text-lg">A carregar informações do evento...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500 text-lg">Erro: {error}</p>
      </div>
    );
  }

  if (!evento) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500 text-lg">Evento não encontrado</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-6">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6">
        <h1 className="text-3xl font-semibold text-blue-600">{evento.nome_evento}</h1>
        <p className="text-gray-600 mt-4">
          <span className="font-semibold">Data:</span> {evento.data_inicio} - {evento.data_fim}
        </p>
        <p className="text-gray-600 mt-2">
          <span className="font-semibold">Categoria:</span> {evento.categoria}
        </p>
        <p className="text-gray-600 mt-2">
          <span className="font-semibold">Sala:</span> {evento.nome_sala}
        </p>
        <p className="text-gray-600 mt-2">
          <span className="font-semibold">Capacidade:</span> {evento.capacidade}
        </p>
        <p className="text-gray-600 mt-4">{evento.descricao}</p>

        {isInscrito && (
          <button
            onClick={handleDesinscrever}
            className="mt-6 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Desinscrever
          </button>
        )}
      </div>
    </div>
  );
}

export default EventoDetalhesPage;
