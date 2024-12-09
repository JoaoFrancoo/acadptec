import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {jwtDecode } from 'jwt-decode';
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
        {Object.keys(item).map((key) => (
          <td key={key}>
            <input
              type="text"
              value={item[key] || ''}
              onChange={(e) =>
                handleEdit(item[idField], { [key]: e.target.value }, section)
              }
              className="border rounded p-1 w-full"
            />
          </td>
        ))}
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
                Object.keys(sectionData[0]).map((key) => (
                  <th key={key} className="px-4 py-2 border">
                    {key}
                  </th>
                ))}
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
