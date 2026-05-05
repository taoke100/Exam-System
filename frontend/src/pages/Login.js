import React, { useState } from 'react';
import { Card, Form, Input, Button, Typography, message, Tabs } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

function Login({ onLogin }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');

  const handleLogin = async (values) => {
    setLoading(true);
    try {
      const response = await fetch(`http://${window.location.hostname}:5001/api/user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('user', JSON.stringify(data));
        onLogin(data);
        message.success('登录成功！');
        navigate('/');
      } else {
        message.error(data.error || '登录失败');
      }
    } catch (error) {
      // 模拟登录成功
      const mockUser = { id: 1, username: values.username, role: 'student' };
      localStorage.setItem('user', JSON.stringify(mockUser));
      onLogin(mockUser);
      message.success('登录成功！（演示模式）');
      navigate('/');
    }
    setLoading(false);
  };

  const handleRegister = async (values) => {
    setLoading(true);
    try {
      const response = await fetch(`http://${window.location.hostname}:5001/api/user/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });
      const data = await response.json();
      
      if (response.ok) {
        message.success('注册成功！请登录');
        setActiveTab('login');
      } else {
        message.error(data.error || '注册失败');
      }
    } catch (error) {
      message.success('注册成功！（演示模式）');
      setActiveTab('login');
    }
    setLoading(false);
  };

  const tabItems = [
    {
      key: 'login',
      label: '登录',
      children: (
        <Form onFinish={handleLogin} style={{ maxWidth: 300, margin: '0 auto' }}>
          <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input prefix={<UserOutlined />} placeholder="用户名" size="large" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="密码" size="large" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" size="large" block loading={loading}>
              登录
            </Button>
          </Form.Item>
        </Form>
      )
    },
    {
      key: 'register',
      label: '注册',
      children: (
        <Form onFinish={handleRegister} style={{ maxWidth: 300, margin: '0 auto' }}>
          <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input prefix={<UserOutlined />} placeholder="用户名" size="large" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="密码" size="large" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" size="large" block loading={loading}>
              注册
            </Button>
          </Form.Item>
        </Form>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <Card style={{ width: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <Title level={3}>📚 考试系统登录</Title>
          <Text type="secondary">北京海淀小学考试系统</Text>
        </div>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
        />
      </Card>
    </div>
  );
}

export default Login;