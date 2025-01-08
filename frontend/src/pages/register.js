import React, { useState } from 'react';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    nome: '',
    password: ''
  });
  const [foto, setFoto] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

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

      setSuccessMessage(response.data.message || 'Registro realizado com sucesso!');
      setErrorMessage('');
      setFormData({ email: '', nome: '', password: '' });
      setFoto(null);
    } catch (error) {
      if (error.response) {
        setErrorMessage(error.response.data.message || 'Erro ao registrar. Verifique os dados fornecidos.');
      } else if (error.request) {
        setErrorMessage('Nenhuma resposta do servidor. Verifique sua conexão.');
      } else {
        setErrorMessage(`Erro desconhecido: ${error.message}`);
      }
      setSuccessMessage('');
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      {/* Lado Esquerdo */}
      <div className="flex-1 flex flex-col justify-center items-start p-12 bg-gray-100">
        <h1 className="text-4xl font-bold text-blue-600 leading-tight">
          Junte-se a nós <br /> e comece a jornada!
        </h1>
        <p className="mt-4 text-gray-600">Crie sua conta para explorar novos horizontes.</p>
        <form onSubmit={handleSubmit} className="w-full mt-6 max-w-sm space-y-4">
          {errorMessage && (
            <p className="text-red-500 text-center mb-4">{errorMessage}</p>
          )}
          {successMessage && (
            <p className="text-green-500 text-center mb-4">{successMessage}</p>
          )}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email Address
            </label>
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="nome"
              className="block text-sm font-medium text-gray-700"
            >
              Nome
            </label>
            <input
              type="text"
              name="nome"
              placeholder="Nome Completo"
              value={formData.nome}
              onChange={handleChange}
              required
              className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="foto"
              className="block text-sm font-medium text-gray-700"
            >
              Foto
            </label>
            <input
              type="file"
              name="foto"
              onChange={handleFotoChange}
              required
              className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Registar
          </button>
        </form>
      </div>

      {/* Lado Direito */}
      <div className="flex-1 bg-gray-100 flex items-center justify-center">
        <img
          src="/imagens/LogoAcadptec.png" // Substitua pelo caminho correto da sua imagem
          alt="Illustration"
          className="max-w-md"
        />
      </div>
    </div>
  );
};

export default Register;
