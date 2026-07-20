import { useState, useMemo } from 'react';
import { Card, Typography, Button, Row, Col, Input, message, Space, Tag, Checkbox, Empty, Divider, Tabs, Statistic, Table, Badge, Alert, Timeline, Descriptions, Progress, Tooltip, Popconfirm } from 'antd';
import {
  ArrowLeftOutlined, ShopOutlined, EyeOutlined,
  DollarOutlined, FileTextOutlined, KeyOutlined, SafetyCertificateOutlined,
  CopyOutlined, CheckCircleOutlined, CloseCircleOutlined,
  ExclamationCircleOutlined, UserOutlined, CalendarOutlined, ClockCircleOutlined,
  ShoppingCartOutlined, StopOutlined, ReloadOutlined, MailOutlined,
  LockOutlined, ApiOutlined, LinkOutlined, BankOutlined, AuditOutlined,
  FilePdfOutlined, CameraOutlined, IdcardOutlined, PhoneOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppSelector } from '../../store';
import { categories } from '../../data/categories';
import type { Store, Product, ProductExclusivity, PlanType, Sale } from '../../types';

const { Title, Text } = Typography;

const exclusivityAllowed: Record<ProductExclusivity, PlanType[]> = {
  todos: ['basico', 'intermediario', 'avancado'],
  intermediario: ['intermediario', 'avancado'],
  avancado: ['avancado'],
};

function seededRandom(seed: number) {
  return Math.abs(Math.sin(seed) * 10000) % 1;
}

function OverviewTab({ store, associado, plan }: { store: Store; associado: any; plan: any }) {
  const seed = store.id.charCodeAt(store.id.length - 1);
  const conversionRate = (seededRandom(seed) * 4 + 1).toFixed(1);
  const avgTicket = (seededRandom(seed + 1) * 150 + 50).toFixed(2);
  const monthlyViews = Math.floor(store.totalViews * 0.3);
  const monthlySales = Math.floor(store.totalSales * 0.25);
  const commission = (store.totalSales * (associado?.commissionRate || 10) / 100);

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <Card><Statistic title="Visualizações Totais" value={store.totalViews} prefix={<EyeOutlined />} styles={{ content: { color: '#1677ff' } }} /></Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card><Statistic title="Vendas Totais" value={store.totalSales} prefix={<ShoppingCartOutlined />} styles={{ content: { color: '#52c41a' } }} /></Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card><Statistic title="Comissão Gerada" value={commission} precision={2} prefix="R$" styles={{ content: { color: '#722ed1' } }} /></Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card><Statistic title="Taxa de Conversão" value={conversionRate} suffix="%" styles={{ content: { color: '#fa8c16' } }} /></Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="Informações da Loja" size="small">
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Nome da Loja">{store.name}</Descriptions.Item>
              <Descriptions.Item label="Influencer">{associado?.name}</Descriptions.Item>
              <Descriptions.Item label="Plano"><Tag color={plan?.type === 'avancado' ? 'gold' : plan?.type === 'intermediario' ? 'purple' : 'blue'}>{plan?.name}</Tag></Descriptions.Item>
              <Descriptions.Item label="Status"><Badge status={store.active ? 'success' : 'error'} text={store.active ? 'Ativa' : 'Inativa'} /></Descriptions.Item>
              <Descriptions.Item label="URL Pública"><Text copyable code>/loja/{store.slug}</Text></Descriptions.Item>
              <Descriptions.Item label="Produtos">{store.productIds.length}</Descriptions.Item>
              <Descriptions.Item label="Criada em">{new Date(store.createdAt).toLocaleDateString('pt-BR')}</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Desempenho Mensal" size="small">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text type="secondary">Visualizações este mês</Text>
                  <Text strong>{monthlyViews.toLocaleString('pt-BR')}</Text>
                </div>
                <Progress percent={Math.min(100, (monthlyViews / 2000) * 100)} showInfo={false} strokeColor="#1677ff" />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text type="secondary">Vendas este mês</Text>
                  <Text strong>{monthlySales}</Text>
                </div>
                <Progress percent={Math.min(100, (monthlySales / 100) * 100)} showInfo={false} strokeColor="#52c41a" />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text type="secondary">Ticket Médio</Text>
                  <Text strong>R$ {avgTicket}</Text>
                </div>
                <Progress percent={Math.min(100, (parseFloat(avgTicket) / 200) * 100)} showInfo={false} strokeColor="#722ed1" />
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

function ProductsTab({ allProducts, selectedProductIds, onToggleProduct, maxProducts, associado }: { allProducts: Product[]; selectedProductIds: string[]; onToggleProduct: (id: string) => void; maxProducts: number; associado: any }) {
  const storeProducts = allProducts.filter((p) => selectedProductIds.includes(p.id));
  const totalValue = storeProducts.reduce((s, p) => s + p.price, 0);
  const avgCommission = storeProducts.length > 0 ? storeProducts.reduce((s, p) => s + p.commissionPercent, 0) / storeProducts.length : 0;

  const availableProducts = allProducts.filter((p) => p.status === 'ativo' && exclusivityAllowed[p.exclusivity].includes(associado?.planType || 'basico'));
  const groupedProducts = categories.map((cat) => ({
    ...cat,
    products: availableProducts.filter((p) => p.categoryId === cat.id),
  })).filter((g) => g.products.length > 0);

  const statusColors: Record<string, string> = { ativo: 'green', inativo: 'default', esgotado: 'red' };

  const columns = [
    {
      title: 'Produto', dataIndex: 'name', key: 'name',
      render: (name: string, record: Product) => {
        const cat = categories.find((c) => c.id === record.categoryId);
        return (
        <Space>
          {record.image ? (
            <img src={record.image} alt={name} style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover' }} />
          ) : (
            <div style={{ width: 40, height: 40, borderRadius: 6, background: cat?.color || '#1677ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14 }}>
              {name.charAt(0)}
            </div>
          )}
          <div>
            <Text strong style={{ fontSize: 13 }}>{name}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 11 }}>SKU: {record.sku}</Text>
          </div>
        </Space>
      );
      },
    },
    {
      title: 'Categoria', dataIndex: 'categoryId', key: 'category', width: 130,
      render: (catId: string) => {
        const cat = categories.find((c) => c.id === catId);
        return cat ? <Tag color={cat.color}>{cat.name}</Tag> : catId;
      },
    },
    { title: 'Preço', dataIndex: 'price', key: 'price', width: 110, render: (v: number) => <Text strong>R$ {v.toFixed(2)}</Text> },
    { title: 'Comissão', dataIndex: 'commissionPercent', key: 'commission', width: 100, render: (v: number) => <Tag color="purple">{v}%</Tag> },
    { title: 'Estoque', dataIndex: 'stock', key: 'stock', width: 80, render: (v: number) => v === -1 ? <Tag color="blue">Ilimitado</Tag> : <Text type={v <= 5 ? 'danger' : undefined}>{v}</Text> },
    { title: 'Exclusividade', dataIndex: 'exclusivity', key: 'exclusivity', width: 120, render: (v: string) => v === 'todos' ? <Tag>Todos</Tag> : v === 'intermediario' ? <Tag color="purple">Inter+</Tag> : <Tag color="gold">Avançado</Tag> },
    { title: 'Status', dataIndex: 'status', key: 'status', width: 90, render: (v: string) => <Tag color={statusColors[v] || 'default'}>{v.charAt(0).toUpperCase() + v.slice(1)}</Tag> },
  ];

  const [view, setView] = useState<'selected' | 'add'>('selected');

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}>
          <Card><Statistic title="Produtos na Loja" value={storeProducts.length} prefix={<ShoppingCartOutlined />} /></Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card><Statistic title="Ativos" value={storeProducts.filter((p) => p.status === 'ativo').length} prefix={<CheckCircleOutlined />} styles={{ content: { color: '#52c41a' } }} /></Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card><Statistic title="Valor Total Catálogo" value={totalValue} precision={2} prefix="R$" styles={{ content: { color: '#1677ff' } }} /></Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card><Statistic title="Comissão Média" value={avgCommission} precision={1} suffix="%" styles={{ content: { color: '#722ed1' } }} /></Card>
        </Col>
      </Row>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <Button type={view === 'selected' ? 'primary' : 'default'} onClick={() => setView('selected')}>Selecionados ({selectedProductIds.length})</Button>
        <Button type={view === 'add' ? 'primary' : 'default'} onClick={() => setView('add')}>Adicionar / Remover Produtos</Button>
      </div>

      {view === 'selected' ? (
        <Card title={<><ShoppingCartOutlined style={{ marginRight: 8 }} />Produtos Selecionados pelo Influencer</>}>
          {storeProducts.length > 0 ? (
            <Table dataSource={storeProducts} columns={columns} rowKey="id" size="small" pagination={{ pageSize: 10 }} />
          ) : (
            <Empty description="Este influencer ainda não selecionou nenhum produto para sua loja." />
          )}
        </Card>
      ) : (
        <Card title={`Catálogo Disponível — ${selectedProductIds.length}${maxProducts === -1 ? '' : `/${maxProducts}`} selecionados`}>
          {groupedProducts.map((group) => (
            <div key={group.id} style={{ marginBottom: 20 }}>
              <Title level={5} style={{ margin: '0 0 8px' }}><Tag color={group.color}>{group.name}</Tag></Title>
              <Row gutter={[8, 8]}>
                {group.products.map((product: Product) => {
                  const selected = selectedProductIds.includes(product.id);
                  return (
                    <Col xs={24} sm={12} key={product.id}>
                      <Card size="small" hoverable style={{ borderColor: selected ? '#1677ff' : undefined, background: selected ? '#e6f4ff' : undefined }} onClick={() => onToggleProduct(product.id)}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <Checkbox checked={selected} style={{ marginRight: 8 }} />
                            <Text strong>{product.name}</Text>
                            <div style={{ fontSize: 12, color: '#888', marginLeft: 24 }}>R$ {product.price.toFixed(2)} — {product.commissionPercent}% comissão</div>
                          </div>
                          {product.exclusivity !== 'todos' && (
                            <Tag color={product.exclusivity === 'avancado' ? 'gold' : 'purple'} style={{ fontSize: 10 }}>
                              {product.exclusivity === 'avancado' ? 'Exclusivo' : 'Inter+'}
                            </Tag>
                          )}
                        </div>
                      </Card>
                    </Col>
                  );
                })}
              </Row>
            </div>
          ))}
        </Card>
      )}

      {storeProducts.some((p) => p.status === 'esgotado') && (
        <Alert title={`${storeProducts.filter((p) => p.status === 'esgotado').length} produto(s) esgotado(s) na loja deste influencer.`} type="warning" showIcon style={{ marginTop: 16 }} />
      )}
      {storeProducts.some((p) => p.stock > 0 && p.stock <= 5) && (
        <Alert title={`${storeProducts.filter((p) => p.stock > 0 && p.stock <= 5).length} produto(s) com estoque baixo (≤ 5 unidades).`} type="info" showIcon style={{ marginTop: 16 }} />
      )}
    </div>
  );
}

type DocStatus = 'aprovado' | 'pendente' | 'enviado' | 'rejeitado' | 'nao_enviado';

function DocumentsTab({ associado }: { associado: any }) {
  const seed = associado?.id?.charCodeAt(associado.id.length - 1) || 1;
  const initialCnpj: DocStatus = seededRandom(seed) > 0.5 ? 'aprovado' : seededRandom(seed) > 0.2 ? 'enviado' : 'nao_enviado';
  const initialDoc: DocStatus = seededRandom(seed + 1) > 0.5 ? 'aprovado' : seededRandom(seed + 1) > 0.2 ? 'enviado' : 'nao_enviado';
  const initialSelfie: DocStatus = seededRandom(seed + 2) > 0.6 ? 'aprovado' : seededRandom(seed + 2) > 0.3 ? 'enviado' : 'nao_enviado';
  const initialComprovante: DocStatus = seededRandom(seed + 7) > 0.7 ? 'aprovado' : seededRandom(seed + 7) > 0.5 ? 'enviado' : 'nao_enviado';

  const [cnpjStatus, setCnpjStatus] = useState<DocStatus>(initialCnpj);
  const [docStatus, setDocStatus] = useState<DocStatus>(initialDoc);
  const [selfieStatus, setSelfieStatus] = useState<DocStatus>(initialSelfie);
  const [comprovanteStatus, setComprovanteStatus] = useState<DocStatus>(initialComprovante);
  const [rejectReason, setRejectReason] = useState<string | null>(null);
  const [rejectingDoc, setRejectingDoc] = useState<string | null>(null);

  const cnpj = cnpjStatus !== 'nao_enviado' ? `${String(Math.floor(seededRandom(seed + 3) * 90 + 10))}.${String(Math.floor(seededRandom(seed + 4) * 900 + 100))}.${String(Math.floor(seededRandom(seed + 5) * 900 + 100))}/0001-${String(Math.floor(seededRandom(seed + 6) * 90 + 10))}` : null;

  const handleApprove = (docName: string, setter: (s: DocStatus) => void) => {
    setter('aprovado');
    message.success(`${docName} aprovado com sucesso!`);
  };

  const handleReject = (docName: string, setter: (s: DocStatus) => void) => {
    setRejectingDoc(docName);
    setRejectReason(null);
    setter('rejeitado');
  };

  const confirmReject = () => {
    message.warning(`${rejectingDoc} rejeitado. O influencer será notificado.`);
    setRejectingDoc(null);
    setRejectReason(null);
  };

  const statusConfig: Record<DocStatus, { color: string; bg: string; border: string; label: string; icon: React.ReactNode }> = {
    aprovado: { color: '#52c41a', bg: '#f6ffed', border: '#b7eb8f', label: 'Aprovado', icon: <CheckCircleOutlined /> },
    enviado: { color: '#1677ff', bg: '#e6f4ff', border: '#91caff', label: 'Aguardando Análise', icon: <ClockCircleOutlined /> },
    pendente: { color: '#faad14', bg: '#fffbe6', border: '#ffe58f', label: 'Pendente', icon: <ExclamationCircleOutlined /> },
    rejeitado: { color: '#ff4d4f', bg: '#fff2f0', border: '#ffccc7', label: 'Rejeitado', icon: <CloseCircleOutlined /> },
    nao_enviado: { color: '#999', bg: '#fafafa', border: '#d9d9d9', label: 'Não Enviado', icon: <CloseCircleOutlined /> },
  };

  const docs = [
    { key: 'cnpj', label: 'CNPJ / MEI', icon: <BankOutlined />, status: cnpjStatus, setter: setCnpjStatus, detail: cnpj, subtext: cnpjStatus === 'aprovado' ? `Razão Social: ${associado?.name} Produções Digitais LTDA` : cnpjStatus === 'enviado' ? 'Documento enviado, aguardando verificação manual' : cnpjStatus === 'rejeitado' ? 'Documento rejeitado — solicitado reenvio' : 'Usuário não enviou o CNPJ/MEI', uploadDate: cnpjStatus !== 'nao_enviado' ? '28/06/2025 às 14:32' : null },
    { key: 'identidade', label: 'Documento de Identidade (RG/CPF)', icon: <FileTextOutlined />, status: docStatus, setter: setDocStatus, detail: associado?.cpfCnpj || null, subtext: docStatus === 'aprovado' ? 'Documento verificado e aprovado' : docStatus === 'enviado' ? 'Documento enviado, aguardando verificação manual' : docStatus === 'rejeitado' ? 'Documento ilegível — solicitado reenvio' : 'Aguardando envio do documento', uploadDate: docStatus !== 'nao_enviado' ? '28/06/2025 às 14:33' : null },
    { key: 'selfie', label: 'Selfie com Documento', icon: <CameraOutlined />, status: selfieStatus, setter: setSelfieStatus, detail: null, subtext: selfieStatus === 'aprovado' ? 'Validação facial concluída' : selfieStatus === 'enviado' ? 'Selfie enviada, aguardando verificação manual' : selfieStatus === 'rejeitado' ? 'Rosto não visível — solicitado reenvio' : 'Aguardando envio da selfie', uploadDate: selfieStatus !== 'nao_enviado' ? '28/06/2025 às 14:35' : null },
    { key: 'comprovante', label: 'Comprovante de Endereço', icon: <FilePdfOutlined />, status: comprovanteStatus, setter: setComprovanteStatus, detail: null, subtext: comprovanteStatus === 'aprovado' ? 'Comprovante verificado' : comprovanteStatus === 'enviado' ? 'Comprovante enviado, aguardando verificação' : comprovanteStatus === 'rejeitado' ? 'Documento com mais de 90 dias — solicitado reenvio' : 'Opcional — necessário para saques acima de R$ 5.000', uploadDate: comprovanteStatus !== 'nao_enviado' ? '28/06/2025 às 14:36' : null },
  ];

  const approvedCount = [cnpjStatus, docStatus, selfieStatus].filter((s) => s === 'aprovado').length;
  const verificationPercent = Math.round((approvedCount / 3) * 100);
  const verificationStatus = approvedCount === 3 ? 'success' : approvedCount >= 2 ? 'normal' : 'exception';
  const pendingReview = docs.filter((d) => d.status === 'enviado').length;

  return (
    <div>
      {pendingReview > 0 && (
        <Alert
          title={`${pendingReview} documento(s) aguardando sua verificação manual.`}
          description="Analise os documentos enviados e aprove ou rejeite cada um."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {rejectingDoc && (
        <Alert
          title={`Motivo da rejeição: ${rejectingDoc}`}
          description={
            <div style={{ marginTop: 8 }}>
              <Input.TextArea
                rows={2}
                placeholder="Informe o motivo da rejeição (ex: documento ilegível, foto cortada, dados divergentes...)"
                value={rejectReason || ''}
                onChange={(e) => setRejectReason(e.target.value)}
                style={{ marginBottom: 8 }}
              />
              <Space>
                <Button type="primary" size="small" danger onClick={confirmReject} disabled={!rejectReason}>Confirmar Rejeição</Button>
                <Button size="small" onClick={() => setRejectingDoc(null)}>Cancelar</Button>
              </Space>
            </div>
          }
          type="error"
          showIcon
          closable
          onClose={() => setRejectingDoc(null)}
          style={{ marginBottom: 16 }}
        />
      )}

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title={<><IdcardOutlined style={{ marginRight: 8 }} />Documentos do Influencer</>}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {docs.map((doc) => {
                const sc = statusConfig[doc.status];
                return (
                  <div key={doc.key} style={{ padding: 16, background: sc.bg, borderRadius: 8, border: `1px solid ${sc.border}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                      <Space>
                        <div style={{ fontSize: 20, color: sc.color }}>{doc.icon}</div>
                        <div>
                          <Text strong>{doc.label}</Text>
                          {doc.detail && <Text copyable style={{ fontSize: 14, fontFamily: 'monospace', marginLeft: 8 }}>{doc.detail}</Text>}
                          <br />
                          <Text type="secondary" style={{ fontSize: 12 }}>{doc.subtext}</Text>
                          {doc.uploadDate && <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Enviado em: {doc.uploadDate}</Text>}
                        </div>
                      </Space>
                      <Space>
                        {doc.status === 'enviado' && (
                          <>
                            <Button size="small" icon={<EyeOutlined />}>Visualizar</Button>
                            <Popconfirm title="Aprovar este documento?" description="O documento será marcado como verificado." okText="Aprovar" cancelText="Cancelar" onConfirm={() => handleApprove(doc.label, doc.setter)}>
                              <Button size="small" type="primary" icon={<CheckCircleOutlined />}>Aprovar</Button>
                            </Popconfirm>
                            <Button size="small" danger icon={<CloseCircleOutlined />} onClick={() => handleReject(doc.label, doc.setter)}>Rejeitar</Button>
                          </>
                        )}
                        {doc.status === 'aprovado' && (
                          <>
                            <Button size="small" icon={<EyeOutlined />}>Visualizar</Button>
                            <Tag color="green" icon={<CheckCircleOutlined />}>Aprovado</Tag>
                          </>
                        )}
                        {doc.status === 'rejeitado' && (
                          <>
                            <Tag color="red" icon={<CloseCircleOutlined />}>Rejeitado</Tag>
                            <Button size="small" icon={<ReloadOutlined />} onClick={() => doc.setter('enviado')}>Re-analisar</Button>
                          </>
                        )}
                        {doc.status === 'nao_enviado' && (
                          <Tag color="default" icon={<CloseCircleOutlined />}>Não Enviado</Tag>
                        )}
                      </Space>
                    </div>
                    {doc.key === 'cnpj' && doc.status === 'aprovado' && (
                      <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid #d9f7be' }}>
                        <Text type="secondary" style={{ fontSize: 12 }}>Razão Social: </Text>
                        <Text style={{ fontSize: 12 }}>{associado?.name} Produções Digitais LTDA</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 12 }}>Situação Cadastral: </Text>
                        <Tag color="green" style={{ fontSize: 10 }}>ATIVA</Tag>
                        <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>Natureza Jurídica: </Text>
                        <Text style={{ fontSize: 12 }}>MEI</Text>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {approvedCount < 3 && (
              <Alert
                title="Documentação incompleta — este influencer não pode receber saques até completar a verificação."
                type="warning"
                showIcon
                style={{ marginTop: 16 }}
              />
            )}
            {approvedCount === 3 && (
              <Alert
                title="Todos os documentos obrigatórios foram verificados e aprovados."
                type="success"
                showIcon
                style={{ marginTop: 16 }}
              />
            )}
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Nível de Verificação" size="small">
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <Progress type="circle" percent={verificationPercent} status={verificationStatus} size={120} />
              <div style={{ marginTop: 12 }}>
                <Text strong style={{ fontSize: 16 }}>
                  {approvedCount === 3 ? 'Totalmente Verificado' : approvedCount === 2 ? 'Parcialmente Verificado' : approvedCount === 1 ? 'Verificação Inicial' : 'Não Verificado'}
                </Text>
              </div>
            </div>
            <Divider style={{ margin: '12px 0' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {docs.slice(0, 3).map((doc) => (
                <div key={doc.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text>{doc.label.split('(')[0].trim()}</Text>
                  <Tag color={statusConfig[doc.status].color} style={{ fontSize: 10, margin: 0 }} icon={statusConfig[doc.status].icon}>{statusConfig[doc.status].label}</Tag>
                </div>
              ))}
            </div>
            {approvedCount < 3 && (
              <>
                <Divider style={{ margin: '12px 0' }} />
                <div style={{ background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: 8, padding: 12 }}>
                  <Text strong style={{ fontSize: 13, color: '#d48806', display: 'block', marginBottom: 6 }}>
                    <ExclamationCircleOutlined style={{ marginRight: 4 }} />
                    Ações necessárias para concluir:
                  </Text>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {docs.slice(0, 3).filter((d) => d.status !== 'aprovado').map((doc) => (
                      <div key={doc.key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                        <span style={{ color: statusConfig[doc.status].color }}>{statusConfig[doc.status].icon}</span>
                        <Text style={{ fontSize: 12 }}>
                          {doc.status === 'enviado' && <><Text strong style={{ fontSize: 12 }}>Aprovar</Text> {doc.label.split('(')[0].trim()}</>}
                          {doc.status === 'rejeitado' && <>Aguardar reenvio de {doc.label.split('(')[0].trim()}</>}
                          {doc.status === 'nao_enviado' && <>Solicitar envio de {doc.label.split('(')[0].trim()}</>}
                          {doc.status === 'pendente' && <>Verificar {doc.label.split('(')[0].trim()}</>}
                        </Text>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </Card>

          <Card title="Dados de Contato" size="small" style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div><Text type="secondary"><UserOutlined /> Nome:</Text> <Text strong>{associado?.name}</Text></div>
              <div><Text type="secondary"><PhoneOutlined /> Tel:</Text> <Text>{associado?.phone || '(11) 99999-0000'}</Text></div>
              <div><Text type="secondary">Email:</Text> <Text>{associado?.email}</Text></div>
              {associado?.instagram && <div><Text type="secondary">Instagram:</Text> <Text>@{associado.instagram}</Text></div>}
            </div>
          </Card>

          <Card title="Ações em Lote" size="small" style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Popconfirm title="Aprovar todos os documentos enviados?" okText="Aprovar Todos" cancelText="Cancelar" onConfirm={() => {
                if (cnpjStatus === 'enviado') { setCnpjStatus('aprovado'); }
                if (docStatus === 'enviado') { setDocStatus('aprovado'); }
                if (selfieStatus === 'enviado') { setSelfieStatus('aprovado'); }
                if (comprovanteStatus === 'enviado') { setComprovanteStatus('aprovado'); }
                message.success('Todos os documentos enviados foram aprovados!');
              }}>
                <Button block type="primary" icon={<CheckCircleOutlined />} disabled={!docs.some((d) => d.status === 'enviado')}>Aprovar Todos Enviados</Button>
              </Popconfirm>
              <Button block icon={<MailOutlined />} onClick={() => message.info('Notificação enviada ao influencer solicitando documentos pendentes.')}>Solicitar Documentos Pendentes</Button>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

function SalesTab({ store }: { store: Store }) {
  const sales = useAppSelector((s) => s.vendas.list);
  const products = useAppSelector((s) => s.catalogo.list);
  const storeSales = useMemo(() => {
    return sales.filter((s) => s.storeSlug === store.slug || s.associadoId === store.associadoId).slice(0, 50);
  }, [sales, store]);

  const getProductName = (pid: string) => products.find((p) => p.id === pid)?.name || 'Produto';
  const getCommission = (sale: Sale) => {
    const product = products.find((p) => p.id === sale.productId);
    return product ? (sale.totalPrice * product.commissionPercent / 100) : 0;
  };

  const totalRevenue = storeSales.reduce((s, v) => s + v.totalPrice, 0);
  const totalCommission = storeSales.reduce((s, v) => s + getCommission(v), 0);

  const columns = [
    { title: 'Data', dataIndex: 'createdAt', key: 'date', width: 100, render: (v: string) => new Date(v).toLocaleDateString('pt-BR') },
    { title: 'Produto', dataIndex: 'productId', key: 'product', render: (v: string) => getProductName(v) },
    { title: 'Cliente', dataIndex: 'customerName', key: 'customer', render: (v: string) => v || 'Cliente' },
    { title: 'Qtd', dataIndex: 'quantity', key: 'qty', width: 60 },
    { title: 'Valor', dataIndex: 'totalPrice', key: 'amount', width: 120, render: (v: number) => <Text strong style={{ color: '#52c41a' }}>R$ {v?.toFixed(2)}</Text> },
    { title: 'Comissão', key: 'commission', width: 120, render: (_: unknown, record: Sale) => <Text strong style={{ color: '#722ed1' }}>R$ {getCommission(record).toFixed(2)}</Text> },
    { title: 'Status', dataIndex: 'status', key: 'status', width: 100, render: (v: string) => <Tag color={v === 'aprovada' ? 'green' : v === 'pendente' ? 'orange' : v === 'cancelada' ? 'red' : 'default'}>{v === 'aprovada' ? 'Aprovada' : v === 'pendente' ? 'Pendente' : v === 'cancelada' ? 'Cancelada' : v}</Tag> },
  ];

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={8}>
          <Card><Statistic title="Total de Vendas" value={store.totalSales} prefix={<ShoppingCartOutlined />} /></Card>
        </Col>
        <Col xs={8}>
          <Card><Statistic title="Faturamento" value={totalRevenue} precision={2} prefix="R$" styles={{ content: { color: '#52c41a' } }} /></Card>
        </Col>
        <Col xs={8}>
          <Card><Statistic title="Comissões" value={totalCommission} precision={2} prefix="R$" styles={{ content: { color: '#722ed1' } }} /></Card>
        </Col>
      </Row>
      <Card title={<><DollarOutlined style={{ marginRight: 8 }} />Histórico de Vendas</>}>
        {storeSales.length > 0 ? (
          <Table dataSource={storeSales} columns={columns} rowKey="id" size="small" pagination={{ pageSize: 10 }} />
        ) : (
          <Empty description="Nenhuma venda registrada para esta loja" />
        )}
      </Card>
    </div>
  );
}

function KeysTab({ store }: { store: Store }) {
  const seed = store.id.charCodeAt(store.id.length - 1);
  const apiKey = `dbr_live_${store.slug}_${String(Math.floor(seededRandom(seed) * 900000 + 100000))}`;
  const secretKey = `dbr_secret_${'•'.repeat(24)}`;
  const webhookUrl = `https://api.digitaisbr.com/webhooks/${store.slug}`;
  const pixelId = `DBR-${String(Math.floor(seededRandom(seed + 1) * 9000000 + 1000000))}`;

  return (
    <div>
      <Alert
        title="As chaves de API são sensíveis. Nunca compartilhe a Secret Key. Em caso de vazamento, regenere imediatamente."
        type="warning"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title={<><KeyOutlined style={{ marginRight: 8 }} />Chaves de API</>} size="small">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>API Key (Pública)</Text>
                <Input.Search value={apiKey} readOnly enterButton={<CopyOutlined />} onSearch={() => { navigator.clipboard.writeText(apiKey); message.success('API Key copiada!'); }} />
              </div>
              <div>
                <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>Secret Key (Privada)</Text>
                <Space.Compact style={{ width: '100%' }}>
                  <Input value={secretKey} readOnly style={{ fontFamily: 'monospace' }} />
                  <Tooltip title="Mostrar chave completa"><Button icon={<EyeOutlined />} /></Tooltip>
                  <Tooltip title="Regenerar chave"><Button icon={<ReloadOutlined />} danger /></Tooltip>
                </Space.Compact>
              </div>
              <Divider style={{ margin: '4px 0' }} />
              <div>
                <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>Webhook URL</Text>
                <Input.Search value={webhookUrl} readOnly enterButton={<CopyOutlined />} onSearch={() => { navigator.clipboard.writeText(webhookUrl); message.success('Webhook copiada!'); }} />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title={<><ApiOutlined style={{ marginRight: 8 }} />Integrações</>} size="small">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ padding: 12, background: '#f6ffed', borderRadius: 8, border: '1px solid #b7eb8f' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Space>
                    <LinkOutlined style={{ color: '#52c41a' }} />
                    <div>
                      <Text strong>Pixel de Rastreamento</Text>
                      <br />
                      <Text copyable style={{ fontSize: 12, fontFamily: 'monospace' }}>{pixelId}</Text>
                    </div>
                  </Space>
                  <Tag color="green">Ativo</Tag>
                </div>
              </div>
              <div style={{ padding: 12, background: '#f5f5f5', borderRadius: 8, border: '1px solid #d9d9d9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Space>
                    <ApiOutlined style={{ color: '#888' }} />
                    <div>
                      <Text strong>MercadoPago</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>Gateway de pagamento</Text>
                    </div>
                  </Space>
                  <Tag color="orange">Pendente</Tag>
                </div>
              </div>
              <div style={{ padding: 12, background: '#f5f5f5', borderRadius: 8, border: '1px solid #d9d9d9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Space>
                    <ApiOutlined style={{ color: '#888' }} />
                    <div>
                      <Text strong>Google Analytics</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>Rastreamento avançado</Text>
                    </div>
                  </Space>
                  <Tag color="default">Não configurado</Tag>
                </div>
              </div>
            </div>
          </Card>

          <Card title="Tokens Ativos" size="small" style={{ marginTop: 16 }}>
            <Table
              dataSource={[
                { id: '1', name: 'App Mobile', created: '2025-05-10', lastUsed: '2025-06-28', status: 'ativo' },
                { id: '2', name: 'Website', created: '2025-03-15', lastUsed: '2025-06-30', status: 'ativo' },
              ]}
              columns={[
                { title: 'Nome', dataIndex: 'name', key: 'name' },
                { title: 'Criado', dataIndex: 'created', key: 'created', render: (v: string) => new Date(v).toLocaleDateString('pt-BR') },
                { title: 'Último uso', dataIndex: 'lastUsed', key: 'lastUsed', render: (v: string) => new Date(v).toLocaleDateString('pt-BR') },
                { title: 'Status', dataIndex: 'status', key: 'status', render: () => <Tag color="green">Ativo</Tag> },
                { title: '', key: 'action', width: 80, render: () => <Button size="small" danger icon={<StopOutlined />}>Revogar</Button> },
              ]}
              rowKey="id"
              size="small"
              pagination={false}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}

function ComplianceTab({ store }: { store: Store }) {
  const seed = store.id.charCodeAt(store.id.length - 1);
  const riskScore = Math.floor(seededRandom(seed) * 100);
  const riskLevel = riskScore > 70 ? 'alto' : riskScore > 40 ? 'medio' : 'baixo';
  const riskColor = riskLevel === 'alto' ? '#ff4d4f' : riskLevel === 'medio' ? '#faad14' : '#52c41a';

  const allAlerts = [
    ...(riskScore > 60 ? [{ id: 'a1', type: 'warning' as const, message: 'Volume de vendas atípico detectado', detail: 'Aumento de 340% nas vendas em comparação com a média dos últimos 3 meses.', date: '2025-06-28' }] : []),
    ...(riskScore > 80 ? [{ id: 'a2', type: 'error' as const, message: 'Possível auto-compra detectada', detail: 'IP do comprador coincide com IP do influencer em 3 transações.', date: '2025-06-25' }] : []),
    ...(seededRandom(seed + 5) > 0.6 ? [{ id: 'a3', type: 'info' as const, message: 'Chargeback registrado', detail: 'Cliente contestou compra de R$ 89,90 no cartão.', date: '2025-06-20' }] : []),
    ...(seededRandom(seed + 6) > 0.7 ? [{ id: 'a4', type: 'warning' as const, message: 'Links externos suspeitos', detail: 'Influencer redirecionando tráfego para links fora da plataforma.', date: '2025-06-15' }] : []),
  ];

  const [dismissed, setDismissed] = useState<string[]>([]);
  const [investigating, setInvestigating] = useState<string[]>([]);
  const alerts = allAlerts.filter((a) => !dismissed.includes(a.id));

  const activityLog = [
    { time: '2025-06-30 14:32', action: 'Login realizado', ip: '189.45.123.xxx' },
    { time: '2025-06-30 14:35', action: 'Alterou descrição da loja', ip: '189.45.123.xxx' },
    { time: '2025-06-29 09:10', action: 'Adicionou 2 produtos', ip: '189.45.123.xxx' },
    { time: '2025-06-28 22:45', action: 'Solicitou saque de R$ 850,00', ip: '189.45.123.xxx' },
    { time: '2025-06-27 16:20', action: 'Alterou dados bancários', ip: '177.88.55.xxx' },
    { time: '2025-06-25 11:00', action: 'Login de novo dispositivo', ip: '201.10.77.xxx' },
  ];

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <Card size="small">
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <Progress
                type="dashboard"
                percent={riskScore}
                strokeColor={riskColor}
                size={140}
                format={() => (
                  <div>
                    <div style={{ fontSize: 28, fontWeight: 700, color: riskColor }}>{riskScore}</div>
                    <div style={{ fontSize: 12, color: '#888' }}>Risk Score</div>
                  </div>
                )}
              />
              <div style={{ marginTop: 8 }}>
                <Tag color={riskColor} style={{ fontSize: 14, padding: '4px 16px' }}>
                  {riskLevel === 'alto' ? '⚠ RISCO ALTO' : riskLevel === 'medio' ? '⚡ RISCO MÉDIO' : '✓ RISCO BAIXO'}
                </Tag>
              </div>
            </div>
          </Card>

          <Card title="Ações" size="small" style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Popconfirm title="Suspender esta loja?" description="O influencer não poderá vender até ser reativado." okText="Suspender" cancelText="Cancelar">
                <Button block icon={<StopOutlined />} danger>Suspender Loja</Button>
              </Popconfirm>
              <Popconfirm title="Bloquear saques?" description="Saques ficarão retidos até análise manual." okText="Bloquear" cancelText="Cancelar">
                <Button block icon={<LockOutlined />} style={{ borderColor: '#faad14', color: '#faad14' }}>Bloquear Saques</Button>
              </Popconfirm>
              <Button block icon={<AuditOutlined />}>Solicitar Auditoria</Button>
              <Button block icon={<PhoneOutlined />}>Contatar Influencer</Button>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          {alerts.length > 0 ? (
            <Card title={<><ExclamationCircleOutlined style={{ marginRight: 8, color: '#ff4d4f' }} />Alertas de Fraude ({alerts.length})</>} size="small" style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {alerts.map((alert, i) => {
                  const isChargeback = alert.id === 'a3';
                  return (
                    <div
                      key={i}
                      style={isChargeback ? {
                        border: '2px solid #ff4d4f', borderRadius: 10, padding: 16, background: '#fff1f0',
                        boxShadow: '0 2px 8px rgba(255,77,79,0.12)',
                      } : undefined}
                    >
                      {isChargeback && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                          <Tag color="red" style={{ fontWeight: 700, fontSize: 12, padding: '2px 10px' }}>CHARGEBACK</Tag>
                          <Text type="secondary" style={{ fontSize: 11 }}>{new Date(alert.date).toLocaleDateString('pt-BR')}</Text>
                        </div>
                      )}
                      <Alert
                        title={isChargeback ? (
                          <Text strong style={{ fontSize: 15 }}>{alert.message}</Text>
                        ) : alert.message}
                        description={
                          isChargeback ? (
                            <div>
                              <Text style={{ fontSize: 13 }}>{alert.detail}</Text>
                              <div style={{ marginTop: 4 }}>
                                <Text type="secondary" style={{ fontSize: 12 }}>Prazo para contestação: 15 dias</Text>
                              </div>
                            </div>
                          ) : (
                            <><Text type="secondary" style={{ fontSize: 12 }}>{new Date(alert.date).toLocaleDateString('pt-BR')} — </Text>{alert.detail}</>
                          )
                        }
                        type={isChargeback ? 'error' : alert.type}
                        showIcon
                        action={
                          <Space orientation="vertical" style={{ gap: 6 }}>
                            {investigating.includes(alert.id) ? (
                              <Tag color="processing">Em investigação</Tag>
                            ) : (
                              <Button
                                size={isChargeback ? 'middle' : 'small'}
                                type="primary"
                                danger={isChargeback}
                                ghost={!isChargeback}
                                icon={isChargeback ? <AuditOutlined /> : undefined}
                                onClick={() => { setInvestigating((prev) => [...prev, alert.id]); message.info(`Investigação aberta para: ${alert.message}`); }}
                                style={isChargeback ? { fontWeight: 600 } : undefined}
                              >
                                Investigar
                              </Button>
                            )}
                            <Popconfirm title="Dispensar este alerta?" okText="Sim" cancelText="Não" onConfirm={() => { setDismissed((prev) => [...prev, alert.id]); message.success('Alerta dispensado'); }}>
                              <Button size="small" type={isChargeback ? 'text' : 'default'} style={isChargeback ? { color: '#8c8c8c' } : undefined}>
                                {isChargeback ? 'Repassar ao financeiro' : 'Dispensar'}
                              </Button>
                            </Popconfirm>
                          </Space>
                        }
                      />
                    </div>
                  );
                })}
              </div>
            </Card>
          ) : (
            <Alert title="Nenhum alerta de fraude ativo para esta loja." type="success" showIcon style={{ marginBottom: 16 }} />
          )}

          <Card title={<><CalendarOutlined style={{ marginRight: 8 }} />Log de Atividades</>} size="small">
            <Timeline
              items={activityLog.map((log) => ({
                color: log.action.includes('novo dispositivo') || log.action.includes('dados bancários') ? 'red' : log.action.includes('saque') ? 'orange' : 'blue',
                content: (
                  <div>
                    <Text strong style={{ fontSize: 13 }}>{log.action}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      {new Date(log.time).toLocaleString('pt-BR')} · IP: {log.ip}
                    </Text>
                  </div>
                ),
              }))}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default function LojaConfigPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const store = useAppSelector((s) => s.lojas.list.find((st) => st.id === id));
  const associado = useAppSelector((s) => s.associados.list.find((a) => a.id === store?.associadoId));
  const plan = useAppSelector((s) => s.planos.list.find((p) => p.id === associado?.planId));
  const allProducts = useAppSelector((s) => s.catalogo.list);

  const [selectedProductIds, setSelectedProductIds] = useState<string[]>(store?.productIds || []);

  const maxProducts = plan?.maxProducts ?? 20;
  const canAddMore = maxProducts === -1 || selectedProductIds.length < maxProducts;

  if (!store || !associado) return <Empty description="Loja não encontrada" />;

  const handleToggleProduct = (productId: string) => {
    if (selectedProductIds.includes(productId)) {
      setSelectedProductIds(selectedProductIds.filter((pid) => pid !== productId));
    } else if (canAddMore) {
      setSelectedProductIds([...selectedProductIds, productId]);
    } else {
      message.warning(`Limite de ${maxProducts} produtos atingido para o plano ${plan?.name}`);
    }
  };

  const tabItems = [
    {
      key: 'overview',
      label: <><EyeOutlined /> Visão Geral</>,
      children: <OverviewTab store={store} associado={associado} plan={plan} />,
    },
    {
      key: 'products',
      label: <><ShoppingCartOutlined /> Produtos</>,
      children: <ProductsTab allProducts={allProducts} selectedProductIds={selectedProductIds} onToggleProduct={handleToggleProduct} maxProducts={maxProducts} associado={associado} />,
    },
    {
      key: 'documents',
      label: <><FileTextOutlined /> Documentos</>,
      children: <DocumentsTab associado={associado} />,
    },
    {
      key: 'sales',
      label: <><DollarOutlined /> Vendas</>,
      children: <SalesTab store={store} />,
    },
    {
      key: 'keys',
      label: <><KeyOutlined /> Chaves & API</>,
      children: <KeysTab store={store} />,
    },
    {
      key: 'compliance',
      label: <><SafetyCertificateOutlined /> Compliance</>,
      children: <ComplianceTab store={store} />,
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/lojas')} />
          <Title level={4} style={{ margin: 0 }}><ShopOutlined style={{ marginRight: 8 }} />{store.name}</Title>
          <Tag color={store.active ? 'green' : 'default'}>{store.active ? 'Ativa' : 'Inativa'}</Tag>
        </Space>
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => navigate(`/lojas/${id}/preview`)}>Preview</Button>
        </Space>
      </div>

      <Tabs items={tabItems} defaultActiveKey="overview" />
    </div>
  );
}
