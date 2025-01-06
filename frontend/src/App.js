import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import  {jwtDecode } from 'jwt-decode';
import Home from './pages/home';
import Login from './pages/login';
import Register from './pages/register';
import Organizadores from './pages/organizadores';
import Navbar from './components/Navbar';
import Footer from './components/footer';
import Patrocinadores from './pages/patrocinadores';
import ErrorBoundary from './components/ErrorBoundary';
import Perfil from './pages/perfil';
import Eventos from './pages/eventos';
import EventoDetalhesPage from './pages/eventosDetalhePage';
import Dashboard from './pages/dashboard';
import Banido from './pages/banido';
import EditarPerfil from './pages/editarPerfil';
import CriarEventos from './pages/criarEventos';
import CriarCategoria from './pages/criarCategoria';
import CriarSala from './pages/criarSala';
import Categorias from './pages/categoria';
import Salas from './pages/salas';

function App() {
  const [userId, setUserId] = useState(undefined);
  const [userLevel, setUserLevel] = useState(undefined);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = jwtDecode(token);
      console.log('Decoded Token:', decodedToken); // Adiciona um log para verificar o conteúdo do token
      setUserId(decodedToken.id); // Assumindo que o token possui um campo id
      setUserLevel(decodedToken.nivel); // Assumindo que o token possui um campo nivel
    }
  }, []);

  return (
    <Router>
      <Navbar userId={userId} userLevel={userLevel} />
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/organizadores" element={<Organizadores />} />
          <Route path="/patrocinadores" element={<Patrocinadores />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/eventos" element={<Eventos />} />
          <Route path="/eventos/:id" element={<EventoDetalhesPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/banido" element={<Banido />} />
          <Route path="/footer" element={<Footer />} />
          <Route path="/criarCategoria" element={<CriarCategoria />}/>
          <Route path="/criarSala" element={<CriarSala />} />
          <Route path="/editarPerfil" element={<EditarPerfil />} />
          <Route path="/salas" element={<Salas />} />
          <Route path="/categorias" element={<Categorias />}/>
          <Route path="/criarEventos" element={<CriarEventos />} />
        </Routes>
      </ErrorBoundary>
    </Router>
  );
}

export default App;
