import React, { useState } from 'react';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    nome: '',
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
      // Enviar dados para a API de registro
      const response = await axios.post('http://localhost:8081/register', formData);
      console.log('Resposta do servidor:', response); // Verifique a resposta completa

      alert(response.data.message); // Exibe a mensagem retornada pela API
      setFormData({ email: '', nome: '', password: '' }); // Limpar o formulário após o registro bem-sucedido
    } catch (error) {
      if (error.response) {
        // Erro relacionado à resposta do servidor
        console.error('Erro do servidor:', error.response.data);
        alert(`Erro: ${error.response.data.message || 'Erro ao registrar. Verifique os dados fornecidos.'}`);
      } else if (error.request) {
        // Sem resposta do servidor
        console.error('Nenhuma resposta recebida:', error.request);
        alert('Erro: Nenhuma resposta do servidor. Verifique sua conexão.');
      } else {
        // Outro erro (problemas com o código, por exemplo)
        console.error('Erro desconhecido:', error.message);
        alert(`Erro desconhecido: ${error.message}`);
      }
    }
  };

  return (
    <div>
      <h2>Cadastro</h2>
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
          type="text" 
          name="nome" 
          placeholder="Nome" 
          value={formData.nome} 
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
        <button type="submit">Cadastrar</button>
      </form>
    </div>
  );
};

export default Register;
