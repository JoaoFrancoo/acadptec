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
  const [selectedSection, setSelectedSection] = useState('clientes');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const api = axios.create({
    baseURL: 'http://localhost:8081/',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  useEffect(() => {
    if (!token) {
      setError('Token não encontrado.');
      setLoading(false);
      return;
    }

    const decodedToken = jwtDecode(token);
    if (decodedToken.nivel < 4) {
      setError('Acesso negado. Permissão insuficiente.');
      setLoading(false);
      return;
    }

    fetchData();
  }, [token]);

  const fetchData = async () => {
    try {
      const [
        clientesRes,
        eventosRes,
        palestrantesRes,
        categoriasRes,
        salasRes,
        organizadoresRes,
      ] = await Promise.all([
        api.get('admin/clientes'),
        api.get('admin/eventos'),
        api.get('admin/palestrantes'),
        api.get('admin/categorias'),
        api.get('admin/salas'),
        api.get('admin/organizadores'),
      ]);

      setClientes(clientesRes.data);
      setEventos(eventosRes.data);
      setPalestrantes(palestrantesRes.data);
      setCategorias(categoriasRes.data);
      setSalas(salasRes.data);
      setOrganizadores(organizadoresRes.data);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar os dados.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id, updatedData, section) => {
    if (!id) {
      setError('ID inválido.');
      return;
    }
    try {
      await api.put(`admin/${section}/${id}`, updatedData);
      fetchData();
    } catch (err) {
      setError('Erro ao salvar as alterações.');
    }
  };

  const handleInputChange = (e, item, section) => {
    const { name, value } = e.target;
    const updatedItem = { ...item, [name]: value };
    setEventos((prevEventos) =>
      prevEventos.map((evento) =>
        evento.id_evento === item.id_evento ? updatedItem : evento
      )
    );
  };

  const formatDate = (date) => {
    if (!date) return '';
    const newDate = new Date(date);
    return newDate.toISOString().slice(0, 16);
  };

  const renderEditableRow = (item, section) => {
    const idField =
      section === 'clientes'
        ? 'user_id'
        : section === 'eventos'
        ? 'id_evento'
        : section === 'categorias'
        ? 'id_categoria'
        : section === 'salas'
        ? 'id_sala'
        : section === 'organizadores'
        ? 'id_organizador'
        : 'id';

    return (
      <tr key={item[idField]}>
        {Object.keys(item).map((key) => {
          if (key.includes('id')) return null;
          if (key === 'data_inicio' || key === 'data_fim') {
            return (
              <td key={key}>
                <input
                  type="datetime-local"
                  name={key}
                  value={formatDate(item[key])}
                  onChange={(e) => handleInputChange(e, item, section)}
                  className="border rounded p-1 w-full"
                />
              </td>
            );
          }

          if (section === 'eventos' && (key === 'categoria_nome' || key === 'sala_nome' || key === 'organizador_nome')) {
            let options = [];
            let selectedValue = item[key] || '';

            if (key === 'categoria_nome') {
              options = categorias;
            } else if (key === 'sala_nome') {
              options = salas;
            } else if (key === 'organizador_nome') {
              options = organizadores;
            }

            return (
              <td key={key}>
                <select
                  name={key}
                  value={item[key] || ''}
                  onChange={(e) => handleInputChange(e, item, section)}
                  className="border rounded p-1 w-full"
                >
                  <option value="">Selecione...</option>
                  {options.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.nome || option.descricao}
                    </option>
                  ))}
                </select>
              </td>
            );
          }

          return (
            <td key={key}>
              <input
                type="text"
                name={key}
                value={item[key] || ''}
                onChange={(e) => handleInputChange(e, item, section)}
                className="border rounded p-1 w-full"
              />
            </td>
          );
        })}
        <td>
          <button
            onClick={() => handleEdit(item[idField], item, section)}
            className="px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-700"
          >
            Salvar
          </button>
        </td>
      </tr>
    );
  };

  const renderSection = () => {
    const dataMap = {
      clientes,
      eventos,
      palestrantes,
      categorias,
      salas,
      organizadores,
    };
    const sectionData = dataMap[selectedSection] || [];
    return (
      <div>
        <h2 className="text-2xl font-bold mb-4 capitalize">{selectedSection}</h2>
        <table className="table-auto w-full text-left bg-white shadow rounded-md">
          <thead>
            <tr className="bg-gray-200">
              {sectionData.length > 0 &&
                Object.keys(sectionData[0]).map((key) => {

                  if (key.includes('id')) return null;
                  if(key.includes('password')) return null;

                  return (
                    <th key={key} className="px-4 py-2 border">
                      {key.replace('_', ' ').toUpperCase()}
                    </th>
                  );
                })}
              <th className="px-4 py-2 border">Ações</th>
            </tr>
          </thead>
          <tbody>
            {sectionData.map((item) => renderEditableRow(item, selectedSection))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="flex">
      <div className="w-1/4 bg-gray-800 text-white h-screen p-4">
        <h2 className="text-xl font-bold mb-4">Admin Dashboard</h2>
        <ul>
          {['clientes', 'eventos', 'palestrantes', 'categorias', 'salas', 'organizadores'].map(
            (section) => (
              <li key={section}>
                <button
                  onClick={() => setSelectedSection(section)}
                  className="w-full text-left py-2 px-4 hover:bg-gray-600 rounded"
                >
                  {section.charAt(0).toUpperCase() + section.slice(1)}
                </button>
              </li>
            )
          )}
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
