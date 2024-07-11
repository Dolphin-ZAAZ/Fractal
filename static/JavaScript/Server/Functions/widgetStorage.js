let storedWidgets = [];
let storedWidgetStates = [];
let widgetTypes = {};

function getWidgets() {
    const widgets = localStorage.getItem('widgets');
    if (widgets) {
        storedWidgets = [];
        storedWidgetStates = JSON.parse(widgets);
        storedWidgetStates.forEach(widget => {
            const newWidget = new widgetTypes[widget.widgetType]["type"](widget.x, widget.y, widget.widgetType, widget.width, widget.height, widget.padding, widget.content, false, widget.id);
            storedWidgets.push(newWidget);
        });
    }
}

function setWidgets() {
    if (storedWidgets.length === 0) {
        localStorage.setItem('widgets', JSON.stringify([]));
    }
    for (let i = 0; i < storedWidgets.length; i++) {
        storedWidgetStates[i] = storedWidgets[i].widgetState;
    }
    localStorage.setItem('widgets', JSON.stringify(storedWidgetStates));
}

async function addWidget(x, y, widgetType) {
    const widget = new widgetTypes[widgetType]["type"](x, y, widgetType.type, 400, 300, 80, "", true, actionLog.length);
    logAction(actionTypes.add, widget, deleteWidget);
    await saveData();
}

function deleteWidget(widget) {
    if (document.body.contains(widget.widgetContainer)) {
        logAction(actionTypes.delete, widget, addWidget);
        for (let i = 0; i < storedWidgets.length; i++) {
            if (storedWidgets[i] === widget) {
                storedWidgets.splice(i, 1);
                storedWidgetStates.splice(i, 1);
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

document.addEventListener('DOMContentLoaded', () => {
    widgetTypes = {
        'BaseWidget': { 
            "type" : BaseWidget, 
            minSize : 110,
        },
        'CodeWidget': {
            "type" : CodeWidget, 
            minSize : 110,
        },
        'ChatWidget': {
            "type" : ChatWidget, 
            minSize : 110,
        },
    }
});
