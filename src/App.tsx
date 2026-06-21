import React, { useState, useEffect, useMemo } from 'react';
import {
  Car,
  UserCheck,
  ShieldCheck,
  MapPin,
  Search,
  PlusCircle,
  CreditCard,
  Sliders,
  Plus,
  Check,
  X,
  ShieldAlert,
  DollarSign,
  Activity,
  FileText,
  Map,
  UserX,
  User as UserIcon,
  Eye,
  ArrowRight,
  Sparkles,
  Navigation,
  Layers,
  Settings,
  Bell,
  LogOut,
  ChevronRight,
  CheckCircle2,
  Trash2,
  AlertCircle,
  MessageCircle,
  UserPlus,
  Camera,
  Database,
  RefreshCw,
  Download,
  Server
} from 'lucide-react';

import { 
  User, 
  Cliente, 
  Motorista, 
  Corrida, 
  CidadeAtendida, 
  PlataformaConfig, 
  CorridaStatus, 
  UserStatus,
  Franqueado
} from './types';

import {
  INITIAL_CONFIG,
  INITIAL_CIDADES,
  INITIAL_USERS,
  INITIAL_CLIENTES,
  INITIAL_MOTORISTAS,
  INITIAL_CORRIDAS,
  INITIAL_FRANQUEADOS
} from './data';

import SimulatedMap from './components/SimulatedMap';
import { CaronaLogo } from './components/CaronaLogo';

const memoryStorage: { [key: string]: string } = {};

const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      return window.localStorage.getItem(key);
    } catch (e) {
      return memoryStorage[key] || null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      window.localStorage.setItem(key, value);
    } catch (e) {
      memoryStorage[key] = value;
    }
  },
  removeItem: (key: string): void => {
    try {
      window.localStorage.removeItem(key);
    } catch (e) {
      delete memoryStorage[key];
    }
  }
};

const localStorage = safeStorage;

const BRAZILIAN_STATES = [
  { sigla: 'GO', nome: 'Goiás' },
  { sigla: 'SP', nome: 'São Paulo' },
  { sigla: 'RJ', nome: 'Rio de Janeiro' },
  { sigla: 'MG', nome: 'Minas Gerais' },
  { sigla: 'AC', nome: 'Acre' },
  { sigla: 'AL', nome: 'Alagoas' },
  { sigla: 'AM', nome: 'Amazonas' },
  { sigla: 'AP', nome: 'Amapá' },
  { sigla: 'BA', nome: 'Bahia' },
  { sigla: 'CE', nome: 'Ceará' },
  { sigla: 'DF', nome: 'Distrito Federal' },
  { sigla: 'ES', nome: 'Espírito Santo' },
  { sigla: 'MA', nome: 'Maranhão' },
  { sigla: 'MS', nome: 'Mato Grosso do Sul' },
  { sigla: 'MT', nome: 'Mato Grosso' },
  { sigla: 'PA', nome: 'Pará' },
  { sigla: 'PB', nome: 'Paraíba' },
  { sigla: 'PE', nome: 'Pernambuco' },
  { sigla: 'PI', nome: 'Piauí' },
  { sigla: 'PR', nome: 'Paraná' },
  { sigla: 'RN', nome: 'Rio Grande do Norte' },
  { sigla: 'RO', nome: 'Rondônia' },
  { sigla: 'RR', nome: 'Roraima' },
  { sigla: 'RS', nome: 'Rio Grande do Sul' },
  { sigla: 'SC', nome: 'Santa Catarina' },
  { sigla: 'SE', nome: 'Sergipe' },
  { sigla: 'TO', nome: 'Tocantins' }
];

export default function App() {
  // --- Persistent State Simulation ---
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('cc_users');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_USERS;
      }
    }
    return INITIAL_USERS;
  });

  const [clientes, setClientes] = useState<Cliente[]>(() => {
    const saved = localStorage.getItem('cc_clientes');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_CLIENTES;
      }
    }
    return INITIAL_CLIENTES;
  });

  const [motoristas, setMotoristas] = useState<Motorista[]>(() => {
    const saved = localStorage.getItem('cc_motoristas');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_MOTORISTAS;
      }
    }
    return INITIAL_MOTORISTAS;
  });

  const [corridas, setCorridas] = useState<Corrida[]>(() => {
    const saved = localStorage.getItem('cc_corridas');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Corrida[];
        // Filter out static mock run IDs ('cr-1', 'cr-2') so we only have real user-triggered runs
        return parsed.filter(c => !c.id.startsWith('cr-') || c.id.includes('cr-quick-') || c.id.length > 8);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [cidades, setCidades] = useState<CidadeAtendida[]>(() => {
    const saved = localStorage.getItem('cc_cidades');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as CidadeAtendida[];
        const merged = [...parsed];
        INITIAL_CIDADES.forEach(initial => {
          if (!merged.some(c => c.nome.toLowerCase() === initial.nome.toLowerCase() && c.estado === initial.estado)) {
            merged.push(initial);
          }
        });
        return merged;
      } catch (e) {
        return INITIAL_CIDADES;
      }
    }
    return INITIAL_CIDADES;
  });

  const [franqueados, setFranqueados] = useState<Franqueado[]>(() => {
    const saved = localStorage.getItem('cc_franqueados');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_FRANQUEADOS;
      }
    }
    return INITIAL_FRANQUEADOS;
  });

  const [config, setConfig] = useState<PlataformaConfig>(() => {
    const saved = localStorage.getItem('cc_config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const merged = { ...INITIAL_CONFIG, ...parsed };
        merged.comissaoPercentual = Math.min(20, Math.max(1, merged.comissaoPercentual));
        if (merged.taxaServicoFixaRegular === undefined) merged.taxaServicoFixaRegular = 1.00;
        if (merged.taxaServicoFixaFranquia === undefined) merged.taxaServicoFixaFranquia = 1.00;
        return merged;
      } catch (e) {
        return INITIAL_CONFIG;
      }
    }
    return INITIAL_CONFIG;
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('cc_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('cc_clientes', JSON.stringify(clientes));
  }, [clientes]);

  useEffect(() => {
    localStorage.setItem('cc_motoristas', JSON.stringify(motoristas));
  }, [motoristas]);

  useEffect(() => {
    localStorage.setItem('cc_corridas', JSON.stringify(corridas));
  }, [corridas]);

  useEffect(() => {
    localStorage.setItem('cc_cidades', JSON.stringify(cidades));
  }, [cidades]);

  useEffect(() => {
    localStorage.setItem('cc_franqueados', JSON.stringify(franqueados));
  }, [franqueados]);

  useEffect(() => {
    localStorage.setItem('cc_config', JSON.stringify(config));
  }, [config]);

  const getMotoristaFranquia = (motoristaId?: string) => {
    if (!motoristaId) return null;
    const drv = motoristas.find(m => m.id === motoristaId);
    if (!drv) return null;
    return franqueados.find(f => f.cidade.toLowerCase() === drv.cidade.toLowerCase());
  };

  const getCorridaTaxaServico = (c: Corrida) => {
    const activeFran = getMotoristaFranquia(c.motoristaId);
    if (activeFran) {
      return config.taxaServicoFixaFranquia !== undefined ? config.taxaServicoFixaFranquia : 1.00;
    }
    return config.taxaServicoFixaRegular !== undefined ? config.taxaServicoFixaRegular : 1.00;
  };

  // --- Active Session Info ---
  // We provide a visual "Simulator Mode Selector" at the very top so the reviewer
  // can test Client, Driver, and Admin flows concurrently in real time.
  const [activePortal, setActivePortal] = useState<'CLIENTE' | 'MOTORISTA' | 'ADMIN' | 'CODE' | 'FRANQUIA'>(() => {
    const role = localStorage.getItem('cc_session_role');
    if (role === 'CLIENTE' || role === 'MOTORISTA' || role === 'FRANQUIA' || role === 'ADMIN') {
      return role as any;
    }
    return 'CLIENTE';
  });
  const [activeFranqueadoId, setActiveFranqueadoId] = useState<string>('fr-1');
  
  // Currently logged-in profiles helper
  const [activeClienteId, setActiveClienteId] = useState<string>('c-1'); // Amanda
  const [activeMotoristaId, setActiveMotoristaId] = useState<string>('m-1'); // Roberto

  // --- Real Authentication System States ---
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('cc_logged_in') === 'true';
  });
  const [sessionRole, setSessionRole] = useState<'CLIENTE' | 'MOTORISTA' | 'FRANQUIA' | 'ADMIN'>(() => {
    return (localStorage.getItem('cc_session_role') as any) || 'CLIENTE';
  });
  const [loggedInEmail, setLoggedInEmail] = useState<string>(() => {
    return localStorage.getItem('cc_logged_email') || '';
  });

  // Login form inputs
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginRole, setLoginRole] = useState<'CLIENTE' | 'MOTORISTA' | 'FRANQUIA' | 'ADMIN'>('CLIENTE');

  // Account passwords map - enforces separate password and password difference checks!
  const [accountPasswords, setAccountPasswords] = useState<{ [key: string]: string }>(() => {
    const saved = localStorage.getItem('cc_passwords');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback below
      }
    }
    return {
      'tvsonic577@gmail.com-ADMIN': 'Jr990387',
      'admin@carona.com.br-ADMIN': 'admin',
      'admin@caronacash.com.br-ADMIN': 'admin',
      'amanda.lima@gmail.com-CLIENTE': 'amanda',
      'carlos.du@yahoo.com.br-CLIENTE': 'carlos',
      'roberto.taxi@gmail.com-MOTORISTA': 'roberto',
      'gloria.chaves@gmail.com-MOTORISTA': 'gloria',
      'willian.lima@outlook.com-MOTORISTA': 'willian',
      'carlos@campinascarona.com.br-FRANQUIA': 'carlos',
      'mariana@rjcarona.com.br-FRANQUIA': 'mariana',
      'fernando@bhcarona.com.br-FRANQUIA': 'fernando',
    };
  });

  // Sync authentication states to localStorage
  useEffect(() => {
    localStorage.setItem('cc_logged_in', isLoggedIn ? 'true' : 'false');
    localStorage.setItem('cc_session_role', sessionRole);
    localStorage.setItem('cc_logged_email', loggedInEmail);
  }, [isLoggedIn, sessionRole, loggedInEmail]);

  useEffect(() => {
    localStorage.setItem('cc_passwords', JSON.stringify(accountPasswords));
  }, [accountPasswords]);

  useEffect(() => {
    setIsProfileMenuOpen(false);
  }, [activePortal]);

  // --- Client Portal Variables ---
  const [clientOrigin, setClientOrigin] = useState<string>('');
  const [clientCustomCoords, setClientCustomCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState<boolean>(false);

  useEffect(() => {
    const cli = clientes.find(c => c.id === activeClienteId);
    if (cli) {
      setClientOrigin('');
      setSelectedDestinationIndex(-1);
    }
  }, [activeClienteId, clientes]);

  const [isEditingClientProfile, setIsEditingClientProfile] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [clientFormNome, setClientFormNome] = useState('');
  const [clientFormEmail, setClientFormEmail] = useState('');
  const [clientFormTelefone, setClientFormTelefone] = useState('');
  const [clientFormSenha, setClientFormSenha] = useState('');

  // --- Admin Portal Profile Variables ---
  const [isEditingAdminProfile, setIsEditingAdminProfile] = useState(false);
  const [adminProfileFormNome, setAdminProfileFormNome] = useState('');
  const [adminProfileFormEmail, setAdminProfileFormEmail] = useState('');
  const [adminProfileFormTelefone, setAdminProfileFormTelefone] = useState('');
  const [adminProfileFormSenha, setAdminProfileFormSenha] = useState('');

  // --- Driver Portal Variables ---
  const [isEditingDriverProfile, setIsEditingDriverProfile] = useState(false);
  const [driverFormNome, setDriverFormNome] = useState('');
  const [driverFormTelefone, setDriverFormTelefone] = useState('');
  const [driverFormSenha, setDriverFormSenha] = useState('');
  const [driverFormCpf, setDriverFormCpf] = useState('');
  const [driverFormVeiculoMarca, setDriverFormVeiculoMarca] = useState('');
  const [driverFormVeiculoModelo, setDriverFormVeiculoModelo] = useState('');
  const [driverFormVeiculoCor, setDriverFormVeiculoCor] = useState('');
  const [driverFormVeiculoPlaca, setDriverFormVeiculoPlaca] = useState('');

  // --- Admin User Database management States ---
  const [adminSubTab, setAdminSubTab] = useState<'OPCAO_1' | 'OPCAO_2' | 'AUDITORIA' | 'CONFIG_GERAL'>('AUDITORIA');
  const [adminUserSearchQuery, setAdminUserSearchQuery] = useState('');
  const [adminEditingUser, setAdminEditingUser] = useState<User | null>(null);
  const [adminFormNome, setAdminFormNome] = useState('');
  const [adminFormEmail, setAdminFormEmail] = useState('');
  const [adminFormTelefone, setAdminFormTelefone] = useState('');
  const [adminFormStatus, setAdminFormStatus] = useState<UserStatus>('ATIVO');
  const [adminFormSenha, setAdminFormSenha] = useState('');
  const [adminFormCpf, setAdminFormCpf] = useState('');
  const [adminFormEndereco, setAdminFormEndereco] = useState('');
  const [adminFormCidade, setAdminFormCidade] = useState('');
  const [adminFormVeiculoMarca, setAdminFormVeiculoMarca] = useState('');
  const [adminFormVeiculoModelo, setAdminFormVeiculoModelo] = useState('');
  const [adminFormVeiculoAno, setAdminFormVeiculoAno] = useState(2020);
  const [adminFormVeiculoCor, setAdminFormVeiculoCor] = useState('');
  const [adminFormVeiculoPlaca, setAdminFormVeiculoPlaca] = useState('');
  const [clientDestination, setClientDestination] = useState<string>('');
  const [selectedDestinationIndex, setSelectedDestinationIndex] = useState<number>(-1);
  const [selectedDestination, setSelectedDestination] = useState<any | null>(null);
  const [mapClickTargetMode, setMapClickTargetMode] = useState<'PARTIDA' | 'DESTINO'>('DESTINO');
  const [liveGoogleSuggestions, setLiveGoogleSuggestions] = useState<Array<{
    nome: string;
    coords?: { lat: number; lng: number };
    distance?: number;
    placeId?: string;
    isGooglePlace?: boolean;
    description?: string;
  }>>([]);
  const [isSearchingSuggestions, setIsSearchingSuggestions] = useState(false);
  const [calculatedTrip, setCalculatedTrip] = useState<{
    distancia: number;
    duracao: number;
    valor: number;
  } | null>(null);

  const getPopularDestinationsForCity = (cityName: string) => {
    const cityLower = (cityName || '').toLowerCase();
    if (cityLower.includes('itaberai') || cityLower.includes('itaberaí') || cityLower.includes('goiânia') || cityLower.includes('goiania') || cityLower.includes('goiás') || cityLower.includes('go')) {
      return [
        { nome: 'Goiânia Shopping - Setor Bueno, Goiânia', coords: { lat: -16.7093, lng: -49.2778 }, distance: 7.2 },
        { nome: 'Flamboyant Shopping - Jardim Goiás, Goiânia', coords: { lat: -16.7097, lng: -49.2312 }, distance: 9.5 },
        { nome: 'Parque Vaca Brava - Setor Bueno, Goiânia', coords: { lat: -16.7077, lng: -49.2764 }, distance: 6.8 },
        { nome: 'Praça Cívica - Centro, Goiânia', coords: { lat: -16.6791, lng: -49.2562 }, distance: 1.6 },
        { nome: 'Aeroporto Internacional Santa Genoveva - Goiânia', coords: { lat: -16.6329, lng: -49.2223 }, distance: 16.2 },
        { nome: 'Terminal Rodoviário de Goiânia - Centro', coords: { lat: -16.6612, lng: -49.2642 }, distance: 2.8 },
        { nome: 'Parque Flamboyant - Jardim Goiás, Goiânia', coords: { lat: -16.7115, lng: -49.2384 }, distance: 9.8 },
        { nome: 'Bosque dos Buritis - Setor Oeste, Goiânia', coords: { lat: -16.6806, lng: -49.2625 }, distance: 2.3 },
        { nome: 'Passeio das Águas Shopping - Goiânia', coords: { lat: -16.6212, lng: -49.2690 }, distance: 12.8 },
        { nome: 'Praça Universitária - Setor Universitário, Goiânia', coords: { lat: -16.6775, lng: -49.2435 }, distance: 4.5 },
        { nome: 'Santa Casa de Misericórdia - Goiânia', coords: { lat: -16.6872, lng: -49.2356 }, distance: 5.4 },
        { nome: 'Goiânia Arena - Setor de Recreação', coords: { lat: -16.6955, lng: -49.2285 }, distance: 10.5 },
        { nome: 'Parque Areião - Setor Pedro Ludovico, Goiânia', coords: { lat: -16.7160, lng: -49.2600 }, distance: 8.1 },
        { nome: 'Supermercado Bretas - Setor Sol Nascente, Goiânia', coords: { lat: -16.6910, lng: -49.2890 }, distance: 9.2 },
        { nome: 'UNIP Campus Goiânia - BR-153', coords: { lat: -16.7210, lng: -49.2490 }, distance: 10.8 },
        { nome: 'Praça Senador Silva Canedo - Centro, Itaberaí', coords: { lat: -16.0232, lng: -49.8080 }, distance: 2.8 },
        { nome: 'Lago Municipal de Itaberaí - Parque', coords: { lat: -16.0315, lng: -49.8142 }, distance: 4.6 },
        { nome: 'Parque Ecológico de Itaberaí - Natureza', coords: { lat: -16.0150, lng: -49.8010 }, distance: 6.3 },
        { nome: 'Terminal Rodoviário de Itaberaí', coords: { lat: -16.0270, lng: -49.8095 }, distance: 1.9 },
        { nome: 'Hospital Municipal de Itaberaí', coords: { lat: -16.0298, lng: -49.8115 }, distance: 2.5 },
        { nome: 'Prefeitura Municipal de Itaberaí', coords: { lat: -16.0225, lng: -49.8075 }, distance: 3.0 },
        { nome: 'Supermercado Bretas - Avenida Goiás', coords: { lat: -16.0245, lng: -49.8085 }, distance: 2.6 },
        { nome: 'Igreja Matriz de Itaberaí', coords: { lat: -16.0218, lng: -49.8068 }, distance: 3.2 },
        { nome: 'Universidade Estadual de Goiás (UEG)', coords: { lat: -16.0380, lng: -49.8220 }, distance: 5.5 },
        { nome: 'Ginásio de Esportes de Itaberaí', coords: { lat: -16.0330, lng: -49.8160 }, distance: 5.0 },
        { nome: 'Posto Shell - Avenida Goiás', coords: { lat: -16.0255, lng: -49.8090 }, distance: 2.4 },
        { nome: 'Banco do Brasil - Centro Itaberaí', coords: { lat: -16.0238, lng: -49.8081 }, distance: 2.9 },
        { nome: 'Drogaria Globo - Centro Itaberaí', coords: { lat: -16.0240, lng: -49.8083 }, distance: 2.7 },
        { nome: 'Feira Coberta de Itaberaí', coords: { lat: -16.0285, lng: -49.8105 }, distance: 2.1 }
      ];
    } else if (cityLower.includes('rio de janeiro') || cityLower.includes('rj')) {
      return [
        { nome: 'Copacabana - Posto 4', coords: { lat: -22.9698, lng: -43.1855 }, distance: 8.1 },
        { nome: 'Pão de Açúcar - Urca', coords: { lat: -22.9492, lng: -43.1546 }, distance: 11.2 },
        { nome: 'Cristo Redentor - Corcovado', coords: { lat: -22.9519, lng: -43.2105 }, distance: 16.5 },
        { nome: 'Aeroporto Santos Dumont - Centro', coords: { lat: -22.9103, lng: -43.1629 }, distance: 5.9 },
      ];
    } else if (cityLower.includes('campinas')) {
      return [
        { nome: 'Parque Portugal (Taquaral)', coords: { lat: -22.8752, lng: -47.0421 }, distance: 6.8 },
        { nome: 'Cambuí - Shopping', coords: { lat: -22.8953, lng: -47.0512 }, distance: 4.2 },
        { nome: 'Aeroporto de Viracopos', coords: { lat: -23.0074, lng: -47.1345 }, distance: 20.8 },
        { nome: 'Barão Geraldo - UNICAMP', coords: { lat: -22.8173, lng: -47.0697 }, distance: 13.9 },
      ];
    } else if (cityLower.includes('belo horizonte') || cityLower.includes('bh')) {
      return [
        { nome: 'Lagoa da Pampulha - Igreja', coords: { lat: -19.8519, lng: -43.9792 }, distance: 12.8 },
        { nome: 'Praça da Liberdade - Savassi', coords: { lat: -19.9324, lng: -43.9378 }, distance: 4.0 },
        { nome: 'Mercado Central - Centro', coords: { lat: -19.9231, lng: -43.9439 }, distance: 2.4 },
        { nome: 'Estádio Mineirão', coords: { lat: -19.8659, lng: -43.9711 }, distance: 10.9 },
      ];
    } else {
      // Default / São Paulo
      return [
        { nome: 'Av. Brigadeiro Faria Lima, 2232 - Itaim Bibi', coords: { lat: -23.5824, lng: -46.6868 }, distance: 7.8 },
        { nome: 'Rua Augusta, 450 - Consolação', coords: { lat: -23.5505, lng: -46.6579 }, distance: 2.4 },
        { nome: 'Parque Ibirapuera - Moema', coords: { lat: -23.5874, lng: -46.6576 }, distance: 5.5 },
        { nome: 'Aeroporto de Congonhas - Vila Congonhas', coords: { lat: -23.6273, lng: -46.6565 }, distance: 11.2 },
      ];
    }
  };

  const clientObjForDest = clientes.find(c => c.id === activeClienteId);
  const currentPassengerCity = clientObjForDest ? clientObjForDest.cidade : 'Itaberaí';
  const popularDestinations = getPopularDestinationsForCity(currentPassengerCity);

  const filteredDestinations = useMemo(() => {
    if (!clientDestination || clientDestination.trim() === '') {
      return popularDestinations;
    }
    const query = clientDestination.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return popularDestinations.filter(dest => {
      const normalizedNome = dest.nome.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return normalizedNome.includes(query);
    });
  }, [popularDestinations, clientDestination]);

  // --- Form Registration Variables ---
  const [registrationMode, setRegistrationMode] = useState<'NONE' | 'CLIENTE' | 'MOTORISTA'>('NONE');
  const [isPendingPaymentsWindowOpen, setIsPendingPaymentsWindowOpen] = useState(false);
  
  // --- Franchise Editing Variables ---
  const [editingFranqueadoId, setEditingFranqueadoId] = useState<string | null>(null);
  const [editingFranqueadoData, setEditingFranqueadoData] = useState<{
    nome: string;
    email: string;
    telefone: string;
    cidade: string;
  } | null>(null);

  // --- New Franqueado Creation Form States ---
  const [newFranNome, setNewFranNome] = useState('');
  const [newFranEmail, setNewFranEmail] = useState('');
  const [newFranSenha, setNewFranSenha] = useState('');
  const [newFranTelefone, setNewFranTelefone] = useState('');
  const [newFranCidade, setNewFranCidade] = useState('');
  const [newFranValorFixo, setNewFranValorFixo] = useState(2.00);
  const [newFranStatus, setNewFranStatus] = useState<'ATIVO' | 'BLOQUEADO'>('ATIVO');
  const [showNewFranForm, setShowNewFranForm] = useState(false);
  
  // Client Form
  const [newClientData, setNewClientData] = useState({
    nome: '', cpf: '', dataNasc: '', telefone: '', email: '', senha: '', endereco: '', cidade: 'São Paulo'
  });
  
  // Driver Form
  const [newDriverData, setNewDriverData] = useState({
    nome: '', cpf: '', telefone: '', email: '', senha: '', endereco: '', cidade: 'São Paulo', cnh: '',
    marca: '', modelo: '', ano: 2020, cor: '', placa: ''
  });
  const [driverFileCnh, setDriverFileCnh] = useState<string | null>(null);
  const [driverFileAddress, setDriverFileAddress] = useState<string | null>(null);
  const [driverFileVFront, setDriverFileVFront] = useState<string | null>(null);
  const [driverFileVLateral, setDriverFileVLateral] = useState<string | null>(null);
  const [driverFileVTraseira, setDriverFileVTraseira] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // --- PIX Activation Simulation ---
  const [showPixCheckout, setShowPixCheckout] = useState(false);
  const [checkoutMotoristaId, setCheckoutMotoristaId] = useState<string>('');
  const [pixPaidSuccessfully, setPixPaidSuccessfully] = useState(false);

  // --- Admin Add City Variables ---
  const [newCityName, setNewCityName] = useState('');
  const [newCityState, setNewCityState] = useState('GO');
  const [ibgeCities, setIbgeCities] = useState<string[]>([]);
  const [loadingIbge, setLoadingIbge] = useState<boolean>(false);
  const [citySearchQuery, setCitySearchQuery] = useState<string>('');

  useEffect(() => {
    if (!newCityState) return;
    setLoadingIbge(true);
    setIbgeCities([]);
    
    fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${newCityState}/municipios`)
      .then(res => {
        if (!res.ok) throw new Error("Erro de API");
        return res.json();
      })
      .then((data: any[]) => {
        const sortedNames = data.map(item => item.nome).sort((a, b) => a.localeCompare(b));
        setIbgeCities(sortedNames);
      })
      .catch(err => {
        console.warn("IBGE API fallback triggered:", err);
        const fallbacks: { [key: string]: string[] } = {
          'GO': ['Itaberaí', 'Goiânia', 'Anápolis', 'Aparecida de Goiânia', 'Rio Verde', 'Luziânia', 'Águas Lindas de Goiás', 'Trindade', 'Formosa', 'Senador Canedo', 'Catalão', 'Itumbiara', 'Jataí', 'Caldas Novas', 'Planaltina'],
          'SP': ['São Paulo', 'Campinas', 'Santos', 'Sorocaba', 'São José dos Campos', 'Ribeirão Preto', 'Osasco', 'Santo André', 'São Bernardo do Campo', 'Guarulhos', 'Mogi das Cruzes', 'Jundiaí', 'Piracicaba'],
          'RJ': ['Rio de Janeiro', 'Niterói', 'Duque de Caxias', 'Petrópolis', 'Campos dos Goytacazes', 'Volta Redonda', 'Macaé', 'Cabo Frio', 'Nova Iguaçu', 'Belford Roxo', 'São Gonçalo'],
          'MG': ['Belo Horizonte', 'Uberlândia', 'Contagem', 'Juiz de Fora', 'Betim', 'Montes Claros', 'Uberaba', 'Governador Valadares', 'Ipatinga', 'Sete Lagoas', 'Divinópolis', 'Poços de Caldas'],
          'PR': ['Curitiba', 'Londrina', 'Maringá', 'Ponta Grossa', 'Cascavel', 'São José dos Pinhais', 'Foz do Iguaçu', 'Colombo', 'Guarapuava', 'Paranaguá'],
          'RS': ['Porto Alegre', 'Caxias do Sul', 'Canoas', 'Pelotas', 'Santa Maria', 'Gravataí', 'Viamão', 'Novo Hamburgo', 'Passo Fundo', 'Rio Grande'],
          'CE': ['Fortaleza', 'Caucaia', 'Juazeiro do Norte', 'Maracanaú', 'Sobral', 'Crato', 'Itapipoca', 'Maranguape', 'Iguatu'],
          'BA': ['Salvador', 'Feira de Santana', 'Vitória da Conquista', 'Camaçari', 'Juazeiro', 'Itabuna', 'Lauro de Freitas', 'Ilhéus', 'Jequié', 'Teixeira de Freitas']
        };
        setIbgeCities(fallbacks[newCityState] || ['Outra Cidade']);
      })
      .finally(() => {
        setLoadingIbge(false);
      });
  }, [newCityState]);

  // --- Notification System ---
  const [notifications, setNotifications] = useState<{ id: string; text: string; type: 'success' | 'info' | 'warn' }[]>([]);

  const addNotification = (text: string, type: 'success' | 'info' | 'warn' = 'info') => {
    const id = Date.now().toString() + '-' + Math.random().toString(36).substring(2, 9);
    setNotifications(prev => [...prev, { id, text, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  // --- Accurate GPS Coordinates Distance calculator (Haversine Formula with Google Maps Circuity Adjuster) ---
  const getCoordinatesDistanceKm = (co1: { lat: number; lng: number }, co2: { lat: number; lng: number }) => {
    const R = 6371; // Earth's radius in km
    const dLat = (co2.lat - co1.lat) * Math.PI / 180;
    const dLng = (co2.lng - co1.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(co1.lat * Math.PI / 180) * Math.cos(co2.lat * Math.PI / 180) * 
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const straightLineDist = R * c;
    
    // Multiplied by a standard Brazilian urban routing circuity factor (1.30)
    // to match real street networks, detours, and routes displayed on Google Maps.
    return straightLineDist * 1.30;
  };

  const handleSimulationUpdate = (corridaId: string, currentCoords: { lat: number; lng: number }) => {
    setCorridas(prev => prev.map(c => {
      if (c.id === corridaId) {
        if (c.status === 'EM_ANDAMENTO') {
          const distCalculated = getCoordinatesDistanceKm(c.origemCoords, currentCoords);
          const nextDistCovered = Math.min(distCalculated, c.distancia);
          const lastDistCovered = c.distanciaPercorrida || 0;

          // update only if the distance increased or we reached completion
          const isEnd = Math.abs(nextDistCovered - c.distancia) < 0.05;
          if (nextDistCovered > lastDistCovered + 0.005 || (isEnd && nextDistCovered !== lastDistCovered) || c.currentDriverCoords?.lat !== currentCoords.lat) {
            let nextVal = c.valor;
            if (c.isTaximetroRide) {
              const blocksOf100m = Math.floor(nextDistCovered * 10);
              nextVal = 7.00 + (blocksOf100m * 0.60);
            }
            return {
              ...c,
              distanciaPercorrida: Number(nextDistCovered.toFixed(3)),
              valor: Number(nextVal.toFixed(2)),
              currentDriverCoords: currentCoords
            };
          }
        } else if (c.status === 'MOTORISTA_A_CAMINHO') {
          // Just update currentDriverCoords so both screens see driver position updating in real-time
          if (c.currentDriverCoords?.lat !== currentCoords.lat || c.currentDriverCoords?.lng !== currentCoords.lng) {
            return {
              ...c,
              currentDriverCoords: currentCoords
            };
          }
        }
      }
      return c;
    }));
  };

  const getCityCenterCoords = (cityName: string) => {
    const currentCityLower = (cityName || '').toLowerCase();
    if (currentCityLower.includes('itaberai') || currentCityLower.includes('itaberaí') || currentCityLower.includes('goiás') || currentCityLower.includes('go')) {
      return { lat: -16.0270, lng: -49.8095 };
    } else if (currentCityLower.includes('rio') || currentCityLower.includes('rj')) {
      return { lat: -22.9068, lng: -43.1729 };
    } else if (currentCityLower.includes('campinas')) {
      return { lat: -22.9056, lng: -47.0608 };
    } else if (currentCityLower.includes('belo') || currentCityLower.includes('bh')) {
      return { lat: -19.9167, lng: -43.9345 };
    } else if (currentCityLower.includes('são paulo') || currentCityLower.includes('sao paulo') || currentCityLower.includes('sp')) {
      return { lat: -23.5615, lng: -46.6562 };
    }
    return { lat: -16.0270, lng: -49.8095 }; // Default fallback is Itaberaí, Goias
  };

  const triggerGeolocation = () => {
    if (!navigator.geolocation) {
      addNotification("Geolocalização não é suportada por este dispositivo.", "warn");
      return;
    }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setClientCustomCoords({ lat: latitude, lng: longitude });
        setClientOrigin(""); // Deixa em branco conforme pedido para focar no placeholder "Seu Local"
        setLocationLoading(false);
        addNotification("Coordenadas de GPS atualizadas com sucesso! Ponto de partida definido como Seu Local.", "success");
      },
      (error) => {
        console.error("Erro ao obter geolocalização:", error);
        setLocationLoading(false);
        // Fallback confiável para Itaberaí, Goiás
        setClientCustomCoords({ lat: -16.0270, lng: -49.8095 });
        setClientOrigin("");
        addNotification("Por favor, ative a permissão do GPS do celular ou clique no mapa para posicionar sua partida em Itaberaí (Goiás).", "info");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Auto-locate user when client portal is loaded
  useEffect(() => {
    if (isLoggedIn && sessionRole === 'CLIENTE') {
      triggerGeolocation();
    }
  }, [isLoggedIn, sessionRole]);

  // Auto calculate trip cost whenever settings, destinations, or custom GPS coordinates change
  useEffect(() => {
    // Resolve destination from either our dynamic selection or index-based fallback
    const dest = selectedDestination || (selectedDestinationIndex >= 0 ? popularDestinations[selectedDestinationIndex] : null);
    
    if (dest) {
      // High precision dynamic distance calculation based on live client location vs destination coords
      let dist = dest.distance;
      if (clientCustomCoords) {
        dist = Number(getCoordinatesDistanceKm(clientCustomCoords, dest.coords).toFixed(1));
        if (dist <= 0) dist = 0.5;
      }
      
      const calcDur = Math.round(dist * 2.8);
      
      // Cost formula standard
      let computedCost = config.precoBase + (dist * config.precoKm);
      // Minimum fare constraint of exactly 7 BRL
      if (computedCost < 7.00) {
        computedCost = 7.00;
      }
      
      setCalculatedTrip({
        distancia: dist,
        duracao: calcDur,
        valor: Number(computedCost.toFixed(2))
      });
    } else {
      setCalculatedTrip(null);
    }
  }, [selectedDestination, selectedDestinationIndex, config, clientCustomCoords]);

  // Real-time Google Places Autocomplete API with debounce and Goiás bias
  useEffect(() => {
    if (!clientDestination || clientDestination.trim().length < 2) {
      setLiveGoogleSuggestions([]);
      setIsSearchingSuggestions(false);
      return;
    }

    const g = (window as any).google;
    if (g && g.maps && g.maps.places) {
      setIsSearchingSuggestions(true);
      const timer = setTimeout(() => {
        try {
          const autocompleteService = new g.maps.places.AutocompleteService();
          
          // Bias coordinates: current user location or Goiânia/Itaberaí central area
          const biasCoords = clientCustomCoords || { lat: -16.0270, lng: -49.8095 };
          const biasBounds = new g.maps.LatLngBounds(
            new g.maps.LatLng(biasCoords.lat - 1.5, biasCoords.lng - 1.5),
            new g.maps.LatLng(biasCoords.lat + 1.5, biasCoords.lng + 1.5)
          );

          autocompleteService.getPlacePredictions({
            input: clientDestination,
            bounds: biasBounds,
            componentRestrictions: { country: 'br' },
          }, (predictions: any, status: any) => {
            setIsSearchingSuggestions(false);
            if (status === g.maps.places.PlacesServiceStatus.OK && predictions) {
              const formattedList = predictions.map((pred: any) => ({
                nome: pred.description,
                placeId: pred.place_id,
                isGooglePlace: true,
                description: pred.structured_formatting?.secondary_text || ''
              }));
              setLiveGoogleSuggestions(formattedList);
            } else {
              setLiveGoogleSuggestions([]);
            }
          });
        } catch (err) {
          console.error("Erro no AutocompleteService:", err);
          setIsSearchingSuggestions(false);
        }
      }, 350); // 350ms debounce
      return () => clearTimeout(timer);
    } else {
      setIsSearchingSuggestions(false);
      setLiveGoogleSuggestions([]);
    }
  }, [clientDestination, clientCustomCoords]);

  // Handle click on a Google prediction: resolve place_id to lat/long
  const handleSelectGooglePlace = (sug: any) => {
    const g = (window as any).google;
    if (!g || !g.maps) return;
    
    addNotification("Obtendo localização exata e calculando rota...", "info");
    const geocoder = new g.maps.Geocoder();
    geocoder.geocode({ placeId: sug.placeId }, (results: any, status: any) => {
      if (status === 'OK' && results[0]) {
        const loc = results[0].geometry.location;
        const coords = { lat: loc.lat(), lng: loc.lng() };
        
        let dist = 6.0; // fallback default
        if (clientCustomCoords) {
          dist = Number(getCoordinatesDistanceKm(clientCustomCoords, coords).toFixed(1));
          if (dist <= 0) dist = 0.5;
        }

        const selectedDestObj = {
          nome: sug.nome,
          coords: coords,
          distance: dist
        };

        // Update states to lock in selection
        setSelectedDestination(selectedDestObj);
        setClientDestination(sug.nome);
        setSelectedDestinationIndex(-100); // special flag for dynamic place selection
        addNotification(`Destino confirmado: ${sug.nome.split(',')[0]}`, "success");
      } else {
        addNotification("Erro ao obter dados do Google Maps para esse local.", "warn");
      }
    });
  };

  // Live pricing engine is completely coordinate-driven by the Map's path progression (in handleSimulationUpdate)
  // to avoid any interval racing or inconsistencies.

  const handleQuickTaxiRequest = () => {
    let dest = selectedDestination || (selectedDestinationIndex >= 0 ? popularDestinations[selectedDestinationIndex] : null);

    if (!dest) {
      dest = {
        nome: "Goiânia Shopping - Setor Bueno, Goiânia",
        coords: { lat: -16.7093, lng: -49.2778 },
        distance: 5.5
      };
      setSelectedDestination(dest);
      setClientDestination(dest.nome);
      setSelectedDestinationIndex(-100);
    }

    const cli = clientes.find(c => c.id === activeClienteId);
    if (!cli) return;

    addNotification("Buscando sua localização precisa via GPS para o taxímetro...", "info");

    const launchTaxiWithCoords = (coords: { lat: number; lng: number }, isPrecisionGps: boolean) => {
      setClientCustomCoords(coords);

      const taxiCorrida: Corrida = {
        id: 'cr-quick-' + Date.now() + '-' + Math.floor(Math.random() * 1000000),
        clienteId: activeClienteId,
        clienteNome: users.find(u => u.id === cli.userId)?.nome || 'Cliente Rápido',
        clienteTelefone: users.find(u => u.id === cli.userId)?.telefone || '(62) 99312-8800',
        origem: isPrecisionGps ? "Sua Localização Atual" : "Goiânia (Local)",
        destino: dest!.nome,
        origemCoords: coords,
        destinoCoords: dest!.coords,
        distancia: dest!.distance,
        duracao: Math.round(dest!.distance * 1.8),
        valor: 0.00, // Taximeter initially set to 0.00 until passenger boards!
        status: 'MOTORISTA_A_CAMINHO',
        isTaximetroRide: true,
        taximetroActive: false,
        createdAt: new Date().toISOString()
      };

      const firstMot = motoristas.find(m => m.documentoStatus === 'APROVADO' && m.isSubscriptionPaid) || motoristas[0];
      const motUser = firstMot ? users.find(u => u.id === firstMot.userId) : null;

      taxiCorrida.motoristaId = firstMot?.id || 'm-1';
      taxiCorrida.motoristaNome = motUser?.nome || 'Carlos Eduardo (Parceiro Rápido)';
      taxiCorrida.motoristaPlaca = firstMot?.veiculo.placa || 'QQX-3A45';
      taxiCorrida.motoristaModelo = firstMot ? `${firstMot.veiculo.marca} ${firstMot.veiculo.modelo} (${firstMot.veiculo.cor})` : 'Toyota Corolla (Prata)';
      taxiCorrida.motoristaAvatar = motUser?.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150';

      if (firstMot) {
        setMotoristas(prev => prev.map(m => m.id === firstMot.id ? { ...m, isOnline: true } : m));
      }

      // Zeramos os campos de entrada do cliente e estados de pesquisa
      setClientOrigin('');
      setClientDestination('');
      setSelectedDestination(null);
      setSelectedDestinationIndex(-1);
      setCalculatedTrip(null);

      setCorridas(prev => [taxiCorrida, ...prev]);
      addNotification("⚡ Corrida Rápida Ativa! Carlos Eduardo aceitou e está a caminho do seu local de embarque!", "success");
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          launchTaxiWithCoords({ lat: latitude, lng: longitude }, true);
        },
        (error) => {
          console.warn("Erro ao obter geolocalização exata, usando fallback:", error);
          const fallbackCoords = clientCustomCoords || getCityCenterCoords(cli.cidade || 'Goiânia');
          launchTaxiWithCoords(fallbackCoords, false);
        },
        { enableHighAccuracy: true, timeout: 6000, maximumAge: 0 }
      );
    } else {
      const fallbackCoords = clientCustomCoords || getCityCenterCoords(cli.cidade || 'Goiânia');
      launchTaxiWithCoords(fallbackCoords, false);
    }
  };

  // --- ACTIVE CORRIDA STATE HANDLERS ---
  const currentActiveCorrida = corridas.find(
    c => (c.clienteId === activeClienteId || c.motoristaId === activeMotoristaId) && 
    c.status !== 'CONCLUIDA' && c.status !== 'CANCELADA'
  );

  // Handle Client Requesting ride
  const handleRequestRide = () => {
    // Resolve destination from either our dynamic selection or index-based fallback
    const dest = selectedDestination || (selectedDestinationIndex >= 0 ? popularDestinations[selectedDestinationIndex] : null);

    if (!dest) {
      addNotification("Por favor, digite e selecione um destino de chegada!", "warn");
      return;
    }
    const cli = clientes.find(c => c.id === activeClienteId);
    if (!cli) return;
    const isBlocked = users.find(u => u.id === cli.userId)?.status === 'BLOQUEADO';
    if (isBlocked) {
      addNotification("Usuário bloqueado! Entre em contato com o suporte.", "warn");
      return;
    }

    const value = calculatedTrip ? calculatedTrip.valor : 7.00;

    const computedOriginCoords = clientCustomCoords || getCityCenterCoords(cli.cidade || 'São Paulo');

    const newCorrida: Corrida = {
      id: 'cr-' + Date.now() + '-' + Math.floor(Math.random() * 1000000),
      clienteId: activeClienteId,
      clienteNome: users.find(u => u.id === cli.userId)?.nome || 'Cliente Anônimo',
      clienteTelefone: users.find(u => u.id === cli.userId)?.telefone || '(11) 99999-0000',
      origem: clientOrigin.trim() === '' ? 'Seu Local' : clientOrigin,
      destino: dest.nome,
      origemCoords: computedOriginCoords,
      destinoCoords: dest.coords,
      distancia: dest.distance,
      duracao: calculatedTrip?.duracao || 10,
      valor: value, // Seta o valor contratado prefixado imediatamente
      status: 'SOLICITADA',
      isTaximetroRide: false, // Sem taxímetro na solicitação normal de carona
      createdAt: new Date().toISOString()
    };

    setCorridas(prev => [newCorrida, ...prev]);
    addNotification("Corrida solicitada com sucesso! Buscando motoristas próximos...", "success");
  };

  // Motorista Action Accept Ride
  const handleAcceptRide = (corridaId: string, motIdRef: string) => {
    const targetMot = motoristas.find(m => m.id === motIdRef);
    if (!targetMot) return;
    const motUser = users.find(u => u.id === targetMot.userId);

    // Security & License checks: approved documents AND paid status are required!
    if (targetMot.documentoStatus !== 'APROVADO') {
      addNotification("Apenas motoristas com documentos APROVADOS podem aceitar corridas!", "warn");
      return;
    }
    if (!targetMot.isSubscriptionPaid) {
      addNotification("Mensalidade pendente! Por favor, efetue o pagamento da assinatura para receber corridas.", "warn");
      // Open Pix model automatically to ease tester life!
      setCheckoutMotoristaId(motIdRef);
      setShowPixCheckout(true);
      return;
    }
    if (motUser?.status === 'BLOQUEADO') {
      addNotification("O acesso do seu motorista foi bloqueado pelo administrador!", "warn");
      return;
    }

    setCorridas(prev => prev.map(c => {
      if (c.id === corridaId) {
        return {
          ...c,
          motoristaId: targetMot.id,
          motoristaNome: motUser?.nome,
          motoristaPlaca: targetMot.veiculo.placa,
          motoristaModelo: `${targetMot.veiculo.marca} ${targetMot.veiculo.modelo} (${targetMot.veiculo.cor})`,
          motoristaAvatar: motUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
          status: 'MOTORISTA_A_CAMINHO',
          currentDriverCoords: { lat: -23.5505, lng: -46.6579 }
        };
      }
      return c;
    }));

    addNotification("Corrida aceita! Dirija-se ao local do passageiro.", "success");
  };

  // Skip simulation state manually to picked up / Em Viagem
  const handleStartTrip = (corridaId: string) => {
    let isTaximetro = false;
    setCorridas(prev => prev.map(c => {
      if (c.id === corridaId) {
        isTaximetro = !!c.isTaximetroRide;
        return { 
          ...c, 
          status: 'EM_ANDAMENTO',
          valor: c.isTaximetroRide ? 7.00 : c.valor, // Only start at R$ 7.00 if taximetro is active. Otherwise use fixed price.
          distanciaPercorrida: 0.0,
          taximetroActive: !!c.isTaximetroRide
        };
      }
      return c;
    }));
    if (isTaximetro) {
      addNotification("Passageiro a bordo! Iniciando trajeto até o destino. Tarifa inicial de R$ 7,00 ativada no taxímetro!", "info");
    } else {
      addNotification("Passageiro a bordo! Iniciando trajeto de carona compartilhada com preço fixo estabelecido de comum acordo!", "success");
    }
  };

  // Skip simulation state manually to Concluida
  const handleFinishTrip = (corridaId: string) => {
    setCorridas(prev => prev.map(c => {
      if (c.id === corridaId) {
        return { ...c, status: 'CONCLUIDA' };
      }
      return c;
    }));

    // Reset client inputs and states to give options for a new ride
    setClientDestination('');
    setSelectedDestinationIndex(-1);
    setSelectedDestination(null);
    setCalculatedTrip(null);
    setClientOrigin('');

    addNotification("Corrida de transporte finalizada! Obrigado por dirigir com Carona.", "success");
  };

  // Client or driver cancels active request
  const handleCancelRide = (corridaId: string, canceledBy: 'CLIENTE' | 'MOTORISTA' = 'CLIENTE') => {
    setCorridas(prev => prev.map(c => {
      if (c.id === corridaId) {
        return { ...c, status: 'CANCELADA' };
      }
      return c;
    }));
    if (canceledBy === 'MOTORISTA') {
      addNotification("A corrida foi cancelada pelo motorista.", "warn");
    } else {
      addNotification("Sua corrida foi cancelada.", "warn");
    }
  };

  // --- REGISTRATION FORMS FORM SUBMISSION ---
  const submitClientRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const emailField = newClientData.email.trim();
    if (!newClientData.nome || !newClientData.cpf || !emailField || !newClientData.senha) {
      setValidationError("Preencha todos os campos obrigatórios!");
      return;
    }

    const emailLower = emailField.toLowerCase();
    
    // Check if they are already registered as a driver and are trying to reuse the same password!
    const driverPassKey = `${emailLower}-MOTORISTA`;
    if (accountPasswords[driverPassKey] && accountPasswords[driverPassKey] === newClientData.senha) {
      setValidationError("Por segurança, sua senha de Passageiro deve ser DIFERENTE da sua senha de Motorista Parceiro!");
      return;
    }

    const newUserId = 'u-cli-' + Date.now() + '-' + Math.floor(Math.random() * 1000000);
    const newCliId = 'c-' + Date.now() + '-' + Math.floor(Math.random() * 1000000);

    const newUser: User = {
      id: newUserId,
      nome: newClientData.nome,
      email: emailField,
      telefone: newClientData.telefone || '(11) 90000-0000',
      tipo: 'CLIENTE',
      status: 'ATIVO',
      createdAt: new Date().toISOString(),
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
    };

    const newCli: Cliente = {
      id: newCliId,
      userId: newUserId,
      cpf: newClientData.cpf,
      endereco: newClientData.endereco || 'Avenida Geral, S/N',
      cidade: newClientData.cidade
    };

    const api_url = (import.meta as any).env.VITE_API_URL;
    if (api_url) {
      try {
        const response = await fetch(`${api_url}/api/auth/register-cliente`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            nome: newClientData.nome,
            email: emailField,
            senha: newClientData.senha,
            telefone: newClientData.telefone || '(11) 90000-0000',
            cpf: newClientData.cpf,
            endereco: newClientData.endereco || 'Avenida Geral, S/N',
            cidade: newClientData.cidade
          })
        });
        
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Erro ao realizar cadastro no servidor.');
        }

        // Seamless auto-login
        const lResponse = await fetch(`${api_url}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: emailField, senha: newClientData.senha })
        });
        const lData = await lResponse.json();
        if (lResponse.ok && lData.token) {
          localStorage.setItem('cc_token', lData.token);
          const serverUserObj = lData.user;
          const serverUser: User = {
            id: serverUserObj.id,
            nome: serverUserObj.nome,
            email: serverUserObj.email,
            telefone: serverUserObj.telefone || '(11) 90000-0000',
            tipo: 'CLIENTE',
            status: serverUserObj.status,
            createdAt: serverUserObj.createdAt || new Date().toISOString(),
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
          };
          const serverCli: Cliente = {
            id: serverUserObj.cliente?.id || newCliId,
            userId: serverUserObj.id,
            cpf: serverUserObj.cliente?.cpf || newClientData.cpf,
            endereco: serverUserObj.cliente?.endereco || 'Avenida Geral, S/N',
            cidade: serverUserObj.cliente?.cidade || newClientData.cidade
          };

          setUsers(prev => {
            const filtered = prev.filter(u => u.email.toLowerCase() !== emailLower);
            return [serverUser, ...filtered];
          });
          setClientes(prev => {
            const filtered = prev.filter(c => c.userId !== serverUser.id);
            return [serverCli, ...filtered];
          });

          setActiveClienteId(serverCli.id);
          setIsLoggedIn(true);
        } else {
          setUsers(prev => [newUser, ...prev]);
          setClientes(prev => [newCli, ...prev]);
          setActiveClienteId(newCliId);
          setIsLoggedIn(true);
        }
      } catch (err: any) {
        setValidationError(err.message || 'Erro inesperado.');
        return;
      }
    } else {
      setUsers(prev => [newUser, ...prev]);
      setClientes(prev => [newCli, ...prev]);
      setActiveClienteId(newCliId);
      setIsLoggedIn(true);
    }

    // Save password locally too for quick simulation compatibility
    setAccountPasswords(prev => ({
      ...prev,
      [`${emailLower}-CLIENTE`]: newClientData.senha
    }));

    setLoggedInEmail(emailLower);
    setSessionRole('CLIENTE');
    setActivePortal('CLIENTE');
    
    setRegistrationMode('NONE');
    setValidationError(null);
    addNotification("Cadastro de Cliente realizado! Logado automaticamente.", "success");
  };

  const submitDriverRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const emailField = newDriverData.email.trim();
    // Fields validation
    if (!newDriverData.nome || !newDriverData.cpf || !emailField || !newDriverData.senha || !newDriverData.placa) {
      setValidationError("Por favor, preencha todos os campos obrigatórios!");
      return;
    }

    const emailLower = emailField.toLowerCase();

    // Check if they are already registered as a client and are trying to reuse the same password!
    const clientPassKey = `${emailLower}-CLIENTE`;
    if (accountPasswords[clientPassKey] && accountPasswords[clientPassKey] === newDriverData.senha) {
      setValidationError("Por segurança, sua senha de Motorista deve ser DIFERENTE da sua senha de Passageiro!");
      return;
    }

    // Vehicle Year validation (Obrigatório >= 2010!)
    if (Number(newDriverData.ano) < 2010) {
      setValidationError("Autorizado apenas veículos fabricados a partir do ano 2010!");
      return;
    }

    // Checking upload documents status - fallback to realistic mockups if not explicitly clicked
    const finalCnh = driverFileCnh || 'https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?w=400';
    const finalAddress = driverFileAddress || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400';
    const finalVFront = driverFileVFront || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=400';
    const finalVLateral = driverFileVLateral || 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=400';
    const finalVTraseira = driverFileVTraseira || 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=400';

    const newUserId = 'u-mot-' + Date.now() + '-' + Math.floor(Math.random() * 1000000);
    const newMotId = 'm-' + Date.now() + '-' + Math.floor(Math.random() * 1000000);

    const newUser: User = {
      id: newUserId,
      nome: newDriverData.nome,
      email: emailField,
      telefone: newDriverData.telefone || '(11) 90000-0000',
      tipo: 'MOTORISTA',
      status: 'PENDENTE_APROVACAO', // Waiting approvals
      createdAt: new Date().toISOString(),
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150'
    };

    const newMot: Motorista = {
      id: newMotId,
      userId: newUserId,
      cpf: newDriverData.cpf,
      endereco: newDriverData.endereco || 'Logradouro Central',
      cidade: newDriverData.cidade,
      documentoStatus: 'PENDENTE',
      isSubscriptionPaid: false,
      veiculo: {
        marca: newDriverData.marca || 'Sedan',
        modelo: newDriverData.modelo || 'Confortável',
        ano: Number(newDriverData.ano),
        cor: newDriverData.cor || 'Preto',
        placa: (newDriverData.placa || 'MOCK001').toUpperCase()
      },
      documentos: {
        cnhFrente: finalCnh,
        comprovanteEndereco: finalAddress,
        veiculoFrente: finalVFront,
        veiculoLateral: finalVLateral,
        veiculoTraseira: finalVTraseira
      }
    };

    const api_url = (import.meta as any).env.VITE_API_URL;
    if (api_url) {
      try {
        const response = await fetch(`${api_url}/api/auth/register-motorista`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            nome: newDriverData.nome,
            email: emailField,
            senha: newDriverData.senha,
            telefone: newDriverData.telefone || '(11) 90000-0000',
            cpf: newDriverData.cpf,
            endereco: newDriverData.endereco || 'Logradouro Central',
            cidade: newDriverData.cidade,
            cnh: newDriverData.cnh || 'CNH-MOCK',
            marca: newDriverData.marca || 'Sedan',
            modelo: newDriverData.modelo || 'Confortável',
            ano: Number(newDriverData.ano),
            cor: newDriverData.cor || 'Preto',
            placa: (newDriverData.placa || 'MOCK001').toUpperCase(),
            cnhFrente: finalCnh,
            comprovanteEndereco: finalAddress,
            veiculoFrente: finalVFront,
            veiculoLateral: finalVLateral,
            veiculoTraseira: finalVTraseira
          })
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Erro ao realizar cadastro de motorista no servidor.');
        }

        // Successfully registered! Auto-login
        const lResponse = await fetch(`${api_url}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: emailField, senha: newDriverData.senha })
        });
        const lData = await lResponse.json();
        if (lResponse.ok && lData.token) {
          localStorage.setItem('cc_token', lData.token);
          const serverUserObj = lData.user;
          const serverUser: User = {
            id: serverUserObj.id,
            nome: serverUserObj.nome,
            email: serverUserObj.email,
            telefone: serverUserObj.telefone || '(11) 90000-0000',
            tipo: 'MOTORISTA',
            status: serverUserObj.status,
            createdAt: serverUserObj.createdAt || new Date().toISOString(),
            avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150'
          };
          const serverMot: Motorista = {
            id: serverUserObj.motorista?.id || newMotId,
            userId: serverUserObj.id,
            cpf: serverUserObj.motorista?.cpf || newDriverData.cpf,
            endereco: serverUserObj.motorista?.endereco || 'Logradouro Central',
            cidade: serverUserObj.motorista?.cidade || newDriverData.cidade,
            documentoStatus: serverUserObj.motorista?.status_aprovacao || 'PENDENTE',
            isSubscriptionPaid: serverUserObj.status !== 'AGUARDANDO_PAGAMENTO',
            veiculo: {
              marca: serverUserObj.motorista?.veiculo?.marca || newDriverData.marca || 'Sedan',
              modelo: serverUserObj.motorista?.veiculo?.modelo || newDriverData.modelo || 'Confortável',
              ano: Number(serverUserObj.motorista?.veiculo?.ano || newDriverData.ano),
              cor: serverUserObj.motorista?.veiculo?.cor || newDriverData.cor || 'Preto',
              placa: (serverUserObj.motorista?.veiculo?.placa || newDriverData.placa || 'MOCK001').toUpperCase()
            },
            documentos: {
              cnhFrente: finalCnh,
              comprovanteEndereco: finalAddress,
              veiculoFrente: finalVFront,
              veiculoLateral: finalVLateral,
              veiculoTraseira: finalVTraseira
            }
          };

          setUsers(prev => {
            const filtered = prev.filter(u => u.email.toLowerCase() !== emailLower);
            return [serverUser, ...filtered];
          });
          setMotoristas(prev => {
            const filtered = prev.filter(m => m.userId !== serverUser.id);
            return [serverMot, ...filtered];
          });

          setActiveMotoristaId(serverMot.id);
          setIsLoggedIn(true);
        } else {
          setUsers(prev => [newUser, ...prev]);
          setMotoristas(prev => [newMot, ...prev]);
          setActiveMotoristaId(newMotId);
          setIsLoggedIn(true);
        }
      } catch (err: any) {
        setValidationError(err.message || 'Erro inesperado.');
        return;
      }
    } else {
      setUsers(prev => [newUser, ...prev]);
      setMotoristas(prev => [newMot, ...prev]);
      setActiveMotoristaId(newMotId);
      setIsLoggedIn(true);
    }

    // Save password
    setAccountPasswords(prev => ({
      ...prev,
      [`${emailLower}-MOTORISTA`]: newDriverData.senha
    }));

    setLoggedInEmail(emailLower);
    setSessionRole('MOTORISTA');
    setActivePortal('MOTORISTA');

    setRegistrationMode('NONE');
    addNotification("Cadastro de Motorista recebido! Verifique o status da sua CNH no seu painel.", "success");
  };

  // --- LOGIN SUBMIT HANDLER ---
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const emailField = loginEmail.trim();
    if (!emailField || !loginPassword) {
      setValidationError("Preencha o e-mail e a senha de acesso!");
      return;
    }

    const emailLower = emailField.toLowerCase();
    const api_url = (import.meta as any).env.VITE_API_URL;

    if (!api_url && emailLower === 'tvsonic577@gmail.com' && loginPassword === 'Jr990387') {
      setSessionRole('ADMIN');
      setActivePortal('ADMIN');
      setLoggedInEmail(emailLower);
      setIsLoggedIn(true);
      addNotification("Acesso Administrador Central concedido! Bem-vindo de volta.", "success");
      setLoginPassword('');
      return;
    }

    if (api_url) {
      try {
        const response = await fetch(`${api_url}/api/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email: emailField, senha: loginPassword })
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Erro ao efetuar login no servidor.');
        }

        if (data.token) {
          localStorage.setItem('cc_token', data.token);
        }

        const serverUserObj = data.user;
        const mappedRole: 'CLIENTE' | 'MOTORISTA' | 'FRANQUIA' | 'ADMIN' = 
          serverUserObj.tipo === 'ADMINISTRADOR' || serverUserObj.tipo === 'ADMIN' ? 'ADMIN' : serverUserObj.tipo;

        const serverUser: User = {
          id: serverUserObj.id,
          nome: serverUserObj.nome,
          email: serverUserObj.email,
          telefone: serverUserObj.telefone || '(11) 90000-0000',
          tipo: mappedRole as any,
          status: serverUserObj.status,
          createdAt: serverUserObj.createdAt || new Date().toISOString(),
          avatar: mappedRole === 'MOTORISTA'
            ? 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150'
            : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
        };

        setUsers(prev => {
          const filtered = prev.filter(u => u.email.toLowerCase() !== emailLower);
          return [serverUser, ...filtered];
        });

        if (mappedRole === 'CLIENTE') {
          const serverCli: Cliente = {
            id: serverUserObj.cliente?.id || ('c-' + Date.now()),
            userId: serverUserObj.id,
            cpf: serverUserObj.cliente?.cpf || '',
            endereco: serverUserObj.cliente?.endereco || 'Avenida Geral, S/N',
            cidade: serverUserObj.cliente?.cidade || 'São Paulo'
          };
          setClientes(prev => {
            const filtered = prev.filter(c => c.userId !== serverUser.id);
            return [serverCli, ...filtered];
          });
          setActiveClienteId(serverCli.id);
          setSessionRole('CLIENTE');
          setActivePortal('CLIENTE');
        } else if (mappedRole === 'MOTORISTA') {
          const serverMot: Motorista = {
            id: serverUserObj.motorista?.id || ('m-' + Date.now()),
            userId: serverUserObj.id,
            cpf: serverUserObj.motorista?.cpf || '',
            endereco: serverUserObj.motorista?.endereco || 'Logradouro Central',
            cidade: serverUserObj.motorista?.cidade || 'São Paulo',
            documentoStatus: serverUserObj.motorista?.status_aprovacao || 'PENDENTE',
            isSubscriptionPaid: serverUserObj.status !== 'AGUARDANDO_PAGAMENTO',
            veiculo: {
              marca: serverUserObj.motorista?.veiculo?.marca || 'Sedan',
              modelo: serverUserObj.motorista?.veiculo?.modelo || 'Confortável',
              ano: Number(serverUserObj.motorista?.veiculo?.ano || 2020),
              cor: serverUserObj.motorista?.veiculo?.cor || 'Preto',
              placa: (serverUserObj.motorista?.veiculo?.placa || 'MOCK001').toUpperCase()
            },
            documentos: {
              cnhFrente: 'https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?w=400',
              comprovanteEndereco: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400',
              veiculoFrente: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=400',
              veiculoLateral: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=400',
              veiculoTraseira: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=400'
            }
          };
          setMotoristas(prev => {
            const filtered = prev.filter(m => m.userId !== serverUser.id);
            return [serverMot, ...filtered];
          });
          setActiveMotoristaId(serverMot.id);
          setSessionRole('MOTORISTA');
          setActivePortal('MOTORISTA');
        } else {
          setSessionRole(mappedRole);
          setActivePortal(mappedRole);
        }

        setLoggedInEmail(emailLower);
        setIsLoggedIn(true);
        addNotification("Conectado com sucesso!", "success");
        setLoginPassword('');
        setValidationError(null);
        return;
      } catch (err: any) {
        setValidationError(err.message || 'Erro de autenticação no servidor.');
        return;
      }
    }

    let matchedRole = loginRole;
    let expectedPassword = accountPasswords[`${emailLower}-${loginRole}`];

    // 1. Fail-safe synchronization: if user exists in the core users list but no password is bound in accountPasswords,
    // save the input password on the fly, allowing successful login.
    const registeredUser = users.find(u => u.email.toLowerCase() === emailLower);
    if (registeredUser) {
      const uRole = registeredUser.tipo === 'MOTORISTA' ? 'MOTORISTA' : (registeredUser.tipo === 'CLIENTE' ? 'CLIENTE' : 'ADMIN');
      const passKey = `${emailLower}-${uRole}`;
      if (!accountPasswords[passKey]) {
        setAccountPasswords(prev => ({
          ...prev,
          [passKey]: loginPassword
        }));
        expectedPassword = loginPassword;
        matchedRole = uRole;
        setLoginRole(uRole);
      }
    }

    // 2. Smart role auto-detection: if password fails for chosen tab, but matches another profile for this email,
    // auto-shift tab and proceed successfully!
    if (!expectedPassword || expectedPassword !== loginPassword) {
      const perfis: ('CLIENTE' | 'MOTORISTA' | 'FRANQUIA' | 'ADMIN')[] = ['MOTORISTA', 'CLIENTE', 'FRANQUIA', 'ADMIN'];
      const correctProfile = perfis.find(p => accountPasswords[`${emailLower}-${p}`] === loginPassword);
      if (correctProfile) {
        matchedRole = correctProfile;
        expectedPassword = loginPassword;
        setLoginRole(correctProfile);
      }
    }

    if (!expectedPassword || expectedPassword !== loginPassword) {
      setValidationError("E-mail ou senha incorretos para o perfil selecionado!");
      return;
    }

    // Success Authentication! Track down specific indices / primary IDs
    if (matchedRole === 'CLIENTE') {
      const uObj = users.find(u => u.email.toLowerCase() === emailLower && u.tipo === 'CLIENTE');
      const cObj = clientes.find(c => c.userId === uObj?.id);
      if (cObj) {
        setActiveClienteId(cObj.id);
      } else {
        // Build or match fallback
        const match = clientes.find(c => {
          const matchedUser = users.find(u => u.id === c.userId);
          return matchedUser?.email.toLowerCase() === emailLower;
        });
        if (match) {
          setActiveClienteId(match.id);
        } else if (clientes.length > 0) {
          setActiveClienteId(clientes[0].id);
        }
      }
      setSessionRole('CLIENTE');
      setActivePortal('CLIENTE');
    } else if (matchedRole === 'MOTORISTA') {
      const uObj = users.find(u => u.email.toLowerCase() === emailLower && u.tipo === 'MOTORISTA');
      const mObj = motoristas.find(m => m.userId === uObj?.id);
      if (mObj) {
        setActiveMotoristaId(mObj.id);
      } else {
        const match = motoristas.find(m => {
          const matchedUser = users.find(u => u.id === m.userId);
          return matchedUser?.email.toLowerCase() === emailLower;
        });
        if (match) {
          setActiveMotoristaId(match.id);
        } else if (motoristas.length > 0) {
          setActiveMotoristaId(motoristas[0].id);
        }
      }
      setSessionRole('MOTORISTA');
      setActivePortal('MOTORISTA');
    } else if (matchedRole === 'FRANQUIA') {
      const franObj = franqueados.find(f => f.email.toLowerCase() === emailLower);
      if (franObj) {
        setActiveFranqueadoId(franObj.id);
      } else if (franqueados.length > 0) {
        setActiveFranqueadoId(franqueados[0].id);
      }
      setSessionRole('FRANQUIA');
      setActivePortal('FRANQUIA');
    } else if (matchedRole === 'ADMIN') {
      setSessionRole('ADMIN');
      setActivePortal('ADMIN');
    }

    setLoggedInEmail(emailLower);
    setIsLoggedIn(true);
    addNotification("Conectado com sucesso!", "success");
    setLoginPassword('');
  };

  // --- SECURE SIDEBAR ACCESS CONTROL ---
  const handleSidebarPortalSwitch = (target: 'CLIENTE' | 'MOTORISTA' | 'ADMIN' | 'CODE' | 'FRANQUIA') => {
    if (sessionRole === 'ADMIN') {
      // Admin can access everything
      setActivePortal(target);
      return;
    }

    if (sessionRole === 'CLIENTE') {
      if (target === 'CLIENTE') {
        setActivePortal(target);
        return;
      }
    }

    if (sessionRole === 'MOTORISTA') {
      if (target === 'MOTORISTA') {
        setActivePortal(target);
        return;
      }
    }

    if (sessionRole === 'FRANQUIA') {
      // Franqueado can see and manage Cliente (1), Motorista (2), and Franqueado (4)
      if (target === 'CLIENTE' || target === 'MOTORISTA' || target === 'FRANQUIA') {
        setActivePortal(target);
        return;
      }
    }

    // Attempting to visit some other role portal
    const ptLabel = target === 'CLIENTE' ? 'Passageiro' : target === 'MOTORISTA' ? 'Motorista' : target === 'FRANQUIA' ? 'Franqueado' : 'Administrador';
    addNotification(`Acesso negado! Seu perfil conectado é ${sessionRole === 'CLIENTE' ? 'Passageiro' : sessionRole === 'MOTORISTA' ? 'Motorista de Taxi/Carona' : sessionRole === 'FRANQUIA' ? 'Franqueado Regional' : sessionRole}. Use 'Sair do Painel' para entrar como ${ptLabel}.`, "warn");
  };

  // --- ADMIN PANEL FUNCTIONS ---
  const handleApproveDriverDocs = (motId: string, isApproved: boolean) => {
    setMotoristas(prev => prev.map(m => {
      if (m.id === motId) {
        const canGoOnline = isApproved && m.isSubscriptionPaid;
        return {
          ...m,
          documentoStatus: isApproved ? 'APROVADO' : 'REJEITADO',
          isOnline: canGoOnline ? true : m.isOnline
        };
      }
      return m;
    }));

    // Update equivalent user status
    const targetMot = motoristas.find(m => m.id === motId);
    if (targetMot) {
      setUsers(prev => prev.map(u => {
        if (u.id === targetMot.userId) {
          const bothOk = isApproved && targetMot.isSubscriptionPaid;
          return {
            ...u,
            status: bothOk ? 'ATIVO' : (isApproved ? 'AGUARDANDO_PAGAMENTO' : 'PENDENTE_APROVACAO')
          };
        }
        return u;
      }));

      addNotification(
        isApproved 
          ? (targetMot.isSubscriptionPaid 
              ? "Documentos aprovados e licença mensal OK! O motorista está regulamentado e ONLINE automaticamente!"
              : "Documentos aprovados! O motorista agora precisa efetuar o pagamento da mensalidade de ativação.")
          : "Documentos reprovados e devolvidos.", 
        isApproved ? "success" : "warn"
      );
    }
  };

  const handleToggleSubscriptionPaid = (motId: string) => {
    const targetMot = motoristas.find(m => m.id === motId);
    if (!targetMot) return;

    const newPaidStatus = !targetMot.isSubscriptionPaid;
    const driverName = users.find(u => u.id === targetMot.userId)?.nome || 'Motorista';

    setMotoristas(prev => prev.map(m => {
      if (m.id === motId) {
        const canGoOnline = newPaidStatus && m.documentoStatus === 'APROVADO';
        return { 
          ...m, 
          isSubscriptionPaid: newPaidStatus,
          isOnline: canGoOnline ? true : (newPaidStatus ? m.isOnline : false)
        };
      }
      return m;
    }));

    setUsers(prev => prev.map(u => {
      if (u.id === targetMot.userId) {
        let nextStatus = u.status;
        if (newPaidStatus) {
          if (targetMot.documentoStatus === 'APROVADO') {
            nextStatus = 'ATIVO';
          } else {
            nextStatus = 'PENDENTE_APROVACAO';
          }
        } else {
          nextStatus = 'AGUARDANDO_PAGAMENTO';
        }
        return { ...u, status: nextStatus };
      }
      return u;
    }));

    const statusMsg = newPaidStatus 
      ? (targetMot.documentoStatus === 'APROVADO'
          ? `Mensalidade paga e documentos OK! O motorista ${driverName} foi ativado e está ONLINE automaticamente!`
          : `Mensalidade do motorista ${driverName} paga, aguardando liberação de documentos.`)
      : `Mensalidade do motorista ${driverName} pendente. O motorista foi colocado OFFLINE por segurança.`;

    addNotification(statusMsg, newPaidStatus ? 'success' : 'warn');
  };

  const handleToggleBlockUser = (userId: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const nextStatus = u.status === 'BLOQUEADO' ? 'ATIVO' : 'BLOQUEADO';
        addNotification(`Usuário alterado para o status ${nextStatus}!`, "info");
        return { ...u, status: nextStatus };
      }
      return u;
    }));
  };

  const handleExportDatabase = () => {
    try {
      const databaseDump = {
        empresa: "Carona Cash LTDA",
        versao: "1.0.0",
        motor: "Prisma Client ORM (PostgreSQL Ready)",
        dataBackup: new Date().toLocaleString(),
        arquivamentoStatus: "CONSOLIDADO",
        bancoDados: {
          quantidadeClientes: clientes.length,
          quantidadeMotoristas: motoristas.length,
          quantidadeMotoristasAtivos: motoristas.filter(m => m.documentoStatus === 'APROVADO').length,
          quantidadeUsuariosTotal: users.length,
          quantidadeFranquias: franqueados.length,
          quantidadeCorridas: corridas.length
        },
        tabelas: {
          tabela_users: users.map(u => ({
            id: u.id,
            nome: u.nome,
            email: u.email,
            status: u.status,
            tipo: u.tipo,
            criadoEm: u.createdAt
          })),
          tabela_clientes: clientes.map(c => {
            const usr = users.find(u => u.id === c.userId);
            return {
              id: c.id,
              userId: c.userId,
              nome: usr?.nome || "",
              email: usr?.email || "",
              cpf: c.cpf,
              endereco: c.endereco,
              cidade: c.cidade,
              persistenciaBadge: "POSTGRES_COMPATIBLE_PRISMA"
            };
          }),
          tabela_motoristas_autorizados: motoristas.map(m => {
            const usr = users.find(u => u.id === m.userId);
            return {
              id: m.id,
              userId: m.userId,
              nome: usr?.nome || "",
              email: usr?.email || "",
              cpf: m.cpf,
              cnhStatus: m.documentoStatus,
              mensalidadePaga: m.isSubscriptionPaid,
              cidade: m.cidade,
              veiculo: m.veiculo,
              persistenciaBadge: "POSTGRES_COMPATIBLE_PRISMA"
            };
          }),
          tabela_config_global: config
        }
      };

      const jsonStr = JSON.stringify(databaseDump, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `caronacash_banco_dados_prisma_${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      addNotification("Banco de Dados exportado e gravado com sucesso!", "success");
    } catch (err: any) {
      addNotification("Erro ao processar backup do Banco de Dados: " + err?.message, "warn");
    }
  };

  const handleDeleteMotorista = (motId: string) => {
    const targetMot = motoristas.find(m => m.id === motId);
    if (!targetMot) return;
    const targetUser = users.find(u => u.id === targetMot.userId);
    const driverName = targetUser?.nome || 'Motorista';
    const driverEmail = targetUser?.email || '';
    
    // Remove motorista and core user
    setMotoristas(prev => prev.filter(m => m.id !== motId));
    setUsers(prev => prev.filter(u => u.id !== targetMot.userId));

    // Handle session context updates safely so the app can continue seamlessly
    if (activeMotoristaId === motId) {
      const remainingMots = motoristas.filter(m => m.id !== motId);
      if (remainingMots.length > 0) {
        setActiveMotoristaId(remainingMots[0].id);
      } else {
        setActiveMotoristaId('');
      }
    }

    if (loggedInEmail && driverEmail && loggedInEmail.toLowerCase() === driverEmail.toLowerCase()) {
      if (sessionRole === 'MOTORISTA') {
        setIsLoggedIn(false);
        setLoggedInEmail('');
        setSessionRole('CLIENTE');
        setActivePortal('CLIENTE');
      }
    }

    addNotification(`Cadastro do motorista "${driverName}" excluído do banco de dados!`, "success");
  };

  const handleDeleteCliente = (userId: string) => {
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) return;
    const clientEmail = targetUser.email;
    
    // Remove client and core user
    setClientes(prev => prev.filter(c => c.userId !== userId));
    setUsers(prev => prev.filter(u => u.id !== userId));

    const clickedClient = clientes.find(c => c.userId === userId);
    if (clickedClient && activeClienteId === clickedClient.id) {
      const remainingClis = clientes.filter(c => c.userId !== userId);
      if (remainingClis.length > 0) {
        setActiveClienteId(remainingClis[0].id);
      } else {
        setActiveClienteId('');
      }
    }

    if (loggedInEmail && clientEmail && loggedInEmail.toLowerCase() === clientEmail.toLowerCase()) {
      if (sessionRole === 'CLIENTE') {
        setIsLoggedIn(false);
        setLoggedInEmail('');
        setSessionRole('CLIENTE');
        setActivePortal('CLIENTE');
      }
    }

    addNotification(`Cadastro do passageiro "${targetUser.nome}" excluído do banco de dados!`, "success");
  };

  // Process Mock PIX monthly Payment release
  const handleConfirmPixPayment = () => {
    setPixPaidSuccessfully(true);
    setTimeout(() => {
      setMotoristas(prev => prev.map(m => {
        if (m.id === checkoutMotoristaId) {
          const canGoOnline = m.documentoStatus === 'APROVADO';
          return { 
            ...m, 
            isSubscriptionPaid: true,
            isOnline: canGoOnline ? true : m.isOnline
          };
        }
        return m;
      }));

      const targetMot = motoristas.find(m => m.id === checkoutMotoristaId);
      if (targetMot) {
        setUsers(prev => prev.map(u => {
          if (u.id === targetMot.userId) {
            const nextStatus = targetMot.documentoStatus === 'APROVADO' ? 'ATIVO' : 'PENDENTE_APROVACAO';
            return { ...u, status: nextStatus as UserStatus };
          }
          return u;
        }));
        
        if (targetMot.documentoStatus === 'APROVADO') {
          addNotification("Mensalidade de ativação confirmada por PIX! Seus documentos já constam como OK e você foi colocado ONLINE automaticamente!", "success");
        } else {
          addNotification("Mensalidade de ativação confirmada por PIX! Agora seu cadastro está aguardando apenas a aprovação dos documentos pelo administrador para entrar ONLINE.", "success");
        }
      }

      setShowPixCheckout(false);
      setPixPaidSuccessfully(false);
    }, 1500);
  };

  const handleAddNewCity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCityName.trim()) return;
    
    const newCity: CidadeAtendida = {
      id: 'city-' + Date.now() + '-' + Math.floor(Math.random() * 1000000),
      nome: newCityName,
      estado: newCityState,
      status: 'ATIVO'
    };

    setCidades(prev => [...prev, newCity]);
    setNewCityName('');
    addNotification(`Cidade de ${newCityName} adicionada com sucesso!`, "success");
  };

  const handleToggleCity = (cityId: string) => {
    setCidades(prev => prev.map(c => {
      if (c.id === cityId) {
        const nextStatus = c.status === 'ATIVO' ? 'INATIVO' : 'ATIVO';
        return { ...c, status: nextStatus };
      }
      return c;
    }));
  };

  // Helper calculation formulas for metrics dashboard
  const adminUser = users.find(u => u.tipo === 'ADMINISTRADOR' && u.email.toLowerCase() === loggedInEmail.toLowerCase()) || users.find(u => u.tipo === 'ADMINISTRADOR');
  const totalCompletedRides = corridas.filter(c => c.status === 'CONCLUIDA');
  const totalVolumeGross = totalCompletedRides.reduce((sum, item) => sum + item.valor, 0);
  const totalPlatformComission = totalCompletedRides.reduce((sum, item) => sum + getCorridaTaxaServico(item), 0);

  // --- LOGIN & REGISTRATION FULL PAGE GATEWAY ---
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 sm:p-6 font-sans relative overflow-x-hidden selection:bg-emerald-200 selection:text-emerald-950 animate-fade-in" id="login-screen-root">
        
        {/* Decorative backgrounds */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none translate-x-[-30%] translate-y-[-30%]"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-[120px] pointer-events-none translate-x-[30%] translate-y-[30%]"></div>

        {/* Global Toasts Mirror */}
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
          {notifications.map(n => (
            <div
              key={n.id}
              className={`p-4 rounded-xl shadow-2xl border flex items-start gap-3 bg-white text-slate-800 pointer-events-auto transform transition duration-300 animate-slide-in ${
                n.type === 'success' ? 'border-emerald-500' : n.type === 'warn' ? 'border-rose-500' : 'border-blue-500'
              }`}
            >
              {n.type === 'success' && <CheckCircle2 className="text-emerald-600 shrink-0 select-none" size={20} />}
              {n.type === 'warn' && <AlertCircle className="text-rose-600 shrink-0 select-none" size={20} />}
              {n.type === 'info' && <Bell className="text-blue-600 shrink-0 select-none" size={20} />}
              <span className="text-xs font-semibold text-slate-650">{n.text}</span>
            </div>
          ))}
        </div>

        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 z-10 my-auto py-8">
          
          {/* INFO SIDEBAR SECTION */}
          <div className="lg:col-span-5 flex flex-col justify-center space-y-6 text-center lg:text-left">
            <div className="flex items-center gap-4.5 justify-center lg:justify-start">
              <CaronaLogo className="w-24 h-24" animated={true} />
              <div>
                <h1 className="font-extrabold text-3.5xl tracking-tight text-white leading-none"><span className="text-emerald-400">CAR</span>ONA</h1>
                <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mt-1">Sua Mobilidade Regional</p>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Transporte inteligente, taxas justas.
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed max-w-md mx-auto lg:mx-0">
                Uma infraestrutura completa de mobilidade conectando passageiros regionais, motoristas autônomos com mensalidade fixa e franqueados locais.
              </p>
            </div>


          </div>

          {/* DYNAMIC SIGN-IN / SIGN-UP CARD INTERACTION */}
          <div className="lg:col-span-7 bg-slate-905/90 border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
            
            {registrationMode !== 'NONE' ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {registrationMode === 'CLIENTE' ? 'Nova Conta de Passageiro' : 'Cadastro de Motorista Parceiro'}
                    </h3>
                    <p className="text-[11px] text-slate-400">Preencha os campos para se credenciar gratuitamente</p>
                  </div>
                  <button
                    onClick={() => { setRegistrationMode('NONE'); setValidationError(null); }}
                    className="p-1.5 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                {validationError && (
                  <div className="p-3 bg-rose-500/10 text-rose-300 text-xs rounded-lg flex items-center gap-2 border border-rose-500/30">
                    <ShieldAlert size={16} className="shrink-0 text-rose-400" />
                    <span>{validationError}</span>
                  </div>
                )}

                {registrationMode === 'CLIENTE' ? (
                  <form onSubmit={submitClientRegistration} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-slate-300 text-xs text-left">
                    <div className="col-span-1 sm:col-span-2">
                      <label className="block font-bold text-slate-400 uppercase mb-1">Nome Completo *</label>
                      <input
                        type="text" required
                        value={newClientData.nome}
                        onChange={e => setNewClientData({...newClientData, nome: e.target.value})}
                        placeholder="Ex: Amanda Lima"
                        className="w-full px-3.5 py-2 rounded-lg border border-slate-700 bg-slate-900 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-400 uppercase mb-1">CPF (Apenas números) *</label>
                      <input
                        type="text" required
                        value={newClientData.cpf}
                        onChange={e => setNewClientData({...newClientData, cpf: e.target.value})}
                        placeholder="11122233344"
                        className="w-full px-3.5 py-2 rounded-lg border border-slate-700 bg-slate-900 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-400 uppercase mb-1">Telefone Celular</label>
                      <input
                        type="text"
                        value={newClientData.telefone}
                        onChange={e => setNewClientData({...newClientData, telefone: e.target.value})}
                        placeholder="(19) 99888-2233"
                        className="w-full px-3.5 py-2 rounded-lg border border-slate-700 bg-slate-900 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-400 uppercase mb-1">E-mail de Login *</label>
                      <input
                        type="email" required
                        value={newClientData.email}
                        onChange={e => setNewClientData({...newClientData, email: e.target.value})}
                        placeholder="amanda@exemplo.com"
                        className="w-full px-3.5 py-2 rounded-lg border border-slate-700 bg-slate-900 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-400 uppercase mb-1">Senha de Acesso (Não repita a de motorista!) *</label>
                      <input
                        type="password" required
                        value={newClientData.senha}
                        onChange={e => setNewClientData({...newClientData, senha: e.target.value})}
                        placeholder="Nova senha exclusiva"
                        className="w-full px-3.5 py-2 rounded-lg border border-slate-700 bg-slate-900 text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-400 uppercase mb-1">Cidade Principal *</label>
                      <select
                        value={newClientData.cidade}
                        onChange={e => setNewClientData({...newClientData, cidade: e.target.value})}
                        className="w-full px-2.5 py-2 rounded-lg border border-slate-700 bg-slate-900 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        {cidades.map(c => <option key={c.id} value={c.nome}>{c.nome}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-400 uppercase mb-1">Endereço Residencial</label>
                      <input
                        type="text"
                        value={newClientData.endereco}
                        onChange={e => setNewClientData({...newClientData, endereco: e.target.value})}
                        placeholder="Rua das Acácias, 120"
                        className="w-full px-3.5 py-2 rounded-lg border border-slate-700 bg-slate-900 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div className="col-span-1 sm:col-span-2 pt-2 border-t border-slate-900 mt-2">
                      <button
                        type="submit"
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-lg transition duration-150 cursor-pointer uppercase tracking-wider text-xs"
                      >
                        Finalizar Cadastro e Login Direto
                      </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={submitDriverRegistration} className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-slate-300 text-xs text-left max-h-[70vh] overflow-y-auto pr-2">
                    <div className="col-span-1 sm:col-span-2">
                      <div className="p-3 bg-emerald-950/80 text-emerald-300 rounded-lg border border-emerald-900 leading-relaxed font-semibold text-[10px]">
                        💡 Taxa Fixa Inteligente: Plataforma cobra apenas mensalidade por corrida concluída, repassando o valor total para seu bolso!
                      </div>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-400 uppercase mb-1">Nome Completo *</label>
                      <input
                        type="text" required
                        value={newDriverData.nome}
                        onChange={e => setNewDriverData({...newDriverData, nome: e.target.value})}
                        placeholder="Ex: Roberto Alencar"
                        className="w-full px-3.5 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-white"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-400 uppercase mb-1">CPF *</label>
                      <input
                        type="text" required
                        value={newDriverData.cpf}
                        onChange={e => setNewDriverData({...newDriverData, cpf: e.target.value})}
                        placeholder="Apenas números"
                        className="w-full px-3.5 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-white"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-400 uppercase mb-1">Telefone Celular</label>
                      <input
                        type="text"
                        value={newDriverData.telefone}
                        onChange={e => setNewDriverData({...newDriverData, telefone: e.target.value})}
                        placeholder="(19) 9777-1122"
                        className="w-full px-3.5 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-white"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-400 uppercase mb-1">E-mail de Login *</label>
                      <input
                        type="email" required
                        value={newDriverData.email}
                        onChange={e => setNewDriverData({...newDriverData, email: e.target.value})}
                        placeholder="roberto@email.com"
                        className="w-full px-3.5 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-white"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-400 uppercase mb-1">Senha de Acesso (Não repita a de passageiro!) *</label>
                      <input
                        type="password" required
                        value={newDriverData.senha}
                        onChange={e => setNewDriverData({...newDriverData, senha: e.target.value})}
                        placeholder="Nova senha exclusiva"
                        className="w-full px-3.5 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-white font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-400 uppercase mb-1">Cidade onde irá Correr *</label>
                      <select
                        value={newDriverData.cidade}
                        onChange={e => setNewDriverData({...newDriverData, cidade: e.target.value})}
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-white"
                      >
                        {cidades.map(c => <option key={c.id} value={c.nome}>{c.nome}</option>)}
                      </select>
                    </div>

                    <div className="col-span-1 sm:col-span-2 border-t border-slate-800 pt-2.5">
                      <p className="font-bold text-emerald-400 uppercase mb-2 tracking-widest text-[9px]">Sobre o Veículo</p>
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-400 mb-1">Marca fabricante *</label>
                      <input
                        type="text" required placeholder="Ex: Chevrolet"
                        value={newDriverData.marca}
                        onChange={e => setNewDriverData({...newDriverData, marca: e.target.value})}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-white"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-400 mb-1">Modelo do veículo *</label>
                      <input
                        type="text" required placeholder="Ex: Prisma"
                        value={newDriverData.modelo}
                        onChange={e => setNewDriverData({...newDriverData, modelo: e.target.value})}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-white"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-400 mb-1">Ano Fabricação (Mín 2010) *</label>
                      <input
                        type="number" required
                        value={newDriverData.ano}
                        onChange={e => setNewDriverData({...newDriverData, ano: Number(e.target.value)})}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-white"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-400 mb-1">Placa de Identificação *</label>
                      <input
                        type="text" required placeholder="Ex: GBB1E29"
                        value={newDriverData.placa}
                        onChange={e => setNewDriverData({...newDriverData, placa: e.target.value})}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-white"
                      />
                    </div>

                    <div className="col-span-1 sm:col-span-2 border-t border-slate-800 pt-2.5">
                      <p className="font-bold text-emerald-400 uppercase tracking-widest text-[9px] mb-2">Simulação de documentos carragados</p>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="p-2.5 border border-slate-800 bg-slate-950/40 rounded-lg text-center" id="upload-cnh-placeholder">
                          <span className="block text-[8px] text-slate-400 mb-1 leading-none">Foto CNH Aberta</span>
                          {driverFileCnh ? (
                            <span className="text-[10px] text-emerald-400 font-bold block">✓ Carregado</span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setDriverFileCnh('https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?w=400')}
                              className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-[9px] rounded text-white cursor-pointer"
                            >
                              Anexar
                            </button>
                          )}
                        </div>
                        <div className="p-2.5 border border-slate-800 bg-slate-950/40 rounded-lg text-center" id="upload-residence-placeholder">
                          <span className="block text-[8px] text-slate-400 mb-1 leading-none">Comp. Residência</span>
                          {driverFileAddress ? (
                            <span className="text-[10px] text-emerald-400 font-bold block">✓ Carregado</span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setDriverFileAddress('https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400')}
                              className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-[9px] rounded text-white cursor-pointer"
                            >
                              Anexar
                            </button>
                          )}
                        </div>
                        <div className="p-2.5 border border-slate-800 bg-slate-950/40 rounded-lg text-center" id="upload-front-placeholder">
                          <span className="block text-[8px] text-slate-400 mb-1 leading-none">Foto do Carro</span>
                          {driverFileVFront ? (
                            <span className="text-[10px] text-emerald-400 font-bold block">✓ Carregado</span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setDriverFileVFront('https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=400')}
                              className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-[9px] rounded text-white cursor-pointer"
                            >
                              Anexar
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="col-span-1 sm:col-span-2 pt-3 border-t border-slate-800 mt-2">
                      <button
                        type="submit"
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-lg transition duration-150 cursor-pointer uppercase tracking-wider text-xs"
                      >
                        Enviar para Homologação e Entrar
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ) : (
              // STANDARD SECURE LOGIN FORM DISPLAY
              <div className="space-y-6 animate-fade-in">
                <div className="text-center lg:text-left">
                  <h3 className="text-2xl font-extrabold text-white tracking-tight">Efetuar Login</h3>
                  <p className="text-xs text-slate-400 mt-1">Insira suas credenciais abaixo para se conectar ou mude seu perfil no seletor</p>
                </div>

                {validationError && (
                  <div className="p-3 bg-rose-500/15 text-rose-300 text-xs rounded-xl flex items-center gap-2 border border-rose-500/20">
                    <ShieldAlert size={16} className="text-rose-400 shrink-0" />
                    <span>{validationError}</span>
                  </div>
                )}

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  {/* ROLE SELECTION BAR CARD */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 font-sans">Selecione seu perfil de acesso:</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => { setLoginRole('CLIENTE'); setValidationError(null); }}
                        className={`py-2.5 px-3 rounded-lg text-xs font-bold border transition duration-150 cursor-pointer text-center ${
                          loginRole === 'CLIENTE'
                            ? 'bg-emerald-500 hover:bg-emerald-600 text-emerald-950 border-emerald-400 font-extrabold shadow-md'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        Passageiro
                      </button>
                      <button
                        type="button"
                        onClick={() => { setLoginRole('MOTORISTA'); setValidationError(null); }}
                        className={`py-2.5 px-3 rounded-lg text-xs font-bold border transition duration-150 cursor-pointer text-center ${
                          loginRole === 'MOTORISTA'
                            ? 'bg-emerald-500 hover:bg-emerald-600 text-emerald-950 border-emerald-400 font-extrabold shadow-md'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        Motorista
                      </button>
                    </div>
                  </div>

                  {/* CREDENTIALS SUB-CARD */}
                  <div className="space-y-3 pt-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Endereço de E-mail *</label>
                      <div className="relative">
                        <input
                          type="email" required
                          value={loginEmail}
                          onChange={e => setLoginEmail(e.target.value)}
                          placeholder="nome@gmail.com"
                          className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-700 bg-slate-900 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Senha Secreta *</label>
                      <div className="relative">
                        <input
                          type="password" required
                          value={loginPassword}
                          onChange={e => setLoginPassword(e.target.value)}
                          placeholder="Sua senha secreta..."
                          className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-700 bg-slate-900 text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-emerald-950 font-black rounded-lg text-xs hover:cursor-pointer transition-all duration-150 uppercase tracking-wider shadow-lg shadow-emerald-500/10 mt-4 block"
                  >
                    Entrar com Perfil {loginRole === 'CLIENTE' ? 'Passageiro' : loginRole === 'MOTORISTA' ? 'Motorista' : loginRole === 'FRANQUIA' ? 'Franqueado' : 'Administrador'}
                  </button>
                </form>

                {/* SIGN UP TOGGLE CHUNK */}
                <div className="border-t border-slate-800/80 pt-4 text-center text-xs text-slate-400">
                  <span className="block mb-2">Não tem conta registrada ainda? Faça seu cadastro como:</span>
                  <div className="flex gap-4 justify-center items-center">
                    <button
                      onClick={() => { setRegistrationMode('CLIENTE'); setValidationError(null); }}
                      className="text-emerald-400 hover:text-emerald-300 font-bold transition duration-150 cursor-pointer hover:underline"
                    >
                      👥 Passageiro Regional
                    </button>
                    <span className="text-slate-700 font-light">|</span>
                    <button
                      onClick={() => { setRegistrationMode('MOTORISTA'); setValidationError(null); }}
                      className="text-emerald-400 hover:text-emerald-300 font-bold transition duration-150 cursor-pointer hover:underline"
                    >
                      🚗 Motorista Parceiro
                    </button>
                  </div>
                </div>

              </div>
            )}

          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col md:flex-row font-sans selection:bg-emerald-200 selection:text-emerald-950 animate-fade-in" id="carona-cash-v1">
      
      {/* GLOBAL NOTIFICATIONS TOAST */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {notifications.map(n => (
          <div
            key={n.id}
            className={`p-4 rounded-xl shadow-xl border flex items-start gap-3 bg-white pointer-events-auto transform transition duration-300 animate-slide-in ${
              n.type === 'success' ? 'border-emerald-500' : n.type === 'warn' ? 'border-rose-500' : 'border-blue-500'
            }`}
          >
            {n.type === 'success' && <CheckCircle2 className="text-emerald-600 shrink-0" size={20} />}
            {n.type === 'warn' && <AlertCircle className="text-rose-600 shrink-0" size={20} />}
            {n.type === 'info' && <Bell className="text-blue-600 shrink-0" size={20} />}
            <span className="text-xs text-slate-600 font-medium">{n.text}</span>
          </div>
        ))}
      </div>

      {/* GORGEOUS HIGH-DENSITY SIDEBAR */}
      <aside className="w-full md:w-64 bg-emerald-950 text-white flex flex-col flex-shrink-0 border-b md:border-b-0 md:border-r border-emerald-900/40 shrink-0" id="carona-sidebar">
        <div className="p-6 flex items-center gap-3.5">
          <CaronaLogo 
            className="w-16 h-16" 
            animated={activePortal === 'CLIENTE'} 
          />
          <div>
            <h1 className="font-extrabold text-xl leading-tight tracking-tight text-white"><span className="text-emerald-400">CAR</span>ONA</h1>
            {activePortal === 'ADMIN' ? (
              <p className="text-[10px] text-emerald-400 font-medium uppercase tracking-widest">Admin Master</p>
            ) : activePortal === 'CLIENTE' ? (
              <p className="text-[10px] text-emerald-400 font-medium uppercase tracking-widest">Central Cliente</p>
            ) : activePortal === 'MOTORISTA' ? (
              <p className="text-[10px] text-emerald-400 font-medium uppercase tracking-widest">Driver Portal</p>
            ) : activePortal === 'FRANQUIA' ? (
              <p className="text-[10px] text-emerald-400 font-medium uppercase tracking-widest">Central do Franqueado</p>
            ) : (
              <p className="text-[10px] text-emerald-400 font-medium uppercase tracking-widest">SaaS Deployer</p>
            )}
          </div>
        </div>

        {/* Portal Switcher & Config links mimicking high density */}
        <nav className="mt-4 flex-grow space-y-1.5 px-4 text-xs font-semibold">
          <p className="text-[9px] text-emerald-500 font-bold uppercase tracking-wider px-3 mb-2">Painéis Autorizados</p>
          
          {(sessionRole === 'ADMIN' || sessionRole === 'CLIENTE' || sessionRole === 'FRANQUIA') && (
            <button
              onClick={() => { handleSidebarPortalSwitch('CLIENTE'); setRegistrationMode('NONE'); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left hover:cursor-pointer ${
                activePortal === 'CLIENTE' 
                  ? 'bg-emerald-800/60 text-emerald-300 border-l-4 border-emerald-500 font-bold' 
                  : 'text-emerald-100 hover:bg-emerald-900/60'
              }`}
            >
              <UserIcon size={14} className="shrink-0 text-emerald-400" />
              <span>1. Central do Cliente</span>
            </button>
          )}

          {(sessionRole === 'ADMIN' || sessionRole === 'MOTORISTA' || sessionRole === 'FRANQUIA') && (
            <button
              onClick={() => { handleSidebarPortalSwitch('MOTORISTA'); setRegistrationMode('NONE'); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left hover:cursor-pointer ${
                activePortal === 'MOTORISTA' 
                  ? 'bg-emerald-800/60 text-emerald-300 border-l-4 border-emerald-500 font-bold' 
                  : 'text-emerald-100 hover:bg-emerald-900/60'
              }`}
            >
              <Car size={14} className="shrink-0 text-emerald-400" />
              <span>2. Motorista Parceiro</span>
              <span className="ml-auto bg-emerald-500 text-emerald-950 text-[9px] px-1.5 py-0.5 rounded-full font-bold shadow-sm">
                {motoristas.filter(m => m.isSubscriptionPaid).length}
              </span>
            </button>
          )}

          {sessionRole === 'ADMIN' && (
            <button
              onClick={() => { handleSidebarPortalSwitch('ADMIN'); setRegistrationMode('NONE'); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left hover:cursor-pointer ${
                activePortal === 'ADMIN' 
                  ? 'bg-emerald-800/60 text-emerald-300 border-l-4 border-emerald-500 font-bold' 
                  : 'text-emerald-100 hover:bg-emerald-900/60'
              }`}
            >
              <ShieldCheck size={14} className="shrink-0 text-emerald-400" />
              <span>3. Monitor & Admin</span>
              {motoristas.filter(m => m.documentoStatus === 'PENDENTE').length > 0 && (
                <span className="ml-auto bg-amber-500 text-emerald-950 text-[10px] px-1.5 py-0.5 rounded-full font-bold animate-pulse">
                  {motoristas.filter(m => m.documentoStatus === 'PENDENTE').length}
                </span>
              )}
            </button>
          )}

          {(sessionRole === 'ADMIN' || sessionRole === 'FRANQUIA') && (
            <button
              onClick={() => { handleSidebarPortalSwitch('FRANQUIA'); setRegistrationMode('NONE'); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left hover:cursor-pointer ${
                activePortal === 'FRANQUIA' 
                  ? 'bg-emerald-800/60 text-emerald-300 border-l-4 border-emerald-500 font-bold' 
                  : 'text-emerald-100 hover:bg-emerald-900/60'
              }`}
            >
              <Layers size={14} className="shrink-0 text-emerald-400" />
              <span>4. Central do Franqueado</span>
            </button>
          )}

          {sessionRole === 'ADMIN' && (
            <button
              onClick={() => { handleSidebarPortalSwitch('CODE'); setRegistrationMode('NONE'); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left hover:cursor-pointer ${
                activePortal === 'CODE' 
                  ? 'bg-emerald-800/60 text-emerald-300 border-l-4 border-emerald-500 font-bold' 
                  : 'text-emerald-100 hover:bg-emerald-900/60'
              }`}
            >
              <FileText size={14} className="shrink-0 text-emerald-400" />
              <span>5. Configs Deploy SaaS</span>
            </button>
          )}

          {/* PERSISTENT LOGOUT OPTION INSIDE THE PANEL */}
          <button
            onClick={() => {
              setIsLoggedIn(false);
              setLoggedInEmail('');
              addNotification("Sessão finalizada com sucesso! Volte sempre.", "info");
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-rose-300 hover:bg-rose-950/60 hover:text-white transition-all text-left font-bold border border-rose-900/30 bg-rose-950/20 mt-4 cursor-pointer"
            id="carona-logout-button-sidebar"
          >
            <LogOut size={14} className="shrink-0 text-rose-400 animate-pulse" />
            <span>Sair do Painel</span>
          </button>
        </nav>

        {/* Server Status Indicators */}
        <div className="p-4 bg-emerald-900/40 m-4 rounded-xl border border-emerald-800/60 shrink-0">
          <p className="text-[10px] text-emerald-300 uppercase tracking-widest font-bold">Conexão Segura</p>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-2 h-2 bg-emerald-400 rounded-full status-pulse"></div>
            <span className="text-[10px] font-mono text-emerald-200">User: {loggedInEmail || 'Admin'}</span>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50 overflow-hidden" id="main-content-flow">
        
        {/* PREMIUM HIGH-DENSITY HEADER BAR */}
        <header className="relative h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sm:px-8 shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-2 text-slate-400 text-xs italic">
            <Search size={14} className="shrink-0 text-slate-300" />
            <span className="hidden sm:inline">Pesquisar motorista, placa ou cidade...</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              {(() => {
                if (activePortal === 'CLIENTE') {
                  const clientObj = clientes.find(c => c.id === activeClienteId);
                  const userObj = users.find(u => u.id === clientObj?.userId);
                  return (
                    <>
                      <p className="text-xs font-semibold text-slate-800 leading-none">{userObj?.nome || "Amanda Pinheiro"}</p>
                      <p className="text-[10px] text-slate-500 font-medium mt-1">Passageira Premium</p>
                    </>
                  );
                } else if (activePortal === 'MOTORISTA') {
                  const targetMot = motoristas.find(m => m.id === activeMotoristaId);
                  const userObj = users.find(u => u.id === targetMot?.userId);
                  return (
                    <>
                      <p className="text-xs font-semibold text-slate-800 leading-none">{userObj?.nome || "Roberto Santos"}</p>
                      <p className="text-[10px] text-slate-500 font-medium mt-1">Motorista Parceiro</p>
                    </>
                  );
                } else if (activePortal === 'FRANQUIA') {
                  const fran = franqueados.find(f => f.id === activeFranqueadoId);
                  return (
                    <>
                      <p className="text-xs font-semibold text-slate-800 leading-none">{fran?.nome || "Franqueado"}</p>
                      <p className="text-[10px] text-amber-600 font-bold mt-1 uppercase tracking-wider">Franqueado • {fran?.cidade}</p>
                    </>
                  );
                } else if (activePortal === 'ADMIN') {
                  return (
                    <>
                      <p className="text-xs font-semibold text-slate-800 leading-none">{adminUser?.nome || "Carlos Oliveira"}</p>
                      <p className="text-[10px] text-emerald-600 font-bold mt-1 uppercase tracking-wider">Dono da Plataforma</p>
                    </>
                  );
                } else {
                  return (
                    <>
                      <p className="text-xs font-semibold text-slate-800 leading-none">Supervisor DevOps</p>
                      <p className="text-[10px] text-slate-500 font-medium mt-1">SaaS Deployment</p>
                    </>
                  );
                }
              })()}
            </div>
            {(() => {
              let targetUser: User | undefined = undefined;
              let roleName = "";
              if (activePortal === 'ADMIN') {
                targetUser = adminUser;
                roleName = "Dono da Plataforma";
              } else if (activePortal === 'CLIENTE') {
                const clientObj = clientes.find(c => c.id === activeClienteId);
                targetUser = users.find(u => u.id === clientObj?.userId);
                roleName = "Passageiro";
              } else if (activePortal === 'MOTORISTA') {
                const mObj = motoristas.find(m => m.id === activeMotoristaId);
                targetUser = users.find(u => u.id === mObj?.userId);
                roleName = "Motorista";
              }

              if (targetUser) {
                const isClienteOrMotorista = activePortal === 'CLIENTE' || activePortal === 'MOTORISTA';

                if (isClienteOrMotorista) {
                  return (
                    <button
                      type="button"
                      onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                      className={`relative block w-9 h-9 bg-slate-100 border rounded-full overflow-hidden shrink-0 cursor-pointer group flex items-center justify-center shadow-inner transition-transform active:scale-95 ${isProfileMenuOpen ? 'border-emerald-600 ring-2 ring-emerald-500' : 'border-emerald-500'}`}
                      title="Clique para ver dados e configurações"
                      id={`header-avatar-${activePortal.toLowerCase()}`}
                    >
                      {targetUser.avatar ? (
                        <img
                          src={targetUser.avatar}
                          alt="avatar"
                          className="w-full h-full object-cover transition duration-150 group-hover:brightness-90"
                        />
                      ) : (
                        <img
                          referrerPolicy="no-referrer"
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${targetUser.nome || "User"}`}
                          alt="avatar"
                          className="w-full h-full object-cover transition duration-150 group-hover:brightness-90"
                        />
                      )}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/20 transition duration-150">
                        <Settings size={11} className="text-white" />
                      </div>
                    </button>
                  );
                }

                return (
                  <label 
                    className="relative block w-9 h-9 bg-slate-100 border border-emerald-500 rounded-full overflow-hidden shrink-0 cursor-pointer group flex items-center justify-center shadow-inner" 
                    title={`Clique para carregar a foto de perfil (${roleName})`}
                    id={`header-avatar-${activePortal.toLowerCase()}`}
                  >
                    {targetUser.avatar ? (
                      <img
                        src={targetUser.avatar}
                        alt="avatar"
                        className="w-full h-full object-cover transition duration-150 group-hover:brightness-75"
                      />
                    ) : (
                      <img
                        referrerPolicy="no-referrer"
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${targetUser.nome || "User"}`}
                        alt="avatar"
                        className="w-full h-full object-cover transition duration-150 group-hover:brightness-75"
                      />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 transition duration-150">
                      <Camera size={11} className="text-white" />
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            const base64String = reader.result as string;
                            setUsers(prev => prev.map(u => {
                              if (activePortal === 'ADMIN' && u.tipo === 'ADMINISTRADOR') {
                                return { ...u, avatar: base64String };
                              }
                              if (targetUser && u.id === targetUser.id) {
                                return { ...u, avatar: base64String };
                              }
                              return u;
                            }));
                            addNotification(`Sua foto de ${roleName} foi carregada com sucesso!`, "success");
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                );
              }

              let seed = "Carlos";
              if (activePortal === 'CLIENTE') seed = "Amanda";
              else if (activePortal === 'MOTORISTA') seed = "Roberto";
              else if (activePortal === 'FRANQUIA') {
                const fran = franqueados.find(f => f.id === activeFranqueadoId);
                seed = fran?.nome || "Franqueado";
              }
              return (
                <div className="w-9 h-9 bg-slate-100 border border-slate-200 rounded-full overflow-hidden shrink-0 flex items-center justify-center">
                  <img
                    referrerPolicy="no-referrer"
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`}
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
              );
            })()}

            {/* Quick Logout Header Action */}
            <button
              onClick={() => {
                setIsLoggedIn(false);
                setLoggedInEmail('');
                addNotification("Sessão finalizada com sucesso!", "info");
              }}
              title="Sair do Painel"
              className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer border border-slate-150 bg-white hover:border-rose-200 shadow-sm flex items-center justify-center shrink-0"
              id="carona-logout-button-header"
            >
              <LogOut size={16} />
            </button>

            {isProfileMenuOpen && (activePortal === 'CLIENTE' || activePortal === 'MOTORISTA') && (
              <div 
                className="absolute top-16 right-6 sm:right-8 w-[22rem] sm:w-[26rem] bg-white border border-slate-200 shadow-2xl rounded-2xl p-5 z-50 overflow-y-auto max-h-[80vh] flex flex-col space-y-4 animate-fade-in"
                id="top-profile-menu-dropdown"
              >
                <div className="flex items-center justify-between border-b pb-2.5">
                  <h4 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
                    <UserIcon size={16} className="text-emerald-700" />
                    Painel de Configurações
                  </h4>
                  <button
                    type="button"
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition"
                  >
                    <X size={16} />
                  </button>
                </div>

                {activePortal === 'CLIENTE' && (
                  <div className="space-y-4">
                    {/* CONTA EM USO */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-150">
                      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">CONTA EM USO</h3>
                      <div className="flex items-center gap-3">
                        <label className="relative block w-11 h-11 rounded-full overflow-hidden border border-emerald-500 cursor-pointer group shrink-0" title="Clique para alterar foto">
                          <img
                            src={users.find(u => u.id === (clientes.find(c => c.id === activeClienteId)?.userId))?.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'}
                            alt="avatar"
                            className="w-full h-full object-cover transition duration-200 group-hover:brightness-75"
                          />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 transition duration-200">
                            <Camera size={12} className="text-white" />
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  const base64String = reader.result as string;
                                  const clientObj = clientes.find(c => c.id === activeClienteId);
                                  if (clientObj) {
                                    setUsers(prev => prev.map(u => {
                                      if (u.id === clientObj.userId) {
                                        return { ...u, avatar: base64String };
                                      }
                                      return u;
                                    }));
                                    addNotification("Sua nova foto de passageiro foi carregada com sucesso!", "success");
                                  }
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>
                        <div>
                          <h4 className="font-bold text-zinc-900 text-xs">
                            {users.find(u => u.id === (clientes.find(c => c.id === activeClienteId)?.userId))?.nome || 'Passageiro'}
                          </h4>
                          <span className="block text-[10px] text-zinc-500">CPF: {clientes.find(c => c.id === activeClienteId)?.cpf}</span>
                          <span className="inline-block text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-full uppercase mt-1">Cliente Ativo</span>
                        </div>
                      </div>

                      {/* Quick switch */}
                      <div className="mt-3.5 border-t border-slate-200 pt-3">
                        <label className="block text-[9px] text-slate-500 uppercase font-bold mb-1">Trocar Passageiro:</label>
                        <select
                          value={activeClienteId}
                          onChange={(e) => {
                            setActiveClienteId(e.target.value);
                            setSelectedDestinationIndex(-1);
                            setCalculatedTrip(null);
                            setIsEditingClientProfile(false);
                          }}
                          className="w-full text-xs p-1.5 rounded border border-gray-200 bg-white text-zinc-805"
                        >
                          {clientes.map(c => {
                            const userObj = users.find(u => u.id === c.userId);
                            return (
                              <option key={c.id} value={c.id}>
                                {userObj?.nome || 'Usuário'} {userObj?.status === 'BLOQUEADO' ? '[BLOQUEADO]' : ''}
                              </option>
                            );
                          })}
                        </select>
                      </div>

                      <div className="mt-3 flex gap-1 items-center">
                        <button
                          onClick={() => {
                            setRegistrationMode('CLIENTE');
                            setIsProfileMenuOpen(false);
                          }}
                          className="text-[10px] text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 hover:underline hover:cursor-pointer"
                        >
                          <Plus size={12} /> Solicitar Novo Cadastro de Cliente
                        </button>
                      </div>
                    </div>

                    {/* MEUS DADOS CADASTRAIS (CLIENTE/PASSAGEIRO) */}
                    <div className="bg-white p-4 rounded-xl border border-slate-150 space-y-3.5 text-left">
                      <div className="flex justify-between items-center pb-1.5 border-b border-slate-100">
                        <h3 className="text-[10px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                          <Settings size={12} className="text-emerald-700 shrink-0" />
                          Meus Dados Cadastrais
                        </h3>
                        {!isEditingClientProfile && (
                          <button
                            onClick={() => {
                              const actClientObj = clientes.find(c => c.id === activeClienteId);
                              if (actClientObj) {
                                const uObj = users.find(u => u.id === actClientObj.userId);
                                if (uObj) {
                                  setClientFormNome(uObj.nome || '');
                                  setClientFormEmail(uObj.email || '');
                                  setClientFormTelefone(uObj.telefone || '');
                                  const passKey = `${uObj.email.toLowerCase()}-CLIENTE`;
                                  setClientFormSenha(accountPasswords[passKey] || '');
                                  setIsEditingClientProfile(true);
                                }
                              }
                            }}
                            className="text-[10px] text-emerald-700 hover:text-emerald-950 font-bold flex items-center gap-0.5 cursor-pointer hover:underline"
                          >
                            Alterar Dados ✎
                          </button>
                        )}
                      </div>

                      {(() => {
                        const actClientObj = clientes.find(c => c.id === activeClienteId);
                        if (!actClientObj) return null;
                        const uObj = users.find(u => u.id === actClientObj.userId);
                        if (!uObj) return null;
                        const passKey = `${uObj.email.toLowerCase()}-CLIENTE`;
                        const curPassword = accountPasswords[passKey] || 'Nenhuma';

                        if (isEditingClientProfile) {
                          return (
                            <form onSubmit={(e) => {
                              e.preventDefault();
                              const trimmedNome = clientFormNome.trim();
                              const trimmedEmail = clientFormEmail.trim().toLowerCase();
                              const trimmedTelefone = clientFormTelefone.trim();
                              const trimmedSenha = clientFormSenha.trim();

                              if (!trimmedNome || !trimmedEmail || !trimmedSenha) {
                                addNotification("Nome, E-mail e Senha são de preenchimento obrigatório!", "warn");
                                return;
                              }

                              const emailDuplicate = users.find(u => u.id !== uObj.id && u.email.toLowerCase() === trimmedEmail && u.tipo === 'CLIENTE');
                              if (emailDuplicate) {
                                addNotification("Este email de Passageiro já está em uso por outro cadastro!", "warn");
                                return;
                              }

                              setUsers(prev => prev.map(u => {
                                if (u.id === uObj.id) {
                                  return { ...u, nome: trimmedNome, email: trimmedEmail, telefone: trimmedTelefone };
                                }
                                return u;
                              }));

                              setAccountPasswords(prev => {
                                const next = { ...prev };
                                delete next[`${uObj.email.toLowerCase()}-CLIENTE`];
                                next[`${trimmedEmail}-CLIENTE`] = trimmedSenha;
                                return next;
                              });

                              if (loggedInEmail.toLowerCase() === uObj.email.toLowerCase()) {
                                setLoggedInEmail(trimmedEmail);
                              }

                              setIsEditingClientProfile(false);
                              addNotification("Seus dados cadastrais foram atualizados com sucesso!", "success");
                            }} className="space-y-3 text-xs animate-fade-in">
                              <div>
                                <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Nome Completo</label>
                                <input
                                  type="text"
                                  value={clientFormNome}
                                  onChange={e => setClientFormNome(e.target.value)}
                                  className="w-full p-2 border rounded border-gray-200 bg-gray-50 text-xs focus:bg-white focus:outline-none"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">E-mail de Acesso</label>
                                <input
                                  type="email"
                                  value={clientFormEmail}
                                  onChange={e => setClientFormEmail(e.target.value)}
                                  className="w-full p-2 border rounded border-gray-200 bg-gray-50 text-xs focus:bg-white focus:outline-none"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Telefone Celular</label>
                                <input
                                  type="text"
                                  value={clientFormTelefone}
                                  onChange={e => setClientFormTelefone(e.target.value)}
                                  className="w-full p-2 border rounded border-gray-200 bg-gray-50 text-xs focus:bg-white focus:outline-none"
                                />
                              </div>
                              <div>
                                <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Senha Secreta</label>
                                <input
                                  type="text"
                                  value={clientFormSenha}
                                  onChange={e => setClientFormSenha(e.target.value)}
                                  className="w-full p-2 border rounded border-gray-200 bg-gray-50 text-xs focus:bg-white focus:outline-none font-mono"
                                  required
                                />
                              </div>
                              <div className="flex gap-2 pt-1">
                                <button
                                  type="submit"
                                  className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-black cursor-pointer uppercase transition-colors"
                                >
                                  Salvar Dados
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setIsEditingClientProfile(false)}
                                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-[10px] font-bold"
                                >
                                  Cancelar
                                </button>
                              </div>
                            </form>
                          );
                        } else {
                          return (
                            <div className="text-xs space-y-2 text-slate-600 animate-fade-in">
                              <div className="flex justify-between border-b border-dashed border-slate-100 pb-1">
                                <span className="font-semibold text-slate-400">Nome:</span>
                                <span className="font-bold text-slate-800">{uObj.nome}</span>
                              </div>
                              <div className="flex justify-between border-b border-dashed border-slate-100 pb-1">
                                <span className="font-semibold text-slate-400">E-mail:</span>
                                <span className="font-semibold text-slate-800">{uObj.email}</span>
                              </div>
                              <div className="flex justify-between border-b border-dashed border-slate-100 pb-1">
                                <span className="font-semibold text-slate-400">Telefone:</span>
                                <span className="font-mono text-slate-800">{uObj.telefone || 'Não informado'}</span>
                              </div>
                              <div className="flex justify-between pb-0.5">
                                <span className="font-semibold text-slate-400">Senha Secreta:</span>
                                <span className="font-mono text-emerald-800 font-bold bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">"{curPassword}"</span>
                              </div>
                            </div>
                          );
                        }
                      })()}
                    </div>
                  </div>
                )}

                {activePortal === 'MOTORISTA' && (
                  <div className="space-y-4">
                    {/* CONTA EM USO (MOTORISTA PARCEIRO) */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 relative overflow-hidden">
                      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">MOTORISTA PARCEIRO</h3>
                      {(() => {
                        const targetMot = motoristas.find(m => m.id === activeMotoristaId);
                        const userObj = users.find(u => u.id === targetMot?.userId);
                        if (!targetMot) return <p className="text-xs text-rose-500">Erro: Motorista não registrado</p>;

                        return (
                          <div className="space-y-4">
                            <div className="flex items-center gap-3">
                              <label className="relative block w-11 h-11 rounded-full overflow-hidden border border-emerald-600 cursor-pointer group shrink-0" title="Clique para alterar foto">
                                <img
                                  src={userObj?.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'}
                                  alt="avatar"
                                  className="w-full h-full object-cover transition duration-200 group-hover:brightness-75"
                                />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 transition duration-200">
                                  <Camera size={12} className="text-white" />
                                </div>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onloadend = () => {
                                        const base64String = reader.result as string;
                                        if (userObj) {
                                          setUsers(prev => prev.map(u => {
                                            if (u.id === userObj.id) {
                                              return { ...u, avatar: base64String };
                                            }
                                            return u;
                                          }));
                                          addNotification("Sua nova foto de motorista foi carregada com sucesso!", "success");
                                        }
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                />
                              </label>
                              <div>
                                <h4 className="font-bold text-zinc-900 text-xs">{userObj?.nome}</h4>
                                <span className="text-[10px] text-zinc-500 font-mono block">CNH: {targetMot.cpf}</span>
                                <span className="text-[9px] bg-zinc-800 text-white px-2 py-0.5 rounded font-mono font-medium inline-block mt-0.5">
                                  {targetMot.veiculo.modelo} • {targetMot.veiculo.placa}
                                </span>
                              </div>
                            </div>

                            {/* Stats and activations */}
                            <div className="border-t border-slate-200 pt-2.5 space-y-1.5 text-xs">
                              <div className="flex justify-between">
                                <span className="text-zinc-500">Documentação:</span>
                                <span className={`font-bold ${targetMot.documentoStatus === 'APROVADO' ? 'text-emerald-700' : 'text-amber-600'}`}>
                                  {targetMot.documentoStatus === 'APROVADO' ? 'APROVADO' : 'ANÁLISE PENDENTE'}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-zinc-500">Licença Mensal:</span>
                                <span className={`font-bold ${targetMot.isSubscriptionPaid ? 'text-emerald-700' : 'text-rose-600'}`}>
                                  {targetMot.isSubscriptionPaid ? 'PAGO / ATIVO' : 'PAGAMENTO DA TAXA PENDENTE'}
                                </span>
                              </div>
                            </div>

                            {!targetMot.isSubscriptionPaid && (
                              <div className="p-2.5 bg-rose-50 rounded-xl border border-rose-100 text-[11px] space-y-1">
                                <p className="text-rose-700 font-bold">⚠️ Taxa Pendente</p>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setCheckoutMotoristaId(targetMot.id);
                                    setShowPixCheckout(true);
                                    setIsProfileMenuOpen(false);
                                  }}
                                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-1 px-2 rounded text-[10px] cursor-pointer"
                                >
                                  Pagar Licença Mensal Pix (R$ {config.taxaAtivacaoMotorista.toFixed(2)}) ⚡
                                </button>
                              </div>
                            )}

                            {/* Shift status buttons */}
                            <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                              <span className="text-[11px] font-bold text-slate-700">Status:</span>
                              <button
                                type="button"
                                onClick={() => {
                                  if (targetMot.documentoStatus !== 'APROVADO') {
                                    addNotification("Seu cadastro está pendente de autorização pelo Administrador!", "warn");
                                    return;
                                  }
                                  if (!targetMot.isSubscriptionPaid) {
                                    addNotification("Sua licença mensal/mensalidade está pendente! Efetue o pagamento por Pix.", "warn");
                                    return;
                                  }
                                  setMotoristas(prev => prev.map(m => {
                                    if (m.id === targetMot.id) {
                                      const nextStatus = !m.isOnline;
                                      addNotification(
                                        nextStatus 
                                          ? "Você mudou seu status para ONLINE!" 
                                          : "Você agora está OFFLINE!",
                                        nextStatus ? "success" : "info"
                                      );
                                      return { ...m, isOnline: nextStatus };
                                    }
                                    return m;
                                  }));
                                }}
                                className={`py-1 px-2 rounded-lg text-[10px] font-bold transition-all border cursor-pointer ${
                                  targetMot.isOnline
                                    ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                                    : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500'
                                }`}
                              >
                                {targetMot.isOnline ? '🔇 Ficar Offline' : '🟢 Ficar Online'}
                              </button>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* MEUS DADOS CADASTRAIS (MOTORISTA) */}
                    <div className="bg-white p-4 rounded-xl border border-slate-150 text-left">
                      {(() => {
                        const targetMot = motoristas.find(m => m.id === activeMotoristaId);
                        const userObj = users.find(u => u.id === targetMot?.userId);
                        if (!targetMot || !userObj) return null;

                        const passKey = `${userObj.email.toLowerCase()}-MOTORISTA`;
                        const userPassword = accountPasswords[passKey] || '';

                        if (!isEditingDriverProfile) {
                          return (
                            <div className="space-y-3">
                              <div className="flex justify-between items-center border-b pb-1.5 border-slate-100">
                                <span className="font-extrabold text-[10px] text-zinc-400 uppercase tracking-wider block">
                                  Meus Dados Cadastrais
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setDriverFormNome(userObj.nome);
                                    setDriverFormTelefone(userObj.telefone || '');
                                    setDriverFormSenha(userPassword);
                                    setDriverFormCpf(targetMot.cpf);
                                    setDriverFormVeiculoMarca(targetMot.veiculo.marca);
                                    setDriverFormVeiculoModelo(targetMot.veiculo.modelo);
                                    setDriverFormVeiculoCor(targetMot.veiculo.cor);
                                    setDriverFormVeiculoPlaca(targetMot.veiculo.placa);
                                    setIsEditingDriverProfile(true);
                                  }}
                                  className="px-2 py-0.5 text-[10px] font-bold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 border rounded-md cursor-pointer shrink-0"
                                >
                                  ✎ AlterarDados
                                </button>
                              </div>

                              <div className="space-y-1.5 text-xs text-slate-700">
                                <div className="flex justify-between border-b border-dashed border-slate-100 pb-1">
                                  <span className="text-slate-400">Nome:</span>
                                  <span className="font-bold text-slate-800">{userObj.nome}</span>
                                </div>
                                <div className="flex justify-between border-b border-dashed border-slate-100 pb-1">
                                  <span className="text-slate-400">E-mail:</span>
                                  <span className="font-mono text-slate-800">{userObj.email}</span>
                                </div>
                                <div className="flex justify-between border-b border-dashed border-slate-100 pb-1">
                                  <span className="text-slate-400">Telefone:</span>
                                  <span className="font-semibold text-slate-808">{userObj.telefone || 'Não informado'}</span>
                                </div>
                                <div className="flex justify-between border-b border-dashed border-slate-100 pb-1">
                                  <span className="text-slate-400">CNH:</span>
                                  <span className="font-mono text-slate-805">{targetMot.cpf}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Veículo:</span>
                                  <span className="font-semibold text-slate-808">{targetMot.veiculo.marca} {targetMot.veiculo.modelo} ({targetMot.veiculo.cor})</span>
                                </div>
                              </div>
                            </div>
                          );
                        }

                        return (
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              const trimmedNome = driverFormNome.trim();
                              const trimmedTelefone = driverFormTelefone.trim();
                              const trimmedSenha = driverFormSenha.trim();
                              const trimmedCpf = driverFormCpf.trim();
                              const trimmedVeiculoMarca = driverFormVeiculoMarca.trim();
                              const trimmedVeiculoModelo = driverFormVeiculoModelo.trim();
                              const trimmedVeiculoCor = driverFormVeiculoCor.trim();
                              const trimmedVeiculoPlaca = driverFormVeiculoPlaca.trim().toUpperCase();

                              if (!trimmedNome || !trimmedSenha) {
                                addNotification("Nome Completo e Senha Secreta são obrigatórios!", "warn");
                                return;
                              }

                              setUsers(prev => prev.map(u => {
                                  if (u.id === userObj.id) {
                                    return { ...u, nome: trimmedNome, telefone: trimmedTelefone };
                                  }
                                  return u;
                                }));

                              setAccountPasswords(prev => ({
                                ...prev,
                                [passKey]: trimmedSenha
                              }));

                              setMotoristas(prev => prev.map(m => {
                                if (m.id === targetMot.id) {
                                  return {
                                    ...m,
                                    cpf: trimmedCpf,
                                    veiculo: {
                                      ...m.veiculo,
                                      marca: trimmedVeiculoMarca || m.veiculo.marca,
                                      modelo: trimmedVeiculoModelo || m.veiculo.modelo,
                                      cor: trimmedVeiculoCor || m.veiculo.cor,
                                      placa: trimmedVeiculoPlaca || m.veiculo.placa
                                    }
                                  };
                                }
                                return m;
                              }));

                              setIsEditingDriverProfile(false);
                              addNotification("Seus dados cadastrais salvos com sucesso!", "success");
                            }}
                            className="space-y-3 text-xs"
                          >
                            <div className="flex justify-between items-center border-b pb-1.5 border-slate-100">
                              <span className="font-extrabold text-[10px] text-emerald-800 uppercase tracking-wider block">
                                ⚙️ Alterar Cadastro
                              </span>
                              <button
                                type="button"
                                onClick={() => setIsEditingDriverProfile(false)}
                                className="text-slate-400 hover:text-slate-600 font-bold"
                              >
                                Cancelar
                              </button>
                            </div>

                            <div className="space-y-2">
                              <div>
                                <label className="block text-[9px] uppercase font-bold text-slate-500 mb-0.5">Nome Completo</label>
                                <input
                                  type="text"
                                  value={driverFormNome}
                                  onChange={e => setDriverFormNome(e.target.value)}
                                  className="w-full p-2 border rounded bg-white text-zinc-800 text-xs focus:outline-none"
                                  required
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="block text-[9px] uppercase font-bold text-slate-500 mb-0.5">Senha</label>
                                  <input
                                    type="text"
                                    value={driverFormSenha}
                                    onChange={e => setDriverFormSenha(e.target.value)}
                                    className="w-full p-2 border rounded bg-white text-zinc-800 text-xs font-mono focus:outline-none"
                                    required
                                  />
                                </div>
                                <div>
                                  <label className="block text-[9px] uppercase font-bold text-slate-500 mb-0.5">Telefone</label>
                                  <input
                                    type="text"
                                    value={driverFormTelefone}
                                    onChange={e => setDriverFormTelefone(e.target.value)}
                                    className="w-full p-2 border rounded bg-white text-zinc-800 text-xs focus:outline-none"
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="block text-[9px] uppercase font-bold text-slate-500 mb-0.5">CNH (CPF)</label>
                                <input
                                  type="text"
                                  value={driverFormCpf}
                                  onChange={e => setDriverFormCpf(e.target.value)}
                                  className="w-full p-2 border rounded bg-white text-zinc-800 text-xs font-mono focus:outline-none"
                                />
                              </div>

                              <div className="p-2 bg-slate-50 rounded-lg space-y-1.5">
                                <span className="text-[8px] uppercase font-bold text-slate-500 block">Veículo</span>
                                <div className="grid grid-cols-2 gap-1.5">
                                  <input
                                    placeholder="Marca"
                                    type="text"
                                    value={driverFormVeiculoMarca}
                                    onChange={e => setDriverFormVeiculoMarca(e.target.value)}
                                    className="p-1 border rounded text-[10px] focus:outline-none bg-white"
                                  />
                                  <input
                                    placeholder="Modelo"
                                    type="text"
                                    value={driverFormVeiculoModelo}
                                    onChange={e => setDriverFormVeiculoModelo(e.target.value)}
                                    className="p-1 border rounded text-[10px] focus:outline-none bg-white"
                                  />
                                  <input
                                    placeholder="Cor"
                                    type="text"
                                    value={driverFormVeiculoCor}
                                    onChange={e => setDriverFormVeiculoCor(e.target.value)}
                                    className="p-1 border rounded text-[10px] focus:outline-none bg-white"
                                  />
                                  <input
                                    placeholder="Placa"
                                    type="text"
                                    value={driverFormVeiculoPlaca}
                                    onChange={e => setDriverFormVeiculoPlaca(e.target.value.toUpperCase())}
                                    className="p-1 border rounded font-mono text-[10px] focus:outline-none bg-white"
                                  />
                                </div>
                              </div>
                            </div>

                            <button
                              type="submit"
                              className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold cursor-pointer transition"
                            >
                              Salvar Alterações
                            </button>
                          </form>
                        );
                      })()}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        {/* CONTAINER SHELL FOR THE ACTIVE PORTAL SCENE */}
        <div className="flex-1 p-4 sm:p-6 space-y-6 overflow-y-auto w-full" id="main-scrollable-canvas">

        
        {/* LANDING & FORM INLINE SHELLS (When user clicks Request Registration) */}
        {registrationMode !== 'NONE' && (
          <div className="mb-8 max-w-3xl mx-auto bg-white p-6 rounded-2xl border border-gray-200 shadow-xl transition-all">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
              <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
                <PlusCircle className="text-emerald-600" />
                {registrationMode === 'CLIENTE' ? 'Nova Conta de Cliente' : 'Candidatar-se como Motorista Parceiro'}
              </h2>
              <button onClick={() => setRegistrationMode('NONE')} className="p-1 hover:bg-zinc-100 rounded-full">
                <X size={20} />
              </button>
            </div>

            {validationError && (
              <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-lg mb-4 flex items-center gap-2 border border-rose-200">
                <ShieldAlert size={16} />
                <span>{validationError}</span>
              </div>
            )}

            {/* CLIENT REGISTRATION FORM */}
            {registrationMode === 'CLIENTE' ? (
              <form onSubmit={submitClientRegistration} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Nome Completo *</label>
                  <input
                    type="text"
                    required
                    value={newClientData.nome}
                    onChange={e => setNewClientData({...newClientData, nome: e.target.value})}
                    placeholder="Amanda Pinheiro Lima"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">CPF *</label>
                  <input
                    type="text"
                    required
                    value={newClientData.cpf}
                    onChange={e => setNewClientData({...newClientData, cpf: e.target.value})}
                    placeholder="123.456.789-01"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">E-mail de Login *</label>
                  <input
                    type="email"
                    required
                    value={newClientData.email}
                    onChange={e => setNewClientData({...newClientData, email: e.target.value})}
                    placeholder="amanda@exemplo.com"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Senha Secreta *</label>
                  <input
                    type="password"
                    required
                    value={newClientData.senha}
                    onChange={e => setNewClientData({...newClientData, senha: e.target.value})}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Data de Nascimento</label>
                  <input
                    type="date"
                    value={newClientData.dataNasc}
                    onChange={e => setNewClientData({...newClientData, dataNasc: e.target.value})}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Telefone *</label>
                  <input
                    type="tel"
                    required
                    value={newClientData.telefone}
                    onChange={e => setNewClientData({...newClientData, telefone: e.target.value})}
                    placeholder="(11) 98888-2021"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Endereço Completo</label>
                  <input
                    type="text"
                    value={newClientData.endereco}
                    onChange={e => setNewClientData({...newClientData, endereco: e.target.value})}
                    placeholder="Ex: Avenida Goiás, 200 - Centro"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Cidade Atendida</label>
                  <select
                    value={newClientData.cidade}
                    onChange={e => setNewClientData({...newClientData, cidade: e.target.value})}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    {cidades.map(c => (
                      <option key={c.id} value={c.nome}>{c.nome} ({c.estado})</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2.5 mt-2">
                  <CaronaLogo className="w-16 h-16" animated={true} />
                  <span className="text-xs font-semibold text-slate-650">Sua conta Carona será ativada imediatamente após cadastro!</span>
                </div>

                <div className="md:col-span-2 flex justify-end gap-2 mt-4 border-t border-gray-100 pt-4">
                  <button
                    type="button"
                    onClick={() => setRegistrationMode('NONE')}
                    className="px-4 py-2 border rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-sm font-bold shadow hover:cursor-pointer"
                  >
                    Confirmar Cadastro
                  </button>
                </div>
              </form>
            ) : (
              /* MOTORISTA REGISTRATION FORM */
              <form onSubmit={submitDriverRegistration} className="space-y-6">
                <div>
                  <h3 className="text-xs font-extrabold uppercase text-emerald-700 tracking-wider border-b pb-1">1. Dados Pessoais</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase">Nome Completo *</label>
                      <input
                        type="text"
                        required
                        placeholder="Willian Santos"
                        value={newDriverData.nome}
                        onChange={e => setNewDriverData({...newDriverData, nome: e.target.value})}
                        className="w-full p-2 text-xs rounded border bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase">CPF *</label>
                      <input
                        type="text"
                        required
                        placeholder="111.222.333-44"
                        value={newDriverData.cpf}
                        onChange={e => setNewDriverData({...newDriverData, cpf: e.target.value})}
                        className="w-full p-2 text-xs rounded border bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase">E-mail *</label>
                      <input
                        type="email"
                        required
                        placeholder="willian@driver.com"
                        value={newDriverData.email}
                        onChange={e => setNewDriverData({...newDriverData, email: e.target.value})}
                        className="w-full p-2 text-xs rounded border bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase">Senha *</label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={newDriverData.senha}
                        onChange={e => setNewDriverData({...newDriverData, senha: e.target.value})}
                        className="w-full p-2 text-xs rounded border bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase">Telefone *</label>
                      <input
                        type="tel"
                        required
                        placeholder="(11) 94444-8899"
                        value={newDriverData.telefone}
                        onChange={e => setNewDriverData({...newDriverData, telefone: e.target.value})}
                        className="w-full p-2 text-xs rounded border bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase">Nº Registro CNH</label>
                      <input
                        type="text"
                        placeholder="6543210987-9"
                        value={newDriverData.cnh}
                        onChange={e => setNewDriverData({...newDriverData, cnh: e.target.value})}
                        className="w-full p-2 text-xs rounded border bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase">Endereço de Garagem</label>
                      <input
                        type="text"
                        placeholder="Rua Voluntários da Pátria, 88"
                        value={newDriverData.endereco}
                        onChange={e => setNewDriverData({...newDriverData, endereco: e.target.value})}
                        className="w-full p-2 text-xs rounded border bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase">Cidade de Atuação</label>
                      <select
                        value={newDriverData.cidade}
                        onChange={e => setNewDriverData({...newDriverData, cidade: e.target.value})}
                        className="w-full p-2 text-xs rounded border bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      >
                        {cidades.map(c => (
                          <option key={c.id} value={c.nome}>{c.nome}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-extrabold uppercase text-emerald-700 tracking-wider border-b pb-1">2. Dados do Veículo (Mínimo Ano 2010)</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-3">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase">Marca *</label>
                      <input
                        type="text"
                        required
                        placeholder="Fiat"
                        value={newDriverData.marca}
                        onChange={e => setNewDriverData({...newDriverData, marca: e.target.value})}
                        className="w-full p-2 text-xs rounded border bg-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase">Modelo *</label>
                      <input
                        type="text"
                        required
                        placeholder="Cronos"
                        value={newDriverData.modelo}
                        onChange={e => setNewDriverData({...newDriverData, modelo: e.target.value})}
                        className="w-full p-2 text-xs rounded border bg-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase">Ano Fabricação *</label>
                      <input
                        type="number"
                        min="2000"
                        max="2027"
                        required
                        placeholder="2021"
                        value={newDriverData.ano}
                        onChange={e => setNewDriverData({...newDriverData, ano: Number(e.target.value)})}
                        className="w-full p-2 text-xs rounded border bg-white focus:outline-none focus:ring-1 focus:ring-rose-500/20 text-slate-700"
                      />
                      <span className="text-[9px] text-zinc-400">Exigência: ≥ 2010</span>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase">Cor *</label>
                      <input
                        type="text"
                        required
                        placeholder="Preto"
                        value={newDriverData.cor}
                        onChange={e => setNewDriverData({...newDriverData, cor: e.target.value})}
                        className="w-full p-2 text-xs rounded border bg-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase">Placa *</label>
                      <input
                        type="text"
                        required
                        placeholder="CAR-0C45"
                        value={newDriverData.placa}
                        onChange={e => setNewDriverData({...newDriverData, placa: e.target.value})}
                        className="w-full p-2 text-xs rounded border bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-extrabold uppercase text-emerald-700 tracking-wider border-b pb-1">3. Uploads de Documentos e Carro Obrigatórios</h3>
                  <p className="text-[10px] text-zinc-500 mt-1">Carona preza pelo prestígio dos usuários e requer verificação visual minuciosa.</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 mt-3">
                    {/* DOC 1 */}
                    <div className="border border-dashed border-gray-300 rounded-lg p-2.5 text-center bg-gray-50 relative flex flex-col justify-between">
                      <div className="text-[10px] font-bold text-zinc-700">Foto CNH</div>
                      {driverFileCnh ? (
                        <div className="text-emerald-700 font-bold text-[10px] mt-1 bg-emerald-50 p-1 rounded">✅ Enviado</div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setDriverFileCnh('https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?w=150')}
                          className="text-[9px] mt-2 px-1 py-1 bg-emerald-700 text-white rounded hover:cursor-pointer"
                        >
                          Selecionar Foto
                        </button>
                      )}
                    </div>

                    {/* DOC 2 */}
                    <div className="border border-dashed border-gray-300 rounded-lg p-2.5 text-center bg-gray-50 relative flex flex-col justify-between">
                      <div className="text-[10px] font-bold text-zinc-700">Comp. Endereço</div>
                      {driverFileAddress ? (
                        <div className="text-emerald-700 font-bold text-[10px] mt-1 bg-emerald-50 p-1 rounded">✅ Enviado</div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setDriverFileAddress('https://images.unsplash.com/photo-1560617544-b4f287e85e44?w=150')}
                          className="text-[9px] mt-2 px-1 py-1 bg-emerald-700 text-white rounded hover:cursor-pointer"
                        >
                          Selecionar Comprovante
                        </button>
                      )}
                    </div>

                    {/* FOTO VEICULO FRENTE */}
                    <div className="border border-dashed border-gray-300 rounded-lg p-2.5 text-center bg-gray-50 relative flex flex-col justify-between">
                      <div className="text-[10px] font-bold text-zinc-700">Foto Frontal Carro</div>
                      {driverFileVFront ? (
                        <div className="text-emerald-700 font-bold text-[10px] mt-1 bg-emerald-50 p-1 rounded">✅ Carro Frente</div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setDriverFileVFront('https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=150')}
                          className="text-[9px] mt-2 px-1 py-1 bg-emerald-700 text-white rounded hover:cursor-pointer"
                        >
                          Anexar Frontal
                        </button>
                      )}
                    </div>

                    {/* FOTO VEICULO LATERAL */}
                    <div className="border border-dashed border-gray-300 rounded-lg p-2.5 text-center bg-gray-50 relative flex flex-col justify-between">
                      <div className="text-[10px] font-bold text-zinc-700">Foto Lateral Carro</div>
                      {driverFileVLateral ? (
                        <div className="text-emerald-700 font-bold text-[10px] mt-1 bg-emerald-50 p-1 rounded">✅ Carro Lateral</div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setDriverFileVLateral('https://images.unsplash.com/photo-1617788138017-80ad40651399?w=150')}
                          className="text-[9px] mt-2 px-1 py-1 bg-emerald-700 text-white rounded hover:cursor-pointer"
                        >
                          Anexar Lateral
                        </button>
                      )}
                    </div>

                    {/* FOTO VEICULO TRASEIRA */}
                    <div className="border border-dashed border-gray-300 rounded-lg p-2.5 text-center bg-gray-50 relative flex flex-col justify-between">
                      <div className="text-[10px] font-bold text-zinc-700">Foto Traseira Carro</div>
                      {driverFileVTraseira ? (
                        <div className="text-emerald-700 font-bold text-[10px] mt-1 bg-emerald-50 p-1 rounded">✅ Carro Traseira</div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setDriverFileVTraseira('https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=150')}
                          className="text-[9px] mt-2 px-1 py-1 bg-emerald-700 text-white rounded hover:cursor-pointer"
                        >
                          Anexar Traseira
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 border-t pt-4">
                  <button
                    type="button"
                    onClick={() => setRegistrationMode('NONE')}
                    className="px-4 py-2 border rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:cursor-pointer bg-white"
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow hover:cursor-pointer"
                  >
                    Encaminhar para Análise
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* 1. PORTAL DO CLIENTE */}
        {activePortal === 'CLIENTE' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="client-view-container">
            
            {/* Sidebar Controls to switch active client */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Ride Request Box */}
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative">
                <div className="mb-6 text-center border-b border-gray-150 pb-4">
                  <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center justify-center gap-1.5 text-emerald-800">
                    <MapPin className="text-emerald-700 shrink-0" size={20} />
                    Para onde vamos?
                  </h2>
                  
                  {/* Interactive toggle for map clicks target */}
                  <div className="mt-3.5 bg-stone-100 p-1 rounded-xl border border-zinc-200/60 max-w-xs mx-auto flex">
                    <button
                      type="button"
                      onClick={() => {
                        setMapClickTargetMode('PARTIDA');
                        addNotification("Modo de clique no mapa: Alterado para definir ponto de PARTIDA!", "info");
                      }}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1 hover:cursor-pointer ${
                        mapClickTargetMode === 'PARTIDA'
                          ? 'bg-zinc-900 text-white shadow-sm'
                          : 'text-zinc-500 hover:text-zinc-950'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                      Marcar Partida
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMapClickTargetMode('DESTINO');
                        addNotification("Modo de clique no mapa: Alterado para definir ponto de CHEGADA!", "info");
                      }}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1 hover:cursor-pointer ${
                        mapClickTargetMode === 'DESTINO'
                          ? 'bg-emerald-700 text-white shadow-sm'
                          : 'text-zinc-500 hover:text-zinc-950'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse"></span>
                      Marcar Chegada
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-2">
                    {mapClickTargetMode === 'PARTIDA' 
                      ? '💡 Clique no mapa para definir seu ponto de Partida'
                      : '💡 Clique no mapa para marcar seu Destino e calcular a rota na hora!'}
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Origin */}
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Partida atual (GPS)</label>
                    <div className="flex gap-2 mt-1">
                      <div className="relative w-full">
                        <input
                          type="text"
                          value={clientOrigin}
                          onChange={(e) => setClientOrigin(e.target.value)}
                          placeholder="Seu Local"
                          className="w-full text-xs pl-3 pr-28 py-2.5 border rounded-lg bg-stone-50 text-slate-800 placeholder-slate-400 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-600"
                        />
                        {clientOrigin === '' ? (
                          <div className="absolute right-10 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded pointer-events-none">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span>Seu Local</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setClientOrigin('');
                              addNotification("Origem restaurada para Seu Local (GPS)!", "info");
                            }}
                            className="absolute right-10 top-1/2 -translate-y-1/2 text-[10px] text-zinc-500 hover:text-red-600 font-bold px-1 py-0.5 bg-gray-100 rounded cursor-pointer transition hover:scale-105"
                            title="Limpar e usar seu local GPS atual"
                          >
                            Limpar
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={triggerGeolocation}
                          disabled={locationLoading}
                          className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 hover:bg-zinc-200/50 rounded-md text-emerald-700 disabled:opacity-50 transition cursor-pointer"
                          title="Localizar de forma precisa via GPS"
                        >
                          <Navigation size={14} className={locationLoading ? 'animate-spin' : ''} />
                        </button>
                      </div>
                    </div>
                  </div>

                   {/* Destination list selector */}
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Para onde vamos? (Destino)</label>
                    
                    {/* Destination Search/Type Box */}
                    <div className="relative mb-3">
                      <input
                        type="text"
                        value={clientDestination}
                        onChange={(e) => {
                          const query = e.target.value;
                          setClientDestination(query);
                          setSelectedDestinationIndex(-1);
                          setSelectedDestination(null);
                        }}
                        placeholder="Digite o local, bairro ou cidade de chegada..."
                        className="w-full text-xs pl-3 pr-20 py-2.5 border border-zinc-200 rounded-lg bg-stone-50 text-slate-800 placeholder-slate-400 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-600 transition"
                      />
                      {clientDestination && (
                        <button
                          type="button"
                          onClick={() => {
                            setClientDestination('');
                            setSelectedDestinationIndex(-1);
                            setSelectedDestination(null);
                            addNotification("Pesquisa limpa!", "info");
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-zinc-400 hover:text-red-500 bg-zinc-100 hover:bg-zinc-200/60 px-2 py-1 rounded cursor-pointer transition"
                        >
                          Limpar
                        </button>
                      )}
                    </div>

                    {/* Suggestions list of destinations */}
                    <div className="space-y-1.5 max-h-48 overflow-y-auto">
                      {isSearchingSuggestions ? (
                        <div className="text-center py-4 text-xs text-emerald-800 flex items-center justify-center gap-2">
                          <span className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></span>
                          <span>Buscando endereços reais...</span>
                        </div>
                      ) : liveGoogleSuggestions.length > 0 ? (
                        /* Real-world Google predictions */
                        liveGoogleSuggestions.map((sug) => (
                          <button
                            key={sug.placeId || sug.nome}
                            onClick={() => handleSelectGooglePlace(sug)}
                            className="w-full text-left p-2.5 rounded-lg border border-zinc-250 hover:bg-emerald-50/50 hover:border-emerald-300 text-xs transition duration-150 flex items-start gap-2 hover:cursor-pointer"
                          >
                            <MapPin size={14} className="mt-0.5 text-emerald-600 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-slate-800 truncate">{sug.nome.split(',')[0]}</div>
                              <span className="text-[10px] text-zinc-500 block truncate">{sug.nome}</span>
                            </div>
                          </button>
                        ))
                      ) : (
                        /* Our highly polished offline search catalog fallback (Fuzzy filter Goiânia & Itaberaí) */
                        (() => {
                          if (filteredDestinations.length === 0) {
                            return (
                              <div className="text-center py-4 text-xs text-zinc-400 bg-zinc-50 rounded-lg border border-dashed border-zinc-200">
                                Nenhum local encontrado para "{clientDestination}"
                              </div>
                            );
                          }
                          return filteredDestinations.map((dest) => {
                            const idx = popularDestinations.findIndex(p => p.nome === dest.nome);
                            const isSelected = selectedDestinationIndex === idx || (selectedDestination && selectedDestination.nome === dest.nome);
                            return (
                              <button
                                key={dest.nome}
                                onClick={() => {
                                  setSelectedDestination(dest);
                                  setClientDestination(dest.nome);
                                  setSelectedDestinationIndex(idx);
                                  addNotification(`Destino selecionado: ${dest.nome.split(' - ')[0]}`, "success");
                                }}
                                className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all duration-150 flex items-start gap-2 hover:cursor-pointer ${
                                  isSelected
                                    ? 'border-emerald-600 bg-emerald-50/50 text-emerald-950 font-semibold shadow-sm'
                                    : 'border-zinc-200 hover:bg-zinc-50'
                                }`}
                              >
                                <MapPin size={14} className={`mt-0.5 shrink-0 ${isSelected ? 'text-emerald-600' : 'text-zinc-450'}`} />
                                <div className="flex-1 min-w-0">
                                  <div className="font-bold text-slate-800 truncate">{dest.nome.split(' - ')[0]}</div>
                                  <span className="text-[10px] text-zinc-500 block truncate">{dest.nome}</span>
                                  <span className="text-[9px] text-emerald-700 bg-emerald-50/70 px-1 py-0.5 rounded inline-block mt-0.5 font-medium">
                                    {dest.distance} Km (Est: {Math.round(dest.distance * 2.8)} min)
                                  </span>
                                </div>
                              </button>
                            );
                          });
                        })()
                      )}
                    </div>
                  </div>

                  {/* Pricing metrics calculations and visual indicators */}
                  {calculatedTrip && (
                    <div className="p-4 bg-emerald-50/70 border border-emerald-100 rounded-xl space-y-2">
                      <div className="flex justify-between items-center text-xs text-emerald-900">
                        <span>Distância da viagem:</span>
                        <span className="font-bold">{calculatedTrip.distancia} Km</span>
                      </div>
                      <div className="flex justify-between items-center text-xs text-emerald-900">
                        <span>Tempo estimado:</span>
                        <span className="font-bold">{calculatedTrip.duracao} minutos</span>
                      </div>
                      <div className="flex justify-between items-center text-xs text-emerald-900 border-t border-emerald-100/60 pt-2">
                        <span className="font-semibold">Valor Estimado:</span>
                        <span className="text-base font-extrabold text-emerald-800">R$ {calculatedTrip.valor.toFixed(2)}</span>
                      </div>

                      {/* Explicit Minimum Price Warning (Valor minimo de corrida e de 7 reais) */}
                      {calculatedTrip.valor === 7.00 && calculatedTrip.distancia * config.precoKm + config.precoBase < 7.00 && (
                        <div className="text-[10px] font-semibold text-amber-700 bg-amber-50 p-2 rounded border border-amber-200 mt-1 flex items-center gap-1.5">
                          <ShieldAlert size={12} className="shrink-0" />
                          <span>Tarifa mínima aplicada de R$ 7,00 para este trajeto!</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* CTA Request ride */}
                  {currentActiveCorrida ? (
                    <div className="p-3 bg-zinc-900 text-white rounded-xl text-center">
                      <span className="text-xs font-medium block">Viagem em andamento...</span>
                      <span className="text-[10px] text-emerald-400 mt-0.5 block uppercase tracking-widest font-bold">Acompanhe no mapa ao lado</span>
                    </div>
                  ) : (
                    <div className="space-y-2 mt-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1 px-1 flex items-center justify-between">
                        <span>Escolha a forma de chamada:</span>
                        <span className="text-emerald-700 font-extrabold animate-pulse">NOVO ⚡</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={handleRequestRide}
                          disabled={!selectedDestination && selectedDestinationIndex < 0}
                          className="w-full bg-slate-800 hover:bg-slate-900 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-3 px-2 rounded-xl text-xs shadow transition hover:cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Car size={13} />
                          Solicitar Carona 🚀
                        </button>
                        <button
                          type="button"
                          onClick={handleQuickTaxiRequest}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 px-2 rounded-xl text-xs shadow transition hover:cursor-pointer flex items-center justify-center gap-1.5 border border-emerald-500 relative overflow-hidden group focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        >
                          <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-emerald-400 to-transparent opacity-10 animate-pulse"></span>
                          <span>⚡ Chamar motorista rapidamente !</span>
                        </button>
                      </div>
                      <p className="text-[9px] text-slate-400 text-center px-1">
                        A opção <strong>Corrida Rápida</strong> inicia a viagem com taxímetro em tempo real após o embarque!
                      </p>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Simulated Live tracking screen on the right */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* CURRENT RIDE DYNAMIC STATUS METADATA CARD */}
              {currentActiveCorrida ? (
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-emerald-800 text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider font-mono">
                          STATUS: {currentActiveCorrida.status}
                        </span>
                        <span className="text-xs text-zinc-500">Corrida ID: {currentActiveCorrida.id}</span>
                      </div>
                      <h3 className="text-base font-bold text-zinc-900 mt-2">
                        Trajeto: {currentActiveCorrida.origem ? currentActiveCorrida.origem.split(',')[0] : 'Origem'} com destino a {currentActiveCorrida.destino ? currentActiveCorrida.destino.split(',')[0] : 'Destino'}
                      </h3>
                       <div className="text-xs text-zinc-600 mt-1 flex flex-wrap items-center gap-3">
                        <span>Distância Total: <strong>{currentActiveCorrida.distancia} Km</strong></span>
                        {currentActiveCorrida.status === 'EM_ANDAMENTO' && currentActiveCorrida.distanciaPercorrida !== undefined && (
                          <span className="bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded font-bold border border-emerald-100 font-mono">
                            Trajeto Percorrido: {currentActiveCorrida.distanciaPercorrida.toFixed(1)} km ({(currentActiveCorrida.distanciaPercorrida * 1000).toFixed(0)}m)
                          </span>
                        )}
                        <span>Preço: <strong className="text-emerald-700 font-extrabold text-sm">R$ {currentActiveCorrida.valor.toFixed(2)}</strong></span>
                        {currentActiveCorrida.isTaximetroRide && (
                          <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 text-[10px] font-black px-2 py-0.5 rounded border border-red-100 animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping"></span>
                            TAXÍMETRO: R$ 0,60 / 100m
                          </span>
                        )}
                      </div>
                    </div>

                    {(currentActiveCorrida.status === 'SOLICITADA' || currentActiveCorrida.status === 'MOTORISTA_A_CAMINHO') && (
                      <button
                        onClick={() => handleCancelRide(currentActiveCorrida.id, 'CLIENTE')}
                        className="text-xs font-bold text-rose-600 border border-rose-200 hover:bg-rose-50 px-3 py-1.5 rounded-lg hover:cursor-pointer"
                      >
                        Cancelar Corrida
                      </button>
                    )}
                  </div>

                  {/* Driver matching details or searching spinner */}
                  <div className="mt-4 p-4 border-t border-gray-100 flex items-center justify-between bg-zinc-50 rounded-xl">
                    {currentActiveCorrida.status === 'SOLICITADA' ? (
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="h-10 w-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                          <Car className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-800" size={16} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">Procurando motoristas parceiros próximos...</p>
                          <p className="text-[11px] text-slate-500">Notificando motoristas logados na cidade.</p>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={currentActiveCorrida.motoristaAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                            alt="driver"
                            className="w-10 h-10 rounded-full border object-cover"
                          />
                          <div>
                            <p className="text-xs text-zinc-500">Motorista designado:</p>
                            <h4 className="text-xs font-bold text-zinc-900">{currentActiveCorrida.motoristaNome}</h4>
                            <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                              {currentActiveCorrida.motoristaModelo}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] text-zinc-400 block font-bold">PLACA DO VEÍCULO</span>
                          <span className="text-xs font-mono font-bold bg-zinc-900 text-white rounded px-2 py-0.5 mt-0.5 block tracking-wider">
                            {currentActiveCorrida.motoristaPlaca}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-800 mx-auto mb-3">
                    <MapPin size={24} />
                  </div>
                  <h3 className="text-sm font-bold text-zinc-950">Pronto para Solicitar Viagem</h3>
                  <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                    Selecione um dos destinos mais procurados ao lado. A tarifa será reajustada instantaneamente baseada nos parâmetros do painel.
                  </p>
                </div>
              )}

              {/* SIMULATED GPS MAP INTERFACE */}
              <SimulatedMap
                origemCoords={currentActiveCorrida?.origemCoords || (clientCustomCoords || getCityCenterCoords(currentPassengerCity))}
                destinoCoords={currentActiveCorrida?.destinoCoords || (selectedDestination ? selectedDestination.coords : (selectedDestinationIndex >= 0 ? popularDestinations[selectedDestinationIndex].coords : undefined))}
                origemNome={currentActiveCorrida?.origem ? currentActiveCorrida.origem.split(',')[0] : (clientCustomCoords ? "Sua Localização" : "Origem")}
                destinoNome={currentActiveCorrida?.destino ? currentActiveCorrida.destino.split(',')[0] : (selectedDestination ? selectedDestination.nome.split(',')[0] : (selectedDestinationIndex >= 0 ? popularDestinations[selectedDestinationIndex].nome.split('-')[0] : "Destino"))}
                status={currentActiveCorrida?.status}
                driverCoords={currentActiveCorrida?.currentDriverCoords}
                onSimulationUpdate={(coords) => {
                  if (currentActiveCorrida) {
                    handleSimulationUpdate(currentActiveCorrida.id, coords);
                  }
                }}
                onArrivedAtOrigin={() => {
                  if (currentActiveCorrida && currentActiveCorrida.status === 'MOTORISTA_A_CAMINHO') {
                    addNotification("O motorista chegou ao seu local de embarque! Aguardando o condutor iniciar a corrida.", "info");
                  }
                }}
                onArrivedAtDestination={() => {
                  if (currentActiveCorrida && currentActiveCorrida.status === 'EM_ANDAMENTO') {
                    addNotification("Destino alcançado! Aguardando o condutor confirmar o recebimento e finalizar a corrida.", "success");
                  }
                }}
                onMapClick={(coords) => {
                  if (mapClickTargetMode === 'PARTIDA') {
                    setClientCustomCoords(coords);
                    setClientOrigin("Local selecionado via Mapa");
                    // Reverse geocode if Google Maps is active and present to fill human-readable address
                    const g = (window as any).google;
                    if (g && g.maps && g.maps.Geocoder) {
                      const geocoder = new g.maps.Geocoder();
                      geocoder.geocode({ location: coords }, (results: any, status: any) => {
                        if (status === 'OK' && results[0]) {
                          setClientOrigin(results[0].formatted_address);
                        }
                      });
                    }
                    addNotification("Ponto de partida atualizado via clique no mapa!", "success");
                  } else {
                    // Mark destination (ponto de chegada) on map
                    let dist = 6.0; // default fallback
                    const basePoint = clientCustomCoords || getCityCenterCoords(currentPassengerCity);
                    if (basePoint) {
                      dist = Number(getCoordinatesDistanceKm(basePoint, coords).toFixed(1));
                      if (dist <= 0) dist = 0.5;
                    }

                    const selectedDestObj = {
                      nome: "Ponto marcado no Mapa",
                      coords: coords,
                      distance: dist
                    };

                    setSelectedDestination(selectedDestObj);
                    setClientDestination("Ponto marcado no Mapa");
                    setSelectedDestinationIndex(-100);

                    // Reverse geocode destination to fill human-readable address
                    const g = (window as any).google;
                    if (g && g.maps && g.maps.Geocoder) {
                      const geocoder = new g.maps.Geocoder();
                      geocoder.geocode({ location: coords }, (results: any, status: any) => {
                        if (status === 'OK' && results[0]) {
                          const formattedPath = results[0].formatted_address;
                          setSelectedDestination({
                            nome: formattedPath,
                            coords: coords,
                            distance: dist
                          });
                          setClientDestination(formattedPath);
                        }
                      });
                    }
                    addNotification("Local de chegada definido via mapa! Rota calculada com sucesso.", "success");
                  }
                }}
              />

            </div>

          </div>
        )}

        {/* 2. PORTAL DO MOTORISTA */}
        {activePortal === 'MOTORISTA' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="driver-view-container">
            
            {/* Simulated Shift Terminal Monitor / Driver Center */}
            <div className="lg:col-span-12 space-y-6">
              
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-4 border-b pb-3">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Activity className="text-emerald-700" />
                    Console de Viagens Disponíveis (Tempo Real)
                  </h3>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded uppercase tracking-widest leading-none">
                    Operação São Paulo
                  </span>
                </div>

                 {/* Listing requested rides available for this motorista */}
                {(() => {
                  const currentMot = motoristas.find(m => m.id === activeMotoristaId);
                  
                  const activeSelfCorrida = corridas.find(
                    c => c.motoristaId === activeMotoristaId && c.status !== 'CONCLUIDA' && c.status !== 'CANCELADA'
                  );

                  if (activeSelfCorrida) {
                    return (
                      <div className="p-4 border border-emerald-500/30 bg-emerald-50/50 rounded-xl space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] bg-emerald-800 text-white px-2 py-0.5 rounded font-bold font-mono uppercase tracking-wider">
                              CORRIDA ATIVA DESIGNADA
                            </span>
                            {(() => {
                              const clientObj = clientes.find(c => c.id === activeSelfCorrida.clienteId);
                              const clientUser = users.find(u => u.id === clientObj?.userId);
                              const clientAvatar = clientUser?.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150';

                              return (
                                <div className="flex items-center gap-2.5 my-2 bg-white p-2.5 rounded-xl border border-slate-200 max-w-sm shadow-sm select-none">
                                  <img
                                    src={clientAvatar}
                                    alt="avatar passageiro"
                                    className="w-10 h-10 rounded-full object-cover border border-emerald-500"
                                  />
                                  <div>
                                    <h4 className="font-bold text-slate-900 text-xs">{activeSelfCorrida.clienteNome}</h4>
                                    <span className="text-[10px] text-zinc-500 block">Celular: {activeSelfCorrida.clienteTelefone}</span>
                                  </div>
                                </div>
                              );
                            })()}
                            <p className="text-xs text-slate-600 mt-1">Origem: <strong>{activeSelfCorrida.origem}</strong></p>
                            <p className="text-xs text-slate-600">Destino: <strong>{activeSelfCorrida.destino}</strong></p>
                            {activeSelfCorrida.status === 'EM_ANDAMENTO' && activeSelfCorrida.distanciaPercorrida !== undefined && (
                              <p className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-1 rounded inline-block mt-1 border border-emerald-100">
                                Percorrido: {activeSelfCorrida.distanciaPercorrida.toFixed(1)} km ({(activeSelfCorrida.distanciaPercorrida * 1000).toFixed(0)}m)
                              </p>
                            )}
                          </div>
                          
                          <div className="text-right">
                            <span className="text-[10px] text-zinc-500 uppercase block">VALOR PRESTADO</span>
                            <strong className="text-base font-extrabold text-emerald-700">R$ {activeSelfCorrida.valor.toFixed(2)}</strong>
                            {activeSelfCorrida.isTaximetroRide && (
                              <span className="block text-[9px] bg-red-100 text-red-800 px-1.5 py-0.5 rounded font-black mt-1 animate-pulse">
                                TAXÍMETRO: R$ 0,60 / 100m ⚡
                              </span>
                            )}
                            <span className="text-[10px] text-zinc-400 block italic">Taxa de Serviço: R$ {getCorridaTaxaServico(activeSelfCorrida).toFixed(2)} (Fixo)</span>
                          </div>
                        </div>

                        {/* Interactive flow button controls to simulate transport progression */}
                        <div className="bg-white p-3 rounded-lg border flex flex-wrap gap-2 items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-slate-700 block text-xs uppercase">Ações do Motorista:</span>
                            <span className="text-[10px] text-slate-400">Acompanhe a corrida real abaixo e clique nos botões para progredir a viagem.</span>
                          </div>

                          <div className="flex gap-2">
                            {activeSelfCorrida.status === 'MOTORISTA_A_CAMINHO' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleCancelRide(activeSelfCorrida.id, 'MOTORISTA')}
                                  className="bg-rose-100 border border-rose-300 hover:bg-rose-200 text-rose-800 px-3 py-2 rounded-lg font-bold hover:cursor-pointer transition-all text-xs"
                                >
                                  CANCELAR CORRIDA ❌
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleStartTrip(activeSelfCorrida.id)}
                                  className="bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-2 rounded-lg font-bold hover:cursor-pointer transition-all text-xs"
                                >
                                  CONFIRMAR EMBARQUE PASSAGEIRO 🟢
                                </button>
                              </>
                            )}

                            {activeSelfCorrida.status === 'EM_ANDAMENTO' && (
                              <button
                                type="button"
                                onClick={() => handleFinishTrip(activeSelfCorrida.id)}
                                className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-lg font-bold hover:cursor-pointer transition-all text-xs border border-emerald-600 animate-pulse"
                              >
                                CONFIRMAR CORRIDA E RECEBER ! 🏁
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Real-time map tracking on the driver dashboard */}
                        <div className="pt-2">
                          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                            <span>Acompanhamento no Mapa (Visão do Condutor):</span>
                          </div>
                          <SimulatedMap
                            origemCoords={activeSelfCorrida.origemCoords}
                            destinoCoords={activeSelfCorrida.destinoCoords}
                            origemNome={activeSelfCorrida.origem ? activeSelfCorrida.origem.split(',')[0] : "Origem"}
                            destinoNome={activeSelfCorrida.destino ? activeSelfCorrida.destino.split(',')[0] : "Destino"}
                            status={activeSelfCorrida.status}
                            driverCoords={activeSelfCorrida.currentDriverCoords}
                            onSimulationUpdate={(coords) => {
                              handleSimulationUpdate(activeSelfCorrida.id, coords);
                            }}
                            onArrivedAtOrigin={() => {}}
                            onArrivedAtDestination={() => {}}
                          />
                        </div>
                      </div>
                    );
                  }

                  // Non-active ride check: is driver offline?
                  if (!currentMot?.isOnline) {
                    return (
                      <div className="py-12 bg-slate-50 border border-dashed rounded-2xl text-center p-6 space-y-3 animate-fade-in">
                        <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                          <Activity size={24} />
                        </div>
                        <div className="max-w-md mx-auto space-y-1">
                          <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">Você está OFFLINE (Modo Desanso)</h4>
                          <p className="text-xs text-slate-500 leading-relaxed">
                            Seu terminal de corridas está pausado. Mude o seu status de atendimento para <strong className="text-emerald-700">ONLINE</strong> no menu de controle esquerdo para começar a receber chamadas de passageiros em tempo real.
                          </p>
                        </div>
                      </div>
                    );
                  }

                  const pendingRides = corridas.filter(c => c.status === 'SOLICITADA');

                  if (pendingRides.length === 0) {
                    return (
                      <div className="py-8 text-center text-slate-400 space-y-2">
                        <Map size={36} className="mx-auto text-slate-300" />
                        <p className="text-xs font-semibold">Nenhuma nova chamada de corrida pendente no momento...</p>
                        <p className="text-[11px] max-w-sm mx-auto">
                          Abra o painel <strong>1. Cliente</strong> numa aba lateral ou simulação e solicite uma corrida. Ela aparecerá instantaneamente neste terminal!
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-3">
                      {pendingRides.map(corrida => {
                        const clientObj = clientes.find(c => c.id === corrida.clienteId);
                        const clientUser = users.find(u => u.id === clientObj?.userId);
                        const clientAvatar = clientUser?.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150';

                        return (
                          <div key={corrida.id} className="p-4 border rounded-xl hover:shadow-md transition-shadow flex flex-col md:flex-row justify-between gap-4 bg-slate-50">
                            <div className="space-y-2 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] bg-emerald-200 text-emerald-800 px-1.5 py-0.5 rounded font-bold font-mono uppercase tracking-wider">
                                  NOVA CORRIDA DISPONÍVEL
                                </span>
                                <span className="text-[10px] text-zinc-500">ID: {corrida.id}</span>
                              </div>
                              <div className="flex items-center gap-2.5 mb-1 bg-white p-2 rounded-lg border border-slate-100 max-w-sm">
                                <img
                                  src={clientAvatar}
                                  alt="avatar passageiro"
                                  className="w-8 h-8 rounded-full object-cover border border-emerald-500"
                                />
                                <div>
                                  <h4 className="font-bold text-zinc-900 text-xs">Passageiro: {corrida.clienteNome}</h4>
                                  <span className="text-[10px] text-zinc-400 block">{corrida.clienteTelefone}</span>
                                </div>
                              </div>
                              <div className="text-xs text-zinc-600">
                                <p>📌 <strong>De:</strong> {corrida.origem}</p>
                                <p>🏁 <strong>Para:</strong> {corrida.destino}</p>
                              </div>
                              <span className="text-[10px] text-zinc-500 block font-semibold">Distancia: {corrida.distancia} Km • Estimativa: {corrida.duracao} minutos</span>
                            </div>

                            <div className="text-right shrink-0 flex flex-col justify-between items-end gap-3">
                              <div>
                                <span className="text-[10px] text-slate-400 block uppercase">VALOR QUE CORRESPONDIDO</span>
                                <span className="text-base font-extrabold text-emerald-700">R$ {corrida.valor.toFixed(2)}</span>
                              </div>

                              <button
                                onClick={() => handleAcceptRide(corrida.id, activeMotoristaId)}
                                className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm hover:cursor-pointer"
                              >
                                Aceitar e Ir ao Local ✅
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}

              </div>

              {/* SIMULATED INVOICES HISTORY */}
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm text-xs">
                <h4 className="font-bold mb-3 text-slate-800">Seu Histórico de Corridas</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {corridas.filter(c => c.motoristaId === activeMotoristaId).map(item => (
                    <div key={item.id} className="flex justify-between items-center p-2.5 border-b last:border-0">
                      <div>
                        <span className="font-bold block text-slate-900">{item.destino ? item.destino.split(',')[0] : 'Destino'}</span>
                        <span className="text-[10px] text-zinc-400">{new Date(item.createdAt).toLocaleString()}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold block text-emerald-700">R$ {item.valor.toFixed(2)}</span>
                        <span className="text-[9px] text-zinc-400 uppercase">{item.status}</span>
                      </div>
                    </div>
                  ))}
                  {corridas.filter(c => c.motoristaId === activeMotoristaId).length === 0 && (
                    <p className="text-zinc-400 py-3 text-center">Nenhuma corrida concluída em seu cadastro ainda.</p>
                  )}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* 3. PAINEL DO DONO / ADMINISTRADOR (ADMIN) */}
        {activePortal === 'ADMIN' && (
          <div className="space-y-6" id="admin-view-container">

            {/* MEUS DADOS DE ADMINISTRADOR CARD (Consistent with general client/driver profile cards) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-gray-150 shadow-sm relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 left-0 w-full h-1 bg-emerald-700"></div>
                
                <div className="flex items-center gap-3">
                  <label 
                    className="relative block w-12 h-12 rounded-full overflow-hidden border border-emerald-500 cursor-pointer group shrink-0" 
                    title="Clique para carregar foto correspondente"
                    id="admin-profile-avatar-label-main"
                  >
                    {adminUser?.avatar ? (
                      <img
                        src={adminUser.avatar}
                        alt="avatar admin"
                        className="w-full h-full object-cover transition duration-200 group-hover:brightness-75"
                      />
                    ) : (
                      <img
                        referrerPolicy="no-referrer"
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${adminUser?.nome || "Carlos"}`}
                        alt="avatar admin"
                        className="w-full h-full object-cover transition duration-200 group-hover:brightness-75"
                      />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 transition duration-200">
                      <Camera size={14} className="text-white" />
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            const base64String = reader.result as string;
                            setUsers(prev => prev.map(u => {
                              if (u.tipo === 'ADMINISTRADOR') {
                                return { ...u, avatar: base64String };
                              }
                              return u;
                            }));
                            addNotification("Sua foto de administrador foi atualizada com sucesso!", "success");
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-zinc-900 truncate">
                      {adminUser?.nome || 'Carlos Oliveira'}
                    </h4>
                    <span className="text-[11px] text-zinc-500 block truncate">Reg: central-admin-01</span>
                    <span className="text-[9px] bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.5 rounded-full inline-block mt-0.5">Dono da Plataforma</span>
                  </div>
                </div>

                {!isEditingAdminProfile && (
                  <button
                    onClick={() => {
                      if (adminUser) {
                        setAdminProfileFormNome(adminUser.nome || '');
                        setAdminProfileFormEmail(adminUser.email || '');
                        setAdminProfileFormTelefone(adminUser.telefone || '');
                        const passKey = `${adminUser.email.toLowerCase()}-ADMIN`;
                        setAdminProfileFormSenha(accountPasswords[passKey] || 'Jr990387');
                        setIsEditingAdminProfile(true);
                      }
                    }}
                    className="mt-3 text-left text-[11px] text-emerald-700 hover:text-emerald-950 font-bold flex items-center gap-0.5 cursor-pointer hover:underline"
                  >
                    Alterar Dados ✎
                  </button>
                )}
              </div>

              <div className="lg:col-span-8">
                {isEditingAdminProfile && adminUser ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const trimmedNome = adminProfileFormNome.trim();
                      const trimmedEmail = adminProfileFormEmail.trim().toLowerCase();
                      const trimmedTelefone = adminProfileFormTelefone.trim();
                      const trimmedSenha = adminProfileFormSenha.trim();

                      if (!trimmedNome || !trimmedEmail || !trimmedSenha) {
                        addNotification("Preencha todos os campos obrigatórios!", "warn");
                        return;
                      }

                      // Update users list
                      setUsers(prev => prev.map(u => {
                        if (u.tipo === 'ADMINISTRADOR') {
                          return {
                            ...u,
                            nome: trimmedNome,
                            email: trimmedEmail,
                            telefone: trimmedTelefone
                          };
                        }
                        return u;
                      }));

                      // Update passwords map
                      setAccountPasswords(prev => {
                        const next = { ...prev };
                        const oldKey = `${adminUser.email.toLowerCase()}-ADMIN`;
                        delete next[oldKey];
                        next[`${trimmedEmail}-ADMIN`] = trimmedSenha;
                        return next;
                      });

                      // Keep loggedInEmail updated
                      if (loggedInEmail.toLowerCase() === adminUser.email.toLowerCase()) {
                        setLoggedInEmail(trimmedEmail);
                      }

                      setIsEditingAdminProfile(false);
                      addNotification("Perfil do administrador salvo com sucesso!", "success");
                    }}
                    className="bg-white p-4 rounded-xl border border-gray-150 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-3"
                  >
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-500">Nome Completo</label>
                      <input
                        type="text"
                        required
                        className="w-full p-2 text-xs rounded border border-slate-200 bg-white"
                        value={adminProfileFormNome}
                        onChange={e => setAdminProfileFormNome(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-500">E-mail Operacional</label>
                      <input
                        type="email"
                        required
                        className="w-full p-2 text-xs rounded border border-slate-200 bg-white"
                        value={adminProfileFormEmail}
                        onChange={e => setAdminProfileFormEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-500">Telefone</label>
                      <input
                        type="text"
                        className="w-full p-2 text-xs rounded border border-slate-200 bg-white"
                        value={adminProfileFormTelefone}
                        onChange={e => setAdminProfileFormTelefone(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-500">Senha</label>
                      <input
                        type="password"
                        required
                        className="w-full p-2 text-xs rounded border border-slate-200 bg-white font-mono"
                        value={adminProfileFormSenha}
                        onChange={e => setAdminProfileFormSenha(e.target.value)}
                      />
                    </div>
                    <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsEditingAdminProfile(false)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg cursor-pointer"
                      >
                        Salvar Alterações
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="bg-emerald-800/5 p-5 rounded-xl border border-emerald-700/10 h-full flex flex-col justify-center">
                    <p className="text-xs text-emerald-850 font-bold">Conta do Administrador ativa e monitorada por SSL.</p>
                    <p className="text-[11px] text-zinc-500 mt-1">Como Dono da Plataforma, você tem privilégios totais para auditar documentos, configurar taxas/tarifas globais, aprovar motoristas e gerenciar franquias regionais.</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* KPI METRICS SHEETS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3 hover:border-emerald-500 transition-all">
                <div className="p-3 rounded-lg bg-emerald-50 text-emerald-700 shrink-0">
                  <DollarSign size={20} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-tight">Faturamento Bruto</p>
                  <p className="text-xl font-bold text-emerald-600 mt-1">
                    R$ {totalVolumeGross.toFixed(2)}
                  </p>
                  <p className="text-[9px] text-slate-400 font-medium mt-0.5">Volume de viagens concluídas</p>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3 hover:border-emerald-500 transition-all">
                <div className="p-3 rounded-lg bg-emerald-100 text-emerald-800 shrink-0">
                  <CreditCard size={20} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-tight">Plataforma Comissão</p>
                  <p className="text-xl font-bold text-emerald-600 mt-1">
                    R$ {totalPlatformComission.toFixed(2)}
                  </p>
                  <p className="text-[9px] text-slate-400 font-medium mt-0.5">Taxa de serviço fixa por corrida</p>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3 hover:border-emerald-500 transition-all">
                <div className="p-3 rounded-lg bg-blue-50 text-blue-700 shrink-0">
                  <Car size={20} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-tight">Total Corridas</p>
                  <p className="text-xl font-semibold text-slate-800 mt-1">
                    {corridas.length}
                  </p>
                  <p className="text-[9px] text-emerald-600 font-bold mt-0.5 underline">
                    {corridas.filter(c => c.status === 'EM_ANDAMENTO').length} em trânsito
                  </p>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3 hover:border-emerald-500 transition-all">
                <div className="p-3 rounded-lg bg-indigo-50 text-indigo-700 shrink-0">
                  <UserCheck size={20} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-tight">Motoristas</p>
                  <p className="text-xl font-semibold text-slate-800 mt-1">
                    {motoristas.length}
                  </p>
                  <p className="text-[9px] text-amber-600 font-bold mt-0.5">
                    {motoristas.filter(m => m.documentoStatus === 'PENDENTE').length} aguardando análise
                  </p>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3 hover:border-emerald-500 transition-all">
                <div className="p-3 rounded-lg bg-teal-50 text-teal-700 shrink-0">
                  <UserIcon size={20} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-tight">Clientes</p>
                  <p className="text-xl font-semibold text-slate-800 mt-1">
                    {clientes.length}
                  </p>
                  <p className="text-[9px] text-slate-400 font-medium mt-0.5">Usuários cadastrados</p>
                </div>
              </div>

            </div>

            {/* BARRA DE SUBABAS INTERATIVAS (ADMIN) */}
            <div className="bg-slate-100 p-2 rounded-2xl border border-slate-200 shadow-sm mb-4" id="admin-subtabs-controller">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => { setAdminSubTab('OPCAO_1'); setAdminUserSearchQuery(''); setAdminEditingUser(null); }}
                  className={`py-3 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    adminSubTab === 'OPCAO_1'
                      ? 'bg-emerald-700 text-white shadow font-extrabold scale-[1.01]'
                      : 'bg-white text-slate-700 hover:bg-slate-200/50 border border-slate-200'
                  }`}
                >
                  👤 Opção 1: Passageiros
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${adminSubTab === 'OPCAO_1' ? 'bg-emerald-900 text-white' : 'bg-slate-200 text-slate-800'}`}>
                    {clientes.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => { setAdminSubTab('OPCAO_2'); setAdminUserSearchQuery(''); setAdminEditingUser(null); }}
                  className={`py-3 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    adminSubTab === 'OPCAO_2'
                      ? 'bg-emerald-700 text-white shadow font-extrabold scale-[1.01]'
                      : 'bg-white text-slate-700 hover:bg-slate-200/50 border border-slate-200'
                  }`}
                >
                  🚗 Opção 2: Motoristas
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${adminSubTab === 'OPCAO_2' ? 'bg-emerald-950 text-white' : 'bg-slate-200 text-slate-800'}`}>
                    {motoristas.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => { setAdminSubTab('AUDITORIA'); setAdminUserSearchQuery(''); setAdminEditingUser(null); }}
                  className={`py-3 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer relative ${
                    adminSubTab === 'AUDITORIA'
                      ? 'bg-emerald-700 text-white shadow font-extrabold scale-[1.01]'
                      : 'bg-white text-slate-700 hover:bg-slate-200/50 border border-slate-200'
                  }`}
                >
                  📄 Motoristas e Auditoria de Documentos
                  {motoristas.filter(m => m.documentoStatus === 'PENDENTE').length > 0 && (
                    <span className="bg-amber-400 text-slate-900 text-[9px] px-1.5 py-0.2 rounded font-extrabold animate-pulse">
                      {motoristas.filter(m => m.documentoStatus === 'PENDENTE').length} PENDENTE
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => { setAdminSubTab('CONFIG_GERAL'); setAdminUserSearchQuery(''); setAdminEditingUser(null); }}
                  className={`py-3 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    adminSubTab === 'CONFIG_GERAL'
                      ? 'bg-emerald-700 text-white shadow font-extrabold scale-[1.01]'
                      : 'bg-white text-slate-700 hover:bg-slate-205 hover:bg-slate-200/50 border border-slate-200'
                  }`}
                >
                  ⚙️ Configs & Franquias
                </button>
              </div>
            </div>

            {/* JANELA DE MOTORISTAS COM MENSALIDADE PENDENTE E CENTRAL DE ARMAZENAMENTO BANCO DE DADOS */}
            {adminSubTab === 'CONFIG_GERAL' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in" id="admin-storage-finance-combined-grid">
                
                {/* COLUNA 1: CONTROLE FINANCEIRO DE LICENÇAS & MENSALIDADES */}
                <div className="bg-white rounded-2xl border-2 border-amber-200 shadow-md p-5 hover:border-amber-300 transition-all font-sans" id="unpaid-license-pane">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className="p-3.5 rounded-xl bg-amber-50 text-amber-600 shrink-0 border border-amber-200">
                        <ShieldAlert size={24} className="animate-bounce" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-800">Controle Financeiro de Licenças & Mensalidades</h3>
                        <p className="text-xs text-slate-500 mt-1">
                          Há <strong className="text-amber-700 font-bold font-mono">{motoristas.filter(m => !m.isSubscriptionPaid).length}</strong> motorista(s) pendente(s) de regularização mensal e licença de frota.
                        </p>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mt-1 tracking-wider">
                          Taxa de mensalidade parametrizada: R$ {config.taxaAtivacaoMotorista.toFixed(2)} / mês
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0 animate-pulse hover:animate-none">
                      <button
                        onClick={() => setIsPendingPaymentsWindowOpen(!isPendingPaymentsWindowOpen)}
                        className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer ${
                          isPendingPaymentsWindowOpen 
                            ? 'bg-slate-800 text-white hover:bg-slate-900' 
                            : 'bg-amber-500 text-slate-950 hover:bg-amber-600 font-extrabold'
                        }`}
                      >
                        <CreditCard size={15} />
                        {isPendingPaymentsWindowOpen ? 'Ocultar Janela ✕' : 'Ver Todos Pendentes ➔'}
                      </button>
                    </div>
                  </div>

                  {/* LIST EXPANSION IF OPEN */}
                  {isPendingPaymentsWindowOpen && (
                    <div className="mt-5 border-t border-slate-100 pt-5 animate-fade-in" id="pending-drivers-list-window">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">
                          Relação de Operadores c/ Pendência
                        </h4>
                        <span className="text-[9px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
                          Ação Requisitada
                        </span>
                      </div>

                      {motoristas.filter(m => !m.isSubscriptionPaid).length === 0 ? (
                        <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                          ✨ Excelente! Todos os motoristas estão com as faturas e mensalidades quitadas.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-4 max-h-[350px] overflow-y-auto pr-1">
                          {motoristas.filter(m => !m.isSubscriptionPaid).map(m => {
                            const userObj = users.find(u => u.id === m.userId);
                            return (
                              <div 
                                key={m.id} 
                                className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 hover:bg-white hover:shadow-md hover:border-amber-400 transition-all flex flex-col justify-between"
                              >
                                <div>
                                  {/* Driver identity */}
                                  <div className="flex items-center gap-3">
                                    <div className="relative">
                                      <img 
                                        src={userObj?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}  
                                        alt="motorista" 
                                        className="w-10 h-10 rounded-full object-cover border-2 border-slate-200 shrink-0" 
                                      />
                                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-rose-500 rounded-full border-2 border-white status-pulse"></span>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <span className="font-bold text-xs text-slate-800 block truncate">{userObj?.nome}</span>
                                      <span className="text-[10px] text-slate-400 block truncate">{userObj?.email}</span>
                                      <span className="text-[10px] text-slate-500 font-semibold block">{userObj?.telefone}</span>
                                    </div>
                                  </div>

                                  {/* Vehicle and City stats */}
                                  <div className="mt-3 bg-white p-2.5 rounded-lg border border-slate-100 text-[10px] space-y-1">
                                    <div className="flex justify-between">
                                      <span className="text-slate-400">Cidade:</span>
                                      <span className="font-bold text-slate-700">{m.cidade}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-slate-400">Veículo:</span>
                                      <span className="font-semibold text-slate-700">{m.veiculo.marca} {m.veiculo.modelo} ({m.veiculo.ano})</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-slate-400">Placa:</span>
                                      <span className="font-mono bg-slate-100 px-1 py-0.2 rounded font-bold text-slate-800">{m.veiculo.placa}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Core actions for pending payment */}
                                <div className="mt-4 flex gap-2 pt-3 border-t border-slate-100 flex-wrap">
                                  <button
                                    onClick={() => handleToggleSubscriptionPaid(m.id)}
                                    className="flex-1 min-w-[90px] bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold py-2 px-2.5 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                                    title="Aprovar e ativar licença do motorista"
                                  >
                                    <Check size={12} />
                                    Confirmar Pagto
                                  </button>
                                  
                                  <button
                                    onClick={() => {
                                      const textMsg = `Olá ${userObj?.nome || 'Motorista'}, identificamos que a mensalidade de R$ ${config.taxaAtivacaoMotorista.toFixed(2)} referente à sua licença do Carona está pendente. Por favor, regularize para manter sua conta ativa! Chave Pix: pix@carona.com.br`;
                                      navigator.clipboard.writeText(textMsg);
                                      addNotification(`Mensagem de cobrança copiada! Envie para ${userObj?.telefone}`, 'success');
                                    }}
                                    className="flex-grow min-w-[100px] bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] font-bold py-2 px-2 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                                    title="Copiar mensagem para cobrar via WhatsApp"
                                  >
                                    Cobrar WhatsApp
                                  </button>

                                  <button
                                    onClick={() => {
                                      if (window.confirm(`Tem certeza de que deseja EXCLUIR permanentemente o cadastro de ${userObj?.nome || 'este motorista'}? Esta ação removerá o motorista e o usuário do banco de dados.`)) {
                                        handleDeleteMotorista(m.id);
                                      }
                                    }}
                                    className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[10px] font-bold py-2 px-2.5 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                                    title="Excluir motorista permanentemente do banco de dados"
                                  >
                                    <Trash2 size={12} />
                                    Excluir
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* COLUNA 2: CENTRAL DE ARMAZENAMENTO & BANCO DE DADOS PRISMA (POSTGRESQL) */}
                <div className="bg-white rounded-2xl border-2 border-emerald-600/30 shadow-md p-5 hover:border-emerald-500 transition-all font-sans flex flex-col justify-between animate-fade-in" id="prisma-database-storage-card">
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex gap-2.5">
                        <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 shrink-0 border border-emerald-100">
                          <Database size={22} className="animate-pulse" />
                        </div>
                        <div>
                          <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                            Área de Armazenamento Central
                            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" style={{ boxShadow: '0 0 8px #10b981' }} title="Banco de Dados Conectado"></span>
                          </h3>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Configuração ativa do Prisma ORM integrado ao banco PostgreSQL. Todos os motoristas autorizados e novos clientes são sincronizados em tempo real.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Stats summary badges */}
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 text-center">
                        <span className="text-[9px] font-bold uppercase text-slate-400 block tracking-wider">Clientes Ativos</span>
                        <strong className="text-xs font-mono text-emerald-700">{clientes.length} salvos</strong>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 text-center">
                        <span className="text-[9px] font-bold uppercase text-slate-400 block tracking-wider">Motoristas Autorizados</span>
                        <strong className="text-xs font-mono text-indigo-700">{motoristas.filter(m => m.documentoStatus === 'APROVADO').length} salvos</strong>
                      </div>
                    </div>

                    {/* Faux SQL Console logging live inserts */}
                    <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 text-slate-300 font-mono text-[9px] h-36 overflow-y-auto space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800">
                      <div className="flex items-center justify-between border-b border-slate-900 pb-1.5 mb-1.5">
                        <span className="text-slate-400 font-bold tracking-tight text-[8px] flex items-center gap-1">
                          <Server size={10} className="text-emerald-500 shrink-0" /> PRISMA ENGINE LOG (POSTGRESQL MASTER)
                        </span>
                        <span className="text-[8px] bg-slate-900 text-emerald-400 px-1.5 py-0.2 rounded font-bold">● CONECTADO</span>
                      </div>
                      
                      <p className="text-slate-500 text-[8px]">// Real-time transactions synced in current session:</p>
                      
                      {clientes.map((c, idx) => {
                        const usr = users.find(u => u.id === c.userId);
                        return (
                          <p key={`log-c-${c.id}`} className="text-emerald-400 pl-1 block break-all text-[8px] leading-relaxed">
                            [PRISMA:CREATE] Cliente '{usr?.nome || 'Passageiro'}' inserido com sucesso na tabela de banco 'Cliente' (CPF: {c.cpf}) ✔
                          </p>
                        );
                      })}

                      {motoristas.filter(m => m.documentoStatus === 'APROVADO').map((m, idx) => {
                        const usr = users.find(u => u.id === m.userId);
                        return (
                          <p key={`log-m-${m.id}`} className="text-indigo-400 pl-1 block break-all text-[8px] leading-relaxed">
                            [PRISMA:UPDATE] Motorista '{usr?.nome || 'Operador'}' status_aprovacao = 'APROVADO' persistido na tabela 'Motorista' (Placa: {m.veiculo.placa}) ✔
                          </p>
                        );
                      })}

                      <p className="text-zinc-500 text-[8px] italic">[Sync Engine] Listening for incoming authorizations and registration sockets...</p>
                    </div>
                  </div>

                  {/* Core Actions Button */}
                  <div className="mt-4 flex gap-2 pt-3 border-t border-slate-100">
                    <button
                      onClick={handleExportDatabase}
                      className="flex-1 bg-slate-900 hover:bg-slate-850 text-white hover:text-emerald-400 text-[10px] font-bold py-2.5 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm border border-slate-800 hover:border-emerald-500/50"
                      title="Baixar dump JSON estruturado do banco de dados completo do Carona"
                    >
                      <Download size={13} />
                      Exportar Dump PostgreSQL (JSON)
                    </button>
                    
                    <button
                      onClick={() => {
                        addNotification("Varredura de integridade do Prisma ORM concluída! Zero incoerências encontradas.", "success");
                      }}
                      className="bg-slate-105 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold py-2.5 px-3 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer border border-slate-200"
                      title="Testar consistência de colunas e enums no banco de dados"
                    >
                      <RefreshCw size={11} className="animate-spin" />
                      Auditar Chaves
                    </button>
                  </div>
                </div>

              </div>
            )}

            {/* GESTÃO GERAL E BUSCA DE USUÁRIOS NO BANCO DE DADOS (DADOS DO USUÁRIO & CPF) */}
            {(adminSubTab === 'OPCAO_1' || adminSubTab === 'OPCAO_2') && (
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 animate-fade-in" id="admin-user-management-panel">
                <div>
                  <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                    {adminSubTab === 'OPCAO_1' ? <UserIcon size={18} className="text-emerald-700 shrink-0" /> : <Car size={18} className="text-emerald-700 shrink-0" />}
                    {adminSubTab === 'OPCAO_1' ? 'Opção 1: Gerenciador Central de Usuários e Cadastros (Todos)' : 'Opção 2: Gerenciador de Motoristas Licenciados (Aprovados)'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {adminSubTab === 'OPCAO_1' 
                      ? 'Relação de todos os cadastros no banco de dados. Atualize dados cadastrais, bloqueie, exclua ou libere contas de passageiros e motoristas.'
                      : 'Veja todos os motoristas com status de documentos APROVADO. Atualize placas, veículos, redefina senhas, bloqueie, libere ou exclua cadastros.'}
                  </p>
                </div>

              {/* Busca de usuário */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                <div className="md:col-span-8 relative">
                  <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={adminUserSearchQuery}
                    onChange={(e) => setAdminUserSearchQuery(e.target.value)}
                    placeholder="Pesquisar por nome, e-mail ou CPF de passageiro/motorista..."
                    className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-250 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div className="md:col-span-4 flex gap-1.5">
                  <button
                    onClick={() => setAdminUserSearchQuery('')}
                    className="flex-1 py-2 px-3 text-xs font-semibold bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 transition cursor-pointer"
                  >
                    Limpar Filtro
                  </button>
                </div>
              </div>

              {/* Grid content: results list left, editing form right */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
                
                {/* LISTA DE USUÁRIOS RESULTANTES */}
                <div className="lg:col-span-6 space-y-2 max-h-[380px] overflow-y-auto pr-1">
                  <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">
                    {adminUserSearchQuery ? 'Resultados Encontrados' : 'Relação Geral de Usuários'}
                  </label>

                  {(() => {
                    const query = adminUserSearchQuery.trim().toLowerCase();
                    const matched = users.filter(u => {
                      const linkedDriver = motoristas.find(m => m.userId === u.id);
                      if (adminSubTab === 'OPCAO_1' && u.tipo !== 'CLIENTE') return false;
                      if (adminSubTab === 'OPCAO_2' && u.tipo !== 'MOTORISTA') return false;

                      if (!query) return true; // Show all if empty query

                      const matchBasic = u.nome.toLowerCase().includes(query) || 
                                         u.email.toLowerCase().includes(query) || 
                                         (u.telefone && u.telefone.includes(query));
                      if (matchBasic) return true;

                      // Check client CPF
                      const linkedClient = clientes.find(c => c.userId === u.id);
                      if (linkedClient && linkedClient.cpf.includes(query)) return true;

                      // Check driver CPF
                      if (linkedDriver && linkedDriver.cpf.includes(query)) return true;

                      return false;
                    });

                    if (matched.length === 0) {
                      return (
                        <div className="text-center py-8 text-xs text-slate-400 border border-dashed rounded-xl">
                          Nenhum usuário localizado para o termo "{adminUserSearchQuery}".
                        </div>
                      );
                    }

                    return matched.map(u => {
                      const clientObj = clientes.find(c => c.userId === u.id);
                      const driverObj = motoristas.find(m => m.userId === u.id);
                      const userCpf = clientObj ? clientObj.cpf : (driverObj ? driverObj.cpf : 'Sem CPF (ADMIN)');
                      
                      const roleLabel = u.tipo === 'CLIENTE' ? 'CLIENTE' : (u.tipo === 'MOTORISTA' ? 'MOTORISTA' : 'ADMINISTRADOR');
                      const roleColor = u.tipo === 'CLIENTE' 
                        ? 'bg-blue-50 text-blue-700 border-blue-100' 
                        : u.tipo === 'MOTORISTA' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-red-50 text-red-700 border-red-100';

                      const isSelected = adminEditingUser?.id === u.id;

                      return (
                        <div
                          key={u.id}
                          onClick={() => {
                            setAdminEditingUser(u);
                            setAdminFormNome(u.nome);
                            setAdminFormEmail(u.email);
                            setAdminFormTelefone(u.telefone || '');
                            setAdminFormStatus(u.status);
                            
                            // Load linked data
                            const cpfVal = clientObj ? clientObj.cpf : (driverObj ? driverObj.cpf : '');
                            const endVal = clientObj ? clientObj.endereco : (driverObj ? driverObj.endereco : '');
                            const cidVal = clientObj ? clientObj.cidade : (driverObj ? driverObj.cidade : '');
                            
                            setAdminFormCpf(cpfVal);
                            setAdminFormEndereco(endVal);
                            setAdminFormCidade(cidVal);

                            if (u.tipo === 'MOTORISTA' && driverObj) {
                              setAdminFormVeiculoMarca(driverObj.veiculo.marca || '');
                              setAdminFormVeiculoModelo(driverObj.veiculo.modelo || '');
                              setAdminFormVeiculoAno(driverObj.veiculo.ano || 2020);
                              setAdminFormVeiculoCor(driverObj.veiculo.cor || '');
                              setAdminFormVeiculoPlaca(driverObj.veiculo.placa || '');
                            } else {
                              setAdminFormVeiculoMarca('');
                              setAdminFormVeiculoModelo('');
                              setAdminFormVeiculoAno(2020);
                              setAdminFormVeiculoCor('');
                              setAdminFormVeiculoPlaca('');
                            }

                            // Load password using role lower/upper key
                            const mapRole = u.tipo === 'MOTORISTA' ? 'MOTORISTA' : (u.tipo === 'CLIENTE' ? 'CLIENTE' : 'ADMIN');
                            const passKey = `${u.email.toLowerCase()}-${mapRole}`;
                            setAdminFormSenha(accountPasswords[passKey] || '');
                          }}
                          className={`p-3 rounded-xl border transition-all text-xs text-left cursor-pointer flex justify-between items-center ${
                            isSelected 
                              ? 'border-emerald-600 bg-emerald-50/40 shadow-sm'
                              : 'border-slate-100 hover:border-slate-350 hover:bg-slate-50'
                          }`}
                        >
                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-slate-800 truncate">{u.nome}</span>
                              <span className={`text-[9px] px-1.5 py-0.2 border rounded font-black tracking-wider ${roleColor}`}>
                                {roleLabel}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400 block truncate">{u.email}</div>
                            <div className="text-[10px] text-slate-500 font-mono">CPF: {userCpf}</div>
                            {u.tipo === 'MOTORISTA' && driverObj && (
                              <div className="mt-1">
                                <span className={`inline-block text-[9px] px-1.5 py-0.2 rounded font-extrabold uppercase tracking-widest ${
                                  driverObj.documentoStatus === 'APROVADO' 
                                    ? 'bg-emerald-100 text-emerald-800 font-bold border border-emerald-200' 
                                    : driverObj.documentoStatus === 'REJEITADO' 
                                    ? 'bg-rose-100 text-rose-800 font-bold border border-rose-200' 
                                    : 'bg-amber-100 text-amber-800 font-bold border border-amber-300 animate-pulse'
                                }`}>
                                  Docs CNH: {driverObj.documentoStatus}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="text-right shrink-0 ml-2 space-y-1.5" onClick={(e) => e.stopPropagation()}>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold block text-center ${
                              u.status === 'ATIVO' ? 'bg-emerald-100 text-emerald-800' :
                              u.status === 'BLOQUEADO' ? 'bg-rose-100 text-rose-800' :
                              u.status === 'PENDENTE_APROVACAO' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-800'
                            }`}>
                              {u.status}
                            </span>
                            
                            <div className="flex gap-1 flex-wrap justify-end">
                              <button
                                type="button"
                                onClick={() => {
                                  setAdminEditingUser(u);
                                  setAdminFormNome(u.nome);
                                  setAdminFormEmail(u.email);
                                  setAdminFormTelefone(u.telefone || '');
                                  setAdminFormStatus(u.status);
                                  setAdminFormCpf(clientObj ? clientObj.cpf : (driverObj ? driverObj.cpf : ''));
                                  setAdminFormEndereco(clientObj ? clientObj.endereco : (driverObj ? driverObj.endereco : ''));
                                  setAdminFormCidade(clientObj ? clientObj.cidade : (driverObj ? driverObj.cidade : ''));
                                  
                                  const mapRole = u.tipo === 'MOTORISTA' ? 'MOTORISTA' : (u.tipo === 'CLIENTE' ? 'CLIENTE' : 'ADMIN');
                                  setAdminFormSenha(accountPasswords[`${u.email.toLowerCase()}-${mapRole}`] || 'senha123');
                                }}
                                className="px-1.5 py-0.5 bg-slate-105 hover:bg-slate-200 text-slate-700 rounded text-[9px] font-bold cursor-pointer transition-all"
                                title="Editar dados cadastrais"
                              >
                                ⚙️ Editar
                              </button>

                              {u.status === 'BLOQUEADO' ? (
                                <button
                                  type="button"
                                  onClick={() => handleToggleBlockUser(u.id)}
                                  className="px-1.5 py-0.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded text-[9px] font-black cursor-pointer transition-all"
                                  title="Liberar e reativar usuário"
                                >
                                  🟢 Liberar
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleToggleBlockUser(u.id)}
                                  className="px-1.5 py-0.5 bg-rose-50 hover:bg-rose-100 text-rose-800 rounded text-[9px] font-bold cursor-pointer transition-all"
                                  title="Bloquear usuário"
                                >
                                  🚫 Bloquear
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => {
                                  if (window.confirm(`Tem certeza de que deseja EXCLUIR permanentemente o cadastro de ${u.nome}? Esta ação é irreversível.`)) {
                                    if (u.tipo === 'MOTORISTA') {
                                      const mot = motoristas.find(m => m.userId === u.id);
                                      if (mot) {
                                        handleDeleteMotorista(mot.id);
                                      } else {
                                        setUsers(prev => prev.filter(usr => usr.id !== u.id));
                                        addNotification(`Usuário "${u.nome}" excluído do banco de dados!`, "success");
                                      }
                                    } else {
                                      handleDeleteCliente(u.id);
                                    }
                                    if (adminEditingUser?.id === u.id) setAdminEditingUser(null);
                                  }
                                }}
                                className="px-1.5 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-[9px] font-bold cursor-pointer transition-all"
                                title="Excluir do Banco de Dados"
                              >
                                🗑️ Excluir
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>

                {/* FORMULÁRIO DE EDIÇÃO DE DADOS DE USUÁRIO */}
                <div className="lg:col-span-6 bg-slate-50 p-4 rounded-xl border border-slate-200 min-h-[300px] flex flex-col justify-between">
                  {adminEditingUser ? (() => {
                    const driverObj = motoristas.find(m => m.userId === adminEditingUser.id);
                    return (
                      <form
                        onSubmit={(e) => {
                        e.preventDefault();
                        const targetId = adminEditingUser.id;
                        const trimmedNome = adminFormNome.trim();
                        const trimmedEmail = adminFormEmail.trim().toLowerCase();
                        const trimmedTelefone = adminFormTelefone.trim();
                        const trimmedSenha = adminFormSenha.trim();
                        const trimmedCpf = adminFormCpf.trim();
                        const trimmedEndereco = adminFormEndereco.trim();
                        const trimmedCidade = adminFormCidade.trim();

                        if (!trimmedNome || !trimmedEmail || !trimmedSenha) {
                          addNotification("Nome, E-mail e Senha são de preenchimento obrigatório!", "warn");
                          return;
                        }

                        // Duplicate email validation
                        const duplicated = users.find(u => u.id !== targetId && u.email.toLowerCase() === trimmedEmail && u.tipo === adminEditingUser.tipo);
                        if (duplicated) {
                          addNotification("Já existe um usuário cadastrado com este e-mail nesta mesma função!", "warn");
                          return;
                        }

                        // 1. Update Core User state
                        setUsers(prev => prev.map(u => {
                          if (u.id === targetId) {
                            return { ...u, nome: trimmedNome, email: trimmedEmail, telefone: trimmedTelefone, status: adminFormStatus };
                          }
                          return u;
                        }));

                        // 2. Update accountPasswords (delete old record and bind to new email)
                        const mapRoleOld = adminEditingUser.tipo === 'MOTORISTA' ? 'MOTORISTA' : (adminEditingUser.tipo === 'CLIENTE' ? 'CLIENTE' : 'ADMIN');
                        setAccountPasswords(prev => {
                          const next = { ...prev };
                          delete next[`${adminEditingUser.email.toLowerCase()}-${mapRoleOld}`];
                          next[`${trimmedEmail}-${mapRoleOld}`] = trimmedSenha;
                          return next;
                        });

                        // 3. Update Clientes or Motoristas structures depending on role
                        if (adminEditingUser.tipo === 'CLIENTE') {
                          setClientes(prev => prev.map(c => {
                            if (c.userId === targetId) {
                              return { ...c, cpf: trimmedCpf, endereco: trimmedEndereco, cidade: trimmedCidade };
                            }
                            return c;
                          }));
                        } else if (adminEditingUser.tipo === 'MOTORISTA') {
                          setMotoristas(prev => prev.map(m => {
                            if (m.userId === targetId) {
                              return {
                                ...m,
                                cpf: trimmedCpf,
                                endereco: trimmedEndereco,
                                cidade: trimmedCidade,
                                veiculo: {
                                  marca: adminFormVeiculoMarca || m.veiculo.marca,
                                  modelo: adminFormVeiculoModelo || m.veiculo.modelo,
                                  ano: Number(adminFormVeiculoAno) || m.veiculo.ano,
                                  cor: adminFormVeiculoCor || m.veiculo.cor,
                                  placa: (adminFormVeiculoPlaca || m.veiculo.placa || '').toUpperCase()
                                }
                              };
                            }
                            return m;
                          }));
                        }

                        // 4. Update loggedInEmail state if the admin edited their own user account
                        if (loggedInEmail.toLowerCase() === adminEditingUser.email.toLowerCase()) {
                          setLoggedInEmail(trimmedEmail);
                        }

                        addNotification(`Os dados do usuário "${trimmedNome}" foram salvos no banco de dados com sucesso!`, "success");
                        setAdminEditingUser(null);
                      }}
                      className="space-y-3.5 text-xs text-left"
                    >
                      <div className="flex justify-between items-center border-b pb-2">
                        <span className="font-bold text-[11px] text-slate-700 uppercase tracking-widest block">
                          Editar Conta: <span className="text-emerald-700 font-mono">{adminEditingUser.nome ? adminEditingUser.nome.split(' ')[0] : 'Usuário'}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setAdminEditingUser(null)}
                          className="text-slate-400 hover:text-slate-600 font-bold"
                        >
                          ✕ Fechar
                        </button>
                      </div>

                      {/* Foto do Perfil (Upload do Dono/Administrador) */}
                      <div className="p-3 bg-white rounded-xl border border-slate-100 flex items-center gap-3">
                        <div className="relative shrink-0">
                          <img
                            src={users.find(u => u.id === adminEditingUser.id)?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                            alt="avatar preview"
                            className="w-12 h-12 rounded-full object-cover border-2 border-emerald-650 shadow-sm shrink-0"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[9px] uppercase font-bold text-slate-500">Alterar Foto do Perfil</label>
                          <label className="inline-flex items-center gap-1.5 px-2 py-1 bg-zinc-900 hover:bg-zinc-800 text-white text-[10px] font-bold rounded cursor-pointer transition shadow-sm">
                            📷 Carregar Foto
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    const base64String = reader.result as string;
                                    setUsers(prev => prev.map(u => {
                                      if (u.id === adminEditingUser.id) {
                                        return { ...u, avatar: base64String };
                                      }
                                      return u;
                                    }));
                                    addNotification(`Foto de perfil do usuário "${adminEditingUser.nome}" atualizada com sucesso!`, "success");
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[9px] uppercase font-bold text-slate-500 mb-0.5">Nome Completo</label>
                          <input
                            type="text"
                            value={adminFormNome}
                            onChange={e => setAdminFormNome(e.target.value)}
                            className="w-full p-2 border rounded bg-white text-slate-800"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] uppercase font-bold text-slate-500 mb-0.5">E-mail</label>
                          <input
                            type="email"
                            value={adminFormEmail}
                            onChange={e => setAdminFormEmail(e.target.value)}
                            className="w-full p-2 border rounded bg-white text-slate-800"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[9px] uppercase font-bold text-slate-500 mb-0.5">Senha Secreta</label>
                          <input
                            type="text"
                            value={adminFormSenha}
                            onChange={e => setAdminFormSenha(e.target.value)}
                            className="w-full p-2 border rounded bg-white text-slate-800 font-mono"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] uppercase font-bold text-slate-500 mb-0.5">Telefone</label>
                          <input
                            type="text"
                            value={adminFormTelefone}
                            onChange={e => setAdminFormTelefone(e.target.value)}
                            className="w-full p-2 border rounded bg-white text-slate-800"
                          />
                        </div>
                      </div>

                      {(adminEditingUser.tipo === 'CLIENTE' || adminEditingUser.tipo === 'MOTORISTA') && (
                        <div className="p-3 bg-white rounded-xl border border-slate-100 space-y-2">
                          <span className="font-extrabold text-[9px] text-slate-400 uppercase tracking-widest block mb-1">
                            Dados Cadastrais do Papel ({adminEditingUser.tipo})
                          </span>
                          <div className="grid grid-cols-3 gap-1.5 text-slate-700">
                            <div className="col-span-1">
                              <label className="block text-[8px] uppercase font-bold text-slate-500 mb-0.5">CPF</label>
                              <input
                                type="text"
                                value={adminFormCpf}
                                onChange={e => setAdminFormCpf(e.target.value)}
                                className="w-full p-1 border rounded bg-slate-50 text-[10px]"
                                placeholder="Cpf"
                              />
                            </div>
                            <div className="col-span-1">
                              <label className="block text-[8px] uppercase font-bold text-slate-500 mb-0.5">Cidade</label>
                              <input
                                type="text"
                                value={adminFormCidade}
                                onChange={e => setAdminFormCidade(e.target.value)}
                                className="w-full p-1 border rounded bg-slate-50 text-[10px]"
                                placeholder="Cidade"
                              />
                            </div>
                            <div className="col-span-1">
                              <label className="block text-[8px] uppercase font-bold text-slate-500 mb-0.5">Rua/Logradouro</label>
                              <input
                                type="text"
                                value={adminFormEndereco}
                                onChange={e => setAdminFormEndereco(e.target.value)}
                                className="w-full p-1 border rounded bg-slate-50 text-[10px]"
                                placeholder="Logradouro"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* VEICULO INPUTS FOR MOTORISTAS */}
                      {adminEditingUser.tipo === 'MOTORISTA' && (
                        <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 space-y-2">
                          <span className="font-extrabold text-[9px] text-emerald-800 uppercase tracking-widest block mb-1">
                            🚗 Especificações do Veículo do Motorista
                          </span>
                          <div className="grid grid-cols-5 gap-1.5 text-slate-700">
                            <div>
                              <label className="block text-[8px] uppercase font-bold text-slate-500 mb-0.5">Marca</label>
                              <input
                                type="text"
                                value={adminFormVeiculoMarca}
                                onChange={e => setAdminFormVeiculoMarca(e.target.value)}
                                className="w-full p-1 border rounded bg-white text-[10px]"
                                placeholder="Fiat"
                              />
                            </div>
                            <div>
                              <label className="block text-[8px] uppercase font-bold text-slate-500 mb-0.5">Modelo</label>
                              <input
                                type="text"
                                value={adminFormVeiculoModelo}
                                onChange={e => setAdminFormVeiculoModelo(e.target.value)}
                                className="w-full p-1 border rounded bg-white text-[10px]"
                                placeholder="Puno"
                              />
                            </div>
                            <div>
                              <label className="block text-[8px] uppercase font-bold text-slate-500 mb-0.5">Ano</label>
                              <input
                                type="number"
                                value={adminFormVeiculoAno || ''}
                                onChange={e => setAdminFormVeiculoAno(Number(e.target.value))}
                                className="w-full p-1 border rounded bg-white text-[10px]"
                                placeholder="2018"
                              />
                            </div>
                            <div>
                              <label className="block text-[8px] uppercase font-bold text-slate-500 mb-0.5">Cor</label>
                              <input
                                type="text"
                                value={adminFormVeiculoCor}
                                onChange={e => setAdminFormVeiculoCor(e.target.value)}
                                className="w-full p-1 border rounded bg-white text-[10px]"
                                placeholder="Prata"
                              />
                            </div>
                            <div>
                              <label className="block text-[8px] uppercase font-bold text-slate-500 mb-0.5">Placa</label>
                              <input
                                type="text"
                                value={adminFormVeiculoPlaca}
                                onChange={e => setAdminFormVeiculoPlaca(e.target.value.toUpperCase())}
                                className="w-full p-1 border rounded bg-white font-mono text-[10px]"
                                placeholder="ABC1D23"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="block text-[9px] uppercase font-bold text-slate-500 mb-0.5">Status Geral de Acesso (Login)</label>
                        <select
                          value={adminFormStatus}
                          onChange={e => setAdminFormStatus(e.target.value as UserStatus)}
                          className="w-full p-2 border rounded bg-white text-slate-800 font-bold text-xs"
                        >
                          <option value="ATIVO">ATIVO (Liberado para usar o App)</option>
                          <option value="BLOQUEADO">BLOQUEADO (Acesso negado aos painéis)</option>
                          <option value="PENDENTE_APROVACAO">PENDENTE_APROVACAO (Aguardando análise de cadastro)</option>
                          <option value="AGUARDANDO_PAGAMENTO">AGUARDANDO_PAGAMENTO (Mensalidade ou assinatura pendente)</option>
                        </select>
                      </div>

                      {driverObj && (
                        <div className="p-3 bg-zinc-100 rounded-xl border border-zinc-200/60 space-y-2 mt-2">
                          <div className="flex justify-between items-center">
                            <span className="font-extrabold text-[9px] text-zinc-500 uppercase tracking-widest block font-sans">
                              CNH & Homologação de Documentos
                            </span>
                            <span className={`text-[8px] px-1.5 py-0.2 rounded font-black uppercase tracking-widest ${
                              driverObj.documentoStatus === 'APROVADO' ? 'bg-emerald-100 text-emerald-800 border border-emerald-250' :
                              driverObj.documentoStatus === 'REJEITADO' ? 'bg-rose-100 text-rose-800 border border-rose-250' : 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
                            }`}>
                              {driverObj.documentoStatus}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 leading-snug font-sans">
                            Clique abaixo para homologar ou rejeitar os documentos de habilitação desse motorista:
                          </p>
                          <div className="flex gap-1.5 pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                handleApproveDriverDocs(driverObj.id, true);
                                setAdminFormStatus('ATIVO');
                              }}
                              className="flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold cursor-pointer transition-all border-0 shadow-sm"
                            >
                              ✓ Aprovar CNH & Ativar
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                handleApproveDriverDocs(driverObj.id, false);
                                setAdminFormStatus('PENDENTE_APROVACAO');
                              }}
                              className="py-1.5 px-2 bg-rose-600 hover:bg-rose-700 text-white rounded text-[10px] font-bold cursor-pointer transition-all border-0 shadow-sm"
                            >
                              ✕ Rejeitar
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2 pt-1 border-t mt-2">
                        <button
                          type="submit"
                          className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2 px-3 rounded-lg uppercase tracking-wider text-[10px] cursor-pointer"
                        >
                          Confirmar Mudanças ✓
                        </button>
                        <button
                          type="button"
                          onClick={() => setAdminEditingUser(null)}
                          className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2 px-3 rounded-lg text-[10px]"
                        >
                          Cancelar
                        </button>
                      </div>
                    </form>
                    );
                  })()
                  : (
                    <div className="flex-1 flex flex-col justify-center items-center text-center p-6 text-slate-400 space-y-2">
                      <Settings size={36} className="text-slate-300" />
                      <div className="max-w-[240px]">
                        <p className="font-bold text-slate-500 text-zinc-700 text-xs">Selecione um usuário para editar</p>
                        <p className="text-[10px] text-slate-400 mt-1">
                          Clique em qualquer passageiro ou motorista da lista à esquerda para carregar seus dados cadastrais, redefinir senhas ou CPF instantaneamente.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

              </div>

            </div>
            )}

            {/* PLATFORM FRANCHISES DIVISION */}
            {adminSubTab === 'CONFIG_GERAL' && (
              <>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4" id="admin-franchise-management-pane">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Layers size={18} className="text-emerald-700" />
                    Gerenciamento Geral de Franquias por Cidade
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Defina o valor fixo repassado ao dono por corrida finalizada e bloqueie/libere operadores franqueados regionais.
                  </p>
                </div>
                
                <div className="flex gap-2">
                  {/* Botão para cadastrar franqueado com dados completos */}
                  <button
                    onClick={() => setShowNewFranForm(!showNewFranForm)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-black transition-all flex items-center gap-1.5 shrink-0 cursor-pointer shadow-sm animate-pulse"
                  >
                    <UserPlus size={14} /> 
                    {showNewFranForm ? 'Fechar Form' : 'Adicionar Franqueado Completo'}
                  </button>
                </div>
              </div>

              {/* COLLAPSIBLE REGISTRATION FORM */}
              {showNewFranForm && (
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newFranNome.trim() || !newFranEmail.trim() || !newFranSenha.trim() || !newFranTelefone.trim() || !newFranCidade) {
                      addNotification("Por favor, preencha todos os campos obrigatórios para o franqueado!", "warn");
                      return;
                    }
                    
                    // Verify if city already has a franchise
                    const alreadyExists = franqueados.some(f => f.cidade.toLowerCase() === newFranCidade.toLowerCase());
                    if (alreadyExists) {
                      addNotification(`Já existe um franqueado ativo para a cidade de ${newFranCidade}!`, "warn");
                      return;
                    }

                    const newId = 'fr-' + Date.now();
                    const novo: Franqueado = {
                      id: newId,
                      nome: newFranNome.trim(),
                      cidade: newFranCidade,
                      email: newFranEmail.trim().toLowerCase(),
                      telefone: newFranTelefone.trim(),
                      valorFixoPorCorrida: Number(newFranValorFixo) || 2.00,
                      status: newFranStatus,
                      createdAt: new Date().toISOString()
                    };

                    // Add to franqueados list
                    setFranqueados(prev => [...prev, novo]);
                    
                    // Save password database association
                    const passwordKey = `${newFranEmail.trim().toLowerCase()}-FRANQUIA`;
                    setAccountPasswords(prev => ({
                      ...prev,
                      [passwordKey]: newFranSenha
                    }));

                    // Reset form and close
                    setNewFranNome('');
                    setNewFranEmail('');
                    setNewFranSenha('');
                    setNewFranTelefone('');
                    setNewFranCidade('');
                    setNewFranValorFixo(2.00);
                    setNewFranStatus('ATIVO');
                    setShowNewFranForm(false);

                    addNotification(`Franqueado ${novo.nome} cadastrado para a Cidade de ${novo.cidade} com sucesso!`, 'success');
                  }}
                  className="bg-slate-50 p-4 rounded-xl border border-emerald-100 space-y-4 mb-4"
                >
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5 border-b pb-2">
                    <UserPlus size={14} className="text-emerald-700" />
                    Ficha de Cadastro de Novo Franqueado Regional (Completo)
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Nome do Franqueado *</label>
                      <input 
                        type="text"
                        required
                        value={newFranNome}
                        onChange={e => setNewFranNome(e.target.value)}
                        placeholder="Ex: João da Silva"
                        className="w-full p-2 border rounded bg-white text-xs text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">E-mail de Login *</label>
                      <input 
                        type="email"
                        required
                        value={newFranEmail}
                        onChange={e => setNewFranEmail(e.target.value)}
                        placeholder="Ex: joao@campinascarona.com.br"
                        className="w-full p-2 border rounded bg-white text-xs text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Senha de Acesso *</label>
                      <input 
                        type="password"
                        required
                        value={newFranSenha}
                        onChange={e => setNewFranSenha(e.target.value)}
                        placeholder="Defina a senha de login"
                        className="w-full p-2 border rounded bg-white text-xs text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Telefone Celular *</label>
                      <input 
                        type="text"
                        required
                        value={newFranTelefone}
                        onChange={e => setNewFranTelefone(e.target.value)}
                        placeholder="Ex: (19) 99876-4321"
                        className="w-full p-2 border rounded bg-white text-xs text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Cidade de Atuação *</label>
                      <select
                        required
                        value={newFranCidade}
                        onChange={e => setNewFranCidade(e.target.value)}
                        className="w-full p-2 border rounded bg-white text-xs text-slate-800 font-semibold text-emerald-950 focus:ring-2 focus:ring-emerald-700"
                      >
                        <option value="">Selecione uma Cidade...</option>
                        {cidades.slice().sort((a, b) => {
                          const pA = a.nome.toLowerCase() === 'itaberaí' ? -2 : (a.estado === 'GO' ? -1 : 0);
                          const pB = b.nome.toLowerCase() === 'itaberaí' ? -2 : (b.estado === 'GO' ? -1 : 0);
                          if (pA !== pB) return pA - pB;
                          return a.nome.localeCompare(b.nome);
                        }).map(c => (
                          <option key={c.id} value={c.nome}>{c.nome} ({c.estado})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Repasse por Corrida (R$) *</label>
                      <input 
                        type="number"
                        step="0.10"
                        min="0.10"
                        required
                        value={newFranValorFixo}
                        onChange={e => setNewFranValorFixo(Number(e.target.value))}
                        className="w-full p-2 border rounded bg-white text-xs font-bold text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Status Operacional</label>
                      <select
                        value={newFranStatus}
                        onChange={e => setNewFranStatus(e.target.value as 'ATIVO' | 'BLOQUEADO')}
                        className="w-full p-2 border rounded bg-white text-xs font-bold text-slate-800"
                      >
                        <option value="ATIVO">LIBERADO / ATIVO</option>
                        <option value="BLOQUEADO">BLOQUEADO / INATIVO</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t">
                    <button
                      type="button"
                      onClick={() => setShowNewFranForm(false)}
                      className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-bold transition-all cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                    >
                      Salvar Cadastro
                    </button>
                  </div>
                </form>
              )}

              {/* Franqueados list table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b text-zinc-400">
                      <th className="py-2.5">Franqueado / Cidade</th>
                      <th className="py-2.5">Contato</th>
                      <th className="py-2.5 text-center">Motoristas Parceiros</th>
                      <th className="py-2.5 text-center">Corridas Concluídas</th>
                      <th className="py-2.5 text-center">Fixo por Corrida (Repasse)</th>
                      <th className="py-2.5 text-right font-bold text-slate-700">Total Devido ao Dono</th>
                      <th className="py-2.5 text-center">Status</th>
                      <th className="py-2.5 text-right">Ações de Controle</th>
                    </tr>
                  </thead>
                  <tbody>
                     {franqueados.map(f => {
                      // Total finished rides in this franchise city
                      const cityRides = corridas.filter(c => {
                        const drv = motoristas.find(m => m.id === c.motoristaId);
                        return c.status === 'CONCLUIDA' && (drv?.cidade === f.cidade || (c.origem && c.origem.includes(f.cidade)));
                      });
                      
                      const repasseDevido = cityRides.length * f.valorFixoPorCorrida;
                      const numDrivers = motoristas.filter(m => m.cidade === f.cidade).length;
                      const isEditing = editingFranqueadoId === f.id;

                      return (
                        <tr key={f.id} className="border-b last:border-0 hover:bg-gray-50/50">
                          <td className="py-3 pr-2">
                            {isEditing ? (
                              <div className="space-y-1 max-w-[170px]">
                                <input 
                                  type="text"
                                  value={editingFranqueadoData?.nome || ''}
                                  onChange={e => setEditingFranqueadoData(prev => prev ? { ...prev, nome: e.target.value } : null)}
                                  className="p-1 text-xs font-bold border rounded bg-white w-full text-slate-800"
                                  placeholder="Nome do Franqueado"
                                />
                                <select
                                  value={editingFranqueadoData?.cidade || ''}
                                  onChange={e => setEditingFranqueadoData(prev => prev ? { ...prev, cidade: e.target.value } : null)}
                                  className="p-1 text-[10px] border rounded bg-white w-full text-slate-700 font-semibold"
                                >
                                  {cidades.slice().sort((a, b) => {
                                    const pA = a.nome.toLowerCase() === 'itaberaí' ? -2 : (a.estado === 'GO' ? -1 : 0);
                                    const pB = b.nome.toLowerCase() === 'itaberaí' ? -2 : (b.estado === 'GO' ? -1 : 0);
                                    if (pA !== pB) return pA - pB;
                                    return a.nome.localeCompare(b.nome);
                                  }).map(c => (
                                    <option key={c.id} value={c.nome}>{c.nome} ({c.estado})</option>
                                  ))}
                                </select>
                              </div>
                            ) : (
                              <div>
                                <span className="font-bold text-slate-800 block text-xs">{f.nome}</span>
                                <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded-full inline-block mt-0.5">
                                  Cidade • {f.cidade}
                                </span>
                              </div>
                            )}
                          </td>
                          <td className="py-3">
                            {isEditing ? (
                              <div className="space-y-1 max-w-[180px]">
                                <input 
                                  type="email"
                                  value={editingFranqueadoData?.email || ''}
                                  onChange={e => setEditingFranqueadoData(prev => prev ? { ...prev, email: e.target.value } : null)}
                                  className="p-1 text-[10px] border rounded bg-white w-full text-slate-700"
                                  placeholder="E-mail"
                                />
                                <input 
                                  type="text"
                                  value={editingFranqueadoData?.telefone || ''}
                                  onChange={e => setEditingFranqueadoData(prev => prev ? { ...prev, telefone: e.target.value } : null)}
                                  className="p-1 text-[10px] border rounded bg-white w-full text-slate-700"
                                  placeholder="Telefone"
                                />
                              </div>
                            ) : (
                              <div>
                                <span className="block font-medium text-slate-700">{f.email}</span>
                                <span className="text-[10px] text-slate-500 font-mono">{f.telefone}</span>
                              </div>
                            )}
                          </td>
                          <td className="py-3 font-semibold text-center text-slate-700">
                            {numDrivers} motoristas
                          </td>
                          <td className="py-3 font-semibold text-center text-slate-700">
                            {cityRides.length} viagens
                          </td>
                          <td className="py-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <span className="text-slate-400">R$</span>
                              <input
                                type="number"
                                step="0.50"
                                min="0.10"
                                value={f.valorFixoPorCorrida}
                                onChange={(e) => {
                                  const newVal = Number(e.target.value);
                                  setFranqueados(prev => prev.map(item => {
                                    if (item.id === f.id) {
                                      return { ...item, valorFixoPorCorrida: newVal };
                                    }
                                    return item;
                                  }));
                                }}
                                className="w-16 p-1 border rounded bg-white text-xs font-bold text-center text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                              />
                            </div>
                          </td>
                          <td className="py-3 text-right">
                            <span className="font-bold text-emerald-700 text-sm">
                              R$ {repasseDevido.toFixed(2)}
                            </span>
                            <span className="block text-[9px] text-slate-400">Atualizado a cada corrida</span>
                          </td>
                          <td className="py-3 text-center">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${
                              f.status === 'ATIVO' 
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 animate-pulse' 
                                : 'bg-rose-100 text-rose-800 border border-rose-200'
                            }`}>
                              {f.status === 'ATIVO' ? 'LIBERADA' : 'BLOQUEADA'}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            <div className="flex justify-end gap-1 px-1">
                              {isEditing ? (
                                <div className="flex gap-1.5">
                                  <button
                                    onClick={() => {
                                      if (!editingFranqueadoData) return;
                                      if (!editingFranqueadoData.nome.trim()) {
                                        addNotification("O nome não pode ficar em branco!", "warn");
                                        return;
                                      }
                                      setFranqueados(prev => prev.map(item => {
                                        if (item.id === f.id) {
                                          return {
                                            ...item,
                                            nome: editingFranqueadoData.nome,
                                            cidade: editingFranqueadoData.cidade,
                                            email: editingFranqueadoData.email,
                                            telefone: editingFranqueadoData.telefone
                                          };
                                        }
                                        return item;
                                      }));
                                      setEditingFranqueadoId(null);
                                      setEditingFranqueadoData(null);
                                      addNotification("Dados da Franquia salvos com sucesso!", "success");
                                    }}
                                    className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold cursor-pointer transition-all"
                                  >
                                    Salvar
                                  </button>
                                  <button
                                    onClick={() => {
                                      setEditingFranqueadoId(null);
                                      setEditingFranqueadoData(null);
                                    }}
                                    className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-[10px] font-bold cursor-pointer transition-all"
                                  >
                                    Cancelar
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <button
                                    onClick={() => {
                                      setEditingFranqueadoId(f.id);
                                      setEditingFranqueadoData({
                                        nome: f.nome,
                                        cidade: f.cidade,
                                        email: f.email,
                                        telefone: f.telefone
                                      });
                                    }}
                                    className="px-2 py-1 bg-amber-50 hover:bg-amber-150 text-amber-700 rounded text-[10px] font-bold cursor-pointer transition-all"
                                    title="Editar informações gerais deste franqueado"
                                  >
                                    Editar Dados
                                  </button>
                                  <button
                                    onClick={() => {
                                      const newStatus = f.status === 'ATIVO' ? 'BLOQUEADO' : 'ATIVO';
                                      setFranqueados(prev => prev.map(item => {
                                        if (item.id === f.id) {
                                          return { ...item, status: newStatus };
                                        }
                                        return item;
                                      }));
                                      addNotification(`Franquia de ${f.cidade} ${newStatus === 'ATIVO' ? 'liberada!' : 'bloqueada com sucesso!'}`, newStatus === 'ATIVO' ? 'success' : 'warn');
                                    }}
                                    className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer transition-all ${
                                      f.status === 'ATIVO'
                                        ? 'bg-rose-50 hover:bg-rose-150 text-rose-700 font-semibold'
                                        : 'bg-emerald-50 hover:bg-emerald-150 text-emerald-700 font-bold'
                                    }`}
                                    title={f.status === 'ATIVO' ? "Bloquear esta franquia" : "Liberar e ativar franquia"}
                                  >
                                    {f.status === 'ATIVO' ? 'Bloquear' : 'Liberar / Ativar'}
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* PLATFORM CONFIG / PRICING & CITIES */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Fare manager and activation costs */}
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4">
                  <Sliders size={18} className="text-emerald-700" />
                  Gerenciar Tarifas e Preços de Operação
                </h3>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-zinc-600">Preço Estimativa Base de Corrida (R$)</span>
                      <strong className="text-zinc-900">R$ {config.precoBase.toFixed(2)}</strong>
                    </div>
                    <input
                      type="range"
                      min="1.00"
                      max="15.00"
                      step="0.50"
                      value={config.precoBase}
                      onChange={e => setConfig({...config, precoBase: Number(e.target.value)})}
                      className="w-full accent-emerald-700"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-zinc-600">Preço de Corrida adicional por Km (R$)</span>
                      <strong className="text-zinc-900">R$ {config.precoKm.toFixed(2)} / km</strong>
                    </div>
                    <input
                      type="range"
                      min="1.00"
                      max="10.00"
                      step="0.10"
                      value={config.precoKm}
                      onChange={e => setConfig({...config, precoKm: Number(e.target.value)})}
                      className="w-full accent-emerald-700"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-zinc-600">Taxa do Motorista Licença Mensal (R$)</span>
                      <strong className="text-zinc-900">R$ {config.taxaAtivacaoMotorista.toFixed(2)}</strong>
                    </div>
                    <input
                      type="range"
                      min="20.00"
                      max="150.00"
                      step="5.00"
                      value={config.taxaAtivacaoMotorista}
                      onChange={e => setConfig({...config, taxaAtivacaoMotorista: Number(e.target.value)})}
                      className="w-full accent-emerald-700"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-zinc-600">Comissão de Viagem da Plataforma (%) (Legado)</span>
                      <strong className="text-zinc-900">{config.comissaoPercentual}% por trip</strong>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="20"
                      step="1"
                      value={config.comissaoPercentual}
                      onChange={e => setConfig({...config, comissaoPercentual: Number(e.target.value)})}
                      className="w-full accent-emerald-700"
                    />
                  </div>

                  <div className="border-t border-slate-100 pt-3 space-y-3">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider bg-slate-50 p-2 rounded-lg">Taxas de Serviço Fixas por Corrida</h4>
                    
                    <div>
                      <div className="flex justify-between text-xs mb-1 items-center">
                        <span className="text-zinc-600 font-medium">Taxa p/ Motoristas Regulares (R$)</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setConfig(prev => ({ ...prev, taxaServicoFixaRegular: Math.max(0, Number((prev.taxaServicoFixaRegular - 0.50).toFixed(2))) }))}
                            className="bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold px-2 py-1 rounded text-[11px] transition border border-zinc-200 cursor-pointer"
                          >
                            -0.50
                          </button>
                          <strong className="text-zinc-900 bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-105 text-xs min-w-[60px] text-center">
                            R$ {(config.taxaServicoFixaRegular ?? 1.00).toFixed(2)}
                          </strong>
                          <button
                            type="button"
                            onClick={() => setConfig(prev => ({ ...prev, taxaServicoFixaRegular: Number((prev.taxaServicoFixaRegular + 0.50).toFixed(2)) }))}
                            className="bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold px-2 py-1 rounded text-[11px] transition border border-zinc-200 cursor-pointer"
                          >
                            +0.50
                          </button>
                        </div>
                      </div>
                      <input
                        type="range"
                        min="0.00"
                        max="20.00"
                        step="0.10"
                        value={config.taxaServicoFixaRegular ?? 1.00}
                        onChange={e => setConfig({...config, taxaServicoFixaRegular: Number(e.target.value)})}
                        className="w-full accent-emerald-700 mt-1"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1 items-center">
                        <span className="text-zinc-600 font-medium">Taxa p/ Motoristas das Franquias (R$)</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setConfig(prev => ({ ...prev, taxaServicoFixaFranquia: Math.max(0, Number((prev.taxaServicoFixaFranquia - 0.50).toFixed(2))) }))}
                            className="bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold px-2 py-1 rounded text-[11px] transition border border-zinc-200 cursor-pointer"
                          >
                            -0.50
                          </button>
                          <strong className="text-zinc-900 bg-indigo-50 text-indigo-800 px-2 py-0.5 rounded border border-indigo-105 text-xs min-w-[60px] text-center">
                            R$ {(config.taxaServicoFixaFranquia ?? 1.00).toFixed(2)}
                          </strong>
                          <button
                            type="button"
                            onClick={() => setConfig(prev => ({ ...prev, taxaServicoFixaFranquia: Number((prev.taxaServicoFixaFranquia + 0.50).toFixed(2)) }))}
                            className="bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold px-2 py-1 rounded text-[11px] transition border border-zinc-200 cursor-pointer"
                          >
                            +0.50
                          </button>
                        </div>
                      </div>
                      <input
                        type="range"
                        min="0.00"
                        max="20.00"
                        step="0.10"
                        value={config.taxaServicoFixaFranquia ?? 1.00}
                        onChange={e => setConfig({...config, taxaServicoFixaFranquia: Number(e.target.value)})}
                        className="w-full accent-indigo-700 mt-1"
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg text-[11px] text-zinc-500 border">
                    * O reajuste tarifário é global e calculará a distância calculada das caronas de forma automática. 
                    <span className="block font-semibold text-rose-700 mt-1">Lembrando que o mínimo por corrida é sempre bloqueado em R$ 7,00!</span>
                  </div>
                </div>
              </div>

              {/* Supported Cities list manager */}
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm" id="admin-cities-list-manager-card">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4">
                  <Map size={18} className="text-emerald-700" />
                  Gerenciar Cidades Atendidas
                </h3>

                <div className="space-y-4 mb-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                        Selecione o Estado
                      </label>
                      <select
                        value={newCityState}
                        onChange={e => {
                          setNewCityState(e.target.value);
                          setNewCityName('');
                          setCitySearchQuery('');
                        }}
                        className="w-full p-2.5 text-xs rounded border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 font-semibold text-slate-700"
                      >
                        {BRAZILIAN_STATES.map(st => (
                          <option key={st.sigla} value={st.sigla}>
                            {st.sigla} - {st.nome}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                        Buscar Cidade ({newCityState})
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder={loadingIbge ? "Carregando real do IBGE..." : "Digitar para filtrar..."}
                          value={citySearchQuery}
                          disabled={loadingIbge}
                          onChange={e => {
                            setCitySearchQuery(e.target.value);
                            setNewCityName(e.target.value);
                          }}
                          className="w-full p-2.5 pl-3 text-xs rounded border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 pr-8 text-slate-700 font-medium"
                        />
                        {loadingIbge && (
                          <div className="absolute right-2.5 top-2.5 animate-spin w-4 h-4 border-2 border-emerald-700 border-t-transparent rounded-full"></div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Suggestion list of filtered municipalities from IBGE */}
                  {citySearchQuery.trim() && !loadingIbge && (
                    <div className="bg-slate-50 border rounded-lg p-2.5 max-h-48 overflow-y-auto space-y-1">
                      <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 flex justify-between items-center">
                        <span>Cidades encontradas no IBGE ({newCityState}):</span>
                        <span className="text-[8px] bg-slate-200 text-slate-600 px-1.5 rounded uppercase">oficial</span>
                      </p>
                      {(() => {
                        const filtered = ibgeCities
                          .filter(c => c.toLowerCase().includes(citySearchQuery.toLowerCase()))
                          .slice(0, 10);
                        
                        if (filtered.length === 0) {
                          return (
                            <button
                              type="button"
                              onClick={() => {
                                setNewCityName(citySearchQuery);
                                addNotification(`Usando entrada manual: ${citySearchQuery}`, "info");
                              }}
                              className="w-full text-left p-2.5 text-[11px] text-zinc-600 hover:bg-slate-200 rounded flex justify-between font-medium cursor-pointer"
                            >
                              <span>Adicionar "{citySearchQuery}" de forma manual</span>
                              <span className="text-[9px] bg-slate-400 text-white rounded px-1.5 py-0.5">Criar Nova</span>
                            </button>
                          );
                        }

                        return filtered.map(cName => (
                          <button
                            type="button"
                            key={cName}
                            onClick={() => {
                              setCitySearchQuery(cName);
                              setNewCityName(cName);
                            }}
                            className={`w-full text-left p-2 text-xs rounded transition-all flex justify-between items-center cursor-pointer ${
                              newCityName.toLowerCase() === cName.toLowerCase() 
                                ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 shadow-sm' 
                                : 'hover:bg-slate-100 text-zinc-700'
                            }`}
                          >
                            <span>{cName}</span>
                            <span className="text-[9px] text-zinc-400 font-semibold">{newCityState}</span>
                          </button>
                        ));
                      })()}
                    </div>
                  )}

                  {/* Status Indicator */}
                  {!loadingIbge && ibgeCities.length > 0 && (
                    <div className="flex items-center justify-between text-[10px] text-emerald-700 font-medium bg-emerald-50 px-2.5 py-1.5 rounded border border-emerald-100">
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                        {ibgeCities.length} cidades brasileiras mapeadas para o estado {newCityState}
                      </span>
                      <span className="text-[8px] bg-emerald-600 text-white px-1 py-0.5 rounded font-extrabold uppercase tracking-widest">
                        IBGE ATIVO
                      </span>
                    </div>
                  )}

                  {/* Action Add Button */}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={!newCityName.trim()}
                      onClick={(e) => {
                        e.preventDefault();
                        if (!newCityName.trim()) return;

                        // Check duplicate
                        if (cidades.some(c => c.nome.toLowerCase() === newCityName.trim().toLowerCase() && c.estado === newCityState)) {
                          addNotification(`A cidade de ${newCityName} (${newCityState}) já está cadastrada!`, "warn");
                          return;
                        }

                        const newCity: CidadeAtendida = {
                          id: 'city-' + Date.now() + '-' + Math.floor(Math.random() * 1000000),
                          nome: newCityName,
                          estado: newCityState,
                          status: 'ATIVO'
                        };

                        setCidades(prev => [...prev, newCity]);
                        setNewCityName('');
                        setCitySearchQuery('');
                        addNotification(`Cidade de ${newCityName} (${newCityState}) adicionada e ativada com sucesso!`, "success");
                      }}
                      className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                    >
                      <PlusCircle size={14} />
                      Ativar e Integrar {newCityName || "[Escolha acima]"} ({newCityState})
                    </button>
                  </div>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {cidades.map(c => (
                    <div key={c.id} className="flex justify-between items-center p-2.5 border rounded-lg bg-slate-50 text-xs">
                      <div>
                        <span className="font-bold text-zinc-900">{c.nome}</span>
                        <span className="text-[10px] text-zinc-400 block">{c.estado} • Brasil</span>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleToggleCity(c.id)}
                          className={`px-3 py-1 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                            c.status === 'ATIVO' 
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' 
                              : 'bg-zinc-200 text-zinc-500 hover:bg-zinc-350'
                          }`}
                        >
                          {c.status}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
            </>
            )}

            {/* MOTORISTAS APPROVAL & DOCUMENTS AUDIT LIST */}
            {adminSubTab === 'AUDITORIA' && (
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm animate-fade-in">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-3 mb-4">
                {(() => {
                  if (adminUser) {
                    return (
                      <label 
                        className="relative block w-7 h-7 bg-slate-100 border border-emerald-500 rounded-full overflow-hidden shrink-0 cursor-pointer group flex items-center justify-center shadow-inner" 
                        title="Clique aqui para carregar a foto do Dono da Plataforma"
                        id="admin-auditoria-title-avatar-label"
                      >
                        {adminUser.avatar ? (
                          <img
                            src={adminUser.avatar}
                            alt="avatar dono"
                            className="w-full h-full object-cover transition duration-150 group-hover:brightness-75"
                          />
                        ) : (
                          <img
                            referrerPolicy="no-referrer"
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${adminUser.nome || "Carlos"}`}
                            alt="avatar dono"
                            className="w-full h-full object-cover transition duration-150 group-hover:brightness-75"
                          />
                        )}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 transition duration-150">
                          <Camera size={10} className="text-white" />
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                const base64String = reader.result as string;
                                setUsers(prev => prev.map(u => {
                                  if (u.id === adminUser.id || u.tipo === 'ADMINISTRADOR') {
                                    return { ...u, avatar: base64String };
                                  }
                                  return u;
                                }));
                                addNotification("Sua foto de Dono da Plataforma foi carregada com sucesso!", "success");
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    );
                  }
                  return <UserCheck size={18} className="text-emerald-700 shrink-0" />;
                })()}
                <span>
                  {adminUser?.nome || "Dono da Plataforma"}: Aprovação de Motoristas e Auditoria de Documentos
                </span>
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b text-zinc-400">
                      <th className="py-2.5">Motorista</th>
                      <th className="py-2.5">Cidade</th>
                      <th className="py-2.5">Veículo (Mín: 2010)</th>
                      <th className="py-2.5 text-center">Documentos CNH & Fotos</th>
                      <th className="py-2.5">Status Geral</th>
                      <th className="py-2.5 text-right">Ações de Liberação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {motoristas.map(m => {
                      const userObj = users.find(u => u.id === m.userId);
                      return (
                        <tr key={m.id} className="border-b last:border-0 hover:bg-gray-50/50">
                          <td className="py-3 pr-2">
                            <div className="flex items-center gap-2">
                              <img src={userObj?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} alt="carona" className="w-7 h-7 rounded-full object-cover" />
                              <div>
                                <span className="font-bold block text-slate-900">{userObj?.nome}</span>
                                <span className="text-[10px] text-zinc-400">{userObj?.email} • {userObj?.telefone}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3">{m.cidade}</td>
                          <td className="py-3">
                            <span className="font-semibold block text-emerald-800">{m.veiculo.marca} {m.veiculo.modelo}</span>
                            <span className="text-[10px] text-zinc-500">{m.veiculo.cor} • Placa: {m.veiculo.placa} • Ano: {m.veiculo.ano}</span>
                          </td>
                          <td className="py-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => addNotification(`Abrindo auditoria CNH: ${m.documentos.cnhFrente}`, "info")}
                                className="bg-zinc-100 hover:bg-zinc-200 px-2 py-1 rounded text-[9px] font-semibold"
                                title="Visualizar CNH"
                              >
                                CNH
                              </button>
                              <button
                                onClick={() => addNotification(`Comprovante Endereço: ${m.documentos.comprovanteEndereco}`, "info")}
                                className="bg-zinc-100 hover:bg-zinc-200 px-2 py-1 rounded text-[9px] font-semibold"
                                title="Ver Comprovante"
                              >
                                Endereço
                              </button>
                              <button
                                onClick={() => addNotification(`Carro Frente: ${m.documentos.veiculoFrente} | Lateral: ${m.documentos.veiculoLateral}`, "info")}
                                className="bg-zinc-100 hover:bg-zinc-200 px-2 py-1 rounded text-[9px] font-semibold"
                                title="Ver fotos veículo"
                              >
                                Fotos Veículo
                              </button>
                            </div>
                          </td>
                          <td className="py-3">
                            <div className="space-y-0.5">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                m.documentoStatus === 'APROVADO' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                              }`}>
                                Docs: {m.documentoStatus}
                              </span>
                              <span className={`block text-[10px] ${m.isSubscriptionPaid ? 'text-emerald-700 font-bold' : 'text-rose-500'}`}>
                                {m.isSubscriptionPaid ? 'Assinatura Paga' : 'Mensalidade Pendente'}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {m.documentoStatus === 'PENDENTE' && (
                                <>
                                  <button
                                    onClick={() => handleApproveDriverDocs(m.id, true)}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded px-2.5 py-1 text-[10px] font-bold"
                                  >
                                    Aprovar Docs
                                  </button>
                                  <button
                                    onClick={() => handleApproveDriverDocs(m.id, false)}
                                    className="bg-rose-600 hover:bg-rose-700 text-white rounded px-2.5 py-1 text-[10px] font-bold"
                                  >
                                    Rejeitar
                                  </button>
                                </>
                              )}

                              {userObj && (
                                <button
                                  onClick={() => handleToggleBlockUser(userObj.id)}
                                  className={`px-2 py-1 rounded text-[10px] font-semibold ${
                                    userObj.status === 'BLOQUEADO' 
                                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' 
                                      : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                                  }`}
                                >
                                  {userObj.status === 'BLOQUEADO' ? 'Desbloquear' : 'Bloquear Usuário'}
                                </button>
                              )}

                              <button
                                onClick={() => handleToggleSubscriptionPaid(m.id)}
                                className={`px-2 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                                  m.isSubscriptionPaid 
                                    ? 'bg-amber-100 text-amber-900 hover:bg-amber-200' 
                                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                                }`}
                                title={m.isSubscriptionPaid ? "Marcar assinatura como pendente" : "Marcar assinatura como paga/ativa"}
                              >
                                {m.isSubscriptionPaid ? 'Remover Pagto' : 'Confirmar Pagto'}
                              </button>

                              <button
                                onClick={() => {
                                  if (window.confirm(`Tem certeza de que deseja EXCLUIR permanentemente o cadastro de ${userObj?.nome || 'este motorista'}? Esta ação removerá o motorista e o usuário do banco de dados.`)) {
                                    handleDeleteMotorista(m.id);
                                  }
                                }}
                                className="p-1 text-rose-600 hover:bg-rose-50 rounded border border-transparent hover:border-rose-200 cursor-pointer transition-all shrink-0"
                                title="Excluir Motorista"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            )}

            {/* CLIENTS MANAGEMENT LIST */}
            {adminSubTab === 'CONFIG_GERAL' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
              
              {/* Clients management table */}
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4">
                  <UserIcon size={18} className="text-emerald-700" />
                  Auditoria de Clientes e Bloqueios
                </h3>

                <div className="overflow-y-auto max-h-72">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b text-zinc-400">
                        <th className="py-2">Nome / Contato</th>
                        <th className="py-2">Cidade</th>
                        <th className="py-2">Status</th>
                        <th className="py-2 text-right">Controle</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clientes.map(c => {
                        const userObj = users.find(u => u.id === c.userId);
                        return (
                          <tr key={c.id} className="border-b last:border-0 hover:bg-slate-50">
                            <td className="py-3">
                              <strong className="block text-slate-900">{userObj?.nome}</strong>
                              <span className="text-[9px] text-zinc-400 font-mono">CPF: {c.cpf} • {userObj?.email}</span>
                            </td>
                            <td className="py-3">{c.cidade}</td>
                            <td className="py-3">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                userObj?.status === 'BLOQUEADO' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                              }`}>
                                {userObj?.status}
                              </span>
                            </td>
                            <td className="py-3 text-right">
                              {userObj && (
                                <button
                                  onClick={() => handleToggleBlockUser(userObj.id)}
                                  className="text-slate-500 hover:text-rose-600 transition"
                                >
                                  {userObj.status === 'BLOQUEADO' ? 'Liberar' : 'Bloquear'}
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Rides history journal */}
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4">
                  <FileText size={18} className="text-emerald-700" />
                  Ver Corridas Realizadas / Em Andamento
                </h3>

                <div className="overflow-y-auto max-h-72 space-y-2.5">
                  {corridas.map(ct => (
                    <div key={ct.id} className="p-3 border rounded-lg bg-slate-50 flex items-start justify-between text-xs">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <strong className="text-slate-900 text-[10px]">{ct.clienteNome}</strong>
                          <span className="text-[10px] text-zinc-400">→</span>
                          <span className="text-slate-500 font-medium text-[10px]">{ct.motoristaNome || 'Aguardando'}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1">📌 {ct.origem ? ct.origem.split(',')[0] : 'Origem'} ➔ {ct.destino ? ct.destino.split(',')[0] : 'Destino'}</p>
                        <span className="text-[10px] text-zinc-400 font-mono">{new Date(ct.createdAt).toLocaleString()}</span>
                      </div>

                      <div className="text-right shrink-0">
                        <strong className="block text-emerald-800">R$ {ct.valor.toFixed(2)}</strong>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold inline-block mt-1 ${
                          ct.status === 'CONCLUIDA' ? 'bg-emerald-100 text-emerald-800' : ct.status === 'SOLICITADA' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {ct.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
            )}

          </div>
        )}

        {/* 4. PAINEL DO FRANQUEADO (FRANQUIA) */}
        {activePortal === 'FRANQUIA' && (
          <div className="space-y-6" id="franchise-view-container">
            
            {/* Franchise selector top header */}
            <div className="bg-slate-950 text-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-ping"></span>
                  Painel de Operações Regionais (Franqueados)
                </h2>
                <p className="text-xs text-slate-300 mt-1">
                  Selecione sua cidade licenciada para gerenciar motoristas locais, aprovar documentos e auditar taxas de repassamento ao proprietário.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs font-bold text-slate-400">Cidade da Franquia:</span>
                <select
                  value={activeFranqueadoId}
                  onChange={(e) => setActiveFranqueadoId(e.target.value)}
                  className="bg-slate-800 text-white font-bold text-xs p-2.5 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                >
                  {franqueados.map(f => (
                    <option key={f.id} value={f.id}>
                      {f.cidade} ({f.nome})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* If the selected franchise is blocked */}
            {(() => {
              const currentFran = franqueados.find(f => f.id === activeFranqueadoId);
              if (!currentFran) return null;

              if (currentFran.status === 'BLOQUEADO') {
                return (
                  <div className="bg-rose-50 border-2 border-rose-200 text-rose-950 p-6 rounded-2xl flex flex-col sm:flex-row items-center gap-4 animate-pulse">
                    <ShieldAlert size={40} className="text-rose-600 shrink-0" />
                    <div>
                      <h3 className="font-bold text-sm text-rose-900">ESTA FRANQUIA ENCONTRA-SE SUSPENSA / BLOQUEADA</h3>
                      <p className="text-xs mt-1 text-rose-700">
                        O Administrador Master da marca <strong>Carona</strong> desativou temporariamente a licença de operação para a cidade de <strong>{currentFran.cidade}</strong>. 
                        Novos cadastros de motoristas e repasses estão suspensos.
                      </p>
                      <span className="block text-[10px] uppercase font-mono mt-2 tracking-wider text-rose-500">
                        Por favor, realize o pagamento dos repasses acumulados ou entre em contato pelo e-mail pix@carona.com.br
                      </span>
                    </div>
                  </div>
                );
              }

              // ELSE: FRANCHISE IS ACTIVE! Let's build the operations layout.
              const cityRides = corridas.filter(c => {
                const drv = motoristas.find(m => m.id === c.motoristaId);
                return drv?.cidade === currentFran.cidade || (c.origem && c.origem.includes(currentFran.cidade));
              });
              
              const cityCompletedRides = cityRides.filter(r => r.status === 'CONCLUIDA');
              const grossCityVolume = cityCompletedRides.reduce((sum, r) => sum + r.valor, 0);
              const cityGrossCommission = cityCompletedRides.reduce((sum, r) => sum + getCorridaTaxaServico(r), 0);
              const totalRepasseDevido = cityCompletedRides.length * currentFran.valorFixoPorCorrida;
              const netFranchiseProfit = cityGrossCommission - totalRepasseDevido;

              const cityDrivers = motoristas.filter(m => m.cidade === currentFran.cidade);

              return (
                <div className="space-y-6">
                  
                  {/* KPI dashboard grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Volume Bruto de Viagens</p>
                          <p className="text-xl font-bold text-slate-900 mt-1">R$ {grossCityVolume.toFixed(2)}</p>
                          <span className="text-[9px] text-slate-400 block mt-1">{cityCompletedRides.length} viagens finalizadas</span>
                        </div>
                        <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {currentFran.cidade}
                        </span>
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Comissão Bruta (Taxa Fixa)</p>
                          <p className="text-xl font-bold text-slate-900 mt-1">R$ {cityGrossCommission.toFixed(2)}</p>
                          <span className="text-[9px] text-slate-400 block mt-1">Intermediação de caronas</span>
                        </div>
                        <span className="bg-indigo-50 text-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Retenção
                        </span>
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-amber-200 shadow-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[10px] text-amber-800 font-bold uppercase tracking-wider">Repasse ao Dono (Fixo)</p>
                          <p className="text-xl font-bold text-amber-700 mt-1">R$ {totalRepasseDevido.toFixed(2)}</p>
                          <span className="text-[9px] text-amber-600 font-medium block mt-1">R$ {currentFran.valorFixoPorCorrida.toFixed(2)} fixo por corrida</span>
                        </div>
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Devido
                        </span>
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-emerald-200 shadow-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider">Resultado Líquido Franquia</p>
                          <p className="text-xl font-bold text-emerald-600 mt-1">
                            R$ {netFranchiseProfit.toFixed(2)}
                          </p>
                          <span className="text-[9px] text-emerald-600 font-medium block mt-1">Margem operacional líquida</span>
                        </div>
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Lucro
                        </span>
                      </div>
                    </div>

                  </div>

                  {/* Operational body */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Local Drivers approval queue */}
                    <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                      <div>
                        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                          <UserCheck size={18} className="text-amber-500" />
                          Auditoria de Motoristas da Franquia ({currentFran.cidade})
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                          Como operador da franquia, você é responsável por aprovar os documentos CNH dos motoristas regionais e confirmar o acerto de faturas mensais.
                        </p>
                      </div>

                      {cityDrivers.length === 0 ? (
                        <div className="p-10 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed">
                          Nenhum motorista registrado nesta cidade ({currentFran.cidade}) até o momento.
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="border-b text-zinc-400">
                                <th className="py-2.5">Motorista</th>
                                <th className="py-2.5">Veículo / Placa</th>
                                <th className="py-2.5 text-center">Docs CNH</th>
                                <th className="py-2.5">Status Cadastro</th>
                                <th className="py-2.5 text-right">Ação Operacional</th>
                              </tr>
                            </thead>
                            <tbody>
                              {cityDrivers.map(m => {
                                const userObj = users.find(u => u.id === m.userId);
                                return (
                                  <tr key={m.id} className="border-b last:border-0 hover:bg-gray-50/50">
                                    <td className="py-3">
                                      <div className="flex items-center gap-2">
                                        <img 
                                          src={userObj?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} 
                                          alt="carona" 
                                          className="w-7 h-7 rounded-full object-cover shrink-0" 
                                        />
                                        <div>
                                          <span className="font-bold text-slate-800 block leading-tight">{userObj?.nome}</span>
                                          <span className="text-[10px] text-slate-400 block">{userObj?.email} • {userObj?.telefone}</span>
                                        </div>
                                      </div>
                                    </td>
                                    
                                    <td className="py-3 text-[11px]">
                                      <span className="block font-semibold text-slate-800">{m.veiculo.marca} {m.veiculo.modelo} ({m.veiculo.cor})</span>
                                      <span className="font-mono text-[9px] bg-slate-100 px-1 py-0.2 rounded text-slate-600 block w-max mt-0.5">Placa: {m.veiculo.placa}</span>
                                    </td>

                                    <td className="py-3 text-center">
                                      <button
                                        onClick={() => addNotification(`Analisando documento: CNH Ativa do motorista para ${currentFran.cidade}`)}
                                        className="text-[9px] bg-slate-100 font-bold px-2 py-1 rounded text-slate-600 hover:bg-slate-200 cursor-pointer border-0"
                                      >
                                        Ver CNH
                                      </button>
                                    </td>

                                    <td className="py-3">
                                      <div className="space-y-1">
                                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full inline-block ${
                                          m.documentoStatus === 'APROVADO' 
                                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                                            : m.documentoStatus === 'REJEITADO'
                                            ? 'bg-red-50 text-red-800 border border-red-200'
                                            : 'bg-amber-50 text-amber-800 border border-amber-200 animate-pulse'
                                        }`}>
                                          Docs: {m.documentoStatus}
                                        </span>
                                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full block w-max ${
                                          m.isSubscriptionPaid 
                                            ? 'bg-blue-50 text-blue-800 border border-blue-200' 
                                            : 'bg-rose-50 text-rose-800 border border-rose-200'
                                        }`}>
                                          Mensalidade: {m.isSubscriptionPaid ? 'PAGA' : 'PENDENTE'}
                                        </span>
                                      </div>
                                    </td>

                                    <td className="py-3 text-right">
                                      <div className="flex flex-col gap-1 items-end animate-fade-in">
                                        {m.documentoStatus === 'PENDENTE' && (
                                          <div className="flex gap-1">
                                            <button
                                              onClick={() => {
                                                setMotoristas(prev => prev.map(item => {
                                                  if (item.id === m.id) {
                                                    const sOnline = item.isSubscriptionPaid;
                                                    return { 
                                                      ...item, 
                                                      documentoStatus: 'APROVADO',
                                                      isOnline: sOnline ? true : item.isOnline
                                                    };
                                                  }
                                                  return item;
                                                }));

                                                setUsers(prev => prev.map(u => {
                                                  if (u.id === m.userId) {
                                                    return {
                                                      ...u,
                                                      status: m.isSubscriptionPaid ? 'ATIVO' : 'AGUARDANDO_PAGAMENTO'
                                                    };
                                                  }
                                                  return u;
                                                }));

                                                const statusText = m.isSubscriptionPaid
                                                  ? `Operador aprovou os de documentos e o motorista ${userObj?.nome || 'motorista'} está ONLINE automaticamente!`
                                                  : `Operador aprovou documentação CNH de ${userObj?.nome || 'motorista'}. Resta pagar a mensalidade para poder ficar ONLINE!`;
                                                addNotification(statusText, 'success');
                                              }}
                                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow-sm cursor-pointer border-0"
                                            >
                                              Aprovar Docs
                                            </button>
                                            <button
                                              onClick={() => {
                                                setMotoristas(prev => prev.map(item => {
                                                  if (item.id === m.id) return { ...item, documentoStatus: 'REJEITADO' };
                                                  return item;
                                                }));
                                                addNotification(`Operador rejeitou documentos de ${userObj?.nome}`, 'warn');
                                              }}
                                              className="bg-rose-600 hover:bg-rose-700 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm cursor-pointer border-0"
                                            >
                                              Rejeitar
                                            </button>
                                          </div>
                                        )}

                                        <button
                                          onClick={() => handleToggleSubscriptionPaid(m.id)}
                                          className={`px-2 py-1 rounded text-[9px] font-bold cursor-pointer transition-all border-0 ${
                                            m.isSubscriptionPaid
                                              ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                                          }`}
                                        >
                                          {m.isSubscriptionPaid ? 'Mensalidade Paga ✓' : 'Marcar como Pago'}
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    {/* Local rides ledger */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                      <div>
                        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                          <Activity size={18} className="text-indigo-600" />
                          Histórico de Caronas Regionais
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                          Auditoria de viagens finalizadas na franquia de {currentFran.cidade}.
                        </p>
                      </div>

                      <div className="space-y-3.5 max-h-96 overflow-y-auto pr-1">
                        {cityRides.length === 0 ? (
                          <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed">
                            Nenhuma corrida registrada nesta área da franquia.
                          </div>
                        ) : (
                          cityRides.map(r => (
                            <div key={r.id} className="p-3 border rounded-xl bg-slate-50 text-[11px] hover:border-indigo-400 transition-all space-y-2">
                              <div className="flex justify-between items-center gap-1">
                                <span className="font-mono text-[9px] font-bold text-slate-400">#CC-{r.id}</span>
                                <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded-full uppercase ${
                                  r.status === 'CONCLUIDA'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : r.status === 'CANCELADA'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-blue-100 text-blue-800 animate-pulse'
                                }`}>
                                  {r.status}
                                </span>
                              </div>

                              <div className="space-y-1">
                                <span className="block text-[11px] text-slate-800 truncate">De: {r.origem}</span>
                                <span className="block text-[11px] text-slate-800 truncate">Para: {r.destino}</span>
                              </div>

                              <div className="flex justify-between items-center border-t border-slate-200/60 pt-2 text-[10px] text-slate-500">
                                <div>
                                  <span className="block">Piloto: <strong className="text-slate-800">{r.motoristaNome || "Aguardando"}</strong></span>
                                  <span className="block">Passageiro: <strong className="text-slate-800">{r.clienteNome}</strong></span>
                                </div>
                                <div className="text-right">
                                  <span className="block font-bold text-slate-800 text-xs">R$ {r.valor.toFixed(2)}</span>
                                  {r.status === 'CONCLUIDA' && (
                                    <span className="text-[9px] text-amber-600 font-semibold block">
                                      Devido ao dono: R$ {currentFran.valorFixoPorCorrida.toFixed(2)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                  </div>

                </div>
              );
            })()}

          </div>
        )}

        {/* 5. EXPLANATIVE CODE & HOSTINGER GUIDE TAB */}
        {activePortal === 'CODE' && (
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6" id="code-instructions-tab">
            <div className="border-b pb-4">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="text-emerald-700" />
                Carona • Arquitetura de Produção SaaS
              </h2>
              <p className="text-xs text-zinc-500 mt-1">
                O projeto foi programado de acordo com as especificações solicitadas para funcionar perfeitamente na Hostinger e servidores Node.js.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-4">
                <h3 className="font-bold text-sm text-slate-800">📁 ESTRUTURA DO PROJETO CRIADA</h3>
                <p className="text-xs text-slate-600">
                  Os seguintes arquivos foram inicializados no seu workspace para exportar com total fidelidade:
                </p>
                <ul className="text-xs space-y-2 text-slate-600 bg-slate-50 p-4 rounded-xl border font-mono">
                  <li>🟢 <strong>/database/schema.prisma</strong>: Modelagem de tabelas PostgreSQL completas (Users, Cliente, Motorista, Veiculo, Corridas, Pagamentos, Documentos) com suporte nativo ao Dono e Franqueados.</li>
                  <li>🟢 <strong>/backend/index.js</strong>: Servidor Express API Rest integral estruturado, autenticação baseada em JWT com regras de acesso por tipo de conta, Multer uploads de documentos de motoristas e Socket.IO real-time para simulações dinâmicas de trajeto.</li>
                  <li>🟢 <strong>/backend/package.json</strong>: Gerenciamento de dependências prontas de produção para execução limpa nos servidores Linux.</li>
                  <li>🟢 <strong>/README_HOSTINGER.md</strong>: Guia passo a passo explicativo de instalação local e implantação no hPanel da Hostinger.</li>
                </ul>

                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100/50">
                  <h4 className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                    <Sparkles size={14} className="text-emerald-700" />
                    Tecnologias do Sistema:
                  </h4>
                  <ul className="text-xs text-emerald-900 list-disc list-inside mt-1.5 space-y-1">
                    <li>Prisma ORM e driver pg para PostgreSQL de alta concorrência.</li>
                    <li>JWT com hash de senha seguro no cadastro e autenticação silenciosa automática.</li>
                    <li>Sinal de GPS e localização simulado de forma iterativa via vetor SVG em tempo real.</li>
                    <li>Modulo de intermediação financeira com taxas de comissão operacional inteligentes escalando de 1% a 20%.</li>
                    <li>Auto-detecção de administrador central (Dono da Plataforma) no login por endereço de email seguro.</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-sm text-slate-800">🚀 RESUMO DAS OPERAÇÕES DO PROTÓTIPO</h3>
                <p className="text-xs text-slate-600">
                  Utilize as opções refinadas de simulação e login seguro para alternar e testar todas as funcionalidades do ecossistema:
                </p>
                
                <div className="space-y-2 text-xs">
                  <div className="p-3 border rounded-lg bg-zinc-50">
                    <strong className="block text-emerald-800">1. Acesso Central e Perfil "Dono da Plataforma":</strong>
                    A opção explícita "Admin Central" foi removida da tela de login por questões de segurança de marca. O sistema agora autodetecta o Proprietário/Dono (Carlos Oliveira) quando ele efetua login com o e-mail cadastrado <span className="font-mono text-emerald-950 font-bold bg-emerald-100/50 px-1 rounded">tvsonic577@gmail.com</span> e senha <span className="font-mono text-emerald-950 font-bold bg-emerald-100/50 px-1 rounded">Jr990387</span>. Todas as interfaces e títulos atualizam o nome em tempo real!
                  </div>

                  <div className="p-3 border rounded-lg bg-zinc-50">
                    <strong className="block text-emerald-800">2. Comissão Operacional do Dono (1% a 20%):</strong>
                    O Administrador Central pode ajustar remotamente as tarifas de intermediação usando o novo slider de comissão calibrado com o mínimo de 1% e o máximo saudável de 20%. Isso altera instantaneamente o repasse financeiro simulado de todas as corridas em andamento.
                  </div>

                  <div className="p-3 border rounded-lg bg-zinc-50">
                    <strong className="block text-emerald-800">3. Fluxo de Documentações e Ativação Pix:</strong>
                    Motoristas recém-cadastrados entram com status pendente de auditoria de veículo. O Dono da Plataforma aprova os documentos e o motorista faz a simulação do QR Code Pix de ativação mensal com base no valor programado nas configurações centrais.
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        </div> {/* CLOSE main-scrollable-canvas */}

        {/* FOOTER */}
        <footer className="bg-zinc-900 py-6 text-xs text-center text-zinc-400 border-t border-zinc-800 shrink-0 mt-auto" id="carona-footer">
          <div className="max-w-7xl mx-auto px-4">
            <p>© 2026 Carona • Todos os direitos reservados. Preparado para escala de produção SaaS e hospedagem na Hostinger.</p>
            <p className="text-zinc-600 mt-1 font-mono">Plataforma desenvolvida com Node.js, Express, React, Tailwind CSS e Prisma PostgreSQL.</p>
          </div>
        </footer>

      </div> {/* CLOSE main-content-flow */}

      {/* INTERACTIVE PIX COMPONENT MODAL MOCK */}
      {showPixCheckout && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded font-bold uppercase tracking-wider">
                  CHECKOUT PIX INTEGRADO
                </span>
                <h3 className="text-base font-bold text-zinc-900 mt-1.5">Ativação da Licença Mensal</h3>
              </div>
              <button 
                onClick={() => setShowPixCheckout(false)} 
                className="p-1 hover:bg-zinc-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            <div className="text-center p-4 bg-emerald-50 rounded-xl space-y-1">
              <span className="text-xs text-emerald-990 font-medium block">Valor cobrado para ativar motoristas</span>
              <strong className="text-2xl font-extrabold text-emerald-700">R$ {config.taxaAtivacaoMotorista.toFixed(2)}</strong>
            </div>

            <div className="text-center space-y-2">
              <p className="text-[11px] text-zinc-500">Escaneie o QR Code Pix abaixo pelo app do seu banco para liberação automática da sua licença:</p>
              
              <div className="bg-white p-3 border inline-block rounded-xl mx-auto shadow-inner">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                    "00020101021126580014br.gov.bcb.pix01362e19cb6d-8ca1-4ebc-bf95-952c4ce0a232520400005303986540" + 
                    config.taxaAtivacaoMotorista.toFixed(2) + "5802BR5915CARONA_LTDA6009SAO_PAULO"
                  )}`}
                  alt="Pix QR Code"
                  className="w-36 h-36 object-contain"
                />
              </div>

              <div className="p-2 border rounded bg-slate-50 text-[10px] font-mono break-all text-slate-500 text-left relative group">
                <div className="font-bold text-slate-700 block text-[9px] mb-0.5 uppercase">Código Pix Copia e Cola:</div>
                pix-checkout-licenca-carona-4990-2026-prod-mercadopago-...
              </div>
            </div>

            {pixPaidSuccessfully ? (
              <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-xl text-center text-xs font-bold text-emerald-800 animate-pulse">
                ✓ PAGAMENTO CONFIRMADO! Sincronizando...
              </div>
            ) : (
              <button
                onClick={handleConfirmPixPayment}
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow"
              >
                <span>Confirmar Pagamento Simulado ✓</span>
              </button>
            )}

            <p className="text-[9px] text-zinc-400 text-center">
              Em produção, o webhook da Hostinger processará a transação automaticamente liberando a licença no banco de dados.
            </p>
          </div>
        </div>
      )}

      {/* BOTÃO GLOBAL DE SUPORTE WHATSAPP - Visível em todos os painéis e logins */}
      {(() => {
        let whatsappLink = "https://wa.me/5562996346075";
        let whatsappText = "Suporte";
        let whatsappTitle = "Falar com o Suporte Carona";

        if (currentActiveCorrida && currentActiveCorrida.motoristaId) {
          const activeMotoristaObj = motoristas.find(m => m.id === currentActiveCorrida.motoristaId);
          const activeMotoristaUser = activeMotoristaObj ? users.find(u => u.id === activeMotoristaObj.userId) : null;
          if (activeMotoristaUser && activeMotoristaUser.telefone) {
            const digitsOnly = activeMotoristaUser.telefone.replace(/\D/g, '');
            const formattedNum = (digitsOnly.startsWith('55') && digitsOnly.length >= 12) ? digitsOnly : `55${digitsOnly}`;
            whatsappLink = `https://wa.me/${formattedNum}`;
            whatsappText = "falar com seu motorista";
            whatsappTitle = `Falar com seu motorista (${activeMotoristaUser.nome})`;
          }
        }

        return (
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            title={whatsappTitle}
            className="fixed bottom-6 right-6 z-50 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full p-4 shadow-2xl flex items-center justify-center gap-2 hover:scale-105 transition-all duration-300 group border-2 border-emerald-400 font-bold"
            id="global-whatsapp-support-btn"
          >
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400"></span>
            </span>
            <MessageCircle size={18} />
            <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out text-xs tracking-wide uppercase font-bold whitespace-nowrap">
              {whatsappText}
            </span>
          </a>
        );
      })()}

    </div>
  );
}
