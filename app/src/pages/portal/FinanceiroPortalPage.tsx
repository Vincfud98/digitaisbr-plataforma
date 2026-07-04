import { useState } from 'react';
import { Card, Typography, Tag, Row, Col, Statistic, Table, Button, Modal, Form, Input, Select, message, Space, Alert } from 'antd';
import {
  WalletOutlined, DollarOutlined, ClockCircleOutlined,
  ArrowUpOutlined, PlusOutlined, HistoryOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;

function seededRandom(seed: number): number {
  return Math.abs(Math.sin(seed) * 10000) % 1;
}

interface Withdrawal {
  id: string;
  amount: number;
  method: 'pix' | 'bank';
  status: 'pendente' | 'processando' | 'concluido' | 'rejeitado';
  pixKey?: string;
  bankInfo?: string;
  requestedAt: string;
  completedAt: string | null;
}

const statusConfig: Record<string, { color: string; label: string }> = {
  pendente: { color: 'orange', label: 'Pendente' },
  processando: { color: 'blue', label: 'Processando' },
  concluido: { color: 'green', label: 'Concluído' },
  rejeitado: { color: 'red', label: 'Rejeitado' },
};

const initialWithdrawals: Withdrawal[] = Array.from({ length: 8 }, (_, i) => {
  const seed = i * 11 + 3;
  const statuses: Withdrawal['status'][] = ['concluido', 'concluido', 'concluido', 'processando', 'pendente', 'concluido', 'concluido', 'rejeitado'];
  return {
    id: `saq-${i + 1}`,
    amount: Math.floor(seededRandom(seed) * 2000) + 100,
    method: i % 3 === 0 ? 'bank' : 'pix',
    status: statuses[i],
    pixKey: i % 3 !== 0 ? 'maria@email.com' : undefined,
    bankInfo: i % 3 === 0 ? 'Banco do Brasil · Ag 1234 · CC 56789-0' : undefined,
    requestedAt: new Date(Date.now() - (60 - i * 7) * 86400000).toISOString().split('T')[0],
    completedAt: statuses[i] === 'concluido' ? new Date(Date.now() - (57 - i * 7) * 86400000).toISOString().split('T')[0] : null,
  };
});

export default function FinanceiroPortalPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>(initialWithdrawals);
  const [formOpen, setFormOpen] = useState(false);
  const [form] = Form.useForm();
  const [method, setMethod] = useState<'pix' | 'bank'>('pix');

  const totalEarned = 12450.80;
  const totalWithdrawn = withdrawals.filter((w) => w.status === 'concluido').reduce((s, w) => s + w.amount, 0);
  const pending = withdrawals.filter((w) => w.status === 'pendente' || w.status === 'processando').reduce((s, w) => s + w.amount, 0);
  const available = totalEarned - totalWithdrawn - pending;

  const handleWithdraw = (values: { amount: number; method: 'pix' | 'bank'; pixKey?: string; bank?: string; agency?: string; account?: string }) => {
    if (values.amount > available) {
      message.error('Saldo insuficiente!');
      return;
    }
    if (values.amount < 50) {
      message.error('Valor mínimo para saque: R$ 50,00');
      return;
    }
    const newW: Withdrawal = {
      id: `saq-${Date.now()}`,
      amount: values.amount,
      method: values.method,
      status: 'pendente',
      pixKey: values.pixKey,
      bankInfo: values.method === 'bank' ? `${values.bank} · Ag ${values.agency} · CC ${values.account}` : undefined,
      requestedAt: new Date().toISOString().split('T')[0],
      completedAt: null,
    };
    setWithdrawals([newW, ...withdrawals]);
    message.success('Solicitação de saque enviada! Prazo: 3 dias úteis.');
    setFormOpen(false);
    form.resetFields();
  };

  const columns: ColumnsType<Withdrawal> = [
    { title: 'Data', dataIndex: 'requestedAt', key: 'date', render: (d: string) => new Date(d).toLocaleDateString('pt-BR') },
    { title: 'Valor', dataIndex: 'amount', key: 'amount', render: (v: number) => <Text strong>R$ {v.toFixed(2)}</Text> },
    { title: 'Método', dataIndex: 'method', key: 'method', render: (m: string) => <Tag color={m === 'pix' ? 'green' : 'blue'}>{m === 'pix' ? 'PIX' : 'TED'}</Tag> },
    { title: 'Destino', key: 'dest', render: (_: unknown, r: Withdrawal) => <Text type="secondary" style={{ fontSize: 12 }}>{r.pixKey || r.bankInfo || '-'}</Text> },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s: string) => <Tag color={statusConfig[s].color}>{statusConfig[s].label}</Tag> },
    { title: 'Conclusão', dataIndex: 'completedAt', key: 'done', render: (d: string | null) => d ? new Date(d).toLocaleDateString('pt-BR') : '-' },
  ];

  return (
    <div>
      <Title level={4} style={{ margin: '0 0 16px' }}>
        <WalletOutlined style={{ marginRight: 8 }} />
        Meu Financeiro
      </Title>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}>
          <Card><Statistic title="Total Ganho" value={totalEarned} precision={2} prefix="R$" valueStyle={{ color: '#1677ff' }} /></Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic title="Disponível para Saque" value={available} precision={2} prefix="R$" valueStyle={{ color: '#52c41a', fontWeight: 700 }} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card><Statistic title="Saques Realizados" value={totalWithdrawn} precision={2} prefix={<><ArrowUpOutlined /> R$</>} /></Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card><Statistic title="Em Processamento" value={pending} precision={2} prefix={<><ClockCircleOutlined /> R$</>} valueStyle={{ color: '#faad14' }} /></Card>
        </Col>
      </Row>

      {available >= 50 && (
        <Alert
          message={`Você tem R$ ${available.toFixed(2)} disponível para saque!`}
          type="success"
          showIcon
          action={<Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => setFormOpen(true)}>Solicitar Saque</Button>}
          style={{ marginBottom: 16 }}
        />
      )}

      <Card
        title={<><HistoryOutlined /> Histórico de Saques</>}
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setFormOpen(true)}>Novo Saque</Button>}
      >
        <Table columns={columns} dataSource={withdrawals} rowKey="id" size="small" pagination={{ pageSize: 10 }} />
      </Card>

      <Modal
        title="Solicitar Saque"
        open={formOpen}
        onCancel={() => { setFormOpen(false); form.resetFields(); }}
        onOk={() => form.submit()}
        okText="Solicitar Saque"
        cancelText="Cancelar"
      >
        <Alert message={`Saldo disponível: R$ ${available.toFixed(2)}`} type="info" showIcon style={{ marginBottom: 16 }} />
        <Form form={form} layout="vertical" onFinish={handleWithdraw} initialValues={{ method: 'pix' }}>
          <Form.Item name="amount" label="Valor do saque (R$)" rules={[{ required: true, message: 'Informe o valor' }]}>
            <Input type="number" min={50} step={0.01} placeholder="Mínimo R$ 50,00" prefix={<DollarOutlined />} />
          </Form.Item>
          <Form.Item name="method" label="Método">
            <Select onChange={(v) => setMethod(v)} options={[{ value: 'pix', label: 'PIX' }, { value: 'bank', label: 'Transferência Bancária (TED)' }]} />
          </Form.Item>
          {method === 'pix' ? (
            <Form.Item name="pixKey" label="Chave PIX" rules={[{ required: true, message: 'Informe a chave PIX' }]}>
              <Input placeholder="CPF, Email, Telefone ou Chave aleatória" />
            </Form.Item>
          ) : (
            <>
              <Form.Item name="bank" label="Banco" rules={[{ required: true }]}><Input placeholder="Nome do banco" /></Form.Item>
              <Space style={{ width: '100%' }}>
                <Form.Item name="agency" label="Agência" rules={[{ required: true }]}><Input placeholder="0000" /></Form.Item>
                <Form.Item name="account" label="Conta" rules={[{ required: true }]}><Input placeholder="00000-0" /></Form.Item>
              </Space>
            </>
          )}
        </Form>
      </Modal>
    </div>
  );
}
