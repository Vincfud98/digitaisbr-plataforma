export type PlanType = 'basico' | 'intermediario' | 'avancado';
export type AssociadoStatus = 'ativo' | 'inativo' | 'suspenso' | 'cancelado';
export type UserRole = 'associado' | 'parceiro' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  plan?: PlanType;
  avatar?: string;
  firebaseUid?: string;
}

export interface Plan {
  id: string;
  name: string;
  type: PlanType;
  price: number;
  description: string;
  features: string[];
  maxProducts: number;
  customization: boolean;
  exclusiveProducts: boolean;
  priority: boolean;
  legalSupport: boolean;
  accountingSupport: boolean;
}

export type ProductStatus = 'ativo' | 'inativo' | 'esgotado';
export type ProductExclusivity = 'todos' | 'intermediario' | 'avancado';

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  price: number;
  commissionPercent: number;
  image: string;
  status: ProductStatus;
  exclusivity: ProductExclusivity;
  sku: string;
  stock: number;
  checkoutUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoreConfig {
  primaryColor: string;
  bannerUrl: string;
  logoUrl: string;
  description: string;
  showWhatsapp: boolean;
  whatsappNumber: string;
}

export interface Store {
  id: string;
  associadoId: string;
  slug: string;
  name: string;
  active: boolean;
  productIds: string[];
  config: StoreConfig;
  totalViews: number;
  totalSales: number;
  createdAt: string;
}

export type SaleStatus = 'pendente' | 'aprovada' | 'cancelada' | 'reembolsada';
export type CommissionStatus = 'pendente' | 'aprovada' | 'paga';
export type TransactionType = 'entrada' | 'saida';

export interface Sale {
  id: string;
  productId: string;
  associadoId: string;
  storeSlug: string;
  customerName: string;
  customerEmail: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  status: SaleStatus;
  checkoutRef: string;
  createdAt: string;
}

export interface Commission {
  id: string;
  saleId: string;
  associadoId: string;
  productId: string;
  saleAmount: number;
  commissionPercent: number;
  commissionValue: number;
  status: CommissionStatus;
  paidAt: string | null;
  createdAt: string;
}

export interface FinancialTransaction {
  id: string;
  type: TransactionType;
  category: string;
  description: string;
  amount: number;
  associadoId: string | null;
  referenceId: string | null;
  createdAt: string;
}

export type BenefitType = 'desconto' | 'servico' | 'acesso' | 'cashback';
export type BenefitStatus = 'ativo' | 'inativo' | 'expirado';
export type PartnerStatus = 'ativo' | 'inativo' | 'pendente';
export type ContentType = 'artigo' | 'video' | 'ebook' | 'curso' | 'podcast';
export type ContentStatus = 'publicado' | 'rascunho' | 'arquivado';

export interface Benefit {
  id: string;
  title: string;
  description: string;
  type: BenefitType;
  value: string;
  partnerId: string;
  minPlan: PlanType;
  status: BenefitStatus;
  usageCount: number;
  expiresAt: string | null;
  createdAt: string;
}

export interface Partner {
  id: string;
  name: string;
  cnpj: string;
  email: string;
  phone: string;
  category: string;
  website: string;
  logo: string;
  description: string;
  status: PartnerStatus;
  benefitCount: number;
  createdAt: string;
}

export interface Content {
  id: string;
  title: string;
  summary: string;
  body: string;
  type: ContentType;
  category: string;
  author: string;
  minPlan: PlanType;
  status: ContentStatus;
  views: number;
  likes: number;
  imageUrl: string;
  videoUrl?: string;
  publishedAt: string | null;
  createdAt: string;
}

// PASSO 06 types
export type ForumTopicStatus = 'aberto' | 'fechado' | 'fixado';
export type NotificationType = 'sistema' | 'venda' | 'comissao' | 'beneficio' | 'conteudo' | 'suporte';
export type NotificationChannel = 'in-app' | 'email' | 'push';
export type ServiceRequestStatus = 'aberto' | 'em-andamento' | 'concluido' | 'cancelado';
export type ServiceType = 'juridico' | 'contabil';
export type TicketStatus = 'aberto' | 'em-andamento' | 'resolvido' | 'fechado';
export type TicketPriority = 'baixa' | 'media' | 'alta' | 'urgente';

export interface ForumTopic {
  id: string;
  title: string;
  body: string;
  authorId: string;
  authorName: string;
  authorRole?: string;
  category: string;
  status: ForumTopicStatus;
  replies: number;
  views: number;
  likes: number;
  lastReplyAt: string | null;
  createdAt: string;
  media?: { type: 'image' | 'video'; url: string; caption?: string }[];
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  channel: NotificationChannel;
  userId: string;
  read: boolean;
  actionUrl: string | null;
  createdAt: string;
}

export interface ServiceRequest {
  id: string;
  type: ServiceType;
  title: string;
  description: string;
  associadoId: string;
  associadoName: string;
  professionalName: string;
  status: ServiceRequestStatus;
  scheduledAt: string | null;
  documents: string[];
  rating: number | null;
  createdAt: string;
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  sender: 'user' | 'agent' | 'system';
  senderName: string;
  content: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  category: string;
  priority: TicketPriority;
  status: TicketStatus;
  userId: string;
  userName: string;
  userPlan: PlanType;
  assignedTo: string | null;
  messages: number;
  rating: number | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
}

export interface ReportConfig {
  id: string;
  name: string;
  description: string;
  type: 'vendas' | 'comissoes' | 'associados' | 'financeiro' | 'produtos' | 'lojas';
  period: string;
  format: 'tabela' | 'grafico' | 'resumo';
  lastGenerated: string | null;
  favorite: boolean;
}

export type PaymentMethod = 'pix' | 'cartao' | 'boleto';
export type OrderStatus = 'aguardando_pagamento' | 'pago' | 'enviado' | 'entregue' | 'cancelado';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export interface OrderCustomer {
  name: string;
  email: string;
  phone: string;
  cpf: string;
  cep: string;
}

export interface Order {
  id: string;
  storeSlug: string;
  storeName: string;
  associadoId: string;
  customer: OrderCustomer;
  items: CartItem[];
  subtotal: number;
  total: number;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  pixCode?: string;
  boletoUrl?: string;
  createdAt: string;
  paidAt?: string;
}

export interface Associado {
  id: string;
  name: string;
  email: string;
  cpfCnpj: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  planId: string;
  planType: PlanType;
  status: AssociadoStatus;
  storeSlug: string;
  storeName: string;
  createdAt: string;
  updatedAt: string;
  totalSales: number;
  totalCommission: number;
  avatar?: string;
  bio?: string;
  instagram?: string;
  youtube?: string;
  tiktok?: string;
  website?: string;
  showEmail?: boolean;
  showPhone?: boolean;
  niche?: string;
  followers?: number;
  engagementRate?: number;
  mediaKitUrl?: string;
}
