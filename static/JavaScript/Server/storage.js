let storedWidgets = [];
let storedStates = [];
let widgetTypes = {};
const actionTypes = ['add', 'delete', 'move', 'resize', 'edit', 'options'];
let actionLog = [];

document.addEventListener('DOMContentLoaded', () => {
    widgetTypes = {
        'BaseWidget': BaseWidget,
        'CodeWidget': CodeWidget,
        'ChatWidget': ChatWidget,
    };

    window.addEventListener('load', async () => {
        await loadData();
    });

    window.addEventListener('beforeunload', async () => {   
        // Save the canvas style to local storage
        await saveData();
    });

});

function deleteWidget(widget) {
    if (document.body.contains(widget.widgetContainer)) {
        actionLog.push({ action: 'delete', widget: storedWidgets[storedWidgets.length - 1].widgetState });
        for (let i = 0; i < storedWidgets.length; i++) {
            if (storedWidgets[i] === widget) {
                storedWidgets.splice(i, 1);
                storedStates.splice(i, 1);
            }
        }
        widget.widgetContainer.remove();
        // Immediately Invoked Function Expression (IIFE) with async
        (async () => {
            try {
                await saveData();
                console.log('Data saved successfully.');
            } catch (error) {
                console.error('Failed to save data:', error);
            }
        })();
    }
}

async function loadData() {
    try {
        localStorage.clear();
        await getLocalStorage(); // Assuming this is an async function
        await getCanvasStyle(); // Modify this function to be async if necessary
        await getWidgets(); // Modify this function to be async if necessary
        actionLog = await getActionLog(); // Modify this function to be async if necessary
    } catch (error) {
        console.error("Failed to load data:", error);
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

async function setLocalStorage() {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        data[key] = localStorage.getItem(key);
    }

    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    await navigator.sendBeacon('/data/set-local-storage', blob);
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

function getCanvasStyle() {
    const canvasStyle = localStorage.getItem('canvasStyle');
    if (canvasStyle) {
        canvas.style.cssText = canvasStyle;
    }
}

function setCanvasStyle() {
    localStorage.setItem('canvasStyle', canvas.style.cssText);
}

function getWidgets() {
    const widgets = localStorage.getItem('widgets');
    if (widgets) {
        storedWidgets = [];
        storedStates = JSON.parse(widgets);
        storedStates.forEach(widget => {
            const newWidget = new widgetTypes[widget.widgetType](widget.x, widget.y, widget.widgetType, widget.width, widget.height, widget.content, false, widget.id);
            storedWidgets.push(newWidget);
        });
    }
}

function setWidgets() {
    if (storedWidgets.length === 0) {
        localStorage.setItem('widgets', JSON.stringify([]));
    }
    for (let i = 0; i < storedWidgets.length; i++) {
        storedStates[i] = storedWidgets[i].widgetState;
    }
    localStorage.setItem('widgets', JSON.stringify(storedStates));
}

async function saveData() {
    setCanvasStyle();
    setWidgets();
    saveActionLog(actionLog);
    await setLocalStorage();
}

function clearCanvas() {
    storedWidgets = [];
    storedStates = [];
    // Optionally, you might wants to also clear the canvas or reset the state
    canvas.innerHTML = ''; // Clear the canvas content if needed
    canvas.style.cssText = ''; // Reset the canvas style if needed
    localStorage.clear();
}