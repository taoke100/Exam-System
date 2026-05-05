# 北京海淀小学考试系统

北京海淀小学在线答题系统，支持小学一至六年级语文、数学、英语三科在线答题、错题归类和错题练习。

## 功能特性

- **在线答题**：计时功能、随机出题、多种题型支持
- **错题本**：自动归类学生错题，随时查看复习
- **错题练习**：针对错题进行二次训练，强化薄弱知识点
- **成绩统计**：查看答题成绩和学习进度
- **年级覆盖**：支持小学一至六年级全科目

## 技术栈

- **后端**：Python 3.x + Flask + SQLite
- **前端**：React + Ant Design
- **数据库**：SQLite（考试系统数据库）、JSON（题库文件）

## 目录结构

```
exam_system/
├── backend/                 # Flask 后端
│   ├── app.py               # 主应用入口
│   ├── models.py            # 数据模型
│   ├── requirements.txt      # Python 依赖
│   ├── question_generator.py # 题库生成脚本
│   ├── generate_all_grades.py# 全年级题库生成
│   ├── paper_generator.py    # 试卷生成
│   ├── static/              # 静态文件
│   ├── templates/           # HTML 模板
│   ├── data/
│   │   ├── questions/       # 题库（按科目分类）
│   │   ├── papers/          # 生成的试卷
│   │   └── wrong_questions/ # 错题记录
│   └── exam_system.db       # SQLite 数据库
├── frontend/               # React 前端
│   ├── src/
│   │   ├── components/     # React 组件
│   │   ├── pages/          # 页面
│   │   ├── App.js          # 主应用
│   │   └── index.js        # 入口文件
│   └── package.json
└── data/                   # 数据目录（与 backend/data 同步）
    ├── questions/
    ├── papers/
    └── wrong_questions/
```

## 安装说明

### 环境要求

- Python 3.8+
- Node.js 16+
- npm 或 yarn

### 第一步：安装后端依赖

```bash
cd exam_system/backend
pip install -r requirements.txt
```

后端依赖包含：
- Flask
- Flask-CORS

### 第二步：启动后端

```bash
cd exam_system/backend
python app.py
```

后端启动后会监听 **5001 端口**。

### 第三步：安装前端依赖

```bash
cd exam_system/frontend
npm install
```

### 第四步：启动前端

```bash
cd exam_system/frontend
npm start
```

前端启动后会监听 **3000 端口**。

访问地址：
- 考试系统前端：http://localhost:3000
- 后端 API：http://localhost:5001

## 开发说明

### 生成题库（可选）

题库默认已预生成。如需重新生成全年级题库：

```bash
cd backend
python generate_all_grades.py
```

### 数据库

- 数据库文件：`backend/exam_system.db`
- 包含数据：用户账号、答题记录、错题记录

### 端口说明

| 端口 | 服务 | 说明 |
|------|------|------|
| 3000 | React 前端 | 用户访问入口 |
| 5001 | Flask 后端 | API 服务 |

## 项目结构说明

### 后端 API（Flask）

- `GET /` - 返回前端页面
- `GET /api/questions/<subject>` - 获取题目列表
- `POST /api/exam/start` - 开始考试
- `POST /api/exam/submit` - 提交答卷
- `GET /api/wrong_questions/<username>` - 获取错题列表
- `POST /api/wrong_questions/practice` - 错题练习

### 前端页面（React）

- 登录/注册页
- 科目选择页
- 在线答题页
- 错题本页
- 成绩统计页

## License

MIT
