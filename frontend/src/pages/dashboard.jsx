import React, { useEffect, useState } from 'react';
import axios from 'axios';

function AdminDashboard() {
  const [clientes, setClientes] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [palestrantes, setPalestrantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('token'); // Supondo que o token esteja armazenado no localStorage

  useEffect(() => {
    if (!token) {
      setError('Token não encontrado');
      return;
    }

    const fetchData = async () => {
      try {
        const [clientesData, eventosData, palestrantesData] = await Promise.all([
          axios.get('http://localhost:8081/admin/clientes', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('http://localhost:8081/admin/eventos', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('http://localhost:8081/admin/palestrantes', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        setClientes(clientesData.data);
        setEventos(eventosData.data);
        setPalestrantes(palestrantesData.data);
      } catch (err) {
        setError('Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const handleStatusChange = async (id, status) => {
    try {
      await axios.put(`http://localhost:8081/admin/palestrante/${id}`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Atualiza a lista de palestrantes após a mudança de status
      setPalestrantes(palestrantes.map(p => p.id_cliente === id ? { ...p, status } : p));
    } catch (err) {
      setError('Erro ao atualizar status');
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h1>Dashboard do Administrador</h1>

      <h2>Clientes</h2>
      <ul>
        {clientes.map(cliente => (
          <li key={cliente.user_id}>{cliente.nome} - {cliente.email}</li>
        ))}
      </ul>

      <h2>Eventos</h2>
      <ul>
        {eventos.map(evento => (
          <li key={evento.id_evento}>{evento.nome} - {evento.data_inicio} a {evento.data_fim}</li>
        ))}
      </ul>

      <h2>Palestrantes</h2>
      <ul>
        {palestrantes.map(palestrante => (
          <li key={palestrante.id_cliente}>
            {palestrante.nome} - Status: {palestrante.status}
            {palestrante.status === 'pendente' && (
              <div>
                <button onClick={() => handleStatusChange(palestrante.id_cliente, 'aprovado')}>Aprovar</button>
                <button onClick={() => handleStatusChange(palestrante.id_cliente, 'recusado')}>Recusar</button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AdminDashboard;
