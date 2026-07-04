import { useState } from 'react';
import { Card, Typography, Tag, List, Avatar, Input, Button, Space, Form, Modal, message } from 'antd';
import { CommentOutlined, UserOutlined, SearchOutlined, PlusOutlined, LikeOutlined, MessageOutlined } from '@ant-design/icons';
import { useAppSelector, useAppDispatch } from '../../store';
import { addTopic } from '../../store/slices/comunidadeSlice';
import type { ForumTopic } from '../../types';

const { Title, Text } = Typography;

const categoryColors: Record<string, string> = {
  'Dúvidas': 'blue',
  'Dicas': 'green',
  'Networking': 'purple',
  'Sugestões': 'orange',
  'Off-Topic': 'default',
};

export default function PortalComunidadePage() {
  const dispatch = useAppDispatch();
  const topics = useAppSelector((s) => s.comunidade.list);
  const { user } = useAppSelector((s) => s.auth);
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [form] = Form.useForm();

  const filtered = topics.filter((t) =>
    !search || t.title.toLowerCase().includes(search.toLowerCase()) || t.authorName.toLowerCase().includes(search.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => new Date(b.lastReplyAt || b.createdAt).getTime() - new Date(a.lastReplyAt || a.createdAt).getTime());

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>
          <CommentOutlined style={{ marginRight: 8 }} />
          Comunidade
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setFormOpen(true)}>Novo Tópico</Button>
      </div>

      <Input placeholder="Buscar tópicos..." prefix={<SearchOutlined />} value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: 300, marginBottom: 16 }} allowClear />

      <Card>
        <List
          dataSource={sorted}
          renderItem={(t) => (
            <List.Item>
              <List.Item.Meta
                avatar={<Avatar icon={<UserOutlined />} style={{ background: '#1677ff' }} />}
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Text strong style={{ fontSize: 14 }}>{t.title}</Text>
                    <Tag color={categoryColors[t.category] || 'default'}>{t.category}</Tag>
                    {t.status === 'fixado' && <Tag color="red">Fixo</Tag>}
                  </div>
                }
                description={
                  <Space>
                    <Text type="secondary" style={{ fontSize: 12 }}>por {t.authorName}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>·</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>{new Date(t.lastReplyAt || t.createdAt).toLocaleDateString('pt-BR')}</Text>
                  </Space>
                }
              />
              <Space size="large">
                <Space size={4}>
                  <MessageOutlined style={{ color: '#8c8c8c' }} />
                  <Text type="secondary" style={{ fontSize: 12 }}>{t.replies}</Text>
                </Space>
                <Space size={4}>
                  <LikeOutlined style={{ color: '#8c8c8c' }} />
                  <Text type="secondary" style={{ fontSize: 12 }}>{t.likes}</Text>
                </Space>
                <Space size={4}>
                  <UserOutlined style={{ color: '#8c8c8c' }} />
                  <Text type="secondary" style={{ fontSize: 12 }}>{t.views}</Text>
                </Space>
              </Space>
            </List.Item>
          )}
          pagination={{ pageSize: 10, showTotal: (t) => `${t} tópicos` }}
        />
      </Card>

      <Modal
        title="Novo Tópico"
        open={formOpen}
        onCancel={() => { setFormOpen(false); form.resetFields(); }}
        onOk={() => form.submit()}
        okText="Publicar"
        cancelText="Cancelar"
      >
        <Form form={form} layout="vertical" onFinish={(values) => {
          const topic: ForumTopic = {
            id: `topic-${Date.now()}`,
            title: values.title,
            body: values.message || '',
            authorId: user?.id || '1',
            authorName: user?.name || 'Associado',
            category: values.category,
            status: 'aberto',
            replies: 0,
            views: 0,
            likes: 0,
            lastReplyAt: null,
            createdAt: new Date().toISOString(),
          };
          dispatch(addTopic(topic));
          message.success('Tópico criado!');
          setFormOpen(false);
          form.resetFields();
        }}>
          <Form.Item name="title" label="Título" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="category" label="Categoria" rules={[{ required: true }]} initialValue="Dúvidas">
            <Input.Group>
              <Space wrap>
                {Object.keys(categoryColors).map((c) => (
                  <Tag.CheckableTag key={c} checked={form.getFieldValue('category') === c} onChange={() => form.setFieldsValue({ category: c })}>
                    {c}
                  </Tag.CheckableTag>
                ))}
              </Space>
            </Input.Group>
          </Form.Item>
          <Form.Item name="message" label="Mensagem" rules={[{ required: true }]}><Input.TextArea rows={4} /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
