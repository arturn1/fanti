'use client';

import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, message, Typography, Space, Alert } from 'antd';
import { UserOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
const { Title, Text, Paragraph } = Typography;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const router = useRouter();
  const { login } = useAuth();

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {

      const res = await login(values.email, values.password);

      setTimeout(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const redirect = urlParams.get('redirect') || '/';
        router.replace(redirect);
      }, 100);

    } catch (error: any) {
      message.error('Erro ao fazer login. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  const testCredentials = [
    { email: 'admin@fanti.com', password: 'admin123', role: 'Administrador' },
    { email: 'dev@fanti.com', password: 'dev123', role: 'Desenvolvedor' },
    { email: 'manager@fanti.com', password: 'manager123', role: 'Gerente' }
  ];

  const handleTestLogin = (credentials: { email: string; password: string }) => {
    form.setFieldsValue(credentials);
    onFinish(credentials);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <Card style={{ borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
              <LoginOutlined style={{ marginRight: '8px' }} />
              Fanti
            </Title>
            <Text type="secondary">Sistema de Gerenciamento de Projeto</Text>
          </div>

          <Form
            form={form}
            name="login"
            onFinish={onFinish}
            layout="vertical"
            size="large"
          >

            <Form.Item
              name="password"
              label="Senha"
              rules={[{ required: true, message: 'Por favor, insira sua senha!' }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Sua senha"
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: '16px' }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                style={{ height: '44px' }}
              >
                Entrar
              </Button>
            </Form.Item>
          </Form>

          <Alert
            message="Credenciais de Teste (OIDC Simulado)"
            description={
              <Space direction="vertical" style={{ width: '100%' }}>
                <Paragraph style={{ margin: 0, fontSize: '12px' }}>
                  Clique em uma das credenciais abaixo para fazer login automaticamente:
                </Paragraph>
                {testCredentials.map((cred, index) => (
                  <Button
                    key={index}
                    type="link"
                    size="small"
                    onClick={() => handleTestLogin(cred)}
                    style={{
                      padding: '4px 8px',
                      height: 'auto',
                      textAlign: 'left',
                      display: 'block',
                      width: '100%'
                    }}
                  >
                    <strong>{cred.email}</strong> - {cred.role}
                  </Button>
                ))}
              </Space>
            }
            type="info"
            showIcon
            style={{ marginTop: '16px' }}
          />
        </Card>

        <div style={{ textAlign: 'center', marginTop: '24px', color: 'rgba(255,255,255,0.8)' }}>
          <Text style={{ color: 'inherit', fontSize: '12px' }}>
            Simulação de autenticação OIDC/JWT para desenvolvimento
          </Text>
        </div>
      </div>
    </div>
  );
}
