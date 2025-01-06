import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../components/userAuth';

function EventosPage() {
  useAuth();
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchEventos = async () => {
      try {
        const response = await fetch(`http://localhost:8081/eventos?page=${currentPage}&limit=9`);
        if (!response.ok) {
          throw new Error('Erro ao buscar eventos');
        }
        const data = await response.json();
        setEventos(data.eventos);
        setTotalPages(data.totalPages);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEventos();
  }, [currentPage]);

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
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao comprar bilhete');
      }
      
      window.location.reload();
    } catch (error) {
      console.error(error.message);
      setError(error.message);
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const formatDateTime = (dateString) => {
    const options = {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    };
    return new Date(dateString).toLocaleString('pt-PT', options);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500 text-lg">A carregar eventos...</p>
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

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-6">
      <h1 className="text-3xl font-semibold text-center text-gray-800 mb-8">Lista de Eventos</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {eventos.map((evento) => (
          <div
            key={evento.id_evento}
            className="bg-white shadow-md rounded-lg p-6 relative transition-transform transform hover:scale-105"
          >
            {evento.foto && (
              <img 
                src={evento.foto} 
                alt={`Foto do evento ${evento.nome_evento}`} 
                className="w-full h-48 object-cover rounded-t-lg mb-4"
              />
            )}
            <h2 className="text-2xl font-semibold text-blue-600">{evento.nome_evento}</h2>
            <p className="text-gray-600 mt-2">
              <span className="font-semibold">Data Início:</span> {formatDateTime(evento.data_inicio)}
            </p>
            <p className="text-gray-600 mt-2">
              <span className="font-semibold">Data Fim:</span> {formatDateTime(evento.data_fim)}
            </p>
            <p className="text-gray-600 mt-1 mb-12">
              <span className="font-semibold">Breve Descrição:</span> {evento.breve_desc}
            </p>
            
            <Link
              to={`/eventos/${evento.id_evento}`}
              className="absolute bottom-4 left-4 bg-gray-600 text-white font-semibold py-2 px-4 rounded-full shadow-lg hover:bg-gray-700 transition-transform transform hover:scale-105"
            >
              Ver Detalhes
            </Link>
            <button
              onClick={() => handleComprarBilhete(evento.id_evento)}
              className="absolute bottom-4 right-4 bg-blue-600 text-white font-semibold py-2 px-4 rounded-full shadow-lg hover:bg-blue-700 transition-transform transform hover:scale-105"
              disabled={evento.capacidade === 0} 
            >
              {evento.capacidade === 0 ? 'Esgotado' : 'Comprar Bilhete'}
            </button>
          </div>
        ))}
      </div>
      <div className="flex justify-center mt-8">
        <button 
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 mx-2 bg-gray-300 text-gray-800 font-semibold rounded-lg shadow-md hover:bg-gray-400 disabled:opacity-50"
        >
          Anterior
        </button>
        <span className="px-4 py-2 mx-2 bg-white text-gray-800 font-semibold rounded-lg shadow-md">
          Página {currentPage} de {totalPages}
        </span>
        <button 
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 mx-2 bg-gray-300 text-gray-800 font-semibold rounded-lg shadow-md hover:bg-gray-400 disabled:opacity-50"
        >
          Próxima
        </button>
      </div>
    </div>
  );
}

export default EventosPage;
