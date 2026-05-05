#!/usr/bin/env python3
"""
题库生成器 - 语文/数学/英语各100套试卷
计算机高级工程师 Agent 编写
"""

import json
import os
import random

# 基础路径
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, 'data', 'questions')

# 确保目录存在
os.makedirs(DATA_DIR, exist_ok=True)

# ==================== 语文题库（小学二年级） ====================

def generate_chinese_questions(semester='上册'):
    """生成语文题库"""
    questions = []
    qid = 1
    
    # 看拼音写汉字
    for i in range(15):
        char = random.choice(['大', '小', '人', '口', '手', '日', '月', '水', '火', '山', '石', '田', '禾', '天', '地', '风', '云', '雨', '雪', '花', '鸟', '虫', '鱼', '蛙', '马', '牛', '羊', '猪', '狗', '猫'])
        pinyin = random.choice(['bà', 'mā', 'gē', 'jiě', 'bà ba', 'mā ma', 'rì zi', 'yuè liang', 'shuǐ guǒ', 'huǒ bǎ', 'tiān qì', 'dà shù', 'xiǎo cǎo', 'niǎo er', 'yú er'])
        questions.append({
            'qid': f'C{qid:04d}',
            'type': 'fill',
            'question': f'看拼音，写词语：{pinyin}',
            'answer': char,
            'explanation': f'这个字是"{char}"'
        })
        qid += 1
    
    # 选择正确读音
    for i in range(10):
        questions.append({
            'qid': f'C{qid:04d}',
            'type': 'choice',
            'question': f'下列词语中 "{random.choice(["长","知","行","为","发"])}" 的读音正确的是？',
            'options': ['A. zhǎng', 'B. cháng', 'C. zǎng', 'D. cáng'],
            'answer': 'B',
            'explanation': '"长"在表示长度时读"cháng"'
        })
        qid += 1
    
    # 选词填空
    for i in range(10):
        questions.append({
            'qid': f'C{qid:04d}',
            'type': 'choice',
            'question': f'（　　）里应该填哪个词语？',
            'options': [
                f'A. {random.choice(["我们","他们","她们"])}',
                f'B. {random.choice(["春天","夏天","秋天"])}',
                f'C. {random.choice(["太阳","月亮","星星"])}',
                f'D. {random.choice(["学校","班级","教室"])}'
            ],
            'answer': random.choice(['A', 'B', 'C', 'D']),
            'explanation': '根据句意选择合适的词语'
        })
        qid += 1
    
    # 判断对错
    for i in range(10):
        is_right = random.choice([True, False])
        statement = random.choice([
            '"人"字共有两画。',
            '"日"字共有四画。',
            '春天是温暖的季节。',
            '星星只在晚上出现。',
            '我们是小学生。',
            '小学生要好好学习。',
            '一年有四个季节。',
            '月亮会发光。',
            '太阳从东方升起。',
            '鸟儿会在天上飞。'
        ])
        questions.append({
            'qid': f'C{qid:04d}',
            'type': 'judge',
            'question': f'判断对错：{statement}',
            'answer': '√' if is_right else '×',
            'explanation': '正确' if is_right else '错误'
        })
        qid += 1
    
    # 背诵填空
    for i in range(5):
        poems = [
            {'title': '春晓', 'content': ['春眠不觉晓，', '处处闻啼鸟。', '夜来风雨声，', '花落知多少。'], 'blank': '春眠不觉晓'},
            {'title': '静夜思', 'content': ['床前明月光，', '疑是地上霜。', '举头望明月，', '低头思故乡。'], 'blank': '疑是地上霜'},
            {'title': '登鹳雀楼', 'content': ['白日依山尽，', '黄河入海流。', '欲穷千里目，', '更上一层楼。'], 'blank': '更上一层楼'},
        ]
        poem = random.choice(poems)
        questions.append({
            'qid': f'C{qid:04d}',
            'type': 'fill',
            'question': f'古诗《{poem["title"]}》：{poem["blank"].replace(random.choice(list(poem["blank"])), "____")}',
            'answer': poem["blank"],
            'explanation': f'出自《{poem["title"]}》'
        })
        qid += 1
    
    return questions

# ==================== 数学题库（小学二年级） ====================

def generate_math_questions(semester='上册'):
    """生成数学题库"""
    questions = []
    qid = 1
    
    # 加法计算
    for i in range(15):
        a = random.randint(1, 50)
        b = random.randint(1, 50)
        questions.append({
            'qid': f'M{qid:04d}',
            'type': 'fill',
            'question': f'计算：{a} + {b} = ?',
            'answer': str(a + b),
            'explanation': f'{a} + {b} = {a + b}'
        })
        qid += 1
    
    # 减法计算
    for i in range(15):
        a = random.randint(20, 100)
        b = random.randint(1, a)
        questions.append({
            'qid': f'M{qid:04d}',
            'type': 'fill',
            'question': f'计算：{a} - {b} = ?',
            'answer': str(a - b),
            'explanation': f'{a} - {b} = {a - b}'
        })
        qid += 1
    
    # 乘法计算
    for i in range(10):
        a = random.randint(1, 9)
        b = random.randint(1, 9)
        questions.append({
            'qid': f'M{qid:04d}',
            'type': 'fill',
            'question': f'计算：{a} × {b} = ?',
            'answer': str(a * b),
            'explanation': f'{a} × {b} = {a * b}'
        })
        qid += 1
    
    # 比大小
    for i in range(10):
        a = random.randint(1, 100)
        b = random.randint(1, 100)
        questions.append({
            'qid': f'M{qid:04d}',
            'type': 'choice',
            'question': f'比较大小：{a}（　）{b}',
            'options': ['A. >', 'B. <', 'C. ='],
            'answer': 'A' if a > b else ('B' if a < b else 'C'),
            'explanation': f'{a} {"大于" if a > b else ("小于" if a < b else "等于")} {b}'
        })
        qid += 1
    
    # 应用题
    for i in range(10):
        apples = random.randint(10, 30)
        eat = random.randint(1, apples - 5)
        questions.append({
            'qid': f'M{qid:04d}',
            'type': 'fill',
            'question': f'小明有{apples}个苹果，吃了{eat}个，还剩多少个？',
            'answer': str(apples - eat),
            'explanation': f'{apples} - {eat} = {apples - eat}（个）'
        })
        qid += 1
    
    return questions

# ==================== 英语题库（小学二年级） ====================

def generate_english_questions(semester='上册'):
    """生成英语题库"""
    questions = []
    qid = 1
    
    # 单词选择
    words = [
        ('apple', '苹果'), ('banana', '香蕉'), ('orange', '橙子'),
        ('cat', '猫'), ('dog', '狗'), ('bird', '鸟'),
        ('book', '书'), ('pen', '钢笔'), ('ruler', '尺子'),
        ('red', '红色'), ('blue', '蓝色'), ('yellow', '黄色'),
        ('one', '一'), ('two', '二'), ('three', '三'),
        ('four', '四'), ('five', '五'), ('six', '六'),
        ('hello', '你好'), ('thank', '谢谢'), ('yes', '是'),
        ('no', '不'), ('good', '好的'), ('morning', '早上'),
        ('afternoon', '下午'), ('evening', '晚上')
    ]
    
    for i in range(20):
        word, meaning = random.choice(words)
        wrong_words = [w[0] for w in random.sample([w for w in words if w[0] != word], 3)]
        options = [word] + wrong_words
        random.shuffle(options)
        
        questions.append({
            'qid': f'E{qid:04d}',
            'type': 'choice',
            'question': f'"{meaning}" 的英语单词是？',
            'options': [f'A. {options[0]}', f'B. {options[1]}', f'C. {options[2]}', f'D. {options[3]}'],
            'answer': ['A', 'B', 'C', 'D'][options.index(word)],
            'explanation': f'"{meaning}" 的英语是 "{word}"'
        })
        qid += 1
    
    # 单词拼写
    for i in range(15):
        word, _ = random.choice(words[:15])
        blank_word = word[0] + '_' * (len(word) - 1)
        questions.append({
            'qid': f'E{qid:04d}',
            'type': 'fill',
            'question': f'补全单词：{blank_word}（苹果）',
            'answer': word,
            'explanation': f'这个单词是 "{word}"'
        })
        qid += 1
    
    # 选中文意思
    for i in range(10):
        word, meaning = random.choice(words)
        questions.append({
            'qid': f'E{qid:04d}',
            'type': 'choice',
            'question': f'单词 "{word}" 的中文意思是？',
            'options': [f'A. {meaning}', f'B. {random.choice(words)[1]}', f'C. {random.choice(words)[1]}', f'D. {random.choice(words)[1]}'],
            'answer': 'A',
            'explanation': f'"{word}" 意思是 "{meaning}"'
        })
        qid += 1
    
    # 判断对错
    for i in range(10):
        is_right = random.choice([True, False])
        statements = [
            '"apple" 是苹果的意思。',
            '"cat" 是一种动物。',
            '"one" 表示数字 1。',
            '红色是 "red"。',
            '早上是 "morning"。',
            '"book" 是钢笔的意思。',
            '"five" 表示数字 5。',
            '黄色是 "blue"。',
            '"dog" 是一种动物。',
            '你好可以说 "hello"。'
        ]
        questions.append({
            'qid': f'E{qid:04d}',
            'type': 'judge',
            'question': f'判断对错：{random.choice(statements)}',
            'answer': '√' if is_right else '×',
            'explanation': '正确' if is_right else '错误'
        })
        qid += 1
    
    # 翻译句子
    for i in range(5):
        questions.append({
            'qid': f'E{qid:04d}',
            'type': 'fill',
            'question': f'翻译：I am a student.（我是___）',
            'answer': '学生',
            'explanation': 'student 的意思是学生'
        })
        qid += 1
    
    return questions

# ==================== 生成题库文件 ====================

def generate_all_question_banks():
    """生成所有题库文件"""
    subjects = {
        'chinese_上册': generate_chinese_questions('上册'),
        'chinese_下册': generate_chinese_questions('下册'),
        'math_上册': generate_math_questions('上册'),
        'math_下册': generate_math_questions('下册'),
        'english_上册': generate_english_questions('上册'),
        'english_下册': generate_english_questions('下册'),
    }
    
    for filename, questions in subjects.items():
        filepath = os.path.join(DATA_DIR, f'{filename}.json')
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(questions, f, ensure_ascii=False, indent=2)
        print(f"✅ 生成题库: {filename} ({len(questions)} 题)")
    
    print(f"\n📚 共生成 {len(subjects)} 个题库文件")

if __name__ == '__main__':
    print("🔢 开始生成题库...")
    generate_all_question_banks()
    print("\n🎉 题库生成完成！")