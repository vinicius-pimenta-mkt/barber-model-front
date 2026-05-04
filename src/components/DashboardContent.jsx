import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, DollarSign, Clock, CheckCircle, User } from 'lucide-react';

const DashboardContent = ({ user }) => {
  // LÓGICA DE PERMISSÕES
  const isJhonatas = user?.role === 'jhonatas'; // Gabriel
  const isLucas = user?.role === 'lucas';       // Lucas
  const isAdmin = !isJhonatas && !isLucas;      // Fabrício / Admin

  const [barberOneName, setBarberOneName] = useState('Fabrício');
  const [barberTwoName, setBarberTwoName] = useState('Gabriel');
  const [barberThreeName, setBarberThreeName] = useState('Lucas');

  const [dashboardData, setDashboardData] = useState({
    atendimentosHoje: 0, receitaDia: 0, servicosRealizados: 0, pendentesFuturos: 0, agendamentos: [], agoraHora: "00:00"
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    fetchNomes();
    const interval = setInterval(fetchDashboardData, 300000);
    return () => clearInterval(interval);
  }, [user]); // Atualiza se o usuário mudar

  const fetchNomes = async () => {
    try {
      const [res1, res2, res3] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/configuracoes/barberOneName`),
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/configuracoes/barberTwoName`),
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/configuracoes/barberThreeName`)
      ]);
      if (res1.ok) setBarberOneName((await res1.json()).valor || 'Fabrício');
      if (res2.ok) {
        const data2 = await res2.json();
        setBarberTwoName(data2.valor === 'Jhonatas' ? 'Gabriel' : (data2.valor || 'Gabriel'));
      }
      if (res3.ok) setBarberThreeName((await res3.json()).valor || 'Lucas');
    } catch (err) { console.error(err); }
  };

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // DIRECIONAMENTO DE ROTA COM BASE NO USUÁRIO LOGADO
      let endpoint = 'relatorios'; // Padrão (Admin)
      if (isJhonatas) endpoint = 'relatorios-jhonatas';
      if (isLucas) endpoint = 'relatorios-lucas';

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/${endpoint}/dashboard`, { 
        headers: { 'Authorization': `Bearer ${token}` } 
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Garante que a propriedade "barber" exista para que as tabelas consigam filtrar corretamente
        if (data.agendamentos) {
          data.agendamentos = data.agendamentos.map(a => ({
            ...a,
            barber: a.barber || (isJhonatas ? 'Jhonatas' : isLucas ? 'Lucas' : 'Miguel')
          }));
        }
        
        setDashboardData(data);
      }
    } catch (error) { 
      console.error('Erro ao carregar dados:', error); 
    } finally { 
      setLoading(false); 
    }
  };

  const formatarHorario = (hora) => hora?.substring(0, 5) || "";
  const formatarData = (dataStr) => { if (!dataStr) return ""; const [, mes, dia] = dataStr.split('-'); return `${dia}/${mes}`; };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmado': return 'bg-green-950/50 text-green-400 border-green-900/50';
      case 'Pendente':   return 'bg-yellow-950/50 text-yellow-400 border-yellow-900/50';
      case 'Cancelado':  return 'bg-red-950/50 text-red-400 border-red-900/50';
      default:           return 'bg-neutral-800 text-neutral-400 border-neutral-700';
    }
  };

  const hojeStr = new Date().toISOString().split('T')[0];
  
  const agendamentosMiguel = dashboardData.agendamentos.filter(a => a.barber === 'Miguel' && a.status !== 'Bloqueado');
  const agendamentosJhonatas = dashboardData.agendamentos.filter(a => a.barber === 'Jhonatas' && a.status !== 'Bloqueado');
  const agendamentosLucas = dashboardData.agendamentos.filter(a => a.barber === 'Lucas' && a.status !== 'Bloqueado');

  const cards = [
    { title: 'Agendamentos', value: dashboardData.atendimentosHoje, icon: Users, color: 'text-[#DEAE60]', label: 'marcados para hoje' },
    { title: 'Receita do Dia', value: `R$ ${Number(dashboardData.receitaDia || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: DollarSign, color: 'text-green-500', label: 'faturamento confirmado' },
    { title: 'Realizados', value: dashboardData.servicosRealizados, icon: CheckCircle, color: 'text-blue-500', label: 'concluídos hoje' },
    { title: 'Pendentes', value: dashboardData.pendentesFuturos, icon: Clock, color: 'text-amber-500', label: 'próximas horas' },
  ];

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#DEAE60] mx-auto"></div></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pt-8 sm:pt-4">
      <div className="flex items-center space-x-4 mb-6">
        <img src="/logobranca.png" alt="Barbearia do Mineiro" className="h-18 w-auto drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" />
        <div>
          <h1 className="text-3xl font-bold text-white uppercase tracking-tighter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">Dashboard</h1>
          <p className="text-neutral-200 text-sm font-medium drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] mt-1">
            {isAdmin ? 'Gestão Geral' : `Gestão Pessoal - ${user?.username === 'gabriel' ? barberTwoName : barberThreeName}`} | {new Date().toLocaleDateString('pt-BR')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, idx) => (
          <Card key={idx} className="bg-neutral-900/60 border-neutral-800 backdrop-blur-md shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-[11px] font-semibold text-neutral-400 uppercase tracking-widest">{card.title}</CardTitle>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{card.value}</div>
              <p className="text-xs text-neutral-500 mt-1">{card.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* RENDERIZAÇÃO EMPILHADA (Oculta ou exibe as agendas de acordo com o usuário) */}
      <div className="flex flex-col gap-6">
        
        {/* CARD DO FABRÍCIO (Só aparece se for Admin) */}
        {isAdmin && (
          <Card className="bg-neutral-900/60 border-neutral-800 backdrop-blur-md shadow-xl overflow-hidden">
            <CardHeader className="border-b border-neutral-800 bg-neutral-900/40">
              <CardTitle className="flex items-center gap-2 text-lg text-white font-semibold uppercase tracking-tight">
                <User className="h-5 w-5 text-[#DEAE60]" /> Próximos: {barberOneName}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-neutral-800">
                {agendamentosMiguel.length > 0 ? agendamentosMiguel.map((a) => (
                  <div key={a.id} className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-neutral-950 text-[#DEAE60] rounded-full flex items-center justify-center font-bold border border-[#DEAE60]/30 shadow-inner">{a.cliente_nome?.charAt(0).toUpperCase()}</div>
                      <div><p className="font-semibold text-neutral-100">{a.cliente_nome}</p><p className="text-xs text-neutral-400">{a.servico}</p></div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <p className="font-bold text-white text-lg">{formatarHorario(a.hora)} <span className="text-[10px] text-neutral-500 ml-1 font-normal">({a.data === hojeStr ? 'Hoje' : formatarData(a.data)})</span></p>
                      <Badge variant="outline" className={`${getStatusColor(a.status)} text-[9px] mt-1 uppercase font-medium`}>{a.status}</Badge>
                    </div>
                  </div>
                )) : <div className="p-8 text-center text-neutral-500 text-sm italic">Nenhum agendamento para hoje.</div>}
              </div>
            </CardContent>
          </Card>
        )}

        {/* CARD DO GABRIEL (Aparece se for Admin OU se for o Gabriel logado) */}
        {(isAdmin || isJhonatas) && (
          <Card className="bg-neutral-900/60 border-neutral-800 backdrop-blur-md shadow-xl overflow-hidden">
            <CardHeader className="border-b border-neutral-800 bg-neutral-900/40">
              <CardTitle className="flex items-center gap-2 text-lg text-white font-semibold uppercase tracking-tight">
                <User className="h-5 w-5 text-neutral-400" /> Próximos: {barberTwoName}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-neutral-800">
                {agendamentosJhonatas.length > 0 ? agendamentosJhonatas.map((a) => (
                  <div key={a.id} className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-neutral-950 text-neutral-300 rounded-full flex items-center justify-center font-bold border border-neutral-700 shadow-inner">{a.cliente_nome?.charAt(0).toUpperCase()}</div>
                      <div><p className="font-semibold text-neutral-100">{a.cliente_nome}</p><p className="text-xs text-neutral-400">{a.servico}</p></div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <p className="font-bold text-white text-lg">{formatarHorario(a.hora)} <span className="text-[10px] text-neutral-500 ml-1 font-normal">({a.data === hojeStr ? 'Hoje' : formatarData(a.data)})</span></p>
                      <Badge variant="outline" className={`${getStatusColor(a.status)} text-[9px] mt-1 uppercase font-medium`}>{a.status}</Badge>
                    </div>
                  </div>
                )) : <div className="p-8 text-center text-neutral-500 text-sm italic">Nenhum agendamento para hoje.</div>}
              </div>
            </CardContent>
          </Card>
        )}

        {/* CARD DO LUCAS (Aparece se for Admin OU se for o Lucas logado) */}
        {(isAdmin || isLucas) && (
          <Card className="bg-neutral-900/60 border-neutral-800 backdrop-blur-md shadow-xl overflow-hidden">
            <CardHeader className="border-b border-neutral-800 bg-neutral-900/40">
              <CardTitle className="flex items-center gap-2 text-lg text-white font-semibold uppercase tracking-tight">
                <User className="h-5 w-5 text-neutral-400" /> Próximos: {barberThreeName}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-neutral-800">
                {agendamentosLucas.length > 0 ? agendamentosLucas.map((a) => (
                  <div key={a.id} className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-neutral-950 text-neutral-300 rounded-full flex items-center justify-center font-bold border border-neutral-700 shadow-inner">{a.cliente_nome?.charAt(0).toUpperCase()}</div>
                      <div><p className="font-semibold text-neutral-100">{a.cliente_nome}</p><p className="text-xs text-neutral-400">{a.servico}</p></div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <p className="font-bold text-white text-lg">{formatarHorario(a.hora)} <span className="text-[10px] text-neutral-500 ml-1 font-normal">({a.data === hojeStr ? 'Hoje' : formatarData(a.data)})</span></p>
                      <Badge variant="outline" className={`${getStatusColor(a.status)} text-[9px] mt-1 uppercase font-medium`}>{a.status}</Badge>
                    </div>
                  </div>
                )) : <div className="p-8 text-center text-neutral-500 text-sm italic">Nenhum agendamento para hoje.</div>}
              </div>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
};

export default DashboardContent;
