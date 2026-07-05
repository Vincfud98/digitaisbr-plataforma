import { useState, useMemo } from 'react';
import { Table, Tag, Typography, Card, Row, Col, Statistic, Select, Space, Divider } from 'antd';
import { BankOutlined, ArrowUpOutlined, ArrowDownOutlined, FundOutlined } from '@ant-design/icons';
import { useAppSelector } from '../../store';
import type { FinancialTransaction, TransactionType } from '../../types';

const { Title, Text } = Typography;

export default function FinanceiroPage() {
  const transactions = useAppSelector((s) => s.financeiro.list);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const categories = useMemo(() => [...new Set(transactions.map((t) => t.category))], [transactions]);

  const filtered = transactions.filter((t) => {
    if (typeFilter !== 'all' && t.type !== typeFilter) return false;
    if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
    return true;
  });

  const totalEntrada = transactions.filter((t) => t.type === 'entrada').reduce((sum, t) => sum + t.amount, 0);
  const totalSaida = transactions.filter((t) => t.type === 'saida').reduce((sum, t) => sum + t.amount, 0);
  const saldo = totalEntrada - totalSaida;

  const monthlyData = useMemo(() => {
    const months: Record<string, { entrada: number; saida: number }> = {};
    transactions.forEach((t) => {
      const month = t.createdAt.slice(0, 7);
      if (!months[month]) months[month] = { entrada: 0, saida: 0 };
      months[month][t.type] += t.amount;
    });
    return Object.entries(months).sort((a, b) => b[0].localeCompare(a[0])).slice(0, 3);
  }, [transactions]);

  const columns = [
    {
      title: 'Data',
      dataIndex: 'createdAt',
      key: 'date',
      width: 110,
      sorter: (a: FinancialTransaction, b: FinancialTransaction) => a.createdAt.localeCompare(b.createdAt),
      defaultSortOrder: 'descend' as const,
      render: (v: string) => new Date(v).toLocaleDateString('pt-BR'),
    },
    {
      title: 'Tipo',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (v: TransactionType) => (
        <Tag color={v === 'entrada' ? 'green' : 'red'} icon={v === 'entrada' ? <ArrowUpOutlined /> : <ArrowDownOutlined />}>
          {v === 'entrada' ? 'Entrada' : 'Saída'}
        </Tag>
      ),
    },
    {
      title: 'Categoria',
      dataIndex: 'category',
      key: 'category',
      width: 130,
      render: (v: string) => <Tag>{v}</Tag>,
    },
    {
      title: 'Descrição',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Valor',
      dataIndex: 'amount',
      key: 'amount',
      width: 140,
      sorter: (a: FinancialTransaction, b: FinancialTransaction) => a.amount - b.amount,
      render: (v: number, r: FinancialTransaction) => (
        <Text strong style={{ color: r.type === 'entrada' ? '#52c41a' : '#ff4d4f' }}>
          {r.type === 'entrada' ? '+' : '-'} R$ {v.toFixed(2)}
        </Text>
      ),
    },
  ];

  return (
    <div>
      <Title level={4} style={{ margin: '0 0 16px' }}>
        <BankOutlined style={{ marginRight: 8 }} />
        Painel Financeiro
      </Title>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={6}>
          <Card><Statistic title="Total Entradas" value={totalEntrada} precision={2} prefix="R$" styles={{ content: { color: '#52c41a' } }} /></Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card><Statistic title="Total Saídas" value={totalSaida} precision={2} prefix="R$" styles={{ content: { color: '#ff4d4f' } }} /></Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card><Statistic title="Saldo" value={saldo} precision={2} prefix="R$" styles={{ content: { color: saldo >= 0 ? '#52c41a' : '#ff4d4f' } }} /></Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card><Statistic title="Transações" value={transactions.length} prefix={<FundOutlined />} styles={{ content: { color: '#1677ff' } }} /></Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        {monthlyData.map(([month, data]) => {
          const [y, m] = month.split('-');
          const label = `${['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'][parseInt(m) - 1]}/${y}`;
          return (
            <Col xs={24} sm={8} key={month}>
              <Card size="small" title={label}>
                <Space orientation="vertical" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text type="success"><ArrowUpOutlined /> Entradas</Text>
                    <Text strong>R$ {data.entrada.toFixed(2)}</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text type="danger"><ArrowDownOutlined /> Saídas</Text>
                    <Text strong>R$ {data.saida.toFixed(2)}</Text>
                  </div>
                  <Divider style={{ margin: '8px 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text>Resultado</Text>
                    <Text strong style={{ color: data.entrada - data.saida >= 0 ? '#52c41a' : '#ff4d4f' }}>
                      R$ {(data.entrada - data.saida).toFixed(2)}
                    </Text>
                  </div>
                </Space>
              </Card>
            </Col>
          );
        })}
      </Row>

      <Card>
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          <Select value={typeFilter} onChange={setTypeFilter} style={{ width: 150 }}>
            <Select.Option value="all">Todos tipos</Select.Option>
            <Select.Option value="entrada">Entradas</Select.Option>
            <Select.Option value="saida">Saídas</Select.Option>
          </Select>
          <Select value={categoryFilter} onChange={setCategoryFilter} style={{ width: 180 }}>
            <Select.Option value="all">Todas categorias</Select.Option>
            {categories.map((c) => <Select.Option key={c} value={c}>{c}</Select.Option>)}
          </Select>
        </div>

        <Table
          dataSource={filtered}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 15, showSizeChanger: false, showTotal: (t) => `${t} transações` }}
          size="middle"
        />
      </Card>
    </div>
  );
}
