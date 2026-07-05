import { useState } from 'react';
import { Card, Typography, Tag, Row, Col, Button, Input, Avatar, Space, Divider, Switch, message, Tooltip, Upload } from 'antd';
import {
  UserOutlined, LinkOutlined, InstagramOutlined, YoutubeOutlined,
  GlobalOutlined, CopyOutlined, EditOutlined, EyeOutlined,
  ShopOutlined, MailOutlined, PhoneOutlined, SaveOutlined, UploadOutlined,
} from '@ant-design/icons';
import { useAppSelector, useAppDispatch } from '../../store';
import { updateAssociado } from '../../store/slices/associadosSlice';
import { uploadAvatar } from '../../lib/storageService';

const { Title, Text, Paragraph } = Typography;

export default function MeuPerfilPage() {
  const { user } = useAppSelector((s) => s.auth);
  const associados = useAppSelector((s) => s.associados.list);
  const lojas = useAppSelector((s) => s.lojas.list);
  const dispatch = useAppDispatch();

  const associado = associados.find((a) => a.id === (user?.id || 'assoc-1')) || associados[0];
  const loja = lojas.find((l) => l.associadoId === associado?.id);

  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState(associado?.bio || '');
  const [instagram, setInstagram] = useState(associado?.instagram || '');
  const [youtube, setYoutube] = useState(associado?.youtube || '');
  const [tiktok, setTiktok] = useState(associado?.tiktok || '');
  const [website, setWebsite] = useState(associado?.website || '');
  const [showEmail, setShowEmail] = useState(associado?.showEmail ?? true);
  const [showPhone, setShowPhone] = useState(associado?.showPhone ?? false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const profileUrl = `https://digitaisbr-plataforma.web.app/loja/${loja?.slug || 'minha-loja'}`;

  const copyLink = () => {
    navigator.clipboard.writeText(profileUrl).then(() => message.success('Link copiado!')).catch(() => message.info(profileUrl));
  };

  const handleAvatarSelect = (file: File) => {
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setAvatarPreview(e.target?.result as string);
    reader.readAsDataURL(file);
    return false;
  };

  const handleSave = async () => {
    if (!associado) return;
    setSaving(true);
    try {
      let avatar = associado.avatar || '';
      if (avatarFile) {
        avatar = await uploadAvatar(avatarFile, associado.id);
      }
      dispatch(updateAssociado({
        ...associado,
        bio,
        instagram,
        youtube,
        tiktok,
        website,
        showEmail,
        showPhone,
        avatar,
      }));
      message.success('Perfil atualizado com sucesso!');
      setEditing(false);
      setAvatarFile(null);
    } catch {
      message.error('Erro ao salvar perfil.');
    } finally {
      setSaving(false);
    }
  };

  const currentAvatar = avatarPreview || associado?.avatar;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>
          <UserOutlined style={{ marginRight: 8 }} />
          Meu Perfil Público
        </Title>
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => window.open(profileUrl, '_blank')}>Ver Perfil</Button>
          <Button type="primary" icon={editing ? <SaveOutlined /> : <EditOutlined />} onClick={editing ? handleSave : () => setEditing(true)} loading={saving}>
            {editing ? 'Salvar' : 'Editar'}
          </Button>
        </Space>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={10}>
          <Card>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              {currentAvatar ? (
                <Avatar size={100} src={currentAvatar} style={{ marginBottom: 12 }} />
              ) : (
                <Avatar size={100} icon={<UserOutlined />} style={{ background: '#1677ff', marginBottom: 12 }} />
              )}
              {editing && (
                <div style={{ marginBottom: 8 }}>
                  <Upload accept="image/*" maxCount={1} showUploadList={false} beforeUpload={handleAvatarSelect}>
                    <Button size="small" icon={<UploadOutlined />}>Trocar Foto</Button>
                  </Upload>
                </div>
              )}
              <Title level={4} style={{ margin: '0 0 4px' }}>{associado?.name || 'Associado'}</Title>
              <Tag color="purple">Influencer DigitaisBR</Tag>
            </div>

            <Divider />

            <div style={{ marginBottom: 16 }}>
              <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Bio</Text>
              {editing ? (
                <Input.TextArea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} showCount maxLength={200} />
              ) : (
                <Paragraph style={{ margin: 0 }}>{bio || <Text type="secondary">Sem bio</Text>}</Paragraph>
              )}
            </div>

            <Divider />

            <div>
              <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>Redes Sociais</Text>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <InstagramOutlined style={{ fontSize: 18, color: '#E4405F' }} />
                  {editing ? <Input value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="@usuario" size="small" /> : <Text>{instagram || '-'}</Text>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <YoutubeOutlined style={{ fontSize: 18, color: '#FF0000' }} />
                  {editing ? <Input value={youtube} onChange={(e) => setYoutube(e.target.value)} placeholder="Canal YouTube" size="small" /> : <Text>{youtube || '-'}</Text>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 16, fontWeight: 700 }}>T</span>
                  {editing ? <Input value={tiktok} onChange={(e) => setTiktok(e.target.value)} placeholder="@usuario" size="small" /> : <Text>{tiktok || '-'}</Text>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <GlobalOutlined style={{ fontSize: 18, color: '#1677ff' }} />
                  {editing ? <Input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://seusite.com" size="small" /> : <Text>{website || '-'}</Text>}
                </div>
              </Space>
            </div>

            <Divider />

            <div>
              <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>Privacidade</Text>
              <Space direction="vertical">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Switch size="small" checked={showEmail} onChange={setShowEmail} disabled={!editing} />
                  <Text style={{ fontSize: 12 }}>Mostrar email no perfil</Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Switch size="small" checked={showPhone} onChange={setShowPhone} disabled={!editing} />
                  <Text style={{ fontSize: 12 }}>Mostrar telefone no perfil</Text>
                </div>
              </Space>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={14}>
          <Card title="Preview do Perfil Público" style={{ marginBottom: 16 }}>
            <div style={{
              background: 'linear-gradient(135deg, #1677ff, #722ed1)',
              borderRadius: 12,
              padding: '32px 24px',
              textAlign: 'center',
              color: '#fff',
            }}>
              {currentAvatar ? (
                <Avatar size={80} src={currentAvatar} style={{ border: '3px solid rgba(255,255,255,0.4)', marginBottom: 12 }} />
              ) : (
                <Avatar size={80} icon={<UserOutlined />} style={{ background: 'rgba(255,255,255,0.2)', border: '3px solid rgba(255,255,255,0.4)', marginBottom: 12 }} />
              )}
              <Title level={3} style={{ color: '#fff', margin: '0 0 4px' }}>{associado?.name}</Title>
              <Paragraph style={{ color: 'rgba(255,255,255,0.85)', maxWidth: 400, margin: '0 auto 16px' }}>{bio || 'Sem bio'}</Paragraph>

              <Space wrap style={{ justifyContent: 'center', marginBottom: 16 }}>
                {instagram && <Tag style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none' }}><InstagramOutlined /> {instagram}</Tag>}
                {youtube && <Tag style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none' }}><YoutubeOutlined /> {youtube}</Tag>}
                {tiktok && <Tag style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none' }}>T {tiktok}</Tag>}
              </Space>

              <div>
                <Button type="primary" size="large" icon={<ShopOutlined />} style={{ background: 'rgba(255,255,255,0.2)', borderColor: 'rgba(255,255,255,0.3)' }}>
                  Visitar Minha Loja
                </Button>
              </div>

              <div style={{ marginTop: 16 }}>
                {showEmail && <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, display: 'block' }}><MailOutlined /> {associado?.email}</Text>}
                {showPhone && <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, display: 'block' }}><PhoneOutlined /> {associado?.phone}</Text>}
              </div>
            </div>
          </Card>

          <Card title="Link do Perfil">
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <Input value={profileUrl} readOnly style={{ flex: 1, background: '#f5f5f5' }} prefix={<LinkOutlined />} />
              <Tooltip title="Copiar link">
                <Button type="primary" icon={<CopyOutlined />} onClick={copyLink}>Copiar</Button>
              </Tooltip>
            </div>
            <Text type="secondary" style={{ fontSize: 11, marginTop: 8, display: 'block' }}>
              Compartilhe este link nas suas redes sociais e na bio do Instagram!
            </Text>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
