    let currentPage = 'home';
    let examStarted = false;
    let paper = null;
    let answers = {};
    let currentIndex = 0;
    let timeLeft = 3600;
    let timerInterval = null;
    
    // 显示页面
    function showPage(page) {
      currentPage = page;
      document.querySelectorAll('#app > div').forEach(d => d.classList.add('hidden'));
      document.getElementById(page + '-page').classList.remove('hidden');
      
      if (page === 'wrong') {
        renderWrongQuestions();
      }
    }
    
    // 开始考试
    async function startExam() {
      const grade = document.getElementById('grade').value;
      const subject = document.getElementById('subject').value;
      const semester = document.getElementById('semester').value;
      
      try {
        const res = await fetch('http://localhost:5000/api/papers/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ grade, subject, semester })
        });
        paper = await res.json();
        paper.grade = grade; // 记录年级
        
        answers = {};
        currentIndex = 0;
        timeLeft = 3600;
        examStarted = true;
        
        showPage('exam-page');
        renderQuestion();
        startTimer();
      } catch (e) {
        console.error('Error:', e); alert('后端服务未启动\n\n可能原因：
1. 后端服务未运行
2. 浏览器跨域问题
3. 网络连接问题

请检查浏览器控制台获取更多信息');
      }
    }
    
    // 渲染当前题目
    function renderQuestion() {
      if (!paper) return;
      
      const q = paper.questions[currentIndex];
      document.getElementById('exam-title').textContent = paper.grade + ' ' + paper.subject + ' - ' + paper.semester;
      document.getElementById('question-num').textContent = '第 ' + (currentIndex + 1) + ' / ' + paper.questions.length;
      document.getElementById('question-type').textContent = q.type === 'choice' ? '选择题' : '填空题';
      document.getElementById('question-text').textContent = q.question;
      
      const progress = ((currentIndex + 1) / paper.questions.length) * 100;
      document.getElementById('progress').style.width = progress + '%';
      
      const optionsContainer = document.getElementById('options-container');
      const fillAnswer = document.getElementById('fill-answer');
      
      if (q.type === 'choice' && q.options) {
        optionsContainer.innerHTML = q.options.map(opt => 
          '<div class="option' + (answers[q.qid] === opt[0] ? ' selected' : '') + '" onclick="selectOption(\'' + q.qid + '\', \'' + opt[0] + '\')">' + opt + '</div>'
        ).join('');
        optionsContainer.classList.remove('hidden');
        fillAnswer.classList.add('hidden');
      } else {
        optionsContainer.classList.add('hidden');
        fillAnswer.classList.remove('hidden');
        fillAnswer.value = answers[q.qid] || '';
        fillAnswer.oninput = function() {
          answers[q.qid] = this.value;
          renderDots();
        };
      }
      
      // 导航按钮
      document.getElementById('prev-btn').style.display = currentIndex > 0 ? '' : 'none';
      document.getElementById('next-btn').style.display = currentIndex < paper.questions.length - 1 ? '' : 'none';
      document.getElementById('submit-btn').style.display = currentIndex === paper.questions.length - 1 ? '' : 'none';
      
      renderDots();
    }
    
    // 选择选项
    function selectOption(qid, value) {
      answers[qid] = value;
      renderQuestion();
    }
    
    // 渲染题号点
    function renderDots() {
      if (!paper) return;
      const dots = paper.questions.map((q, i) => 
        '<div class="dot' + (answers[q.qid] ? ' answered' : '') + (i === currentIndex ? ' current' : '') + '" onclick="goToQuestion(' + i + ')">' + (i + 1) + '</div>'
      ).join('');
      document.getElementById('question-dots').innerHTML = dots;
    }
    
    // 上一题
    function prevQuestion() {
      if (currentIndex > 0) {
        currentIndex--;
        renderQuestion();
      }
    }
    
    // 下一题
    function nextQuestion() {
      if (currentIndex < paper.questions.length - 1) {
        currentIndex++;
        renderQuestion();
      }
    }
    
    // 跳转题目
    function goToQuestion(idx) {
      currentIndex = idx;
      renderQuestion();
    }
    
    // 计时器
    function startTimer() {
      clearInterval(timerInterval);
      timerInterval = setInterval(() => {
        timeLeft--;
        const mins = Math.floor(timeLeft / 60);
        const secs = timeLeft % 60;
        const display = mins.toString().padStart(2, '0') + ':' + secs.toString().padStart(2, '0');
        const timerEl = document.getElementById('timer');
        timerEl.textContent = display;
        timerEl.classList.toggle('warning', timeLeft < 300);
        
        if (timeLeft <= 0) {
          submitExam();
        }
      }, 1000);
    }
    
    // 提交试卷
    function submitExam() {
      clearInterval(timerInterval);
      
      let score = 0;
      let wrong = [];
      paper.questions.forEach(q => {
        if (answers[q.qid] === q.answer) {
          score += 2;
        } else {
          wrong.push({
            qid: q.qid,
            question: q.question,
            user_answer: answers[q.qid] || '未作答',
            correct_answer: q.answer,
            subject: paper.subject,
            wrong_count: 1
          });
        }
      });
      
      // 保存错题
      let stored = JSON.parse(localStorage.getItem('wrong_questions') || '[]');
      wrong.forEach(w => {
        const idx = stored.findIndex(s => s.qid === w.qid);
        if (idx >= 0) {
          stored[idx].wrong_count++;
        } else {
          stored.push(w);
        }
      });
      localStorage.setItem('wrong_questions', JSON.stringify(stored));
      
      // 显示结果
      document.getElementById('score-display').textContent = score + ' / 100';
      document.getElementById('correct-count').textContent = paper.questions.length - wrong.length;
      document.getElementById('wrong-count').textContent = wrong.length;
      
      showPage('result-page');
    }
    
    // 渲染错题本
    function renderWrongQuestions() {
      const stored = JSON.parse(localStorage.getItem('wrong_questions') || '[]');
      if (stored.length === 0) {
        document.getElementById('wrong-list').innerHTML = '<p style="color:#888">暂无错题记录</p>';
        return;
      }
      
      const html = '<table class="wrong-table"><tr><th>科目</th><th>题目</th><th>你的答案</th><th>正确答案</th><th>错误次数</th></tr>' + 
        stored.map(w => '<tr><td>' + w.subject + '</td><td>' + w.question + '</td><td class="wrong-answer">' + w.user_answer + '</td><td class="correct-answer">' + w.correct_answer + '</td><td>' + w.wrong_count + '次</td></tr>').join('') +
        '</table>';
      document.getElementById('wrong-list').innerHTML = html;
    }
    
    // 清空错题
    function clearWrongQuestions() {
      localStorage.removeItem('wrong_questions');
      renderWrongQuestions();
    }
