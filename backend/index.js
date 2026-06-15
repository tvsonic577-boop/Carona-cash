/**
 * CARONA CASH - Backend API Entry point
 * Tecnologias: Node.js, Express, Socket.IO, Prisma Client, JWT, Bcrypt
 * Preparado para hospedagem na Hostinger (Node.js + PostgreSQL)
 */

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'caronacash_super_secret_key_2026';

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Configuração Upload de Arquivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadPath)){
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|pdf/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Apenas imagens (JPEG/PNG) ou PDFs são autorizados!'));
  }
});

// Middleware Autenticação JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Token de acesso não fornecido!' });
  
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Token inválido ou expirado!' });
    req.user = decoded;
    next();
  });
};

// Middleware de Permissão
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.tipo)) {
      return res.status(403).json({ error: 'Acesso negado: Nível de permissão insuficiente!' });
    }
    next();
  };
};

// ==========================================
// ROTAS DE AUTENTICAÇÃO E REGISTRO
// ==========================================

// Registro do Cliente
app.post('/api/auth/register-cliente', async (req, res) => {
  const { nome, email, senha, telefone, cpf, endereco, cidade } = req.body;
  try {
    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) return res.status(400).json({ error: 'E-mail correspondente já cadastrado!' });

    const hashedPassword = await bcrypt.hash(senha, 10);

    const user = await prisma.user.create({
      data: {
        nome,
        email,
        senha: hashedPassword,
        telefone,
        tipo: 'CLIENTE',
        status: 'ATIVO', // Cliente ativado imediatamente
        cliente: {
          create: {
            cpf,
            endereco,
            cidade
          }
        }
      },
      include: { cliente: true }
    });

    res.status(201).json({ message: 'Cliente registrado com sucesso!', userId: user.id });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao registrar cliente: ' + error.message });
  }
});

// Registro do Motoristas com envio de arquivos múltiplos
app.post('/api/auth/register-motorista', upload.fields([
  { name: 'cnhFrente', maxCount: 1 },
  { name: 'comprovanteEndereco', maxCount: 1 },
  { name: 'veiculoFrente', maxCount: 1 },
  { name: 'veiculoLateral', maxCount: 1 },
  { name: 'veiculoTraseira', maxCount: 1 }
]), async (req, res) => {
  const { nome, email, senha, telefone, cpf, endereco, cidade, marca, modelo, ano, cor, placa, cnh } = req.body;
  
  try {
    if (parseInt(ano) < 2010) {
      return res.status(400).json({ error: 'Autorizado apenas veículos fabricados a partir de 2010!' });
    }

    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) return res.status(400).json({ error: 'E-mail correspondente já cadastrado!' });

    const hashedPassword = await bcrypt.hash(senha, 10);

    const files = req.files;
    if (!files.cnhFrente || !files.comprovanteEndereco || !files.veiculoFrente || !files.veiculoLateral || !files.veiculoTraseira) {
      return res.status(400).json({ error: 'Faltando o upload de documentos obrigatórios!' });
    }

    // Criar Usuário, Motorista, Veículo e Documentos associados pelo prisma transacional
    const user = await prisma.user.create({
      data: {
        nome,
        email,
        senha: hashedPassword,
        telefone,
        tipo: 'MOTORISTA',
        status: 'PENDENTE_APROVACAO',
        motorista: {
          create: {
            cpf,
            cnh,
            endereco,
            cidade,
            status_aprovacao: 'PENDENTE'
          }
        },
        documentos: {
          create: [
            { tipo: 'CNH_FRENTE', arquivo: files.cnhFrente[0].filename },
            { tipo: 'COMPROVANTE_ENDERECO', arquivo: files.comprovanteEndereco[0].filename },
            { tipo: 'VEICULO_FRENTE', arquivo: files.veiculoFrente[0].filename },
            { tipo: 'VEICULO_LATERAL', arquivo: files.veiculoLateral[0].filename },
            { tipo: 'VEICULO_TRASEIRA', arquivo: files.veiculoTraseira[0].filename }
          ]
        }
      }
    });

    // Criar Veículo associado ao Motorista criado
    const motorista = await prisma.motorista.findUnique({ where: { userId: user.id } });
    await prisma.veiculo.create({
      data: {
        motoristaId: motorista.id,
        marca,
        modelo,
        ano: parseInt(ano),
        cor,
        placa
      }
    });

    res.status(201).json({ message: 'Cadastro enviado! Aguardando aprovação dos documentos.', user: user.id });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao se cadastrar como motorista: ' + error.message });
  }
});

// Login Unificado (JWT)
app.post('/api/auth/login', async (req, res) => {
  const { email, senha } = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        cliente: true,
        motorista: { include: { veiculo: true } }
      }
    });

    if (!user) return res.status(404).json({ error: 'Usuário não encontrado!' });
    if (user.status === 'BLOQUEADO') return res.status(403).json({ error: 'Acesso negado: Sua conta foi bloqueada pelo administrador!' });

    const passwordMatch = await bcrypt.compare(senha, user.senha);
    if (!passwordMatch) return res.status(400).json({ error: 'Senha incorreta!' });

    const token = jwt.sign(
      { id: user.id, nome: user.nome, email: user.email, tipo: user.tipo, status: user.status },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        tipo: user.tipo,
        status: user.status,
        cliente: user.cliente,
        motorista: user.motorista
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro no servidor: ' + error.message });
  }
});


// ==========================================
// DASHBOARD DO DONO / ADMINISTRADOR (ADMIN)
// ==========================================

// Lista todos Clientes
app.get('/api/admin/clientes', authenticateToken, authorizeRoles('ADMINISTRADOR'), async (req, res) => {
  try {
    const clientes = await prisma.cliente.findMany({
      include: { user: { select: { nome: true, email: true, telefone: true, status: true, createdAt: true } } }
    });
    res.json(clientes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Lista todos Motoristas
app.get('/api/admin/motoristas', authenticateToken, authorizeRoles('ADMINISTRADOR'), async (req, res) => {
  try {
    const motoristas = await prisma.motorista.findMany({
      include: {
        user: { select: { nome: true, email: true, telefone: true, status: true, createdAt: true, documentos: true } },
        veiculo: true
      }
    });
    res.json(motoristas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Aprovar/Rejeitar Motorista & Documentos
app.post('/api/admin/motoristas/:id/aprovar', authenticateToken, authorizeRoles('ADMINISTRADOR'), async (req, res) => {
  const { id } = req.params;
  const { aprovado } = req.body; // true ou false
  try {
    const status_aprovacao = aprovado ? 'APROVADO' : 'REPROVADO';
    
    const motorista = await prisma.motorista.update({
      where: { id },
      data: { status_aprovacao }
    });

    const userStatus = aprovado ? 'AGUARDANDO_PAGAMENTO' : 'PENDENTE_APROVACAO';

    await prisma.user.update({
      where: { id: motorista.userId },
      data: { status: userStatus }
    });

    res.json({ message: `Status do motorista atualizado para ${status_aprovacao}!` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Bloquear ou Desbloquear Usuário
app.post('/api/admin/usuarios/:id/status', authenticateToken, authorizeRoles('ADMINISTRADOR'), async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'ATIVO' ou 'BLOQUEADO'
  try {
    await prisma.user.update({
      where: { id },
      data: { status }
    });
    res.json({ message: 'Status do usuário alterado com sucesso para ' + status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// ==========================================
// PAGAMENTO DE ASSINATURA PIX (MOTORISTA)
// ==========================================

// Simulação de criação de checkout PIX
app.post('/api/motorista/pagamento-assinatura', authenticateToken, authorizeRoles('MOTORISTA'), async (req, res) => {
  try {
    const motorista = await prisma.motorista.findFirst({ where: { userId: req.user.id } });
    if (!motorista) return res.status(404).json({ error: 'Registro de motorista não encontrado!' });

    // Em produção, aqui integraria com provedor de PIX (MercadoPago, Asaas, etc.)
    // Retornamos dados de pagamento para o cliente
    const pixCopiaECola = "00020101021126580014br.gov.bcb.pix01362e19cb6d-8ca1-4ebc-bf95-950c4ce0a232520400005303986540549.905802BR5915CARONA_CASH_LTDA6009SAO_PAULO62070503***6304ED1D";
    const qrCodeMockPlaceholder = "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=" + encodeURIComponent(pixCopiaECola);

    res.json({
      msg: 'Checkout Pix gerado!',
      valor: 49.90,
      pixCopiaECola,
      qrCode: qrCodeMockPlaceholder
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Callback/Webhook PIX para liquidação com liberação automática
app.get('/api/motoristas/confirmar-assinatura', authenticateToken, authorizeRoles('MOTORISTA'), async (req, res) => {
  try {
    const motorista = await prisma.motorista.findFirst({ where: { userId: req.user.id } });
    if (!motorista) return res.status(404).json({ error: 'Motorista inválido' });

    await prisma.motorista.update({
      where: { id: motorista.id },
      data: { mensalidadePaga: true }
    });

    await prisma.user.update({
      where: { id: req.user.id },
      data: { status: 'ATIVO' } // Passa a estar ATIVO e liberado para corridas
    });

    res.json({ status: 'PAGO_COM_SUCESSO', message: 'Licença Carona Cash ativada!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// ==========================================
// SISTEMA DE SOLICITAÇÃO E FLUXO DE CORRIDAS
// ==========================================

// Criar nova Solicitação de Corrida (Cliente)
app.post('/api/corridas/solicitar', authenticateToken, authorizeRoles('CLIENTE'), async (req, res) => {
  const { origem, destino, latitude, longitude, valor, distancia } = req.body;
  try {
    const cliente = await prisma.cliente.findFirst({ where: { userId: req.user.id } });
    if (!cliente) return res.status(404).json({ error: 'Cadastro de passageiro correspondente não localizado!' });

    if (valor < 7.0) {
      return res.status(400).json({ error: 'O valor mínimo estabelecido por corrida é de R$ 7,00!' });
    }

    const corrida = await prisma.corridas.create({
      data: {
        clienteId: cliente.id,
        origem,
        destino,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        valor: parseFloat(valor),
        status: 'SOLICITADA'
      },
      include: { cliente: { include: { user: true } } }
    });

    // Enviar sinal em tempo real para os motoristas próximos via Socket.IO
    io.emit('nova_corrida_disponivel', {
      id: corrida.id,
      clienteNome: corrida.cliente.user.nome,
      origem: corrida.origem,
      destino: corrida.destino,
      valor: corrida.valor,
      distancia: distancia
    });

    res.json(corrida);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar corrida: ' + error.message });
  }
});

// Aceitar Corrida (Motorista)
app.post('/api/corridas/:id/aceitar', authenticateToken, authorizeRoles('MOTORISTA'), async (req, res) => {
  const { id } = req.params;
  try {
    const userObj = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { motorista: true }
    });

    if (userObj.status !== 'ATIVO' || !userObj.motorista.mensalidadePaga) {
      return res.status(403).json({ error: 'Apenas motoristas com aprovação nos documentos E licença ativa com status pago podem receber corridas!' });
    }

    const corridaCheck = await prisma.corridas.findUnique({ where: { id } });
    if (corridaCheck.status !== 'SOLICITADA') {
      return res.status(400).json({ error: 'Esta corrida já foi aceita por outro motorista parceiro!' });
    }

    const corrida = await prisma.corridas.update({
      where: { id },
      data: {
        motoristaId: userObj.motorista.id,
        status: 'MOTORISTA_A_CAMINHO'
      },
      include: { cliente: { include: { user: true } } }
    });

    // Notificar cliente do motorista aceito em tempo real
    io.emit(`corrida_atualizada_${corrida.id}`, {
      status: 'MOTORISTA_A_CAMINHO',
      motoristaNome: userObj.nome,
      motoristaTelefone: userObj.telefone
    });

    res.json(corrida);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Socket.IO conexões para GPS tempo real das corridas
io.on('connection', (socket) => {
  console.log('Dispositivo conectado ao Carona Cash Socket ID:', socket.id);

  // Recebe localização em tempo real do motorista e retransmite ao cliente da corrida
  socket.on('atualizar_localizacao_motorista', (data) => {
    // data: { corridaId, lat, lng }
    io.emit(`localizacao_motorista_${data.corridaId}`, {
      lat: data.lat,
      lng: data.lng
    });
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

// Executando Servidor
server.listen(PORT, () => {
  console.log(`Carona Cash backend atendendo na porta ${PORT}`);
});
