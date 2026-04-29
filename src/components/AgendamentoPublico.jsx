import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, Calendar, Scissors, User, DollarSign, Clock } from 'lucide-react';

const SERVICOS_TABELA = [
  { nome: 'Barba', preco: 30.00 },
  { nome: 'Barba + Pézinho', preco: 40.00 },
  { nome: 'Barba + Pigmentação', preco: 50.00 },
  { nome: 'Barba Express', preco: 20.00 },
  { nome: 'Bigode', preco: 10.00 },
  { nome: 'Camuflagem (Fios brancos)', preco: 35.00 },
  { nome: 'Cone Hindu', preco: 25.00 },
  { nome: 'Corte', preco: 40.00 },
  { nome: 'Corte + Pigmentação', preco: 60.00 },
  { nome: 'Corte 1 pente + barba', preco: 50.00 },
  { nome: 'Corte e Barba', preco: 60.00 },
  { nome: 'Corte Infantil', preco: 45.00 },
  { nome: 'Corte Máquina 1 pente', preco: 25.00 },
  { nome: 'Hidratação Capilar', preco: 25.00 },
  { nome: 'Limpeza Nasal', preco: 25.00 },
  { nome: 'Luzes', preco: 100.00 },
  { nome: 'Luzes e Corte', preco: 140.00 },
  { nome: 'Navalhado', preco: 30.00 },
  { nome: 'Navalhado + Barba', preco: 50.00 },
  { nome: 'Pezinho', preco: 10.00 },
  { nome: 'Pigmentação', preco: 25.00 },
  { nome: 'Platinado', preco: 100.00 },
  { nome: 'Platinado e Corte', preco: 140.00 },
  { nome: 'Sobrancelha', preco: 10.00 },
  { nome: 'Sobrancelha na fita', preco: 25.00 }
];

const AgendamentoPublico = () => {
  const [horariosLivres, setHorariosLivres] = useState([]);
  const [loadingHorarios, setLoadingHorarios] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  const [formData, setFormData] = useState({
    barbeiro: 'Miguel', // Variável original
    cliente_nome: '',
    cliente_telefone: '',
    servicoObj: null, 
    data: '',
    hora: '',
    forma_pagamento: 'Dinheiro'
  });

  // Lógica Original Intacta
  useEffect(() => {
    if (formData.data && formData.barbeiro && formData.servicoObj) {
      buscarHorarios();
    }
  }, [formData.data, formData.barbeiro, formData.servicoObj]);

  const buscarHorarios = async () => {
    setLoadingHorarios(true);
    setFormData(prev => ({ ...prev, hora: '' })); 
    try {
      const endpoint = formData.barbeiro === 'Jhonatas' ? 'agendamentos-jhonatas' : 'agendamentos';
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
      const endpoint = formData.barbeiro === 'Jhonatas' ? 'agendamentos-jhonatas' : 'agendamentos';
      
      const payload = {
        cliente_nome: formData.cliente_nome,
        cliente_telefone: formData.cliente_telefone,
        servico: formData.servicoObj.nome,
        preco: formData.servicoObj.preco,
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
          <Button onClick={() => window.location.reload()} className="w-full max-w-xs mx-auto bg-purple-700 hover:bg-purple-600 text-white font-bold">
            Fazer outro agendamento
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative bg-neutral-950 overflow-x-hidden">
      
      {/* BACKGROUND PREMIUM */}
      <img src="/fundologin.png" alt="Fundo" className="fixed inset-0 w-full h-full object-cover z-0" />
      <div className="fixed inset-0 bg-neutral-950/40 backdrop-blur-[3px] z-10" />

      {/* CABEÇALHO */}
      <header className="w-full bg-neutral-950/80 backdrop-blur-md py-4 px-6 border-b border-purple-900/30 flex items-center justify-between z-20 relative">
        <div className="flex items-center gap-3">
          <img src="/logobranca.png" alt="Logo" className="h-10 sm:h-12 w-auto" />
          <div className="flex flex-col text-left">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tighter leading-none uppercase">MIGUEL ALVES</h1>
            <span className="text-[10px] sm:text-xs text-purple-300 font-bold uppercase tracking-widest">BARBERSHOP</span>
          </div>
        </div>
      </header>

      {/* FORMULÁRIO */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 py-8 z-20 relative">
        <Card className="max-w-lg w-full shadow-2xl bg-neutral-900/90 border-neutral-800 backdrop-blur-md">
          
          <div className="p-6 text-center border-b border-neutral-800">
            <h1 className="text-2xl font-black text-white uppercase tracking-tighter leading-tight flex items-center justify-center gap-2">
              <Calendar className="h-6 w-6 text-purple-500" /> Agende seu Horário
            </h1>
            <p className="text-neutral-400 font-medium mt-1 text-sm">
              Siga os passos abaixo
            </p>
          </div>

          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* PASSO 1: PROFISSIONAL */}
              <div className="space-y-3">
                <Label className="text-neutral-300 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2">
                  <User className="h-4 w-4 text-purple-500"/> 1. Escolha o Profissional
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <Button type="button" variant="outline" className={formData.barbeiro === 'Miguel' ? 'bg-purple-600 hover:bg-purple-700 text-white font-bold border-0' : 'bg-neutral-950 border-neutral-800 text-neutral-400 font-bold'} onClick={() => setFormData({...formData, barbeiro: 'Miguel'})}>
                    Miguel
                  </Button>
                  <Button type="button" variant="outline" className={formData.barbeiro === 'Jhonatas' ? 'bg-purple-600 hover:bg-purple-700 text-white font-bold border-0' : 'bg-neutral-950 border-neutral-800 text-neutral-400 font-bold'} onClick={() => setFormData({...formData, barbeiro: 'Jhonatas'})}>
                    Jhonatas
                  </Button>
                </div>
              </div>

              {/* PASSO 2: SERVIÇO */}
              <div className="space-y-4 pt-4 border-t border-neutral-800">
                <Label className="text-neutral-300 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2">
                  <Scissors className="h-4 w-4 text-purple-500"/> 2. Serviço e Pagamento
                </Label>
                
                <Select required onValueChange={(nomeServico) => {
                  const servicoEncontrado = SERVICOS_TABELA.find(s => s.nome === nomeServico);
                  setFormData({...formData, servicoObj: servicoEncontrado});
                }}>
                  <SelectTrigger className="bg-neutral-950 border-neutral-800 text-white h-12">
                    <SelectValue placeholder="Selecione o Serviço" />
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-900 border-neutral-800 text-white">
                    {SERVICOS_TABELA.map((s) => (
                      <SelectItem key={s.nome} value={s.nome}>{s.nome}</SelectItem>
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
                        value={formData.servicoObj ? formData.servicoObj.preco.toFixed(2).replace('.', ',') : '0,00'} 
                        className="bg-neutral-950/50 text-white font-black pl-9 border-neutral-800 cursor-not-allowed h-12" 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest ml-1">Pagamento</Label>
                    <Select value={formData.forma_pagamento} onValueChange={(v) => setFormData({...formData, forma_pagamento: v})}>
                      <SelectTrigger className="bg-neutral-950 border-neutral-800 text-white h-12"><SelectValue placeholder="Forma" /></SelectTrigger>
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

              {/* PASSO 3: DATA E HORA */}
              <div className="space-y-4 pt-4 border-t border-neutral-800">
                <Label className="text-neutral-300 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2">
                  <Clock className="h-4 w-4 text-purple-500"/> 3. Data e Hora
                </Label>
                
                <Input 
                  required 
                  type="date" 
                  min={hojeStr} 
                  value={formData.data} 
                  onChange={e => setFormData({...formData, data: e.target.value})} 
                  className="bg-neutral-950 border-neutral-800 text-white h-12 px-4" 
                  style={{ colorScheme: 'dark' }} 
                />
                
                {formData.data && formData.servicoObj && (
                  <div className="pt-2 animate-in fade-in duration-300">
                    <Label className="text-[10px] text-neutral-500 mb-2 block font-bold uppercase tracking-widest ml-1">Horários Disponíveis:</Label>
                    {loadingHorarios ? (
                      <div className="text-xs text-purple-400 animate-pulse font-medium bg-neutral-950 p-3 rounded-lg text-center border border-neutral-800">
                        Buscando horários para este serviço...
                      </div>
                    ) : horariosLivres.length > 0 ? (
                      <div className="grid grid-cols-4 gap-2">
                        {horariosLivres.map(h => (
                          <button
                            key={h} type="button"
                            onClick={() => setFormData({...formData, hora: h})}
                            className={`p-2 rounded-lg text-sm font-bold border transition-all ${
                              formData.hora === h 
                                ? 'bg-purple-600 text-white border-purple-500 shadow-md scale-[1.02]' 
                                : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:border-purple-500'
                            }`}
                          >
                            {h}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-red-400 bg-red-950/30 p-3 rounded-lg border border-red-900/30 text-center font-bold">
                        Nenhum horário livre para este dia.
                      </div>
                    )}
                  </div>
                )}
                
                {formData.data && !formData.servicoObj && (
                  <div className="text-xs text-amber-400 bg-amber-950/30 p-3 rounded-lg border border-amber-900/30 text-center font-bold">
                    Selecione um serviço primeiro para ver os horários.
                  </div>
                )}
              </div>

              {/* PASSO 4: DADOS PESSOAIS */}
              <div className="space-y-4 pt-4 border-t border-neutral-800">
                <Label className="text-neutral-300 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2">
                  <User className="h-4 w-4 text-purple-500"/> 4. Seus Dados
                </Label>
                <div className="grid grid-cols-1 gap-4">
                  <Input required placeholder="Seu Nome Completo" value={formData.cliente_nome} onChange={e => setFormData({...formData, cliente_nome: e.target.value})} className="bg-neutral-950 border-neutral-800 text-white h-12" />
                  <Input required placeholder="Telefone / WhatsApp" value={formData.cliente_telefone} onChange={e => setFormData({...formData, cliente_telefone: e.target.value})} className="bg-neutral-950 border-neutral-800 text-white h-12" />
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={salvando || !formData.hora || !formData.servicoObj || !formData.cliente_nome} 
                className="w-full bg-purple-700 hover:bg-purple-600 text-white h-14 text-lg font-black shadow-xl shadow-purple-950/40 mt-6 uppercase tracking-tighter"
              >
                {salvando ? 'Processando...' : 'Confirmar Agendamento'}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <p className="mt-8 text-center text-[10px] text-neutral-500 uppercase tracking-widest">
          Desenvolvido por UNV Tech | Agendamento Online v1.0
        </p>
      </main>
    </div>
  );
};

export default AgendamentoPublico;
