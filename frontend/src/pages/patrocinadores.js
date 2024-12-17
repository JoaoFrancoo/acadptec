import React, { useEffect, useState } from 'react';
import useAuth from '../components/userAuth'; 

const Patrocinadores = () => {
  useAuth();
  const [patrocinadores, setPatrocinadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Buscar os dados dos patrocinadores
  const fetchPatrocinadores = async () => {
    try {
      const response = await fetch('http://localhost:8081/patrocinadores');
      if (!response.ok) {
        throw new Error('Erro ao buscar patrocinadores.');
      }
      const data = await response.json();
      setPatrocinadores(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatrocinadores();
  }, []);

  if (loading) return <p>Carregando patrocinadores...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="flex flex-col items-center p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-blue-600 mb-6">Nossos Patrocinadores</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {patrocinadores.map((patrocinador) => (
          <div key={patrocinador.id_patrocinador} className="text-center bg-white shadow-md rounded-lg p-4">
            <img
              src={patrocinador.logo || '/default-logo.png'}
              alt={`Logo de ${patrocinador.nome}`}
              className="w-24 h-24 rounded-full object-cover mx-auto mb-2"
            />
            <p className="font-semibold text-gray-700">{patrocinador.nome}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Patrocinadores;
