import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const CriarEventos = () => {
  const [categorias, setCategorias] = useState([]);
  const [organizadores, setOrganizadores] = useState([]);
  const [salas, setSalas] = useState([]);
  const [palestrantes, setPalestrantes] = useState([]);
  const [formData, setFormData] = useState({
    id_categoria: '',
    id_organizadores: '',  // Mudamos para singular
    user_id: [], 
    id_sala: '',
    nome: '',
    data_inicio: '',
    data_fim: '',
    breve_desc: '', // Novo campo
    descricao: '', // Novo campo
    imagem: null
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');
  const api = axios.create({
    baseURL: 'http://localhost:8081/',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  useEffect(() => {
    console.log('Token JWT recuperado:', token);
    let userData;

    if (token) {
      try {
        userData = jwtDecode(token);
        console.log('Dados decodificados do token JWT:', userData);
      } catch (error) {
        console.error('Erro ao decodificar o token JWT:', error);
      }
    }

    api.get('/admin/opcoes')
      .then((res) => {
        console.log('Dados recebidos do backend:', res.data);
        setCategorias(res.data.categorias || []);
        setOrganizadores(res.data.organizadores || []);
        setSalas(res.data.salas || []);
        setPalestrantes(res.data.palestrantes || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Erro ao carregar opções:', err);
        setLoading(false);
      });
  }, []);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({ ...prev, imagem: file }));
  
    // Previsualização da imagem
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result);
    };
    reader.readAsDataURL(file);
  };
  
  const handleMultiSelectChange = (e) => {
    const { name, selectedOptions } = e.target;
    const values = Array.from(selectedOptions, option => option.value);
    setFormData((prev) => ({ ...prev, [name]: values }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Dados do formulário a serem enviados:', formData);
    console.log('Token JWT enviado:', token);
  
    const data = new FormData();
    for (const key in formData) {
      data.append(key, formData[key]);
    }
  
    api.post('/admin/eventos', data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
      .then((res) => {
        alert(res.data.message);
      })
      .catch((err) => {
        console.error('Erro ao criar evento:', err);
      });
  };
  
  if (loading) {
    return <div className="text-center text-xl mt-12">Carregando opções...</div>;
  }
  
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-semibold text-center text-gray-800 mb-6">Adicionar Novo Evento</h1>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="nome" className="block text-lg font-medium text-gray-700">Nome do Evento:</label>
          <input
            type="text"
            name="nome"
            id="nome"
            value={formData.nome}
            onChange={handleInputChange}
            required
            className="w-full p-3 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
  
        {/* Categoria */}
        <div>
          <label htmlFor="id_categoria" className="block text-lg font-medium text-gray-700">Categoria:</label>
          <select
            name="id_categoria"
            id="id_categoria"
            value={formData.id_categoria}
            onChange={handleInputChange}
            required
            className="w-full p-3 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Selecione uma Categoria</option>
            {categorias.map((categoria) => (
              <option key={categoria.id_categoria} value={categoria.id_categoria}>
                {categoria.descricao}
              </option>
            ))}
          </select>
        </div>
  
        {/* Organizadores */}
        <div>
          <label htmlFor="id_organizadores" className="block text-lg font-medium text-gray-700">Organizadores:</label>
          <select
            name="id_organizadores"
            id="id_organizadores"
            value={formData.id_organizadores}
            onChange={handleInputChange}
            required
            className="w-full p-3 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Selecione um Organizador</option>
            {organizadores.map((organizador) => (
              <option key={organizador.id_organizador} value={organizador.id_organizador}>
                {organizador.nome}
              </option>
            ))}
          </select>
        </div>
  
        {/* Palestrantes */}
        <div>
          <label htmlFor="user_id" className="block text-lg font-medium text-gray-700">Palestrantes:</label>
          <select
            name="user_id"
            id="user_id"
            multiple
            value={formData.user_id}
            onChange={handleMultiSelectChange}
            required
            className="w-full p-3 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {palestrantes.map((palestrante) => (
              <option key={palestrante.user_id} value={palestrante.user_id}>
                {palestrante.nome}
              </option>
            ))}
          </select>
        </div>
  
        {/* Sala */}
        <div>
          <label htmlFor="id_sala" className="block text-lg font-medium text-gray-700">Sala:</label>
          <select
            name="id_sala"
            id="id_sala"
            value={formData.id_sala}
            onChange={handleInputChange}
            required
            className="w-full p-3 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Selecione uma Sala</option>
            {salas.map((sala) => (
              <option key={sala.id_sala} value={sala.id_sala}>
                {sala.nome_sala}
              </option>
            ))}
          </select>
        </div>
  
        {/* Data Início */}
        <div>
          <label htmlFor="data_inicio" className="block text-lg font-medium text-gray-700">Data de Início:</label>
          <input
            type="datetime-local"
            name="data_inicio"
            id="data_inicio"
            value={formData.data_inicio}
            onChange={handleInputChange}
            required
            className="w-full p-3 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
  
        {/* Data Fim */}
        <div>
          <label htmlFor="data_fim" className="block text-lg font-medium text-gray-700">Data de Fim:</label>
          <input
            type="datetime-local"
            name="data_fim"
            id="data_fim"
            value={formData.data_fim}
            onChange={handleInputChange}
            required
            className="w-full p-3 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
  
        {/* Breve Descrição */}
        <div className="col-span-2">
          <label htmlFor="breve_desc" className="block text-lg font-medium text-gray-700">Breve Descrição:</label>
          <input
            type="text"
            name="breve_desc"
            id="breve_desc"
            value={formData.breve_desc}
            onChange={handleInputChange}
            required
            className="w-full p-3 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
  
        {/* Descrição */}
        <div className="col-span-2">
          <label htmlFor="descricao" className="block text-lg font-medium text-gray-700">Descrição:</label>
          <textarea
            name="descricao"
            id="descricao"
            value={formData.descricao}
            onChange={handleInputChange}
            required
            className="w-full p-3 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="4"
          />
        </div>
  
        {/* Imagem */}
        <div className="col-span-2">
          <label htmlFor="imagem" className="block text-lg font-medium text-gray-700">Imagem do Evento:</label>
          <input
            type="file"
            name="imagem"
            id="imagem"
            onChange={handleImageChange}
            className="w-full p-3 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {previewImage && (
            <img src={previewImage} alt="Pré-visualização" className="mt-4 w-full h-auto rounded-lg" />
          )}
        </div>
  
        {/* Botão de Enviar */}
        <div className="col-span-2 text-center mt-6">
          <button
            type="submit"
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Criar Evento
          </button>
        </div>
      </form>
    </div>
  );
  };
  
  export default CriarEventos;
  