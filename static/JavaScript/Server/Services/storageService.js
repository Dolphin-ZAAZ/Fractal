let actionLog;
let currentAction;
let initialState = {};

document.addEventListener('DOMContentLoaded', () => {
    window.addEventListener('load', async () => {
        await loadData();
    });

    window.addEventListener('beforeunload', async () => {   
        setInitialState();
        await saveData();
    });

});

document.addEventListener('keydown', (e) => {
    e.preventDefault();
    if (e.ctrlKey && e.key === 'z') {
        undoState();
    } else if (e.ctrlKey && e.key === 'y') {
        redoState();
    }
});

async function loadData() {
    try {
        clearCanvas();
        await getLocalStorage(); // Assuming this is an async function
        getCanvasStyle(); // Modify this function to be async if necessary
        getWidgets(); // Modify this function to be async if necessary
        localStorage.setItem('actionLog', JSON.stringify({}));
    } catch (error) {
        console.error("Failed to load data:", error);
    }
}

function setInitialState() {
    initialState = {};
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        initialState[key] = localStorage.getItem(key);
    }
}

async function saveData() {
    setCanvasStyle();
    setWidgets();
    setLocalStorage();
    let currentState = {};
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        currentState[key] = localStorage.getItem(key);
    }
    if (initialState !== currentState)
    {
        actionLog.push({id : actionLog.length, initialState, currentState});
    }
    currentState = actionLog.length - 1;
}

function undoState() {
    if (currentAction > 0) {
        currentAction--;
        const action = actionLog[currentAction];
        for (const key in action.initialState) {
            localStorage.setItem(key, action.initialState[key]);
        }
        loadData();
    }
}

function redoState() {
    if (currentAction < actionLog.length - 1) {
        currentAction++;
        const action = actionLog[currentAction];
        for (const key in action.currentState) {
            localStorage.setItem(key, action.currentState[key]);
        }
        loadData();
    }
}

async function getLocalStorage() {
    await fetch('/data/get-local-storage')
    .then(response => response.json())
    .then(data => {
        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                localStorage.setItem(key, data[key]);
                }
            }
        })
        .catch(error => console.error('Error:', error));
    }
    
function setLocalStorage() {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        data[key] = localStorage.getItem(key);
    }

    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    navigator.sendBeacon('/data/set-local-storage', blob);
}

function getActionLog() {
    const actionLog = localStorage.getItem('actionLog');
    if (actionLog) {
        return JSON.parse(actionLog);
    }
    return [];
}

function saveActionLog(actionLog) {
    localStorage.setItem('actionLog', JSON.stringify(actionLog));
}

