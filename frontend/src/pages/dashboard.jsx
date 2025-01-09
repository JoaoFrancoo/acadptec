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
  const [clientesOrganizadores, setClientesOrganizadores] = useState([]);
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
        clientesOrganizadoresRes,
      ] = await Promise.all([
        api.get('admin/clientes'),
        api.get('admin/eventos'),
        api.get('admin/palestrantes'),
        api.get('admin/categorias'),
        api.get('admin/salas'),
        api.get('admin/organizadores'),
        api.get('admin/clientesOrganizadores'),
      ]);

      setClientes(clientesRes.data);
      setEventos(eventosRes.data);
      setPalestrantes(palestrantesRes.data);
      setCategorias(categoriasRes.data);
      setSalas(salasRes.data);
      setOrganizadores(organizadoresRes.data);
      setClientesOrganizadores(clientesOrganizadoresRes.data);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar os dados');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e, item, section) => {
    const { name, value } = e.target;
    const updatedItem = { ...item, [name]: value };

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
      case 'palestrantes':
        setPalestrantes((prev) =>
          prev.map((palestrante) =>
            palestrante.user_id === item.user_id ? updatedItem : palestrante
          )
        );
        break;
      default:
        break;
    }
  };

  const handleAddSection = (section) => {
    let route = '';
    switch (section) {
      case 'clientes':
        route = '/register';
        break;
      case 'eventos':
        route = '/criarEventos';
        break;
      case 'categorias':
        route = '/criarCategoria';
        break;
      case 'salas':
        route = '/criarSala ';
        break;
      case 'organizadores':
        route = '/dashboard';
        break;
      case 'palestrantes':
        route = '/dashboard';
        break;
      default:
        route = '/';
        break;
    }
    navigate(route);
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
        : section === 'palestrantes'
        ? 'user_id'
        : 'id';
  
    const handleToggleVisibility = async (item) => {
      try {
        let data = {};
        const isDesativar = item.nivel >= 1 || item.visivel === 1;
  
        if (item.nivel !== undefined) {
          data = { nivel: isDesativar ? 0 : 1 };
        } else {
          data = { visivel: isDesativar ? 0 : 1 };
        }
  
        await api.put(`admin/${section}/${item[idField]}`, data, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        alert(isDesativar ? 'Item desativado com sucesso!' : 'Item ativado com sucesso!');
        fetchData();
      } catch (err) {
        console.error('Erro ao alternar visibilidade do item:', err);
        alert('Erro ao alternar visibilidade do item. Por favor, tente novamente.');
      }
    };
  
    const handleEdit = async (item) => {
      console.log('Dados antes de editar:', item);
      await api.put(`admin/${section}/${item[idField]}`, item, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      alert('Edição feita com sucesso!');
      fetchData();
    };
  
    return (
      <tr key={item[idField]}>
        {Object.keys(item).map((key) => {
          if (key.includes('id') && section !== 'palestrantes') return null;
          if (key === 'visivel') return null;
          if (key === 'data_inicio' || key === 'data_fim') {
            return (
              <td key={`${key}-${item[idField]}`}>
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
  
          if (section === 'eventos' && key === 'categoria_nome') {
            return (
              <td key={`categoria-${item[idField]}`}>
                <select
                  name="id_categoria"
                  value={item.id_categoria || ''}
                  onChange={(e) => {
                    const categoriaId = parseInt(e.target.value, 10);
                    const categoria = categorias.find((cat) => cat.id_categoria === categoriaId);
                    const updatedItem = {
                      ...item,
                      id_categoria: categoriaId,
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
                <input type="hidden" name="id_categoria" value={item.id_categoria || ''} className="hidden" />
              </td>
            );
          }
  
          if (section === 'eventos' && key === 'sala_nome') {
            return (
              <td key={`sala-${item[idField]}`}>
                <select
                  name="id_sala"
                  value={item.id_sala || ''}
                  onChange={(e) => {
                    const salaId = parseInt(e.target.value, 10);
                    const sala = salas.find((s) => s.id_sala === salaId);
                    const updatedItem = {
                      ...item,
                      id_sala: salaId,
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
                <input type="hidden" name="id_sala" value={item.id_sala || ''} className="hidden" />
              </td>
            );
          }
  
          if (section === 'eventos' && key === 'organizador_nome') {
            return (
              <td key={`organizador-${item[idField]}`}>
                <select
                  name="id_organizador"
                  value={item.id_organizador || ''}
                  onChange={(e) => {
                    const organizadorId = parseInt(e.target.value, 10);
                    const organizador = clientesOrganizadores.find((o) => o.user_id === organizadorId);
                    const updatedItem = {
                      ...item,
                      id_organizador: organizadorId,
                      organizador_nome: organizador ? organizador.nome : item.organizador_nome,
                    };
                    handleInputChange(e, updatedItem, section);
                  }}
                  className="border rounded p-1 w-full"
                >
                  <option value={item.id_organizador || ''}>
                    {item.organizador_nome || 'Selecione...'}
                  </option>
                  {clientesOrganizadores.map((organizador) => (
                    <option key={organizador.user_id} value={organizador.user_id}>
                      {organizador.nome}
                    </option>
                  ))}
                </select>
                <input type="hidden" name="id_organizador" value={item.id_organizador || ''} className="hidden" />
              </td>
            );
          }
  
          return (
            <td key={`${key}-${item[idField]}`}>
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
            onClick={() => handleEdit(item)}
            className="px-4 py-2 bg-slate-400 text-white rounded shadow hover:bg-blue-300"
          >
            Salvar
          </button>
          <button
            onClick={() => handleToggleVisibility(item)}
            className={`ml-2 px-4 py-2 ${
              item.nivel >= 1 || item.visivel === 1
                ? 'bg-red-500 hover:bg-red-700'
                : 'bg-green-500 hover:bg-green-700'
            } text-white rounded shadow`}
          >
            {item.nivel >= 1 || item.visivel === 1
              ? 'Desativar'
              : 'Ativar'}
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
      <div>
        <div className="mb-4">
          <button
            onClick={() => handleAddSection(selectedSection)}
            className="px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-700"
          >
            Adicionar {selectedSection.charAt(0).toUpperCase() + selectedSection.slice(1)}
          </button>
        </div>
  
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              {Object.keys(data[0] || {})
                .filter((key) => !(selectedSection === 'palestrantes' && key === 'user_id'))
                .filter((key) => !(selectedSection === 'clientes' && key === 'user_id'))
                .filter((key) => !(selectedSection === 'eventos' && key === 'id_evento'))
                .filter((key) => !(selectedSection === 'categorias' && key === 'id_categoria'))
                .filter((key) => !(selectedSection === 'salas' && (key === 'id_sala' || key === 'capacidade')))
                .filter((key) => !(selectedSection === 'organizadores' && (key === 'id_organizador' || key === 'user_id')))
                .map((key) => {
                  if (selectedSection === 'palestrantes' && key === 'id_cliente') {
                    return (
                      <th key={key} className="border p-2 text-left">
                        Nome
                      </th>
                    );
                  }
                  return (
                    <th key={key} className="border p-2 text-left">
                      {key}
                    </th>
                  );
                })}
              <th className="border p-2 text-left">Ações</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => renderEditableRow(item, selectedSection))}
          </tbody>
        </table>
      </div>
    );
  };
  
 
  if (loading) return <div>Carregando...</div>;
  if (error) return <div>{error}</div>;
 
  return (
    <div className="flex">
      {/* Barra Lateral */}
      <div className="relative group bg-slate-500 text-white h-screen w-16 p-4 overflow-hidden transition-width duration-300 ease-in-out hover:w-64">
        <h2 className="text-xl font-bold mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out">
          Admin Dashboard
        </h2>
        <ul className="space-y-4 mt-8">
          {['clientes', 'eventos', 'palestrantes', 'categorias', 'salas', 'organizadores'].map((section) => (
            <li key={section}>
              <button
                onClick={() => setSelectedSection(section)}
                className="w-full text-left py-2 px-4 hover:bg-gray-600 rounded transition-all duration-300 ease-in-out">
                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out">
                  {section.charAt(0).toUpperCase() + section.slice(1)}
                </span>
              </button>
            </li>
          ))}
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