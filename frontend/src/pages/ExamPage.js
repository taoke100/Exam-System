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
  const [timeLeft, setTimeLeft] = useState(3600);
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

  // 根据科目生成模拟试卷
  const generateMockQuestions = () => {
    const questions = [];
    const subjectMap = { '语文': 'C', '数学': 'M', '英语': 'E' };
    const prefix = subjectMap[subject];

    if (subject === '数学') {
      for (let i = 1; i <= 20; i++) {
        const a = Math.floor(Math.random() * 50) + 1;
        const b = Math.floor(Math.random() * 50) + 1;
        questions.push({
          qid: `${prefix}${i.toString().padStart(4, '0')}`,
          type: 'fill',
          question: `计算：${a} + ${b} = ?`,
          answer: String(a + b)
        });
      }
      for (let i = 21; i <= 30; i++) {
        const a = Math.floor(Math.random() * 99) + 1;
        const b = Math.floor(Math.random() * 99) + 1;
        const ops = ['+', '-', '×', '÷'];
        const op = ops[Math.floor(Math.random() * ops.length)];
        let expected, q;
        if (op === '+') { expected = a + b; q = `计算：${a} + ${b} = ?`; }
        if (op === '-') { expected = Math.max(a,b) - Math.min(a,b); q = `计算：${Math.max(a,b)} - ${Math.min(a,b)} = ?`; }
        if (op === '×') { expected = a * b; q = `计算：${a} × ${b} = ?`; }
        if (op === '÷') { expected = Math.max(a,b) / Math.min(a,b); q = `计算：${Math.max(a,b)} ÷ ${Math.min(a,b)} = ?`; }
        questions.push({
          qid: `${prefix}${i.toString().padStart(4, '0')}`,
          type: 'fill',
          question: q,
          answer: String(Math.round(expected))
        });
      }
      for (let i = 31; i <= 40; i++) {
        questions.push({
          qid: `${prefix}${i.toString().padStart(4, '0')}`,
          type: 'choice',
          question: `比较大小：${Math.floor(Math.random()*99)+1}（　）${Math.floor(Math.random()*99)+1}`,
          options: ['A. >', 'B. <', 'C. ='],
          answer: ['A','B','C'][Math.floor(Math.random()*3)]
        });
      }
      for (let i = 41; i <= 50; i++) {
        questions.push({
          qid: `${prefix}${i.toString().padStart(4, '0')}`,
          type: 'judge',
          question: `判断：${Math.floor(Math.random()*50)+1} > ${Math.floor(Math.random()*50)+1}`,
          answer: '对'
        });
      }
    } else if (subject === '英语') {
      const words = [
        { q: '"红色" 的英语单词是？', opts: ['A. pen', 'B. red', 'C. apple', 'D. book'], ans: 'B' },
        { q: '"四" 的英语单词是？', opts: ['A. two', 'B. four', 'C. three', 'D. five'], ans: 'B' },
        { q: '"狗" 的英语单词是？', opts: ['A. cat', 'B. dog', 'C. bird', 'D. fish'], ans: 'B' },
        { q: '"是" 的英语单词是？', opts: ['A. is', 'B. it', 'C. I', 'D. am'], ans: 'A' },
        { q: '"书" 的英语单词是？', opts: ['A. book', 'B. bag', 'C. pen', 'D. desk'], ans: 'A' },
      ];
      for (let i = 1; i <= 20; i++) {
        const w = words[Math.floor(Math.random() * words.length)];
        questions.push({
          qid: `${prefix}${i.toString().padStart(4, '0')}`,
          type: 'choice',
          question: w.q,
          options: w.opts,
          answer: w.ans
        });
      }
      for (let i = 21; i <= 35; i++) {
        questions.push({
          qid: `${prefix}${i.toString().padStart(4, '0')}`,
          type: 'fill',
          question: '补全单词：red → ____',
          answer: '红色'
        });
      }
      for (let i = 36; i <= 50; i++) {
        questions.push({
          qid: `${prefix}${i.toString().padStart(4, '0')}`,
          type: 'judge',
          question: '判断对错："apple" 是一种水果。',
          answer: '对'
        });
      }
    } else {
      // 语文
      const choices = [
        { q: '下列词语中，哪个是动物？', opts: ['A. 苹果', 'B. 桌子', 'C. 小狗', 'D. 河流'], ans: 'C' },
        { q: '下列词语中，哪个是水果？', opts: ['A. 香蕉', 'B. 桌子', 'C. 小狗', 'D. 河流'], ans: 'A' },
        { q: '"上" 字是什么结构？', opts: ['A. 左右', 'B. 上下', 'C. 包围', 'D. 独体'], ans: 'B' },
        { q: '下列哪个是动词？', opts: ['A. 苹果', 'B. 桌子', 'C. 跑', 'D. 河流'], ans: 'C' },
        { q: '"大" 字的笔画数是？', opts: ['A. 1画', 'B. 2画', 'C. 3画', 'D. 4画'], ans: 'C' },
      ];
      for (let i = 1; i <= 20; i++) {
        const c = choices[Math.floor(Math.random() * choices.length)];
        questions.push({
          qid: `${prefix}${i.toString().padStart(4, '0')}`,
          type: 'choice',
          question: c.q,
          options: c.opts,
          answer: c.ans
        });
      }
      for (let i = 21; i <= 35; i++) {
        questions.push({
          qid: `${prefix}${i.toString().padStart(4, '0')}`,
          type: 'fill',
          question: '看拼音，写词语：chūn',
          answer: '春'
        });
      }
      for (let i = 36; i <= 50; i++) {
        questions.push({
          qid: `${prefix}${i.toString().padStart(4, '0')}`,
          type: 'judge',
          question: '判断对错：月亮会发光。',
          answer: '错'
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
      correct_count: paper.questions.length - wrongQuestions.length,
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
      if (q.type === 'fill') {
        // 填空题：答案去空格后匹配
        const userAns = (answers[q.qid] || '').trim().replace(/\s+/g, '');
        const correctAns = q.answer.trim().replace(/\s+/g, '');
        if (userAns === correctAns) score += 2;
      } else {
        if (answers[q.qid] === q.answer) score += 2;
      }
    });
    return score;
  };

  const getWrongQuestions = () => {
    const wrong = [];
    paper.questions.forEach(q => {
      let isCorrect = false;
      if (q.type === 'fill') {
        const userAns = (answers[q.qid] || '').trim().replace(/\s+/g, '');
        const correctAns = q.answer.trim().replace(/\s+/g, '');
        isCorrect = userAns === correctAns;
      } else {
        isCorrect = answers[q.qid] === q.answer;
      }
      if (!isCorrect) {
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

  // 题型中文标签
  const typeLabel = (type) => {
    switch (type) {
      case 'choice': return '【选择题】';
      case 'fill': return '【填空题】';
      case 'judge': return '【判断题】';
      case 'answer': return '【做答题】';
      default: return '【其他】';
    }
  };

  // 数学符号按钮（做答题用）
  const mathSymbols = ['+', '-', '×', '÷', '=', '(', ')', '。', ',', '%'];

  if (!examStarted) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Card style={{ maxWidth: 500, margin: '0 auto' }}>
          <Title level={3}>开始考试</Title>
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
          <Title level={4} style={{ margin: 0 }}>
            {paper?.grade} {paper?.subject} - {paper?.semester}
          </Title>
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
          <Title level={4}>{typeLabel(currentQuestion.type)}</Title>
          <Text style={{ fontSize: 18 }}>{currentQuestion.question}</Text>

          <div style={{ marginTop: 20 }}>
            {/* ========== 选择题 ========== */}
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

            {/* ========== 填空题 ========== */}
            {currentQuestion.type === 'fill' && (
              <Space direction="vertical" style={{ width: '100%' }}>
                <Input
                  placeholder="请输入答案"
                  value={answers[currentQuestion.qid] || ''}
                  onChange={(e) => handleAnswer(currentQuestion.qid, e.target.value)}
                  style={{ width: 400, fontSize: 18 }}
                  size="large"
                />
                <Text type="secondary">请在上方输入框填写答案</Text>
              </Space>
            )}

            {/* ========== 判断题 ========== */}
            {currentQuestion.type === 'judge' && (
              <Space size="large" style={{ marginTop: 10 }}>
                <Button
                  type={answers[currentQuestion.qid] === '对' ? 'primary' : 'default'}
                  onClick={() => handleAnswer(currentQuestion.qid, '对')}
                  size="large"
                  style={{ width: 120, fontSize: 18, height: 50 }}
                >
                  对
                </Button>
                <Button
                  type={answers[currentQuestion.qid] === '错' ? 'primary' : 'default'}
                  onClick={() => handleAnswer(currentQuestion.qid, '错')}
                  size="large"
                  style={{ width: 120, fontSize: 18, height: 50 }}
                >
                  错
                </Button>
              </Space>
            )}

            {/* ========== 做答题（解答/应用题） ========== */}
            {currentQuestion.type === 'answer' && (
              <Space direction="vertical" style={{ width: '100%' }}>
                {/* 符号快捷按钮 */}
                <div style={{ marginBottom: 8 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>快捷符号：</Text>
                  <Space size={4} style={{ marginTop: 4 }}>
                    {mathSymbols.map(s => (
                      <Button key={s} size="small" onClick={() => {
                        const cur = answers[currentQuestion.qid] || '';
                        handleAnswer(currentQuestion.qid, cur + s);
                      }}>
                        {s}
                      </Button>
                    ))}
                  </Space>
                </div>
                {/* 大文本输入框 */}
                <TextArea
                  placeholder="请在此处填写答案（解题过程、计算步骤、解答内容）"
                  value={answers[currentQuestion.qid] || ''}
                  onChange={(e) => handleAnswer(currentQuestion.qid, e.target.value)}
                  rows={6}
                  style={{ fontSize: 16 }}
                />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  做答题：请在下方输入框填写完整解题过程，可使用上方快捷符号按钮输入数学符号
                </Text>
              </Space>
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
            上一题
          </Button>

          <Space>
            {currentIndex < paper?.questions.length - 1 ? (
              <Button type="primary" onClick={() => setCurrentIndex(prev => prev + 1)}>
                下一题
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
            {paper?.questions.map((q, idx) => {
              const isAnswered = !!answers[q.qid];
              const typeColor = q.type === 'choice' ? '#1890ff' : q.type === 'fill' ? '#52c41a' : q.type === 'judge' ? '#faad14' : '#722ed1';
              return (
                <Button
                  key={q.qid}
                  type={isAnswered ? 'primary' : 'default'}
                  shape="circle"
                  size="small"
                  onClick={() => setCurrentIndex(idx)}
                  style={{
                    backgroundColor: isAnswered ? typeColor : 'transparent',
                    color: isAnswered ? 'white' : 'inherit',
                    borderColor: typeColor
                  }}
                >
                  {idx + 1}
                </Button>
              );
            })}
          </div>
          <div style={{ marginTop: 8, fontSize: 12, color: '#888' }}>
            <Space size="middle">
              <span>🔵 选择题 {paper?.questions.filter(q=>q.type==='choice').length} 题</span>
              <span>🟢 填空题 {paper?.questions.filter(q=>q.type==='fill').length} 题</span>
              <span>🟡 判断题 {paper?.questions.filter(q=>q.type==='judge').length} 题</span>
              <span>🟣 做答题 {paper?.questions.filter(q=>q.type==='answer').length} 题</span>
            </Space>
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
