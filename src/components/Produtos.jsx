import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, Plus, Minus, Edit, Trash2, ShoppingCart, PackagePlus, DollarSign } from 'lucide-react';

const Produtos = () => {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [movDialogOpen, setMovDialogOpen] = useState(false);
  
  const [produtoEdit, setProdutoEdit] = useState(null);
  const [movType, setMovType] = useState('venda'); // 'venda' ou 'compra'
  
  const [formData, setFormData] = useState({ nome: '', preco: '', estoque: '' });
  const [movData, setMovData] = useState({ quantidade: 1, forma_pagamento: 'Dinheiro' });

  const formasPagamento = ['Pix', 'Dinheiro', 'Cartão de Débito', 'Cartão de Crédito'];

  useEffect(() => { fetchProdutos(); }, []);

  const fetchProdutos = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/produtos`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setProdutos(await res.json());
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleCreateOrEdit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = produtoEdit ? `${import.meta.env.VITE_API_BASE_URL}/api/produtos/${produtoEdit.id}` : `${import.meta.env.VITE_API_BASE_URL}/api/produtos`;
      const res = await fetch(url, {
        method: produtoEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      if (res.ok) { fetchProdutos(); setDialogOpen(false); setFormData({nome:'', preco:'', estoque:''}); setProdutoEdit(null); }
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Deseja excluir este produto?')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/produtos/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      fetchProdutos();
    } catch (e) { console.error(e); }
  };

  const handleMovimentacao = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/produtos/${produtoEdit.id}/movimentar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ tipo: movType, quantidade: movData.quantidade, forma_pagamento: movData.forma_pagamento })
      });
      
      if (res.ok) {
        fetchProdutos();
        setMovDialogOpen(false);
        alert(`${movType === 'venda' ? 'Venda' : 'Compra'} registrada!`);
      } else {
        const error = await res.json();
        alert(error.error);
      }
    } catch (e) { console.error(e); }
  };

  const openMovDialog = (produto, tipo) => {
    setProdutoEdit(produto);
    setMovType(tipo);
    setMovData({ quantidade: 1, forma_pagamento: 'Dinheiro' });
    setMovDialogOpen(true);
  };

  const valorTotalMov = produtoEdit ? ((produtoEdit.preco / 100) * movData.quantidade).toLocaleString('pt-BR', {minimumFractionDigits:2}) : '0,00';

  if (loading) {
    return (
      <div className="flex justify-center h-64 items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#DEAE60]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pt-8 sm:pt-4">
      
      {/* CABEÇALHO RESPONSIVO COM SHADOW NO TEXTO PARA LEITURA FÁCIL */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            Estoque e Produtos
          </h1>
          <p className="text-neutral-200 font-medium drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] mt-1">
            Controle vendas e compras de produtos da barbearia
          </p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={(v) => { setDialogOpen(v); if(!v) { setProdutoEdit(null); setFormData({nome:'', preco:'', estoque:''}); }}}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto bg-[#DEAE60] hover:bg-[#DEAE60]/90 text-neutral-950 font-bold shadow-lg shadow-black/20">
              <Plus className="h-4 w-4 mr-2" /> Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-white border-gray-200">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold uppercase tracking-tight text-gray-900">
                {produtoEdit ? 'Editar Produto' : 'Cadastrar Produto'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateOrEdit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label className="text-gray-600 font-bold uppercase tracking-widest text-[10px]">Nome do Produto</Label>
                <Input required value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} placeholder="Ex: Pomada Efeito Matte" className="bg-gray-50 border-gray-200 text-gray-900 focus-visible:ring-1 focus-visible:ring-[#DEAE60]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-600 font-bold uppercase tracking-widest text-[10px]">Preço de Venda (R$)</Label>
                  <Input required value={formData.preco} onChange={e => setFormData({...formData, preco: e.target.value})} placeholder="35,00" className="bg-gray-50 border-gray-200 text-gray-900 focus-visible:ring-1 focus-visible:ring-[#DEAE60]" />
                </div>
                {!produtoEdit && (
                  <div className="space-y-2">
                    <Label className="text-gray-600 font-bold uppercase tracking-widest text-[10px]">Estoque Inicial</Label>
                    <Input type="number" value={formData.estoque} onChange={e => setFormData({...formData, estoque: e.target.value})} placeholder="0" className="bg-gray-50 border-gray-200 text-gray-900 focus-visible:ring-1 focus-visible:ring-[#DEAE60]" />
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="bg-white border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900">Cancelar</Button>
                <Button type="submit" className="bg-[#DEAE60] hover:bg-[#DEAE60]/90 text-neutral-950 font-bold">Salvar</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* LISTA DE PRODUTOS (BRANCO COM VIDRO FOSCO E MAIS ESPAÇAMENTO NAS CÉLULAS) */}
      <Card className="bg-white/90 backdrop-blur-md border-white/40 shadow-xl overflow-hidden">
        <CardHeader className="border-b border-gray-200/50 bg-white/50">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl font-bold uppercase tracking-tight text-gray-900">
            <Package className="h-5 w-5 text-[#DEAE60]" />
            Inventário Atual ({produtos.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50/50 text-gray-500 uppercase text-[10px] sm:text-xs">
                <tr>
                  <th className="px-3 sm:px-5 py-4 font-bold tracking-widest">Produto</th>
                  <th className="px-3 sm:px-5 py-4 font-bold tracking-widest text-center">Estoque</th>
                  <th className="px-3 sm:px-5 py-4 font-bold tracking-widest">Preço</th>
                  <th className="px-3 sm:px-5 py-4 font-bold tracking-widest text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {produtos.map(p => (
                  <tr key={p.id} className="hover:bg-white transition-colors bg-white/40">
                    <td className="px-3 sm:px-5 py-4 sm:py-5 font-bold text-gray-900">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-8 h-8 rounded bg-neutral-950 flex items-center justify-center shrink-0 border border-[#DEAE60]/30 shadow-inner hidden sm:flex">
                          <Package className="h-4 w-4 text-[#DEAE60]" />
                        </div>
                        <span className="truncate max-w-[100px] sm:max-w-[300px] leading-tight">{p.nome}</span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-5 py-4 sm:py-5 text-center">
                      <Badge variant={p.estoque > 5 ? 'outline' : 'destructive'} className={`text-[9px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 uppercase tracking-widest ${p.estoque > 5 ? 'bg-green-50 text-green-700 border-green-200' : ''}`}>
                        {p.estoque} <span className="hidden lg:inline ml-1">unid.</span>
                      </Badge>
                    </td>
                    <td className="px-3 sm:px-5 py-4 sm:py-5 font-black text-gray-900 text-sm sm:text-base whitespace-nowrap">
                      R$ {(p.preco / 100).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                    </td>
                    <td className="px-3 sm:px-5 py-4 sm:py-5 text-right">
                      {/* BOTÕES DE AÇÕES COM ÍCONES REDUZIDOS (h-3 w-3) */}
                      <div className="flex flex-col sm:flex-row items-end sm:items-center justify-end gap-1.5">
                        
                        <div className="flex gap-1.5">
                          <Button 
                            variant="outline" 
                            className="h-8 px-2 sm:h-9 sm:px-3 text-[10px] sm:text-xs font-bold border-green-200 text-green-700 bg-green-50 hover:bg-green-100 hover:text-green-800"
                            onClick={() => openMovDialog(p, 'venda')}
                          >
                            <ShoppingCart className="h-3 w-3 sm:mr-1.5" /> 
                            <span className="hidden md:inline">Vender</span>
                          </Button>
                          <Button 
                            variant="outline" 
                            className="h-8 px-2 sm:h-9 sm:px-3 text-[10px] sm:text-xs font-bold border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 hover:text-blue-800"
                            onClick={() => openMovDialog(p, 'compra')}
                          >
                            <PackagePlus className="h-3 w-3 sm:mr-1.5" /> 
                            <span className="hidden md:inline">Comprar</span>
                          </Button>
                        </div>

                        <div className="flex items-center gap-1 mt-1 sm:mt-0 sm:ml-2 sm:pl-2 sm:border-l border-gray-200">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-[#DEAE60] hover:bg-[#DEAE60]/10 hover:text-[#DEAE60]" onClick={() => { setProdutoEdit(p); setFormData({ nome: p.nome, preco: (p.preco/100).toString().replace('.',',')}); setDialogOpen(true); }}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600" onClick={() => handleDelete(p.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {produtos.length === 0 && <div className="p-12 text-center text-gray-500 font-medium">Nenhum produto cadastrado no momento.</div>}
          </div>
        </CardContent>
      </Card>

      {/* MODAL DE COMPRA / VENDA (TEMA CLARO) */}
      <Dialog open={movDialogOpen} onOpenChange={setMovDialogOpen}>
        <DialogContent className="sm:max-w-[400px] bg-white border-gray-200">
          <DialogHeader>
            <DialogTitle className={`flex items-center gap-2 text-xl font-bold uppercase tracking-tight ${movType === 'venda' ? 'text-green-600' : 'text-blue-600'}`}>
              {movType === 'venda' ? <ShoppingCart className="h-5 w-5" /> : <PackagePlus className="h-5 w-5" />} 
              {movType === 'venda' ? 'Nova Venda' : 'Entrada de Estoque'}
            </DialogTitle>
          </DialogHeader>
          {produtoEdit && (
            <form onSubmit={handleMovimentacao} className="space-y-6 pt-4">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-center">
                <h3 className="font-bold text-lg text-gray-900">{produtoEdit.nome}</h3>
                <p className="text-gray-500 text-sm font-medium mt-1">Estoque atual: <span className="font-bold text-gray-700">{produtoEdit.estoque}</span> unidades</p>
              </div>

              <div className="space-y-3">
                <Label className="text-center block text-gray-600 font-bold uppercase tracking-widest text-[10px]">Quantidade</Label>
                <div className="flex items-center justify-center gap-4">
                  <Button type="button" variant="outline" size="icon" className="h-10 w-10 border-gray-200 hover:bg-gray-100" onClick={() => setMovData({...movData, quantidade: Math.max(1, movData.quantidade - 1)})}><Minus className="h-4 w-4 text-gray-600" /></Button>
                  <Input type="number" min="1" className="text-center w-24 h-12 text-xl font-black bg-gray-50 border-gray-200 text-gray-900 focus-visible:ring-1 focus-visible:ring-[#DEAE60]" value={movData.quantidade} onChange={e => setMovData({...movData, quantidade: parseInt(e.target.value) || 1})} />
                  <Button type="button" variant="outline" size="icon" className="h-10 w-10 border-gray-200 hover:bg-gray-100" onClick={() => setMovData({...movData, quantidade: movData.quantidade + 1})}><Plus className="h-4 w-4 text-gray-600" /></Button>
                </div>
              </div>

              {movType === 'venda' && (
                <div className="space-y-2">
                  <Label className="text-gray-600 font-bold uppercase tracking-widest text-[10px]">Forma de Pagamento</Label>
                  <Select value={movData.forma_pagamento} onValueChange={v => setMovData({...movData, forma_pagamento: v})}>
                    <SelectTrigger className="bg-gray-50 border-gray-200 text-gray-900 focus-visible:ring-1 focus-visible:ring-[#DEAE60] h-12"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-white border-gray-200 text-gray-900">
                      {formasPagamento.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center bg-neutral-950 text-white p-5 rounded-xl shadow-lg border border-[#DEAE60]/20">
                  <span className="font-bold text-[#DEAE60] uppercase tracking-widest text-[10px]">Valor Total</span>
                  <span className="font-black text-3xl">R$ {valorTotalMov}</span>
                </div>
              </div>

              <Button type="submit" className={`w-full h-14 text-lg font-black uppercase tracking-tighter shadow-lg ${movType === 'venda' ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
                Finalizar {movType === 'venda' ? 'Venda' : 'Compra'}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Produtos;
