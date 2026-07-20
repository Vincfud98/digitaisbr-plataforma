import { useState, useEffect } from 'react';
import { Button, Card, Form, Input, Typography, message, Divider, Modal } from 'antd';
import { UserOutlined, LockOutlined, GoogleOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { loginStart, loginSuccess, loginFailure } from '../../store/slices/authSlice';
import { loginUser, loginWithGoogle, resetPassword } from '../../lib/authService';
import { getDb } from '../../lib/firebase';

const { Text } = Typography;

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading } = useAppSelector((s) => s.auth);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    getDb();
  }, []);

  const onFinish = async (values: { email: string; password: string }) => {
    dispatch(loginStart());
    try {
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), 8000)
      );
      const profile = await Promise.race([loginUser(values.email, values.password), timeoutPromise]);
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
      dispatch(loginFailure());
      const code = (err as { code?: string }).code;
      if (code === 'auth/too-many-requests') {
        message.error('Muitas tentativas. Tente novamente em alguns minutos.');
      } else if (code === 'auth/user-not-found' || code === 'auth/invalid-credential') {
        message.error('Email ou senha incorretos.');
      } else if ((err as Error).message === 'timeout') {
        message.error('Servidor demorou para responder. Tente novamente.');
      } else {
        message.error('Erro ao fazer login. Tente novamente.');
      }
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
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #001529 0%, #003a70 100%)', padding: '16px' }}>
      <Card style={{ width: '100%', maxWidth: 420, borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
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
