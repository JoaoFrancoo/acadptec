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
      setError('Erro ao carregar os dados');
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

    // Atualizar o item com o valor alterado
    const updatedItem = { ...item, [name]: value };

    // Atualizar o estado correspondente
    switch (section) {
      case 'eventos':
        setEventos((prevEventos) =>
          prevEventos.map((evento) =>
            evento.id_evento === item.id_evento ? updatedItem : evento
          )
        );
        break;
      case 'clientes':
        setClientes((prevClientes) =>
          prevClientes.map((cliente) =>
            cliente.user_id === item.user_id ? updatedItem : cliente
          )
        );
        break;
      case 'categorias':
        setCategorias((prevCategorias) =>
          prevCategorias.map((categoria) =>
            categoria.id_categoria === item.id_categoria ? updatedItem : categoria
          )
        );
        break;
      case 'salas':
        setSalas((prevSalas) =>
          prevSalas.map((sala) =>
            sala.id_sala === item.id_sala ? updatedItem : sala
          )
        );
        break;
      case 'organizadores':
        setOrganizadores((prevOrganizadores) =>
          prevOrganizadores.map((organizador) =>
            organizador.id_organizador === item.id_organizador ? updatedItem : organizador
          )
        );
        break;
      default:
        break;
    }
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

          if (section === 'eventos') {
            if (key === 'categoria_nome') {
              return (
                <td key={key}>
                  <select
                    name="id_categoria"
                    value={item.id_categoria || ''}
                    onChange={(e) => {
                      const categoriaId = parseInt(e.target.value, 10);  // Converta para número
                      const categoria = categorias.find(
                        (categoria) => categoria.id_categoria === categoriaId
                      );
                      const updatedItem = {
                        ...item,
                        id_categoria: categoriaId,  // Armazene o ID numérico
                        categoria_nome: categoria ? categoria.descricao : item.categoria_nome,
                      };
                      handleInputChange(e, updatedItem, section);
                    }}
                    className="border rounded p-1 w-full"
                  >
                    <option value={item.id_categoria || ''}>
                      {item.categoria_nome || 'Selecione...'}
                    </option>
                    {categorias.map((categoria) => (
                      <option key={categoria.id_categoria} value={categoria.id_categoria}>
                        {categoria.descricao}
                      </option>
                    ))}
                  </select>
                </td>
              );
            }

            if (key === 'sala_nome') {
              return (
                <td key={key}>
                  <select
                    name="id_sala"
                    value={item.id_sala || ''}
                    onChange={(e) => {
                      const sala = salas.find((sala) => sala.id_sala === e.target.value);
                      const updatedItem = {
                        ...item,
                        id_sala: e.target.value,
                        sala_nome: sala ? sala.nome_sala : item.sala_nome,
                      };
                      handleInputChange(e, updatedItem, section);
                    }}
                    className="border rounded p-1 w-full"
                  >
                    <option value={item.id_sala || ''}>
                      {item.sala_nome || 'Selecione...'}
                    </option>
                    {salas.map((sala) => (
                      <option key={sala.id_sala} value={sala.id_sala}>
                        {sala.nome_sala}
                      </option>
                    ))}
                  </select>
                </td>
              );
            }

            if (key === 'organizador_nome') {
              return (
                <td key={key}>
                  <select
                    name="id_organizador"
                    value={item.id_organizador || ''}
                    onChange={(e) => {
                      const organizador = organizadores.find(
                        (organizador) => organizador.id_organizador === e.target.value
                      );
                      const updatedItem = {
                        ...item,
                        id_organizador: e.target.value,
                        organizador_nome: organizador ? organizador.nome : item.organizador_nome,
                      };
                      handleInputChange(e, updatedItem, section);
                    }}
                    className="border rounded p-1 w-full"
                  >
                    <option value={item.id_organizador || ''}>
                      {item.organizador_nome || 'Selecione...'}
                    </option>
                    {organizadores.map((organizador) => (
                      <option key={organizador.id_organizador} value={organizador.id_organizador}>
                        {organizador.nome}
                      </option>
                    ))}
                  </select>
                </td>
              );
            }
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

    const data = dataMap[selectedSection];

    return (
      <table className="min-w-full border-collapse">
        <thead>
          <tr>
            {Object.keys(data[0] || {}).map((key) => (
              <th key={key} className="border p-2 text-left">
                {key}
              </th>
            ))}
            <th className="border p-2 text-left">Ações</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => renderEditableRow(item, selectedSection))}
        </tbody>
      </table>
    );
  };

  if (loading) return <div>Carregando...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h1>Dashboard Admin</h1>
      <div className="my-4">
        <select
          onChange={(e) => setSelectedSection(e.target.value)}
          className="border rounded p-1"
        >
          <option value="clientes">Clientes</option>
          <option value="eventos">Eventos</option>
          <option value="palestrantes">Palestrantes</option>
          <option value="categorias">Categorias</option>
          <option value="salas">Salas</option>
          <option value="organizadores">Organizadores</option>
        </select>
      </div>
      {renderSection()}
    </div>
  );
}

export default AdminDashboard;
