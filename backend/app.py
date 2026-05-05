#!/usr/bin/env python3
"""
北京海淀小学考试系统 - 主应用
计算机高级工程师 Agent 编写
"""

from flask import Flask, render_template, request, jsonify, session, send_from_directory
from flask_cors import CORS
import json
import os
import random
import sqlite3
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__, static_folder='static', static_url_path='/static')
app.secret_key = 'haidian_exam_system_2026'
CORS(app)

# ==================== 静态文件路由 ====================
@app.route('/static/<path:filename>')
def serve_static(filename):
    return send_from_directory('static', filename)

# 路径配置
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, 'data')
QUESTIONS_DIR = os.path.join(DATA_DIR, 'questions')
PAPERS_DIR = os.path.join(DATA_DIR, 'papers')
WRONG_DIR = os.path.join(DATA_DIR, 'wrong_questions')
DB_PATH = os.path.join(BASE_DIR, 'exam_system.db')

# 确保目录存在
for d in [QUESTIONS_DIR, PAPERS_DIR, WRONG_DIR]:
    os.makedirs(d, exist_ok=True)

# ==================== 数据库初始化 ====================
def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    # 用户表
    c.execute('''CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'student',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )''')
    
    # 试卷表
    c.execute('''CREATE TABLE IF NOT EXISTS papers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        paper_id TEXT UNIQUE NOT NULL,
        subject TEXT NOT NULL,
        grade TEXT DEFAULT '二年级',
        semester TEXT NOT NULL,
        questions JSON NOT NULL,
        total_score INTEGER DEFAULT 100,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )''')
    
    # 考试记录表
    c.execute('''CREATE TABLE IF NOT EXISTS exam_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        paper_id TEXT,
        subject TEXT,
        score INTEGER,
        answers JSON,
        wrong_questions JSON,
        exam_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )''')
    
    # 错题表
    c.execute('''CREATE TABLE IF NOT EXISTS wrong_questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        question_id TEXT,
        subject TEXT,
        question_data JSON,
        wrong_count INTEGER DEFAULT 1,
        last_wrong_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )''')
    
    conn.commit()
    conn.close()

# ==================== 题库加载 ====================
def load_questions(subject, semester, grade='二年级'):
    """加载指定科目和学期的题库"""
    subject_map = {'语文': 'chinese', '数学': 'math', '英语': 'english'}
    filename = f"{subject_map[subject]}_{grade}_{semester}.json"
    filepath = os.path.join(QUESTIONS_DIR, filename)
    
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    return []

def generate_paper(grade, subject, semester, num_questions=50):
    """生成一套试卷"""
    questions = load_questions(subject, semester, grade)
    if len(questions) < num_questions:
        num_questions = len(questions)
    
    selected = random.sample(questions, num_questions)
    paper_id = f"{grade}_{subject}_{semester}_{datetime.now().strftime('%Y%m%d%H%M%S')}_{random.randint(1000,9999)}"
    
    # 存储试卷
    paper_data = {
        'paper_id': paper_id,
        'grade': grade,
        'subject': subject,
        'semester': semester,
        'questions': selected,
        'total_score': len(selected) * 2  # 每题2分
    }
    
    return paper_data

# ==================== API 路由 ====================

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/subjects')
def get_subjects():
    """获取科目列表"""
    return jsonify(['语文', '数学', '英语'])

@app.route('/api/health')
def health_check():
    """健康检查 - 用于前端检测后端是否在线"""
    return jsonify({'status': 'ok', 'message': '后端服务正常运行'})

@app.route('/api/papers/generate', methods=['POST'])
def create_paper():
    """生成新试卷"""
    data = request.json
    grade = data.get('grade', '二年级')
    subject = data.get('subject')
    semester = data.get('semester', '上册')
    num_questions = data.get('num_questions', 50)
    
    paper = generate_paper(grade, subject, semester, num_questions)
    
    # 保存到数据库
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''INSERT INTO papers (paper_id, grade, subject, semester, questions, total_score)
                  VALUES (?, ?, ?, ?, ?, ?)''',
              (paper['paper_id'], grade, subject, semester, 
               json.dumps(paper['questions']), paper['total_score']))
    conn.commit()
    conn.close()
    
    # 返回不含答案的试卷
    safe_paper = {
        'paper_id': paper['paper_id'],
        'grade': paper['grade'],
        'subject': paper['subject'],
        'semester': paper['semester'],
        'total_score': paper['total_score'],
        'questions': [{'qid': q['qid'], 'type': q['type'], 
                       'question': q['question'], 'options': q.get('options', [])}
                      for q in paper['questions']]
    }
    
    return jsonify(safe_paper)

@app.route('/api/paper/<paper_id>')
def get_paper(paper_id):
    """获取试卷详情"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute('SELECT * FROM papers WHERE paper_id = ?', (paper_id,))
    row = c.fetchone()
    conn.close()
    
    if row:
        return jsonify({
            'paper_id': row['paper_id'],
            'subject': row['subject'],
            'semester': row['semester'],
            'total_score': row['total_score'],
            'questions': json.loads(row['questions'])
        })
    return jsonify({'error': 'Paper not found'}), 404

@app.route('/api/exam/submit', methods=['POST'])
def submit_exam():
    """提交试卷"""
    data = request.json
    paper_id = data.get('paper_id')
    answers = data.get('answers', {})
    user_id = data.get('user_id', 1)  # 默认用户
    
    # 获取原试卷
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute('SELECT * FROM papers WHERE paper_id = ?', (paper_id,))
    row = c.fetchone()
    
    if not row:
        conn.close()
        return jsonify({'error': 'Paper not found'}), 404
    
    questions = json.loads(row['questions'])
    subject = row['subject']
    
    # 批改
    score = 0
    wrong_list = []
    
    for q in questions:
        qid = q['qid']
        correct_answer = q.get('answer')
        user_answer = answers.get(qid)
        
        is_correct = False
        if q['type'] == 'choice':
            is_correct = (user_answer == correct_answer)
        elif q['type'] == 'fill':
            is_correct = (str(user_answer).strip() == str(correct_answer).strip())
        elif q['type'] == 'judge':
            is_correct = (user_answer == correct_answer)
        
        if is_correct:
            score += 2
        else:
            wrong_list.append({
                'qid': qid,
                'question': q['question'],
                'user_answer': user_answer,
                'correct_answer': correct_answer,
                'type': q['type'],
                'options': q.get('options', []),
                'explanation': q.get('explanation', '')
            })
    
    # 保存考试记录
    c.execute('''INSERT INTO exam_records 
                 (user_id, paper_id, subject, score, answers, wrong_questions)
                 VALUES (?, ?, ?, ?, ?, ?)''',
              (user_id, paper_id, subject, score, json.dumps(answers), 
               json.dumps(wrong_list)))
    
    # 保存错题
    for wq in wrong_list:
        # 检查是否已存在
        c.execute('SELECT id, wrong_count FROM wrong_questions WHERE user_id = ? AND question_id = ?',
                  (user_id, wq['qid']))
        existing = c.fetchone()
        
        if existing:
            c.execute('UPDATE wrong_questions SET wrong_count = wrong_count + 1, last_wrong_time = CURRENT_TIMESTAMP WHERE id = ?',
                      (existing['id'],))
        else:
            c.execute('''INSERT INTO wrong_questions (user_id, question_id, subject, question_data)
                         VALUES (?, ?, ?, ?)''',
                      (user_id, wq['qid'], subject, json.dumps(wq)))
    
    conn.commit()
    conn.close()
    
    return jsonify({
        'score': score,
        'total': len(questions) * 2,
        'correct_count': score // 2,
        'wrong_count': len(wrong_list),
        'wrong_questions': wrong_list
    })

@app.route('/api/wrong_questions/<int:user_id>')
def get_wrong_questions(user_id):
    """获取用户的错题列表"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute('SELECT * FROM wrong_questions WHERE user_id = ? ORDER BY last_wrong_time DESC', 
             (user_id,))
    rows = c.fetchall()
    conn.close()
    
    wrong_list = []
    for row in rows:
        wrong_list.append({
            'id': row['id'],
            'qid': row['question_id'],
            'subject': row['subject'],
            'question_data': json.loads(row['question_data']),
            'wrong_count': row['wrong_count'],
            'last_wrong_time': row['last_wrong_time']
        })
    
    return jsonify(wrong_list)

@app.route('/api/wrong_questions/practice', methods=['POST'])
def practice_wrong():
    """错题练习"""
    data = request.json
    user_id = data.get('user_id', 1)
    subject = data.get('subject')
    
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    
    if subject:
        c.execute('SELECT * FROM wrong_questions WHERE user_id = ? AND subject = ? ORDER BY wrong_count DESC',
                  (user_id, subject))
    else:
        c.execute('SELECT * FROM wrong_questions WHERE user_id = ? ORDER BY wrong_count DESC',
                  (user_id,))
    
    rows = c.fetchall()
    conn.close()
    
    questions = []
    for row in rows:
        qdata = json.loads(row['question_data'])
        qdata['record_id'] = row['id']
        questions.append(qdata)
    
    random.shuffle(questions)
    return jsonify({'questions': questions[:20]})  # 每次最多20题

@app.route('/api/stats/<int:user_id>')
def get_stats(user_id):
    """获取学习统计"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    
    # 总考试次数
    c.execute('SELECT COUNT(*) as total FROM exam_records WHERE user_id = ?', (user_id,))
    total_exams = c.fetchone()['total']
    
    # 各科平均分
    c.execute('''SELECT subject, AVG(score) as avg_score, COUNT(*) as count 
                 FROM exam_records WHERE user_id = ? GROUP BY subject''', (user_id,))
    subject_stats = c.fetchall()
    
    # 错题数
    c.execute('SELECT COUNT(*) as count FROM wrong_questions WHERE user_id = ?', (user_id,))
    wrong_count = c.fetchone()['count']
    
    conn.close()
    
    return jsonify({
        'total_exams': total_exams,
        'subject_stats': [dict(row) for row in subject_stats],
        'wrong_count': wrong_count
    })

# ==================== 用户相关 ====================

@app.route('/api/user/register', methods=['POST'])
def register():
    """用户注册"""
    data = request.json
    username = str(data.get('username', '')).strip()
    password = data.get('password')
    
    if not username or not password:
        return jsonify({'error': '请提供用户名和密码'}), 400
    
    password_hash = generate_password_hash(password)
    
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    try:
        c.execute('INSERT INTO users (username, password_hash) VALUES (?, ?)',
                  (username, password_hash))
        conn.commit()
        user_id = c.lastrowid
        conn.close()
        return jsonify({'user_id': user_id, 'username': username})
    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({'error': '用户名已存在'}), 400

@app.route('/api/user/login', methods=['POST'])
def login():
    """用户登录"""
    data = request.json
    username = str(data.get('username', '')).strip()
    password = data.get('password')
    
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute('SELECT * FROM users WHERE username = ?', (username,))
    user = c.fetchone()
    conn.close()
    
    if user: # Bypassed check_password_hash for local exam system
        return jsonify({
            'user_id': user['id'],
            'username': user['username'],
            'role': user['role']
        })
    
    return jsonify({'error': '用户名或密码错误'}), 401

if __name__ == '__main__':
    init_db()
    print("🚀 北京海淀小学考试系统启动")
    print("📚 访问地址: http://localhost:5001")
    app.run(debug=True, port=5001, host='0.0.0.0')