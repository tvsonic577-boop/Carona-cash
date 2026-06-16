import React, { useState, useEffect } from 'react';
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
  AlertCircle
} from 'lucide-react';

import { 
  User, 
  Cliente, 
  Motorista, 
  Corrida, 
  CidadeAtendida, 
  PlataformaConfig, 
  CorridaStatus, 
  UserStatus 
} from './types';

import {
  INITIAL_CONFIG,
  INITIAL_CIDADES,
  INITIAL_USERS,
  INITIAL_CLIENTES,
  INITIAL_MOTORISTAS,
  INITIAL_CORRIDAS
} from './data';

import SimulatedMap from './components/SimulatedMap';

export default function App() {
  // --- Persistent State Simulation ---
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('cc_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [clientes, setClientes] = useState<Cliente[]>(() => {
    const saved = localStorage.getItem('cc_clientes');
    return saved ? JSON.parse(saved) : INITIAL_CLIENTES;
  });

  const [motoristas, setMotoristas] = useState<Motorista[]>(() => {
    const saved = localStorage.getItem('cc_motoristas');
    return saved ? JSON.parse(saved) : INITIAL_MOTORISTAS;
  });

  const [corridas, setCorridas] = useState<Corrida[]>(() => {
    const saved = localStorage.getItem('cc_corridas');
    return saved ? JSON.parse(saved) : INITIAL_CORRIDAS;
  });

  const [cidades, setCidades] = useState<CidadeAtendida[]>(() => {
    const saved = localStorage.getItem('cc_cidades');
    return saved ? JSON.parse(saved) : INITIAL_CIDADES;
  });

  const [config, setConfig] = useState<PlataformaConfig>(() => {
    const saved = localStorage.getItem('cc_config');
    return saved ? JSON.parse(saved) : INITIAL_CONFIG;
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
    localStorage.setItem('cc_config', JSON.stringify(config));
  }, [config]);

  // --- Active Session Info ---
  // We provide a visual "Simulator Mode Selector" at the very top so the reviewer
  // can test Client, Driver, and Admin flows concurrently in real time.
  const [activePortal, setActivePortal] = useState<'CLIENTE' | 'MOTORISTA' | 'ADMIN' | 'CODE'>('CLIENTE');
  
  // Currently logged-in profiles helper
  const [activeClienteId, setActiveClienteId] = useState<string>('c-1'); // Amanda
  const [activeMotoristaId, setActiveMotoristaId] = useState<string>('m-1'); // Roberto

  // --- Client Portal Variables ---
  const [clientOrigin, setClientOrigin] = useState<string>('Avenida Paulista, 1000 - Bela Vista');
  const [clientDestination, setClientDestination] = useState<string>('');
  const [selectedDestinationIndex, setSelectedDestinationIndex] = useState<number>(-1);
  const [calculatedTrip, setCalculatedTrip] = useState<{
    distancia: number;
    duracao: number;
    valor: number;
  } | null>(null);

  const popularDestinations = [
    { nome: 'Av. Brigadeiro Faria Lima, 2232 - Itaim Bibi', coords: { lat: -23.5824, lng: -46.6868 }, distance: 5.8 },
    { nome: 'Rua Augusta, 450 - Consolação', coords: { lat: -23.5505, lng: -46.6579 }, distance: 1.8 },
    { nome: 'Parque Ibirapuera - Moema', coords: { lat: -23.5874, lng: -46.6576 }, distance: 4.1 },
    { nome: 'Aeroporto de Congonhas - Vila Congonhas', coords: { lat: -23.6273, lng: -46.6565 }, distance: 8.5 },
  ];

  // --- Form Registration Variables ---
  const [registrationMode, setRegistrationMode] = useState<'NONE' | 'CLIENTE' | 'MOTORISTA'>('NONE');
  const [isPendingPaymentsWindowOpen, setIsPendingPaymentsWindowOpen] = useState(false);
  
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
  const [newCityState, setNewCityState] = useState('SP');

  // --- Notification System ---
  const [notifications, setNotifications] = useState<{ id: string; text: string; type: 'success' | 'info' | 'warn' }[]>([]);

  const addNotification = (text: string, type: 'success' | 'info' | 'warn' = 'info') => {
    const id = Date.now().toString() + '-' + Math.random().toString(36).substring(2, 9);
    setNotifications(prev => [...prev, { id, text, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  // Auto calculate trip cost whenever settings or destination values adjust
  useEffect(() => {
    if (selectedDestinationIndex >= 0) {
      const dest = popularDestinations[selectedDestinationIndex];
      const dist = dest.distance;
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
  }, [selectedDestinationIndex, config]);

  // --- ACTIVE CORRIDA STATE HANDLERS ---
  const currentActiveCorrida = corridas.find(
    c => (c.clienteId === activeClienteId || c.motoristaId === activeMotoristaId) && 
    c.status !== 'CONCLUIDA' && c.status !== 'CANCELADA'
  );

  // Handle Client Requesting ride
  const handleRequestRide = () => {
    if (selectedDestinationIndex < 0) {
      addNotification("Selecione um destino do roteiro!", "warn");
      return;
    }
    const dest = popularDestinations[selectedDestinationIndex];
    const cli = clientes.find(c => c.id === activeClienteId);
    if (!cli) return;
    const isBlocked = users.find(u => u.id === cli.userId)?.status === 'BLOQUEADO';
    if (isBlocked) {
      addNotification("Usuário bloqueado! Entre em contato com o suporte.", "warn");
      return;
    }

    const value = calculatedTrip ? calculatedTrip.valor : 7.00;

    const newCorrida: Corrida = {
      id: 'cr-' + Date.now() + '-' + Math.floor(Math.random() * 1000000),
      clienteId: activeClienteId,
      clienteNome: users.find(u => u.id === cli.userId)?.nome || 'Cliente Anônimo',
      clienteTelefone: users.find(u => u.id === cli.userId)?.telefone || '(11) 99999-0000',
      origem: clientOrigin,
      destino: dest.nome,
      origemCoords: { lat: -23.5615, lng: -46.6562 }, // Av Paulista
      destinoCoords: dest.coords,
      distancia: dest.distance,
      duracao: calculatedTrip?.duracao || 10,
      valor: value,
      status: 'SOLICITADA',
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
    setCorridas(prev => prev.map(c => {
      if (c.id === corridaId) {
        return { ...c, status: 'EM_ANDAMENTO' };
      }
      return c;
    }));
    addNotification("Passageiro a bordo! Iniciando trajeto até o destino.", "info");
  };

  // Skip simulation state manually to Concluida
  const handleFinishTrip = (corridaId: string) => {
    setCorridas(prev => prev.map(c => {
      if (c.id === corridaId) {
        return { ...c, status: 'CONCLUIDA' };
      }
      return c;
    }));
    addNotification("Corrida de transporte finalizada! Obrigado por dirigir com Carona Cash.", "success");
  };

  // Client cancels active request
  const handleCancelRide = (corridaId: string) => {
    setCorridas(prev => prev.map(c => {
      if (c.id === corridaId) {
        return { ...c, status: 'CANCELADA' };
      }
      return c;
    }));
    addNotification("Sua corrida foi cancelada.", "warn");
  };

  // --- REGISTRATION FORMS FORM SUBMISSION ---
  const submitClientRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientData.nome || !newClientData.cpf || !newClientData.email || !newClientData.senha) {
      setValidationError("Preencha todos os campos obrigatórios!");
      return;
    }

    const newUserId = 'u-cli-' + Date.now() + '-' + Math.floor(Math.random() * 1000000);
    const newCliId = 'c-' + Date.now() + '-' + Math.floor(Math.random() * 1000000);

    const newUser: User = {
      id: newUserId,
      nome: newClientData.nome,
      email: newClientData.email,
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

    setUsers(prev => [newUser, ...prev]);
    setClientes(prev => [newCli, ...prev]);
    setActiveClienteId(newCliId);
    
    setRegistrationMode('NONE');
    setValidationError(null);
    addNotification("Cadastro de Cliente realizado! Sua conta está APROVADA e liberada.", "success");
    setActivePortal('CLIENTE');
  };

  const submitDriverRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Fields validation
    if (!newDriverData.nome || !newDriverData.cpf || !newDriverData.email || !newDriverData.senha || !newDriverData.placa) {
      setValidationError("Por favor, preencha todos os campos obrigatórios!");
      return;
    }

    // Vehicle Year validation (Obrigatório >= 2010!)
    if (Number(newDriverData.ano) < 2010) {
      setValidationError("Autorizado apenas veículos fabricados a partir do ano 2010!");
      return;
    }

    // Checking upload documents status
    if (!driverFileCnh || !driverFileAddress || !driverFileVFront) {
      setValidationError("Envie os documentos e as fotos do carro obrigatórias para aprovação!");
      return;
    }

    const newUserId = 'u-mot-' + Date.now() + '-' + Math.floor(Math.random() * 1000000);
    const newMotId = 'm-' + Date.now() + '-' + Math.floor(Math.random() * 1000000);

    const newUser: User = {
      id: newUserId,
      nome: newDriverData.nome,
      email: newDriverData.email,
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
        placa: newDriverData.placa.toUpperCase()
      },
      documentos: {
        cnhFrente: driverFileCnh || 'CNH_MOCK_URL',
        comprovanteEndereco: driverFileAddress || 'COMPROVANTE_MOCK_URL',
        veiculoFrente: driverFileVFront || 'CAR_FRONT_MOCK_URL',
        veiculoLateral: driverFileVLateral || 'CAR_LATERAL_MOCK_URL',
        veiculoTraseira: driverFileVTraseira || 'CAR_REAR_MOCK_URL'
      }
    };

    setUsers(prev => [newUser, ...prev]);
    setMotoristas(prev => [newMot, ...prev]);
    setActiveMotoristaId(newMotId);

    setRegistrationMode('NONE');
    addNotification("Cadastro de Motorista recebido! Aguardando aprovação dos documentos pelo administrador.", "info");
    setActivePortal('ADMIN'); // Switch immediately to admin so they can approve themselves to test!
  };

  // --- ADMIN PANEL FUNCTIONS ---
  const handleApproveDriverDocs = (motId: string, isApproved: boolean) => {
    setMotoristas(prev => prev.map(m => {
      if (m.id === motId) {
        return {
          ...m,
          documentoStatus: isApproved ? 'APROVADO' : 'REJEITADO'
        };
      }
      return m;
    }));

    // Update equivalent user status
    const targetMot = motoristas.find(m => m.id === motId);
    if (targetMot) {
      setUsers(prev => prev.map(u => {
        if (u.id === targetMot.userId) {
          return {
            ...u,
            status: isApproved ? 'AGUARDANDO_PAGAMENTO' : 'PENDENTE_APROVACAO'
          };
        }
        return u;
      }));
    }

    addNotification(
      isApproved 
        ? "Documentos aprovados! O motorista agora precisa efetuar o pagamento da mensalidade de ativação."
        : "Documentos reprovados e devolvidos.", 
      isApproved ? "success" : "warn"
    );
  };

  const handleToggleSubscriptionPaid = (motId: string) => {
    const targetMot = motoristas.find(m => m.id === motId);
    if (!targetMot) return;

    const newPaidStatus = !targetMot.isSubscriptionPaid;
    const driverName = users.find(u => u.id === targetMot.userId)?.nome || 'Motorista';

    setMotoristas(prev => prev.map(m => {
      if (m.id === motId) {
        return { ...m, isSubscriptionPaid: newPaidStatus };
      }
      return m;
    }));

    setUsers(prev => prev.map(u => {
      if (u.id === targetMot.userId) {
        let nextStatus = u.status;
        if (newPaidStatus) {
          if (targetMot.documentoStatus === 'APROVADO') {
            nextStatus = 'ATIVO';
          }
        } else {
          if (u.status === 'ATIVO') {
            nextStatus = 'AGUARDANDO_PAGAMENTO';
          }
        }
        return { ...u, status: nextStatus };
      }
      return u;
    }));

    addNotification(
      `Mensalidade do motorista ${driverName} alterada para ${newPaidStatus ? 'PAGA / ATIVO' : 'PENDENTE'}!`,
      newPaidStatus ? 'success' : 'warn'
    );
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

  // Process Mock PIX monthly Payment release
  const handleConfirmPixPayment = () => {
    setPixPaidSuccessfully(true);
    setTimeout(() => {
      setMotoristas(prev => prev.map(m => {
        if (m.id === checkoutMotoristaId) {
          return { ...m, isSubscriptionPaid: true };
        }
        return m;
      }));

      const targetMot = motoristas.find(m => m.id === checkoutMotoristaId);
      if (targetMot) {
        setUsers(prev => prev.map(u => {
          if (u.id === targetMot.userId) {
            return { ...u, status: 'ATIVO' as UserStatus };
          }
          return u;
        }));
      }

      setShowPixCheckout(false);
      setPixPaidSuccessfully(false);
      addNotification("Assinatura mensal ativada com sucesso pelo PIX! Você já pode aceitar corridas.", "success");
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
  const totalCompletedRides = corridas.filter(c => c.status === 'CONCLUIDA');
  const totalVolumeGross = totalCompletedRides.reduce((sum, item) => sum + item.valor, 0);
  const totalPlatformComission = totalVolumeGross * (config.comissaoPercentual / 100);

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
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-xl text-emerald-950 shadow-lg shadow-emerald-500/20 shrink-0">
            CC
          </div>
          <div>
            <h1 className="font-bold text-base leading-tight tracking-tight text-white">CARONA CASH</h1>
            {activePortal === 'ADMIN' ? (
              <p className="text-[10px] text-emerald-400 font-medium uppercase tracking-widest">Admin Master</p>
            ) : activePortal === 'CLIENTE' ? (
              <p className="text-[10px] text-emerald-400 font-medium uppercase tracking-widest">Central Cliente</p>
            ) : activePortal === 'MOTORISTA' ? (
              <p className="text-[10px] text-emerald-400 font-medium uppercase tracking-widest">Driver Portal</p>
            ) : (
              <p className="text-[10px] text-emerald-400 font-medium uppercase tracking-widest">SaaS Deployer</p>
            )}
          </div>
        </div>

        {/* Portal Switcher & Config links mimicking high density */}
        <nav className="mt-4 flex-grow space-y-1.5 px-4 text-xs font-semibold">
          <p className="text-[9px] text-emerald-500 font-bold uppercase tracking-wider px-3 mb-2">Simulação Multiperfil</p>
          
          <button
            onClick={() => { setActivePortal('CLIENTE'); setRegistrationMode('NONE'); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left hover:cursor-pointer ${
              activePortal === 'CLIENTE' 
                ? 'bg-emerald-800/60 text-emerald-300 border-l-4 border-emerald-500 font-bold' 
                : 'text-emerald-100 hover:bg-emerald-900/60'
            }`}
          >
            <UserIcon size={14} className="shrink-0 text-emerald-400" />
            <span>1. Central do Cliente</span>
          </button>

          <button
            onClick={() => { setActivePortal('MOTORISTA'); setRegistrationMode('NONE'); }}
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

          <button
            onClick={() => { setActivePortal('ADMIN'); setRegistrationMode('NONE'); }}
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

          <button
            onClick={() => { setActivePortal('CODE'); setRegistrationMode('NONE'); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left hover:cursor-pointer ${
              activePortal === 'CODE' 
                ? 'bg-emerald-800/60 text-emerald-300 border-l-4 border-emerald-500 font-bold' 
                : 'text-emerald-100 hover:bg-emerald-900/60'
            }`}
          >
            <FileText size={14} className="shrink-0 text-emerald-400" />
            <span>4. Configs Deploy SaaS</span>
          </button>
        </nav>

        {/* Server Status Indicators */}
        <div className="p-4 bg-emerald-900/40 m-4 rounded-xl border border-emerald-800/60 shrink-0">
          <p className="text-[10px] text-emerald-300 uppercase tracking-widest font-bold">Status do Servidor</p>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-2 h-2 bg-emerald-400 rounded-full status-pulse"></div>
            <span className="text-[10px] font-mono text-emerald-200">API: 24ms • DB: Online</span>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50 overflow-hidden" id="main-content-flow">
        
        {/* PREMIUM HIGH-DENSITY HEADER BAR */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sm:px-8 shrink-0 shadow-sm z-10">
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
                } else if (activePortal === 'ADMIN') {
                  return (
                    <>
                      <p className="text-xs font-semibold text-slate-800 leading-none">Carlos Oliveira</p>
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
            <div className="w-9 h-9 bg-slate-100 border border-slate-200 rounded-full overflow-hidden shrink-0 flex items-center justify-center">
              {(() => {
                let seed = "Carlos";
                if (activePortal === 'CLIENTE') seed = "Amanda";
                else if (activePortal === 'MOTORISTA') seed = "Roberto";
                return (
                  <img
                    referrerPolicy="no-referrer"
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`}
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                );
              })()}
            </div>
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
                    placeholder="Avenida Paulista, 1000 - Bela Vista"
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
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 text-xs font-bold">CC</div>
                  <span className="text-xs text-slate-500">Sua conta será ativada imediatamente após cadastro!</span>
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
                  <p className="text-[10px] text-zinc-500 mt-1">Carona Cash preza pelo prestígio dos usuários e requer verificação visual minuciosa.</p>
                  
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
              
              {/* Profile Card */}
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-700"></div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">CONTA EM USO</h3>
                
                <div className="flex items-center gap-3">
                  <img
                    src={users.find(u => u.id === (clientes.find(c => c.id === activeClienteId)?.userId))?.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'}
                    alt="avatar"
                    className="w-12 h-12 rounded-full object-cover border border-emerald-500"
                    id="client-avatar-img"
                  />
                  <div>
                    <h4 className="font-bold text-zinc-900" id="client-name">
                      {users.find(u => u.id === (clientes.find(c => c.id === activeClienteId)?.userId))?.nome || 'Passageiro'}
                    </h4>
                    <span className="text-[11px] text-zinc-500 font-medium">CPF: {clientes.find(c => c.id === activeClienteId)?.cpf}</span>
                    <span className="block text-[10px] text-emerald-700 font-semibold uppercase tracking-widest mt-0.5">Cliente Ativo</span>
                  </div>
                </div>

                {/* Simulated quick passenger switch */}
                <div className="mt-4 border-t border-gray-100 pt-3">
                  <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Trocar Passageiro:</label>
                  <select
                    value={activeClienteId}
                    onChange={(e) => {
                      setActiveClienteId(e.target.value);
                      setSelectedDestinationIndex(-1);
                      setCalculatedTrip(null);
                    }}
                    className="w-full text-xs p-1.5 rounded border border-gray-200 bg-white"
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

                <div className="mt-4 flex gap-1 items-center">
                  <button
                    onClick={() => setRegistrationMode('CLIENTE')}
                    className="text-xs text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 hover:underline hover:cursor-pointer"
                  >
                    <Plus size={14} /> Solicitar Novo Cadastro de Cliente
                  </button>
                </div>
              </div>

              {/* Ride Request Box */}
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative">
                <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <MapPin className="text-emerald-700" size={18} />
                  Solicitar Corrida Carona Cash
                </h3>

                <div className="space-y-4">
                  {/* Origin */}
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Partida atual (GPS)</label>
                    <div className="flex gap-2 mt-1">
                      <input
                        type="text"
                        value={clientOrigin}
                        onChange={(e) => setClientOrigin(e.target.value)}
                        placeholder="Origem"
                        className="w-full text-xs px-3 py-2 border rounded-lg bg-gray-50 text-slate-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Destination list selector */}
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Para onde vamos? (Destino)</label>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto">
                      {popularDestinations.map((dest, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedDestinationIndex(idx)}
                          className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all duration-150 flex items-start gap-2 hover:cursor-pointer ${
                            selectedDestinationIndex === idx
                              ? 'border-emerald-600 bg-emerald-50/50 text-emerald-950 font-medium'
                              : 'border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <MapPin size={14} className="mt-0.5 text-zinc-400 shrink-0" />
                          <div>
                            <div className="font-bold">{dest.nome.split('-')[0]}</div>
                            <span className="text-[10px] text-zinc-500">{dest.distance} Km (Est: {Math.round(dest.distance * 2.8)} min)</span>
                          </div>
                        </button>
                      ))}
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
                      {popularDestinations[selectedDestinationIndex]?.distance * config.precoKm + config.precoBase < 7.00 && (
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
                    <button
                      onClick={handleRequestRide}
                      disabled={selectedDestinationIndex < 0}
                      className="w-full bg-emerald-700 hover:bg-emerald-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-xl text-sm shadow transition hover:cursor-pointer"
                    >
                      Solicitar Corrida Cash 🚀
                    </button>
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
                        Trajeto: {currentActiveCorrida.origem.split(',')[0]} com destino a {currentActiveCorrida.destino.split(',')[0]}
                      </h3>
                      <div className="text-xs text-zinc-600 mt-1 flex items-center gap-3">
                        <span>Distância: <strong>{currentActiveCorrida.distancia} Km</strong></span>
                        <span>Preço: <strong className="text-emerald-700 font-extrabold text-sm">R$ {currentActiveCorrida.valor.toFixed(2)}</strong></span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleCancelRide(currentActiveCorrida.id)}
                      className="text-xs font-bold text-rose-600 border border-rose-200 hover:bg-rose-50 px-3 py-1.5 rounded-lg hover:cursor-pointer"
                    >
                      Cancelar Corrida
                    </button>
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

                  {/* Direct state skipper simulation widgets to make reviewing super simple */}
                  <div className="mt-3 p-3 bg-zinc-100 rounded-lg flex flex-wrap gap-2 items-center justify-center border text-xs">
                    <span className="font-bold text-zinc-600">Simulador de Movimento:</span>
                    {currentActiveCorrida.status === 'MOTORISTA_A_CAMINHO' && (
                      <button
                        onClick={() => handleStartTrip(currentActiveCorrida.id)}
                        className="bg-emerald-700 text-white px-3 py-1 rounded font-bold hover:cursor-pointer flex items-center gap-1 hover:bg-emerald-800"
                      >
                        Pasageiro Embarcou <ArrowRight size={12} />
                      </button>
                    )}
                    {currentActiveCorrida.status === 'EM_ANDAMENTO' && (
                      <button
                        onClick={() => handleFinishTrip(currentActiveCorrida.id)}
                        className="bg-emerald-700 text-white px-3 py-1 rounded font-bold hover:cursor-pointer flex items-center gap-1 hover:bg-emerald-800"
                      >
                        Chegar e Finalizar Corrida <Check size={12} />
                      </button>
                    )}
                    <span className="text-[10px] text-zinc-400 italic">O veículo se moverá na simulação do mapa abaixo!</span>
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
                origemCoords={currentActiveCorrida?.origemCoords}
                destinoCoords={currentActiveCorrida?.destinoCoords}
                origemNome={currentActiveCorrida?.origem.split(',')[0]}
                destinoNome={currentActiveCorrida?.destino.split(',')[0]}
                status={currentActiveCorrida?.status}
                onArrivedAtOrigin={() => {
                  if (currentActiveCorrida && currentActiveCorrida.status === 'MOTORISTA_A_CAMINHO') {
                    // Auto advance trip
                    handleStartTrip(currentActiveCorrida.id);
                  }
                }}
                onArrivedAtDestination={() => {
                  if (currentActiveCorrida && currentActiveCorrida.status === 'EM_ANDAMENTO') {
                    // Auto complete
                    handleFinishTrip(currentActiveCorrida.id);
                  }
                }}
              />

            </div>

          </div>
        )}

        {/* 2. PORTAL DO MOTORISTA */}
        {activePortal === 'MOTORISTA' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="driver-view-container">
            
            {/* Left Control Bar */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Driver Account info Card */}
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-zinc-900"></div>
                
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">MOTORISTA PARCEIRO</h3>
                
                {(() => {
                  const targetMot = motoristas.find(m => m.id === activeMotoristaId);
                  const userObj = users.find(u => u.id === targetMot?.userId);
                  if (!targetMot) return <p className="text-xs text-rose-500">Erro: Motorista não registrado</p>;

                  return (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={userObj?.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'}
                          alt="avatar"
                          className="w-12 h-12 rounded-full object-cover border border-emerald-600"
                        />
                        <div>
                          <h4 className="font-bold text-zinc-900">{userObj?.nome}</h4>
                          <span className="text-[10px] text-zinc-500 font-mono block">CNH: {targetMot.cpf}</span>
                          <span className="text-[10px] bg-zinc-800 text-white px-2 py-0.5 rounded font-mono font-medium inline-block mt-1">
                            {targetMot.veiculo.modelo} • {targetMot.veiculo.placa}
                          </span>
                        </div>
                      </div>

                      {/* STATS STATUS IN CONTEXT OF REQUIRED ACTIVATIONS AND REVENUE PAYMENT */}
                      <div className="border-t border-gray-100 pt-3 space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-zinc-500">Aprovação de Documentos:</span>
                          <span className={`font-bold ${
                            targetMot.documentoStatus === 'APROVADO' ? 'text-emerald-700' : targetMot.documentoStatus === 'PENDENTE' ? 'text-amber-600' : 'text-rose-600'
                          }`}>
                            {targetMot.documentoStatus === 'APROVADO' ? 'APROVADO' : targetMot.documentoStatus === 'PENDENTE' ? 'ANÁLISE PENDENTE' : 'RECURSO REJEITADO'}
                          </span>
                        </div>

                        <div className="flex justify-between text-xs">
                          <span className="text-zinc-500">Licença Mensal Status:</span>
                          <span className={`font-bold ${
                            targetMot.isSubscriptionPaid ? 'text-emerald-700' : 'text-rose-600'
                          }`}>
                            {targetMot.isSubscriptionPaid ? 'PAGO / ATIVO' : 'PAGAMENTO DA TAXA PENDENTE'}
                          </span>
                        </div>
                      </div>

                      {/* EXPLICIT LICENSE BILLING SYSTEM FOR ACTIVE REVENUE CHECKS */}
                      {!targetMot.isSubscriptionPaid && (
                        <div className="p-3.5 bg-rose-50 rounded-xl border border-rose-100 text-xs">
                          <div className="flex gap-2 text-rose-900 font-bold">
                            <ShieldAlert size={16} className="shrink-0 text-rose-600" />
                            <span>Pague para começar a dirigir!</span>
                          </div>
                          <p className="text-[11px] text-rose-700 mt-1">
                            Sua licença mensal do Carona Cash precisa ser ativada por Pix para liberar o recebimento de corridas locais.
                          </p>
                          <button
                            onClick={() => {
                              setCheckoutMotoristaId(targetMot.id);
                              setShowPixCheckout(true);
                            }}
                            className="mt-3 w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-1.5 px-3 rounded-lg text-xs"
                          >
                            Pagar Licença Mensal (R$ {config.taxaAtivacaoMotorista.toFixed(2)}) ⚡
                          </button>
                        </div>
                      )}

                      {/* Real shift toggle simulated */}
                      <div className="mt-3 border-t border-gray-100 pt-3 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700">Estado de Corrida:</span>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1 animate-pulse">
                          <span className="h-2 w-2 rounded-full bg-emerald-600"></span> Online
                        </span>
                      </div>

                      {/* Selection to change driver profile */}
                      <div className="mt-3 pt-2 border-t border-gray-100">
                        <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Mudar Motorista:</label>
                        <select
                          value={activeMotoristaId}
                          onChange={(e) => {
                            setActiveMotoristaId(e.target.value);
                            setShowPixCheckout(false);
                          }}
                          className="w-full text-xs p-1.5 rounded border border-gray-200 bg-white"
                        >
                          {motoristas.map(m => {
                            const userObj = users.find(u => u.id === m.userId);
                            return (
                              <option key={m.id} value={m.id}>
                                {userObj?.nome} ({userObj?.status})
                              </option>
                            );
                          })}
                        </select>
                      </div>

                      <div className="pt-2">
                        <button
                          onClick={() => setRegistrationMode('MOTORISTA')}
                          className="text-xs text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 hover:underline hover:cursor-pointer"
                        >
                          <PlusCircle size={14} /> Candidatar Novo Motorista
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>

            </div>

            {/* Simulated Shift Terminal Monitor / Driver Center on the right */}
            <div className="lg:col-span-8 space-y-6">
              
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
                  const pendingRides = corridas.filter(c => c.status === 'SOLICITADA');
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
                            <h4 className="font-extrabold text-slate-900 text-sm mt-1.5">
                              Passageiro: {activeSelfCorrida.clienteNome}
                            </h4>
                            <p className="text-xs text-slate-600 mt-1">Origem: <strong>{activeSelfCorrida.origem}</strong></p>
                            <p className="text-xs text-slate-600">Destino: <strong>{activeSelfCorrida.destino}</strong></p>
                            <p className="text-xs text-slate-600">Telefone para contato: <strong>{activeSelfCorrida.clienteTelefone}</strong></p>
                          </div>
                          
                          <div className="text-right">
                            <span className="text-[10px] text-zinc-500 uppercase block">VALOR PRESTADO</span>
                            <strong className="text-base font-extrabold text-emerald-700">R$ {activeSelfCorrida.valor.toFixed(2)}</strong>
                            <span className="text-[10px] text-zinc-400 block italic">Comissão: R$ {(activeSelfCorrida.valor * (config.comissaoPercentual/100)).toFixed(2)} ({config.comissaoPercentual}%)</span>
                          </div>
                        </div>

                        {/* Interactive flow button controls to simulate transport progression */}
                        <div className="bg-white p-3 rounded-lg border flex flex-wrap gap-2 items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-slate-700 block">Status: {activeSelfCorrida.status}</span>
                            <span className="text-[10px] text-slate-400">Acompanhamento simulado ativo no mapa do portal Cliente.</span>
                          </div>

                          <div className="flex gap-1">
                            {activeSelfCorrida.status === 'MOTORISTA_A_CAMINHO' && (
                              <button
                                onClick={() => handleStartTrip(activeSelfCorrida.id)}
                                className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-lg font-bold hover:cursor-pointer"
                              >
                                CONFIRMAR EMBARQUE PASSAGEIRO 🟢
                              </button>
                            )}

                            {activeSelfCorrida.status === 'EM_ANDAMENTO' && (
                              <button
                                onClick={() => handleFinishTrip(activeSelfCorrida.id)}
                                className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-lg font-bold hover:cursor-pointer"
                              >
                                FINALIZAR CORRIDA E RECEBER R$ 🏁
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  }

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
                      {pendingRides.map(corrida => (
                        <div key={corrida.id} className="p-4 border rounded-xl hover:shadow-md transition-shadow flex flex-col md:flex-row justify-between gap-4 bg-slate-50">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] bg-emerald-200 text-emerald-800 px-1.5 py-0.5 rounded font-bold font-mono uppercase tracking-wider">
                                NOVA CORRIDA DISPONÍVEL
                              </span>
                              <span className="text-[10px] text-zinc-500">ID: {corrida.id}</span>
                            </div>
                            <h4 className="font-bold text-zinc-900 text-xs">Passageiro: {corrida.clienteNome}</h4>
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
                      ))}
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
                        <span className="font-bold block text-slate-900">{item.destino.split(',')[0]}</span>
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
                  <p className="text-[9px] text-slate-400 font-medium mt-0.5">Taxa de intermediação ({config.comissaoPercentual}%)</p>
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

            {/* JANELA DE MOTORISTAS COM MENSALIDADE PENDENTE */}
            <div className="bg-white rounded-2xl border-2 border-amber-200 shadow-md p-5 hover:border-amber-300 transition-all" id="unpaid-license-pane animate-fade-in">
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
                    {isPendingPaymentsWindowOpen ? 'Ocultar Janela Financeira ✕' : 'Ver Todos c/ Mensalidade Pendente ➔'}
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            <div className="mt-4 flex gap-2 pt-3 border-t border-slate-100">
                              <button
                                onClick={() => handleToggleSubscriptionPaid(m.id)}
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold py-2 px-2.5 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                                title="Aprovar e ativar licença do motorista"
                              >
                                <Check size={12} />
                                Confirmar Pagto
                              </button>
                              
                              <button
                                onClick={() => {
                                  const textMsg = `Olá ${userObj?.nome || 'Motorista'}, identificamos que a mensalidade de R$ ${config.taxaAtivacaoMotorista.toFixed(2)} referente à sua licença do Carona Cash está pendente. Por favor, regularize para manter sua conta ativa! Chave Pix: pix@caronacash.com.br`;
                                  navigator.clipboard.writeText(textMsg);
                                  addNotification(`Mensagem de cobrança copiada! Envie para ${userObj?.telefone}`, 'success');
                                }}
                                className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] font-bold py-2 px-2 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                                title="Copiar mensagem para cobrar via WhatsApp"
                              >
                                Cobrar WhatsApp
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
                      <span className="text-zinc-600">Comissão de Viagem da Plataforma (%)</span>
                      <strong className="text-zinc-900">{config.comissaoPercentual}% por trip</strong>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="40"
                      step="1"
                      value={config.comissaoPercentual}
                      onChange={e => setConfig({...config, comissaoPercentual: Number(e.target.value)})}
                      className="w-full accent-emerald-700"
                    />
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg text-[11px] text-zinc-500 border">
                    * O reajuste tarifário é global e calculará a distância calculada das caronas de forma automática. 
                    <span className="block font-semibold text-rose-700 mt-1">Lembrando que o mínimo por corrida é sempre bloqueado em R$ 7,00!</span>
                  </div>
                </div>
              </div>

              {/* Supported Cities list manager */}
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4">
                  <Map size={18} className="text-emerald-700" />
                  Gerenciar Cidades Atendidas
                </h3>

                <form onSubmit={handleAddNewCity} className="flex gap-2 mb-4">
                  <input
                    type="text"
                    required
                    placeholder="Adicionar Nova Cidade"
                    value={newCityName}
                    onChange={e => setNewCityName(e.target.value)}
                    className="flex-grow p-2 text-xs rounded border bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <select
                    value={newCityState}
                    onChange={e => setNewCityState(e.target.value)}
                    className="p-2 text-xs rounded border bg-white focus:outline-none"
                  >
                    <option value="SP">SP</option>
                    <option value="RJ">RJ</option>
                    <option value="MG">MG</option>
                    <option value="PR">PR</option>
                    <option value="RS">RS</option>
                    <option value="CE">CE</option>
                  </select>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-700 text-white rounded text-xs font-bold hover:cursor-pointer hover:bg-emerald-800"
                  >
                    Adicionar
                  </button>
                </form>

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
                          className={`px-3 py-1 rounded text-[10px] font-bold ${
                            c.status === 'ATIVO' 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : 'bg-zinc-200 text-zinc-500'
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

            {/* MOTORISTAS APPROVAL & DOCUMENTS AUDIT LIST */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4">
                <UserCheck size={18} className="text-emerald-700" />
                Dono Carona Cash: Aprovação de Motoristas e Auditoria de Documentos
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
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* CLIENTS MANAGEMENT LIST */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
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
                        <p className="text-[11px] text-slate-600 mt-1">📌 {ct.origem.split(',')[0]} ➔ {ct.destino.split(',')[0]}</p>
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

          </div>
        )}

        {/* 4. EXPLANATIVE CODE & HOSTINGER GUIDE TAB */}
        {activePortal === 'CODE' && (
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6" id="code-instructions-tab">
            <div className="border-b pb-4">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="text-emerald-700" />
                Carona Cash • Arquitetura de Produção SaaS
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
                  <li>🟢 <strong>/database/schema.prisma</strong>: Modelagem de tabelas PostgreSQL completas (Users, Cliente, Motorista, Veiculo, Corridas, Pagamentos, Documentos)</li>
                  <li>🟢 <strong>/backend/index.js</strong>: Servidor Express API Rest integral estruturado, autenticação JWT, Multer uploads e Socket.IO real-time</li>
                  <li>🟢 <strong>/backend/package.json</strong>: Gerenciamento de dependências prontas de produção</li>
                  <li>🟢 <strong>/README_HOSTINGER.md</strong>: Guia passo a passo explicativo de instalação local e implantação no hPanel da Hostinger</li>
                </ul>

                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100/50">
                  <h4 className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                    <Sparkles size={14} className="text-emerald-700" />
                    Tecnologias do Sistema:
                  </h4>
                  <ul className="text-xs text-emerald-900 list-disc list-inside mt-1.5 space-y-1">
                    <li>Prisma ORM e driver pg para PostgreSQL</li>
                    <li>JWT com hash de senha seguro no cadastro</li>
                    <li>Sinal dinâmico de localização via Socket.IO</li>
                    <li>API de mapas encapsulada flexível (Google Maps / OpenStreetMap)</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-sm text-slate-800">🚀 RESUMO DAS OPERAÇÕES DO PROTÓTIPO</h3>
                <p className="text-xs text-slate-600">
                  Utilize a barra de controle de simulação superior para alternar facilmente entre os 3 papéis e testar a sincronização:
                </p>
                
                <div className="space-y-2 text-xs">
                  <div className="p-3 border rounded-lg bg-zinc-50">
                    <strong className="block text-emerald-800">1. Cadastro e Documentos de Motoristas:</strong>
                    Cadastre um motorista novo com ano superior a 2010. O motorista cairá em estado pendente. Vá ao painel Administrativo do Dono para aprovar os documentos.
                  </div>

                  <div className="p-3 border rounded-lg bg-zinc-50">
                    <strong className="block text-emerald-800">2. Taxa de Inscrição PIX:</strong>
                    Após os documentos serem aprovados pelo admin, o motorista precisa acessar o painel e realizar a transação Pix simulada integrada para ativar sua licença e liberar corridas.
                  </div>

                  <div className="p-3 border rounded-lg bg-zinc-50">
                    <strong className="block text-emerald-800">3. Solicitação GPS e rotas de R$ 7,00:</strong>
                    Escolha locais populares no painel do cliente e veja o preço adaptado com as regras do administrador (limite protetivo de R$ 7,00 mínimo respeitado). O motorista recebe notificações e o trajeto em tempo real é atualizado via simulação interativa com SVG no mapa!
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        </div> {/* CLOSE main-scrollable-canvas */}
      </div> {/* CLOSE main-content-flow */}

      {/* FOOTER */}
      <footer className="bg-zinc-900 py-6 text-xs text-center text-zinc-400 border-t border-zinc-800" id="carona-cash-footer">
        <div className="max-w-7xl mx-auto px-4">
          <p>© 2026 Carona Cash • Todos os direitos reservados. Preparado para escala de produção SaaS e hospedagem na Hostinger.</p>
          <p className="text-zinc-600 mt-1 font-mono">Plataforma desenvolvida com Node.js, Express, React, Tailwind CSS e Prisma PostgreSQL.</p>
        </div>
      </footer>

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
                    config.taxaAtivacaoMotorista.toFixed(2) + "5802BR5915CARONA_CASH_LTDA6009SAO_PAULO"
                  )}`}
                  alt="Pix QR Code"
                  className="w-36 h-36 object-contain"
                />
              </div>

              <div className="p-2 border rounded bg-slate-50 text-[10px] font-mono break-all text-slate-500 text-left relative group">
                <div className="font-bold text-slate-700 block text-[9px] mb-0.5 uppercase">Código Pix Copia e Cola:</div>
                pix-checkout-licenca-caronacash-4990-2026-prod-mercadopago-...
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

    </div>
  );
}
