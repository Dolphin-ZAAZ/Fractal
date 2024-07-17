class MultiSelector {
    constructor(container) {
        this.container = container;
        this.startX = 0;
        this.startY = 0;
        this.isSelecting = false;
        this.selectionBox = null;
        this.selectedElements = [];
        this.selectedWidgets = [];
        this.init();
    }

    init() {
        this.container.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.container.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.container.addEventListener('mouseup', (e) => this.onMouseUp(e));
    }

    onMouseDown(e) {
        if (e.ctrlKey) {
            e.preventDefault();
            this.startX = e.clientX;
            this.startY = e.clientY;
            this.isSelecting = true;

            this.selectionBox = document.createElement('div');
            this.selectionBox.style.position = 'absolute';
            this.selectionBox.style.border = '2px dashed #00a1d6';
            this.selectionBox.style.backgroundColor = 'rgba(0, 161, 214, 0.25)';
            this.selectionBox.style.pointerEvents = 'none';
            this.container.appendChild(this.selectionBox);
        }
    }

    onMouseMove(e) {
        if (this.isSelecting) {
            const currentX = e.clientX;
            const currentY = e.clientY;

            this.selectionBox.style.left = `${Math.min(this.startX, currentX)}px`;
            this.selectionBox.style.top = `${Math.min(this.startY, currentY)}px`;
            this.selectionBox.style.width = `${Math.abs(this.startX - currentX)}px`;
            this.selectionBox.style.height = `${Math.abs(this.startY - currentY)}px`;
        }
    }

    onMouseUp(e) {
        if (this.isSelecting) {
            this.isSelecting = false;
            this.selectElements();

            if (this.selectionBox) {
                this.container.removeChild(this.selectionBox);
                this.selectionBox = null;
            }
        }
    }

    selectElements() {
        const selectionRect = this.selectionBox.getBoundingClientRect();
        this.selectedElements = [];
        this.selectedWidgets = [];

        const elementsToSelect = this.container.querySelectorAll('.selectable');
        elementsToSelect.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (this.isOverlapping(selectionRect, rect)) {
                this.selectedElements.push(el);
                el.classList.add('selected');
                widgetManager.addState();
            } else {
                el.classList.remove('selected');
                widgetManager.addState();
            }
        });
        for (let i = 0; i < this.selectedElements.length; i++) {
            this.selectedWidgets.push(widgetManager.getWidgetById(this.selectedElements[i].id));
        }
        console.log('Selected Elements:', this.selectedElements);
        console.log('Selected Widgets:', this.selectedWidgets);
    }

    isOverlapping(rect1, rect2) {
        return !(rect2.left > rect1.right || 
                 rect2.right < rect1.left || 
                 rect2.top > rect1.bottom ||
                 rect2.bottom < rect1.top);
    }

    startMoveAllWidgets(e) {
        for (let i = 0; i < this.selectedWidgets.length; i++) {
            const widget = this.selectedWidgets[i];
            widget.handleDrag(e);
        }
    }
}