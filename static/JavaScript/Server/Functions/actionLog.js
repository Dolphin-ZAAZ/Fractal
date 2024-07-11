let actionLog = [];
let currentAction = 0;
const actionTypes = {
    add: undoAdd,
    delete: undoDelete,
    move: undoMove,
    resize: undoResize,
    zoom: undoZoom,
    pan: undoPan,
    edit: undoEdit,
    clear: undoClear
}

document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'z') {
        undoAction();
    } else if (e.ctrlKey && e.key === 'y') {
        redoAction();
    }
});

function logAction(action, target, changes) {
    actionLog.push({ action:action, target:target, changes: changes });
    currentAction = actionLog.length;
    saveActionLog(actionLog);
}

function getActionLog() {
    const actionLog = localStorage.getItem('actionLog');
    if (actionLog) {
        return JSON.parse(actionLog);
    }
    return [];
}

function undoAction() {
    const lastAction = actionLog.pop();
    lastAction.changes(lastAction.target);
    saveActionLog(actionLog);
    return lastAction;
}

function redoAction() {
    const nextAction = actionLog.pop();
    nextAction.changes(nextAction.target);
    saveActionLog(actionLog);
    return nextAction;
}

function saveActionLog(actionLog) {
    localStorage.setItem('actionLog', JSON.stringify(actionLog));
}

function redo() {
    const nextAction = redoAction();
    if (nextAction) {
        actionTypes[nextAction.action]();
    }
}

function clearLog() {
    actionLog = [];
    saveActionLog(actionLog);
}