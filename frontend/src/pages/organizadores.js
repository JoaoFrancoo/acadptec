import React, { useEffect, useState } from "react";
import useAuth from '../components/userAuth';

function Organizadores() {
  useAuth()
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8081/users")
      .then((res) => res.json())
      .then((data) => {
        console.log(data); // Verifique o formato da resposta
        setData(data);
      })
      .catch((err) => console.log(err));
  }, []);

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-bold text-center text-blue-600 mb-6">
        Lista de Organizadores
      </h1>
      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="table-auto w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-blue-100">
              <th className="border border-gray-300 px-4 py-2 text-304d6d-600">ID</th>
              <th className="border border-gray-300 px-4 py-2 text-a7cced-600">Nome</th>
              <th className="border border-gray-300 px-4 py-2 text-Uranian Blue-600">Email</th>
              <th className="border border-gray-300 px-4 py-2 text-blue-600">Departamento</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(data) ? (
              data.map((d, i) => (
                <tr
                  key={i}
                  className={`${i % 2 === 0 ? "bg-gray-50" : "bg-white"
                    } hover:bg-blue-50`}
                >
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    {d.id_organizador}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    {d.nome}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    {d.email}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    {d.departamento}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="4"
                  className="border border-gray-300 px-4 py-2 text-center text-red-500"
                >
                  Dados não disponíveis.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Organizadores;
