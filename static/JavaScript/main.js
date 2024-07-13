let mainCanvas;
let contextMenu;
let widgetManager;
document.addEventListener('DOMContentLoaded', () => {
    mainCanvas = new Canvas();
    contextMenu = new ContextMenu();
    widgetManager = new WidgetManager();
    (async () => {
        await widgetManager.fetchWidgets();
    })();
});