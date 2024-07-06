const canvasContainer = document.getElementById('canvas-container');
const canvas = document.getElementById('canvas');
const addWidgetButton = document.getElementById('add-widget');
let isPanning = false;
let startX, startY;
let scale = 1;

// Pan functionality
canvasContainer.addEventListener('mousedown', (e) => {
    if (e.target.className === 'widget-text' || e.target.className === 'resize-handle' || e.target.className === 'drag-handle' || e.target.className === 'text-widget' || e.target.className === 'delete-button') {
        return; // Exit the function if the text box is the target
    }
    if (isClickInsideElementWithClass(e, 'CodeMirror')) {
        return; // Exit the function if the CodeMirror editor is the target
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

// Add zoom functionality
canvasContainer.addEventListener('wheel', (e) => {
    e.preventDefault();
    
    const canvasRect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - canvasRect.left;
    const mouseY = e.clientY - canvasRect.top;

    const zoomFactor = 0.03;
    let newScale = scale + (e.deltaY > 0 ? -zoomFactor : zoomFactor);
    newScale = Math.max(0.1, newScale);

    const zoomRatio = newScale / scale;

    // Calculate the new position to keep the zoom centered on the mouse
    const offsetX = mouseX - mouseX * zoomRatio;
    const offsetY = mouseY - mouseY * zoomRatio;

    canvas.style.transformOrigin = '0 0'; // Set transform origin to top-left corner
    canvas.style.transform = `scale(${newScale})`;

    // Adjust the canvas position to zoom towards the mouse
    canvas.style.left = `${canvas.offsetLeft + offsetX}px`;
    canvas.style.top = `${canvas.offsetTop + offsetY}px`;

    scale = newScale;
});