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
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">        
        

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

        {/* Informações */}
        <div className="w-full md:w-1/2 text-center font-medium font-mono px-5">
          <h2>Quer conhecer eventos académicos perto da sua residência?</h2>
          <h3 className="text-2xl font-semibold mb-4">Eventos Académicos:</h3>
          <ul>
            <li className="mb-2">Evento 1: Workshop de IA - 25/10/2024</li>
            <li className="mb-2">Evento 2: Conferência de Tecnologia - 01/11/2024</li>
            <li className="mb-2">Evento 3: Simpósio de Sustentabilidade - 15/11/2024</li>
          </ul>
        </div>
      </div>
      <div className="text-center mt-6">
        <p className="text-sm">© 2024 AcadPTec. Todos os direitos reservados.</p>
      </div>

    </footer>
  );
}

export default Footer;
