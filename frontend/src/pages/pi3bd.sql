-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Tempo de geração: 29-Dez-2024 às 20:03
-- Versão do servidor: 10.4.32-MariaDB
-- versão do PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `pi3bd`
--

-- --------------------------------------------------------

--
-- Estrutura da tabela `categorias`
--

CREATE TABLE `categorias` (
  `id_categoria` int(11) NOT NULL,
  `descricao` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `categorias`
--

INSERT INTO `categorias` (`id_categoria`, `descricao`) VALUES
(1, 'banana'),
(2, 'Seminário'),
(3, 'Palestra'),
(4, 'Conferência');

-- --------------------------------------------------------

--
-- Estrutura da tabela `eventopalestrante`
--

CREATE TABLE `eventopalestrante` (
  `id_evento` int(11) NOT NULL,
  `id_palestrante` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura da tabela `eventos`
--

CREATE TABLE `eventos` (
  `id_evento` int(11) NOT NULL,
  `foto` varchar(200) NOT NULL,
  `nome` varchar(255) NOT NULL,
  `data_inicio` datetime NOT NULL,
  `data_fim` datetime DEFAULT NULL,
  `id_categoria` int(11) DEFAULT NULL,
  `id_sala` int(11) DEFAULT NULL,
  `id_organizador` int(11) DEFAULT NULL,
  `breve_desc` varchar(75) NOT NULL,
  `descricao` text NOT NULL,
  `visivel` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `eventos`
--

INSERT INTO `eventos` (`id_evento`, `foto`, `nome`, `data_inicio`, `data_fim`, `id_categoria`, `id_sala`, `id_organizador`, `breve_desc`, `descricao`, `visivel`) VALUES
(17, '1735477498326.jpg', 'Evento tentar esquivar da nintendo', '2024-12-29 13:04:00', '2024-12-29 14:04:00', 1, 4, NULL, 'Neste magnifico evento vamos tentar esquivar do copyright da nintendo', 'Neste magnifico evento vamos tentar esquivar do copyright da nintendoNeste magnifico evento vamos tentar esquivar do copyright da nintendoNeste magnifico evento vamos tentar esquivar do copyright da nintendoNeste magnifico evento vamos tentar esquivar do copyright da nintendoNeste magnifico evento vamos tentar esquivar do copyright da nintendoNeste magnifico evento vamos tentar esquivar do copyright da nintendoNeste magnifico evento vamos tentar esquivar do copyright da nintendoNeste magnifico evento vamos tentar esquivar do copyright da nintendoNeste magnifico evento vamos tentar esquivar do copyright da nintendoNeste magnifico evento vamos tentar esquivar do copyright da nintendoNeste magnifico evento vamos tentar esquivar do copyright da nintendoNeste magnifico evento vamos tentar esquivar do copyright da nintendoNeste magnifico evento vamos tentar esquivar do copyright da nintendoNeste magnifico evento vamos tentar esquivar do copyright da nintendo', 1);

-- --------------------------------------------------------

--
-- Estrutura da tabela `inscricoes`
--

CREATE TABLE `inscricoes` (
  `id_inscricao` int(11) NOT NULL,
  `id_cliente` int(11) DEFAULT NULL,
  `id_evento` int(11) DEFAULT NULL,
  `quantidade` int(11) NOT NULL,
  `visivel` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura da tabela `login`
--

CREATE TABLE `login` (
  `user_id` int(11) NOT NULL,
  `foto` varchar(300) NOT NULL,
  `email` varchar(250) NOT NULL,
  `nome` varchar(50) NOT NULL,
  `password` varchar(100) NOT NULL,
  `nivel` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `login`
--

INSERT INTO `login` (`user_id`, `foto`, `email`, `nome`, `password`, `nivel`) VALUES
(1, '1731761847953.png', 'toogart38@gmail.com', 'joao', '$2b$10$H1wqxZnk2KH3xVhOOhuYYO5ylMhX.Dj7tErnSN98b0cC/uevzpbNa', 2),
(2, '1732032491168.png', 'joao_miguel_05@hotmail.com', 'João1', '$2b$10$4Tqg8JY3PIIRUeGUcZ1eFO/WlQG3ZPMBRTNqJNUJ9zpuftjMxHunq', 3),
(3, '1732707862887.jpg', 'sa@da.com', '123', '$2b$10$YSEKfMzgr0T4eb6f58dh1uc.ppmSWpB//LPfQsRH3HpveJw.9n2hS', 4),
(4, '1732794054827.jpg', 'seila@gmail.com', 'Jonh Xina', '$2b$10$JmPtAMpYrNgW/qVRouD7BOA6MdgfR5pxzeIVNzKauYotArGqlcOT2', 2),
(5, '1732794092988.jpg', 'a@b.com', 'lasagna', '$2b$10$vnVlhEEcnXpNy1px0nLsH.T2LPBej5lmPZcYpWGiazwoR1jDdybQC', 3);

-- --------------------------------------------------------

--
-- Estrutura da tabela `organizadores`
--

CREATE TABLE `organizadores` (
  `id_organizador` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `departamento` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `organizadores`
--

INSERT INTO `organizadores` (`id_organizador`, `user_id`, `departamento`) VALUES
(4, 5, 'departamento épico'),
(5, 2, 'departamento gamer');

-- --------------------------------------------------------

--
-- Estrutura da tabela `palestrantes`
--

CREATE TABLE `palestrantes` (
  `id_palestrante` int(11) NOT NULL,
  `id_cliente` int(11) NOT NULL,
  `biografia` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `palestrantes`
--

INSERT INTO `palestrantes` (`id_palestrante`, `id_cliente`, `biografia`) VALUES
(1, 1, 'Engenheira de software com mais de 15 anos de experiência em inteligência artificial e robótica.'),
(2, 1, 'Escritora e palestrante motivacional, conhecida por livros sobre superação pessoal.');

-- --------------------------------------------------------

--
-- Estrutura da tabela `patrocinadores`
--

CREATE TABLE `patrocinadores` (
  `id` int(11) NOT NULL,
  `nome` varchar(255) NOT NULL,
  `contacto` varchar(100) DEFAULT NULL,
  `logo` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `patrocinadores`
--

INSERT INTO `patrocinadores` (`id`, `nome`, `contacto`, `logo`, `created_at`, `updated_at`) VALUES
(1, 'Patrocinador A', 'email@exemplo.com', 'https://www.freepik.com/free-vector/luxury-business-logo-gold-icon_16339648.htm#fromView=search&page=1&position=10&uuid=7e1439c4-6531-488e-94e3-8db05c5f27bd', '2024-12-05 14:37:54', '2024-12-05 14:37:54'),
(2, 'Patrocinador B', '+351 123 456 789', 'https://exemplo.com/logo-b.png', '2024-12-05 14:37:54', '2024-12-05 14:37:54'),
(3, 'Patrocinador C', NULL, 'https://exemplo.com/logo-c.png', '2024-12-05 14:37:54', '2024-12-05 14:37:54');

-- --------------------------------------------------------

--
-- Estrutura da tabela `salas`
--

CREATE TABLE `salas` (
  `id_sala` int(11) NOT NULL,
  `nome_sala` varchar(255) NOT NULL,
  `capacidade` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `salas`
--

INSERT INTO `salas` (`id_sala`, `nome_sala`, `capacidade`) VALUES
(1, 'Sala Principal', 1),
(2, 'Auditório A', 193),
(3, 'Sala de Conferência', 148),
(4, 'Sala de Treinamento', 49);

-- --------------------------------------------------------

--
-- Estrutura da tabela `solicitacoes_palestrante`
--

CREATE TABLE `solicitacoes_palestrante` (
  `id_solicitacao` int(11) NOT NULL,
  `id_cliente` int(11) NOT NULL,
  `status` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Índices para tabelas despejadas
--

--
-- Índices para tabela `categorias`
--
ALTER TABLE `categorias`
  ADD PRIMARY KEY (`id_categoria`);

--
-- Índices para tabela `eventopalestrante`
--
ALTER TABLE `eventopalestrante`
  ADD PRIMARY KEY (`id_evento`,`id_palestrante`),
  ADD KEY `eventopalestrante_ibfk_1` (`id_palestrante`);

--
-- Índices para tabela `eventos`
--
ALTER TABLE `eventos`
  ADD PRIMARY KEY (`id_evento`),
  ADD KEY `id_categoria` (`id_categoria`),
  ADD KEY `id_sala` (`id_sala`),
  ADD KEY `id_organizador` (`id_organizador`);

--
-- Índices para tabela `inscricoes`
--
ALTER TABLE `inscricoes`
  ADD PRIMARY KEY (`id_inscricao`),
  ADD UNIQUE KEY `id_cliente` (`id_cliente`,`id_evento`),
  ADD KEY `id_participante` (`id_cliente`),
  ADD KEY `id_evento` (`id_evento`);

--
-- Índices para tabela `login`
--
ALTER TABLE `login`
  ADD PRIMARY KEY (`user_id`);

--
-- Índices para tabela `organizadores`
--
ALTER TABLE `organizadores`
  ADD PRIMARY KEY (`id_organizador`),
  ADD KEY `FK_user_id` (`user_id`);

--
-- Índices para tabela `palestrantes`
--
ALTER TABLE `palestrantes`
  ADD PRIMARY KEY (`id_palestrante`),
  ADD KEY `FK_cliente_palestrante` (`id_cliente`);

--
-- Índices para tabela `patrocinadores`
--
ALTER TABLE `patrocinadores`
  ADD PRIMARY KEY (`id`);

--
-- Índices para tabela `salas`
--
ALTER TABLE `salas`
  ADD PRIMARY KEY (`id_sala`);

--
-- Índices para tabela `solicitacoes_palestrante`
--
ALTER TABLE `solicitacoes_palestrante`
  ADD PRIMARY KEY (`id_solicitacao`),
  ADD KEY `FK_solicitacao` (`id_cliente`);

--
-- AUTO_INCREMENT de tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `categorias`
--
ALTER TABLE `categorias`
  MODIFY `id_categoria` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de tabela `eventos`
--
ALTER TABLE `eventos`
  MODIFY `id_evento` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT de tabela `inscricoes`
--
ALTER TABLE `inscricoes`
  MODIFY `id_inscricao` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT de tabela `login`
--
ALTER TABLE `login`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de tabela `organizadores`
--
ALTER TABLE `organizadores`
  MODIFY `id_organizador` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de tabela `palestrantes`
--
ALTER TABLE `palestrantes`
  MODIFY `id_palestrante` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de tabela `patrocinadores`
--
ALTER TABLE `patrocinadores`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de tabela `salas`
--
ALTER TABLE `salas`
  MODIFY `id_sala` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de tabela `solicitacoes_palestrante`
--
ALTER TABLE `solicitacoes_palestrante`
  MODIFY `id_solicitacao` int(11) NOT NULL AUTO_INCREMENT;

--
-- Restrições para despejos de tabelas
--

--
-- Limitadores para a tabela `eventopalestrante`
--
ALTER TABLE `eventopalestrante`
  ADD CONSTRAINT `eventopalestrante_ibfk_1` FOREIGN KEY (`id_palestrante`) REFERENCES `login` (`user_id`),
  ADD CONSTRAINT `eventopalestrante_ibfk_2` FOREIGN KEY (`id_evento`) REFERENCES `eventos` (`id_evento`);

--
-- Limitadores para a tabela `eventos`
--
ALTER TABLE `eventos`
  ADD CONSTRAINT `eventos_ibfk_1` FOREIGN KEY (`id_categoria`) REFERENCES `categorias` (`id_categoria`),
  ADD CONSTRAINT `eventos_ibfk_2` FOREIGN KEY (`id_sala`) REFERENCES `salas` (`id_sala`),
  ADD CONSTRAINT `eventos_ibfk_3` FOREIGN KEY (`id_organizador`) REFERENCES `organizadores` (`user_id`);

--
-- Limitadores para a tabela `inscricoes`
--
ALTER TABLE `inscricoes`
  ADD CONSTRAINT `inscricoes_ibfk_1` FOREIGN KEY (`id_cliente`) REFERENCES `login` (`user_id`),
  ADD CONSTRAINT `inscricoes_ibfk_2` FOREIGN KEY (`id_evento`) REFERENCES `eventos` (`id_evento`);

--
-- Limitadores para a tabela `organizadores`
--
ALTER TABLE `organizadores`
  ADD CONSTRAINT `FK_user_id` FOREIGN KEY (`user_id`) REFERENCES `login` (`user_id`);

--
-- Limitadores para a tabela `palestrantes`
--
ALTER TABLE `palestrantes`
  ADD CONSTRAINT `FK_cliente_palestrante` FOREIGN KEY (`id_cliente`) REFERENCES `login` (`user_id`);

--
-- Limitadores para a tabela `solicitacoes_palestrante`
--
ALTER TABLE `solicitacoes_palestrante`
  ADD CONSTRAINT `FK_solicitacao` FOREIGN KEY (`id_cliente`) REFERENCES `login` (`user_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
