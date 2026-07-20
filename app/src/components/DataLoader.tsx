import { useEffect, useState } from 'react';
import { notification } from 'antd';
import { useAppDispatch } from '../store';
import { getCollection } from '../lib/firestoreService';
import PageSkeleton from './PageSkeleton';
import { setAll as setAssociados } from '../store/slices/associadosSlice';
import { setAll as setPlanos } from '../store/slices/planosSlice';
import { setAll as setCatalogo } from '../store/slices/catalogoSlice';
import { setAll as setLojas } from '../store/slices/lojasSlice';
import { setAll as setVendas } from '../store/slices/vendasSlice';
import { setAll as setComissoes } from '../store/slices/comissoesSlice';
import { setAll as setFinanceiro } from '../store/slices/financeiroSlice';
import { setAll as setBeneficios } from '../store/slices/beneficiosSlice';
import { setAll as setParceiros } from '../store/slices/parceirosSlice';
import { setAll as setConteudos } from '../store/slices/conteudosSlice';
import { setAll as setComunidade } from '../store/slices/comunidadeSlice';
import { setAll as setNotificacoes } from '../store/slices/notificacoesSlice';
import { setAll as setServicos } from '../store/slices/servicosSlice';
import { setAll as setSuporteTickets, setMessages as setSuporteMsgs } from '../store/slices/suporteSlice';
import { setAll as setRelatorios } from '../store/slices/relatoriosSlice';
import type {
  Associado, Plan, Product, Store, Sale, Commission,
  FinancialTransaction, Benefit, Partner, Content, ForumTopic,
  Notification, ServiceRequest, SupportTicket,
  ReportConfig, TicketMessage,
} from '../types';

interface Props {
  children: React.ReactNode;
}

export default function DataLoader({ children }: Props) {
  const [phase, setPhase] = useState<'waiting' | 'core' | 'ready'>('waiting');
  const dispatch = useAppDispatch();

  const loadFallbackData = async () => {
    const [
      { mockAssociados }, { mockStores }, { mockProducts }, { mockSales },
      { plans }, { mockCommissions }, { mockTransactions }, { mockBenefits },
      { mockPartners }, { mockContents }, { forumTopics }, { notifications },
      { serviceRequests }, { supportTickets }, { reportConfigs },
      { ticketMessages },
    ] = await Promise.all([
      import('../data/associados'),
      import('../data/stores'),
      import('../data/products'),
      import('../data/sales'),
      import('../data/plans'),
      import('../data/commissions'),
      import('../data/financial'),
      import('../data/benefits'),
      import('../data/partners'),
      import('../data/contents'),
      import('../data/forum'),
      import('../data/notifications'),
      import('../data/services'),
      import('../data/tickets'),
      import('../data/reports'),
      import('../data/ticketMessages'),
    ]);
    dispatch(setAssociados(mockAssociados));
    dispatch(setLojas(mockStores));
    dispatch(setCatalogo(mockProducts));
    dispatch(setVendas(mockSales));
    dispatch(setPlanos(plans));
    dispatch(setComissoes(mockCommissions));
    dispatch(setFinanceiro(mockTransactions));
    dispatch(setBeneficios(mockBenefits));
    dispatch(setParceiros(mockPartners));
    dispatch(setConteudos(mockContents));
    dispatch(setComunidade(forumTopics));
    dispatch(setNotificacoes(notifications));
    dispatch(setServicos(serviceRequests));
    dispatch(setSuporteTickets(supportTickets));
    dispatch(setRelatorios(reportConfigs));
    dispatch(setSuporteMsgs(ticketMessages));
  };

  useEffect(() => {
    let cancelled = false;

    async function loadAll() {
      const timeout = new Promise<'timeout'>((resolve) => setTimeout(() => resolve('timeout'), 3000));

      try {
        // Phase 1: core data (6 collections — enough for dashboard cards + charts)
        const coreLoad = Promise.all([
          getCollection<Associado>('associados'),
          getCollection<Plan>('plans'),
          getCollection<Product>('products'),
          getCollection<Store>('stores'),
          getCollection<Sale>('sales'),
          getCollection<Commission>('commissions'),
        ]);

        const coreResult = await Promise.race([coreLoad, timeout]);

        if (cancelled) return;

        if (coreResult === 'timeout') {
          console.warn('Firestore timeout, using local data');
          await loadFallbackData();
          setPhase('ready');
          return;
        }

        const [associados, planos, produtos, lojas, vendas, comissoes] = coreResult;
        const hasData = associados.length > 0 || produtos.length > 0;

        if (!hasData) {
          const { seedIfNeeded } = await import('../lib/seedFirestore');
          const seeded = await seedIfNeeded();
          if (seeded) {
            window.location.reload();
            return;
          }
          await loadFallbackData();
          setPhase('ready');
          return;
        }

        // Dispatch core data and show the page
        dispatch(setAssociados(associados));
        dispatch(setPlanos(planos));
        dispatch(setCatalogo(produtos));
        dispatch(setLojas(lojas));
        dispatch(setVendas(vendas));
        dispatch(setComissoes(comissoes));

        if (!cancelled) setPhase('ready');

        // Phase 2: remaining data in background (page already visible)
        const secondaryLoad = Promise.all([
          getCollection<FinancialTransaction>('financial'),
          getCollection<Benefit>('benefits'),
          getCollection<Partner>('partners'),
          getCollection<Content>('contents'),
          getCollection<ForumTopic>('forumTopics'),
          getCollection<Notification>('notifications'),
          getCollection<ServiceRequest>('services'),
          getCollection<SupportTicket>('tickets'),
          getCollection<ReportConfig>('reports'),
          getCollection<TicketMessage>('ticketMessages'),
        ]);

        const secondaryTimeout = new Promise<'timeout'>((resolve) => setTimeout(() => resolve('timeout'), 5000));
        const secondaryResult = await Promise.race([secondaryLoad, secondaryTimeout]);

        if (cancelled) return;

        if (secondaryResult !== 'timeout') {
          const [financeiro, beneficios, parceiros, conteudos, comunidade, notificacoes, servicos, tickets, relatorios, messages] = secondaryResult;
          dispatch(setFinanceiro(financeiro));
          dispatch(setBeneficios(beneficios));
          dispatch(setParceiros(parceiros));
          dispatch(setConteudos(conteudos));
          dispatch(setComunidade(comunidade));
          dispatch(setNotificacoes(notificacoes));
          dispatch(setServicos(servicos));
          dispatch(setSuporteTickets(tickets));
          dispatch(setRelatorios(relatorios));
          dispatch(setSuporteMsgs(messages));
        } else {
          console.warn('Secondary data timeout, loading fallback for remaining');
          const [
            { mockTransactions }, { mockBenefits }, { mockPartners }, { mockContents },
            { forumTopics }, { notifications }, { serviceRequests }, { supportTickets },
            { reportConfigs }, { ticketMessages },
          ] = await Promise.all([
            import('../data/financial'),
            import('../data/benefits'),
            import('../data/partners'),
            import('../data/contents'),
            import('../data/forum'),
            import('../data/notifications'),
            import('../data/services'),
            import('../data/tickets'),
            import('../data/reports'),
            import('../data/ticketMessages'),
          ]);
          dispatch(setFinanceiro(mockTransactions));
          dispatch(setBeneficios(mockBenefits));
          dispatch(setParceiros(mockPartners));
          dispatch(setConteudos(mockContents));
          dispatch(setComunidade(forumTopics));
          dispatch(setNotificacoes(notifications));
          dispatch(setServicos(serviceRequests));
          dispatch(setSuporteTickets(supportTickets));
          dispatch(setRelatorios(reportConfigs));
          dispatch(setSuporteMsgs(ticketMessages));
        }
      } catch (err) {
        console.error('Failed to load Firestore data, using fallback:', err);
        await loadFallbackData();
        if (!cancelled) setPhase('ready');
      }
    }

    loadAll();

    let unsubPush: (() => void) | undefined;
    import('../lib/pushService').then(({ onPushMessage }) => {
      if (cancelled) return;
      unsubPush = onPushMessage((msg) => {
        notification.info({ message: msg.title, description: msg.body, placement: 'topRight' });
      });
    });

    return () => { cancelled = true; if (unsubPush) unsubPush(); };
  }, [dispatch]);

  if (phase !== 'ready') {
    return <PageSkeleton />;
  }

  return <>{children}</>;
}
