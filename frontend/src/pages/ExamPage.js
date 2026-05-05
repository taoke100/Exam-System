import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Select, Button, Radio, Input, Progress, Typography, Space, message, Modal } from 'antd';
import { ClockCircleOutlined, SendOutlined, ThunderboltOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;

// 题型顺序和配置
const TYPE_ORDER = ['choice', 'fill', 'judge', 'answer', 'application'];
const TYPE_CHINESE = {
  choice: '选择题',
  fill: '填空题',
  judge: '判断题',
  answer: '解答题',
  application: '应用题',
};
const TYPE_NUMERALS = ['一', '二', '三', '四', '五'];
const TYPE_COLORS = {
  choice: '#1890ff',
  fill: '#52c41a',
  judge: '#faad14',
  answer: '#722ed1',
  application: '#eb2f96',
};

function ExamPage({ user }) {
  const navigate = useNavigate();
  const [subject, setSubject] = useState('语文');
  const [grade, setGrade] = useState('一年级');
  const [semester, setSemester] = useState('上册');
  const [examStarted, setExamStarted] = useState(false);
  const [paper, setPaper] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0); // 全局题号（从0起）
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(3600);
  const [submitModalVisible, setSubmitModalVisible] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    // 支持刷新页面：直接从localStorage恢复用户
    if (!user) {
      const saved = localStorage.getItem('user');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // 通过App的setUser来恢复（触发App重新render）
          window.dispatchEvent(new CustomEvent('restore-user', { detail: parsed }));
        } catch (e) {}
      }
    }
    if (!user) {
      message.warning('请先登录');
      navigate('/login');
    }
  }, []);

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

  // 将试卷题目按题型分组
  const groupedQuestions = useMemo(() => {
    if (!paper?.questions) return {};
    const groups = {};
    TYPE_ORDER.forEach(t => { groups[t] = []; });
    paper.questions.forEach(q => {
      const t = q.type || 'fill';
      if (!groups[t]) groups[t] = [];
      groups[t].push(q);
    });
    return groups;
  }, [paper]);

  // 题型section列表（按顺序，只显示有题的）
  const sections = useMemo(() => {
    return TYPE_ORDER
      .filter(t => groupedQuestions[t]?.length > 0)
      .map((t, i) => ({
        type: t,
        label: TYPE_CHINESE[t],
        numeral: TYPE_NUMERALS[i],
        questions: groupedQuestions[t],
        color: TYPE_COLORS[t],
      }));
  }, [groupedQuestions]);

  // 预建全局qid->全局索引映射（避免每次render重复indexOf）
  const qidToIndex = useMemo(() => {
    const map = {};
    if (paper?.questions) {
      paper.questions.forEach((q, i) => { map[q.qid] = i; });
    }
    return map;
  }, [paper]);

  // 根据全局题号找到属于哪个section和section内编号
  const getSectionInfo = (idx) => {
    const q = paper?.questions?.[idx];
    if (!q) return null;
    const section = sections.find(s => s.type === q.type);
    if (!section) return null;
    const localIdx = section.questions.findIndex(sq => sq.qid === q.qid);
    return { section, localIdx };
  };

  const startExam = async () => {
    // 直接使用模拟试卷，不依赖后端
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
    message.success('考试开始！');
  };

  // 根据科目生成模拟试卷
  const generateMockQuestions = () => {
    const questions = [];
    const subjectMap = { '语文': 'C', '数学': 'M', '英语': 'E' };
    const prefix = subjectMap[subject];

    if (subject === '数学') {
      for (let i = 1; i <= 15; i++) {
        const a = Math.floor(Math.random() * 50) + 1;
        const b = Math.floor(Math.random() * 50) + 1;
        questions.push({
          qid: `${prefix}${i.toString().padStart(4, '0')}`,
          type: 'fill',
          question: `计算：${a} + ${b} = ?`,
          answer: String(a + b)
        });
      }
      for (let i = 16; i <= 25; i++) {
        questions.push({
          qid: `${prefix}${i.toString().padStart(4, '0')}`,
          type: 'choice',
          question: `比较大小：${Math.floor(Math.random()*99)+1}（　）${Math.floor(Math.random()*99)+1}`,
          options: ['A. >', 'B. <', 'C. ='],
          answer: ['A','B','C'][Math.floor(Math.random()*3)]
        });
      }
      for (let i = 26; i <= 35; i++) {
        questions.push({
          qid: `${prefix}${i.toString().padStart(4, '0')}`,
          type: 'judge',
          question: `判断对错：${Math.floor(Math.random()*50)+1} > ${Math.floor(Math.random()*50)+1}`,
          answer: '对'
        });
      }
      for (let i = 36; i <= 40; i++) {
        questions.push({
          qid: `${prefix}${i.toString().padStart(4, '0')}`,
          type: 'answer',
          question: `应用题：小明有${10+i}个苹果，送给朋友${5+i}个，还剩多少个？请列出算式并计算。`,
          answer: `${15+i-5-i}=${10}`
        });
      }
    } else if (subject === '英语') {
      const words = [
        { q: '"红色" 的英语单词是？', opts: ['A. pen', 'B. red', 'C. apple', 'D. book'], ans: 'B' },
        { q: '"四" 的英语单词是？', opts: ['A. two', 'B. four', 'C. three', 'D. five'], ans: 'B' },
        { q: '"狗" 的英语单词是？', opts: ['A. cat', 'B. dog', 'C. bird', 'D. fish'], ans: 'B' },
      ];
      for (let i = 1; i <= 15; i++) {
        const w = words[Math.floor(Math.random() * words.length)];
        questions.push({
          qid: `${prefix}${i.toString().padStart(4, '0')}`,
          type: 'choice',
          question: w.q,
          options: w.opts,
          answer: w.ans
        });
      }
      for (let i = 16; i <= 30; i++) {
        questions.push({
          qid: `${prefix}${i.toString().padStart(4, '0')}`,
          type: 'fill',
          question: '补全单词：red → ____',
          answer: '红色'
        });
      }
      for (let i = 31; i <= 40; i++) {
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
      ];
      for (let i = 1; i <= 15; i++) {
        const c = choices[Math.floor(Math.random() * choices.length)];
        questions.push({
          qid: `${prefix}${i.toString().padStart(4, '0')}`,
          type: 'choice',
          question: c.q,
          options: c.opts,
          answer: c.ans
        });
      }
      for (let i = 16; i <= 30; i++) {
        questions.push({
          qid: `${prefix}${i.toString().padStart(4, '0')}`,
          type: 'fill',
          question: '看拼音，写词语：chūn',
          answer: '春'
        });
      }
      for (let i = 31; i <= 40; i++) {
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
      correct_count: paper.questions.filter(q => {
        if (q.type === 'answer' || q.type === 'application') return !!answers[q.qid];
        return isCorrectAnswer(q);
      }).length,
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
          <p style={{ fontSize: 18, color: score >= 60 ? '#52c41a' : '#ff4d4f', fontWeight: 'bold' }}>
            得分：{score} / 100
          </p>
          <p>正确：{examResult.correct_count} 题</p>
          <p>错误：{examResult.wrong_count} 题</p>
          <p style={{ fontSize: 12, color: '#888', marginTop: 8 }}>
            {score >= 60 ? '🎉 恭喜及格！' : '加油！继续努力！'}
          </p>
        </div>
      ),
      okText: '查看错题',
      onOk: () => navigate('/wrong')
    });
  };

  const isCorrectAnswer = (q) => {
    if (q.type === 'fill') {
      const userAns = (answers[q.qid] || '').trim().replace(/\s+/g, '');
      const correctAns = (q.answer || '').trim().replace(/\s+/g, '');
      return userAns === correctAns;
    }
    return answers[q.qid] === q.answer;
  };

  const calculateScore = () => {
    let score = 0;
    paper.questions.forEach(q => {
      // 做答题和应用题：填写即得满分（主观题），未答得0分
      if (q.type === 'answer' || q.type === 'application') {
        if (answers[q.qid] && answers[q.qid].trim().length > 0) score += 2;
        return;
      }
      if (isCorrectAnswer(q)) score += 2;
    });
    return score;
  };

  const getWrongQuestions = () => {
    const wrong = [];
    paper.questions.forEach(q => {
      if (q.type === 'answer' || q.type === 'application') {
        if (!answers[q.qid] || answers[q.qid].trim().length === 0) {
          wrong.push({
            qid: q.qid,
            question: q.question,
            user_answer: '未作答',
            correct_answer: q.answer,
            type: q.type,
            options: q.options || []
          });
        }
        return;
      }
      if (!isCorrectAnswer(q)) {
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

  // 数学符号按钮（做答题用）
  const mathSymbols = ['+', '-', '×', '÷', '=', '(', ')', '。', ',', '%', 'π', '°'];

  // ========== 考试未开始：选卷页面 ==========
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

  // ========== 考试进行中 ==========
  const currentQuestion = paper?.questions[currentIndex];
  const sectionInfo = getSectionInfo(currentIndex);
  const totalAnswered = Object.keys(answers).length;
  const totalQuestions = paper?.questions.length || 0;
  const progress = totalQuestions > 0 ? Math.round((totalAnswered / totalQuestions) * 100) : 0;

  // 找当前题在全局questions数组中的位置
  const getGlobalIndex = (type, localIndex) => {
    let count = 0;
    for (const q of paper.questions) {
      if (q.type === type) {
        if (count === localIndex) return paper.questions.indexOf(q);
        count++;
      }
    }
    return -1;
  };

  return (
    <div style={{ padding: '20px', maxWidth: 900, margin: '0 auto' }}>
      {/* 顶部信息栏 */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <Title level={4} style={{ margin: 0 }}>
            {paper?.grade} {paper?.subject} - {paper?.semester}
          </Title>
          <Space>
            <ClockCircleOutlined style={{ color: timeLeft < 300 ? 'red' : 'inherit' }} />
            <Text style={{ fontSize: 20, color: timeLeft < 300 ? 'red' : 'inherit', fontFamily: 'monospace' }}>
              {formatTime(timeLeft)}
            </Text>
          </Space>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 10 }}>
          <Progress percent={progress} status="active" style={{ flex: 1 }} />
          <Text style={{ minWidth: 120 }}>已答 {totalAnswered} / {totalQuestions} 题</Text>
        </div>
        {/* 题型摘要栏 */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 10 }}>
          {sections.map(s => (
            <div key={s.type} style={{
              background: s.color + '22',
              border: `1px solid ${s.color}`,
              borderRadius: 6,
              padding: '4px 12px',
              color: s.color,
              fontWeight: 'bold',
              fontSize: 13,
            }}>
              {s.numeral}、{s.label} {s.questions.length}题
            </div>
          ))}
        </div>
      </Card>

      {/* 题目卡片 */}
      {currentQuestion && sectionInfo && (
        <Card
          key={currentQuestion.qid}
          style={{ marginBottom: 16, borderTop: `4px solid ${sectionInfo.section.color}` }}
        >
          {/* 题型section头 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 12,
            paddingBottom: 10,
            borderBottom: `2px dashed ${sectionInfo.section.color}33`,
          }}>
            <Title level={4} style={{
              margin: 0,
              color: sectionInfo.section.color,
            }}>
              {sectionInfo.section.numeral}、{sectionInfo.section.label}
            </Title>
            <Text type="secondary">
              （本类第 {sectionInfo.localIdx + 1} / {sectionInfo.section.questions.length} 题）
            </Text>
          </div>

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
                  style={{ width: '100%', maxWidth: 500, fontSize: 18 }}
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
                  danger={answers[currentQuestion.qid] === '对'}
                >
                  ✓ 对
                </Button>
                <Button
                  type={answers[currentQuestion.qid] === '错' ? 'primary' : 'default'}
                  onClick={() => handleAnswer(currentQuestion.qid, '错')}
                  size="large"
                  style={{ width: 120, fontSize: 18, height: 50 }}
                  danger={answers[currentQuestion.qid] === '错'}
                >
                  ✗ 错
                </Button>
              </Space>
            )}

            {/* ========== 做答题 / 解答题 ========== */}
            {(currentQuestion.type === 'answer' || currentQuestion.type === 'application') && (
              <Space direction="vertical" style={{ width: '100%' }}>
                <div style={{ marginBottom: 8 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>快捷符号：</Text>
                  <Space size={4} wrap style={{ marginTop: 4 }}>
                    {mathSymbols.map(s => (
                      <Button
                        key={s}
                        size="small"
                        onClick={() => {
                          const cur = answers[currentQuestion.qid] || '';
                          handleAnswer(currentQuestion.qid, cur + s);
                        }}
                      >
                        {s}
                      </Button>
                    ))}
                  </Space>
                </div>
                <TextArea
                  placeholder={`请在此处填写${TYPE_CHINESE[currentQuestion.type] || '答案'}（解题过程、计算步骤、解答内容）`}
                  value={answers[currentQuestion.qid] || ''}
                  onChange={(e) => handleAnswer(currentQuestion.qid, e.target.value)}
                  rows={6}
                  style={{ fontSize: 16 }}
                />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {TYPE_CHINESE[currentQuestion.type]}：请在下方填写完整解题过程
                </Text>
              </Space>
            )}
          </div>
        </Card>
      )}

      {/* 底部导航 */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <Button
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex(prev => prev - 1)}
          >
            ← 上一题
          </Button>

          <Space wrap>
            {sections.map(s => (
              <Button
                key={s.type}
                type={sectionInfo?.section?.type === s.type ? 'primary' : 'default'}
                onClick={() => {
                  const firstQ = s.questions[0];
                  if (firstQ) setCurrentIndex(qidToIndex[firstQ.qid] ?? 0);
                }}
                style={{
                  borderColor: sectionInfo?.section?.type === s.type ? s.color : undefined,
                  background: sectionInfo?.section?.type === s.type ? s.color : undefined,
                }}
              >
                {s.numeral}、{s.label}({s.questions.length})
              </Button>
            ))}
          </Space>

          {currentIndex < paper?.questions.length - 1 ? (
            <Button type="primary" onClick={() => setCurrentIndex(prev => prev + 1)}>
              下一题 →
            </Button>
          ) : (
            <Button type="primary" danger onClick={() => setSubmitModalVisible(true)}>
              <SendOutlined /> 提交试卷
            </Button>
          )}
        </div>

        {/* 题目导航 - 按题型分组 */}
        <div style={{ marginTop: 16 }}>
          <Text strong>题目导航（按题型分组）：</Text>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
            {sections.map(s => (
              <div key={s.type} style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <Text style={{ minWidth: 80, color: s.color, fontWeight: 'bold', fontSize: 13 }}>
                  {s.numeral}、{s.label}
                </Text>
                <Space size={4} wrap>
                    {s.questions.map((q, idx) => {
                    const isAnswered = !!answers[q.qid];
                    const globalIdx = qidToIndex[q.qid] ?? paper.questions.indexOf(q);
                    return (
                      <Button
                        key={q.qid}
                        type={isAnswered ? 'primary' : 'default'}
                        shape="circle"
                        size="small"
                        onClick={() => setCurrentIndex(globalIdx)}
                        style={{
                          backgroundColor: isAnswered ? s.color : 'transparent',
                          color: isAnswered ? 'white' : s.color,
                          borderColor: s.color,
                          fontWeight: globalIdx === currentIndex ? 'bold' : 'normal',
                          boxShadow: globalIdx === currentIndex ? `0 0 0 2px ${s.color}` : 'none',
                        }}
                      >
                        {idx + 1}
                      </Button>
                    );
                  })}
                </Space>
              </div>
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
        {Object.keys(answers).length < (paper?.questions.length || 0) && (
          <p style={{ color: '#faad14' }}>⚠ 还有 {((paper?.questions.length || 0) - Object.keys(answers).length)} 题未作答</p>
        )}
      </Modal>
    </div>
  );
}

export default ExamPage;
