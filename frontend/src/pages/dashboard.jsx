import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
  const [clientes, setClientes] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [palestrantes, setPalestrantes] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [salas, setSalas] = useState([]);
  const [organizadores, setOrganizadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSection, setSelectedSection] = useState('clientes');

  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const api = axios.create({
    baseURL: 'http://localhost:8081/',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  useEffect(() => {
    if (!token) {
      setError('Token não encontrado');
      setLoading(false);
      return;
    }

    let decodedToken;
    try {
      decodedToken = jwtDecode(token);
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
        const [
          clientesData,
          eventosData,
          palestrantesData,
          categoriasData,
          salasData,
          organizadoresData,
        ] = await Promise.all([
          api.get('admin/clientes'),
          api.get('admin/eventos'),
          api.get('admin/palestrantes'),
          api.get('admin/categorias'),
          api.get('admin/salas'),
          api.get('admin/organizadores'),
        ]);

        setClientes(clientesData.data);
        setEventos(eventosData.data);
        setPalestrantes(palestrantesData.data);
        setCategorias(categoriasData.data);
        setSalas(salasData.data);
        setOrganizadores(organizadoresData.data);
        setError(null);
      } catch (err) {
        setError('Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const handleEdit = async (id, updatedData, type) => {
    try {
      const endpoint =
        type === 'clientes'
          ? 'clientes'
          : type === 'eventos'
          ? 'eventos'
          : 'palestrantes';

      await api.put(`admin/${endpoint}/${id}`, updatedData);

      const updateState = (stateUpdater, key) =>
        stateUpdater((prev) =>
          prev.map((item) => (item[key] === id ? { ...item, ...updatedData } : item))
        );

      if (type === 'clientes') updateState(setClientes, 'user_id');
      if (type === 'eventos') updateState(setEventos, 'id_evento');
      if (type === 'palestrantes') updateState(setPalestrantes, 'id_palestrante');
    } catch (err) {
      setError('Erro ao atualizar os dados');
    }
  };

  const handleChange = (id, newValue, type, field) => {
    const updatedData = { [field]: newValue };
    handleEdit(id, updatedData, type);
  };

  const handleCategoryChange = (id, newCategoryId) => {
    handleChange(id, newCategoryId, 'eventos', 'id_categoria');
  };

  const handleSalaChange = (id, newSalaId) => {
    handleChange(id, newSalaId, 'eventos', 'id_sala');
  };

  const handleOrganizadorChange = (id, newOrganizadorId) => {
    handleChange(id, newOrganizadorId, 'eventos', 'id_organizador');
  };

  const renderSection = () => {
    if (selectedSection === 'clientes') {
      return (
        <div>
          <h2 className="text-2xl font-bold mb-4">Clientes</h2>
          <table className="table-auto w-full text-left bg-white shadow rounded-md">
            <thead>
              <tr className="bg-gray-200">
                <th className="px-4 py-2 border">User ID</th>
                <th className="px-4 py-2 border">Nome</th>
                <th className="px-4 py-2 border">Email</th>
                <th className="px-4 py-2 border">Nível</th>
                <th className="px-4 py-2 border">Ações</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((cliente) => (
                <tr key={cliente.user_id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border">{cliente.user_id}</td>
                  <td className="px-4 py-2 border">
                    <input
                      type="text"
                      value={cliente.nome}
                      onChange={(e) =>
                        handleChange(cliente.user_id, e.target.value, 'clientes', 'nome')
                      }
                      className="border rounded p-1 w-full"
                    />
                  </td>
                  <td className="px-4 py-2 border">
                    <input
                      type="email"
                      value={cliente.email}
                      onChange={(e) =>
                        handleChange(cliente.user_id, e.target.value, 'clientes', 'email')
                      }
                      className="border rounded p-1 w-full"
                    />
                  </td>
                  <td className="px-4 py-2 border">
                    <input
                      type="number"
                      value={cliente.nivel}
                      onChange={(e) =>
                        handleChange(
                          cliente.user_id,
                          parseInt(e.target.value, 10),
                          'clientes',
                          'nivel'
                        )
                      }
                      className="border rounded p-1 w-full"
                    />
                  </td>
                  <td className="px-4 py-2 border space-x-2">
                    <button
                      onClick={() =>
                        handleEdit(
                          cliente.user_id,
                          {
                            nome: cliente.nome,
                            email: cliente.email,
                            nivel: cliente.nivel,
                          },
                          'clientes'
                        )
                      }
                      className="px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-700"
                    >
                      Salvar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    if (selectedSection === 'eventos') {
      return (
        <div>
          <h2 className="text-2xl font-bold mb-4">Eventos</h2>
          <table className="table-auto w-full text-left bg-white shadow rounded-md">
            <thead>
              <tr className="bg-gray-200">
                <th className="px-4 py-2 border">Nome</th>
                <th className="px-4 py-2 border">Categoria</th>
                <th className="px-4 py-2 border">Sala</th>
                <th className="px-4 py-2 border">Organizador</th>
                <th className="px-4 py-2 border">Ações</th>
              </tr>
            </thead>
            <tbody>
              {eventos.map((evento) => (
                <tr key={evento.id_evento} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border">{evento.nome}</td>
                  <td className="px-4 py-2 border">
                    <select
                      value={evento.id_categoria || ''}
                      onChange={(e) =>
                        handleCategoryChange(
                          evento.id_evento,
                          parseInt(e.target.value, 10)
                        )
                      }
                      className="border rounded p-1 w-full"
                    >
                      <option value="" disabled>
                        {evento.categoria_nome || 'Selecione uma categoria'}
                      </option>
                      {categorias.map((categoria) => (
                        <option
                          key={categoria.id_categoria}
                          value={categoria.id_categoria}
                        >
                          {categoria.descricao}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-2 border">
                    <select
                      value={evento.id_sala || ''}
                      onChange={(e) =>
                        handleSalaChange(evento.id_evento, parseInt(e.target.value, 10))
                      }
                      className="border rounded p-1 w-full"
                    >
                      <option value="" disabled>
                        {evento.sala_nome || 'Selecione uma sala'}
                      </option>
                      {salas.map((sala) => (
                        <option key={sala.id_sala} value={sala.id_sala}>
                          {sala.nome_sala}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-2 border">
                    <select
                      value={evento.id_organizador || ''}
                      onChange={(e) =>
                        handleOrganizadorChange(
                          evento.id_evento,
                          parseInt(e.target.value, 10)
                        )
                      }
                      className="border rounded p-1 w-full"
                    >
                      <option value="" disabled>
                        {evento.organizador_nome || 'Selecione um organizador'}
                      </option>
                      {organizadores.map((organizador) => (
                        <option
                          key={organizador.id_organizador}
                          value={organizador.id_organizador}
                        >
                          {organizador.nome}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-2 border">
                    <button
                      onClick={() =>
                        handleEdit(
                          evento.id_evento,
                          {
                            id_categoria: evento.id_categoria,
                            id_sala: evento.id_sala,
                            id_organizador: evento.id_organizador,
                          },
                          'eventos'
                        )
                      }
                      className="px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-700"
                    >
                      Salvar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="flex">
      <div className="w-1/4 bg-gray-800 text-white h-screen p-4">
        <h2 className="text-xl font-bold mb-4">Admin Dashboard</h2>
        <ul>
          <li>
            <button
              onClick={() => setSelectedSection('clientes')}
              className="w-full text-left py-2 px-4 hover:bg-gray-600 rounded"
            >
              Clientes
            </button>
          </li>
          <li>
            <button
              onClick={() => setSelectedSection('eventos')}
              className="w-full text-left py-2 px-4 hover:bg-gray-600 rounded"
            >
              Eventos
            </button>
          </li>
        </ul>
      </div>
      <div className="w-3/4 p-6 bg-gray-100">
        {loading && <p>Carregando...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {renderSection()}
      </div>
    </div>
  );
}

export default AdminDashboard;
