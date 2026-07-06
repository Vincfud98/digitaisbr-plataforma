import { useEffect, useState } from 'react';
import { Spin, notification } from 'antd';
import { useAppDispatch } from '../store';
import { onPushMessage } from '../lib/pushService';
import { getCollection } from '../lib/firestoreService';
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
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
  const [loading, setLoading] = useState(true);
  const [firebaseUser, setFirebaseUser] = useState<boolean | null>(null);
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
    const unsub = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(!!user);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (firebaseUser === null) return;

    if (!firebaseUser) {
      loadFallbackData();
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadAll() {
      try {
        const [
          associados, planos, produtos, lojas, vendas, comissoes,
          financeiro, beneficios, parceiros, conteudos, comunidade,
          notificacoes, servicos, tickets, relatorios, messages,
        ] = await Promise.all([
          getCollection<Associado>('associados'),
          getCollection<Plan>('plans'),
          getCollection<Product>('products'),
          getCollection<Store>('stores'),
          getCollection<Sale>('sales'),
          getCollection<Commission>('commissions'),
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

        if (cancelled) return;

        dispatch(setAssociados(associados));
        dispatch(setPlanos(planos));
        dispatch(setCatalogo(produtos));
        dispatch(setLojas(lojas));
        dispatch(setVendas(vendas));
        dispatch(setComissoes(comissoes));
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
      } catch (err) {
        console.error('Failed to load Firestore data:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadAll();

    const unsubPush = onPushMessage((msg) => {
      notification.info({ message: msg.title, description: msg.body, placement: 'topRight' });
    });

    return () => { cancelled = true; if (unsubPush) unsubPush(); };
  }, [firebaseUser, dispatch]);

  if (firebaseUser === null || (firebaseUser && loading)) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <Spin size="large" />
        <span style={{ color: '#888' }}>Carregando...</span>
      </div>
    );
  }

  return <>{children}</>;
}
