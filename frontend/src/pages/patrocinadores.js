import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Patrocinadores = () => {
  const[data,setData]=useState([]);
    useEffect(()=>{
      fetch('http://localhost:8081/patrocinadores')
      .then(res => res.json())
      .then(data => {
        console.log(data); 
        setData(data);
      })
      .catch(err => console.log(err));
    },[]);
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-semibold mb-4">Nossos Patrocinadores</h2>
      <table>
            <thead>
              <tr>
                
                <th>nome</th>
                <th>contacto</th>
                
              </tr>          
            </thead>
            <tbody>
              {Array.isArray(data) ? (
              data.map((d, i) =>(
                <tr key={i}>
                  
                  <td>{d.nome}</td>
                  <td>{d.contacto}</td>
                  
                </tr>
              ))
            ):(
              <tr>
                <td colSpan="4">Dados não disponíveis.</td>
              </tr>
            )}
            </tbody>
          </table>
    </div>
    
  );
};

export default Patrocinadores;
