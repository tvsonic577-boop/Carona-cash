/**
 * Types representing Carona Cash entities.
 * These match the Prisma schemas and are used throughout the frontend.
 */

export type UserType = 'CLIENTE' | 'MOTORISTA' | 'ADMINISTRADOR';

export type UserStatus = 'PENDENTE_APROVACAO' | 'AGUARDANDO_PAGAMENTO' | 'ATIVO' | 'BLOQUEADO';

export interface User {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  tipo: UserType;
  status: UserStatus;
  createdAt: string;
  avatar?: string;
}

export interface Cliente {
  id: string;
  userId: string;
  cpf: string;
  endereco: string;
  cidade: string;
}

export interface Veiculo {
  marca: string;
  modelo: string;
  ano: number;
  cor: string;
  placa: string;
}

export interface Documentos {
  cnhFrente: string; // URL / base64 placeholder
  comprovanteEndereco: string; // URL / base64 placeholder
  veiculoFrente: string;
  veiculoLateral: string;
  veiculoTraseira: string;
}

export interface Motorista {
  id: string;
  userId: string;
  cpf: string;
  endereco: string;
  cidade: string;
  documentoStatus: 'PENDENTE' | 'APROVADO' | 'REJEITADO';
  isSubscriptionPaid: boolean;
  veiculo: Veiculo;
  documentos: Documentos;
}

export type CorridaStatus = 
  | 'SOLICITADA' 
  | 'MOTORISTA_A_CAMINHO' 
  | 'EM_ANDAMENTO' 
  | 'CONCLUIDA' 
  | 'CANCELADA';

export interface Corrida {
  id: string;
  clienteId: string;
  clienteNome: string;
  clienteTelefone: string;
  motoristaId?: string;
  motoristaNome?: string;
  motoristaPlaca?: string;
  motoristaModelo?: string;
  motoristaAvatar?: string;
  origem: string;
  destino: string;
  origemCoords: { lat: number; lng: number };
  destinoCoords: { lat: number; lng: number };
  distancia: number; // em km
  duracao: number; // em minutos
  valor: number; // em R$ (minimo R$ 7,00)
  status: CorridaStatus;
  currentDriverCoords?: { lat: number; lng: number };
  isTaximetroRide?: boolean;
  taximetroActive?: boolean;
  distanciaPercorrida?: number;
  createdAt: string;
}

export interface CidadeAtendida {
  id: string;
  nome: string;
  estado: string;
  status: 'ATIVO' | 'INATIVO';
}

export interface PlataformaConfig {
  precoBase: number;
  precoKm: number;
  taxaAtivacaoMotorista: number;
  comissaoPercentual: number;
}

export interface Franqueado {
  id: string;
  nome: string;
  cidade: string;
  email: string;
  telefone: string;
  valorFixoPorCorrida: number; // Valor fixo por corrida concluída repassado ao dono
  status: 'ATIVO' | 'BLOQUEADO';
  createdAt: string;
}
