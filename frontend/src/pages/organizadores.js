import React, {useEffect, useState} from 'react'

function Organizadores() {
    const[data,setData]=useState([]);
    useEffect(()=>{
      fetch('http://localhost:8081/users')
      .then(res => res.json())
      .then(data => {
        console.log(data); //Verifique o formato da resposta
        setData(data);
      })
      .catch(err => console.log(err));
    },[]);
    return (
      <div style={{padding: "50px"}}>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>nome</th>
                <th>email</th>
                <th>departamento</th>
              </tr>          
            </thead>
            <tbody>
              {Array.isArray(data) ? (
              data.map((d, i) =>(
                <tr key={i}>
                  <td>{d.id_organizador}</td>
                  <td>{d.nome}</td>
                  <td>{d.email}</td>
                  <td>{d.departamento}</td>
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
}

export default Organizadores;