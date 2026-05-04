import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, Scissors, User, DollarSign, Clock, CalendarDays } from 'lucide-react';

const AgendamentoPublico = () => {
  const [horariosLivres, setHorariosLivres] = useState([]);
  const [loadingHorarios, setLoadingHorarios] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  // --- DADOS DINÂMICOS DO BACKEND ---
  const [barberOneName, setBarberOneName] = useState('Fabrício');
  const [barberTwoName, setBarberTwoName] = useState('Lucas');
  const [barberThreeName, setBarberThreeName] = useState('Gabriel');
  const [servicosDb, setServicosDb] = useState([]);

  const [formData, setFormData] = useState({
    barbeiro: 'Miguel', 
    cliente_nome: '',
    cliente_telefone: '',
    servicoObj: null, 
    data: '',
    hora: '',
    forma_pagamento: 'Dinheiro'
  });

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/configuracoes/barberOneName`)
      .then(res => res.json())
      .then(data => setBarberOneName(data.valor || 'Fabrício'))
      .catch(err => console.error(err));

    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/configuracoes/barberTwoName`)
      .then(res => res.json())
      .then(data => {
        // TRAVA DE SEGURANÇA: Força o nome Lucas se o banco retornar Jhonatas
        if (data.valor === 'Jhonatas') {
          setBarberTwoName('Lucas');
        } else {
          setBarberTwoName(data.valor || 'Lucas');
        }
      })
      .catch(err => console.error(err));

    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/configuracoes/barberThreeName`)
      .then(res => res.json())
      .then(data => setBarberThreeName(data.valor || 'Gabriel'))
      .catch(err => console.error(err));

    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/servicos`)
      .then(res => res.json())
      .then(data => setServicosDb(data))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (formData.data && formData.barbeiro && formData.servicoObj) {
      buscarHorarios();
    }
  }, [formData.data, formData.barbeiro, formData.servicoObj]);

  const buscarHorarios = async () => {
    setLoadingHorarios(true);
    setFormData(prev => ({ ...prev, hora: '' })); 
    try {
      let endpoint = 'agendamentos';
      if (formData.barbeiro === 'Jhonatas') endpoint = 'agendamentos-jhonatas';
      if (formData.barbeiro === 'Lucas') endpoint = 'agendamentos-lucas';

      const url = `${import.meta.env.VITE_API_BASE_URL}/api/${endpoint}/disponibilidade?data=${formData.data}&servico=${encodeURIComponent(formData.servicoObj.nome)}`;
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setHorariosLivres(data.livres || []);
      }
    } catch (error) {
      console.error('Erro ao buscar horários:', error);
    } finally {
      setLoadingHorarios(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSalvando(true);
    try {
      let endpoint = 'agendamentos';
      if (formData.barbeiro === 'Jhonatas') endpoint = 'agendamentos-jhonatas';
      if (formData.barbeiro === 'Lucas') endpoint = 'agendamentos-lucas';
      
      const payload = {
        cliente_nome: formData.cliente_nome,
        cliente_telefone: formData.cliente_telefone,
        servico: formData.servicoObj.nome,
        preco: formData.servicoObj.precoEmCentavos, 
        data: formData.data,
        hora: formData.hora,
        forma_pagamento: formData.forma_pagamento,
        status: 'Pendente' 
      };

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setSucesso(true);
      } else {
        alert('Ops! Alguém acabou de reservar esse horário. Por favor, escolha outro.');
        buscarHorarios();
      }
    } catch (error) {
      alert('Erro ao agendar. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  const hojeStr = new Date().toISOString().split('T')[0];

  if (sucesso) {
    return (
      <div className="min-h-screen flex items-center justify-center relative p-4 bg-neutral-950">
        <img src="/fundologin.png" className="absolute inset-0 w-full h-full object-cover z-0 opacity-40" alt="Fundo" />
        <Card className="max-w-md w-full text-center py-12 shadow-2xl z-10 bg-neutral-900/90 border-neutral-800 backdrop-blur-md">
          <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">Agendamento Confirmado!</h2>
          <p className="text-neutral-400 mb-6 px-4">Sua vaga está garantida. Te esperamos no dia <strong className="text-white">{formData.data.split('-').reverse().join('/')}</strong> às <strong className="text-white">{formData.hora}</strong>.</p>
          <Button onClick={() => window.location.reload()} className="w-full max-w-xs mx-auto bg-[#DEAE60] hover:bg-[#DEAE60]/90 text-neutral-950 font-bold">
            Fazer outro agendamento
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative bg-neutral-950 overflow-x-hidden">
      <img src="/fundologin.png" alt="Fundo" className="fixed inset-0 w-full h-full object-cover z-0" />
      <div className="fixed inset-0 bg-neutral-950/40 backdrop-blur-[3px] z-10" />

      <header className="w-full bg-neutral-950/80 backdrop-blur-md py-4 px-6 border-b border-[#DEAE60]/20 flex items-center justify-between z-20 relative">
        <div className="flex items-center gap-3">
          <img src="/logobranca.png" alt="Logo" className="h-10 sm:h-12 w-auto" />
          <div className="flex flex-col text-left">
            <h1 className="text-[14px] sm:text-lg font-black text-white tracking-tighter leading-none uppercase">BARBEARIA DO MINEIRO</h1>
            <span className="text-[8px] sm:text-[9px] text-[#DEAE60] font-bold uppercase tracking-widest mt-0.5">ESTILO DE PAI PARA FILHO</span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 py-8 z-20 relative">
        <Card className="max-w-lg w-full shadow-2xl bg-neutral-900/90 border-neutral-800 backdrop-blur-md">
          
          <div className="p-6 text-center border-b border-neutral-800">
            <img 
              src="/logobranca.png" 
              alt="Logo Barbearia do Mineiro" 
              className="w-16 h-auto mx-auto mb-4 drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)]" 
            />
            <h1 className="text-2xl font-black text-white uppercase tracking-tighter leading-tight flex items-center justify-center gap-2">
              <CalendarDays className="h-6 w-6 text-[#DEAE60]" /> Agende seu Horário
            </h1>
            <p className="text-neutral-400 font-medium mt-1 text-sm">Siga os passos abaixo</p>
          </div>

          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="space-y-3">
                <Label className="text-neutral-300 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2">
                  <User className="h-4 w-4 text-[#DEAE60]"/> 1. Escolha o Profissional
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Button type="button" variant="outline" className={formData.barbeiro === 'Miguel' ? 'bg-[#DEAE60] hover:bg-[#DEAE60]/90 text-neutral-950 font-bold border-0' : 'bg-neutral-950 border-neutral-800 text-neutral-400 font-bold'} onClick={() => setFormData({...formData, barbeiro: 'Miguel'})}>
                    {barberOneName}
                  </Button>
                  <Button type="button" variant="outline" className={formData.barbeiro === 'Jhonatas' ? 'bg-[#DEAE60] hover:bg-[#DEAE60]/90 text-neutral-950 font-bold border-0' : 'bg-neutral-950 border-neutral-800 text-neutral-400 font-bold'} onClick={() => setFormData({...formData, barbeiro: 'Jhonatas'})}>
                    {barberTwoName}
                  </Button>
                  <Button type="button" variant="outline" className={formData.barbeiro === 'Lucas' ? 'bg-[#DEAE60] hover:bg-[#DEAE60]/90 text-neutral-950 font-bold border-0' : 'bg-neutral-950 border-neutral-800 text-neutral-400 font-bold'} onClick={() => setFormData({...formData, barbeiro: 'Lucas'})}>
                    {barberThreeName}
                  </Button>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-neutral-800">
                <Label className="text-neutral-300 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2">
                  <Scissors className="h-4 w-4 text-[#DEAE60]"/> 2. Serviço e Pagamento
                </Label>
                
                <Select required onValueChange={(nomeServico) => {
                  const servicoEncontrado = servicosDb.find(s => s.nome === nomeServico);
                  if(servicoEncontrado) {
                    setFormData({...formData, servicoObj: { 
                      nome: servicoEncontrado.nome, 
                      precoExibicao: servicoEncontrado.preco / 100,
                      precoEmCentavos: servicoEncontrado.preco
                    }});
                  }
                }}>
                  <SelectTrigger className="bg-neutral-950 border-neutral-800 text-white h-12 focus-visible:ring-[#DEAE60]">
                    <SelectValue placeholder={servicosDb.length > 0 ? "Selecione o Serviço" : "Carregando serviços..."} />
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-900 border-neutral-800 text-white">
                    {servicosDb.map((s) => (
                      <SelectItem key={s.id} value={s.nome}>{s.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest ml-1">Valor (R$)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                      <Input 
                        readOnly 
                        value={formData.servicoObj ? formData.servicoObj.precoExibicao.toLocaleString('pt-BR', {minimumFractionDigits: 2}) : '0,00'} 
                        className="bg-neutral-950/50 text-white font-black pl-9 border-neutral-800 cursor-not-allowed h-12 focus-visible:ring-[#DEAE60]" 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest ml-1">Pagamento</Label>
                    <Select value={formData.forma_pagamento} onValueChange={(v) => setFormData({...formData, forma_pagamento: v})}>
                      <SelectTrigger className="bg-neutral-950 border-neutral-800 text-white h-12 focus-visible:ring-[#DEAE60]"><SelectValue placeholder="Forma" /></SelectTrigger>
                      <SelectContent className="bg-neutral-900 border-neutral-800 text-white">
                        <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                        <SelectItem value="Pix">Pix</SelectItem>
                        <SelectItem value="Cartão de Débito">Cartão de Débito</SelectItem>
                        <SelectItem value="Cartão de Crédito">Cartão de Crédito</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-neutral-800">
                <Label className="text-neutral-300 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2">
                  <Clock className="h-4 w-4 text-[#DEAE60]"/> 3. Data e Hora
                </Label>
                
                <Input required type="date" min={hojeStr} value={formData.data} onChange={e => setFormData({...formData, data: e.target.value})} className="bg-neutral-950 border-neutral-800 text-white h-12 px-4 focus-visible:ring-[#DEAE60]" style={{ colorScheme: 'dark' }} />
                
                {formData.data && formData.servicoObj && (
                  <div className="pt-2 animate-in fade-in duration-300">
                    <Label className="text-[10px] text-neutral-500 mb-2 block font-bold uppercase tracking-widest ml-1">Horários Disponíveis:</Label>
                    {loadingHorarios ? (
                      <div className="text-xs text-[#DEAE60] animate-pulse font-medium bg-neutral-950 p-3 rounded-lg text-center border border-neutral-800">Buscando horários para este serviço...</div>
                    ) : horariosLivres.length > 0 ? (
                      <div className="grid grid-cols-4 gap-2">
                        {horariosLivres.map(h => (
                          <button key={h} type="button" onClick={() => setFormData({...formData, hora: h})} className={`p-2 rounded-lg text-sm font-bold border transition-all ${formData.hora === h ? 'bg-[#DEAE60] text-neutral-950 border-[#DEAE60] shadow-md scale-[1.02]' : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:border-[#DEAE60]'}`}>{h}</button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-red-400 bg-red-950/30 p-3 rounded-lg border border-red-900/30 text-center font-bold">Nenhum horário livre para este dia.</div>
                    )}
                  </div>
                )}
                
                {formData.data && !formData.servicoObj && (
                  <div className="text-xs text-amber-400 bg-amber-950/30 p-3 rounded-lg border border-amber-900/30 text-center font-bold">Selecione um serviço primeiro.</div>
                )}
              </div>

              <div className="space-y-4 pt-4 border-t border-neutral-800">
                <Label className="text-neutral-300 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2">
                  <User className="h-4 w-4 text-[#DEAE60]"/> 4. Seus Dados
                </Label>
                <div className="grid grid-cols-1 gap-4">
                  <Input required placeholder="Seu Nome Completo" value={formData.cliente_nome} onChange={e => setFormData({...formData, cliente_nome: e.target.value})} className="bg-neutral-950 border-neutral-800 text-white h-12 focus-visible:ring-[#DEAE60]" />
                  <Input required placeholder="Telefone / WhatsApp" value={formData.cliente_telefone} onChange={e => setFormData({...formData, cliente_telefone: e.target.value})} className="bg-neutral-950 border-neutral-800 text-white h-12 focus-visible:ring-[#DEAE60]" />
                </div>
              </div>

              <Button type="submit" disabled={salvando || !formData.hora || !formData.servicoObj || !formData.cliente_nome} className="w-full bg-[#DEAE60] hover:bg-[#DEAE60]/90 text-neutral-950 h-14 text-lg font-black shadow-xl shadow-black/30 mt-6 uppercase tracking-tighter">
                {salvando ? 'Processando...' : 'Confirmar Agendamento'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AgendamentoPublico;
