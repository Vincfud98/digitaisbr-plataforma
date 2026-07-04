import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import ptBR from 'antd/locale/pt_BR';
import ErrorBoundary from './components/ErrorBoundary';
import AppLayout from './components/layout/AppLayout';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import AssociadosListPage from './pages/associados/AssociadosListPage';
import AssociadoFormPage from './pages/associados/AssociadoFormPage';
import AssociadoDetailPage from './pages/associados/AssociadoDetailPage';
import PlanosPage from './pages/planos/PlanosPage';
import CatalogoListPage from './pages/catalogo/CatalogoListPage';
import ProdutoFormPage from './pages/catalogo/ProdutoFormPage';
import ProdutoDetailPage from './pages/catalogo/ProdutoDetailPage';
import LojasListPage from './pages/lojas/LojasListPage';
import LojaConfigPage from './pages/lojas/LojaConfigPage';
import LojaPreviewPage from './pages/lojas/LojaPreviewPage';
import VendasPage from './pages/vendas/VendasPage';
import ComissoesPage from './pages/comissoes/ComissoesPage';
import FinanceiroPage from './pages/financeiro/FinanceiroPage';
import BeneficiosPage from './pages/beneficios/BeneficiosPage';
import ParceirosPage from './pages/parceiros/ParceirosPage';
import ConteudosPage from './pages/conteudos/ConteudosPage';
import ComunidadePage from './pages/comunidade/ComunidadePage';
import NotificacoesPage from './pages/notificacoes/NotificacoesPage';
import ServicosPage from './pages/servicos/ServicosPage';
import DestaquesPage from './pages/destaques/DestaquesPage';
import SuportePage from './pages/suporte/SuportePage';
import RelatoriosPage from './pages/relatorios/RelatoriosPage';
import PortalLayout from './components/layout/PortalLayout';
import PortalDashboard from './pages/portal/PortalDashboard';
import MinhaLojaPage from './pages/portal/MinhaLojaPage';
import MinhasVendasPage from './pages/portal/MinhasVendasPage';
import MeusBeneficiosPage from './pages/portal/MeusBeneficiosPage';
import MeuPlanoPage from './pages/portal/MeuPlanoPage';
import PortalConteudosPage from './pages/portal/PortalConteudosPage';
import PortalComunidadePage from './pages/portal/PortalComunidadePage';
import PortalNotificacoesPage from './pages/portal/PortalNotificacoesPage';
import PortalSuportePage from './pages/portal/PortalSuportePage';
import LinksAfiliadoPage from './pages/portal/LinksAfiliadoPage';
import MateriaisPage from './pages/portal/MateriaisPage';
import FinanceiroPortalPage from './pages/portal/FinanceiroPortalPage';
import MeuPerfilPage from './pages/portal/MeuPerfilPage';
import CuponsPage from './pages/portal/CuponsPage';
import PerformancePage from './pages/portal/PerformancePage';
import RedesSociaisPage from './pages/portal/RedesSociaisPage';
import RankingPage from './pages/portal/RankingPage';
import ComunicacoesPage from './pages/comunicacoes/ComunicacoesPage';
import LojaPublicaPage from './pages/public/LojaPublicaPage';
import PrivateRoute from './routes/PrivateRoute';
import DataLoader from './components/DataLoader';

export default function App() {
  return (
    <ErrorBoundary>
      <ConfigProvider locale={ptBR} theme={{ token: { colorPrimary: '#1677ff', borderRadius: 8 } }}>
        <BrowserRouter>
          <DataLoader>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/registro" element={<RegisterPage />} />
            <Route path="/loja/:slug" element={<LojaPublicaPage />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <AppLayout />
                </PrivateRoute>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="associados" element={<AssociadosListPage />} />
              <Route path="associados/novo" element={<AssociadoFormPage />} />
              <Route path="associados/:id" element={<AssociadoDetailPage />} />
              <Route path="associados/:id/editar" element={<AssociadoFormPage />} />
              <Route path="planos" element={<PlanosPage />} />
              <Route path="catalogo" element={<CatalogoListPage />} />
              <Route path="catalogo/novo" element={<ProdutoFormPage />} />
              <Route path="catalogo/:id" element={<ProdutoDetailPage />} />
              <Route path="catalogo/:id/editar" element={<ProdutoFormPage />} />
              <Route path="lojas" element={<LojasListPage />} />
              <Route path="lojas/:id" element={<LojaConfigPage />} />
              <Route path="lojas/:id/preview" element={<LojaPreviewPage />} />
              <Route path="vendas" element={<VendasPage />} />
              <Route path="comissoes" element={<ComissoesPage />} />
              <Route path="financeiro" element={<FinanceiroPage />} />
              <Route path="beneficios" element={<BeneficiosPage />} />
              <Route path="parceiros" element={<ParceirosPage />} />
              <Route path="conteudos" element={<ConteudosPage />} />
              <Route path="comunidade" element={<ComunidadePage />} />
              <Route path="notificacoes" element={<NotificacoesPage />} />
              <Route path="servicos" element={<ServicosPage />} />
              <Route path="destaques" element={<DestaquesPage />} />
              <Route path="suporte" element={<SuportePage />} />
              <Route path="comunicacoes" element={<ComunicacoesPage />} />
              <Route path="relatorios" element={<RelatoriosPage />} />
            </Route>
            <Route
              path="/portal"
              element={
                <PrivateRoute>
                  <PortalLayout />
                </PrivateRoute>
              }
            >
              <Route index element={<PortalDashboard />} />
              <Route path="loja" element={<MinhaLojaPage />} />
              <Route path="vendas" element={<MinhasVendasPage />} />
              <Route path="beneficios" element={<MeusBeneficiosPage />} />
              <Route path="plano" element={<MeuPlanoPage />} />
              <Route path="conteudos" element={<PortalConteudosPage />} />
              <Route path="comunidade" element={<PortalComunidadePage />} />
              <Route path="notificacoes" element={<PortalNotificacoesPage />} />
              <Route path="suporte" element={<PortalSuportePage />} />
              <Route path="links" element={<LinksAfiliadoPage />} />
              <Route path="materiais" element={<MateriaisPage />} />
              <Route path="financeiro" element={<FinanceiroPortalPage />} />
              <Route path="perfil" element={<MeuPerfilPage />} />
              <Route path="cupons" element={<CuponsPage />} />
              <Route path="performance" element={<PerformancePage />} />
              <Route path="redes-sociais" element={<RedesSociaisPage />} />
              <Route path="ranking" element={<RankingPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </DataLoader>
        </BrowserRouter>
      </ConfigProvider>
    </ErrorBoundary>
  );
}
