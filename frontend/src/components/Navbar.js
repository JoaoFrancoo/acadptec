import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ userId, userLevel }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isEventDropdownOpen, setIsEventDropdownOpen] = useState(false);
  const [isCategoriaDropdownOpen, setIsCategoriaDropdownOpen] = useState(false);
  const [isSalaDropdownOpen, setIsSalaDropdownOpen] = useState(false);
  const eventDropdownRef = useRef(null);
  const categoriaDropdownRef = useRef(null);
  const salaDropdownRef = useRef(null);

  useEffect(() => {
    console.log('User ID:', userId);
    console.log('User Level:', userLevel);
  }, [userId, userLevel]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (eventDropdownRef.current && !eventDropdownRef.current.contains(event.target)) {
        setIsEventDropdownOpen(false);
      }
      if (categoriaDropdownRef.current && !categoriaDropdownRef.current.contains(event.target)) {
        setIsCategoriaDropdownOpen(false);
      }
      if (salaDropdownRef.current && !salaDropdownRef.current.contains(event.target)) {
        setIsSalaDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [eventDropdownRef, categoriaDropdownRef, salaDropdownRef]);

  const handleDropdownToggle = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleEventDropdownToggle = () => {
    setIsEventDropdownOpen(!isEventDropdownOpen);
  };

  const handleCategoriaDropdownToggle = () => {
    setIsCategoriaDropdownOpen(!isCategoriaDropdownOpen);
  };

  const handleSalaDropdownToggle = () => {
    setIsSalaDropdownOpen(!isSalaDropdownOpen);
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
              <li className="relative" ref={eventDropdownRef}>
                <button
                  onClick={handleEventDropdownToggle}
                  className="text-black hover:text-gray-700 transition-colors"
                >
                  Eventos
                </button>
                {isEventDropdownOpen && (
                  <div className="absolute right-0 mt-2 py-2 w-48 bg-white rounded-md shadow-lg border border-gray-200">
                    <ul>
                      <li>
                        <Link to="/eventos" className="block px-4 py-2 text-black hover:bg-gray-100">
                          Ver Eventos
                        </Link>
                      </li>
                      {userLevel >= 3 && (
                        <li>
                          <Link to="/criarEventos" className="block px-4 py-2 text-black hover:bg-gray-100">
                            Criar Evento
                          </Link>
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </li>
            )}
            {userLevel >= 3 && (
              <li className="relative" ref={categoriaDropdownRef}>
                <button
                  onClick={handleCategoriaDropdownToggle}
                  className="text-black hover:text-gray-700 transition-colors"
                >
                  Categorias
                </button>
                {isCategoriaDropdownOpen && (
                  <div className="absolute right-0 mt-2 py-2 w-48 bg-white rounded-md shadow-lg border border-gray-200">
                    <ul>
                      <li>
                        <Link to="/categorias" className="block px-4 py-2 text-black hover:bg-gray-100">
                          Ver Categorias
                        </Link>
                      </li>
                      <li>
                        <Link to="/criarCategoria" className="block px-4 py-2 text-black hover:bg-gray-100">
                          Criar Categoria
                        </Link>
                      </li>
                    </ul>
                  </div>
                )}
              </li>
            )}
            {userLevel >= 4 && (
              <li className="relative" ref={salaDropdownRef}>
                <button
                  onClick={handleSalaDropdownToggle}
                  className="text-black hover:text-gray-700 transition-colors"
                >
                  Salas
                </button>
                {isSalaDropdownOpen && (
                  <div className="absolute right-0 mt-2 py-2 w-48 bg-white rounded-md shadow-lg border border-gray-200">
                    <ul>
                      <li>
                        <Link to="/salas" className="block px-4 py-2 text-black hover:bg-gray-100">
                          Ver Salas
                        </Link>
                      </li>
                      <li>
                        <Link to="/criarSala" className="block px-4 py-2 text-black hover:bg-gray-100">
                          Criar Sala
                        </Link>
                      </li>
                    </ul>
                  </div>
                )}
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
                  <div className="absolute right-0 mt-2 py-2 w-48 bg-white rounded-md shadow-lg border border-gray-200">
                    <ul>
                      <li>
                        <Link to="/perfil" className="block px-4 py-2 text-black hover:bg-gray-100">
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
