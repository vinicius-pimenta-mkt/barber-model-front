import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Phone, 
  Mail,
  Search,
  CalendarDays
} from 'lucide-react';

const Clientes = ({ user }) => {
  const isJhonatas = user?.role === 'jhonatas';
  
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    email: '',
    data_aniversario: '' // <-- CAMPO DE ANIVERSÁRIO
  });

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/clientes`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setClientes(data);
      }
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const url = editingCliente 
        ? `${import.meta.env.VITE_API_BASE_URL}/api/clientes/${editingCliente.id}`
        : `${import.meta.env.VITE_API_BASE_URL}/api/clientes`;
      
      const method = editingCliente ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        fetchClientes();
        setDialogOpen(false);
        resetForm();
      }
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja remover este cliente?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/clientes/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchClientes();
      }
    } catch (error) {
      console.error('Erro ao remover cliente:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      telefone: '',
      email: '',
      data_aniversario: ''
    });
    setEditingCliente(null);
  };

  const openEditDialog = (cliente) => {
    setEditingCliente(cliente);
    setFormData({
      nome: cliente.nome,
      telefone: cliente.telefone || '',
      email: cliente.email || '',
      data_aniversario: cliente.data_aniversario || ''
    });
    setDialogOpen(true);
  };

  const filteredClientes = clientes.filter(cliente =>
    cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.telefone?.includes(searchTerm) ||
    cliente.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.data_aniversario?.includes(searchTerm)
  );

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
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">Clientes</h1>
          <p className="text-neutral-200 font-medium drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] mt-1">Gerencie os clientes da barbearia</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="w-full sm:w-auto bg-[#DEAE60] hover:bg-[#DEAE60]/90 text-neutral-950 font-bold shadow-lg shadow-black/20">
              <Plus className="h-4 w-4 mr-2" />
              Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-white border-gray-200">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold uppercase tracking-tight text-gray-900">
                {editingCliente ? 'Editar Cliente' : 'Novo Cliente'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome" className="text-gray-600 font-bold uppercase tracking-widest text-[10px]">Nome Completo</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  required
                  className="bg-gray-50 border-gray-200 text-gray-900 focus-visible:ring-1 focus-visible:ring-[#DEAE60]"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="telefone" className="text-gray-600 font-bold uppercase tracking-widest text-[10px]">Telefone</Label>
                  <Input
                    id="telefone"
                    value={formData.telefone}
                    onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                    placeholder="(00) 00000-0000"
                    className="bg-gray-50 border-gray-200 text-gray-900 focus-visible:ring-1 focus-visible:ring-[#DEAE60]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="aniversario" className="text-gray-600 font-bold uppercase tracking-widest text-[10px]">Aniversário</Label>
                  <Input
                    id="aniversario"
                    placeholder="Ex: 25/05"
                    maxLength={5}
                    value={formData.data_aniversario}
                    onChange={(e) => {
                      let val = e.target.value.replace(/\D/g, ''); 
                      if (val.length > 2) val = val.substring(0, 2) + '/' + val.substring(2, 4);
                      setFormData({...formData, data_aniversario: val});
                    }}
                    className="bg-gray-50 border-gray-200 text-gray-900 focus-visible:ring-1 focus-visible:ring-[#DEAE60]"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-600 font-bold uppercase tracking-widest text-[10px]">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="cliente@email.com"
                  className="bg-gray-50 border-gray-200 text-gray-900 focus-visible:ring-1 focus-visible:ring-[#DEAE60]"
                />
              </div>
              
              <div className="flex justify-end space-x-2 pt-4 border-t border-gray-100">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="bg-white border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900">
                  Cancelar
                </Button>
                <Button type="submit" className="bg-[#DEAE60] hover:bg-[#DEAE60]/90 text-neutral-950 font-bold">
                  {editingCliente ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* BARRA DE PESQUISA (BRANCO COM VIDRO FOSCO) */}
      <Card className="bg-white/90 backdrop-blur-md border-white/40 shadow-xl overflow-hidden">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Pesquisar clientes por nome, telefone, email ou aniversário..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/60 border-gray-200 text-gray-900 focus-visible:ring-1 focus-visible:ring-[#DEAE60] placeholder:text-gray-400"
            />
          </div>
        </CardContent>
      </Card>

      {/* LISTA DE CLIENTES (BRANCO COM VIDRO FOSCO) */}
      <Card className="bg-white/90 backdrop-blur-md border-white/40 shadow-xl overflow-hidden">
        <CardHeader className="border-b border-gray-200/50 bg-white/50">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl font-bold uppercase tracking-tight text-gray-900">
            <Users className="h-5 w-5 text-[#DEAE60]" />
            Lista de Clientes ({filteredClientes.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2 sm:p-6">
          {filteredClientes.length === 0 ? (
            <p className="text-center text-gray-500 py-8 font-medium">
              {searchTerm ? 'Nenhum cliente encontrado para a pesquisa' : 'Nenhum cliente cadastrado'}
            </p>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {filteredClientes.map((cliente) => (
                <div key={cliente.id} className="flex items-center justify-between p-3 sm:p-4 bg-white/60 hover:bg-white/80 border border-gray-100 shadow-sm rounded-xl transition-all">
                  <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
                    
                    {/* AVATAR DOURADO */}
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-neutral-950 rounded-full flex items-center justify-center shrink-0 border border-[#DEAE60]/30 shadow-inner">
                      <span className="text-[#DEAE60] font-black text-sm sm:text-base uppercase">
                        {cliente.nome?.charAt(0) || 'C'}
                      </span>
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-gray-900 truncate text-sm sm:text-base">{cliente.nome}</h3>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1">
                        {cliente.telefone && (
                          <div className="flex items-center text-xs sm:text-sm text-gray-600 font-medium">
                            <Phone className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 shrink-0 text-[#DEAE60]" />
                            <span className="whitespace-nowrap">{cliente.telefone}</span>
                          </div>
                        )}
                        
                        {/* NOVO CAMPO: DATA DE ANIVERSÁRIO COM ÍCONE DE CALENDÁRIO */}
                        {cliente.data_aniversario && (
                          <div className="flex items-center text-xs sm:text-sm text-gray-600 font-medium">
                            <CalendarDays className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 shrink-0 text-[#DEAE60]" />
                            <span className="whitespace-nowrap">{cliente.data_aniversario}</span>
                          </div>
                        )}

                        {cliente.email && (
                          <div className="flex items-center text-xs sm:text-sm text-gray-600 font-medium break-all">
                            <Mail className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 shrink-0 text-[#DEAE60]" />
                            <span className="leading-tight">{cliente.email}</span>
                          </div>
                        )}
                      </div>

                      <p className="text-[10px] sm:text-[11px] text-gray-400 mt-2 font-medium uppercase tracking-widest">
                        Cadastrado em {new Date(cliente.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  
                  {!isJhonatas && (
                  <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 ml-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 sm:h-9 sm:w-9 px-0 text-[#DEAE60] hover:bg-[#DEAE60]/10 hover:text-[#DEAE60] rounded-full"
                      onClick={() => openEditDialog(cliente)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 sm:h-9 sm:w-9 px-0 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-full"
                      onClick={() => handleDelete(cliente.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Clientes;
