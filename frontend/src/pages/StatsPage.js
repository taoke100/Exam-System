import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Progress, Typography, Table, Empty } from 'antd';
import { BarChartOutlined, TrophyOutlined, BookOutlined, ExceptionOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

function StatsPage({ user }) {
  const [stats, setStats] = useState({
    total_exams: 0,
    subject_stats: [],
    wrong_count: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://${window.location.hostname}:5001/api/stats/${user?.id || 1}`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      // 使用模拟数据
      setStats({
        total_exams: 5,
        subject_stats: [
          { subject: '语文', avg_score: 85, count: 2 },
          { subject: '数学', avg_score: 92, count: 2 },
          { subject: '英语', avg_score: 88, count: 1 }
        ],
        wrong_count: 12
      });
    }
    setLoading(false);
  };

  const columns = [
    { title: '科目', dataIndex: 'subject', key: 'subject' },
    { 
      title: '考试次数', 
      dataIndex: 'count', 
      key: 'count',
      render: (val) => `${val} 次`
    },
    { 
      title: '平均分', 
      dataIndex: 'avg_score', 
      key: 'avg_score',
      render: (val) => (
        <Text style={{ color: val >= 90 ? 'green' : val >= 70 ? 'orange' : 'red' }}>
          {val.toFixed(1)} 分
        </Text>
      )
    },
    {
      title: '掌握度',
      dataIndex: 'avg_score',
      key: 'progress',
      render: (val) => <Progress percent={val} size="small" />
    }
  ];

  const getSubjectIcon = (subject) => {
    const icons = { '语文': '📖', '数学': '🔢', '英语': '🔤' };
    return icons[subject] || '📚';
  };

  return (
    <div style={{ padding: '20px' }}>
      <Title level={3}>📊 学习统计</Title>

      {/* 总体统计 */}
      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总考试次数"
              value={stats.total_exams}
              prefix={<BarChartOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="错题数量"
              value={stats.wrong_count}
              prefix={<ExceptionOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="数学平均分"
              value={stats.subject_stats.find(s => s.subject === '数学')?.avg_score || 0}
              prefix={<TrophyOutlined />}
              suffix="分"
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="语文平均分"
              value={stats.subject_stats.find(s => s.subject === '语文')?.avg_score || 0}
              prefix={<BookOutlined />}
              suffix="分"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 各科详细统计 */}
      <Card title="📈 各科学习情况" style={{ marginBottom: 20 }}>
        <Table
          dataSource={stats.subject_stats}
          columns={columns}
          rowKey="subject"
          pagination={false}
          locale={{ emptyText: <Empty description="暂无考试记录，开始考试来积累数据吧！" /> }}
        />
      </Card>

      {/* 学习建议 */}
      <Card title="💡 学习建议">
        {stats.wrong_count > 10 && (
          <Text type="warning">
            ⚠️ 您的错题数量较多（{stats.wrong_count} 题），建议每天花时间练习错题本！
          </Text>
        )}
        {stats.wrong_count > 0 && stats.wrong_count <= 10 && (
          <Text type="success">
            ✅ 继续保持！您的错题数量较少，继续加油！
          </Text>
        )}
        {stats.wrong_count === 0 && (
          <Text type="secondary">
            📚 暂无错题记录，请开始考试来检验学习成果！
          </Text>
        )}
        
        <div style={{ marginTop: 20 }}>
          {stats.subject_stats.map(s => (
            <div key={s.subject} style={{ marginBottom: 10 }}>
              <Text strong>{getSubjectIcon(s.subject)} {s.subject}：</Text>
              <Progress 
                percent={s.avg_score} 
                status={s.avg_score >= 90 ? 'success' : s.avg_score >= 60 ? 'normal' : 'exception'}
                style={{ marginTop: 5 }}
              />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export default StatsPage;