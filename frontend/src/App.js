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
          <Route path="/footer" element={<Footer />} />

        </Routes>
      </ErrorBoundary>
    </Router>
    
  )
}

export default App