import React, { useState } from 'react';

const EditarPerfil = ({ userData, onSave }) => {
  const [nome, setNome] = useState(userData.user.nome || '');
  const [email, setEmail] = useState(userData.user.email || '');
  const [foto, setFoto] = useState(null); // Armazena o arquivo de imagem
  const [previewFoto, setPreviewFoto] = useState(userData.user.foto || ''); // Pré-visualização
  const [message, setMessage] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();

      formData.append('nome', nome);
      formData.append('email', email);

      // Adiciona a foto apenas se o arquivo for selecionado
      if (foto) {
        formData.append('foto', foto);
      }

      const response = await fetch('http://localhost:8081/user/me/update', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData, // Envia formData com o arquivo de imagem
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFoto(file);

      // Gera uma pré-visualização da imagem
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewFoto(reader.result);
      };
      reader.readAsDataURL(file);
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
        <label className="block mb-1 font-bold">Foto:</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full p-2 border rounded"
        />
      </div>

      {previewFoto && (
        <div className="mb-4">
          <label className="block mb-1 font-bold">Pré-visualização:</label>
          <img src={previewFoto} alt="Pré-visualização" className="w-32 h-32 object-cover rounded" />
        </div>
      )}

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
