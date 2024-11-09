import React, { useState, useEffect } from 'react';

const EditarPerfil = () => {
  const [nomeUtilizador, setNomeUtilizador] = useState('');
  const [novaPasse, setNovaPasse] = useState('');
  const [foto, setFoto] = useState(null);
  const [mensagem, setMensagem] = useState('');
  const [fotoAtual, setFotoAtual] = useState('');
  
  const userId = 2;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`/user/${userId}`); 
        const data = await response.json();
        setNomeUtilizador(data.nome);
        setFotoAtual(`/uploads/${data.foto}`);
      } catch (error) {
        console.error('Erro ao buscar dados do utilizador:', error);
      }
    };

    fetchUserData();
  }, [userId]);

  const handleFotoChange = (e) => {
    setFoto(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('nome', nomeUtilizador); 
    formData.append('password', novaPasse);  
    if (foto) formData.append('foto', foto); 

    try {
      const response = await fetch(`/user/${userId}`, {
        method: 'PUT',
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        setMensagem('Perfil atualizado com sucesso!');
        if (foto) setFotoAtual(URL.createObjectURL(foto)); 
      } else {
        setMensagem('Erro ao atualizar perfil.');
      }
    } catch (error) {
      console.error('Erro ao atualizar o perfil:', error);
      setMensagem('Erro ao atualizar perfil.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">Editar Perfil</h1>
        {fotoAtual && (
          <div className="flex justify-center mb-4">
            <img src={fotoAtual} alt="Foto de Perfil" className="w-24 h-24 rounded-full" />
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700">Nome de Utilizador:</label>
            <input
              type="text"
              value={nomeUtilizador}
              onChange={(e) => setNomeUtilizador(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Novo nome de utilizador"
            />
          </div>
          <div>
            <label className="block text-gray-700">Nova palavra-passe:</label>
            <input
              type="password"
              value={novaPasse}
              onChange={(e) => setNovaPasse(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Nova senha"
            />
          </div>
          <div>
            <label className="block text-gray-700">Foto de Perfil:</label>
            <input
              type="file"
              onChange={handleFotoChange}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
          >
            Atualizar Perfil
          </button>
        </form>
        {mensagem && <p className="text-center text-green-500 mt-4">{mensagem}</p>}
      </div>
    </div>
  );
};

export default EditarPerfil;
