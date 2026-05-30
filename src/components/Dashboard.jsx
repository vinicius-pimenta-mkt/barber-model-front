import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import DashboardContent from './DashboardContent';
import Agenda from './Agenda';
import Clientes from './Clientes';
import Relatorios from './Relatorios';
// import Planos from './Planos';      // <-- ARQUIVO OCULTADO (Comentado)
import Produtos from './Produtos';
import Servicos from './Servicos'; // <-- NOVO IMPORT AQUI

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
      // case 'planos':                  // <-- ROTA OCULTADA (Comentado)
      //   return <Planos user={user} />;// <-- ROTA OCULTADA (Comentado)
      case 'produtos':               
        return <Produtos user={user} />;
      case 'servicos': // <-- NOVA ROTA AQUI
        return <Servicos user={user} />;
      default:
        return <DashboardContent user={user} />;
    }
  };

  return (
    <div className="flex h-screen relative overflow-hidden bg-neutral-950">
      
      {/* IMAGEM DE FUNDO */}
      <img 
        src="/fundologin.png" 
        alt="Fundo Dashboard" 
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      {/* CAMADA DE CINZA COM TRANSPARÊNCIA */}
      <div className="absolute inset-0 bg-gray-500/25 z-0" />

      {/* CONTEÚDO PRINCIPAL (Z-10) */}
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
