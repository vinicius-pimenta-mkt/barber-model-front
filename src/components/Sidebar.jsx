import { 
  LayoutDashboard, 
  Calendar, 
  FileText, 
  Users, 
  LogOut,
  Menu,
  X,
  UserCheck,
  Package,
  Scissors // <-- NOVO ÍCONE
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

const Sidebar = ({ activeSection, onSectionChange, onLogout, user }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isJhonatas = user?.role === 'jhonatas';
  
  // NOME DINÂMICO
  const barberTwoName = localStorage.getItem('barberTwoName') || 'Jhonatas';
  
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'agenda', label: 'Agenda', icon: Calendar },
    { id: 'clientes', label: 'Clientes', icon: Users },
    { id: 'produtos', label: 'Estoque', icon: Package },
    { id: 'relatorios', label: 'Relatórios', icon: FileText },
    ...(!isJhonatas ? [
      { id: 'servicos', label: 'Serviços', icon: Scissors }, // <-- BOTÃO NOVO AQUI
      { id: 'planos', label: 'Planos', icon: UserCheck }
    ] : []),
  ];

  const handleMenuItemClick = (itemId) => { 
    onSectionChange(itemId); 
    setIsMobileMenuOpen(false); 
  };

  return (
    <>
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-neutral-950/90 backdrop-blur-md border-b border-neutral-800 flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-2">
          <img src="/logobranca.png" alt="Logo" className="h-8 w-auto" />
          <span className="text-white font-bold text-sm uppercase tracking-tighter">Miguel Alves</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white">
          {isMobileMenuOpen ? <X /> : <Menu />}
        </Button>
      </div>

      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-neutral-950 border-r border-neutral-800 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-6">
            <div className="flex items-center space-x-3">
              <img src="/logobranca.png" alt="Logo" className="h-10 w-auto" />
              <div>
                <h2 className="text-lg font-black text-white leading-none uppercase tracking-tighter">Miguel Alves</h2>
                <p className="text-[10px] text-[#DEAE60] font-bold uppercase tracking-widest mt-1">Barbershop</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-4 space-y-2 mt-4">
            {menuItems.map((item) => {
              const Icon = item.icon; 
              const isActive = activeSection === item.id;
              return (
                <button 
                  key={item.id} 
                  onClick={() => handleMenuItemClick(item.id)} 
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all ${isActive ? 'bg-[#DEAE60] text-neutral-950 shadow-lg shadow-black/30 font-bold' : 'text-neutral-400 hover:bg-neutral-900 hover:text-neutral-100'}`}
                >
                  <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-neutral-950' : 'text-neutral-500'}`} /> {item.label}
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-neutral-800">
            <div className="flex items-center space-x-3 mb-4 px-2">
              <div className="w-9 h-9 bg-neutral-950 rounded-full flex items-center justify-center border border-[#DEAE60]/30 shadow-inner">
                <span className="text-[#DEAE60] font-bold text-xs uppercase">{isJhonatas ? barberTwoName.charAt(0) : 'MA'}</span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-white truncate uppercase tracking-tighter">
                  {isJhonatas ? barberTwoName : 'Miguel Alves'}
                </p>
                <p className="text-[10px] text-neutral-500 font-medium">{isJhonatas ? 'Barbeiro' : 'Administrador'}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={onLogout} className="w-full bg-transparent border-neutral-800 text-neutral-400 hover:bg-red-950 hover:text-red-400 hover:border-red-900 transition-colors gap-2">
              <LogOut className="h-4 w-4" /> Sair do Sistema
            </Button>
          </div>
        </div>
      </div>
      {isMobileMenuOpen && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />}
    </>
  );
};

export default Sidebar;
