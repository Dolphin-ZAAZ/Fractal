const canvasContainer = document.getElementById('canvas-container');
const canvas = document.getElementById('canvas');
const addWidgetButton = document.getElementById('add-widget');
let isPanning = false;
let isHoldingWidget = false;
let startX, startY;
let scale = 1;

// Pan functionality
canvasContainer.addEventListener('mousedown', (e) => {
    if (e.button === 0 && !isHoldingWidget) { // Left-click
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

canvasContainer.addEventListener('wheel', (e) => {
    e.preventDefault();
    
    const canvasRect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - canvasRect.left;
    const mouseY = e.clientY - canvasRect.top;

    const zoomFactor = 0.1;
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

// Add widget functionality
addWidgetButton.addEventListener('click', () => {
    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'text-widget';
    widgetContainer.style.left = '50px';
    widgetContainer.style.top = '50px';
    widgetContainer.style.width = '50px';
    widgetContainer.style.height = '50px';

    const widgetText = document.createElement('div');
    widgetText.className = 'widget-text';
    widgetText.contentEditable = true;

    const resizeHandle = document.createElement('div');
    resizeHandle.className = 'resize-handle';

    widgetContainer.appendChild(widgetText);
    widgetContainer.appendChild(resizeHandle);
    canvas.appendChild(widgetContainer);

    makeDraggable(widgetContainer);
    makeResizable(widgetContainer, widgetText, resizeHandle);
});

// Make widgets draggable
function makeDraggable(widget) {
    widget.addEventListener('mousedown', (e) => {
        isHoldingWidget = true;
        const startX = e.clientX;
        const startY = e.clientY;
        const startLeft = parseInt(widget.style.left, 10);
        const startTop = parseInt(widget.style.top, 10);

        function onMouseMove(e) {
            const dx = (e.clientX - startX) / scale;
            const dy = (e.clientY - startY) / scale;
            widget.style.left = `${startLeft + dx}px`;
            widget.style.top = `${startTop + dy}px`;
        }

        document.addEventListener('mousemove', onMouseMove);

        document.addEventListener('mouseup', () => {
            isHoldingWidget = false;
            document.removeEventListener('mousemove', onMouseMove);
        }, { once: true });
    });
}

// Make widgets resizable
function makeResizable(widget, textBox, handle) {
    handle.addEventListener('mousedown', (e) => {
        e.stopPropagation(); // Prevent dragging while resizing
        let startX = e.clientX;
        let startY = e.clientY;
        let startWidth = parseInt(document.defaultView.getComputedStyle(widget).width, 10);
        let startHeight = parseInt(document.defaultView.getComputedStyle(widget).height, 10);

        function onMouseMove(e) {
            const dx = (e.clientX - startX) / scale;
            const dy = (e.clientY - startY) / scale;
            const newWidth = startWidth + dx;
            const newHeight = startHeight + dy;
            widget.style.width = `${newWidth}px`;
            widget.style.height = `${newHeight}px`;
            textBox.style.width = `calc(100%)`; // Adjust for container padding
            textBox.style.height = `calc(100%)`; // Adjust for container padding
        }

        document.addEventListener('mousemove', onMouseMove);

        document.addEventListener('mouseup', () => {
            document.removeEventListener('mousemove', onMouseMove);
        }, { once: true });
    });
}

// Persistent storage implementation
window.addEventListener('load', () => {
    const savedState = localStorage.getItem('canvasState');
    if (savedState) {
        canvas.innerHTML = savedState;
        document.querySelectorAll('.text-widget').forEach(widget => {
            const resizeHandle = widget.querySelector('.resize-handle');
            makeDraggable(widget);
            const textBox = widget.querySelector('.widget-text');
            makeResizable(widget, textBox, resizeHandle);
        });
    }
});

window.addEventListener('beforeunload', () => {
    localStorage.setItem('canvasState', canvas.innerHTML);
});

document.getElementById('clear-canvas').addEventListener('click', () => {
    localStorage.clear();
    // Optionally, you might want to also clear the canvas or reset the state
    canvas.innerHTML = ''; // Clear the canvas content if needed
});