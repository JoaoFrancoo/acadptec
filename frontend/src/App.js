import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/home';
import Login from './pages/login';
import Register from './pages/register';
import Organizadores from './pages/organizadores'
import Navbar from './components/Navbar';
import Footer from './components/footer'
import Patrocinadores from './pages/patrocinadores';
function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={< Home/>} />
        <Route path="/login" element={< Login/>}/>
        <Route path="/register" element={< Register/>}/>
        <Route path="/organizadores" element={<Organizadores/>}/>
        <Route path="/patrocinadores" element={<Patrocinadores/>}/>
        </Routes>
    </Router>
    
  )
}

export default App