let storedWidgets = [];
let storedWidgetStates = [];

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

function deleteWidget(widget) {
    if (document.body.contains(widget.widgetContainer)) {
        actionLog.push({ action: 'delete', widget: storedWidgets[storedWidgets.length - 1].widgetState });
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