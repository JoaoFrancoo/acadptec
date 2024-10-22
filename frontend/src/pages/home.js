import React from 'react'
import Img from '../imagens/img.png'

function Home() {
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

      <div className="w-full flex flex-row justify-center items-center py-10 bg-gray-200 pt-10">
        <div className="w-1/2 text-center font-medium font-mono px-5">
          <h2>Quer conhecer eventos académicos perto da sua residência?</h2>
        </div>

        <div className="w-1/2 p-5">
          <h3 className="text-2xl font-semibold mb-4">Eventos Académicos:</h3>
          <ul>
            <li className="mb-2">Evento 1: Workshop de IA - 25/10/2024</li>
            <li className="mb-2">Evento 2: Conferência de Tecnologia - 01/11/2024</li>
            <li className="mb-2">Evento 3: Simpósio de Sustentabilidade - 15/11/2024</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Home
