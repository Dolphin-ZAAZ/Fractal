const actionTypes = {
    add: undoAdd,
    delete: undoDelete,
    move: undoMove,
    resize: undoResize,
    zoom: undoZoom,
    pan: undoPan,
    clear: undoClear
}
let actionLog = [];
let currentAction = 0;

function getActionLog() {
    const actionLog = localStorage.getItem('actionLog');
    if (actionLog) {
        return JSON.parse(actionLog);
    }
    return [];
}

function addAction(action, target, changes) {
    actionLog.push({ action:action, target:target, changes: changes });
    currentAction = actionLog.length;
    saveActionLog(actionLog);
}

function saveActionLog(actionLog) {
    localStorage.setItem('actionLog', JSON.stringify(actionLog));
}

function undoAction() {
    const lastAction = actionLog.pop();
    saveActionLog(actionLog);
    return lastAction;
}

function redoAction() {
    const nextAction = actionLog.pop();
    saveActionLog(actionLog);
    return nextAction;
}

function undoAdd() {
    const lastAction = undoAction();
    if (lastAction) {
        lastAction.target.remove();
    }
}