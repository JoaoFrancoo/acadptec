import React from 'react'
import { Link } from 'react-router-dom'

const Navbar = () => {
    return (
        <nav className="bg-white p-4 shadow-md">
            <ul className="flex space-x-8 align items-center">
                <li>
                    <Link to="/" className="text-gray-700 hover:text-gray-900 transition-colors">Home</Link>
                </li>
                <li>
                    <Link to="/login" className="text-gray-700 hover:text-gray-900 transition-colors">Login</Link>
                </li>
                <li>
                    <Link to="/register" className="text-gray-700 hover:text-gray-900 transition-colors">Registrar</Link>
                </li>
                <li>
                    <Link to="/organizadores" className="text-gray-700 hover:text-gray-900 transition-colors">Organizadores</Link>
                </li>
            </ul>
        </nav>
    )
}

export default Navbar
