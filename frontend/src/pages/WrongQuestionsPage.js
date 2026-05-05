import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Space, Typography, message, Tabs, Empty } from 'antd';
import { EditOutlined, ReloadOutlined, DeleteOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

function WrongQuestionsPage({ user }) {
  const [wrongQuestions, setWrongQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [practicing, setPracticing] = useState(false);
  const [currentPractice, setCurrentPractice] = useState(null);
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [practiceAnswers, setPracticeAnswers] = useState({});

  useEffect(() => {
    loadWrongQuestions();
  }, []);

  const loadWrongQuestions = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://${window.location.hostname}:5001/api/wrong_questions/${user?.id || 1}`);
      const data = await response.json();
      setWrongQuestions(data);
    } catch (error) {
      // 使用本地存储的错题
      const stored = localStorage.getItem('wrong_questions');
      if (stored) {
        setWrongQuestions(JSON.parse(stored));
      }
    }
    setLoading(false);
  };

  const startPractice = (subject = null) => {
    if (wrongQuestions.length === 0) {
      message.warning('暂无错题');
      return;
    }

    let questions = wrongQuestions;
    if (subject) {
      questions = wrongQuestions.filter(q => q.subject === subject);
    }

    if (questions.length === 0) {
      message.warning('该科目暂无错题');
      return;
    }

    setCurrentPractice(questions);
    setPracticeIndex(0);
    setPracticeAnswers({});
    setPracticing(true);
  };

  const handlePracticeAnswer = (qid, value) => {
    setPracticeAnswers(prev => ({ ...prev, [qid]: value }));
  };

  const nextPractice = () => {
    if (practiceIndex < currentPractice.length - 1) {
      setPracticeIndex(prev => prev + 1);
    } else {
      // 完成练习
      const results = checkPracticeResults();
      message.success(`练习完成！本次答对 ${results.correct} / ${results.total} 题`);
      setPracticing(false);
    }
  };

  const checkPracticeResults = () => {
    let correct = 0;
    currentPractice.forEach(q => {
      if (practiceAnswers[q.qid] === q.correct_answer) {
        correct++;
      }
    });
    return { correct, total: currentPractice.length };
  };

  const columns = [
    {
      title: '科目',
      dataIndex: 'subject',
      key: 'subject',
      render: (subject) => <Tag color="blue">{subject}</Tag>
    },
    {
      title: '题目ID',
      dataIndex: 'qid',
      key: 'qid'
    },
    {
      title: '题目内容',
      dataIndex: 'question_data',
      key: 'question',
      render: (data) => data?.question || '-'
    },
    {
      title: '正确答案',
      dataIndex: 'question_data',
      key: 'correct_answer',
      render: (data) => <Text style={{ color: 'green' }}>{data?.correct_answer || '-'}</Text>
    },
    {
      title: '错误次数',
      dataIndex: 'wrong_count',
      key: 'wrong_count',
      render: (count) => <Tag color="red">{count}次</Tag>
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EditOutlined />}>查看详情</Button>
        </Space>
      )
    }
  ];

  // 练习模式
  if (practicing && currentPractice) {
    const current = currentPractice[practiceIndex];
    return (
      <div style={{ padding: '20px' }}>
        <Card>
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <Title level={4}>📝 错题练习 - 第 {practiceIndex + 1} / {currentPractice.length} 题</Title>
            <Text type="secondary">科目：{current.subject}</Text>
          </div>

          <Card style={{ backgroundColor: '#f5f5f5', marginBottom: 20 }}>
            <Text style={{ fontSize: 18 }}>{current.question}</Text>
          </Card>

          {current.type === 'choice' && current.options && (
            <Radio.Group
              onChange={(e) => handlePracticeAnswer(current.qid, e.target.value)}
              value={practiceAnswers[current.qid]}
            >
              <Space direction="vertical">
                {current.options.map((opt, idx) => (
                  <Radio key={idx} value={opt[0]} style={{ fontSize: 16 }}>
                    {opt}
                  </Radio>
                ))}
              </Space>
            </Radio.Group>
          )}

          {current.type === 'fill' && (
            <Input
              placeholder="输入答案"
              value={practiceAnswers[current.qid] || ''}
              onChange={(e) => handlePracticeAnswer(current.qid, e.target.value)}
              style={{ width: 300 }}
            />
          )}

          <div style={{ marginTop: 20, textAlign: 'center' }}>
            <Space>
              <Button onClick={() => setPracticing(false)}>退出练习</Button>
              <Button type="primary" onClick={nextPractice}>
                {practiceIndex < currentPractice.length - 1 ? '下一题' : '完成练习'}
              </Button>
            </Space>
          </div>

          {/* 进度条 */}
          <div style={{ marginTop: 20 }}>
            <div>已完成：{practiceIndex + 1} / {currentPractice.length}</div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <Title level={3}>📝 错题本</Title>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={loadWrongQuestions}>刷新</Button>
          <Button type="primary" onClick={() => startPractice()}>开始练习</Button>
        </Space>
      </div>

      {/* 科目筛选 */}
      <Tabs
        items={[
          { key: 'all', label: '全部', children: (
            <Card>
              <Table
                dataSource={wrongQuestions}
                columns={columns}
                rowKey="id"
                loading={loading}
                locale={{ emptyText: <Empty description="暂无错题记录" /> }}
              />
            </Card>
          )},
          { key: '语文', label: '语文', children: (
            <Card>
              <Button type="primary" onClick={() => startPractice('语文')} style={{ marginBottom: 10 }}>
                练习语文错题
              </Button>
              <Table
                dataSource={wrongQuestions.filter(q => q.subject === '语文')}
                columns={columns}
                rowKey="id"
                loading={loading}
              />
            </Card>
          )},
          { key: '数学', label: '数学', children: (
            <Card>
              <Button type="primary" onClick={() => startPractice('数学')} style={{ marginBottom: 10 }}>
                练习数学错题
              </Button>
              <Table
                dataSource={wrongQuestions.filter(q => q.subject === '数学')}
                columns={columns}
                rowKey="id"
                loading={loading}
              />
            </Card>
          )},
          { key: '英语', label: '英语', children: (
            <Card>
              <Button type="primary" onClick={() => startPractice('英语')} style={{ marginBottom: 10 }}>
                练习英语错题
              </Button>
              <Table
                dataSource={wrongQuestions.filter(q => q.subject === '英语')}
                columns={columns}
                rowKey="id"
                loading={loading}
              />
            </Card>
          )}
        ]}
      />

      {/* 统计信息 */}
      <Card style={{ marginTop: 20 }}>
        <Title level={4}>📊 错题统计</Title>
        <Space size="large">
          <div>
            <Text type="secondary">总错题数：</Text>
            <Text strong style={{ fontSize: 24 }}>{wrongQuestions.length}</Text>
          </div>
          <div>
            <Text type="secondary">语文错题：</Text>
            <Text strong style={{ fontSize: 24 }}>{wrongQuestions.filter(q => q.subject === '语文').length}</Text>
          </div>
          <div>
            <Text type="secondary">数学错题：</Text>
            <Text strong style={{ fontSize: 24 }}>{wrongQuestions.filter(q => q.subject === '数学').length}</Text>
          </div>
          <div>
            <Text type="secondary">英语错题：</Text>
            <Text strong style={{ fontSize: 24 }}>{wrongQuestions.filter(q => q.subject === '英语').length}</Text>
          </div>
        </Space>
      </Card>
    </div>
  );
}

export default WrongQuestionsPage;