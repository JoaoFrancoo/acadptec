import React from 'react'
import Img from '../imagens/img.png'

function home() {
  return (
    <div>
      <div class="size-4/6"><video 
      src={"https://cdn.pixabay.com/video/2023/10/15/185092-874643408_large.mp4"}
      autoPlay
      loop
      muted
       alt="imagem"></video> </div>
      <div class="text-center text-3xl font-medium font-mono py-10">
       <h1>Bem vindo(a) à AcadPTec</h1>
       </div>
       
    </div>
  )
}

export default home