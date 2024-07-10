function getCanvasStyle() {
    const canvasStyle = localStorage.getItem('canvasStyle');
    if (canvasStyle) {
        canvas.style.cssText = canvasStyle;
    }
}

function setCanvasStyle() {
    localStorage.setItem('canvasStyle', canvas.style.cssText);
}

function clearCanvas() {
    storedWidgets = [];
    storedWidgetStates = [];
    // Optionally, you might wants to also clear the canvas or reset the state
    canvas.innerHTML = ''; // Clear the canvas content if needed
    canvas.style.cssText = ''; // Reset the canvas style if needed
    localStorage.clear();
}