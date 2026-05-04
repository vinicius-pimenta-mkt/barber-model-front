import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend, Cell, PieChart, Pie
} from "recharts";
import {
  BarChart3, TrendingUp, Users, Download, Calendar, User, Scissors, CreditCard, DollarSign, Package 
} from "lucide-react";
import { format, subDays } from 'date-fns';

const Relatorios = ({ user }) => {
  const isJhonatas = user?.role === 'jhonatas';
  const isLucas = user?.role === 'lucas';
  const isAdmin = !isJhonatas && !isLucas;
  
  const [periodo, setPeriodo] = useState("mes");
  const [barber, setBarber] = useState(isAdmin ? "Geral" : isJhonatas ? "Jhonatas" : "Lucas");
  
  // DADOS DINÂMICOS DE NOMES
  const [barberOneName, setBarberOneName] = useState('Fabrício');
  const [barberTwoName, setBarberTwoName] = useState('Lucas');
  const [barberThreeName, setBarberThreeName] = useState('Gabriel');

  const [servicosMaisVendidos, setServicosMaisVendidos] = useState([]);
  const [receitaTempos, setReceitaTempos] = useState([]);
  const [frequenciaClientes, setFrequenciaClientes] = useState([]);
  const [agendamentosPeriodo, setAgendamentosPeriodo] = useState([]);
  const [byPayment, setByPayment] = useState([]);
  const [produtosVendidos, setProdutosVendidos] = useState([]);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
          setBarberTwoName(data2.valor === 'Jhonatas' ? 'Lucas' : (data2.valor || 'Lucas'));
        }
        if (res3.ok) setBarberThreeName((await res3.json()).valor || 'Gabriel');
      } catch (err) { console.error("Erro ao buscar nomes:", err); }
    };
    fetchNomes();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        let apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/relatorios/resumo`;
        let params = `?periodo=${periodo}&barber=${barber}`;

        const today = format(new Date(), 'yyyy-MM-dd');
        const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');

        if (periodo === 'hoje') {
          params = `?data_inicio=${today}&data_fim=${today}&barber=${barber}`;
        } else if (periodo === 'ontem') {
          params = `?data_inicio=${yesterday}&data_fim=${yesterday}&barber=${barber}`;
        }

        const response = await fetch(apiUrl + params, { headers: { "Authorization": `Bearer ${token}` } });

        if (response.ok) {
          const data = await response.json();
          setServicosMaisVendidos(Array.isArray(data.by_service) ? data.by_service : []);
          setReceitaTempos(Array.isArray(data.receita_detalhada) ? data.receita_detalhada : []);
          setAgendamentosPeriodo(Array.isArray(data.agendamentos) ? data.agendamentos : []);
          setByPayment(Array.isArray(data.by_payment) ? data.by_payment : []);
          setProdutosVendidos(Array.isArray(data.produtos_vendidos) ? data.produtos_vendidos : []);
          
          if (Array.isArray(data.top_clients)) {
            const clientesOrdenados = data.top_clients.map(c => ({ nome: c.name, visitas: c.visits, gasto: c.spent })).sort((a, b) => b.gasto - a.gasto);
            setFrequenciaClientes(clientesOrdenados);
          }
        }
      } catch (err) { console.error("Erro ao buscar relatórios:", err); } finally { setLoading(false); }
    };

    fetchData();
  }, [periodo, barber]);

  const exportarRelatorio = () => window.print();
  const COLORS = ['#DEAE60', '#4CAF50', '#2196F3', '#FF5722', '#9C27B0', '#00BCD4'];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-xl">
          <p className="font-bold text-gray-900 mb-1">{label || payload[0].payload.service || payload[0].payload.forma}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm flex items-center gap-2 font-medium" style={{ color: entry.color }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
              {entry.name}: {entry.name.includes('Receita') || entry.name.includes('Valor') || entry.name.includes('Gasto') ? `R$ ${entry.value.toLocaleString('pt-BR', {minimumFractionDigits: 2})}` : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderTabelaServicos = (barbeiroKey, nomeExibicao, data) => {
    const filtrados = data.filter(s => {
      if (barbeiroKey === 'Miguel') return s.miguel_qty > 0;
      if (barbeiroKey === 'Jhonatas') return s.jhonatas_qty > 0;
      if (barbeiroKey === 'Lucas') return s.lucas_qty > 0;
      return false;
    });

    const getQuantidade = (s) => {
      if (barbeiroKey === 'Miguel') return s.miguel_qty;
      if (barbeiroKey === 'Jhonatas') return s.jhonatas_qty;
      return s.lucas_qty;
    };
    
    return (
      <div className="space-y-3">
        <h3 className={`font-bold text-sm flex items-center gap-2 p-2.5 rounded-lg ${barbeiroKey === 'Miguel' ? 'bg-[#DEAE60]/10 text-yellow-800' : barbeiroKey === 'Jhonatas' ? 'bg-green-50 text-green-800' : 'bg-blue-50 text-blue-800'}`}>
          <User className="h-4 w-4" /> {nomeExibicao}
        </h3>
        <div className="space-y-2">
          {filtrados.length > 0 ? filtrados.map((s, i) => (
            <div key={i} className="flex items-center justify-between p-3 border border-gray-100 bg-white/50 rounded-lg hover:bg-gray-50 transition-colors">
              <div>
                <h4 className="font-bold text-sm text-gray-800">{s.service}</h4>
                <p className="text-[10px] text-gray-500 font-medium uppercase tracking-widest mt-0.5">Quantidade: {getQuantidade(s)}</p>
              </div>
              <div className="text-right">
                <span className="font-bold text-base text-gray-900">{getQuantidade(s)}</span>
              </div>
            </div>
          )) : <p className="text-center text-gray-400 py-4 text-sm italic">Sem serviços</p>}
        </div>
      </div>
    );
  };

  const totalReceita = byPayment.reduce((acc, curr) => acc + curr.valor, 0);
  const totalProdutos = produtosVendidos.reduce((acc, p) => acc + p.revenue, 0);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#DEAE60]"></div></div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pt-8 sm:pt-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2">
        <div><h1 className="text-3xl font-bold text-white uppercase tracking-tighter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">Relatórios Profissionais</h1><p className="text-neutral-200 font-medium drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] mt-1">Análise detalhada de performance e faturamento</p></div>
        <Button onClick={exportarRelatorio} className="w-full sm:w-auto bg-neutral-900/60 backdrop-blur-md border border-neutral-700 text-white hover:bg-neutral-800 font-bold shadow-lg shadow-black/20 no-print"><Download className="h-4 w-4 mr-2 text-[#DEAE60]" /> Exportar PDF</Button>
      </div>

      <div className={`grid grid-cols-1 ${isAdmin ? 'md:grid-cols-2' : ''} gap-4 no-print`}>
        <Card className="bg-white/90 backdrop-blur-md border-white/40 shadow-lg">
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-3 bg-[#DEAE60]/10 rounded-full"><Calendar className="h-5 w-5 text-[#DEAE60]" /></div>
            <div className="flex-1"><label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Período Selecionado</label>
              <Select value={periodo} onValueChange={setPeriodo}>
                <SelectTrigger className="border-none shadow-none p-0 h-auto font-bold text-gray-900 text-lg focus:ring-0 bg-transparent"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-white border-gray-200 text-gray-900"><SelectItem value="hoje">Hoje</SelectItem><SelectItem value="ontem">Ontem</SelectItem><SelectItem value="semana">Última Semana</SelectItem><SelectItem value="mes">Último Mês</SelectItem><SelectItem value="ano">Último Ano</SelectItem></SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
        {isAdmin && (
          <Card className="bg-white/90 backdrop-blur-md border-white/40 shadow-lg">
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="p-3 bg-[#DEAE60]/10 rounded-full"><User className="h-5 w-5 text-[#DEAE60]" /></div>
              <div className="flex-1"><label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Filtrar Barbeiro</label>
                <Select value={barber} onValueChange={setBarber}>
                  <SelectTrigger className="border-none shadow-none p-0 h-auto font-bold text-gray-900 text-lg focus:ring-0 bg-transparent"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-white border-gray-200 text-gray-900">
                    <SelectItem value="Geral">Geral (Todos)</SelectItem>
                    <SelectItem value="Miguel">{barberOneName}</SelectItem>
                    <SelectItem value="Jhonatas">{barberTwoName}</SelectItem>
                    <SelectItem value="Lucas">{barberThreeName}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Tabs defaultValue="receita" className="space-y-6">
        <TabsList className="bg-white/80 backdrop-blur-md p-1 rounded-xl shadow-lg border border-white/20 no-print">
          <TabsTrigger value="servicos" className="rounded-lg data-[state=active]:bg-[#DEAE60] data-[state=active]:text-neutral-950 font-bold data-[state=active]:shadow-sm">Serviços</TabsTrigger>
          <TabsTrigger value="receita" className="rounded-lg data-[state=active]:bg-[#DEAE60] data-[state=active]:text-neutral-950 font-bold data-[state=active]:shadow-sm">Faturamento</TabsTrigger>
          <TabsTrigger value="clientes" className="rounded-lg data-[state=active]:bg-[#DEAE60] data-[state=active]:text-neutral-950 font-bold data-[state=active]:shadow-sm">Clientes</TabsTrigger>
        </TabsList>

        <TabsContent value="servicos" className="space-y-6">
          <Card className="bg-white/90 backdrop-blur-md border-white/40 shadow-xl">
            <CardHeader className="border-b border-gray-200/50 bg-white/50"><CardTitle className="text-lg font-bold uppercase tracking-tight text-gray-900 flex items-center gap-2"><BarChart3 className="h-5 w-5 text-[#DEAE60]" /> Desempenho por Serviço</CardTitle></CardHeader>
            <CardContent className="pt-6">
              {servicosMaisVendidos.length > 0 ? (
                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={servicosMaisVendidos} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis dataKey="service" tick={{ fontSize: 10, fill: '#4b5563', fontWeight: 600 }} axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#4b5563', fontWeight: 600 }} />
                      <Tooltip content={<CustomTooltip />} cursor={{fill: '#f3f4f6'}} />
                      <Legend iconType="circle" wrapperStyle={{paddingTop: '20px'}} />
                      
                      {(barber === 'Geral' || barber === 'Miguel') && <Bar name={barberOneName} dataKey="miguel_qty" fill="#DEAE60" radius={[4, 4, 0, 0]} barSize={barber === 'Geral' ? 20 : 50} />}
                      {(barber === 'Geral' || barber === 'Jhonatas') && <Bar name={barberTwoName} dataKey="jhonatas_qty" fill="#4CAF50" radius={[4, 4, 0, 0]} barSize={barber === 'Geral' ? 20 : 50} />}
                      {(barber === 'Geral' || barber === 'Lucas') && <Bar name={barberThreeName} dataKey="lucas_qty" fill="#2196F3" radius={[4, 4, 0, 0]} barSize={barber === 'Geral' ? 20 : 50} />}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : <div className="h-[350px] flex flex-col items-center justify-center text-gray-400 bg-gray-50/50 rounded-xl m-4 border border-dashed border-gray-200"><Scissors className="h-12 w-12 mb-2 text-gray-300" /><p className="font-medium">Sem dados para exibir o gráfico</p></div>}
            </CardContent>
          </Card>
          
          <Card className="bg-white/90 backdrop-blur-md border-white/40 shadow-xl">
            <CardHeader className="border-b border-gray-200/50 bg-white/50"><CardTitle className="text-lg font-bold uppercase tracking-tight text-gray-900">Detalhamento Numérico</CardTitle></CardHeader>
            <CardContent className="pt-6">
              <div className={`grid grid-cols-1 ${barber === 'Geral' ? 'lg:grid-cols-3' : 'md:grid-cols-2'} gap-8`}>
                {(barber === 'Geral' || barber === 'Miguel') && renderTabelaServicos('Miguel', barberOneName, servicosMaisVendidos)}
                {(barber === 'Geral' || barber === 'Jhonatas') && renderTabelaServicos('Jhonatas', barberTwoName, servicosMaisVendidos)}
                {(barber === 'Geral' || barber === 'Lucas') && renderTabelaServicos('Lucas', barberThreeName, servicosMaisVendidos)}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="receita" className="space-y-6">
          <Card className="bg-white/90 backdrop-blur-md border-white/40 shadow-xl">
            <CardHeader className="border-b border-gray-200/50 bg-white/50"><CardTitle className="flex items-center gap-2 text-lg font-bold uppercase tracking-tight text-gray-900"><TrendingUp className="h-5 w-5 text-green-600" /> Evolução de Faturamento {(periodo === 'hoje' || periodo === 'ontem') ? '(Por Hora)' : ''}</CardTitle></CardHeader>
            <CardContent className="pt-6">
              {receitaTempos.length > 0 ? (
                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={receitaTempos} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis dataKey="periodo" tick={{ fontSize: 11, fill: '#4b5563', fontWeight: 600 }} axisLine={false} tickLine={false} tickFormatter={(val) => { if (!val) return ''; const strVal = String(val); if (strVal.includes('h')) return strVal; if (strVal.includes('-')) { const parts = strVal.split('-'); if (parts.length === 3) return `${parts[2]}/${parts[1]}`; } return strVal; }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#4b5563', fontWeight: 600 }} tickFormatter={(val) => `R$${val}`} />
                      <Tooltip labelFormatter={(label) => { if (!label) return ''; const strLabel = String(label); if (strLabel.includes('h')) return `Horário: ${strLabel}`; if (strLabel.includes('-')) { const parts = strLabel.split('-'); if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`; } return strLabel; }} formatter={(value) => [`R$ ${value.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`, 'Receita']} contentStyle={{borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                      <Line type="monotone" dataKey="valor" stroke="#10b981" strokeWidth={4} dot={{ r: 5, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8, strokeWidth: 0, fill: '#059669' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : <div className="h-[350px] flex flex-col items-center justify-center text-gray-400 bg-gray-50/50 rounded-xl m-4 border border-dashed border-gray-200"><p className="font-medium italic">Nenhum faturamento registrado no período selecionado.</p></div>}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white/90 backdrop-blur-md border-white/40 shadow-xl">
              <CardHeader className="border-b border-gray-200/50 bg-white/50"><CardTitle className="text-lg font-bold uppercase tracking-tight text-gray-900">Resumo Financeiro (Serviços)</CardTitle></CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {byPayment.map((p, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-white border border-gray-100 shadow-sm rounded-xl"><div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full shadow-inner" style={{backgroundColor: COLORS[i % COLORS.length]}}></div><span className="text-sm font-bold text-gray-700">{p.forma}</span></div><div className="text-right"><p className="font-bold text-sm text-gray-900">R$ {p.valor.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>{p.quantidade > 0 && <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mt-0.5">{p.quantidade} serviços</p>}</div></div>
                  ))}
                  <div className="pt-4 mt-2 border-t border-dashed border-gray-300 space-y-3">
                    <div className="flex items-center justify-between p-4 bg-[#DEAE60]/10 rounded-xl border border-[#DEAE60]/30 shadow-inner"><div className="flex items-center gap-3"><div className="bg-[#DEAE60]/20 p-1.5 rounded"><DollarSign className="h-5 w-5 text-[#DEAE60]" /></div><span className="text-xs font-bold text-yellow-900 uppercase tracking-widest">TOTAL BRUTO (SERVIÇOS)</span></div><div className="text-right"><p className="font-bold text-xl text-yellow-700">R$ {totalReceita.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p></div></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-md border-white/40 shadow-xl">
              <CardHeader className="border-b border-gray-200/50 bg-white/50"><CardTitle className="flex items-center gap-2 text-lg font-bold uppercase tracking-tight text-gray-900"><CreditCard className="h-5 w-5 text-[#DEAE60]" /> Distribuição Pagamentos</CardTitle></CardHeader>
              <CardContent className="pt-6">
                {byPayment.length > 0 ? (
                  <div className="h-[300px] w-full"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={byPayment} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="valor" nameKey="forma" stroke="none">{byPayment.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}</Pie><Tooltip formatter={(v) => `R$ ${v.toLocaleString('pt-BR')}`} contentStyle={{borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} /><Legend iconType="circle" /></PieChart></ResponsiveContainer></div>
                ) : <div className="h-[300px] flex items-center justify-center bg-gray-50/50 rounded-xl border border-dashed border-gray-200"><p className="text-center text-gray-400 font-medium italic">Sem dados de pagamento.</p></div>}
              </CardContent>
            </Card>
          </div>

          <Card className="bg-white/90 backdrop-blur-md border-white/40 shadow-xl mt-6">
            <CardHeader className="border-b border-[#DEAE60]/20 bg-[#DEAE60]/5"><CardTitle className="text-lg font-bold uppercase tracking-tight text-gray-900 flex items-center gap-2"><Package className="h-5 w-5 text-[#DEAE60]" /> Vendas de Produtos</CardTitle></CardHeader>
            <CardContent className="p-0">
              {produtosVendidos.length > 0 ? (
                <div className="overflow-x-auto"><table className="w-full text-sm text-left"><thead className="bg-gray-50/50 text-gray-500 uppercase text-[10px] sm:text-xs"><tr><th className="px-6 py-4 font-bold tracking-widest">Produto</th><th className="px-6 py-4 font-bold tracking-widest text-center">Pagamento</th><th className="px-6 py-4 font-bold tracking-widest text-center">Und. Vendidas</th><th className="px-6 py-4 font-bold tracking-widest text-right">Receita Gerada</th></tr></thead><tbody className="divide-y divide-gray-100">{produtosVendidos.map((p, i) => <tr key={i} className="hover:bg-white transition-colors bg-white/40"><td className="px-6 py-4 font-bold text-gray-900">{p.produto}</td><td className="px-6 py-4 text-center"><Badge variant="secondary" className="bg-gray-100 text-gray-600 font-medium border-gray-200">{p.forma_pagamento}</Badge></td><td className="px-6 py-4 text-center"><Badge variant="outline" className="bg-white shadow-sm font-bold">{p.qty}</Badge></td><td className="px-6 py-4 text-right font-bold text-green-600 text-base whitespace-nowrap">R$ {p.revenue.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td></tr>)}</tbody><tfoot className="bg-[#DEAE60]/10 border-t-2 border-[#DEAE60]/30"><tr><td colSpan="3" className="px-6 py-5 text-right font-bold text-yellow-900 uppercase tracking-widest text-xs">TOTAL EM PRODUTOS:</td><td className="px-6 py-5 text-right font-bold text-yellow-700 text-xl whitespace-nowrap">R$ {totalProdutos.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td></tr></tfoot></table></div>
              ) : <p className="text-center text-gray-500 font-medium py-10">Nenhum produto foi vendido neste período.</p>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clientes" className="space-y-6">
          <Card className="bg-white/90 backdrop-blur-md border-white/40 shadow-xl">
            <CardHeader className="border-b border-gray-200/50 bg-white/50"><CardTitle className="flex items-center gap-2 text-lg font-bold uppercase tracking-tight text-gray-900"><Users className="h-5 w-5 text-[#DEAE60]" /> Ranking: Top 10 Clientes</CardTitle></CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {frequenciaClientes.map((c, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"><div className="flex items-center gap-4"><div className={`h-12 w-12 rounded-full flex items-center justify-center font-bold text-lg shadow-inner ${i < 3 ? 'bg-[#DEAE60] text-neutral-950 shadow-black/20' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}>{i + 1}º</div><div><h4 className="font-bold text-gray-900 text-lg">{c.nome}</h4><p className="text-xs text-gray-500 font-medium uppercase tracking-widest mt-0.5">{c.visitas} visitas no período</p></div></div><div className="text-right"><p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Total Gasto</p><p className="text-xl font-bold text-gray-900 whitespace-nowrap">R$ {c.gasto.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p></div></div>
                ))}
                {frequenciaClientes.length === 0 && <div className="text-center py-12 text-gray-500 font-medium bg-gray-50/50 rounded-xl border border-dashed border-gray-200">Nenhum cliente registrado no período selecionado.</div>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Relatorios;
