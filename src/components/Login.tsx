import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Lock } from 'lucide-react'; // Removido o UserCircle daqui

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = '/agenda';
      } else {
        setError(data.error || 'Falha na autenticação');
      }
    } catch (err) {
      setError('Erro de conexão com o servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-neutral-950">
      
      {/* IMAGEM DE FUNDO */}
      <img 
        src="/fundologin.png" 
        alt="Fundo" 
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      {/* PELÍCULA COM TRANSPARÊNCIA E LEVE BLUR */}
      <div className="absolute inset-0 bg-neutral-950/10 backdrop-blur-[2px] z-10" />

      {/* CABEÇALHO - BRANDING */}
      <div className="w-full bg-neutral-950/80 backdrop-blur-md py-4 px-6 border-b border-[#DEAE60]/20 flex items-center justify-between z-20 relative">
        <div className="flex items-center gap-3">
          <img src="/logobranca.png" alt="Barbearia do Mineiro" className="h-13 sm:h-12 w-auto" />
          <div className="flex flex-col">
            <h1 className="text-lg sm:text-xl font-bold text-neutral-50 tracking-tighter leading-none uppercase">
              BARBEARIA DO MINEIRO
            </h1>
            <span className="text-[10px] sm:text-xs text-[#DEAE60] font-semibold uppercase tracking-widest mt-0.5">
              Painel de Controle
            </span>
          </div>
        </div>
      </div>

      {/* CONTEÚDO CENTRALIZADO */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 z-20 relative">
        <Card className="w-full max-w-md bg-neutral-900/90 border-neutral-800 shadow-2xl shadow-black/50 backdrop-blur-md overflow-hidden">
          
          {/* CAMADA DE FUNDO DETALHE SUPERIOR */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#DEAE60]" />

          <CardHeader className="space-y-1 pt-8 pb-4 text-center relative">
            
            {/* --- AJUSTE SOLICITADO: ÍCONE DE PERFIL SUBSTITUÍDO PELA LOGO --- */}
            <img 
              src="/logobranca.png" 
              alt="Logo Barbearia do Mineiro" 
              className="w-26 h-auto mx-auto mb-4 drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)]" 
            />
            
            {/* TÍTULO ESTILIZADO CONFORME CABEÇALHO */}
            <div className="flex flex-col items-center text-center">
              <CardTitle className="text-xl sm:text-2xl font-bold text-neutral-50 tracking-tighter leading-none uppercase">
                BARBEARIA DO MINEIRO
              </CardTitle>
              <span className="text-[9px] sm:text-[10px] text-[#DEAE60] font-semibold uppercase tracking-widest mt-1.5">
                ESTILO DE PAI PARA FILHO
              </span>
            </div>

            <p className="text-sm text-neutral-400 mt-4">
              Entre com suas credenciais administrativas
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-5">
              {error && (
                <div className="bg-red-950 border border-red-800 text-red-200 p-3 rounded-lg text-sm font-medium text-center animate-pulse">
                  {error}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="username">Usuário</Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 p-1 bg-neutral-800 rounded-md">
                    <UserCircleIcon className="h-4 w-4 text-neutral-500" />
                  </div>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Seu usuário"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="pl-12 bg-neutral-950 border-neutral-800 text-neutral-100 h-12 focus-visible:ring-1 focus-visible:ring-[#DEAE60] focus-visible:border-[#DEAE60]"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 p-1 bg-neutral-800 rounded-md">
                    <Lock className="h-4 w-4 text-neutral-500" />
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-12 bg-neutral-950 border-neutral-800 text-neutral-100 h-12 focus-visible:ring-1 focus-visible:ring-[#DEAE60] focus-visible:border-[#DEAE60]"
                  />
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-[#DEAE60] hover:bg-[#DEAE60]/90 text-neutral-950 font-bold h-12 text-lg mt-2 shadow-xl shadow-black/30 uppercase tracking-tighter"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-950 border-t-transparent"></div>
                    Autenticando...
                  </div>
                ) : (
                  'Entrar no Painel'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <p className="mt-8 text-center text-xs text-neutral-500 uppercase tracking-widest">
          Desenvolvido por UNV Tech | Sistema de Gestão Barbearia v1.0
        </p>
      </div>
    </div>
  );
};

const Label = ({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) => (
  <label htmlFor={htmlFor} className="text-sm font-semibold text-neutral-300 ml-1">
    {children}
  </label>
);

// Ícone simples para os inputs
const UserCircleIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);


export default Login;
