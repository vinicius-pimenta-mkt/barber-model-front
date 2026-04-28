import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Lock, UserCircle } from 'lucide-react';
import logo from '../assets/logo.png';

// Importando a imagem de fundo direto da pasta assets
import backgroundImageUrl from '../assets/fundologin.png';

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
    // Container Principal: Aplicando a imagem de fundo responsiva
    <div 
      className="min-h-screen flex flex-col bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: `url(${backgroundImageUrl})` }}
    >
      {/* Camada de sobreposição escura para garantir contraste e legibilidade */}
      <div className="absolute inset-0 bg-neutral-950/70 z-0" />

      {/* CABEÇALHO - semi-transparente para integrar com o fundo */}
      <div className="w-full bg-neutral-950/80 backdrop-blur-sm py-4 px-6 border-b border-purple-900/30 flex items-center justify-between z-10 relative">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Barbearia Mestre Miguel" className="h-10 sm:h-12 w-auto" />
          <div className="flex flex-col">
            <h1 className="text-xl sm:text-2xl font-black text-neutral-50 tracking-tighter leading-none">
              MESTRE MIGUEL
            </h1>
            <span className="text-[10px] sm:text-xs text-purple-300 font-bold uppercase tracking-widest">
              Painel de Controle
            </span>
          </div>
        </div>
      </div>

      {/* CONTEÚDO PRINCIPAL (Área do Formulário) */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 z-10 relative">
        {/* Card de Login: semi-transparente com blur para estilo moderno */}
        <Card className="w-full max-w-md bg-neutral-900/90 border-neutral-800 shadow-2xl shadow-purple-950/20 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-4 text-center">
            <UserCircle className="w-16 h-16 text-purple-500 mx-auto mb-2" />
            <CardTitle className="text-2xl sm:text-3xl font-extrabold text-neutral-50 tracking-tight">
              Acesso ao Sistema
            </CardTitle>
            <p className="text-sm text-neutral-400">
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
                  <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Seu usuário"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="pl-10 bg-neutral-950 border-neutral-800 text-neutral-100 h-12 focus-visible:ring-purple-600"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10 bg-neutral-950 border-neutral-800 text-neutral-100 h-12 focus-visible:ring-purple-600"
                  />
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-purple-700 hover:bg-purple-600 text-white font-bold h-12 text-lg mt-2 shadow-lg shadow-purple-950/30"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Autenticando...
                  </div>
                ) : (
                  'Entrar no Painel'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        {/* RODAPÉ Simples */}
        <p className="mt-8 text-center text-xs text-neutral-500">
          Desenvolvido por Vinicius | Sistema de Gestão Barbearia v1.0
        </p>
      </div>
    </div>
  );
};

// Componente auxiliar de Label local para manter o arquivo auto-contido
const Label = ({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) => (
  <label htmlFor={htmlFor} className="text-sm font-semibold text-neutral-300 ml-1">
    {children}
  </label>
);

export default Login;
