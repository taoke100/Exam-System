#!/usr/bin/env python3
"""
试卷生成器 - 语文/数学/英语各100套试卷
计算机高级工程师 Agent 编写
"""

import json
import os
import random
from datetime import datetime

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
QUESTIONS_DIR = os.path.join(BASE_DIR, 'data', 'questions')
PAPERS_DIR = os.path.join(BASE_DIR, 'data', 'papers')
os.makedirs(PAPERS_DIR, exist_ok=True)

def load_questions(subject, semester):
    """加载题库"""
    subject_map = {'语文': 'chinese', '数学': 'math', '英语': 'english'}
    filename = f"{subject_map[subject]}_{semester}.json"
    filepath = os.path.join(QUESTIONS_DIR, filename)
    
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    return []

def generate_paper(subject, semester, paper_num):
    """生成一套试卷"""
    questions = load_questions(subject, semester)
    if not questions:
        return None
    
    # 随机选择50题组成一套试卷
    selected = random.sample(questions, min(50, len(questions)))
    
    paper = {
        'paper_id': f'{subject}{semester}P{paper_num:03d}',
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
    subjects = ['语文', '数学', '英语']
    semesters = ['上册', '下册']
    
    total_papers = 0
    
    for subject in subjects:
        for semester in semesters:
            for paper_num in range(1, 101):
                paper = generate_paper(subject, semester, paper_num)
                if paper:
                    filename = f"{subject}_{semester}_paper{paper_num:03d}.json"
                    filepath = os.path.join(PAPERS_DIR, filename)
                    
                    with open(filepath, 'w', encoding='utf-8') as f:
                        json.dump(paper, f, ensure_ascii=False, indent=2)
                    
                    total_papers += 1
                    
                    if paper_num % 20 == 0:
                        print(f"✅ {subject} {semester} 已生成 {paper_num} 套试卷...")
    
    print(f"\n🎉 共生成 {total_papers} 套试卷！")
    print(f"📁 存储位置: {PAPERS_DIR}")

if __name__ == '__main__':
    print("📝 开始生成试卷...")
    generate_all_papers()