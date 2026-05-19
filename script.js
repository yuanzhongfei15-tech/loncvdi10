let currentDate = new Date();
let selectedDate = new Date();
let todos = JSON.parse(localStorage.getItem('todos')) || [];

const calendarGrid = document.getElementById('calendarGrid');
const currentMonthEl = document.getElementById('currentMonth');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');
const todoList = document.getElementById('todoList');
const selectedDateEl = document.getElementById('selectedDate');
const addTodoBtn = document.getElementById('addTodoBtn');
const todoModal = document.getElementById('todoModal');
const cancelBtn = document.getElementById('cancelBtn');
const saveBtn = document.getElementById('saveBtn');
const todoTitle = document.getElementById('todoTitle');
const todoDesc = document.getElementById('todoDesc');
const todoTime = document.getElementById('todoTime');

function init() {
    renderCalendar();
    renderTodos();
    setupEventListeners();
}

function setupEventListeners() {
    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    addTodoBtn.addEventListener('click', () => {
        todoModal.classList.add('active');
        todoTitle.focus();
    });

    cancelBtn.addEventListener('click', () => {
        closeModal();
    });

    saveBtn.addEventListener('click', saveTodo);

    todoModal.addEventListener('click', (e) => {
        if (e.target === todoModal) {
            closeModal();
        }
    });
}

function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    currentMonthEl.textContent = `${year}年${month + 1}月`;
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    calendarGrid.innerHTML = '';
    
    for (let i = 0; i < firstDay; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.classList.add('calendar-day', 'empty');
        calendarGrid.appendChild(emptyDay);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
        const dayEl = document.createElement('div');
        dayEl.classList.add('calendar-day');
        
        const dateToCheck = new Date(year, month, day);
        const isToday = isSameDay(dateToCheck, new Date());
        const isSelected = isSameDay(dateToCheck, selectedDate);
        
        if (isToday) {
            dayEl.classList.add('today');
        }
        if (isSelected) {
            dayEl.classList.add('selected');
        }
        
        const dayNumber = document.createElement('span');
        dayNumber.classList.add('day-number');
        dayNumber.textContent = day;
        dayEl.appendChild(dayNumber);
        
        const dateKey = formatDateKey(dateToCheck);
        const hasTodo = todos.some(todo => todo.date === dateKey);
        if (hasTodo) {
            const indicator = document.createElement('div');
            indicator.classList.add('has-todo');
            dayEl.appendChild(indicator);
        }
        
        dayEl.addEventListener('click', () => {
            selectedDate = new Date(year, month, day);
            renderCalendar();
            renderTodos();
        });
        
        calendarGrid.appendChild(dayEl);
    }
}

function renderTodos() {
    const dateKey = formatDateKey(selectedDate);
    const dateTodos = todos.filter(todo => todo.date === dateKey);
    
    selectedDateEl.textContent = formatDateDisplay(selectedDate);
    
    if (dateTodos.length === 0) {
        todoList.innerHTML = `
            <div class="empty-state">
                <p>暂无日程，享受美好时光~</p>
            </div>
        `;
        return;
    }
    
    dateTodos.sort((a, b) => {
        if (!a.time) return 1;
        if (!b.time) return -1;
        return a.time.localeCompare(b.time);
    });
    
    todoList.innerHTML = '';
    dateTodos.forEach(todo => {
        const todoEl = document.createElement('div');
        todoEl.classList.add('todo-item');
        if (todo.completed) {
            todoEl.classList.add('completed');
        }
        
        todoEl.innerHTML = `
            <div class="todo-checkbox ${todo.completed ? 'checked' : ''}" data-id="${todo.id}">
                ${todo.completed ? '✓' : ''}
            </div>
            <div class="todo-content">
                <div class="todo-title">${escapeHtml(todo.title)}</div>
                ${todo.desc ? `<div class="todo-desc">${escapeHtml(todo.desc)}</div>` : ''}
                ${todo.time ? `<div class="todo-time">⏰ ${todo.time}</div>` : ''}
            </div>
            <button class="todo-delete" data-id="${todo.id}">×</button>
        `;
        
        todoList.appendChild(todoEl);
    });
    
    document.querySelectorAll('.todo-checkbox').forEach(checkbox => {
        checkbox.addEventListener('click', () => {
            const id = checkbox.dataset.id;
            toggleTodoComplete(id);
        });
    });
    
    document.querySelectorAll('.todo-delete').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.id;
            deleteTodo(id);
        });
    });
}

function saveTodo() {
    const title = todoTitle.value.trim();
    if (!title) {
        alert('请输入日程标题');
        return;
    }
    
    const newTodo = {
        id: Date.now().toString(),
        date: formatDateKey(selectedDate),
        title: title,
        desc: todoDesc.value.trim(),
        time: todoTime.value,
        completed: false
    };
    
    todos.push(newTodo);
    saveTodos();
    renderCalendar();
    renderTodos();
    closeModal();
}

function toggleTodoComplete(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        saveTodos();
        renderTodos();
    }
}

function deleteTodo(id) {
    if (confirm('确定要删除这条日程吗？')) {
        todos = todos.filter(t => t.id !== id);
        saveTodos();
        renderCalendar();
        renderTodos();
    }
}

function closeModal() {
    todoModal.classList.remove('active');
    todoTitle.value = '';
    todoDesc.value = '';
    todoTime.value = '';
}

function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

function formatDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function formatDateDisplay(date) {
    const today = new Date();
    if (isSameDay(date, today)) {
        return '今日待办';
    }
    
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const weekday = weekdays[date.getDay()];
    
    return `${month}月${day}日 ${weekday}`;
}

function isSameDay(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

init();
