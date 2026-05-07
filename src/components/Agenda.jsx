import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Plus, Edit, Trash2, Clock, CheckCircle, AlertCircle, CalendarDays, User, Phone, Lock, Settings } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Agenda = ({ user }) => {
  // LÓGICA DE PERMISSÕES
  const isJhonatas = user?.role === 'jhonatas'; // Gabriel
  const isLucas = user?.role === 'lucas';       // Lucas
  const isAdmin = !isJhonatas && !isLucas;      // Fabrício

  // --- DADOS DINÂMICOS DO BACKEND ---
  const [barberOneName, setBarberOneName] = useState('Carregando...');
  const [barberTwoName, setBarberTwoName] = useState('Carregando...');
  const [barberThreeName, setBarberThreeName] = useState('Carregando...');
  
  // Controle do Modal de Edição de Nome
  const [nameDialogOpen, setNameDialogOpen] = useState(false);
  const [targetBarber, setTargetBarber] = useState('barberTwoName'); 
  const [tempName, setTempName] = useState('');

  const [servicosDb, setServicosDb] = useState([]);
  const [agendamentos, setAgendamentos] = useState([]);
  const [clientes, setClientes] = useState([]); 
  const [filteredClientes, setFilteredClientes] = useState([]); 
  const [showSuggestions, setShowSuggestions] = useState(false); 
  
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [editingAgendamento, setEditingAgendamento] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);
  
  // Internamente o "barber" continua sendo Miguel, Jhonatas ou Lucas para conversar com o banco
  const [formData, setFormData] = useState({
    cliente_nome: '', cliente_telefone: '', servico: '', data: format(new Date(), 'yyyy-MM-dd'),
    hora: '', status: 'Pendente', preco: '', forma_pagamento: 'Dinheiro', observacoes: '', 
    barber: isJhonatas ? 'Jhonatas' : isLucas ? 'Lucas' : 'Miguel',
    data_aniversario: '' // <-- CAMPO ADICIONADO AQUI
  });

  const [blockData, setBlockData] = useState({
    barber: isJhonatas ? 'Jhonatas' : isLucas ? 'Lucas' : 'Todos', 
    data_inicio: format(new Date(), 'yyyy-MM-dd'), data_fim: format(new Date(), 'yyyy-MM-dd'), hora_inicio: '12:00', hora_fim: '14:00', intervalo: '30'
  });

  const formasPagamento = ['Pix', 'Dinheiro', 'Cartão de Débito', 'Cartão de Crédito'];

  useEffect(() => {
    fetchDadosIniciais();
  }, []);

  const fetchDadosIniciais = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      // Busca Nome Barbeiro 1 (Fabrício)
      const resNome1 = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/configuracoes/barberOneName`);
      if (resNome1.ok) {
        const dataNome1 = await resNome1.json();
        setBarberOneName(dataNome1.valor || 'Fabrício');
        localStorage.setItem('barberOneName', dataNome1.valor || 'Fabrício');
      }

      // Busca Nome Barbeiro 2 (Gabriel / antigo Jhonatas)
      const resNome2 = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/configuracoes/barberTwoName`);
      if (resNome2.ok) {
        const dataNome2 = await resNome2.json();
        const nomeSalvo = dataNome2.valor;
        // Trava para forçar o nome Gabriel se vier vazio ou Jhonatas
        const nomeFinal2 = (nomeSalvo === 'Jhonatas' || !nomeSalvo) ? 'Gabriel' : nomeSalvo;
        setBarberTwoName(nomeFinal2);
        setTempName(nomeFinal2);
        localStorage.setItem('barberTwoName', nomeFinal2);
      }

      // Busca Nome Barbeiro 3 (Lucas)
      const resNome3 = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/configuracoes/barberThreeName`);
      if (resNome3.ok) {
        const dataNome3 = await resNome3.json();
        const nomeFinal3 = dataNome3.valor || 'Lucas';
        setBarberThreeName(nomeFinal3);
        localStorage.setItem('barberThreeName', nomeFinal3);
      }

      // Busca Serviços e Clientes
      const resServicos = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/servicos`, { headers });
      if (resServicos.ok) setServicosDb(await resServicos.json());

      const resClientes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/clientes`, { headers });
      if (resClientes.ok) setClientes(await resClientes.json());

      // Busca Agendamentos com base na Permissão
      const requests = [];
      if (isAdmin) {
        requests.push(fetch(`${import.meta.env.VITE_API_BASE_URL}/api/agendamentos`, { headers }).then(res => res.ok ? res.json() : []).then(data => data.map(a => ({ ...a, barber: 'Miguel' }))));
        requests.push(fetch(`${import.meta.env.VITE_API_BASE_URL}/api/agendamentos-jhonatas`, { headers }).then(res => res.ok ? res.json() : []).then(data => data.map(a => ({ ...a, barber: 'Jhonatas' }))));
        requests.push(fetch(`${import.meta.env.VITE_API_BASE_URL}/api/agendamentos-lucas`, { headers }).then(res => res.ok ? res.json() : []).then(data => data.map(a => ({ ...a, barber: 'Lucas' }))));
      } else if (isJhonatas) {
        requests.push(fetch(`${import.meta.env.VITE_API_BASE_URL}/api/agendamentos-jhonatas`, { headers }).then(res => res.ok ? res.json() : []).then(data => data.map(a => ({ ...a, barber: 'Jhonatas' }))));
      } else if (isLucas) {
        requests.push(fetch(`${import.meta.env.VITE_API_BASE_URL}/api/agendamentos-lucas`, { headers }).then(res => res.ok ? res.json() : []).then(data => data.map(a => ({ ...a, barber: 'Lucas' }))));
      }
      
      const results = await Promise.all(requests);
      setAgendamentos(results.flat());

    } catch (error) { 
      console.error('Erro geral:', error); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleSaveName = async () => {
    if (tempName.trim() === '') return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/configuracoes/${targetBarber}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ valor: tempName.trim() })
      });
      if (res.ok) {
        if (targetBarber === 'barberOneName') setBarberOneName(tempName.trim());
        if (targetBarber === 'barberTwoName') setBarberTwoName(tempName.trim());
        if (targetBarber === 'barberThreeName') setBarberThreeName(tempName.trim());
        
        localStorage.setItem(targetBarber, tempName.trim());
        setNameDialogOpen(false);
        window.location.reload(); 
      }
    } catch (error) { console.error("Erro ao salvar nome", error); }
  };

  const handleNameChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, cliente_nome: value });
    if (value.length > 0) {
      const limparTexto = (str) => str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim() : "";
      const termoBusca = limparTexto(value);
      const filtered = clientes.filter(c => limparTexto(c.nome).includes(termoBusca) || (value.replace(/\D/g, '').length > 0 && (c.telefone ? c.telefone.replace(/\D/g, '') : '').includes(value.replace(/\D/g, ''))));
      setFilteredClientes(filtered); 
      setShowSuggestions(true);
    } else { 
      setShowSuggestions(false); 
    }
  };

  const handleSelectClient = (cliente) => { 
    setFormData({ ...formData, cliente_nome: cliente.nome, cliente_telefone: cliente.telefone || '', data_aniversario: cliente.data_aniversario || '' }); 
    setShowSuggestions(false); 
  };

  const handleServicoChange = (value) => {
    const servicoSelecionado = servicosDb.find(s => s.nome === value);
    const precoFormatado = servicoSelecionado ? (servicoSelecionado.preco / 100).toLocaleString('pt-BR', {minimumFractionDigits: 2}) : '0,00';
    setFormData({ ...formData, servico: value, preco: precoFormatado });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const [ano, mes, dia] = formData.data.split('-');
    if (new Date(ano, mes - 1, dia).getDay() < 2 && formData.status !== 'Bloqueado') {
      return alert('A barbearia é fechada aos Domingos e Segundas-feiras.');
    }
    
    try {
      const token = localStorage.getItem('token');
      
      // Direcionamento Inteligente da Rota
      let baseUrl = `${import.meta.env.VITE_API_BASE_URL}/api/agendamentos`;
      if (formData.barber === 'Jhonatas') baseUrl = `${import.meta.env.VITE_API_BASE_URL}/api/agendamentos-jhonatas`;
      if (formData.barber === 'Lucas') baseUrl = `${import.meta.env.VITE_API_BASE_URL}/api/agendamentos-lucas`;
      
      const url = editingAgendamento ? `${baseUrl}/${editingAgendamento.id}` : baseUrl;

      let precoEmCentavos = null;
      if (formData.preco) {
        const valorFloat = parseFloat(formData.preco.toString().replace(/[^\d.,]/g, '').replace(',', '.'));
        if (!isNaN(valorFloat)) precoEmCentavos = Math.round(valorFloat * 100);
      }

      const response = await fetch(url, { 
        method: editingAgendamento ? 'PUT' : 'POST', 
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, 
        body: JSON.stringify({ ...formData, preco: precoEmCentavos }) 
      });
      if (response.ok) { 
        fetchDadosIniciais(); 
        setDialogOpen(false); 
        setEditingAgendamento(null); 
      } else {
        alert((await response.json()).error || 'Erro ao salvar.');
      }
    } catch (error) { console.error(error); }
  };

  const handleBlockSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const blockId = 'block_' + Date.now();
      const slots = [];
      const dIni = new Date(blockData.data_inicio + 'T12:00:00');
      const dFim = new Date(blockData.data_fim + 'T12:00:00');
      
      for (let d = new Date(dIni); d <= dFim; d.setDate(d.getDate() + 1)) {
        const [hIni, mIni] = blockData.hora_inicio.split(':').map(Number);
        const [hFim, mFim] = blockData.hora_fim.split(':').map(Number);
        let minAtual = hIni * 60 + mIni;
        while (minAtual <= hFim * 60 + mFim) {
          slots.push({ data: format(d, 'yyyy-MM-dd'), hora: `${Math.floor(minAtual / 60).toString().padStart(2, '0')}:${(minAtual % 60).toString().padStart(2, '0')}`, blockId });
          minAtual += parseInt(blockData.intervalo);
        }
      }
      if (slots.length === 0) return alert("Nenhum horário selecionado.");

      const requests = slots.flatMap(slot => {
        const payload = { cliente_nome: 'Bloqueio de Agenda', cliente_telefone: '', servico: 'Horário Bloqueado', data: slot.data, hora: slot.hora, status: 'Bloqueado', preco: 0, forma_pagamento: '-', observacoes: slot.blockId };
        const reqs = [];
        if (blockData.barber === 'Miguel' || blockData.barber === 'Todos') reqs.push(fetch(`${import.meta.env.VITE_API_BASE_URL}/api/agendamentos`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(payload) }));
        if (blockData.barber === 'Jhonatas' || blockData.barber === 'Todos') reqs.push(fetch(`${import.meta.env.VITE_API_BASE_URL}/api/agendamentos-jhonatas`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(payload) }));
        if (blockData.barber === 'Lucas' || blockData.barber === 'Todos') reqs.push(fetch(`${import.meta.env.VITE_API_BASE_URL}/api/agendamentos-lucas`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(payload) }));
        return reqs;
      });

      await Promise.all(requests);
      alert('Bloqueado com sucesso!'); 
      fetchDadosIniciais(); 
      setBlockDialogOpen(false);
    } catch (error) { alert("Erro de conexão ao bloquear."); }
  };

  const handleDelete = async (agendamento) => {
    const token = localStorage.getItem('token');
    if (agendamento.status === 'Bloqueado' && agendamento.observacoes?.startsWith('block_')) {
      if (confirm('Este horário faz parte de um BLOQUEIO EM LOTE.\n[OK] para excluir rotina completa.\n[Cancelar] se quiser excluir APENAS este específico.')) {
        try {
          const itemsToDelete = agendamentos.filter(a => a.observacoes === agendamento.observacoes);
          await Promise.all(itemsToDelete.map(item => {
            const endpoint = item.barber === 'Jhonatas' ? 'agendamentos-jhonatas' : item.barber === 'Lucas' ? 'agendamentos-lucas' : 'agendamentos';
            return fetch(`${import.meta.env.VITE_API_BASE_URL}/api/${endpoint}/${item.id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
          }));
          return fetchDadosIniciais();
        } catch (error) { return alert('Erro ao remover bloqueio.'); }
      } else if (!confirm('Confirmar liberação APENAS deste horário específico?')) return;
    } else if (!confirm('Deseja excluir este registro?')) return;

    try {
      const endpoint = agendamento.barber === 'Jhonatas' ? 'agendamentos-jhonatas' : agendamento.barber === 'Lucas' ? 'agendamentos-lucas' : 'agendamentos';
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/${endpoint}/${agendamento.id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      if (response.ok) fetchDadosIniciais();
    } catch (error) { console.error(error); }
  };

  const resetForm = () => {
    setFormData({ cliente_nome: '', cliente_telefone: '', servico: '', data: format(selectedDate || new Date(), 'yyyy-MM-dd'), hora: '', status: 'Pendente', preco: '', forma_pagamento: 'Dinheiro', observacoes: '', barber: isJhonatas ? 'Jhonatas' : isLucas ? 'Lucas' : 'Miguel', data_aniversario: '' }); // <-- ADICIONADO AQUI
    setEditingAgendamento(null); setShowSuggestions(false); 
  };

  const openEditDialog = (agendamento) => {
    setEditingAgendamento(agendamento);
    let safePreco = '';
    if (agendamento?.preco !== null && agendamento?.preco !== undefined) {
      const numPreco = Number(agendamento.preco);
      if (!isNaN(numPreco)) safePreco = (numPreco > 0 && numPreco < 500) ? numPreco.toString().replace('.', ',') : (numPreco / 100).toLocaleString('pt-BR', {minimumFractionDigits:2});
    }
    setFormData({ ...agendamento, preco: safePreco, barber: agendamento?.barber ?? (isJhonatas ? 'Jhonatas' : isLucas ? 'Lucas' : 'Miguel'), data_aniversario: agendamento?.data_aniversario || '' }); // <-- ADICIONADO AQUI PARA PUXAR O ANIVERSÁRIO NA EDIÇÃO SE EXISTIR
    setDialogOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmado': return 'bg-green-950/50 text-green-400 border-green-900/50';
      case 'Pendente':   return 'bg-yellow-950/50 text-yellow-400 border-yellow-900/50';
      case 'Cancelado':  return 'bg-red-950/50 text-red-400 border-red-900/50';
      case 'Bloqueado':  return 'bg-neutral-800 text-neutral-400 border-neutral-700';
      default:           return 'bg-neutral-800 text-neutral-400 border-neutral-700';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Confirmado': return <CheckCircle className="h-4 w-4" />;
      case 'Pendente':   return <Clock className="h-4 w-4" />;
      case 'Cancelado':  return <AlertCircle className="h-4 w-4" />;
      case 'Bloqueado':  return <Lock className="h-4 w-4" />;
      default:           return <Clock className="h-4 w-4" />;
    }
  };

  const renderTable = (barbeiroKey) => {
    // Define qual nome mostrar dinamicamente (Miguel/Jhonatas/Lucas interno -> Nome de Exibição)
    const displayNome = barbeiroKey === 'Jhonatas' ? barberTwoName : barbeiroKey === 'Lucas' ? barberThreeName : barberOneName;
    
    const filtrados = agendamentos.filter(a => a.barber === barbeiroKey && (!selectedDate || a.data === format(selectedDate, 'yyyy-MM-dd'))).sort((a, b) => a.hora.localeCompare(b.hora));

    return (
      <Card className="w-full bg-neutral-900/60 border-neutral-800 backdrop-blur-md shadow-xl overflow-hidden min-w-[300px]">
        <CardHeader className="border-b border-neutral-800 bg-neutral-900/40">
          <CardTitle className="flex items-center gap-2 text-lg text-white font-bold uppercase tracking-tight">
            <User className={`h-5 w-5 ${barbeiroKey === 'Miguel' ? 'text-[#DEAE60]' : 'text-neutral-400'}`} />
            Agenda: {displayNome}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-neutral-400 uppercase bg-neutral-950/50">
                <tr>
                  <th className="px-4 py-3">Hora</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Serviço</th>
                  <th className="px-4 py-3">Pagamento</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {filtrados.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-12 text-center text-neutral-500 italic">
                      Nenhum agendamento para este dia.
                    </td>
                  </tr>
                ) : (
                  filtrados.map((a) => (
                    <tr key={a.id} className={`hover:bg-white/5 transition-colors ${a.status === 'Bloqueado' ? 'bg-neutral-950/30 opacity-60' : ''}`}>
                      <td className="px-4 py-3 font-black text-white">{a.hora.substring(0, 5)}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className={`font-bold ${a.status === 'Bloqueado' ? 'text-neutral-500' : 'text-neutral-100'}`}>{a.cliente_nome}</span>
                          {a.status !== 'Bloqueado' && (
                            <span className="text-[10px] text-neutral-400 flex items-center gap-1 mt-0.5">
                              <Phone className="h-2 w-2 text-[#DEAE60]" /> {a.cliente_telefone || 'Sem tel.'}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-neutral-300">{a.servico}</td>
                      <td className="px-4 py-3">
                        {a.status !== 'Bloqueado' ? (
                           <span className="text-[10px] bg-neutral-800 border border-neutral-700 px-2 py-1 rounded-full text-neutral-300 font-medium">
                             {a.forma_pagamento || 'Não def.'}
                           </span>
                        ) : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className={`${getStatusColor(a.status)} text-[10px] uppercase tracking-widest`}>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(a.status)}
                            {a.status}
                          </span>
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right space-x-1">
                        {a.status !== 'Bloqueado' && (
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(a)} className="h-8 w-8 text-[#DEAE60] hover:bg-neutral-800 hover:text-[#DEAE60]">
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(a)} className="h-8 w-8 text-red-400 hover:bg-red-950/50 hover:text-red-300">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#DEAE60]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pt-8 sm:pt-4">
      
      {/* CABEÇALHO RESPONSIVO */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        
        {/* TÍTULO E BOTÃO DE CONFIGURAÇÃO DE NOME */}
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tighter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">Agenda de Atendimentos</h1>
            <p className="text-neutral-200 font-medium drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] mt-1">Gerencie os horários da barbearia</p>
          </div>
          
          {isAdmin && (
            <Dialog open={nameDialogOpen} onOpenChange={(open) => {
              setNameDialogOpen(open);
              if (open) {
                 setTargetBarber('barberThreeName');
                 setTempName(barberThreeName);
              }
            }}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-white/50 hover:text-white hover:bg-white/10" title="Configurar Nomes das Agendas">
                  <Settings className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[400px] bg-white border-gray-200">
                <DialogHeader>
                  <DialogTitle className="text-lg font-bold text-gray-900 uppercase tracking-tighter">Alterar Nome de Exibição</DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-4">
                  <p className="text-xs text-gray-500">O nome escolhido será atualizado em todo o sistema.</p>
                  
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Qual agenda deseja renomear?</Label>
                    <Select value={targetBarber} onValueChange={(val) => {
                      setTargetBarber(val);
                      setTempName(val === 'barberOneName' ? barberOneName : val === 'barberTwoName' ? barberTwoName : barberThreeName);
                    }}>
                      <SelectTrigger className="bg-gray-50 text-gray-900 focus-visible:ring-[#DEAE60]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-200 text-gray-900">
                        <SelectItem value="barberOneName">Agenda 1 ({barberOneName})</SelectItem>
                        <SelectItem value="barberTwoName">Agenda 2 ({barberTwoName})</SelectItem>
                        <SelectItem value="barberThreeName">Agenda 3 ({barberThreeName})</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Novo Nome de Exibição</Label>
                    <Input 
                      value={tempName} 
                      onChange={(e) => setTempName(e.target.value)} 
                      className="bg-gray-50 text-gray-900 focus-visible:ring-[#DEAE60]" 
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setNameDialogOpen(false)} className="bg-white text-gray-600 hover:bg-gray-50">Cancelar</Button>
                  <Button onClick={handleSaveName} className="bg-[#DEAE60] text-neutral-950 font-bold hover:bg-[#DEAE60]/90">Salvar Nome</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          {/* Filtro de data */}
          <div className="w-full sm:w-auto">
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto bg-neutral-900/60 border-neutral-800 text-white hover:bg-neutral-800 flex justify-center backdrop-blur-md">
                  <CalendarDays className="h-4 w-4 mr-2 text-[#DEAE60]" />
                  {selectedDate ? format(selectedDate, "dd 'de' MMMM", { locale: ptBR }) : "Filtrar Data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-white border-gray-200" align="end">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    if (date) {
                      setSelectedDate(date);
                      setCalendarOpen(false);
                    }
                  }}
                  disabled={(date) => date.getDay() === 0 || date.getDay() === 1}
                  locale={ptBR}
                  initialFocus
                  className="bg-white text-gray-900"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* DIALOG DE BLOQUEIO */}
            <Dialog open={blockDialogOpen} onOpenChange={setBlockDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="secondary" className="flex-1 sm:flex-none bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700">
                  <Lock className="h-4 w-4 sm:mr-2 text-neutral-400" /> 
                  <span className="text-xs sm:text-sm">Bloquear</span>
                </Button>
              </DialogTrigger>
              {/* Ajuste de Rolagem Interna e Largura - Mobile First */}
              <DialogContent className="sm:max-w-[500px] bg-white border-gray-200 text-gray-900 w-[95vw] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold uppercase tracking-tight text-gray-900">Bloquear Horários na Agenda</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleBlockSubmit} className="space-y-4 pt-4">
                  {isAdmin && (
                    <div className="space-y-2">
                      <Label className="text-gray-600 font-bold uppercase tracking-widest text-[10px]">Agenda(s) a bloquear</Label>
                      <Select value={blockData.barber} onValueChange={(v) => setBlockData({...blockData, barber: v})}>
                        <SelectTrigger className="bg-gray-50 border-gray-200 text-gray-900 focus-visible:ring-[#DEAE60]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-200 text-gray-900">
                          <SelectItem value="Todos">Geral (Todas as 3)</SelectItem>
                          <SelectItem value="Miguel">Apenas {barberOneName}</SelectItem>
                          <SelectItem value="Jhonatas">Apenas {barberTwoName}</SelectItem>
                          <SelectItem value="Lucas">Apenas {barberThreeName}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {/* Ajuste do grid para alinhar na vertical no celular */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-gray-600 font-bold uppercase tracking-widest text-[10px]">Data de Início</Label>
                      <Input 
                        type="date" 
                        required 
                        value={blockData.data_inicio} 
                        onChange={(e) => setBlockData({...blockData, data_inicio: e.target.value})} 
                        className="bg-gray-50 border-gray-200 text-gray-900 focus-visible:ring-[#DEAE60]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-600 font-bold uppercase tracking-widest text-[10px]">Data Final</Label>
                      <Input 
                        type="date" 
                        required 
                        value={blockData.data_fim} 
                        onChange={(e) => setBlockData({...blockData, data_fim: e.target.value})} 
                        className="bg-gray-50 border-gray-200 text-gray-900 focus-visible:ring-[#DEAE60]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-600 font-bold uppercase tracking-widest text-[10px]">Hora Inicial</Label>
                      <Input 
                        type="time" 
                        required 
                        value={blockData.hora_inicio} 
                        onChange={(e) => setBlockData({...blockData, hora_inicio: e.target.value})} 
                        className="bg-gray-50 border-gray-200 text-gray-900 focus-visible:ring-[#DEAE60]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-600 font-bold uppercase tracking-widest text-[10px]">Hora Final</Label>
                      <Input 
                        type="time" 
                        required 
                        value={blockData.hora_fim} 
                        onChange={(e) => setBlockData({...blockData, hora_fim: e.target.value})} 
                        className="bg-gray-50 border-gray-200 text-gray-900 focus-visible:ring-[#DEAE60]"
                      />
                    </div>
                    <div className="space-y-2 col-span-1 sm:col-span-2">
                      <Label className="text-gray-600 font-bold uppercase tracking-widest text-[10px]">Gerar bloqueios a cada:</Label>
                      <Select value={blockData.intervalo} onValueChange={(v) => setBlockData({...blockData, intervalo: v})}>
                        <SelectTrigger className="bg-gray-50 border-gray-200 text-gray-900 focus-visible:ring-[#DEAE60]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-200 text-gray-900">
                          <SelectItem value="15">15 Minutos</SelectItem>
                          <SelectItem value="30">30 Minutos</SelectItem>
                          <SelectItem value="60">1 Hora</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                    <Button type="button" variant="outline" onClick={() => setBlockDialogOpen(false)} className="bg-white border-gray-200 text-gray-600 hover:bg-gray-50">Cancelar</Button>
                    <Button type="submit" className="bg-[#DEAE60] hover:bg-[#DEAE60]/90 text-neutral-950 font-bold">Aplicar Bloqueio</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            {/* DIALOG DE NOVO/EDITAR AGENDAMENTO */}
            <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if(!open) resetForm(); }}>
              <DialogTrigger asChild>
                <Button className="flex-1 sm:flex-none bg-[#DEAE60] hover:bg-[#DEAE60]/90 text-neutral-950 font-bold shadow-lg">
                  <Plus className="h-4 w-4 sm:mr-2" /> 
                  <span className="text-xs sm:text-sm">Novo</span>
                </Button>
              </DialogTrigger>
              {/* Ajuste de Rolagem Interna e Largura - Mobile First */}
              <DialogContent className="sm:max-w-[500px] bg-white border-gray-200 text-gray-900 w-[95vw] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold uppercase tracking-tight text-gray-900">{editingAgendamento ? 'Editar Agendamento' : 'Novo Agendamento'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                  {/* Ajuste do grid para alinhar na vertical no celular */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {isAdmin && (
                    <div className="space-y-2 col-span-1 sm:col-span-2">
                      <Label className="text-gray-600 font-bold uppercase tracking-widest text-[10px]">Barbeiro</Label>
                      <Select value={formData.barber} onValueChange={(v) => setFormData({...formData, barber: v})}>
                        <SelectTrigger className="bg-gray-50 border-gray-200 text-gray-900 focus-visible:ring-[#DEAE60]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-200 text-gray-900">
                          <SelectItem value="Miguel">{barberOneName}</SelectItem>
                          <SelectItem value="Jhonatas">{barberTwoName}</SelectItem>
                          <SelectItem value="Lucas">{barberThreeName}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    )}
                    
                    <div className="space-y-2 col-span-1 sm:col-span-2 relative">
                      <Label className="text-gray-600 font-bold uppercase tracking-widest text-[10px]">Nome do Cliente</Label>
                      <Input 
                        required 
                        value={formData.cliente_nome} 
                        onChange={handleNameChange}
                        onFocus={() => { if(formData.cliente_nome) setShowSuggestions(true) }}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                        placeholder="Nome completo ou digite para buscar..."
                        className="bg-gray-50 border-gray-200 text-gray-900 focus-visible:ring-[#DEAE60]"
                      />
                      
                      {showSuggestions && filteredClientes.length > 0 && (
                        <ul className="absolute z-50 w-full bg-white border border-gray-200 rounded-md shadow-xl max-h-48 overflow-y-auto mt-1">
                          {filteredClientes.map((c, idx) => (
                            <li
                              key={idx}
                              className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm transition-colors border-b border-gray-100 last:border-0"
                              onMouseDown={(e) => {
                                e.preventDefault(); 
                                handleSelectClient(c);
                              }}
                            >
                              <div className="font-bold text-gray-900">{c.nome}</div>
                              {c.telefone && <div className="text-xs text-gray-500">{c.telefone}</div>}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div className="space-y-2 col-span-1 sm:col-span-2">
                      <Label className="text-gray-600 font-bold uppercase tracking-widest text-[10px]">Telefone do Cliente</Label>
                      <Input 
                        value={formData.cliente_telefone} 
                        onChange={(e) => setFormData({...formData, cliente_telefone: e.target.value})}
                        placeholder="(00) 00000-0000"
                        className="bg-gray-50 border-gray-200 text-gray-900 focus-visible:ring-[#DEAE60]"
                      />
                    </div>

                    {/* ======================================================== */}
                    {/* CAMPO DE ANIVERSÁRIO ADICIONADO AQUI                     */}
                    {/* ======================================================== */}
                    <div className="space-y-2 col-span-1 sm:col-span-2">
                      <Label className="text-gray-600 font-bold uppercase tracking-widest text-[10px]">Aniversário (Dia/Mês)</Label>
                      <Input 
                        placeholder="Ex: 25/05 (Opcional)" 
                        maxLength={5} 
                        value={formData.data_aniversario || ''} 
                        onChange={(e) => {
                          let val = e.target.value.replace(/\D/g, ''); 
                          if (val.length > 2) val = val.substring(0, 2) + '/' + val.substring(2, 4);
                          setFormData({...formData, data_aniversario: val});
                        }}
                        className="bg-gray-50 border-gray-200 text-gray-900 focus-visible:ring-[#DEAE60]"
                      />
                    </div>
                    {/* ======================================================== */}

                    <div className="space-y-2 col-span-1 sm:col-span-2">
                      <Label className="text-gray-600 font-bold uppercase tracking-widest text-[10px]">Serviço</Label>
                      <Select value={formData.servico} onValueChange={handleServicoChange}>
                        <SelectTrigger className="bg-gray-50 border-gray-200 text-gray-900 focus-visible:ring-[#DEAE60]">
                          <SelectValue placeholder="Selecione o serviço" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-200 text-gray-900">
                          {servicosDb.map(s => <SelectItem key={s.id} value={s.nome}>{s.nome}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-600 font-bold uppercase tracking-widest text-[10px]">Data</Label>
                      <Input 
                        type="date" 
                        required 
                        value={formData.data} 
                        onChange={(e) => setFormData({...formData, data: e.target.value})}
                        className="bg-gray-50 border-gray-200 text-gray-900 focus-visible:ring-[#DEAE60]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-600 font-bold uppercase tracking-widest text-[10px]">Hora</Label>
                      <Input 
                        type="time" 
                        required 
                        value={formData.hora} 
                        onChange={(e) => setFormData({...formData, hora: e.target.value})}
                        className="bg-gray-50 border-gray-200 text-gray-900 focus-visible:ring-[#DEAE60]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-600 font-bold uppercase tracking-widest text-[10px]">Preço (R$)</Label>
                      <Input 
                        value={formData.preco} 
                        onChange={(e) => setFormData({...formData, preco: e.target.value})}
                        placeholder="0,00"
                        className="bg-gray-50 border-gray-200 text-gray-900 focus-visible:ring-[#DEAE60]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-600 font-bold uppercase tracking-widest text-[10px]">Forma de Pagamento</Label>
                      <Select value={formData.forma_pagamento} onValueChange={(v) => setFormData({...formData, forma_pagamento: v})}>
                        <SelectTrigger className="bg-gray-50 border-gray-200 text-gray-900 focus-visible:ring-[#DEAE60]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-200 text-gray-900">
                          {formasPagamento.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 col-span-1 sm:col-span-2">
                      <Label className="text-gray-600 font-bold uppercase tracking-widest text-[10px]">Status</Label>
                      <Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v})}>
                        <SelectTrigger className="bg-gray-50 border-gray-200 text-gray-900 focus-visible:ring-[#DEAE60]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-200 text-gray-900">
                          <SelectItem value="Pendente">Pendente</SelectItem>
                          <SelectItem value="Confirmado">Confirmado</SelectItem>
                          <SelectItem value="Cancelado">Cancelado</SelectItem>
                          <SelectItem value="Bloqueado">Bloqueado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="bg-white border-gray-200 text-gray-600 hover:bg-gray-50">Cancelar</Button>
                    <Button type="submit" className="bg-[#DEAE60] hover:bg-[#DEAE60]/90 text-neutral-950 font-bold">
                      {editingAgendamento ? 'Salvar Alterações' : 'Criar Agendamento'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* RENDERIZAÇÃO DAS TABELAS EMPILHADAS */}
      <div className="flex flex-col gap-6 pb-4">
        {isAdmin && renderTable('Miguel')}
        {(isAdmin || isJhonatas) && renderTable('Jhonatas')}
        {(isAdmin || isLucas) && renderTable('Lucas')}
      </div>
    </div>
  );
};

export default Agenda;
