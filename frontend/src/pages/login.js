import React, { useState } from 'react';
import axios from 'axios';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

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
      const response = await axios.post('http://localhost:5000/api/auth/login', formData); // Substitua a URL pelo seu endpoint
      const { token } = response.data;
      
      // Armazenar o token JWT no localStorage
      localStorage.setItem('token', token);
      
      alert('Login bem-sucedido!');
      setFormData({ email: '', password: '' }); // Limpa o formulário após o login
    } catch (error) {
      console.error(error.response.data.message);
      alert('Erro ao fazer login. Verifique suas credenciais.');
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input 
          type="email" 
          name="email" 
          placeholder="Email" 
          value={formData.email} 
          onChange={handleChange} 
          required 
        />
        <input 
          type="password" 
          name="password" 
          placeholder="Senha" 
          value={formData.password} 
          onChange={handleChange} 
          required 
        />
        <button type="submit">Entrar</button>
      </form>
    </div>
  );
};

export default Login;
