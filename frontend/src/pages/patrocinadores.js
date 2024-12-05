import React, { useEffect, useState } from 'react';
import useAuth from '../components/userAuth';

const Patrocinadores = () => {
  useAuth();
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8081/patrocinadores')
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setData(data);
      })
      .catch((err) => console.log(err));
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 p-8">
      <h1 className="text-4xl font-bold text-blue-600 mb-6">
        Nossos Patrocinadores
      </h1>
      <p className="text-gray-600 mb-8 text-center">
        Agradecemos aos nossos patrocinadores pelo apoio e contribuição para o sucesso de nossos eventos.
      </p>

      {/* Grid de Patrocinadores */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8 w-full max-w-7xl">
        {Array.isArray(data) && data.length > 0 ? (
          data.map((patrocinador, index) => (
            <div key={index} className="flex items-center justify-center">
              
              
              {patrocinador.logo ? (
                <img
                  src={patrocinador.logo}
                  alt={`Logo de ${patrocinador.nome}`}
                  className="h-20 w-auto object-contain"
                />
              ) : (
                <div className="h-20 w-20 bg-gray-200 flex items-center justify-center rounded">
                  <span className="text-gray-500 text-sm">Sem logo</span>
                </div>
              )}
            </div>
          ))
          
        ) : (
          <p className="text-gray-600 text-center col-span-full">
            Nenhum patrocinador disponível no momento.
          </p>
        )}
        
      </div>
      
    </div>
  );
};

export default Patrocinadores;
