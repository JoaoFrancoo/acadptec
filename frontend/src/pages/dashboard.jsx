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
    const allowedFields = ['user_id', 'nome', 'email', 'status'];
    const sanitizedData = Object.keys(updatedData)
      .filter((key) => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = updatedData[key];
        return obj;
      }, {});
  
    try {
      await api.put(`admin/${section}/${id}`, sanitizedData);
      fetchData();
    } catch (err) {
      console.error(err);
      setError('Erro ao salvar as alterações.');
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

    return (
      <tr key={item[idField]}>
        {Object.keys(item).map((key) => {
          if (key.includes('id') && section !== 'palestrantes') return null;
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
                      const categoriaId = parseInt(e.target.value, 10); 
                      const categoria = categorias.find(
                        (categoria) => categoria.id_categoria === categoriaId
                      );
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

         if (section === 'palestrantes' && key === 'id_cliente') {
           return (
             <td key={key}>
               <select
                 name="user_id"
                 value={item.user_id || ''}
                 onChange={(e) => {
                  const cliente = clientes.find(
                    (cliente) => cliente.user_id === parseInt(e.target.value, 10)
                  );
                  const updatedItem = {
                    ...item,
                    user_id: parseInt(e.target.value, 10),
                    nome: cliente ? cliente.nome : item.nome,
                  };
                  handleInputChange(e, updatedItem, section);
                }}
                
                
                 className="border rounded p-1 w-full"
               >
                 <option value={item.user_id || ''}>
                   {item.nome || 'Selecione...'}
                 </option>
                 {clientes
                   .filter((cliente) => cliente.nivel === 2)
                   .map((cliente) => (
                     <option key={cliente.user_id} value={cliente.user_id}>
                       {cliente.nome}
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
           className="px-4 py-2 bg-slate-400 text-white rounded shadow hover:bg-blue-300"
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
