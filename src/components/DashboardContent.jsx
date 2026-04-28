import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  Clock,
  CheckCircle,
  User
} from 'lucide-react';

const DashboardContent = () => {
  const [dashboardData, setDashboardData] = useState({
    atendimentosHoje: 0,
    receitaDia: 0,
    servicosRealizados: 0,
    pendentesFuturos: 0,
    agendamentos: [],
    agoraHora: "00:00"
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 300000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/relatorios/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        setDashboardData(await response.json());
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatarHorario = (hora) => hora?.substring(0, 5) || "";
  
  const formatarData = (dataStr) => {
    if (!dataStr) return "";
    const [ano, mes, dia] = dataStr.split('-');
    return `${dia}/${mes}`;
  };

  // Cores adaptadas para o Modo Escuro (Dark Mode)
  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmado': return 'bg-green-950/50 text-green-400 border-green-900/50';
      case 'Pendente':   return 'bg-yellow-950/50 text-yellow-400 border-yellow-900/50';
      case 'Cancelado':  return 'bg-red-950/50 text-red-400 border-red-900/50';
      default:           return 'bg-neutral-800 text-neutral-400 border-neutral-700';
    }
  };

  const hoje = new Date();
  const hojeStr = hoje.getFullYear() + '-' + String(hoje.getMonth() + 1).padStart(2, '0') + '-' + String(hoje.getDate()).padStart(2, '0');

  // Filtros de barbeiros separados (como no seu original)
  const agendamentosMiguel = dashboardData.agendamentos.filter(a => a.barber === 'Miguel' && a.status !== 'Bloqueado');
  const agendamentosJhonatas = dashboardData.agendamentos.filter(a => a.barber === 'Jhonatas' && a.status !== 'Bloqueado');

  // Otimização dos Cards Superiores
  const cards = [
    { title: 'Total de Agendamentos', value: dashboardData.atendimentosHoje, icon: Users, color: 'text-amber-500', label: 'marcados para hoje' },
    { title: 'Receita do Dia', value: `R$ ${Number(dashboardData.receitaDia || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: DollarSign, color: 'text-green-500', label: 'faturamento confirmado' },
    { title: 'Serviços Realizados', value: dashboardData.servicosRealizados, icon: CheckCircle, color: 'text-blue-500', label: 'concluídos hoje' },
    { title: 'Pendentes', value: dashboardData.pendentesFuturos, icon: Clock, color: 'text-purple-500', label: 'próximas horas' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-neutral-400 font-medium tracking-wide">Carregando painel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* CABEÇALHO */}
      <div className="flex items-center space-x-4">
        {/* Puxando a logo branca do public */}
        <img src="/logobranca.png" alt="Miguel Alves Barbearia" className="h-12 w-auto" />
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Dashboard</h1>
          <p className="text-neutral-400 text-sm">Gestão em tempo real - {new Date().toLocaleDateString('pt-BR')}</p>
        </div>
      </div>

      {/* GRID DE CARDS PRINCIPAIS (Renderizados via .map) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, idx) => (
          <Card key={idx} className="bg-neutral-900/60 border-neutral-800 backdrop-blur-md shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">{card.title}</CardTitle>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-white">{card.value}</div>
              <p className="text-xs text-neutral-500 mt-1">{card.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* FILAS SEPARADAS: MIGUEL E JHONATAS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* COLUNA MIGUEL */}
        <Card className="bg-neutral-900/60 border-neutral-800 backdrop-blur-md shadow-xl overflow-hidden">
          <CardHeader className="border-b border-neutral-800 bg-neutral-900/40">
            <CardTitle className="flex items-center gap-2 text-lg text-white font-bold uppercase tracking-tight">
              <User className="h-5 w-5 text-purple-500" />
              Próximos: Miguel
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-neutral-800">
              {agendamentosMiguel.length > 0 ? (
                agendamentosMiguel.map((a) => (
                  <div key={a.id} className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-neutral-800 text-purple-400 rounded-full flex items-center justify-center font-black border border-neutral-700">
                        {a.cliente_nome?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-neutral-100">{a.cliente_nome}</p>
                        <p className="text-xs text-neutral-400">{a.servico}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-white text-lg">
                        {formatarHorario(a.hora)} 
                        <span className="text-[10px] text-neutral-500 ml-1 font-normal">
                          ({a.data === hojeStr ? 'Hoje' : formatarData(a.data)})
                        </span>
                      </p>
                      <Badge variant="outline" className={`${getStatusColor(a.status)} text-[9px] mt-1 uppercase`}>
                        {a.status}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-neutral-500 text-sm italic">Nenhum agendamento futuro nas próximas 24h.</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* COLUNA JHONATAS */}
        <Card className="bg-neutral-900/60 border-neutral-800 backdrop-blur-md shadow-xl overflow-hidden">
          <CardHeader className="border-b border-neutral-800 bg-neutral-900/40">
            <CardTitle className="flex items-center gap-2 text-lg text-white font-bold uppercase tracking-tight">
              <User className="h-5 w-5 text-amber-500" />
              Próximos: Jhonatas
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-neutral-800">
