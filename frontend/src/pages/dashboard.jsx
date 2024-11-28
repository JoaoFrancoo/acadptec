import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
  const [clientes, setClientes] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [palestrantes, setPalestrantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('token');
  const navigate = useNavigate();  // Hook para navegação (redirecionamento)

  console.log('Token no componente:', token);

  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  useEffect(() => {
    console.log('Token no useEffect:', token);

    if (!token) {
      setError('Token não encontrado');
      setLoading(false);
      return;
    }

    let decodedToken;
    try {
      decodedToken = jwtDecode(token);
      console.log('Token Decodificado:', decodedToken);

      // Verificar se o nível do usuário é menor que 4
      if (decodedToken.nivel < 4) {
        setError('Acesso negado. Permissão insuficiente');
        setLoading(false);
        return;
      }
    } catch (e) {
      setError('Token inválido ou corrompido');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const [clientesData, eventosData, palestrantesData] = await Promise.all([
          axios.get('http://localhost:8081/admin/clientes'),
          axios.get('http://localhost:8081/admin/eventos'),
          axios.get('http://localhost:8081/admin/palestrantes'),
        ]);

        setClientes(clientesData.data);
        setEventos(eventosData.data);
        setPalestrantes(palestrantesData.data);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError('Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const handleStatusChange = async (id, status) => {
    try {
      await axios.put(
        `http://localhost:8081/admin/palestrante/${id}`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Atualizar a lista de palestrantes após mudança de status
      setPalestrantes((prev) =>
        prev.map((palestrante) =>
          palestrante.id_cliente === id ? { ...palestrante, status } : palestrante
        )
      );
    } catch (err) {
      setError('Erro ao atualizar status');
    }
  };

  // Função para bloquear o usuário
  const handleBlockUser = async (id) => {
    try {
      await axios.put(
        `http://localhost:8081/admin/block/${id}`,  // Rota para bloquear usuário
        { nivel: 0 },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Atualiza o status do usuário para bloqueado (nivel 0)
      setClientes((prev) =>
        prev.map((cliente) =>
          cliente.user_id === id ? { ...cliente, nivel: 0 } : cliente
        )
      );
    } catch (err) {
      setError('Erro ao bloquear usuário');
    }
  };

  if (loading) {
    return <div className="text-center text-gray-500">Carregando...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-semibold text-center mb-6">Dashboard do Administrador</h1>

      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Clientes</h2>
        <ul className="space-y-3">
          {clientes.map((cliente) => (
            <li key={cliente.user_id} className="flex justify-between bg-gray-100 p-4 rounded-lg shadow-md">
              <span>{cliente.nome} - {cliente.email}</span>
              <button
                onClick={() => handleBlockUser(cliente.user_id)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-700"
              >
                Bloquear
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Eventos</h2>
        <ul className="space-y-3">
          {eventos.map((evento) => (
            <li key={evento.id_evento} className="flex justify-between bg-gray-100 p-4 rounded-lg shadow-md">
              <span>{evento.nome} - {evento.data_inicio} a {evento.data_fim}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Palestrantes</h2>
        <ul className="space-y-3">
          {palestrantes.map((palestrante) => (
            <li key={palestrante.id_cliente} className="flex justify-between bg-gray-100 p-4 rounded-lg shadow-md">
              <div className="flex flex-col">
                <span>{palestrante.nome} - Status: {palestrante.status}</span>
                {palestrante.status === 'pendente' && (
                  <div className="mt-2 flex space-x-2">
                    <button
                      onClick={() => handleStatusChange(palestrante.id_cliente, 'aprovado')}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-700"
                    >
                      Aprovar
                    </button>
                    <button
                      onClick={() => handleStatusChange(palestrante.id_cliente, 'recusado')}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-700"
                    >
                      Recusar
                    </button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default AdminDashboard;
