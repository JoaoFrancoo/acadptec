import React, {useEffect, useState} from 'react'

function organizadores() {
    const[data,setData]=useState([])
    useEffect(()=>{
      fetch('http://localhost:8081/users')
      .then(res => res.json())
      .then(data => setData(data))
      .catch(err => console.log(err));
    },[])
    return (
      <div style={{padding: "50px"}}>
          <table>
            <thead>
              <th>ID</th>
              <th>nome</th>
              <th>email</th>
              <th>departamento</th>
            </thead>
            <tbody>
              {data.map((d, i) =>(
                <tr key={i}>
                  <td>{d.id_organizador}</td>
                  <td>{d.nome}</td>
                  <td>{d.email}</td>
                  <td>{d.departamento}</td>
                </tr>
              ))}
            </tbody>
          </table>
      </div>
    )
}

export default organizadores