import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useAuth from '../components/userAuth';

function EventoDetalhesPage() {
  useAuth();
  const { id } = useParams();
  const [evento, setEvento] = useState(null);
  const [isInscrito, setIsInscrito] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [capacidade, setCapacidade] = useState(0);

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
        setCapacidade(data.capacidade);

        // Verificar se o utilizador está inscrito no evento
        const token = localStorage.getItem('token');
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

  // Função para inscrever no evento
  const handleInscrever = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Utilizador não autenticado');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8081/comprar-bilhete/${id}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        alert('Inscrição realizada com sucesso');
        setIsInscrito(true);
        setCapacidade(capacidade - 1);
      } else {
        const errorData = await response.json();
        alert(`Erro: ${errorData.error || 'Não foi possível inscrever'}`);
      }
    } catch (error) {
      alert('Erro ao inscrever');
    }
  };

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
        setCapacidade(capacidade + 1);
      } else {
        const errorData = await response.json();
        alert(`Erro: ${errorData.error || 'Não foi possível desinscrever'}`);
      }
    } catch (error) {
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

  const palestrantesNomes = evento.palestrantes?.map(palestrante => palestrante.nome).join(', ');

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-6">
      <div className="max-w-5xl mx-auto bg-white shadow-md rounded-lg p-6">
        <h1 className="text-4xl font-bold text-left text-blue-600 mb-4" style={{ marginLeft: '40px', marginBottom: '50px' }}>{evento.nome_evento}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {evento.foto && (
            <div className="relative w-full h-64 md:w-96 md:h-96 flex-shrink-0 overflow-hidden rounded-lg">
              <img 
                src={evento.foto} 
                alt={`Foto do evento ${evento.nome_evento}`} 
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className={`flex flex-col ${evento.foto ? '' : 'col-span-2'}`}>
            <table className="min-w-full bg-white mb-6">
              <tbody>
                <tr>
                  <td className="px-8 py-2 border font-semibold">Data Início:</td>
                  <td className="px-8 py-2 border">{new Date(evento.data_inicio).toLocaleString('pt-PT', { dateStyle: 'full', timeStyle: 'short' })}</td>
                </tr>
                <tr>
                  <td className="px-8 py-2 border font-semibold">Data Fim:</td>
                  <td className="px-8 py-2 border">{new Date(evento.data_fim).toLocaleString('pt-PT', { dateStyle: 'full', timeStyle: 'short' })}</td>
                </tr>
                <tr>
                  <td className="px-8 py-2 border font-semibold">Categoria:</td>
                  <td className="px-8 py-2 border">{evento.categoria}</td>
                </tr>
                <tr>
                  <td className="px-8 py-2 border font-semibold">Sala:</td>
                  <td className="px-8 py-2 border">{evento.nome_sala}</td>
                </tr>
                <tr>
                  <td className="px-8 py-2 border font-semibold">Capacidade:</td>
                  <td className="px-8 py-2 border">{evento.capacidade}</td>
                </tr>
                <tr>
                  <td className="px-8 py-2 border font-semibold">Palestrantes:</td>
                  <td className="px-8 py-2 border">{palestrantesNomes || 'N/A'}</td>
                </tr>
              </tbody>
            </table>
            <div className="mt-6">
              {isInscrito ? (
                <button
                  onClick={handleDesinscrever}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Desinscrever
                </button>
              ) : capacidade > 0 ? (
                <button
                  onClick={handleInscrever}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Inscrever
                </button>
              ) : (
                <p className="text-red-500 font-semibold">Esgotado</p>
              )}
            </div>
          </div>
        </div>
        <div className="mt-8">
          <p className="text-gray-600 mb-6">{evento.descricao}</p>
        </div>
      </div>
    </div>
  );
}

export default EventoDetalhesPage;
