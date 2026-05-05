import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Layout, Menu, Card, Button, Select, Typography, message } from 'antd';
import { BookOutlined, ExceptionOutlined, BarChartOutlined, HomeOutlined } from '@ant-design/icons';
import ExamPage from './pages/ExamPage';
import WrongQuestionsPage from './pages/WrongQuestionsPage';
import StatsPage from './pages/StatsPage';
import Login from './pages/Login';

const { Header, Content, Footer } = Layout;
const { Title } = Typography;

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    // 支持从ExamPage等子组件恢复登录状态
    const handler = (e) => setUser(e.detail);
    window.addEventListener('restore-user', handler);
    return () => window.removeEventListener('restore-user', handler);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    message.success('已退出登录');
  };

  const menuItems = [
    { key: 'home', icon: <HomeOutlined />, label: <Link to="/">首页</Link> },
    { key: 'exam', icon: <BookOutlined />, label: <Link to="/exam">开始考试</Link> },
    { key: 'wrong', icon: <ExceptionOutlined />, label: <Link to="/wrong">错题本</Link> },
    { key: 'stats', icon: <BarChartOutlined />, label: <Link to="/stats">学习统计</Link> },
  ];

  return (
    <Router>
      <Layout className="layout" style={{ minHeight: '100vh' }}>
        <Header style={{ display: 'flex', alignItems: 'center' }}>
          <div className="logo" style={{ color: 'white', fontSize: '20px', marginRight: '50px' }}>
            📚 北京海淀小学考试系统
          </div>
          <Menu theme="dark" mode="horizontal" items={menuItems} style={{ flex: 1 }} />
          {user && (
            <div style={{ color: 'white', marginRight: '20px' }}>
              欢迎，{user.username}
            </div>
          )}
          {user && (
            <Button type="primary" danger onClick={handleLogout}>退出</Button>
          )}
        </Header>
        <Content style={{ padding: '20px 50px' }}>
          <Routes>
            <Route path="/" element={<HomePage user={user} />} />
            <Route path="/login" element={<Login onLogin={setUser} />} />
            <Route path="/exam" element={<ExamPage user={user} />} />
            <Route path="/wrong" element={<WrongQuestionsPage user={user} />} />
            <Route path="/stats" element={<StatsPage user={user} />} />
          </Routes>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          北京海淀小学考试系统 ©2026
        </Footer>
      </Layout>
    </Router>
  );
}

function HomePage({ user }) {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <Title level={1}>📚 欢迎使用考试系统</Title>
      <Title level={3}>北京海淀区小学二年级 · 语文/数学/英语</Title>
      
      {!user && (
        <div style={{ marginTop: '30px' }}>
          <Button type="primary" size="large" onClick={() => navigate('/login')}>
            登录/注册
          </Button>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '50px' }}>
        <Card title="📖 开始考试" style={{ width: 300 }}>
          <p>选择科目和学期</p>
          <p>随机抽取50道题</p>
          <Button type="primary" onClick={() => navigate('/exam')}>进入考试</Button>
        </Card>
        <Card title="📝 错题本" style={{ width: 300 }}>
          <p>查看做错的题目</p>
          <p>进行针对性练习</p>
          <Button onClick={() => navigate('/wrong')}>查看错题</Button>
        </Card>
        <Card title="📊 学习统计" style={{ width: 300 }}>
          <p>查看学习进度</p>
          <p>分析薄弱环节</p>
          <Button onClick={() => navigate('/stats')}>查看统计</Button>
        </Card>
      </div>
    </div>
  );
}

export default App;