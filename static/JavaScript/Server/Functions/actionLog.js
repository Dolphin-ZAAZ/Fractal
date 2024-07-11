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

function undoDelete() {
    const lastAction = undoAction();
    if (lastAction) {
        lastAction.target.restore();
    }
}

function undoMove() {
    const lastAction = undoAction();
    if (lastAction) {
        lastAction.target.move(lastAction.changes.x, lastAction.changes.y);
    }
}

function undoResize() {
    const lastAction = undoAction();
    if (lastAction) {
        lastAction.target.resize(lastAction.changes.width, lastAction.changes.height);
    }
}

function undoZoom() {
    const lastAction = undoAction();
    if (lastAction) {
        lastAction.target.zoom(lastAction.changes.scale, lastAction.changes.zoomRatio);
    }
}

function undoPan() {
    const lastAction = undoAction();
    if (lastAction) {
        lastAction.target.pan(lastAction.changes.x, lastAction.changes.y);
    }
}

function undoClear() {
    const lastAction = undoAction();
    if (lastAction) {
        lastAction.target.clear();
    }
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