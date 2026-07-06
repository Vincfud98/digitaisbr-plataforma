import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ConfigProvider, Spin } from 'antd';
import ptBR from 'antd/locale/pt_BR';
import ErrorBoundary from './components/ErrorBoundary';
import PrivateRoute from './routes/PrivateRoute';
import DataLoader from './components/DataLoader';

const AppLayout = lazy(() => import('./components/layout/AppLayout'));
const PortalLayout = lazy(() => import('./components/layout/PortalLayout'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));

const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'));
const AssociadosListPage = lazy(() => import('./pages/associados/AssociadosListPage'));
const AssociadoFormPage = lazy(() => import('./pages/associados/AssociadoFormPage'));
const AssociadoDetailPage = lazy(() => import('./pages/associados/AssociadoDetailPage'));
const PlanosPage = lazy(() => import('./pages/planos/PlanosPage'));
const CatalogoListPage = lazy(() => import('./pages/catalogo/CatalogoListPage'));
const ProdutoFormPage = lazy(() => import('./pages/catalogo/ProdutoFormPage'));
const ProdutoDetailPage = lazy(() => import('./pages/catalogo/ProdutoDetailPage'));
const LojasListPage = lazy(() => import('./pages/lojas/LojasListPage'));
const LojaConfigPage = lazy(() => import('./pages/lojas/LojaConfigPage'));
const LojaPreviewPage = lazy(() => import('./pages/lojas/LojaPreviewPage'));
const VendasPage = lazy(() => import('./pages/vendas/VendasPage'));
const ComissoesPage = lazy(() => import('./pages/comissoes/ComissoesPage'));
const FinanceiroPage = lazy(() => import('./pages/financeiro/FinanceiroPage'));
const ParceirosPage = lazy(() => import('./pages/parceiros/ParceirosPage'));
const ConteudosPage = lazy(() => import('./pages/conteudos/ConteudosPage'));
const ConteudoDetailPage = lazy(() => import('./pages/conteudos/ConteudoDetailPage'));
const ComunidadePage = lazy(() => import('./pages/comunidade/ComunidadePage'));
const NotificacoesPage = lazy(() => import('./pages/notificacoes/NotificacoesPage'));
const ServicosPage = lazy(() => import('./pages/servicos/ServicosPage'));
const DestaquesPage = lazy(() => import('./pages/destaques/DestaquesPage'));
const SuportePage = lazy(() => import('./pages/suporte/SuportePage'));
const RelatoriosPage = lazy(() => import('./pages/relatorios/RelatoriosPage'));
const ComunicacoesPage = lazy(() => import('./pages/comunicacoes/ComunicacoesPage'));

const PortalDashboard = lazy(() => import('./pages/portal/PortalDashboard'));
const MinhaLojaPage = lazy(() => import('./pages/portal/MinhaLojaPage'));
const MinhasVendasPage = lazy(() => import('./pages/portal/MinhasVendasPage'));
const MeusBeneficiosPage = lazy(() => import('./pages/portal/MeusBeneficiosPage'));
const MeuPlanoPage = lazy(() => import('./pages/portal/MeuPlanoPage'));
const PortalConteudosPage = lazy(() => import('./pages/portal/PortalConteudosPage'));
const PortalComunidadePage = lazy(() => import('./pages/portal/PortalComunidadePage'));
const PortalNotificacoesPage = lazy(() => import('./pages/portal/PortalNotificacoesPage'));
const PortalSuportePage = lazy(() => import('./pages/portal/PortalSuportePage'));
const LinksAfiliadoPage = lazy(() => import('./pages/portal/LinksAfiliadoPage'));
const MateriaisPage = lazy(() => import('./pages/portal/MateriaisPage'));
const FinanceiroPortalPage = lazy(() => import('./pages/portal/FinanceiroPortalPage'));
const MeuPerfilPage = lazy(() => import('./pages/portal/MeuPerfilPage'));
const CuponsPage = lazy(() => import('./pages/portal/CuponsPage'));
const PerformancePage = lazy(() => import('./pages/portal/PerformancePage'));
const RedesSociaisPage = lazy(() => import('./pages/portal/RedesSociaisPage'));
const RankingPage = lazy(() => import('./pages/portal/RankingPage'));
const PortalServicosPage = lazy(() => import('./pages/portal/PortalServicosPage'));

const LojaPublicaPage = lazy(() => import('./pages/public/LojaPublicaPage'));
const CheckoutPage = lazy(() => import('./pages/public/CheckoutPage'));

const PageFallback = (
  <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <Spin size="large" />
  </div>
);

export default function App() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
      <ConfigProvider locale={ptBR} theme={{ token: { colorPrimary: '#1677ff', borderRadius: 8 } }}>
        <BrowserRouter>
          <DataLoader>
          <Suspense fallback={PageFallback}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/registro" element={<RegisterPage />} />
            <Route path="/loja/:slug" element={<LojaPublicaPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
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
              <Route path="beneficios" element={<Navigate to="/catalogo" replace />} />
              <Route path="parceiros" element={<ParceirosPage />} />
              <Route path="conteudos" element={<ConteudosPage />} />
              <Route path="conteudos/:id" element={<ConteudoDetailPage />} />
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
              <Route path="conteudos/:id" element={<ConteudoDetailPage />} />
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
              <Route path="servicos" element={<PortalServicosPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </Suspense>
          </DataLoader>
        </BrowserRouter>
      </ConfigProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}
