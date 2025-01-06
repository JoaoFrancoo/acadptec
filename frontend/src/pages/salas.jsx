import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const Salas = () => {
  const [salas, setSalas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

    const fetchSalas = async () => {
      try {
        const response = await api.get('/admin/salas', {
          headers: {
            'User-Level': decodedToken.nivel,
          },
        });
        setSalas(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Erro ao buscar salas:', error);
        setLoading(false);
      }
    };

    fetchSalas();
  }, [token]);

  if (loading) {
    return <div className="text-center text-xl mt-12">Carregando salas...</div>;
  }

  if (error) {
    return <div className="text-center text-xl text-red-600 mt-12">{error}</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">Salas</h1>
      <div className="flex flex-wrap -mx-2">
        {salas.map((sala) => (
          <div key={sala.id_sala} className="w-full px-2 mb-4">
            <div className="p-4 border border-gray-300 rounded-lg">
              <h2 className="text-2xl font-semibold">{sala.nome_sala}</h2>
              <p className="text-lg">Capacidade: {sala.capacidade}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Salas;
