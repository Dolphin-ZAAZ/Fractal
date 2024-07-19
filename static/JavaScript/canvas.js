class Canvas {
    constructor() {
        this.canvasContainer = document.getElementById('canvas-container');
        this.canvas = document.getElementById('canvas');
        this.currentState = [];
        this.addWidgetButton = document.getElementById('add-widget');
        this.infoPanel = document.getElementById('info-panel');
        this.initialMouseX = null;
        this.initialMouseY = null;
        this.initialRect = null;
        this.isPanning = false;
        this.startX = 0;
        this.startY = 0;
        this.scale = 1;
        this.addEvents();
    }

    getScale() {
        return this.scale;
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
        if (e.ctrlKey == true) {
            return; // Exit the function if the chat message box is the target
        }
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
        if (e.altKey == false) {
            return; // Exit the function if the chat message box is the target
        }
        if (e.key === 'f') {
            e.preventDefault();
            this.canvas.style.left = '0';
            this.canvas.style.top = '0';
        }
    }

    getCanvasStyle () {
        const left = this.canvas.style.left;
        const top = this.canvas.style.top;
        return {left, top};
    }

    getCanvasStyleCSS() {
        return this.canvas.style.cssText;
    }

    setCanvasStyle(style) {
        this.canvas.style.left = style.left;
        this.canvas.style.top = style.top;
    }

    endPan() {
        this.isPanning = false;
        this.canvasContainer.style.cursor = 'grab';
        this.canvas.style.pointerEvents = 'auto';
        widgetManager.addState();
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

        this.scale = newScale;
        this.infoPanel.innerHTML = `Scale: ${Math.round(this.scale * 100)}%`;
        let storedWidgets = widgetManager.getStoredWidgets();
        storedWidgets.forEach(widget => {
            widget.updateScale(this.initialMouseX, this.initialMouseY, zoomRatio);
        });

        // Reset initial mouse positions after zooming
        this.initialMouseX = null;
        this.initialMouseY = null;
    }
}
