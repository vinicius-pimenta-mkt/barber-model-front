import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, Calendar, User, Clock } from 'lucide-react';

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
  const [formData, setFormData] = useState({
    cliente_nome: '',
    cliente_telefone: '',
    servico: '',
    servicoObj: null,
    data: '',
    hora: '',
    barber: 'Miguel'
  });

  const [horariosLivres, setHorariosLivres] = useState([]);
  const [loadingHorarios, setLoadingHorarios] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  // Monitora mudança de data e barbeiro para buscar horários
  useEffect(() => {
    if (formData.data && formData.barber) {
      buscarHorariosLivres();
    }
  }, [formData.data, formData.barber]);

  const buscarHorariosLivres = async () => {
    setLoadingHorarios(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/public/horarios-livres?data=${formData.data}&barber=${formData.barber}`);
      if (res.ok) {
        const data = await res.json();
        setHorariosLivres(data.horarios || []);
      } else {
        console.error("Erro na resposta do backend");
      }
    } catch (error) {
      console.error('Erro de conexão:', error);
    } finally {
      setLoadingHorarios(false);
    }
  };

  const handleServicoChange = (valor) => {
    const servicoSelecionado = SERVICOS_TABELA.find(s => s.nome === valor);
    setFormData({ ...formData, servico: valor, servicoObj: servicoSelecionado });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.hora || !formData.servicoObj) return;
    
    setSalvando(true);
    try {
      const precoEmCentavos = Math.round(formData.servicoObj.preco * 100);
      const payload = { 
        ...formData, 
        status: 'Pendente', 
        preco: precoEmCentavos, 
        forma_pagamento: 'Pendente' 
      };
      const endpoint = formData.barber === 'Jhonatas' ? '/api/public/agendar-jhonatas' : '/api/public/agendar-miguel';
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (response.ok) setSucesso(true);
      else alert("Erro ao salvar agendamento.");
    } catch (error) {
      alert('Erro de conexão com o servidor.');
    } finally {
      setSalvando(false);
    }
  };

  if (sucesso) {
    return (
      <div className="min-h-screen flex flex-col relative bg-neutral-950 items-center justify-center p-6">
        <img src="/fundologin.png" className="absolute inset-0 w-full h-full object-cover z-0 opacity-40" alt="fundo" />
        <Card className="w-full max-w-md bg-neutral-900/90 border-neutral-800 backdrop-blur-md z-10 text-center p-8">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Agendamento Realizado!</h2>
          <p className="text-neutral-400 mt-2">Tudo certo, {formData.cliente_nome}. Te esperamos na barbearia!</p>
          <Button onClick={() => window.location.reload()} className="mt-8 bg-purple-700 hover:bg-purple-600 w-full font-bold">Fazer outro agendamento</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative bg-neutral-950 overflow-x-hidden">
      {/* IMAGENS DA PASTA PUBLIC */}
      <img src="/fundologin.png" alt="Fundo" className="fixed inset-0 w-full h-full object-cover z-0" />
      <div className="fixed inset-0 bg-neutral-950/40 backdrop-blur-[3px] z-10" />

      {/* CABEÇALHO PADRÃO LOGIN */}
      <header className="w-full bg-neutral-950/80 backdrop-blur-md py-4 px-6 border-b border-purple-900/30 flex items-center justify-between z-20 relative">
        <div className="flex items-center gap-3 text-left">
          <img src="/logobranca.png" alt="Logo" className="h-10 sm:h-12 w-auto" />
          <div className="flex flex-col">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tighter leading-none uppercase">MIGUEL ALVES</h1>
            <span className="text-[10px] sm:text-xs text-purple-300 font-bold uppercase tracking-widest">BARBERSHOP</span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 z-20 relative">
        <Card className="w-full max-w-lg bg-neutral-900/90 border-neutral-800 shadow-2xl backdrop-blur-md">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-black text-white uppercase tracking-tighter flex items-center justify-center gap-2">
              <Calendar className="text-purple-500 h-6 w-6" /> Agende seu Horário
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-neutral-300 font-bold uppercase text-[10px] tracking-widest ml-1">Seu Nome</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                    <Input 
                      required 
                      value={formData.cliente_nome} 
                      onChange={e => setFormData({...formData, cliente_nome: e.target.value})}
                      placeholder="Nome completo"
                      className="bg-neutral-950 border-neutral-800 text-white pl-10 h-12 focus-visible:ring-purple-600"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-neutral-300 font-bold uppercase text-[10px] tracking-widest ml-1">Telefone</Label>
                  <Input 
                    required 
                    value={formData.cliente_telefone} 
                    onChange={e => setFormData({...formData, cliente_telefone: e.target.value})}
                    placeholder="(00) 00000-0000"
                    className="bg-neutral-950 border-neutral-800 text-white h-12 focus-visible:ring-purple-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-neutral-300 font-bold uppercase text-[10px] tracking-widest ml-1">Serviço</Label>
                  <Select onValueChange={handleServicoChange} required>
                    <SelectTrigger className="bg-neutral-950 border-neutral-800 text-white h-12">
                      <SelectValue placeholder="O que deseja fazer?" />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-900 border-neutral-800 text-white">
                      {SERVICOS_TABELA.map(s => (
                        <SelectItem key={s.nome} value={s.nome}>{s.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-neutral-300 font-bold uppercase text-[10px] tracking-widest ml-1">Barbeiro</Label>
                  <Select value={formData.barber} onValueChange={v => setFormData({...formData, barber: v, data: '', hora: ''})}>
                    <SelectTrigger className="bg-neutral-950 border-neutral-800 text-white h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-900 border-neutral-800 text-white">
                      <SelectItem value="Miguel">Miguel</SelectItem>
                      <SelectItem value="Jhonatas">Jhonatas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.servicoObj && (
                <div className="bg-purple-900/20 border border-purple-500/30 p-4 rounded-xl flex justify-between items-center">
                  <span className="text-neutral-300 text-[10px] font-bold uppercase tracking-widest">Valor Estimado</span>
                  <span className="text-white font-black text-xl">R$ {formData.servicoObj.preco.toFixed(2).replace('.', ',')}</span>
                </div>
              )}

              <div className="space-y-4 pt-4 border-t border-neutral-800">
                <div className="space-y-2">
                  <Label className="text-neutral-300 font-bold uppercase text-[10px] tracking-widest ml-1">Selecione a Data</Label>
                  {/* CAMPO DE DATA COM SUPORTE PARA TEMA ESCURO (COLOR-SCHEME) */}
                  <Input 
                    type="date" 
                    required 
                    value={formData.data} 
                    onChange={e => setFormData({...formData, data: e.target.value, hora: ''})}
                    className="bg-neutral-950 border-neutral-800 text-white h-12 px-4"
                    style={{ colorScheme: 'dark' }} 
                  />
                </div>

                {/* GRADE DE HORÁRIOS - APARECE QUANDO A DATA É ESCOLHIDA */}
                {formData.data && (
                  <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
                    <Label className="text-neutral-300 font-bold uppercase text-[10px] tracking-widest ml-1 flex items-center gap-2">
                      <Clock className="h-3 w-3 text-purple-500" /> Horários Disponíveis
                    </Label>
                    {loadingHorarios ? (
                      <div className="flex justify-center p-4"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div></div>
                    ) : horariosLivres.length > 0 ? (
                      <div className="grid grid-cols-4 gap-2">
                        {horariosLivres.map(h => (
                          <button
                            key={h} type="button"
                            onClick={() => setFormData({...formData, hora: h})}
                            className={`p-2 rounded-lg text-xs font-black border transition-all ${
                              formData.hora === h 
                                ? 'bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-900/40 scale-[1.02]' 
                                : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:border-purple-500'
                            }`}
                          >
                            {h}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-red-400 bg-red-950/30 p-4 rounded-lg border border-red-900/30 text-center font-bold">Nenhum horário livre para este dia. Tente outra data.</p>
                    )}
                  </div>
                )}
              </div>

              <Button 
                type="submit" 
                disabled={salvando || !formData.hora || !formData.servicoObj || !formData.cliente_nome} 
                className="w-full bg-purple-700 hover:bg-purple-600 text-white h-14 text-lg font-black shadow-xl shadow-purple-950/40 mt-4 uppercase tracking-tight"
              >
                {salvando ? 'Processando...' : 'Confirmar Horário'}
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
