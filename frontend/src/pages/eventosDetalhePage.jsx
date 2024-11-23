import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function EventoDetalhesPage() {
  const { id } = useParams();
  const [evento, setEvento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvento = async () => {
      try {
        const response = await fetch(`http://localhost:8081/eventos/${id}`);
        if (!response.ok) {
          throw new Error('Erro ao buscar detalhes do evento');
        }
        const data = await response.json();
        setEvento(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvento();
  }, [id]);

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
      </div>
    </div>
  );
}

export default EventoDetalhesPage;
