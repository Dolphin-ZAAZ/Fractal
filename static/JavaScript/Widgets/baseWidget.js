class Widget {
    constructor(x, y) {
        this.canvas = document.getElementById('canvas');
        this.widgetContainer = this.createWidgetContainer(x, y);
        this.widgetContents = this.createWidgetContents();
        this.resizeHandle = this.createResizeHandle();
        this.dragHandle = this.createDragHandle();
        this.deleteButton = this.createDeleteButton();

        this.appendToCanvas();
        this.appendElements();
        this.addWidgetEvents();
    }

    createWidgetContainer(x, y) {
        const widgetContainer = document.createElement('div');
        widgetContainer.className = 'widget-container';
        widgetContainer.style.left = `${x}px`;
        widgetContainer.style.top = `${y}px`;
        widgetContainer.style.width = '50px';
        widgetContainer.style.height = '50px';
        return widgetContainer;
    }

    createWidgetContents() {
        const widgetContents = document.createElement('div');
        widgetContents.className = 'widget-contents';
        return widgetContents;
    }

    createResizeHandle() {
        const resizeHandle = document.createElement('div');
        resizeHandle.className = 'resize-handle';
        return resizeHandle;
    }

    createDragHandle() {
        const dragHandle = document.createElement('div');
        dragHandle.className = 'drag-handle';
        dragHandle.textContent = '☰';
        return dragHandle;
    }

    createDeleteButton() {
        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-button';
        deleteButton.textContent = '  X  ';
        return deleteButton;
    }

    appendToCanvas() {
        this.canvas.appendChild(this.widgetContainer);
    }

    appendElements() {
        this.widgetContainer.appendChild(this.deleteButton);
        this.widgetContainer.appendChild(this.widgetContents);
        this.widgetContainer.appendChild(this.resizeHandle);
        this.widgetContainer.appendChild(this.dragHandle);
    }

    makeEditable() {
        this.widgetContents.contentEditable = true;
    }

    makeDeletable() {
        this.deleteButton.addEventListener('click', (event) => {
            event.stopPropagation();
            if (document.body.contains(this.widgetContainer)) {
                this.widgetContainer.remove();
            }
        });
    }

    makeDraggable() {
        this.dragHandle.addEventListener('mousedown', (e) => {
            const startX = e.clientX;
            const startY = e.clientY;
            const startLeft = parseInt(this.widgetContainer.style.left, 10);
            const startTop = parseInt(this.widgetContainer.style.top, 10);

            const onMouseMove = (e) => {
                const dx = (e.clientX - startX);
                const dy = (e.clientY - startY);
                this.widgetContainer.style.left = `${startLeft + dx}px`;
                this.widgetContainer.style.top = `${startTop + dy}px`;
            };

            document.addEventListener('mousemove', onMouseMove);

            document.addEventListener('mouseup', () => {
                document.removeEventListener('mousemove', onMouseMove);
            }, { once: true });
        });
    }

    makeResizable() {
        this.resizeHandle.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            const startX = e.clientX;
            const startY = e.clientY;
            const startWidth = parseInt(document.defaultView.getComputedStyle(this.widgetContainer).width, 10);
            const startHeight = parseInt(document.defaultView.getComputedStyle(this.widgetContainer).height, 10);

            const onMouseMove = (e) => {
                const dx = (e.clientX - startX);
                const dy = (e.clientY - startY);
                this.widgetContainer.style.width = `${startWidth + dx}px`;
                this.widgetContainer.style.height = `${startHeight + dy}px`;
                this.widgetContents.style.width = `100%`;
                this.widgetContents.style.height = `100%`;
            };

            document.addEventListener('mousemove', onMouseMove);

            document.addEventListener('mouseup', () => {
                document.removeEventListener('mousemove', onMouseMove);
            }, { once: true });
        });
    }

    addWidgetEvents() {
        this.makeEditable();
        this.makeDeletable();
        this.makeDraggable();
        this.makeResizable();
    }
}