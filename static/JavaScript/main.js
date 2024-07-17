let mainCanvas;
let contextMenu;
let widgetManager;
let multiSelector;
document.addEventListener('DOMContentLoaded', () => {
    mainCanvas = new Canvas();
    contextMenu = new ContextMenu();
    widgetManager = new WidgetManager(mainCanvas);
    if (mainCanvas.canvasContainer) {
        multiSelector =  new MultiSelector(mainCanvas.canvasContainer);
    } else {
        console.error('Container not found');
    }
    widgetManager.fetchWidgets();
});