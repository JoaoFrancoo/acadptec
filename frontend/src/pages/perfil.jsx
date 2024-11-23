import React, { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode'; 

const PerfilUtilizador = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchUserData = async () => {
      if (!token) {
        setError('É necessário fazer login.');
        setLoading(false);
        return;
      }

      try {
        const decodedToken = jwtDecode(token);
        if (!decodedToken) {
          setError('Token inválido.');
          setLoading(false);
          return;
        }

        const response = await fetch('http://localhost:8081/user/me/details', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Erro ao buscar dados.');
        }

        const data = await response.json();
        setUserData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [token]);

  if (loading) return <p>Carregando...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="flex flex-col items-center p-6 bg-gray-100 min-h-screen">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">Perfil do Utilizador</h1>
        <div className="text-center mb-4">
          <img
            src={userData.user.foto || '/default-profile.png'} // Use imagem padrão se `foto` for null
            alt="Foto do Utilizador"
            className="w-24 h-24 rounded-full object-cover mx-auto"
          />
        </div>
        <div className="mb-4">
          <p><strong>Nome:</strong> {userData.user.nome}</p>
          <p><strong>Email:</strong> {userData.user.email}</p>
        </div>
        <h2 className="text-xl font-semibold mt-6 mb-2">Inscrições em Eventos</h2>
        <ul className="list-disc list-inside">
          {userData.inscricoes.length > 0 ? (
            userData.inscricoes.map(evento => (
              <li key={evento.id_evento}>
                <a
                  href={`/eventos/${evento.id_evento}`}
                  className="text-blue-500 hover:underline"
                >
                  {evento.nome_evento}
                </a>
              </li>
            ))
          ) : (
            <p>Sem inscrições no momento.</p>
          )}
        </ul>
      </div>
    </div>
  );
};

export default PerfilUtilizador;
