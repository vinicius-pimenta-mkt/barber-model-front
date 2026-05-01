import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  Cell,
  PieChart,
  Pie
} from "recharts";
import {
  BarChart3,
  TrendingUp,
  Users,
  Download,
  Calendar,
  User,
  Scissors,
  CreditCard,
  DollarSign,
  Package 
} from "lucide-react";
import { format, subDays } from 'date-fns';

const Relatorios = ({ user }) => {
  const isJhonatas = user?.role === 'jhonatas';
  const [periodo, setPeriodo] = useState("mes");
  const [barber, setBarber] = useState(isJhonatas ? "Jhonatas" : "Geral");
  
  // DADOS DINÁMICOS DE NOMES
  const [barberOneName, setBarberOneName] = useState('Miguel');
  const [barberTwoName, setBarberTwoName] = useState('Jhonatas');

  const [servicosMaisVendidos, setServicosMaisVendidos] = useState([]);
  const [receitaTempos, setReceitaTempos] = useState([]);
  const [frequenciaClientes, setFrequenciaClientes] = useState([]);
  const [agendamentosPeriodo, setAgendamentosPeriodo] = useState([]);
  const [byPayment, setByPayment] = useState([]);
  const [produtosVendidos, setProdutosVendidos] = useState([]);
  
  const [loading, setLoading] = useState(true);

  // EFECTO PARA BUSCAR OS NOMES DOS BARBEIROS
  useEffect(() => {
    const fetchNomes = async () => {
      try {
        const [res1, res2] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_BASE_URL}/api/configuracoes/barberOneName`),
          fetch(`${import.meta.env.VITE_API_BASE_URL}/api/configuracoes/barberTwoName`)
        ]);
        if (res1.ok) {
          const data1 = await res1.json();
          setBarberOneName(data1.valor);
        }
        if (res2.ok) {
          const data2 = await res2.json();
          setBarberTwoName(data2.valor);
        }
      } catch (err) {
        console.error("Erro ao buscar nomes:", err);
      }
    };
    fetchNomes();
  }, []);

  // EFECTO PARA BUSCAR OS DATOS DOS RELATORIOS
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        let apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/relatorios/resumo`;
        let params = `?periodo=${periodo}&barber=${barber}`;

        const today = format(new Date(), 'yyyy-MM-dd');
        const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');

        if (periodo === 'hoje') {
          params = `?data_inicio=${today}&data_fim=${today}&barber=${barber}`;
        } else if (periodo === 'ontem') {
          params = `?data_inicio=${yesterday}&data_fim=${yesterday}&barber=${barber}`;
        }

        const response = await fetch(apiUrl + params, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setServicosMaisVendidos(Array.isArray(data.by_service) ? data.by_service : []);
          setReceitaTempos(Array.isArray(data.receita_detalhada) ? data.receita_detalhada : []);
          setAgendamentosPeriodo(Array.isArray(data.agendamentos) ? data.agendamentos : []);
          setByPayment(Array.isArray(data.by_payment) ? data.by_payment : []);
          setProdutosVendidos(Array.isArray(data.produtos_vendidos) ? data.produtos_vendidos : []);
          
          if (Array.isArray(data.top_clients)) {
            const clientesOrdenados = data.top_clients
              .map(c => ({
                nome: c.name,
                visitas: c.visits,
                gasto: c.spent
              }))
              .sort((a, b) => b.gasto - a.gasto);
            setFrequenciaClientes(clientesOrdenados);
          }
        }
      } catch (err) {
        console.error("Erro ao buscar relatorios:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [periodo, barber]);

  const exportarRelatorio = () => {
    window.print();
  };

  const COLORS = ['#FFD700', '#4CAF50', '#2196F3', '#FF5722', '#9C27B0', '#00BCD4'];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-1">
            {label || payload[0].payload.service || payload[0].payload.forma}
          </p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm flex items-center gap-2" style={{ color: entry.color }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
              {entry.name}: {entry.name.includes('Receita') || entry.name.includes('Valor') || entry.name.includes('Gasto') 
                ? `R$ ${entry.value.toLocaleString('pt-BR', {minimumFractionDigits: 2})}` 
                : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderTabelaServicos = (barbeiroKey, nomeExibicao, data) => {
    const filtrados = data.filter(s => barbeiroKey === 'Miguel' ? s.miguel_qty > 0 : s.jhonatas_qty > 0);
    
    return (
      <div className="space-y-3">
        <h3 className={`font-semibold text-sm flex items-center gap-2 p-2 rounded ${barbeiroKey === 'Miguel' ? 'bg-yellow-50 text-yellow-800' : 'bg-green-50 text-green-800'}`}>
          <User className="h-4 w-4" /> {nomeExibicao}
        </h3>
        <div className="space-y-2">
          {filtrados.length > 0 ? (
            filtrados.map((s, i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                <div>
                  <h4 className="font-medium text-sm">{s.service}</h4>
                  <p className="text-[10px] text-gray-500">
                    Quantidade: {barbeiroKey === 'Miguel' ? s.miguel_qty : s.jhonatas_qty}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-sm text-gray-900">
                    {barbeiroKey === 'Miguel' ? s.miguel_qty : s.jhonatas_qty}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-400 py-4 text-sm italic">Sem servizos para {nomeExibicao}</p>
          )}
        </div>
      </div>
    );
  };

  const totalReceita = byPayment.reduce((acc, curr) => acc + curr.valor, 0);
  const mostrarComissao = isJhonatas || barber === 'Jhonatas';
  const comissaoJhonatas = totalReceita * 0.45;
  const totalProdutos = produtosVendidos.reduce((acc, p) => acc + p.revenue, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* CABECEIRA */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Relatorios Profesionais</h1>
          <p className="text-gray-600">Análise detallada de rendemento e facturación</p>
        </div>
        <Button 
          onClick={exportarRelatorio} 
          variant="outline" 
          className="bg-amber-600 hover:bg-amber-700 text-white border-none font-medium"
        >
          <Download className="h-4 w-4 mr-2" /> Exportar PDF
        </Button>
      </div>

      {/* FILTROS */}
      <div className={`grid grid-cols-1 ${!isJhonatas ? 'md:grid-cols-2' : ''} gap-4 no-print`}>
        <Card className="shadow-sm">
          <CardContent className="pt-6 flex items-center gap-4">
            <Calendar className="h-5 w-5 text-amber-600" />
            <div className="flex-1">
              <label className="text-xs font-semibold text-gray-500 uppercase">Período</label>
              <Select value={periodo} onValueChange={setPeriodo}>
                <SelectTrigger className="border-none shadow-none p-0 h-auto font-semibold focus:ring-0 text-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hoje">Hoxe</SelectItem>
                  <SelectItem value="ontem">Onte</SelectItem>
                  <SelectItem value="semana">Última Semana</SelectItem>
                  <SelectItem value="mes">Último Mes</SelectItem>
                  <SelectItem value="ano">Último Ano</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
        
        {!isJhonatas && (
          <Card className="shadow-sm">
            <CardContent className="pt-6 flex items-center gap-4">
              <User className="h-5 w-5 text-amber-600" />
              <div className="flex-1">
                <label className="text-xs font-semibold text-gray-500 uppercase">Barbeiro</label>
                <Select value={barber} onValueChange={setBarber}>
                  <SelectTrigger className="border-none shadow-none p-0 h-auto font-semibold focus:ring-0 text-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Geral">Xeral (Todos)</SelectItem>
                    <SelectItem value="Miguel">{barberOneName}</SelectItem>
                    <SelectItem value="Jhonatas">{barberTwoName}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* SECCIÓNS (TABS) */}
      <Tabs defaultValue="receita" className="space-y-6">
        <TabsList className="bg-gray-100 p-1 rounded-xl no-print">
          <TabsTrigger value="servicos" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm font-medium">
            Servizos
          </TabsTrigger>
          <TabsTrigger value="receita" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm font-medium">
            Facturación
          </TabsTrigger>
          <TabsTrigger value="clientes" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm font-medium">
            Clientes
          </TabsTrigger>
        </TabsList>

        {/* TAB: SERVIZOS */}
        <TabsContent value="servicos" className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-amber-600" /> Desempeño por Servizo
              </CardTitle>
            </CardHeader>
            <CardContent>
              {servicosMaisVendidos.length > 0 ? (
                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={servicosMaisVendidos} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="service" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                      <Tooltip content={<CustomTooltip />} cursor={{fill: '#f8f8f8'}} />
                      <Legend iconType="circle" wrapperStyle={{paddingTop: '20px'}} />
                      
                      {(barber === 'Geral' || barber === 'Miguel') && (
                        <Bar name={barberOneName} dataKey="miguel_qty" fill="#FFD700" radius={[4, 4, 0, 0]} barSize={barber === 'Geral' ? 30 : 50} />
                      )}
                      {(barber === 'Geral' || barber === 'Jhonatas') && (
                        <Bar name={barberTwoName} dataKey="jhonatas_qty" fill="#4CAF50" radius={[4, 4, 0, 0]} barSize={barber === 'Geral' ? 30 : 50} />
                      )}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[350px] flex flex-col items-center justify-center text-gray-400">
                  <Scissors className="h-12 w-12 mb-2 opacity-20" />
                  <p>Sen datos para amosar o gráfico</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Detalle</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`grid grid-cols-1 ${!isJhonatas ? 'md:grid-cols-2' : ''} gap-8`}>
                {!isJhonatas && renderTabelaServicos('Miguel', barberOneName, servicosMaisVendidos)}
                {renderTabelaServicos('Jhonatas', barberTwoName, servicosMaisVendidos)}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: FACTURACIÓN */}
        <TabsContent value="receita" className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <TrendingUp className="h-5 w-5 text-green-600" /> Evolución da Receita {periodo === 'hoje' || periodo === 'ontem' ? '(Por Hora)' : ''}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {receitaTempos.length > 0 ? (
                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={receitaTempos} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="periodo" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} tickFormatter={(val) => `R$${val}`} />
                      <Tooltip 
                        formatter={(value) => [`R$ ${value.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`, 'Receita']}
                        contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="valor" 
                        stroke="#10b981" 
                        strokeWidth={3} 
                        dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                        activeDot={{ r: 6, strokeWidth: 0 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[350px] flex flex-col items-center justify-center text-gray-400 italic">
                  Ningunha facturación rexistrada no período seleccionado.
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Resumo Financeiro (Servizos)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {byPayment.map((p, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[i % COLORS.length]}}></div>
                        <span className="text-sm font-medium">{p.forma}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-sm">
                          R$ {p.valor.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                        </p>
                        {p.quantidade > 0 && <p className="text-[10px] text-gray-500">{p.quantidade} servizos</p>}
                      </div>
                    </div>
                  ))}
                  
                  <div className="pt-4 mt-2 border-t border-dashed border-gray-300 space-y-3">
                    <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-100">
                      <div className="flex items-center gap-3">
                        <DollarSign className="h-5 w-5 text-amber-600" />
                        <span className="text-sm font-bold text-amber-900">
                          TOTAL BRUTO (SERVIZOS)
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-amber-700">
                          R$ {totalReceita.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                        </p>
                      </div>
                    </div>

                    {mostrarComissao && (
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
                        <div className="flex items-center gap-3">
                          <Badge className="bg-green-600 font-medium">45%</Badge>
                          <span className="text-sm font-bold text-green-900">
                            COMISIÓN {barberTwoName.toUpperCase()}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg text-green-700">
                            R$ {comissaoJhonatas.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                  <CreditCard className="h-5 w-5 text-blue-600" /> Pagamentos (Servizos)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {byPayment.length > 0 ? (
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={byPayment}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="valor"
                          nameKey="forma"
                        >
                          {byPayment.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v) => `R$ ${v.toLocaleString('pt-BR')}`} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-center text-gray-400 py-10 italic">Sen datos de pagamento.</p>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-sm mt-6 border-amber-200">
            <CardHeader className="bg-amber-50/50">
              <CardTitle className="text-lg font-semibold flex items-center gap-2 text-amber-900">
                <Package className="h-5 w-5 text-amber-600" /> Produtos Vendidos no Período
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {produtosVendidos.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 uppercase font-semibold">
                      <tr>
                        <th className="px-6 py-4">Produto</th>
                        <th className="px-6 py-4 text-center">Pagamento</th>
                        <th className="px-6 py-4 text-center">Unidades</th>
                        <th className="px-6 py-4 text-right">Receita Xerada</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {produtosVendidos.map((p, i) => (
                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 font-medium text-gray-900">{p.produto}</td>
                          <td className="px-6 py-4 text-center">
                            <Badge variant="secondary" className="bg-gray-100 text-gray-600 font-normal">{p.forma_pagamento}</Badge>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <Badge variant="outline" className="bg-white shadow-sm font-medium">{p.qty}</Badge>
                          </td>
                          <td className="px-6 py-4 text-right font-semibold text-green-600">
                            R$ {p.revenue.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-amber-100/50 font-bold border-t-2 border-amber-200">
                      <tr>
                        <td colSpan="3" className="px-6 py-4 text-right text-amber-900">TOTAL EN VENDAS DE PRODUTOS:</td>
                        <td className="px-6 py-4 text-right text-amber-700 text-lg">
                          R$ {totalProdutos.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <p className="text-center text-gray-400 py-6 italic">Ningún produto foi vendido neste período.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: CLIENTES */}
        <TabsContent value="clientes" className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <Users className="h-5 w-5 text-amber-600" /> Top 10 Clientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {frequenciaClientes.map((c, i) => (
                  <div key={i} className="flex items-center justify-between p-4 border rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 font-bold">
                        {i + 1}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{c.nome}</h4>
                        <p className="text-xs text-gray-500">{c.visitas} visitas no período</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400 uppercase font-semibold">Total Gasto</p>
                      <p className="text-lg font-bold text-amber-600">
                        R$ {c.gasto.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                      </p>
                    </div>
                  </div>
                ))}
                {frequenciaClientes.length === 0 && (
                  <div className="text-center py-10 text-gray-400 italic">Ningún cliente rexistrado no período.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Relatorios;
