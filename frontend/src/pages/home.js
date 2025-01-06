import React, { useEffect, useState } from 'react';
import Footer from '../components/footer';
import useAuth from '../components/userAuth';
import { useNavigate } from 'react-router-dom';

function Home() {
  useAuth();

  const [eventos, setEventos] = useState([]);
  const [showScrollTopButton, setShowScrollTopButton] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEventos = async () => {
      try {
        const response = await fetch('http://localhost:8081/eventos?limit=3'); // Ajuste a URL para seu endpoint
        if (!response.ok) {
          throw new Error('Erro ao buscar eventos');
        }
        const data = await response.json();
        setEventos(data.eventos); // Pegando apenas os 3 primeiros eventos
      } catch (error) {
        console.error('Erro ao buscar eventos:', error.message);
      }
    };

    fetchEventos();

     // Adiciona evento para monitorar scroll e exibir o botão flutuante
     const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      setShowScrollTopButton(scrollY > scrollHeight * 0.8); // Aparece quando perto do footer
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };

  }, []);

  const formatDateTime = (dateString) => {
    const options = {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    };
    return new Date(dateString).toLocaleString('pt-PT', options);
  };

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleVerMaisEventos = () => {
    // Destacar o botão "Eventos" na navbar
    navigate('/eventos', { state: { highlight: 'eventos' } });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }


  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="w-4/6">
        <video
          src={"https://cdn.pixabay.com/video/2023/10/15/185092-874643408_large.mp4"}
          autoPlay
          loop
          muted
          className="w-full h-auto"
          alt="video"
        ></video>
      </div>

      <div className="w-full flex flex-col items-center py-10 bg-gray-200 pt-10">
        <div className="w-full text-center font-medium font-mono px-5">
          <h2 className="text-2xl font-semibold mb-4">Próximos Eventos</h2>
          {/* Centralizando os eventos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6  items-center w-full px-4">
            {eventos.length > 0 ? (
              eventos.map((evento) => (
                <div
                  key={evento.id_evento}
                  className="bg-white shadow-lg rounded-lg overflow-hidden flex flex-col items-center w-full"
                >
                  {/* Exibindo a foto do evento */}
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center relative transition-transform transform hover:scale-105">
                    {evento.foto ? (
                      <img 
                        src={evento.foto} 
                        alt={`Foto do evento ${evento.nome_evento}`} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-500 font-semibold relative transition-transform transform hover:scale-105">Sem imagem</span>
                    )}
                  </div>
                  <div className="p-4 text-center">
                    <h3 className="text-xl font-bold text-blue-600">{evento.nome_evento}</h3>
                    <p className="text-gray-600">
                      Data: {formatDateTime(evento.data_inicio)}
                    </p>
                    <p className="text-gray-600">{evento.breve_desc}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">Carregando eventos...</p>
            )}
          </div>
          {/* Botão "Ver Mais Eventos" */}
          <div className="mt-6">
            <button
              onClick={handleVerMaisEventos}
              className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-full shadow-lg hover:bg-blue-700 transition-transform transform hover:scale-105"
            >
              Ver Mais Eventos
            </button>
          </div>
        </div>
      </div>
      <Footer />
      {showScrollTopButton && (
        <button
          onClick={handleScrollToTop}
          className="fixed bottom-6 right-6 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-transform transform hover:scale-105"
        >
          ↑
        </button>
      )}
    </div>
  );
}

export default Home;
