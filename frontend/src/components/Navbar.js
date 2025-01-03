import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ userId, userLevel }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    console.log('User ID:', userId);
    console.log('User Level:', userLevel);
  }, [userId, userLevel]);

  const handleDropdownToggle = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <nav className="bg-whitesmoke p-4 shadow-md">
      <div className="container mx-auto">
        <div className="flex justify-between items-center">
          <div className="text-black font-bold text-xl">
            <Link to="/">AcadPTec</Link>
          </div>
          <ul className="flex space-x-8">
            <li>
              <Link to="/" className="text-black hover:text-gray-700 transition-colors">Home</Link>
            </li>           
              
                <li>
                  <Link to="/login" className="text-black hover:text-gray-700 transition-colors">Login</Link>
                </li>
                <li>
                  <Link to="/register" className="text-black hover:text-gray-700 transition-colors">Registrar</Link>
                </li>             
            
            {userLevel >= 2 && (
              <li>
                <Link to="/eventos" className="text-black hover:text-gray-700 transition-colors">Eventos</Link>
              </li>
            )}
            {userLevel >= 3 && (
              <li>
                <Link to="/organizadores" className="text-black hover:text-gray-700 transition-colors">Organizadores</Link>
              </li>
            )}
            {userLevel >= 2 && (
              <li>
                <Link to="/patrocinadores" className="text-black hover:text-gray-700 transition-colors">Patrocinadores</Link>
              </li>
            )}
            {userLevel >= 1 && (
              <li className="relative">
                <button
                  onClick={handleDropdownToggle}
                  className="text-black hover:text-gray-700 transition-colors"
                >
                  Perfil
                </button>
                {isDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 py-2 w-48 bg-white rounded-md shadow-lg border border-gray-200"
                    onClick={() => setIsDropdownOpen(false)} // Fecha o dropdown ao clicar
                  >
                    <ul>
                      <li>
                        <Link
                          to="/perfil"
                          className="block px-4 py-2 text-black hover:bg-gray-100"
                        >
                          Ver Perfil
                        </Link>
                      </li>
                      <li>
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-black hover:bg-gray-100"
                        >
                          Terminar Sessão
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </li>
            )}
            {userLevel >= 4 && (
              <li>
                <Link to="/dashboard" className="text-black hover:text-gray-700 transition-colors">Dashboard</Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
