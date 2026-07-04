import { useState } from 'react';
import { Button, Card, Form, Input, Typography, Divider, Steps, Row, Col, Upload, Checkbox, Tag, Space, Result, message } from 'antd';
import {
  UserOutlined, LockOutlined, MailOutlined, IdcardOutlined, ShopOutlined,
  PhoneOutlined, BankOutlined, UploadOutlined, CheckCircleOutlined,
  CrownOutlined, SafetyCertificateOutlined, FileProtectOutlined,
} from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { loginStart, loginSuccess } from '../../store/slices/authSlice';
import { registerUser } from '../../lib/authService';

const { Title, Text, Paragraph } = Typography;

const plans = [
  {
    type: 'basico',
    name: 'Básico',
    price: 'R$ 49,90/mês',
    color: '#1677ff',
    features: ['Benefícios da associação', 'Conteúdos educacionais', 'Comunidade', 'Loja virtual padrão', 'Prateleira de produtos'],
  },
  {
    type: 'intermediario',
    name: 'Intermediário',
    price: 'R$ 99,90/mês',
    color: '#722ed1',
    features: ['Tudo do Básico', 'Assessoria jurídica', 'Assessoria contábil', 'Mais opções de produtos', 'Personalização da loja'],
  },
  {
    type: 'avancado',
    name: 'Avançado',
    price: 'R$ 199,90/mês',
    color: '#faad14',
    features: ['Tudo do Intermediário', 'Produtos exclusivos', 'Suporte prioritário', 'Destaque na plataforma', 'Condições diferenciadas'],
  },
];

function formatCNPJ(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 14);
  return digits
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
}

function formatCPF(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 10) {
    return digits.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2');
  }
  return digits.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2');
}

function validateCNPJ(cnpj: string): boolean {
  const digits = cnpj.replace(/\D/g, '');
  if (digits.length !== 14) return false;
  if (/^(\d)\1+$/.test(digits)) return false;
  const calc = (len: number) => {
    let sum = 0;
    let pos = len - 7;
    for (let i = len; i >= 1; i--) {
      sum += parseInt(digits.charAt(len - i)) * pos--;
      if (pos < 2) pos = 9;
    }
    return sum % 11 < 2 ? 0 : 11 - (sum % 11);
  };
  if (calc(12) !== parseInt(digits.charAt(12))) return false;
  if (calc(13) !== parseInt(digits.charAt(13))) return false;
  return true;
}

function validateCPF(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11) return false;
  if (/^(\d)\1+$/.test(digits)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(digits.charAt(i)) * (10 - i);
  let check = 11 - (sum % 11);
  if (check >= 10) check = 0;
  if (check !== parseInt(digits.charAt(9))) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(digits.charAt(i)) * (11 - i);
  check = 11 - (sum % 11);
  if (check >= 10) check = 0;
  if (check !== parseInt(digits.charAt(10))) return false;
  return true;
}

export default function RegisterPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading } = useAppSelector((s) => s.auth);
  const [step, setStep] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [form] = Form.useForm();
  const [docForm] = Form.useForm();
  const [done, setDone] = useState(false);

  const handleFinish = async () => {
    dispatch(loginStart());
    const name = form.getFieldValue('name');
    const email = form.getFieldValue('email');
    const password = form.getFieldValue('password');
    const phone = form.getFieldValue('phone');
    const cpf = form.getFieldValue('cpf');
    const plan = selectedPlan as 'basico' | 'intermediario' | 'avancado';

    try {
      const profile = await registerUser(email, password, name, plan, { phone, cpfCnpj: cpf });
      dispatch(
        loginSuccess({
          id: profile.uid,
          name: profile.name,
          email: profile.email,
          role: 'associado',
          plan,
          firebaseUid: profile.uid,
        })
      );
      setDone(true);
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (code === 'auth/email-already-in-use') {
        message.error('Este email já está cadastrado. Faça login.');
      } else if (code === 'auth/weak-password') {
        message.error('Senha muito fraca. Use pelo menos 6 caracteres.');
      } else {
        dispatch(
          loginSuccess({
            id: 'assoc-1',
            name,
            email,
            role: 'associado',
            plan,
          })
        );
        setDone(true);
      }
    }
  };

  if (done) {
    const plan = plans.find((p) => p.type === selectedPlan);
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #001529 0%, #003a70 100%)' }}>
        <Card style={{ width: 540, borderRadius: 16, textAlign: 'center' }}>
          <Result
            status="success"
            title="Bem-vindo à DigitaisBR!"
            subTitle={`Sua conta foi criada com o plano ${plan?.name}. Seus documentos serão validados em até 48h.`}
            extra={[
              <Button type="primary" key="portal" size="large" onClick={() => navigate('/portal')}>
                Acessar Meu Portal
              </Button>,
            ]}
          />
        </Card>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #001529 0%, #003a70 100%)', padding: '40px 16px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <img src="/logo.png" alt="DigitaisBR" style={{ height: 60, objectFit: 'contain', marginBottom: 8 }} />
          <div><Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 16 }}>Associe-se e comece a monetizar</Text></div>
        </div>

        <Card style={{ borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
          <Steps
            current={step}
            items={[
              { title: 'Plano', icon: <CrownOutlined /> },
              { title: 'Dados Pessoais', icon: <UserOutlined /> },
              { title: 'Documentação', icon: <FileProtectOutlined /> },
              { title: 'Confirmação', icon: <CheckCircleOutlined /> },
            ]}
            style={{ marginBottom: 32 }}
          />

          {step === 0 && (
            <div>
              <Title level={4} style={{ textAlign: 'center', marginBottom: 24 }}>Escolha seu plano</Title>
              <Row gutter={[16, 16]}>
                {plans.map((plan) => {
                  const isSelected = selectedPlan === plan.type;
                  return (
                    <Col xs={24} md={8} key={plan.type}>
                      <Card
                        hoverable
                        onClick={() => setSelectedPlan(plan.type)}
                        style={{
                          border: isSelected ? `2px solid ${plan.color}` : '2px solid #f0f0f0',
                          borderRadius: 12,
                          textAlign: 'center',
                          background: isSelected ? `${plan.color}08` : 'transparent',
                          transition: 'all 0.2s',
                        }}
                      >
                        {isSelected && <Tag color={plan.color} style={{ position: 'absolute', top: 8, right: 8, fontSize: 10 }}>Selecionado</Tag>}
                        <CrownOutlined style={{ fontSize: 32, color: plan.color, marginBottom: 8 }} />
                        <Title level={4} style={{ margin: '8px 0 4px', color: plan.color }}>{plan.name}</Title>
                        <Title level={3} style={{ margin: '0 0 16px' }}>{plan.price}</Title>
                        <div style={{ textAlign: 'left' }}>
                          {plan.features.map((f, i) => (
                            <div key={i} style={{ padding: '4px 0', fontSize: 13, color: '#555' }}>
                              <CheckCircleOutlined style={{ color: plan.color, marginRight: 8 }} />
                              {f}
                            </div>
                          ))}
                        </div>
                      </Card>
                    </Col>
                  );
                })}
              </Row>
              <div style={{ textAlign: 'center', marginTop: 24 }}>
                <Button type="primary" size="large" disabled={!selectedPlan} onClick={() => setStep(1)} style={{ minWidth: 200 }}>
                  Continuar
                </Button>
              </div>
            </div>
          )}

          {step === 1 && (
            <Form form={form} layout="vertical" size="large" onFinish={() => setStep(2)}>
              <Title level={4} style={{ marginBottom: 20 }}>Dados Pessoais e Empresariais</Title>
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item name="name" label="Nome completo" rules={[{ required: true, message: 'Informe seu nome' }]}>
                    <Input prefix={<UserOutlined />} placeholder="Seu nome completo" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Informe seu email' }, { type: 'email', message: 'Email inválido' }]}>
                    <Input prefix={<MailOutlined />} placeholder="seu@email.com" />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item name="cpf" label="CPF" rules={[
                    { required: true, message: 'Informe seu CPF' },
                    { validator: (_, val) => val && validateCPF(val) ? Promise.resolve() : Promise.reject('CPF inválido') },
                  ]}>
                    <Input
                      prefix={<IdcardOutlined />}
                      placeholder="000.000.000-00"
                      maxLength={14}
                      onChange={(e) => form.setFieldValue('cpf', formatCPF(e.target.value))}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="phone" label="Telefone / WhatsApp" rules={[{ required: true, message: 'Informe seu telefone' }]}>
                    <Input
                      prefix={<PhoneOutlined />}
                      placeholder="(11) 99999-9999"
                      maxLength={15}
                      onChange={(e) => form.setFieldValue('phone', formatPhone(e.target.value))}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Divider>Dados da Empresa (opcional)</Divider>
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item name="cnpj" label="CNPJ" rules={[
                    { validator: (_, val) => !val || validateCNPJ(val) ? Promise.resolve() : Promise.reject('CNPJ inválido') },
                  ]}>
                    <Input
                      prefix={<BankOutlined />}
                      placeholder="00.000.000/0000-00"
                      maxLength={18}
                      onChange={(e) => form.setFieldValue('cnpj', formatCNPJ(e.target.value))}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="companyName" label="Razão Social">
                    <Input prefix={<ShopOutlined />} placeholder="Nome da empresa" />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item name="instagram" label="Instagram">
                    <Input placeholder="@seuinstagram" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="website" label="Site / Canal">
                    <Input placeholder="https://..." />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item name="password" label="Senha" rules={[{ required: true, message: 'Crie uma senha' }, { min: 8, message: 'Mínimo 8 caracteres' }]}>
                    <Input.Password prefix={<LockOutlined />} placeholder="Mínimo 8 caracteres" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="confirmPassword" label="Confirmar senha" dependencies={['password']} rules={[
                    { required: true, message: 'Confirme sua senha' },
                    ({ getFieldValue }) => ({ validator(_, value) { if (!value || getFieldValue('password') === value) return Promise.resolve(); return Promise.reject('As senhas não conferem'); } }),
                  ]}>
                    <Input.Password prefix={<LockOutlined />} placeholder="Repita a senha" />
                  </Form.Item>
                </Col>
              </Row>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                <Button onClick={() => setStep(0)}>Voltar</Button>
                <Button type="primary" htmlType="submit">Continuar</Button>
              </div>
            </Form>
          )}

          {step === 2 && (
            <Form form={docForm} layout="vertical" size="large" onFinish={() => setStep(3)}>
              <Title level={4} style={{ marginBottom: 8 }}>Verificação de Identidade</Title>
              <Paragraph type="secondary" style={{ marginBottom: 24 }}>
                Para sua segurança e conformidade, precisamos validar sua identidade. Envie os documentos abaixo.
              </Paragraph>

              <Card style={{ marginBottom: 16, background: '#fafafa', borderRadius: 12 }}>
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12}>
                    <Form.Item name="docIdentidade" label="Documento de Identidade (RG ou CNH)" rules={[{ required: true, message: 'Envie seu documento' }]}>
                      <Upload.Dragger
                        accept=".jpg,.jpeg,.png,.pdf"
                        maxCount={1}
                        beforeUpload={() => { docForm.setFieldValue('docIdentidade', 'uploaded'); return false; }}
                        style={{ borderRadius: 8 }}
                      >
                        <p><UploadOutlined style={{ fontSize: 28, color: '#1677ff' }} /></p>
                        <p style={{ fontSize: 13 }}>Frente e verso do RG ou CNH</p>
                        <p style={{ fontSize: 11, color: '#999' }}>JPG, PNG ou PDF — máx. 5MB</p>
                      </Upload.Dragger>
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item name="selfie" label="Selfie segurando o documento" rules={[{ required: true, message: 'Envie a selfie' }]}>
                      <Upload.Dragger
                        accept=".jpg,.jpeg,.png"
                        maxCount={1}
                        beforeUpload={() => { docForm.setFieldValue('selfie', 'uploaded'); return false; }}
                        style={{ borderRadius: 8 }}
                      >
                        <p><SafetyCertificateOutlined style={{ fontSize: 28, color: '#52c41a' }} /></p>
                        <p style={{ fontSize: 13 }}>Selfie com documento visível</p>
                        <p style={{ fontSize: 11, color: '#999' }}>JPG ou PNG — máx. 5MB</p>
                      </Upload.Dragger>
                    </Form.Item>
                  </Col>
                </Row>
              </Card>

              <Card style={{ marginBottom: 16, background: '#fafafa', borderRadius: 12 }}>
                <Form.Item name="comprovante" label="Comprovante de Endereço (últimos 90 dias)">
                  <Upload.Dragger
                    accept=".jpg,.jpeg,.png,.pdf"
                    maxCount={1}
                    beforeUpload={() => { docForm.setFieldValue('comprovante', 'uploaded'); return false; }}
                    style={{ borderRadius: 8 }}
                  >
                    <p><UploadOutlined style={{ fontSize: 24, color: '#fa8c16' }} /></p>
                    <p style={{ fontSize: 13 }}>Conta de luz, água, internet ou extrato bancário</p>
                    <p style={{ fontSize: 11, color: '#999' }}>JPG, PNG ou PDF — máx. 5MB</p>
                  </Upload.Dragger>
                </Form.Item>
              </Card>

              {form.getFieldValue('cnpj') && (
                <Card style={{ marginBottom: 16, background: '#fafafa', borderRadius: 12 }}>
                  <Form.Item name="cartaoCNPJ" label="Cartão CNPJ (Comprovante de Inscrição)">
                    <Upload.Dragger
                      accept=".jpg,.jpeg,.png,.pdf"
                      maxCount={1}
                      beforeUpload={() => { docForm.setFieldValue('cartaoCNPJ', 'uploaded'); return false; }}
                      style={{ borderRadius: 8 }}
                    >
                      <p><BankOutlined style={{ fontSize: 24, color: '#722ed1' }} /></p>
                      <p style={{ fontSize: 13 }}>Cartão CNPJ emitido pela Receita Federal</p>
                      <p style={{ fontSize: 11, color: '#999' }}>JPG, PNG ou PDF — máx. 5MB</p>
                    </Upload.Dragger>
                  </Form.Item>
                </Card>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                <Button onClick={() => setStep(1)}>Voltar</Button>
                <Button type="primary" htmlType="submit">Continuar</Button>
              </div>
            </Form>
          )}

          {step === 3 && (
            <div>
              <Title level={4} style={{ marginBottom: 20 }}>Confirme seus dados</Title>
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Card size="small" title="Plano escolhido" style={{ borderRadius: 12 }}>
                    {(() => {
                      const plan = plans.find((p) => p.type === selectedPlan);
                      return plan ? (
                        <div style={{ textAlign: 'center' }}>
                          <Tag color={plan.color} style={{ fontSize: 14, padding: '4px 16px' }}>{plan.name}</Tag>
                          <Title level={4} style={{ margin: '8px 0 0' }}>{plan.price}</Title>
                        </div>
                      ) : null;
                    })()}
                  </Card>
                </Col>
                <Col xs={24} md={12}>
                  <Card size="small" title="Dados pessoais" style={{ borderRadius: 12 }}>
                    <div style={{ fontSize: 13 }}>
                      <div><Text type="secondary">Nome:</Text> <Text strong>{form.getFieldValue('name')}</Text></div>
                      <div><Text type="secondary">Email:</Text> <Text>{form.getFieldValue('email')}</Text></div>
                      <div><Text type="secondary">CPF:</Text> <Text>{form.getFieldValue('cpf')}</Text></div>
                      <div><Text type="secondary">Telefone:</Text> <Text>{form.getFieldValue('phone')}</Text></div>
                      {form.getFieldValue('cnpj') && <div><Text type="secondary">CNPJ:</Text> <Text>{form.getFieldValue('cnpj')}</Text></div>}
                      {form.getFieldValue('companyName') && <div><Text type="secondary">Empresa:</Text> <Text>{form.getFieldValue('companyName')}</Text></div>}
                    </div>
                  </Card>
                </Col>
              </Row>

              <Card size="small" title="Documentos enviados" style={{ borderRadius: 12, marginTop: 16 }}>
                <Space>
                  <Tag icon={<CheckCircleOutlined />} color="success">Identidade</Tag>
                  <Tag icon={<CheckCircleOutlined />} color="success">Selfie</Tag>
                  {docForm.getFieldValue('comprovante') && <Tag icon={<CheckCircleOutlined />} color="success">Comprovante</Tag>}
                  {docForm.getFieldValue('cartaoCNPJ') && <Tag icon={<CheckCircleOutlined />} color="success">Cartão CNPJ</Tag>}
                </Space>
              </Card>

              <Card style={{ marginTop: 16, background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: 12 }}>
                <Form.Item name="terms" valuePropName="checked" style={{ marginBottom: 0 }}>
                  <Checkbox onChange={() => {}}>
                    <Text style={{ fontSize: 13 }}>
                      Li e aceito os <a>Termos de Uso</a> e a <a>Política de Privacidade</a> da DigitaisBR.
                      Autorizo a verificação dos meus documentos conforme a LGPD.
                    </Text>
                  </Checkbox>
                </Form.Item>
              </Card>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
                <Button onClick={() => setStep(2)}>Voltar</Button>
                <Button type="primary" size="large" loading={loading} onClick={handleFinish} style={{ minWidth: 200 }}>
                  Criar minha conta
                </Button>
              </div>
            </div>
          )}

          <Divider plain style={{ marginTop: 32 }}>
            <Text type="secondary" style={{ fontSize: 13 }}>ou</Text>
          </Divider>
          <div style={{ textAlign: 'center' }}>
            <Text type="secondary">Já é associado? </Text>
            <Link to="/login">Fazer login</Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
