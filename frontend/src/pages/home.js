import React from 'react'
import Img from '../imagens/img.png'

function home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="w-4/6" >
        <video 
          src={"https://cdn.pixabay.com/video/2023/10/15/185092-874643408_large.mp4"}
          autoPlay
          loop
          muted
          className='w-full h-auto'
          alt="video"
        ></video> 
      </div>
      <div class="text-center text-3xl font-medium font-mono py-10">
       <h1>Bem vindo(a) à AcadPTec</h1>
       </div>
       
    </div>
  )
}

export default home