import React, { useState } from 'react';

const EditarPerfil = ({ userData, onSave }) => {
  const [nome, setNome] = useState(userData.user.nome || '');
  const [email, setEmail] = useState(userData.user.email || '');
  const [foto, setFoto] = useState(userData.user.foto || '');
  const [message, setMessage] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8081/user/me/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nome, email, foto }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao atualizar perfil.');
      }

      const data = await response.json();
      setMessage(data.message);
      onSave();
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <form onSubmit={handleSave} className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md">
      <h2 className="text-2xl font-semibold mb-4">Editar Perfil</h2>
      {message && <p className="text-green-500">{message}</p>}
      <div className="mb-4">
        <label className="block mb-1 font-bold">Nome:</label>
        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-bold">Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-bold">URL da Foto:</label>
        <input
          type="text"
          value={foto}
          onChange={(e) => setFoto(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>
      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Salvar
      </button>
    </form>
  );
};

export default EditarPerfil;
