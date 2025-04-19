document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const taskForm = document.getElementById('taskForm');
    const taskInput = document.getElementById('taskInput');
    const taskList = document.getElementById('taskList');
    const taskCount = document.getElementById('taskCount');
    const emptyState = document.getElementById('emptyState');
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    // State
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let currentFilter = 'all';

    // Initialize
    renderTasks();
    updateTaskCount();

    // Event Listeners
    taskForm.addEventListener('submit', addTask);
    taskList.addEventListener('click', handleTaskActions);
    taskList.addEventListener('dblclick', enableTaskEdit);
    filterButtons.forEach(btn => btn.addEventListener('click', filterTasks));

    // Functions
    function addTask(e) {
        e.preventDefault();
        const taskText = taskInput.value.trim();
        
        if (taskText === '') {
            showInputError();
            return;
        }

        const newTask = {
            id: Date.now(),
            text: taskText,
            completed: false,
            createdAt: new Date().toISOString()
        };

        tasks.push(newTask);
        saveTasks();
        renderTasks();
        updateTaskCount();
        
        taskInput.value = '';
        taskInput.focus();
    }

    function renderTasks() {
        // Clear the task list
        taskList.innerHTML = '';
        
        // Filter tasks based on current filter
        let filteredTasks = tasks;
        if (currentFilter === 'active') {
            filteredTasks = tasks.filter(task => !task.completed);
        } else if (currentFilter === 'completed') {
            filteredTasks = tasks.filter(task => task.completed);
        }

        if (filteredTasks.length === 0) {
            emptyState.style.display = 'block';
            return;
        }
        
        emptyState.style.display = 'none';

        // Create document fragment for better performance
        const fragment = document.createDocumentFragment();

        filteredTasks.forEach(task => {
            const taskElement = createTaskElement(task);
            fragment.appendChild(taskElement);
        });

        taskList.appendChild(fragment);
    }

    function createTaskElement(task) {
        const li = document.createElement('li');
        li.className = 'py-3 px-2 hover:bg-gray-50 transition rounded-lg';
        li.dataset.id = task.id;

        li.innerHTML = `
            <div class="flex items-center justify-between">
                <div class="flex items-center flex-1">
                    <input type="checkbox" ${task.completed ? 'checked' : ''} 
                        class="task-checkbox w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 mr-3">
                    <span class="task-text ${task.completed ? 'line-through text-gray-400' : 'text-gray-800'} flex-1">
                        ${task.text}
                    </span>
                    <input type="text" class="task-edit hidden border border-indigo-300 rounded px-2 py-1 flex-1">
                </div>
                <div class="flex space-x-2 ml-3">
                    <button class="edit-btn text-gray-400 hover:text-indigo-600 transition">
                        <i class="fas fa-pencil-alt"></i>
                    </button>
                    <button class="delete-btn text-gray-400 hover:text-red-600 transition">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </div>
            <div class="text-xs text-gray-400 mt-1">
                Added: ${new Date(task.createdAt).toLocaleString()}
            </div>
        `;

        return li;
    }

    function handleTaskActions(e) {
        const target = e.target;
        const taskItem = target.closest('li');
        if (!taskItem) return;

        const taskId = parseInt(taskItem.dataset.id);
        const taskIndex = tasks.findIndex(task => task.id === taskId);

        // Delete button
        if (target.closest('.delete-btn')) {
            tasks.splice(taskIndex, 1);
            saveTasks();
            renderTasks();
            updateTaskCount();
        }
        // Edit button
        else if (target.closest('.edit-btn')) {
            enableTaskEdit(target.closest('li'));
        }
        // Checkbox
        else if (target.classList.contains('task-checkbox')) {
            tasks[taskIndex].completed = target.checked;
            saveTasks();
            renderTasks();
            updateTaskCount();
        }
    }

    function enableTaskEdit(taskItem) {
        const taskId = parseInt(taskItem.dataset.id);
        const taskIndex = tasks.findIndex(task => task.id === taskId);
        const taskTextElement = taskItem.querySelector('.task-text');
        const taskEditInput = taskItem.querySelector('.task-edit');

        // Set up edit mode
        taskTextElement.classList.add('hidden');
        taskEditInput.classList.remove('hidden');
        taskEditInput.value = tasks[taskIndex].text;
        taskEditInput.focus();

        // Handle edit completion
        function finishEdit() {
            const newText = taskEditInput.value.trim();
            
            if (newText) {
                tasks[taskIndex].text = newText;
                saveTasks();
                renderTasks();
            } else {
                // If empty, revert to original text
                taskTextElement.classList.remove('hidden');
                taskEditInput.classList.add('hidden');
            }
        }

        // Event listeners for edit completion
        taskEditInput.addEventListener('blur', finishEdit);
        taskEditInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                finishEdit();
            }
        });
    }

    function filterTasks(e) {
        currentFilter = e.target.dataset.filter;
        
        // Update active button styling
        filterButtons.forEach(btn => {
            btn.classList.remove('active', 'bg-indigo-600', 'text-white');
            btn.classList.add('bg-gray-200', 'text-gray-700');
        });
        
        e.target.classList.add('active', 'bg-indigo-600', 'text-white');
        e.target.classList.remove('bg-gray-200', 'text-gray-700');
        
        renderTasks();
    }

    function updateTaskCount() {
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(task => task.completed).length;
        
        taskCount.textContent = `${completedTasks} of ${totalTasks} tasks`;
        
        // Update color based on completion
        if (completedTasks === totalTasks && totalTasks > 0) {
            taskCount.className = 'bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded';
        } else {
            taskCount.className = 'bg-indigo-100 text-indigo-800 text-sm font-medium px-2.5 py-0.5 rounded';
        }
    }

    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function showInputError() {
        taskInput.classList.add('border-red-500', 'ring-2', 'ring-red-200');
        setTimeout(() => {
            taskInput.classList.remove('border-red-500', 'ring-2', 'ring-red-200');
        }, 2000);
    }
});