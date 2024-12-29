import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useAuth from '../components/userAuth';
import Modal from 'react-modal';

Modal.setAppElement('#root');

function EventoDetalhesPage() {
  useAuth();
  const { id } = useParams();
  const [evento, setEvento] = useState(null);
  const [isInscrito, setIsInscrito] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [capacidade, setCapacidade] = useState(0);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalType, setModalType] = useState('');
  const [quantidade, setQuantidade] = useState(1);

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
              (inscricao) => inscricao.id_evento === parseInt(id) && inscricao.visivel === 1
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

  const openModal = (type) => {
    setModalType(type);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const handleConfirm = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Utilizador não autenticado');
      return;
    }

    if (modalType === 'inscrever' && quantidade > capacidade) {
      alert('Não existem lugares suficientes');
      return;
    }

    const endpoint = modalType === 'inscrever' ? `comprar-bilhete/${id}` : `retirar-bilhete/${id}`;
    const method = 'POST';
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
    const body = JSON.stringify({ quantidade });

    try {
      const response = await fetch(`http://localhost:8081/${endpoint}`, { method, headers, body });

      if (response.ok) {
        alert(`${modalType === 'inscrever' ? 'Inscrição' : 'Desinscrição'} realizada com sucesso`);
        window.location.reload(); // Recarregar a página para atualizar a capacidade e os botões
      } else {
        const errorData = await response.json();
        alert(`Erro: ${errorData.error || `Não foi possível ${modalType === 'inscrever' ? 'inscrever' : 'desinscrever'}`}`);
      }
    } catch (error) {
      alert(`Erro ao ${modalType === 'inscrever' ? 'inscrever' : 'desinscrever'}`);
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
                  onClick={() => openModal('desinscrever')}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Desinscrever
                </button>
              ) : capacidade > 0 ? (
                <button
                  onClick={() => openModal('inscrever')}
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
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel={`${modalType === 'inscrever' ? 'Inscrever no' : 'Desinscrever do'} evento ${evento.nome_evento}`}
        className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50"
      >
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-semibold mb-4">{modalType === 'inscrever' ? `Inscrever no evento ${evento.nome_evento}` : `Desinscrever do evento ${evento.nome_evento}`}</h2>
          <div className="mb-4">
            <label className="block mb-1 font-bold">Quantidade:</label>
            <input
              type="number"
              min="1"
              max={capacidade}
              value={quantidade}
              onChange={(e) => setQuantidade(parseInt(e.target.value))}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="flex justify-between">
            <button
              onClick={handleConfirm}
              className={`px-4 py-2 rounded ${modalType === 'inscrever' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'} text-white`}
            >
              Confirmar {modalType === 'inscrever' ? 'Inscrição' : 'Desinscrição'}
            </button>
            <button
              onClick={closeModal}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Sair
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default EventoDetalhesPage;
