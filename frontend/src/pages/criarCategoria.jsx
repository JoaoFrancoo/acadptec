import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const CriarCategoria = () => {
  const [descricao, setDescricao] = useState('');
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');
  const api = axios.create({
    baseURL: 'http://localhost:8081/',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  useEffect(() => {
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        console.log('Dados decodificados do token JWT:', decodedToken);
        setUserId(decodedToken.userId);

        if (decodedToken.nivel < 3) {
          setError('Acesso negado. Permissão insuficiente.');
          setLoading(false);
          return;
        }

        setLoading(false);
      } catch (error) {
        console.error('Erro ao decodificar o token JWT:', error);
        setLoading(false);
      }
    }
  }, [token]);

  const handleInputChange = (e) => {
    setDescricao(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Dados do formulário a serem enviados:', { descricao, userId });
    console.log('Token JWT enviado:', token);

    api.post('/admin/add-category', { descricao }, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then((res) => {
        alert(res.data.message);
      })
      .catch((err) => {
        console.error('Erro ao adicionar categoria:', err);
      });
  };

  if (loading) {
    return <div className="text-center text-xl mt-12">Carregando...</div>;
  }

  if (error) {
    return <div className="text-center text-xl text-red-600 mt-12">{error}</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">Adicionar Nova Categoria</h1>
      <form onSubmit={handleSubmit} className="flex flex-wrap -mx-2">
        <div className="flex-grow px-2 mb-4 min-w-min">
          <label htmlFor="descricao" className="block text-lg font-medium text-gray-700 mb-2">Descrição:</label>
          <input
            type="text"
            name="descricao"
            id="descricao"
            value={descricao}
            onChange={handleInputChange}
            required
            className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="w-full px-2 mt-6 text-center">
          <button
            type="submit"
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Adicionar Categoria
          </button>
        </div>
      </form>
    </div>
  );
};

export default CriarCategoria;
