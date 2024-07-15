let mainCanvas;
let contextMenu;
let widgetManager;
document.addEventListener('DOMContentLoaded', () => {
    mainCanvas = new Canvas();
    contextMenu = new ContextMenu();
    widgetManager = new WidgetManager(mainCanvas);
    (async () => {
        await widgetManager.fetchWidgets();
    })();
});