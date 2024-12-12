import React, { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode'; 
import useAuth from '../components/userAuth';
import EditarPerfil from './editarPerfil';

const PerfilUtilizador = () => {
  useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const token = localStorage.getItem('token');

  const fetchUserData = async () => {
    try {
      const response = await fetch('http://localhost:8081/user/me/details', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao buscar dados.');
      }

      const data = await response.json();
      setUserData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [token]);

  if (loading) return <p>Carregando...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="flex flex-col items-center p-6 bg-gray-100 min-h-screen">
      {editMode ? (
        <EditarPerfil userData={userData} onSave={() => { setEditMode(false); fetchUserData(); }} />
      ) : (
        <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md">
          <h1 className="text-3xl font-bold text-blue-600 leading-tight text-center">Perfil do Utilizador</h1>
          <div className="text-center mb-4">
            <img
              src={userData.user.foto || '/default-profile.png'}
              alt="Foto do Utilizador"
              className="w-24 h-24 rounded-full object-cover mx-auto"
            />
          </div>
          <div className="mb-4">
            <p><strong>Nome:</strong> {userData.user.nome}</p>
            <p><strong>Email:</strong> {userData.user.email}</p>
          </div>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 mt-4"
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
