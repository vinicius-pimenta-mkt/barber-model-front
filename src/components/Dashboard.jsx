import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import DashboardContent from './DashboardContent';
import Agenda from './Agenda';
import Clientes from './Clientes';
import Relatorios from './Relatorios';
import Planos from './Planos';
import Produtos from './Produtos';

const Dashboard = ({ user, onLogout }) => {
  const [activeSection, setActiveSection] = useState('dashboard');

  const renderContent = () => {
    switch (activeSection) {
      case 'agenda':
        return <Agenda user={user} />;
      case 'clientes':
        return <Clientes user={user} />;
      case 'relatorios':
        return <Relatorios user={user} />;
      case 'planos':
        return <Planos user={user} />;
      case 'produtos':               
        return <Produtos user={user} />;
      default:
        return <DashboardContent user={user} />;
    }
  };

  return (
    // 1. Container com position relative e overflow hidden
    <div className="flex h-screen relative overflow-hidden bg-neutral-950">
      
      {/* 2. A IMAGEM DE FUNDO (A mesma do Login) */}
      <img 
        src="/fundologin.png" 
        alt="Fundo Dashboard" 
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      {/* 3. CAMADA DE CINZA 30% COM 25% DE TRANSPARÊNCIA */}
      {/* bg-gray-500 representa o cinza e /25 representa a opacidade */}
      <div className="absolute inset-0 bg-gray-500/25 z-0" />

      {/* 4. CONTEÚDO PRINCIPAL (Z-10 para ficar em cima do fundo) */}
      <div className="flex w-full h-full relative z-10">
        <Sidebar 
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          onLogout={onLogout}
          user={user}
        />
        <main className="flex-1 overflow-auto lg:ml-0">
          <div className="p-4 lg:p-8 pt-16 lg:pt-8">
            {renderContent()}
          </div>
        </main>
      </div>
      
    </div>
  );
};

export default Dashboard;
