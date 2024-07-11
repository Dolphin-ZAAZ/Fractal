class Canvas {
    constructor() {
        this.canvasContainer = document.getElementById('canvas-container');
        this.canvas = document.getElementById('canvas');
        this.addWidgetButton = document.getElementById('add-widget');
        this.infoPanel = document.getElementById('info-panel');
        this.initialMouseX = null;
        this.initialMouseY = null;
        this.initialRect = null;
        this.isPanning = false;
        this.startX, this.startY;
        this.scale = 1;
        this.addEvents();
    }

    addEvents() {
        this.canvasContainer.addEventListener('mousedown', (e) => {
            this.startPan(e);
        });

        this.canvasContainer.addEventListener('mousemove', (e) => {
            this.executePan(e);
        });

        document.addEventListener('keydown', (e) => {
            this.recentreCanvas(e);
        });

        this.canvasContainer.addEventListener('wheel', (e) => {
            if (isClickInsideElementWithClass(e, 'widget-container')) {
                if (e.altKey == false) {
                    return; // Exit the function if the CodeMirror editor is the target
                }
            }
            e.preventDefault();
            this.zoomCanvas(e);
        });
        this.canvasContainer.addEventListener('mouseup', () => {
            this.endPan(); // Re-enable pointer events on children
        });
    }

    startPan(e) {
        if (isClickInsideElementWithClass(e, 'widget-container')) {
            if (e.altKey == false) {
                return; // Exit the function if the chat message box is the target
            }
        }
        if (e.button === 0) { // Left-click
            this.isPanning = true;
            this.startX = e.clientX - this.canvas.offsetLeft;
            this.startY = e.clientY - this.canvas.offsetTop;
            this.canvasContainer.style.cursor = 'grabbing';
            this.canvas.style.pointerEvents = 'none'; // Disable pointer events on children
        }
    }

    recentreCanvas(e) {
        if (isClickInsideElementWithClass(e, 'widget-container')) {
            if (e.altKey == false) {
                return; // Exit the function if the chat message box is the target
            }
        }
        if (e.key === 'f') {
            this.canvas.style.left = '0';
            this.canvas.style.top = '0';
        }
    }

    endPan() {
        this.isPanning = false;
        this.canvasContainer.style.cursor = 'grab';
        this.canvas.style.pointerEvents = 'auto';
    }

    executePan(e) {
        if (this.isPanning) {
            this.canvas.style.left = `${e.clientX - this.startX}px`;
            this.canvas.style.top = `${e.clientY - this.startY}px`;
        }
    }

    zoomCanvas(e) {
        if (this.initialMouseX === null && this.initialMouseY === null) {
            this.initialRect = this.canvas.getBoundingClientRect();
            this.initialMouseX = e.clientX - this.initialRect.left;
            this.initialMouseY = e.clientY - this.initialRect.top;
        }

        const zoomFactor = 0.01;
        let newScale = this.scale + (e.deltaY > 0 ? -zoomFactor : zoomFactor);
        newScale = Math.max(0.05, newScale);

        const zoomRatio = newScale / this.scale;

        // Adjust the canvas dimensions
        const newWidth = this.initialRect.width * zoomRatio;
        const newHeight = this.initialRect.height * zoomRatio;

        // Calculate the new position to keep the zoom centered on the initial mouse position
        const offsetX = this.initialMouseX * (1 - zoomRatio);
        const offsetY = this.initialMouseY * (1 - zoomRatio);

        this.canvas.style.width = `${newWidth}px`;
        this.canvas.style.height = `${newHeight}px`;
        this.canvas.style.left = `${this.canvas.offsetLeft + offsetX}px`;
        this.canvas.style.top = `${this.canvas.offsetTop + offsetY}px`;

        this.scale = newScale;
        this.infoPanel.innerHTML = `Scale: ${Math.round(this.scale * 100)}%`;
        storedWidgets.forEach(widget => {
            widget.updateScale(newScale, this.initialMouseX, this.initialMouseY, zoomRatio);
        });

        // Reset initial mouse positions after zooming
        this.initialMouseX = null;
        this.initialMouseY = null;
        logAction(actionTypes.zoom, this, { scale: this.scale, zoomRatio: zoomRatio });
    }
}
