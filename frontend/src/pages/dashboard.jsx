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
        api.get('admin/clientesOrganizadores')
      ]);

      setClientes(clientesRes.data);
      setEventos(eventosRes.data);
      setPalestrantes(palestrantesRes.data);
      setCategorias(categoriasRes.data);
      setSalas(salasRes.data);
      setOrganizadores(organizadoresRes.data);
      setClientesOrganizadores(clientesOrganizadoresRes.data);
      console.log(organizadoresRes.data); // Verifique os dados dos organizadores no console
      setError(null);
    } catch (err) {
      console.error('Erro ao carregar os dados:', err);
      setError('Erro ao carregar os dados');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id, updatedData, section) => {
    try {
      await api.put(`admin/${section}/${id}`, updatedData);
      fetchData();
    } catch (err) {
      console.error('Erro ao salvar as alterações:', err);
      setError('Erro ao salvar as alterações.');
    }
  };

  const handleInputChange = (e, item, section) => {
    const { name, value } = e.target;
    const updatedItem = { ...item, [name]: value };
  
    switch (section) {
      case 'clientes':
        setClientes((prevClientes) =>
          prevClientes.map((cliente) =>
            cliente.user_id === item.user_id ? updatedItem : cliente
          )
        );
        break;
      case 'eventos':
        setEventos((prevEventos) =>
          prevEventos.map((evento) =>
            evento.id_evento === item.id_evento ? updatedItem : evento
          )
        );
        break;
      case 'palestrantes':
        setPalestrantes((prevPalestrantes) =>
          prevPalestrantes.map((palestrante) =>
            palestrante.user_id === item.user_id ? updatedItem : palestrante
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
  
  // Modificando o campo "id_organizador" e "user_id" no renderEditableRow
  
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
  
    return (
      <tr key={item[idField]}>
        {Object.keys(item).map((key) => {
          if (section === 'palestrantes' && (key === 'user_id' || key === 'nome')) return null;
          if (key.includes('id') && section !== 'palestrantes' && section !== 'organizadores') return null;
  
          if (section === 'organizadores' && key === 'id_organizador') {
            return (
              <td key={key}>
                {/* O id_organizador (PK) não é editável */}
                <input
                  type="text"
                  name={key}
                  value={item[key]}
                  readOnly
                  className="border rounded p-1 w-full"
                />
              </td>
            );
          }
  
          if (section === 'organizadores' && key === 'user_id') {
            return (
              <td key={key}>
                <select
                  name="user_id"
                  value={item.user_id || ''}
                  onChange={(e) => {
                    const userId = parseInt(e.target.value, 10);
                    const user = clientes.find(
                      (cliente) => cliente.user_id === userId
                    );
                    const updatedItem = {
                      ...item,
                      user_id: userId,
                      nome: user ? user.nome : item.nome,
                      // O departamento não deve ser alterado, mantendo o valor atual
                      id_departamento: item.id_departamento,
                    };
                    handleInputChange(e, updatedItem, section);
                  }}
                  className="border rounded p-1 w-full"
                >
                  <option value="">Selecione...</option>
                  {clientes
                  .filter((cliente) => cliente.nivel === 3)
                  .map((cliente) => (
                    <option key={cliente.user_id} value={cliente.user_id}>
                      {cliente.nome}
                    </option>
                  ))}
                </select>
              </td>
            );
          }
  
          if (section === 'organizadores' && key === 'id_departamento') {
            return (
              <td key={key}>
                {/* O id_departamento não deve ser alterado, então ele é apenas exibido */}
                <input
                  type="text"
                  name={key}
                  value={item[key]}
                  readOnly
                  className="border rounded p-1 w-full"
                />
              </td>
            );
          }
  
          // Renderizar os campos normalmente para outras seções
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
            className="px-4 py-2 bg-slate-400 text-white rounded shadow hover:bg-blue-300"
          >
            Salvar
          </button>
        </td>
      </tr>
    );
  };
  

  return (
    <div>
      {loading ? (
        <p>Carregando...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <div>
          <h1>Painel Administrativo</h1>
          <select onChange={(e) => setSelectedSection(e.target.value)} value={selectedSection}>
            <option value="clientes">Clientes</option>
            <option value="eventos">Eventos</option>
            <option value="palestrantes">Palestrantes</option>
            <option value="categorias">Categorias</option>
            <option value="salas">Salas</option>
            <option value="organizadores">Organizadores</option>
          </select>
          <table>
            <thead>
              <tr>
                {Object.keys(
                  selectedSection === 'clientes' ? clientes[0] || {} :
                  selectedSection === 'eventos' ? eventos[0] || {} :
                  selectedSection === 'palestrantes' ? palestrantes[0] || {} :
                  selectedSection === 'categorias' ? categorias[0] || {} :
                  selectedSection === 'salas' ? salas[0] || {} :
                  selectedSection === 'organizadores' ? organizadores[0] || {} : {}
                ).map((key) => (
                  <th key={key}>{key}</th>
                ))}
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {(selectedSection === 'clientes' ? clientes :
                selectedSection === 'eventos' ? eventos :
                selectedSection === 'palestrantes' ? palestrantes :
                selectedSection === 'categorias' ? categorias :
                selectedSection === 'salas' ? salas :
                selectedSection === 'organizadores' ? organizadores : []
              ).map((item) => renderEditableRow(item, selectedSection))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;