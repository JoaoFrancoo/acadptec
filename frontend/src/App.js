import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/home';
import Login from './pages/login';
import Register from './pages/register';
import Organizadores from './pages/organizadores'
import Navbar from './components/Navbar';
import Footer from './components/footer';
import Patrocinadores from './pages/patrocinadores';
import ErrorBoundary from './components/ErrorBoundary';
import Perfil from './pages/perfil'
import Eventos from './pages/eventos'
import EventoDetalhesPage from './pages/eventosDetalhePage';
import Dashboard from './pages/dashboard';
import Banido from './pages/banido';
import EditarPerfil from './pages/editarPerfil';
import CriarEventos from './pages/criarEventos';

function App() {
  return (
    <Router>
      <Navbar />
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/organizadores" element={<Organizadores />} />
          <Route path="/patrocinadores" element={<Patrocinadores />} />
          <Route path="/perfil" element={<Perfil />}/>
          <Route path="/eventos" element={<Eventos />}/>
          <Route path="/eventos/:id" element={<EventoDetalhesPage />} />
          <Route path="/dashboard" element={<Dashboard />}/>
          <Route path="/banido" element={<Banido />} />
          <Route path="/footer" element={<Footer />} />
          <Route path="/editarPerfil" element={<EditarPerfil />} />
          <Route path="/criarEventos" element={<CriarEventos />}/>
        </Routes>
      </ErrorBoundary>
    </Router>
    
  )
}

export default App