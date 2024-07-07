let storedWidgets = [];
let storedStates = [];
let widgetTypes = {};

document.addEventListener('DOMContentLoaded', () => {
    widgetTypes = {
        'BaseWidget': BaseWidget,
        'CodeWidget': CodeWidget
    };

    // Persistent storage implementation
    window.addEventListener('load', () => {
        // Load the canvas style from local storage
        loadCanvas(getCanvasStyle, getWidgets);
    });

    window.addEventListener('beforeunload', () => {   
        // Save the canvas style to local storage
        saveCanvas(setCanvasStyle, setWidgets);
    });

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
            storedStates = JSON.parse(widgets);
            storedStates.forEach(widget => {
                const newWidget = new widgetTypes[widget.widgetType](widget.x, widget.y, widget.widgetType, widget.width, widget.height, widget.content, false);
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
    function saveCanvas(setCanvasStyle, setWidgets) {
        setCanvasStyle();
        setWidgets();
        storedWidgets = [];
        storedStates = [];
    }
    
    function loadCanvas(getCanvasStyle, getWidgets) {
        storedWidgets = [];
        storedStates = [];
        getCanvasStyle();
        getWidgets();
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