import React, { useState } from 'react';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    nome: '',
    password: ''
  });
  const [foto, setFoto] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFotoChange = (e) => {
    setFoto(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append('email', formData.email);
    data.append('nome', formData.nome);
    data.append('password', formData.password);
    data.append('foto', foto);

    try {
      const response = await axios.post('http://localhost:8081/register', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Resposta do servidor:', response);

      alert(response.data.message);
      setFormData({ email: '', nome: '', password: '' });
      setFoto(null);
    } catch (error) {
      if (error.response) {
        console.error('Erro do servidor:', error.response.data);
        alert(`Erro: ${error.response.data.message || 'Erro ao registrar. Verifique os dados fornecidos.'}`);
      } else if (error.request) {
        console.error('Nenhuma resposta recebida:', error.request);
        alert('Erro: Nenhuma resposta do servidor. Verifique sua conexão.');
      } else {
        console.error('Erro desconhecido:', error.message);
        alert(`Erro desconhecido: ${error.message}`);
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-center text-gray-800">Cadastro</h2>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-md"
          />
          <input
            type="text"
            name="nome"
            placeholder="Nome"
            value={formData.nome}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-md"
          />
          <input
            type="password"
            name="password"
            placeholder="palavra-passe"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-md"
          />
          <input
            type="file"
            name="foto"
            value={formData.foto}
            onChange={handleFotoChange}
            required
            className="w-full px-3 py-2 border rounded-md"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Cadastrar
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
