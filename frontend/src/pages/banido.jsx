import React from 'react';

function Banido() {
  return (
    <div className="flex justify-center items-center h-screen bg-red-100">
      <div className="text-center p-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-3xl font-semibold text-red-600 mb-4">Acesso Bloqueado</h1>
        <p className="text-xl text-gray-700 mb-6">Sua conta foi bloqueada. Entre em contato com o administrador.</p>
      </div>
    </div>
  );
}

export default Banido;
