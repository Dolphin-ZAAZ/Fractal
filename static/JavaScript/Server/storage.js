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
        try {
            // Load the canvas style from local storage
            localStorage.clear();
            await getLocalStorage(); // Assuming this is an async function
            await getCanvasStyle(); // Modify this function to be async if necessary
            await getWidgets(); // Modify this function to be async if necessary
            actionLog = await getActionLog(); // Modify this function to be async if necessary
        } catch (error) {
            console.error("Failed to load data:", error);
        }
    });

    window.addEventListener('beforeunload', async () => {   
        // Save the canvas style to local storage
        await setCanvasStyle();
        await setWidgets();
        await saveActionLog(actionLog);
        await setLocalStorage();
    });

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

    function loadCanvas() {
        getCanvasStyle();
        getWidgets();
        actionLog = getActionLog();
    }
    
    function saveCanvas() {
        setCanvasStyle();
        setWidgets();
        saveActionLog(actionLog);
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
        for (let i = 0; i < storedWidgets.length; i++) {
            storedStates[i] = storedWidgets[i].widgetState;
        }
        localStorage.setItem('widgets', JSON.stringify(storedStates));
    }
});

function clearCanvas() {
    storedWidgets = [];
    storedStates = [];
    // Optionally, you might wants to also clear the canvas or reset the state
    canvas.innerHTML = ''; // Clear the canvas content if needed
    canvas.style.cssText = ''; // Reset the canvas style if needed
    localStorage.clear();
}