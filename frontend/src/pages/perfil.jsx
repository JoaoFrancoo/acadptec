import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'; // Importe o componente Link
import axios from 'axios'; 
import useAuth from '../components/userAuth';
import EditarPerfil from './editarPerfil';

const PerfilUtilizador = () => {
  useAuth();
  const [userData, setUserData] = useState(null);
  const [organizadores, setOrganizadores] = useState([]);
  const [palestrantes, setPalestrantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const token = localStorage.getItem('token');

  const fetchUserData = async () => {
    try {
      const api = axios.create({
        baseURL: 'http://localhost:8081/',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const [userResponse, organizadoresResponse, palestrantesResponse] = await Promise.all([
        api.get('user/me/details'),
        api.get('admin/organizadores'),
        api.get('admin/palestrantes')
      ]);

      setUserData(userResponse.data);
      setOrganizadores(organizadoresResponse.data);
      setPalestrantes(palestrantesResponse.data);
    } catch (err) {
      setError('Erro ao carregar os dados.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [token]);

  if (loading) return <p>Carregando...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  const userId = userData.user.user_id;
  const isOrganizador = organizadores.some(org => org.user_id === userId);
  const isPalestrante = palestrantes.some(pal => pal.id_cliente === userId);

  const organizador = isOrganizador ? organizadores.find(org => org.user_id === userId) : null;
  const palestrante = isPalestrante ? palestrantes.find(pal => pal.id_cliente === userId) : null;

  return (
    <div className="flex flex-col items-center p-6 bg-gray-50 min-h-screen">
      {editMode ? (
        <EditarPerfil
          userData={userData}
          organizadores={organizadores}
          palestrantes={palestrantes}
          onSave={() => { setEditMode(false); fetchUserData(); }}
        />
      ) : (
        <div className="bg-white shadow-xl rounded-lg p-8 w-full max-w-lg">
          <h1 className="text-3xl font-bold text-blue-600 leading-tight text-center mb-6">Perfil do Utilizador</h1>
          <div className="text-center mb-6">
            <img
              src={userData.user.foto || '/default-profile.png'}
              alt="Foto do Utilizador"
              className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-blue-500"
            />
          </div>
          <div className="mb-6">
            <p className="text-lg"><strong>Nome:</strong> {userData.user.nome}</p>
            <p className="text-lg"><strong>Email:</strong> {userData.user.email}</p>
            {isOrganizador && <p className="text-lg"><strong>Departamento:</strong> {organizador.departamento}</p>}
            {isPalestrante && <p className="text-lg"><strong>Biografia:</strong> {palestrante.biografia}</p>}
          </div>
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-4">Inscrições</h2>
            {userData.inscricoes.length > 0 ? (
              <table className="min-w-full bg-white rounded-lg shadow-md">
                <thead className="bg-blue-100">
                  <tr>
                    <th className="py-2 px-4 text-left">Evento</th>
                    <th className="py-2 px-4 text-left">Quantidade</th>
                  </tr>
                </thead>
                <tbody>
                  {userData.inscricoes.map(inscricao => (
                    <tr key={inscricao.id_evento} className="border-b hover:bg-gray-100">
                      <td className="py-2 px-4">
                        <Link to={`/eventos/${inscricao.id_evento}`} className="text-blue-500 hover:underline">
                          {inscricao.nome_evento}
                        </Link>
                      </td>
                      <td className="py-2 px-4">{inscricao.quantidade}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-lg">Nenhuma inscrição encontrada.</p>
            )}
          </div>
          <button
            className="bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 mt-4 w-full transition-all"
            onClick={() => setEditMode(true)}
          >
            Editar Perfil
          </button>
        </div>
      )}
    </div>
  );
};

export default PerfilUtilizador;