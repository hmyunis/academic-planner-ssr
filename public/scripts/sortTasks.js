const container = document.getElementById('list-of-tasks');
const filterButtonsContainer = document.getElementById('filter-types-container');
const allTasks = document.querySelectorAll('[data-task-type]');

function filter(type) {
    type = type.toLowerCase().trim();
    container.innerHTML = '';
    allTasks.forEach((div) => container.appendChild(div));
    if (type === 'all') {
        return;
    }
    const tasks = container.querySelectorAll(`div[data-task-type="${type}"]`);
    container.innerHTML = '<p></p>';
    tasks.forEach((div) => container.appendChild(div));
}

filterButtonsContainer.addEventListener('click', (event) => {
    if (event.target === filterButtonsContainer) return;
    const clickedType = event.target.innerHTML.trim().toLowerCase();
    clearSelectedStyles();
    if (event.target.classList.contains('bg-indigo-400')) {
        event.target.classList.remove('bg-indigo-400');
        event.target.classList.add('bg-[#1EFE80]');
    } else {
        event.target.classList.remove('bg-[#1EFE80]');
        event.target.classList.add('bg-indigo-400');
    }
});

function clearSelectedStyles() {
    const childNodes = filterButtonsContainer.childNodes;
    const elementNodes = Array.from(childNodes).filter((node) => node.nodeType === 1);
    elementNodes.forEach((button) => {
        button.classList.remove('bg-[#1EFE80]');
        button.classList.add('bg-indigo-400');
    });
}

function refreshPage() {
    if (container.childElementCount <= 0) {
        filterButtonsContainer.parentElement.classList.add('hidden');
        document.getElementById('task-empty-board').classList.remove('hidden');
    } else {
        filterButtonsContainer.parentElement.classList.remove('hidden');
        document.getElementById('task-empty-board').classList.add('hidden');
    }
}

setInterval(() => {
    refreshPage();
}, 100);
