import React, { useState } from 'react';
import emailjs from 'emailjs-com';

function Footer() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const sendEmail = (e) => {
    e.preventDefault();
    
    emailjs.send(
      'service_l4v88m9', // Substitua pelo seu Service ID do EmailJS
      'template_atfim87', // Substitua pelo seu Template ID do EmailJS
      {
        from_name: formData.name,
        from_email: formData.email,
        subject: formData.subject,
        message: formData.message
      },
      '7C1nrbLwgPXVacvoZ'
    )
    .then((result) => {
      console.log(result.text);
      alert('Mensagem enviada com sucesso!');
    }, (error) => {
      console.log(error.text);
      alert('Erro ao enviar mensagem, tente novamente.');
    });

    setFormData({
      name: '',
      email: '',
      subject: '',
      message: ''
    });
  };

  return (
    <footer className="w-full bg-gray-800 text-white py-8">
      <div className="container mx-auto flex flex-col items-center">
        <p className="text-sm mb-6">© 2024 AcadPTec. Todos os direitos reservados.</p>
        
        {/* Formulário de Contato */}
        <form className="w-full max-w-md" onSubmit={sendEmail}>
          <h3 className="text-xl font-semibold mb-4">Contato</h3>

          <input 
            type="text" 
            name="name" 
            placeholder="Seu nome" 
            value={formData.name} 
            onChange={handleChange} 
            className="w-full p-2 mb-4 text-black rounded" 
            required 
          />
          <input 
            type="email" 
            name="email" 
            placeholder="Seu email" 
            value={formData.email} 
            onChange={handleChange} 
            className="w-full p-2 mb-4 text-black rounded" 
            required 
          />
          <input 
            type="text" 
            name="subject" 
            placeholder="Assunto" 
            value={formData.subject} 
            onChange={handleChange} 
            className="w-full p-2 mb-4 text-black rounded" 
            required 
          />
          <textarea 
            name="message" 
            placeholder="Sua mensagem" 
            value={formData.message} 
            onChange={handleChange} 
            className="w-full p-2 mb-4 text-black rounded h-32" 
            required 
          ></textarea>
          
          <button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Enviar
          </button>
        </form>
      </div>
    </footer>
  );
}

export default Footer;
