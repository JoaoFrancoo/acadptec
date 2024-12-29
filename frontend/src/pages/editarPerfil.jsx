import React, { useState, useEffect } from 'react';

const EditarPerfil = ({ userData, organizadores = [], palestrantes = [], onSave }) => {
  const [nome, setNome] = useState(userData.user.nome || '');
  const [email, setEmail] = useState(userData.user.email || '');
  const [password, setPassword] = useState(''); // Campo para senha
  const [foto, setFoto] = useState(null); // Armazena o arquivo de imagem
  const [previewFoto, setPreviewFoto] = useState(userData.user.foto || ''); // Pré-visualização
  const [message, setMessage] = useState('');
  const [biografia, setBiografia] = useState(''); // Campo para biografia
  const [departamento, setDepartamento] = useState(''); // Campo para departamento
  const userId = userData.user.user_id; // Obtem o user_id do usuário

  // Verifica se o usuário atual é um organizador ou palestrante
  const isOrganizador = organizadores.some(org => org.user_id === userId);
  const isPalestrante = palestrantes.some(pal => pal.id_cliente === userId);

  useEffect(() => {
    // Se for organizador, seta o departamento atual
    if (isOrganizador) {
      console.log("Usuário é um organizador.");
      const organizador = organizadores.find(org => org.user_id === userId);
      setDepartamento(organizador ? organizador.departamento : '');
    } else {
      console.log("Usuário não é um organizador.");
    }

    // Se for palestrante, seta a biografia atual
    if (isPalestrante) {
      console.log("Usuário é um palestrante.");
      const palestrante = palestrantes.find(pal => pal.id_cliente === userId);
      setBiografia(palestrante ? palestrante.biografia : '');
    } else {
      console.log("Usuário não é um palestrante.");
    }
  }, [isOrganizador, isPalestrante, userId, organizadores, palestrantes]);

  const handleSave = async (e) => {
    e.preventDefault();
    console.log("Salvando perfil...");

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();

      formData.append('user_id', userId);
      formData.append('nome', nome);
      formData.append('email', email);
      if (password) {
        formData.append('password', password);
      }
      if (foto) {
        formData.append('foto', foto);
      }
      if (isOrganizador) {
        formData.append('departamento', departamento);
      }
      if (isPalestrante) {
        formData.append('biografia', biografia);
      }

      console.log("Dados enviados:", {
        user_id: userId, nome, email, password, foto, departamento, biografia
      });

      const response = await fetch('http://localhost:8081/user/me/update', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData, // Envia formData com o arquivo de imagem e outros campos
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao atualizar perfil.');
      }

      const data = await response.json();
      console.log("Resposta do servidor:", data);

      setMessage(data.message);
      onSave();
    } catch (error) {
      console.error("Erro ao salvar perfil:", error);
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
        <label className="block mb-1 font-bold">Senha:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded"
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

      {isOrganizador && (
        <div className="mb-4">
          <label className="block mb-1 font-bold">Departamento:</label>
          <input
            type="text"
            value={departamento}
            onChange={(e) => setDepartamento(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
      )}

      {isPalestrante && (
        <div className="mb-4">
          <label className="block mb-1 font-bold">Biografia:</label>
          <textarea
            value={biografia}
            onChange={(e) => setBiografia(e.target.value)}
            className="w-full p-2 border rounded"
          />
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
