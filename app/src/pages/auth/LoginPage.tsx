import { useState } from 'react';
import { Button, Card, Form, Input, Typography, message, Divider, Modal } from 'antd';
import { UserOutlined, LockOutlined, GoogleOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { loginStart, loginSuccess, loginFailure } from '../../store/slices/authSlice';
import { loginUser, loginWithGoogle, resetPassword } from '../../lib/authService';

const { Text } = Typography;

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading } = useAppSelector((s) => s.auth);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const onFinish = async (values: { email: string; password: string }) => {
    dispatch(loginStart());
    try {
      const profile = await loginUser(values.email, values.password);
      dispatch(
        loginSuccess({
          id: profile.uid,
          name: profile.name,
          email: profile.email,
          role: profile.role,
          plan: profile.plan,
          firebaseUid: profile.uid,
        })
      );
      message.success('Login realizado com sucesso!');
      navigate(profile.role === 'associado' ? '/portal' : '/');
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (code === 'auth/invalid-credential' || code === 'auth/user-not-found' || code === 'auth/wrong-password') {
        fallbackDemo(values.email, values.password);
      } else if (code === 'auth/too-many-requests') {
        dispatch(loginFailure());
        message.error('Muitas tentativas. Tente novamente em alguns minutos.');
      } else {
        fallbackDemo(values.email, values.password);
      }
    }
  };

  const fallbackDemo = (email: string, password: string) => {
    if (email && password) {
      const isAssociado = email.includes('associado') || email.includes('@loja');
      const role = isAssociado ? 'associado' as const : 'admin' as const;
      dispatch(
        loginSuccess({
          id: isAssociado ? 'assoc-1' : '1',
          name: isAssociado ? 'Maria Associada' : 'Admin Demo',
          email,
          role,
          plan: isAssociado ? 'intermediario' : 'avancado',
        })
      );
      message.success('Login demo realizado!');
      navigate(role === 'associado' ? '/portal' : '/');
    } else {
      dispatch(loginFailure());
      message.error('Credenciais inválidas');
    }
  };

  const handleGoogle = async () => {
    dispatch(loginStart());
    try {
      const profile = await loginWithGoogle();
      dispatch(
        loginSuccess({
          id: profile.uid,
          name: profile.name,
          email: profile.email,
          role: profile.role,
          plan: profile.plan,
          firebaseUid: profile.uid,
        })
      );
      message.success('Login com Google realizado!');
      navigate(profile.role === 'associado' ? '/portal' : '/');
    } catch {
      dispatch(loginFailure());
      message.warning('Login com Google indisponível. Use email/senha.');
    }
  };

  const handleResetPassword = async () => {
    if (!resetEmail) {
      message.warning('Informe seu email');
      return;
    }
    setResetLoading(true);
    try {
      await resetPassword(resetEmail);
      message.success('Email de recuperação enviado! Verifique sua caixa de entrada.');
      setResetOpen(false);
      setResetEmail('');
    } catch {
      message.error('Não foi possível enviar o email. Verifique se o email está correto.');
    }
    setResetLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #001529 0%, #003a70 100%)' }}>
      <Card style={{ width: 420, borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <img src="/logo.png" alt="DigitaisBR" style={{ height: 80, objectFit: 'contain', marginBottom: 8 }} />
          <div><Text type="secondary">Acesse sua conta</Text></div>
        </div>
        <Form layout="vertical" onFinish={onFinish} size="large">
          <Form.Item name="email" rules={[{ required: true, message: 'Informe seu email' }, { type: 'email', message: 'Email inválido' }]}>
            <Input prefix={<UserOutlined />} placeholder="Email" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: 'Informe sua senha' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Senha" />
          </Form.Item>
          <div style={{ textAlign: 'right', marginTop: -12, marginBottom: 12 }}>
            <Button type="link" size="small" onClick={() => setResetOpen(true)} style={{ padding: 0 }}>
              Esqueci minha senha
            </Button>
          </div>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Entrar
            </Button>
          </Form.Item>
        </Form>

        <Button
          block
          size="large"
          icon={<GoogleOutlined />}
          onClick={handleGoogle}
          style={{ marginBottom: 16 }}
        >
          Entrar com Google
        </Button>

        <Divider plain>
          <Text type="secondary" style={{ fontSize: 13 }}>ou</Text>
        </Divider>
        <div style={{ textAlign: 'center' }}>
          <Text type="secondary">Ainda não tem conta? </Text>
          <Link to="/registro">Criar conta</Link>
        </div>
        <div style={{ textAlign: 'center', marginTop: 12, padding: '8px 12px', background: '#f6ffed', borderRadius: 6 }}>
          <Text type="secondary" style={{ fontSize: 11 }}>
            Demo: use qualquer email/senha. Email com "associado" → Portal do Associado
          </Text>
        </div>
      </Card>

      <Modal
        title="Recuperar Senha"
        open={resetOpen}
        onCancel={() => { setResetOpen(false); setResetEmail(''); }}
        onOk={handleResetPassword}
        confirmLoading={resetLoading}
        okText="Enviar"
        cancelText="Cancelar"
      >
        <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
          Informe seu email cadastrado. Enviaremos um link para redefinir sua senha.
        </Text>
        <Input
          prefix={<UserOutlined />}
          placeholder="seu@email.com"
          value={resetEmail}
          onChange={(e) => setResetEmail(e.target.value)}
          size="large"
        />
      </Modal>
    </div>
  );
}
