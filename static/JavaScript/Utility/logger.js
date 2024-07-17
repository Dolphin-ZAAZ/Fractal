debug = true;
log = {};
logTypes = ['info', 'warn', 'error', 'debug'];

function debugLog(message, type = 'info') {
    if (logTypes.includes(type)) {
        if (log[type]) {
            log[type].push(message);
        } else {
            log[type] = [message];
        }
    }
    if (debug) {
        console.log(message);
    }
}

function clearLog() {
    log = {};
}

function getLog(type = 'info') {
    return log[type];
}

function exportLog() {
    return JSON.stringify(log);
}