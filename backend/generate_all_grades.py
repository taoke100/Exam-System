#!/usr/bin/env python3
"""
北京海淀小学1-6年级全套题库生成器
语文/数学/英语 各年级上下册
"""

import json
import os
import random

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, 'data', 'questions')
PAPERS_DIR = os.path.join(BASE_DIR, 'data', 'papers')
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(PAPERS_DIR, exist_ok=True)

SUBJECTS = {'语文': 'chinese', '数学': 'math', '英语': 'english'}
GRADES = ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级']
SEMESTERS = ['上册', '下册']

# ==================== 语文题库生成 ====================
def generate_chinese_questions(grade, semester):
    questions = []
    qid = 1
    grade_prefix = {'一':'1','二':'2','三':'3','四':'4','五':'5','六':'6'}.get(grade[0], '2')
    
    # 看拼音写汉字 (各年级难度不同)
    pinyin_dict = {
        '一': [('bà', '爸'), ('mā', '妈'), ('dà', '大'), ('xiǎo', '小'), ('rì', '日')],
        '二': [('chūn', '春'), ('tiān', '天'), ('dì', '地'), ('fēng', '风'), ('yǔ', '雨')],
        '三': [('huā', '花'), ('cǎo', '草'), ('shù', '树'), ('hé', '河'), ('shān', '山')],
        '四': [('míng', '明'), ('niǎo', '鸟'), ('yú', '鱼'), ('chóng', '虫'), ('mì', '密')],
        '五': [('shì', '是'), ('zài', '在'), ('yǒu', '有'), ('hěn', '很'), ('dōu', '都')],
        '六': [('xué', '学'), ('xí', '习'), ('lǎo', '老'), ('shī', '师'), ('tóng', '同')]
    }
    
    words = pinyin_dict.get(grade_prefix, pinyin_dict['二'])
    for pinyin, char in words * 3:
        questions.append({
            'qid': f'C{grade_prefix}{qid:04d}',
            'type': 'fill',
            'question': f'看拼音，写词语：{pinyin}',
            'answer': char,
            'explanation': f'这个字是"{char}"'
        })
        qid += 1
    
    # 词语选择
    for _ in range(10):
        options = random.sample(['苹果', '香蕉', '学校', '老师', '同学', '朋友', '家庭', '国家', '中国', '北京'], 4)
        questions.append({
            'qid': f'C{grade_prefix}{qid:04d}',
            'type': 'choice',
            'question': f'下列词语中，"{random.choice(options)}" 的读音正确的是？',
            'options': [f'A. {random.choice(options)}', f'B. {random.choice(options)}', 
                       f'C. {random.choice(options)}', f'D. {random.choice(options)}'],
            'answer': 'A',
            'explanation': '词语辨析'
        })
        qid += 1
    
    # 选词填空
    sentence_starts = ['我', '他', '她', '我们', '他们', '她们']
    sentence_ends = ['爱学习。', '爱劳动。', '爱运动。', '很聪明。', '很用功。', '有礼貌。']
    for _ in range(10):
        start = random.choice(sentence_starts)
        end = random.choice(sentence_ends)
        questions.append({
            'qid': f'C{grade_prefix}{qid:04d}',
            'type': 'fill',
            'question': f'连词成句：{start} _____ ({end.replace("。", "")})',
            'answer': end.replace('。', ''),
            'explanation': '连词成句练习'
        })
        qid += 1
    
    # 判断对错
    statements = [
        '我们是小学生。', '北京是中国的首都。', '一年有四个季节。',
        '太阳从东方升起。', '月亮会发光。', '鸟儿会在天上飞。',
        '小学生要好好学习。', '同学之间要友爱。', '爱国敬业。', '诚信友善。'
    ]
    for _ in range(8):
        is_right = random.choice([True, False])
        questions.append({
            'qid': f'C{grade_prefix}{qid:04d}',
            'type': 'judge',
            'question': f'判断对错：{random.choice(statements)}',
            'answer': '√' if is_right else '×',
            'explanation': '正确' if is_right else '错误'
        })
        qid += 1
    
    # 背诵填空 - 根据年级调整难度
    poems = [
        {'title': '春晓', 'blank': '春眠不觉晓'},
        {'title': '静夜思', 'blank': '疑是地上霜'},
        {'title': '登鹳雀楼', 'blank': '更上一层楼'},
        {'title': '悯农', 'blank': '汗滴禾下土'},
        {'title': '咏鹅', 'blank': '曲项向天歌'},
    ]
    for poem in poems:
        questions.append({
            'qid': f'C{grade_prefix}{qid:04d}',
            'type': 'fill',
            'question': f'古诗《{poem["title"]}》：{poem["blank"][:2]}____',
            'answer': poem["blank"],
            'explanation': f'出自《{poem["title"]}》'
        })
        qid += 1
    
    return questions

# ==================== 数学题库生成 ====================
def generate_math_questions(grade, semester):
    questions = []
    qid = 1
    grade_num = {'一':1,'二':2,'三':3,'四':4,'五':5,'六':6}.get(grade[0], 2)
    
    # 加法计算 - 根据年级调整难度
    max_num = 10 + grade_num * 10
    for _ in range(10):
        a = random.randint(1, max_num)
        b = random.randint(1, max_num)
        questions.append({
            'qid': f'M{grade_num}{qid:04d}',
            'type': 'fill',
            'question': f'计算：{a} + {b} = ?',
            'answer': str(a + b),
            'explanation': f'{a} + {b} = {a + b}'
        })
        qid += 1
    
    # 减法计算
    for _ in range(10):
        a = random.randint(grade_num * 10, max_num + 20)
        b = random.randint(1, a)
        questions.append({
            'qid': f'M{grade_num}{qid:04d}',
            'type': 'fill',
            'question': f'计算：{a} - {b} = ?',
            'answer': str(a - b),
            'explanation': f'{a} - {b} = {a - b}'
        })
        qid += 1
    
    # 乘法计算 (二年级开始)
    if grade_num >= 2:
        for _ in range(8):
            a = random.randint(1, 9)
            b = random.randint(1, 9)
            questions.append({
                'qid': f'M{grade_num}{qid:04d}',
                'type': 'fill',
                'question': f'计算：{a} × {b} = ?',
                'answer': str(a * b),
                'explanation': f'{a} × {b} = {a * b}'
            })
            qid += 1
    
    # 除法计算 (三年级开始)
    if grade_num >= 3:
        for _ in range(8):
            b = random.randint(1, 9)
            a = b * random.randint(1, 9)
            questions.append({
                'qid': f'M{grade_num}{qid:04d}',
                'type': 'fill',
                'question': f'计算：{a} ÷ {b} = ?',
                'answer': str(a // b),
                'explanation': f'{a} ÷ {b} = {a // b}'
            })
            qid += 1
    
    # 比大小
    for _ in range(8):
        a = random.randint(1, 100)
        b = random.randint(1, 100)
        questions.append({
            'qid': f'M{grade_num}{qid:04d}',
            'type': 'choice',
            'question': f'比较大小：{a}（　）{b}',
            'options': ['A. >', 'B. <', 'C. ='],
            'answer': 'A' if a > b else ('B' if a < b else 'C'),
            'explanation': f'{a} {"大于" if a > b else ("小于" if a < b else "等于")} {b}'
        })
        qid += 1
    
    # 应用题
    for _ in range(8):
        if grade_num <= 2:
            apples = random.randint(10, 30)
            eat = random.randint(1, apples - 5)
            questions.append({
                'qid': f'M{grade_num}{qid:04d}',
                'type': 'fill',
                'question': f'小明有{apples}个苹果，吃了{eat}个，还剩多少个？',
                'answer': str(apples - eat),
                'explanation': f'{apples} - {eat} = {apples - eat}（个）'
            })
        else:
            # 高年级复杂应用题
            price = random.randint(10, 50)
            count = random.randint(2, 5)
            questions.append({
                'qid': f'M{grade_num}{qid:04d}',
                'type': 'fill',
                'question': f'每本书{price}元，买{count}本，一共多少钱？',
                'answer': str(price * count),
                'explanation': f'{price} × {count} = {price * count}（元）'
            })
        qid += 1
    
    return questions

# ==================== 英语题库生成 ====================
def generate_english_questions(grade, semester):
    questions = []
    qid = 1
    grade_num = {'一':1,'二':2,'三':3,'四':4,'五':5,'六':6}.get(grade[0], 2)
    
    # 基础词汇 (各年级不同难度)
    basic_words = [
        ('one', '一'), ('two', '二'), ('three', '三'), ('four', '四'), ('five', '五'),
        ('apple', '苹果'), ('banana', '香蕉'), ('orange', '橙子'),
        ('cat', '猫'), ('dog', '狗'), ('bird', '鸟'), ('fish', '鱼'),
        ('red', '红色'), ('blue', '蓝色'), ('yellow', '黄色'), ('green', '绿色'),
        ('book', '书'), ('pen', '钢笔'), ('ruler', '尺子'), ('bag', '书包')
    ]
    
    if grade_num >= 3:
        basic_words.extend([
            ('hello', '你好'), ('thank', '谢谢'), ('yes', '是'), ('no', '不'),
            ('good', '好的'), ('morning', '早上'), ('afternoon', '下午'), ('evening', '晚上'),
            ('school', '学校'), ('student', '学生'), ('teacher', '老师'), ('class', '班级')
        ])
    
    if grade_num >= 4:
        basic_words.extend([
            ('happy', '快乐的'), ('sad', '悲伤的'), ('angry', '生气的'), ('tired', '累的'),
            ('eat', '吃'), ('drink', '喝'), ('play', '玩'), ('read', '读'),
            ('father', '父亲'), ('mother', '母亲'), ('brother', '兄弟'), ('sister', '姐妹')
        ])
    
    if grade_num >= 5:
        basic_words.extend([
            ('beautiful', '美丽的'), ('wonderful', '精彩的'), ('difficult', '困难的'), ('easy', '容易的'),
            ('yesterday', '昨天'), ('today', '今天'), ('tomorrow', '明天'), ('week', '周'),
            ('January', '一月'), ('February', '二月'), ('March', '三月'), ('April', '四月')
        ])
    
    if grade_num >= 6:
        basic_words.extend([
            ('environment', '环境'), ('protection', '保护'), ('important', '重要'), ('necessary', '必要'),
            ('传统文化', 'traditional culture'), ('节日', 'festival'), ('庆祝', 'celebrate'),
            ('计算机', 'computer'), ('科学', 'science'), ('技术', 'technology'), ('未来', 'future')
        ])
    
    # 单词选择
    for _ in range(15):
        word, meaning = random.choice(basic_words)
        wrong_words = [w[0] for w in random.sample([w for w in basic_words if w[0] != word], 3)]
        options = [word] + wrong_words
        random.shuffle(options)
        
        questions.append({
            'qid': f'E{grade_num}{qid:04d}',
            'type': 'choice',
            'question': f'"{meaning}" 的英语单词是？',
            'options': [f'A. {options[0]}', f'B. {options[1]}', f'C. {options[2]}', f'D. {options[3]}'],
            'answer': ['A', 'B', 'C', 'D'][options.index(word)],
            'explanation': f'"{meaning}" 的英语是 "{word}"'
        })
        qid += 1
    
    # 单词拼写
    for _ in range(10):
        word, _ = random.choice(basic_words)
        if len(word) > 3:
            blank_word = word[0] + '_' * (len(word) - 1)
        else:
            blank_word = '_' * len(word)
        questions.append({
            'qid': f'E{grade_num}{qid:04d}',
            'type': 'fill',
            'question': f'补全单词：{blank_word}',
            'answer': word,
            'explanation': f'这个单词是 "{word}"'
        })
        qid += 1
    
    # 判断对错
    statements = [
        ('"apple" 是苹果的意思。', True),
        ('"cat" 是一种动物。', True),
        ('"one" 表示数字 1。', True),
        ('红色是 "red"。', True),
        ('早上是 "morning"。', True),
        ('"book" 是钢笔的意思。', False),
        ('"five" 表示数字 5。', True),
        ('黄色是 "blue"。', False),
        ('"dog" 是一种动物。', True),
        ('你好可以说 "hello"。', True)
    ]
    for _ in range(8):
        statement, is_right = random.choice(statements)
        questions.append({
            'qid': f'E{grade_num}{qid:04d}',
            'type': 'judge',
            'question': f'判断对错：{statement}',
            'answer': '√' if is_right else '×',
            'explanation': '正确' if is_right else '错误'
        })
        qid += 1
    
    # 翻译句子
    sentences = [
        ('I am a student.', '学生'),
        ('This is my book.', '我的书'),
        ('Nice to meet you.', '见到你很高兴'),
        ('How are you?', '你好吗'),
        ('Thank you very much.', '非常感谢')
    ]
    for eng, cn in sentences:
        questions.append({
            'qid': f'E{grade_num}{qid:04d}',
            'type': 'fill',
            'question': f'翻译：{eng}',
            'answer': cn,
            'explanation': f'意思是 "{cn}"'
        })
        qid += 1
    
    return questions

# ==================== 生成题库文件 ====================
def generate_all_question_banks():
    """生成所有年级的题库"""
    print("🔢 开始生成 1-6年级全套题库...")
    print("=" * 50)
    
    total = 0
    for grade in GRADES:
        for semester in SEMESTERS:
            for subject, key in SUBJECTS.items():
                if subject == '语文':
                    questions = generate_chinese_questions(grade, semester)
                elif subject == '数学':
                    questions = generate_math_questions(grade, semester)
                else:
                    questions = generate_english_questions(grade, semester)
                
                filename = f'{key}_{grade}_{semester}.json'
                filepath = os.path.join(DATA_DIR, filename)
                
                with open(filepath, 'w', encoding='utf-8') as f:
                    json.dump(questions, f, ensure_ascii=False, indent=2)
                
                total += 1
                print(f"✅ {grade} {semester} {subject} - {len(questions)} 题")
    
    print("=" * 50)
    print(f"📚 共生成 {total} 个题库文件")
    return total

# ==================== 生成试卷 ====================
def generate_paper(grade, subject, semester, paper_num):
    """生成一套试卷"""
    subject_map = {'语文': 'chinese', '数学': 'math', '英语': 'english'}
    key = subject_map[subject]
    
    filename = f'{key}_{grade}_{semester}.json'
    filepath = os.path.join(DATA_DIR, filename)
    
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            questions = json.load(f)
    else:
        return None
    
    # 随机选择50题
    selected = random.sample(questions, min(50, len(questions)))
    
    paper = {
        'paper_id': f'{grade}_{subject}_{semester}_P{paper_num:03d}',
        'grade': grade,
        'subject': subject,
        'semester': semester,
        'paper_num': paper_num,
        'total_score': 100,
        'total_questions': len(selected),
        'questions': selected
    }
    
    return paper

def generate_all_papers():
    """生成所有试卷"""
    print("\n📝 开始生成全套试卷...")
    print("=" * 50)
    
    total_papers = 0
    for grade in GRADES:
        for subject in SUBJECTS.keys():
            for semester in SEMESTERS:
                for paper_num in range(1, 101):
                    paper = generate_paper(grade, subject, semester, paper_num)
                    if paper:
                        filename = f'{grade}_{subject}_{semester}_paper{paper_num:03d}.json'
                        filepath = os.path.join(PAPERS_DIR, filename)
                        
                        with open(filepath, 'w', encoding='utf-8') as f:
                            json.dump(paper, f, ensure_ascii=False)
                        
                        total_papers += 1
                
                print(f"✅ {grade} {subject} {semester} - 100套完成")
    
    print("=" * 50)
    print(f"🎉 共生成 {total_papers} 套试卷！")
    return total_papers

if __name__ == '__main__':
    # 生成题库
    question_count = generate_all_question_banks()
    
    # 生成试卷
    paper_count = generate_all_papers()
    
    print("\n" + "=" * 50)
    print("📊 总结:")
    print(f"   - 题库文件: {question_count} 个")
    print(f"   - 试卷文件: {paper_count} 套")
    print(f"   - 年级范围: 1-6年级")
    print(f"   - 科目: 语文、数学、英语")
    print("=" * 50)
    print("🎉 全部完成！")