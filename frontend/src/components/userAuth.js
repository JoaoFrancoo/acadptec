import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

function useAuth() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        if (decodedToken.nivel === 0) {
          navigate('/banido');
        }
      } catch (error) {
        console.error('Erro ao decodificar o token', error);
      }
    } else {
      navigate('/login'); 
    }
  }, [navigate]);

  return null;
}

export default useAuth;
