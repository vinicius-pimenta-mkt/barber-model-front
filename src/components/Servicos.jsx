import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Scissors, Plus, Edit, Trash2 } from 'lucide-react';

const Servicos = () => {
  const [servicos, setServicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [servicoEdit, setServicoEdit] = useState(null);
  
  const [formData, setFormData] = useState({ nome: '', preco: '' });

  useEffect(() => { fetchServicos(); }, []);

  const fetchServicos = async () => {
    try {
      const token = localStorage.getItem('token');
      // CHAMA A NOVA ROTA DO BACKEND
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/servicos`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setServicos(await res.json());
      } else {
        // Se a rota ainda não existir, evita quebrar a tela
        setServicos([]);
      }
    } catch (e) { 
      console.error(e); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleCreateOrEdit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = servicoEdit 
        ? `${import.meta.env.VITE_API_BASE_URL}/api/servicos/${servicoEdit.id}` 
        : `${import.meta.env.VITE_API_BASE_URL}/api/servicos`;
        
      const res = await fetch(url, {
        method: servicoEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) { 
        fetchServicos(); 
        setDialogOpen(false); 
        setFormData({nome:'', preco:''}); 
        setServicoEdit(null); 
      } else {
        alert("Erro ao salvar o serviço. Verifique a conexão com o servidor.");
      }
    } catch (e) { 
      console.error(e); 
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Deseja realmente excluir este serviço? Ele sumirá da agenda.')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/servicos/${id}`, { 
        method: 'DELETE', 
        headers: { 'Authorization': `Bearer ${token}` } 
      });
      if (res.ok) fetchServicos();
    } catch (e) { 
      console.error(e); 
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center h-64 items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#DEAE60]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pt-8 sm:pt-4">
      
      {/* CABEÇALHO */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            Tabela de Serviços
          </h1>
          <p className="text-neutral-200 font-medium drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] mt-1">
            Gerencie os cortes, barbas e procedimentos da barbearia
          </p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={(v) => { setDialogOpen(v); if(!v) { setServicoEdit(null); setFormData({nome:'', preco:''}); }}}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto bg-[#DEAE60] hover:bg-[#DEAE60]/90 text-neutral-950 font-bold shadow-lg shadow-black/20">
              <Plus className="h-4 w-4 mr-2" /> Novo Serviço
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-white border-gray-200">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold uppercase tracking-tight text-gray-900">
                {servicoEdit ? 'Editar Serviço' : 'Cadastrar Serviço'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateOrEdit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label className="text-gray-600 font-bold uppercase tracking-widest text-[10px]">Nome do Serviço</Label>
                <Input required value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} placeholder="Ex: Corte Degradê" className="bg-gray-50 border-gray-200 text-gray-900 focus-visible:ring-1 focus-visible:ring-[#DEAE60]" />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-600 font-bold uppercase tracking-widest text-[10px]">Preço (R$)</Label>
                <Input required value={formData.preco} onChange={e => setFormData({...formData, preco: e.target.value})} placeholder="35,00" className="bg-gray-50 border-gray-200 text-gray-900 focus-visible:ring-1 focus-visible:ring-[#DEAE60]" />
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="bg-white border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900">Cancelar</Button>
                <Button type="submit" className="bg-[#DEAE60] hover:bg-[#DEAE60]/90 text-neutral-950 font-bold">Salvar</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* LISTA DE SERVIÇOS */}
      <Card className="bg-white/90 backdrop-blur-md border-white/40 shadow-xl overflow-hidden">
        <CardHeader className="border-b border-gray-200/50 bg-white/50">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl font-bold uppercase tracking-tight text-gray-900">
            <Scissors className="h-5 w-5 text-[#DEAE60]" />
            Serviços Ofertados ({servicos.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50/50 text-gray-500 uppercase text-[10px] sm:text-xs">
                <tr>
                  <th className="px-4 sm:px-6 py-4 font-bold tracking-widest">Serviço</th>
                  <th className="px-4 sm:px-6 py-4 font-bold tracking-widest">Preço Padrão</th>
                  <th className="px-4 sm:px-6 py-4 font-bold tracking-widest text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {servicos.map(s => (
                  <tr key={s.id} className="hover:bg-white transition-colors bg-white/40">
                    <td className="px-4 sm:px-6 py-4 sm:py-5 font-bold text-gray-900">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-8 h-8 rounded bg-neutral-950 flex items-center justify-center shrink-0 border border-[#DEAE60]/30 shadow-inner hidden sm:flex">
                          <Scissors className="h-4 w-4 text-[#DEAE60]" />
                        </div>
                        <span className="truncate">{s.nome}</span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 sm:py-5 font-black text-gray-900 text-sm sm:text-base whitespace-nowrap">
                      R$ {typeof s.preco === 'number' ? (s.preco / 100).toLocaleString('pt-BR', {minimumFractionDigits: 2}) : s.preco}
                    </td>
                    <td className="px-4 sm:px-6 py-4 sm:py-5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-[#DEAE60] hover:bg-[#DEAE60]/10 hover:text-[#DEAE60]" onClick={() => { setServicoEdit(s); setFormData({ nome: s.nome, preco: typeof s.preco === 'number' ? (s.preco/100).toString().replace('.',',') : s.preco}); setDialogOpen(true); }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600" onClick={() => handleDelete(s.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {servicos.length === 0 && (
              <div className="p-12 text-center text-gray-500 font-medium">
                Nenhum serviço cadastrado. Clique no botão acima para adicionar.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Servicos;
