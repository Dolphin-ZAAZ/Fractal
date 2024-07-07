const canvasContainer = document.getElementById('canvas-container');
const canvas = document.getElementById('canvas');
const addWidgetButton = document.getElementById('add-widget');
let isPanning = false;
let startX, startY;
let scale = 1;

// Pan functionality
canvasContainer.addEventListener('mousedown', (e) => {
    if (e.target.className === 'widget-container' || e.target.className === 'resize-handle' || e.target.className === 'drag-handle' || e.target.className === 'options-container' || e.target.className === 'delete-button' || e.target.className === 'widget-contents') {
        if (e.altKey == false) {
            return; // Exit the function if the text box is the target
        }
    }
    if (isClickInsideElementWithClass(e, 'CodeMirror')) {
        if (e.altKey == false) {
            return; // Exit the function if the CodeMirror editor is the target
        }
    }

    if (e.button === 0) { // Left-click
        isPanning = true;
        startX = e.clientX - canvas.offsetLeft;
        startY = e.clientY - canvas.offsetTop;
        canvasContainer.style.cursor = 'grabbing';
        canvas.style.pointerEvents = 'none'; // Disable pointer events on children
    }
});

canvasContainer.addEventListener('mousemove', (e) => {
    if (isPanning) {
        canvas.style.left = `${e.clientX - startX}px`;
        canvas.style.top = `${e.clientY - startY}px`;
    }
});

canvasContainer.addEventListener('mouseup', () => {
    isPanning = false;
    canvasContainer.style.cursor = 'grab';
    canvas.style.pointerEvents = 'auto'; // Re-enable pointer events on children
});

let initialMouseX = null;
let initialMouseY = null;
let initialRect = null;

document.getElementById('canvas-container').addEventListener('wheel', (e) => {
    e.preventDefault();

    if (initialMouseX === null && initialMouseY === null) {
        initialRect = canvas.getBoundingClientRect();
        initialMouseX = e.clientX - initialRect.left;
        initialMouseY = e.clientY - initialRect.top;
    }

    const zoomFactor = 0.03;
    let newScale = scale + (e.deltaY > 0 ? -zoomFactor : zoomFactor);
    newScale = Math.max(0.1, newScale);

    const zoomRatio = newScale / scale;

    // Adjust the canvas dimensions
    const newWidth = initialRect.width * zoomRatio;
    const newHeight = initialRect.height * zoomRatio;

    // Calculate the new position to keep the zoom centered on the initial mouse position
    const offsetX = initialMouseX * (1 - zoomRatio);
    const offsetY = initialMouseY * (1 - zoomRatio);

    canvas.style.width = `${newWidth}px`;
    canvas.style.height = `${newHeight}px`;
    canvas.style.left = `${canvas.offsetLeft + offsetX}px`;
    canvas.style.top = `${canvas.offsetTop + offsetY}px`;

    scale = newScale;
    updateAllWidgetsScale(newScale, initialMouseX, initialMouseY, zoomRatio);

    // Reset initial mouse positions after zooming
    initialMouseX = null;
    initialMouseY = null;
});
// Update the scale for all widgets
function updateAllWidgetsScale(newScale, mouseX, mouseY, zoomRatio) {
    storedWidgets.forEach(widget => {
        widget.updateScale(newScale, mouseX, mouseY, zoomRatio);
    });
}