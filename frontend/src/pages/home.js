import React, { useEffect, useState } from 'react';
import Footer from '../components/footer';
import useAuth from '../components/userAuth';

function Home() {
  useAuth();

  const [eventos, setEventos] = useState([]);

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-center items-center w-full max-w-6xl">
            {eventos.length > 0 ? (
              eventos.map((evento) => (
                <div
                  key={evento.id_evento}
                  className="bg-white shadow-lg rounded-lg overflow-hidden flex flex-col items-center"
                >
                  {/* Exibindo a foto do evento */}
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                    {evento.foto ? (
                      <img 
                        src={evento.foto} 
                        alt={`Foto do evento ${evento.nome_evento}`} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-500 font-semibold">Sem imagem</span>
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
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Home;
