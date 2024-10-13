import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/home';
import Login from './pages/login';
import Register from './pages/register';
import Navbar from './components/Navbar';
function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={< Home/>} />
        <Route path="/login" element={< Login/>}/>
        <Route path="/register" element={< Register/>}/>
        </Routes>
    </Router>
  )
}

export default App