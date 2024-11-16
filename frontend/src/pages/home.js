import React from 'react'
import Img from '../imagens/img.png'
import Footer from '../components/footer'

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
          
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Home
