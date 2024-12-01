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
    baseURL: 'http://localhost:8081/', // Defina o endereço base da API
    headers: {
      'Authorization': `Bearer ${token}`,
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
      setLoading(true);
      try {
        const [clientesData, eventosData, palestrantesData, categoriasData, salasData, organizadoresData] = await Promise.all([
          api.get('admin/clientes'),
          api.get('admin/eventos'),
          api.get('admin/palestrantes'),
          api.get('admin/categorias'),
          api.get('admin/salas'),
          api.get('admin/organizadores'),
        ]);
        console.log('Clientes:', clientesData.data);
        console.log('Eventos:', eventosData.data);
        console.log('Palestrantes:', palestrantesData.data);
        console.log('Categorias:', categoriasData.data);
        console.log('Salas:', salasData.data);
        console.log('Organizadores:', organizadoresData.data);

        setClientes(clientesData.data);
        setEventos(eventosData.data);
        setPalestrantes(palestrantesData.data);
        setCategorias(categoriasData.data);
        setSalas(salasData.data);
        setOrganizadores(organizadoresData.data);
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
      const endpoint = type === 'clientes' ? 'clientes' : type === 'eventos' ? 'eventos' : 'palestrantes';
      await api.put(`admin/${endpoint}/${id}`, updatedData);

      if (type === 'clientes') {
        setClientes((prev) => prev.map((item) => (item.user_id === id ? { ...item, ...updatedData } : item)));
      } else if (type === 'eventos') {
        setEventos((prev) => prev.map((item) => (item.id_evento === id ? { ...item, ...updatedData } : item)));
      } else if (type === 'palestrantes') {
        setPalestrantes((prev) => prev.map((item) => (item.id_palestrante === id ? { ...item, ...updatedData } : item)));
      }
    } catch (err) {
      setError('Erro ao atualizar os dados');
    }
  };

  const handleCategoryChange = (id, newCategoryId) => {
    const updatedEvent = { id_categoria: newCategoryId };
    handleEdit(id, updatedEvent, 'eventos');
  };

  const handleSalaChange = (id, newSalaId) => {
    const updatedEvent = { id_sala: newSalaId };
    handleEdit(id, updatedEvent, 'eventos');
  };

  const handleOrganizadorChange = (id, newOrganizadorId) => {
    const updatedEvent = { id_organizador: newOrganizadorId };
    handleEdit(id, updatedEvent, 'eventos');
  };

  const renderSection = () => {
    if (selectedSection === 'eventos') {
      return (
        <div>
          <h2 className="text-2xl font-bold mb-4">Eventos</h2>

          {/* Tabela de Eventos */}
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

                  {/* Categoria */}
                  <td className="px-4 py-2 border">
                    {categorias.length > 0 && (
                      <select
                        value={evento.id_categoria || ''}
                        onChange={(e) => handleCategoryChange(evento.id_evento, e.target.value)}
                        className="border rounded p-1 w-full"
                      >
                        <option value="">Selecione a Categoria</option>
                        {categorias.map((categoria) => (
                          <option key={categoria.id_categoria} value={categoria.id_categoria}>
                            {categoria.descricao}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>

                  {/* Sala */}
                  <td className="px-4 py-2 border">
                    {salas.length > 0 && (
                      <select
                        value={evento.id_sala || ''}
                        onChange={(e) => handleSalaChange(evento.id_evento, e.target.value)}
                        className="border rounded p-1 w-full"
                      >
                        <option value="">Selecione a Sala</option>
                        {salas.map((sala) => (
                          <option key={sala.id_sala} value={sala.id_sala}>
                            {sala.nome_sala}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>

                  {/* Organizador */}
                  <td className="px-4 py-2 border">
                    {organizadores.length > 0 && (
                      <select
                        value={evento.id_organizador || ''}
                        onChange={(e) => handleOrganizadorChange(evento.id_evento, e.target.value)}
                        className="border rounded p-1 w-full"
                      >
                        <option value="">Selecione o Organizador</option>
                        {organizadores.map((organizador) => (
                          <option key={organizador.id_organizador} value={organizador.id_organizador}>
                            {organizador.nome}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>

                  <td className="px-4 py-2 border space-x-2">
                    <button
                      onClick={() =>
                        handleEdit(evento.id_evento, {
                          nome: evento.nome,
                          id_categoria: evento.id_categoria,
                          id_sala: evento.id_sala,
                          id_organizador: evento.id_organizador,
                        }, 'eventos')
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
          <li>
            <button
              onClick={() => setSelectedSection('palestrantes')}
              className="w-full text-left py-2 px-4 hover:bg-gray-600 rounded"
            >
              Palestrantes
            </button>
          </li>
        </ul>
      </div>
      <div className="w-3/4 p-8">
        {loading ? (
          <div>Carregando...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          renderSection()
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
