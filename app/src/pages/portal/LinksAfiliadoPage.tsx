import { useState } from 'react';
import { Card, Typography, Table, Tag, Button, Input, Space, Statistic, Row, Col, message, Tooltip, Modal } from 'antd';
import {
  LinkOutlined, CopyOutlined, BarChartOutlined, ShoppingCartOutlined,
  EyeOutlined, RiseOutlined, QrcodeOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useAppSelector } from '../../store';

const { Title, Text, Paragraph } = Typography;

function seededRandom(seed: number): number {
  return Math.abs(Math.sin(seed) * 10000) % 1;
}

interface AffiliateLink {
  id: string;
  productId: string;
  productName: string;
  category: string;
  code: string;
  url: string;
  clicks: number;
  conversions: number;
  revenue: number;
  commission: number;
  createdAt: string;
}

export default function LinksAfiliadoPage() {
  const catalogo = useAppSelector((s) => s.catalogo.list);
  const lojas = useAppSelector((s) => s.lojas.list);
  const associados = useAppSelector((s) => s.associados.list);
  const { user } = useAppSelector((s) => s.auth);
  const [search, setSearch] = useState('');
  const [qrModal, setQrModal] = useState<AffiliateLink | null>(null);

  const associado = associados.find((a) => a.id === (user?.id || 'assoc-1')) || associados[0];
  const loja = lojas.find((l) => l.associadoId === associado?.id);
  const refCode = associado?.name?.split(' ')[0]?.toUpperCase() || 'REF';

  const links: AffiliateLink[] = (loja?.productIds || []).map((pid, i) => {
    const product = catalogo.find((p) => p.id === pid);
    if (!product) return null;
    const seed = i * 7 + 13;
    const clicks = Math.floor(seededRandom(seed) * 500) + 20;
    const convRate = seededRandom(seed + 1) * 0.08 + 0.02;
    const conversions = Math.floor(clicks * convRate);
    const revenue = conversions * product.price;
    const commission = revenue * (product.commissionPercent / 100);
    return {
      id: `link-${i}`,
      productId: pid,
      productName: product.name,
      category: product.categoryId,
      code: `${refCode}${i + 1}`,
      url: `https://digitaisbr-plataforma.web.app/loja/${loja?.slug}?ref=${refCode}${i + 1}`,
      clicks,
      conversions,
      revenue,
      commission,
      createdAt: new Date(Date.now() - (30 - i) * 86400000).toISOString().split('T')[0],
    };
  }).filter(Boolean) as AffiliateLink[];

  const filtered = links.filter((l) =>
    !search || l.productName.toLowerCase().includes(search.toLowerCase()) || l.code.toLowerCase().includes(search.toLowerCase())
  );

  const totalClicks = links.reduce((s, l) => s + l.clicks, 0);
  const totalConversions = links.reduce((s, l) => s + l.conversions, 0);
  const totalRevenue = links.reduce((s, l) => s + l.revenue, 0);
  const totalCommission = links.reduce((s, l) => s + l.commission, 0);
  const avgConversion = totalClicks > 0 ? ((totalConversions / totalClicks) * 100) : 0;

  const copyLink = (url: string) => {
    navigator.clipboard.writeText(url).then(() => message.success('Link copiado!')).catch(() => message.info(url));
  };

  const columns: ColumnsType<AffiliateLink> = [
    {
      title: 'Produto',
      dataIndex: 'productName',
      key: 'productName',
      render: (name: string) => <Text strong style={{ fontSize: 13 }}>{name}</Text>,
    },
    {
      title: 'Código',
      dataIndex: 'code',
      key: 'code',
      render: (code: string) => <Tag color="blue">{code}</Tag>,
    },
    {
      title: 'Cliques',
      dataIndex: 'clicks',
      key: 'clicks',
      sorter: (a, b) => a.clicks - b.clicks,
      render: (v: number) => v.toLocaleString(),
    },
    {
      title: 'Conversões',
      dataIndex: 'conversions',
      key: 'conversions',
      sorter: (a, b) => a.conversions - b.conversions,
    },
    {
      title: 'Taxa',
      key: 'rate',
      render: (_: unknown, r: AffiliateLink) => {
        const rate = r.clicks > 0 ? (r.conversions / r.clicks) * 100 : 0;
        return <Tag color={rate > 5 ? 'green' : rate > 2 ? 'orange' : 'red'}>{rate.toFixed(1)}%</Tag>;
      },
      sorter: (a, b) => (a.conversions / (a.clicks || 1)) - (b.conversions / (b.clicks || 1)),
    },
    {
      title: 'Receita',
      dataIndex: 'revenue',
      key: 'revenue',
      sorter: (a, b) => a.revenue - b.revenue,
      render: (v: number) => `R$ ${v.toFixed(2)}`,
    },
    {
      title: 'Comissão',
      dataIndex: 'commission',
      key: 'commission',
      sorter: (a, b) => a.commission - b.commission,
      render: (v: number) => <Text style={{ color: '#52c41a', fontWeight: 600 }}>R$ {v.toFixed(2)}</Text>,
    },
    {
      title: 'Ações',
      key: 'actions',
      render: (_: unknown, r: AffiliateLink) => (
        <Space>
          <Tooltip title="Copiar link"><Button type="text" icon={<CopyOutlined />} size="small" onClick={() => copyLink(r.url)} /></Tooltip>
          <Tooltip title="QR Code"><Button type="text" icon={<QrcodeOutlined />} size="small" onClick={() => setQrModal(r)} /></Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={4} style={{ margin: '0 0 16px' }}>
        <LinkOutlined style={{ marginRight: 8 }} />
        Links de Afiliado
      </Title>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={4}>
          <Card><Statistic title="Links Ativos" value={links.length} prefix={<LinkOutlined />} /></Card>
        </Col>
        <Col xs={12} sm={4}>
          <Card><Statistic title="Total Cliques" value={totalClicks} prefix={<EyeOutlined />} /></Card>
        </Col>
        <Col xs={12} sm={4}>
          <Card><Statistic title="Conversões" value={totalConversions} prefix={<ShoppingCartOutlined />} /></Card>
        </Col>
        <Col xs={12} sm={4}>
          <Card><Statistic title="Taxa Média" value={avgConversion} precision={1} suffix="%" prefix={<RiseOutlined />} valueStyle={{ color: avgConversion > 3 ? '#52c41a' : '#faad14' }} /></Card>
        </Col>
        <Col xs={12} sm={4}>
          <Card><Statistic title="Receita Total" value={totalRevenue} precision={2} prefix="R$" /></Card>
        </Col>
        <Col xs={12} sm={4}>
          <Card><Statistic title="Comissão Total" value={totalCommission} precision={2} prefix="R$" valueStyle={{ color: '#52c41a' }} /></Card>
        </Col>
      </Row>

      <Card
        title={<><BarChartOutlined /> Meus Links</>}
        extra={<Input placeholder="Buscar..." prefix={<LinkOutlined />} value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: 220 }} allowClear size="small" />}
      >
        <Table columns={columns} dataSource={filtered} rowKey="id" size="small" pagination={{ pageSize: 10 }} />
      </Card>

      <Modal title="Link de Afiliado" open={!!qrModal} onCancel={() => setQrModal(null)} footer={[
        <Button key="copy" type="primary" icon={<CopyOutlined />} onClick={() => { if (qrModal) copyLink(qrModal.url); }}>Copiar Link</Button>,
        <Button key="close" onClick={() => setQrModal(null)}>Fechar</Button>,
      ]}>
        {qrModal && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ background: '#f5f5f5', padding: 24, borderRadius: 12, marginBottom: 16 }}>
              <QrcodeOutlined style={{ fontSize: 120, color: '#1677ff' }} />
              <Paragraph type="secondary" style={{ marginTop: 8 }}>QR Code gerado automaticamente</Paragraph>
            </div>
            <Paragraph copyable style={{ background: '#f0f5ff', padding: '8px 12px', borderRadius: 8, fontSize: 12, wordBreak: 'break-all' }}>
              {qrModal.url}
            </Paragraph>
            <Text type="secondary">Código: <Tag color="blue">{qrModal.code}</Tag></Text>
          </div>
        )}
      </Modal>
    </div>
  );
}
