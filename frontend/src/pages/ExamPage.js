import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Select, Button, Radio, Input, Progress, Typography, Space, message, Modal } from 'antd';
import { ClockCircleOutlined, SendOutlined, ThunderboltOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;

function ExamPage({ user }) {
  const navigate = useNavigate();
  const [subject, setSubject] = useState('语文');
  const [grade, setGrade] = useState('二年级');
  const [semester, setSemester] = useState('上册');
  const [examStarted, setExamStarted] = useState(false);
  const [paper, setPaper] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(3600); // 60分钟
  const [submitModalVisible, setSubmitModalVisible] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!user) {
      message.warning('请先登录');
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    let timer;
    if (examStarted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [examStarted]);

  const startExam = async () => {
    try {
      const response = await fetch(`http://${window.location.hostname}:5001/api/papers/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, grade, semester, num_questions: 50 })
      });
      const data = await response.json();
      setPaper(data);
      setExamStarted(true);
      setAnswers({});
      setCurrentIndex(0);
      setTimeLeft(3600);
      message.success('考试开始！');
    } catch (error) {
      // 如果后端未启动，使用模拟数据
      const mockQuestions = generateMockQuestions();
      setPaper({
        paper_id: 'mock_paper',
        subject,
        grade,
        semester,
        questions: mockQuestions,
        total_score: 100
      });
      setExamStarted(true);
      setAnswers({});
      setCurrentIndex(0);
      setTimeLeft(3600);
      message.warning('使用模拟试卷（后端服务未启动）');
    }
  };

  const generateMockQuestions = () => {
    const questions = [];
    const subjectMap = { '语文': 'C', '数学': 'M', '英语': 'E' };
    const prefix = subjectMap[subject];
    
    for (let i = 1; i <= 50; i++) {
      if (subject === '数学') {
        const a = Math.floor(Math.random() * 50) + 1;
        const b = Math.floor(Math.random() * 50) + 1;
        questions.push({
          qid: `${prefix}${i.toString().padStart(4, '0')}`,
          type: 'fill',
          question: `计算：${a} + ${b} = ?`,
          answer: String(a + b)
        });
      } else if (subject === '英语') {
        questions.push({
          qid: `${prefix}${i.toString().padStart(4, '0')}`,
          type: 'choice',
          question: `"苹果" 的英语单词是？`,
          options: ['A. apple', 'B. banana', 'C. orange', 'D. grape'],
          answer: 'A'
        });
      } else {
        questions.push({
          qid: `${prefix}${i.toString().padStart(4, '0')}`,
          type: 'choice',
          question: `下列词语中，哪个是动物？`,
          options: ['A. 苹果', 'B. 桌子', 'C. 小狗', 'D. 河流'],
          answer: 'C'
        });
      }
    }
    return questions;
  };

  const handleAnswer = (qid, value) => {
    setAnswers(prev => ({ ...prev, [qid]: value }));
  };

  const handleSubmit = async () => {
    if (!paper) return;
    
    const score = calculateScore();
    const wrongQuestions = getWrongQuestions();
    
    const examResult = {
      score,
      total: 100,
      correct_count: 50 - wrongQuestions.length,
      wrong_count: wrongQuestions.length,
      wrong_questions: wrongQuestions
    };
    
    setResult(examResult);
    setSubmitModalVisible(false);
    setExamStarted(false);
    
    Modal.success({
      title: '考试完成！',
      content: (
        <div>
          <p>得分：{score} / 100</p>
          <p>正确：{examResult.correct_count} 题</p>
          <p>错误：{examResult.wrong_count} 题</p>
        </div>
      ),
      onOk: () => navigate('/wrong')
    });
  };

  const calculateScore = () => {
    let score = 0;
    paper.questions.forEach(q => {
      if (answers[q.qid] === q.answer) {
        score += 2;
      }
    });
    return score;
  };

  const getWrongQuestions = () => {
    const wrong = [];
    paper.questions.forEach(q => {
      if (answers[q.qid] !== q.answer) {
        wrong.push({
          qid: q.qid,
          question: q.question,
          user_answer: answers[q.qid] || '未作答',
          correct_answer: q.answer,
          type: q.type,
          options: q.options || []
        });
      }
    });
    return wrong;
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!examStarted) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Card style={{ maxWidth: 500, margin: '0 auto' }}>
          <Title level={3}>🎯 开始考试</Title>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Text strong>科目：</Text>
              <Select
                value={subject}
                onChange={setSubject}
                style={{ width: 200, marginLeft: 10 }}
                options={[
                  { value: '语文', label: '语文' },
                  { value: '数学', label: '数学' },
                  { value: '英语', label: '英语' }
                ]}
              />
            </div>
            <div>
              <Text strong>年级：</Text>
              <Select
                value={grade}
                onChange={setGrade}
                style={{ width: 200, marginLeft: 10 }}
                options={[
                  { value: '一年级', label: '一年级' },
                  { value: '二年级', label: '二年级' },
                  { value: '三年级', label: '三年级' },
                  { value: '四年级', label: '四年级' },
                  { value: '五年级', label: '五年级' },
                  { value: '六年级', label: '六年级' }
                ]}
              />
            </div>
            <div>
              <Text strong>学期：</Text>
              <Select
                value={semester}
                onChange={setSemester}
                style={{ width: 200, marginLeft: 10 }}
                options={[
                  { value: '上册', label: '上学期（上册）' },
                  { value: '下册', label: '下学期（下册）' }
                ]}
              />
            </div>
            <Button type="primary" size="large" onClick={startExam}>
              <ThunderboltOutlined /> 开始考试
            </Button>
          </Space>
        </Card>
      </div>
    );
  }

  const currentQuestion = paper?.questions[currentIndex];
  const progress = ((currentIndex + 1) / paper?.questions.length) * 100;

  return (
    <div style={{ padding: '20px' }}>
      {/* 顶部进度条 */}
      <Card style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={4} style={{ margin: 0 }}>📖 {paper?.grade || ''} {paper?.subject} - {paper?.semester}</Title>
          <Space>
            <ClockCircleOutlined style={{ color: timeLeft < 300 ? 'red' : 'inherit' }} />
            <Text style={{ fontSize: 20, color: timeLeft < 300 ? 'red' : 'inherit' }}>
              {formatTime(timeLeft)}
            </Text>
          </Space>
        </div>
        <Progress percent={progress} status="active" style={{ marginTop: 10 }} />
        <Text>第 {currentIndex + 1} / {paper?.questions.length} 题</Text>
      </Card>

      {/* 题目卡片 */}
      {currentQuestion && (
        <Card style={{ marginBottom: 20 }}>
          <Title level={4}>{currentQuestion.type === 'choice' ? '【选择题】' : '【填空题】'}</Title>
          <Text style={{ fontSize: 18 }}>{currentQuestion.question}</Text>
          
          <div style={{ marginTop: 20 }}>
            {currentQuestion.type === 'choice' && currentQuestion.options && (
              <Radio.Group
                onChange={(e) => handleAnswer(currentQuestion.qid, e.target.value)}
                value={answers[currentQuestion.qid]}
                style={{ width: '100%' }}
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  {currentQuestion.options.map((opt, idx) => (
                    <Radio key={idx} value={opt[0]} style={{ fontSize: 16 }}>
                      {opt}
                    </Radio>
                  ))}
                </Space>
              </Radio.Group>
            )}
            
            {currentQuestion.type === 'fill' && (
              <Input
                placeholder="请输入答案"
                value={answers[currentQuestion.qid] || ''}
                onChange={(e) => handleAnswer(currentQuestion.qid, e.target.value)}
                style={{ width: 300, fontSize: 18 }}
              />
            )}
          </div>
        </Card>
      )}

      {/* 底部导航 */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex(prev => prev - 1)}
          >
            ⬅️ 上一题
          </Button>
          
          <Space>
            {currentIndex < paper?.questions.length - 1 ? (
              <Button type="primary" onClick={() => setCurrentIndex(prev => prev + 1)}>
                下一题 ➡️
              </Button>
            ) : (
              <Button type="primary" danger onClick={() => setSubmitModalVisible(true)}>
                <SendOutlined /> 提交试卷
              </Button>
            )}
          </Space>
        </div>

        {/* 题目导航 */}
        <div style={{ marginTop: 20 }}>
          <Text strong>题目导航：</Text>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 10 }}>
            {paper?.questions.map((q, idx) => (
              <Button
                key={q.qid}
                type={answers[q.qid] ? 'primary' : 'default'}
                shape="circle"
                size="small"
                onClick={() => setCurrentIndex(idx)}
                style={{ 
                  backgroundColor: answers[q.qid] ? '#1890ff' : 'transparent',
                  color: answers[q.qid] ? 'white' : 'inherit'
                }}
              >
                {idx + 1}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* 提交确认弹窗 */}
      <Modal
        title="确认提交"
        open={submitModalVisible}
        onOk={handleSubmit}
        onCancel={() => setSubmitModalVisible(false)}
        okText="确认提交"
        cancelText="继续答题"
      >
        <p>您已完成所有题目，确定要提交吗？</p>
        <p>已作答：{Object.keys(answers).length} / {paper?.questions.length} 题</p>
      </Modal>
    </div>
  );
}

export default ExamPage;