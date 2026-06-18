import { User, Cliente, Motorista, Corrida, CidadeAtendida, PlataformaConfig, Franqueado } from './types';

export const INITIAL_CONFIG: PlataformaConfig = {
  precoBase: 5.0,
  precoKm: 2.5,
  taxaAtivacaoMotorista: 49.90,
  comissaoPercentual: 15.0,
};

export const INITIAL_CIDADES: CidadeAtendida[] = [
  { id: '1', nome: 'São Paulo', estado: 'SP', status: 'ATIVO' },
  { id: '2', nome: 'Campinas', estado: 'SP', status: 'ATIVO' },
  { id: '3', nome: 'Rio de Janeiro', estado: 'RJ', status: 'ATIVO' },
  { id: '4', nome: 'Belo Horizonte', estado: 'MG', status: 'ATIVO' },
  { id: '5', nome: 'Itaberaí', estado: 'GO', status: 'ATIVO' },
  { id: 'go-2', nome: 'Goiânia', estado: 'GO', status: 'ATIVO' },
  { id: 'go-3', nome: 'Anápolis', estado: 'GO', status: 'ATIVO' },
  { id: 'go-4', nome: 'Aparecida de Goiânia', estado: 'GO', status: 'ATIVO' },
  { id: 'go-5', nome: 'Rio Verde', estado: 'GO', status: 'ATIVO' },
  { id: 'go-6', nome: 'Luziânia', estado: 'GO', status: 'ATIVO' },
  { id: 'go-7', nome: 'Valparaíso de Goiás', estado: 'GO', status: 'ATIVO' },
  { id: 'go-8', nome: 'Trindade', estado: 'GO', status: 'ATIVO' },
  { id: 'go-9', nome: 'Formosa', estado: 'GO', status: 'ATIVO' },
  { id: 'go-10', nome: 'Senador Canedo', estado: 'GO', status: 'ATIVO' },
  { id: 'go-11', nome: 'Catalão', estado: 'GO', status: 'ATIVO' },
  { id: 'go-12', nome: 'Itumbiara', estado: 'GO', status: 'ATIVO' },
  { id: 'go-13', nome: 'Jataí', estado: 'GO', status: 'ATIVO' },
  { id: 'go-14', nome: 'Caldas Novas', estado: 'GO', status: 'ATIVO' },
  { id: 'go-15', nome: 'Planaltina', estado: 'GO', status: 'ATIVO' },
  { id: 'go-16', nome: 'Goianésia', estado: 'GO', status: 'ATIVO' },
  { id: 'go-17', nome: 'Cidade de Goiás', estado: 'GO', status: 'ATIVO' },
  { id: 'go-18', nome: 'Inhumas', estado: 'GO', status: 'ATIVO' },
  { id: 'go-19', nome: 'Jaraguá', estado: 'GO', status: 'ATIVO' },
  { id: 'go-20', nome: 'Ceres', estado: 'GO', status: 'ATIVO' },
];

export const INITIAL_USERS: User[] = [
  {
    id: 'u-admin',
    nome: 'Carlos Oliveira',
    email: 'tvsonic577@gmail.com',
    telefone: '(11) 99999-1000',
    tipo: 'ADMINISTRADOR',
    status: 'ATIVO',
    createdAt: '2026-01-01T12:00:00.000Z',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
  },
  {
    id: 'u-cli-1',
    nome: 'Amanda Pinheiro Lima',
    email: 'amanda.lima@gmail.com',
    telefone: '(11) 98888-2021',
    tipo: 'CLIENTE',
    status: 'ATIVO',
    createdAt: '2026-05-10T10:30:00.000Z',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
  },
  {
    id: 'u-cli-2',
    nome: 'Carlos Eduardo Souza',
    email: 'carlos.du@yahoo.com.br',
    telefone: '(11) 97777-3344',
    tipo: 'CLIENTE',
    status: 'ATIVO',
    createdAt: '2026-05-15T08:15:00.000Z',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  },
  {
    id: 'u-mot-1',
    nome: 'Roberto Alencar Cavalcante',
    email: 'roberto.taxi@gmail.com',
    telefone: '(11) 96666-4455',
    tipo: 'MOTORISTA',
    status: 'ATIVO', // Approved & Paid
    createdAt: '2026-03-01T14:22:00.000Z',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
  },
  {
    id: 'u-mot-2',
    nome: 'Glória Medeiros Chaves',
    email: 'gloria.chaves@gmail.com',
    telefone: '(11) 95555-6677',
    tipo: 'MOTORISTA',
    status: 'AGUARDANDO_PAGAMENTO', // Approved, waits subscription pay
    createdAt: '2026-04-12T11:05:00.000Z',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
  },
  {
    id: 'u-mot-3',
    nome: 'Willian Santos Lima',
    email: 'willian.lima@outlook.com',
    telefone: '(11) 94444-8899',
    tipo: 'MOTORISTA',
    status: 'PENDENTE_APROVACAO', // Waiting approvals
    createdAt: '2026-06-01T09:12:00.000Z',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
  },
  {
    id: 'u-cli-go',
    nome: 'Mariana Gomes (Goiás)',
    email: 'mariana.goias@gmail.com',
    telefone: '(62) 98888-7711',
    tipo: 'CLIENTE',
    status: 'ATIVO',
    createdAt: '2026-06-16T10:00:00.000Z',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  },
  {
    id: 'u-mot-go',
    nome: 'Felipe Goiano (Goiás)',
    email: 'felipe.driver@gmail.com',
    telefone: '(62) 97777-6622',
    tipo: 'MOTORISTA',
    status: 'ATIVO',
    createdAt: '2026-06-16T10:00:00.000Z',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
  }
];

export const INITIAL_CLIENTES: Cliente[] = [
  {
    id: 'c-1',
    userId: 'u-cli-1',
    cpf: '123.456.789-01',
    endereco: '',
    cidade: 'Itaberaí',
  },
  {
    id: 'c-2',
    userId: 'u-cli-2',
    cpf: '987.654.321-02',
    endereco: '',
    cidade: 'Itaberaí',
  },
  {
    id: 'c-go',
    userId: 'u-cli-go',
    cpf: '456.789.012-34',
    endereco: '',
    cidade: 'Itaberaí',
  }
];

export const INITIAL_MOTORISTAS: Motorista[] = [
  {
    id: 'm-1',
    userId: 'u-mot-1',
    cpf: '111.222.333-44',
    endereco: 'Rua das Flores, 12 - Tatuapé',
    cidade: 'São Paulo',
    documentoStatus: 'APROVADO',
    isSubscriptionPaid: true,
    veiculo: {
      marca: 'Toyota',
      modelo: 'Corolla',
      ano: 2018,
      cor: 'Prata',
      placa: 'QQX-3A45',
    },
    documentos: {
      cnhFrente: 'https://example.com/docs/cnh1.jpg',
      comprovanteEndereco: 'https://example.com/docs/comp1.jpg',
      veiculoFrente: 'https://example.com/docs/vf1.jpg',
      veiculoLateral: 'https://example.com/docs/vl1.jpg',
      veiculoTraseira: 'https://example.com/docs/vt1.jpg',
    }
  },
  {
    id: 'm-2',
    userId: 'u-mot-2',
    cpf: '555.666.777-88',
    endereco: 'Av. Rebouças, 1800 - Pinheiros',
    cidade: 'São Paulo',
    documentoStatus: 'APROVADO',
    isSubscriptionPaid: false,
    veiculo: {
      marca: 'Chevrolet',
      modelo: 'Onix',
      ano: 2020,
      cor: 'Branco',
      placa: 'BRA-2E19',
    },
    documentos: {
      cnhFrente: 'https://example.com/docs/cnh2.jpg',
      comprovanteEndereco: 'https://example.com/docs/comp2.jpg',
      veiculoFrente: 'https://example.com/docs/vf2.jpg',
      veiculoLateral: 'https://example.com/docs/vl2.jpg',
      veiculoTraseira: 'https://example.com/docs/vt2.jpg',
    }
  },
  {
    id: 'm-3',
    userId: 'u-mot-3',
    cpf: '999.888.777-66',
    endereco: 'Rua Voluntários da Pátria, 88 - Santana',
    cidade: 'São Paulo',
    documentoStatus: 'PENDENTE',
    isSubscriptionPaid: false,
    veiculo: {
      marca: 'Fiat',
      modelo: 'Cronos',
      ano: 2021,
      cor: 'Preto',
      placa: 'CAR-0C45',
    },
    documentos: {
      cnhFrente: 'https://example.com/docs/cnh3.jpg',
      comprovanteEndereco: 'https://example.com/docs/comp3.jpg',
      veiculoFrente: 'https://example.com/docs/vf3.jpg',
      veiculoLateral: 'https://example.com/docs/vl3.jpg',
      veiculoTraseira: 'https://example.com/docs/vt3.jpg',
    }
  },
  {
    id: 'm-go',
    userId: 'u-mot-go',
    cpf: '888.777.666-55',
    endereco: 'Rua das Flores, 45 - Centro',
    cidade: 'Itaberaí',
    documentoStatus: 'APROVADO',
    isSubscriptionPaid: true,
    veiculo: {
      marca: 'Fiat',
      modelo: 'Uno',
      ano: 2015,
      cor: 'Prata',
      placa: 'GOI-9F12',
    },
    documentos: {
      cnhFrente: 'https://example.com/docs/cnh3.jpg',
      comprovanteEndereco: 'https://example.com/docs/comp3.jpg',
      veiculoFrente: 'https://example.com/docs/vf3.jpg',
      veiculoLateral: 'https://example.com/docs/vl3.jpg',
      veiculoTraseira: 'https://example.com/docs/vt3.jpg',
    }
  }
];

export const INITIAL_CORRIDAS: Corrida[] = [
  {
    id: 'cr-1',
    clienteId: 'c-1',
    clienteNome: 'Amanda Pinheiro Lima',
    clienteTelefone: '(11) 98888-2021',
    motoristaId: 'm-1',
    motoristaNome: 'Roberto Alencar Cavalcante',
    motoristaPlaca: 'QQX-3A45',
    motoristaModelo: 'Toyota Corolla (Prata)',
    motoristaAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    origem: 'Av. Paulista, 1000 - Bela Vista',
    destino: 'Av. Brigadeiro Faria Lima, 2232 - Itaim Bibi',
    origemCoords: { lat: -23.5615, lng: -46.6562 },
    destinoCoords: { lat: -23.5824, lng: -46.6868 },
    distancia: 5.8,
    duracao: 15,
    valor: 19.50,
    status: 'CONCLUIDA',
    createdAt: '2026-06-14T18:00:00.000Z',
  },
  {
    id: 'cr-2',
    clienteId: 'c-2',
    clienteNome: 'Carlos Eduardo Souza',
    clienteTelefone: '(11) 97777-3344',
    motoristaId: 'm-1',
    motoristaNome: 'Roberto Alencar Cavalcante',
    motoristaPlaca: 'QQX-3A45',
    motoristaModelo: 'Toyota Corolla (Prata)',
    motoristaAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    origem: 'Rua Augusta, 450 - Consolação',
    destino: 'Parque Ibirapuera, Portão 3 - Moema',
    origemCoords: { lat: -23.5505, lng: -46.6579 },
    destinoCoords: { lat: -23.5874, lng: -46.6576 },
    distancia: 4.1,
    duracao: 11,
    valor: 15.25,
    status: 'CONCLUIDA',
    createdAt: '2026-06-15T10:00:00.000Z',
  }
];

export const INITIAL_FRANQUEADOS: Franqueado[] = [
  {
    id: 'fr-1',
    nome: 'Carlos Mendes',
    cidade: 'Campinas',
    email: 'carlos@campinascarona.com.br',
    telefone: '(19) 98765-4321',
    valorFixoPorCorrida: 2.50,
    status: 'ATIVO',
    createdAt: '2026-06-10T14:30:00.000Z'
  },
  {
    id: 'fr-2',
    nome: 'Mariana Silva',
    cidade: 'Rio de Janeiro',
    email: 'mariana@rjcarona.com.br',
    telefone: '(21) 99888-7766',
    valorFixoPorCorrida: 3.50,
    status: 'ATIVO',
    createdAt: '2026-06-11T09:15:00.000Z'
  },
  {
    id: 'fr-3',
    nome: 'Fernando Souza',
    cidade: 'Belo Horizonte',
    email: 'fernando@bhcarona.com.br',
    telefone: '(31) 98877-6655',
    valorFixoPorCorrida: 2.00,
    status: 'BLOQUEADO',
    createdAt: '2026-06-12T11:00:00.000Z'
  }
];

