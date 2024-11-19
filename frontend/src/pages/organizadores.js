import React, { useEffect, useState } from "react";

function Organizadores() {
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
      <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Lista de Organizadores
      </h1>
      <div className="overflow-x-auto">
        <table className="table-auto w-full border-collapse border border-gray-300 bg-white shadow-md">
          <thead>
            <tr className="bg-gray-200 text-gray-700">
              <th className="border border-gray-300 px-4 py-2">ID</th>
              <th className="border border-gray-300 px-4 py-2">Nome</th>
              <th className="border border-gray-300 px-4 py-2">Email</th>
              <th className="border border-gray-300 px-4 py-2">Departamento</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(data) ? (
              data.map((d, i) => (
                <tr
                  key={i}
                  className={`${
                    i % 2 === 0 ? "bg-gray-50" : "bg-white"
                  } hover:bg-gray-100`}
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
