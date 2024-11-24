import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const navigate = useNavigate(); // Inicializa o hook

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const response = await fetch('http://localhost:8081/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });
  
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        setSuccessMessage('Login realizado com sucesso!');
        setErrorMessage('');

        // Redireciona para a página de perfil
        setTimeout(() => {
          navigate(`/perfil/${data.user_id}`); // Exemplo: substitua com o ID do usuário, se disponível
        }, 1000); 

      } else {
        setErrorMessage(data.message);
        setSuccessMessage('');
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      setErrorMessage('Erro ao fazer login.');
      setSuccessMessage('');
    }
  };
  

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      {/* Lado Esquerdo */}
      <div className="flex-1 flex flex-col justify-center items-start p-12 bg-gray-100">
        <h1 className="text-4xl font-bold text-blue-600 leading-tight">
          A transformar Pensadores <br />  Eventos Acadêmicos
        </h1>
        <p className="mt-4 text-gray-600">Welcome back! Please login to your account.</p>
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

          <div className="flex items-center justify-between text-sm text-gray-600">
            <label>
              <input type="checkbox" className="mr-2" /> Remember Me
            </label>
            <a href="#" className="text-blue-500 hover:underline">
              Forgot Password?
            </a>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Login
          </button>

          <div className="text-center text-sm text-gray-600 mt-4">
            Or login with{" "}
            <a href="#" className="text-blue-500 hover:underline">
              Facebook
            </a>
            ,{" "}
            <a href="#" className="text-blue-500 hover:underline">
              LinkedIn
            </a>
            , or{" "}
            <a href="#" className="text-blue-500 hover:underline">
              Google
            </a>
          </div>
        </form>
      </div>

      {/* Lado Direito */}
      <div className="flex-1 bg-blue-50 flex items-center justify-center">
        <img
          src="/imagens/LogoAcadptec.png" // Substitua pelo caminho correto da sua imagem
          alt="Illustration"
          className="max-w-md"
        />
      </div>
    </div>
  );
};

export default Login;