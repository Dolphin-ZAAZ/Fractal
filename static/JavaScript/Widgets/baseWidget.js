class BaseWidget {
    constructor(x, y, widgetType="BaseWidget", width = 300, height = 200, content = '', isNew = true) {
        this.widgetState = {
            x: x,
            y: y,
            widgetType: widgetType,
            width: width,
            height: height,
            content: content
        };
        this.canvas = document.getElementById('canvas');
        this.widgetContainer = this.createWidgetContainer(x, y, width, height);
        this.widgetContents = this.createWidgetContents(content);
        this.resizeHandle = this.createResizeHandle();
        this.dragHandle = this.createDragHandle();
        this.deleteButton = this.createDeleteButton();
        this.optionsContainer = this.createOptionsContainer();

        this.appendToCanvas();
        this.appendElements();
        this.addWidgetEvents();
        
        if (isNew) {
            storedWidgets.push(this);
            storedStates.push(this.widgetState);
        }
    }

    createWidgetContainer(x, y, width, height) {
        const widgetContainer = document.createElement('div');
        widgetContainer.className = 'widget-container';
        widgetContainer.style.left = `${x}px`;
        widgetContainer.style.top = `${y}px`;
        widgetContainer.style.width = `${width}px`;
        widgetContainer.style.height = `${height}px`;
        return widgetContainer;
    }

    createWidgetContents(content) {
        const widgetContents = document.createElement('div');
        widgetContents.className = 'widget-contents';
        widgetContents.contentEditable = true;
        widgetContents.innerHTML = content;
        return widgetContents;
    }

    createOptionsContainer() {
        const optionsContainer = document.createElement('div');
        optionsContainer.className = 'options-container';
        return optionsContainer;
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
        this.widgetContainer.appendChild(this.dragHandle);
        this.widgetContainer.appendChild(this.deleteButton);
        this.widgetContainer.appendChild(this.widgetContents);
        this.widgetContainer.appendChild(this.resizeHandle);
        this.widgetContainer.appendChild(this.optionsContainer);
    }

    makeEditable() {
        this.widgetContents.contentEditable = true;
        this.widgetContents.addEventListener('input', () => {
            this.widgetState.content = this.widgetContents.innerHTML;
            this.updateWidgetState();
        });
    }

    makeDeletable() {
        this.deleteButton.addEventListener('click', (event) => {
            event.stopPropagation();
            if (document.body.contains(this.widgetContainer)) {
                const index = storedWidgets.indexOf(this.widgetState);
                storedWidgets.splice(index, 1);
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
                const dx = (e.clientX - startX) / scale;
                const dy = (e.clientY - startY) / scale;
                this.widgetContainer.style.left = `${startLeft + dx}px`;
                this.widgetContainer.style.top = `${startTop + dy}px`;
                this.widgetState.x = parseInt(this.widgetContainer.style.left, 10);
                this.widgetState.y = parseInt(this.widgetContainer.style.top, 10);
                this.updateWidgetState();
            };

            document.addEventListener('mousemove', onMouseMove);

            document.addEventListener('mouseup', () => {
                document.removeEventListener('mousemove', onMouseMove);
                this.x = parseInt(this.widgetContainer.style.left, 10);
                this.y = parseInt(this.widgetContainer.style.top, 10);
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
            const padding = 80;

            const onMouseMove = (e) => {
                const dx = (e.clientX - startX) / scale;
                const dy = (e.clientY - startY) / scale;
                this.widgetContainer.style.width = `${startWidth + dx}px`;
                this.widgetContainer.style.height = `${startHeight + dy}px`;
                this.resizeContents(padding, this.widgetContainer);
                this.widgetState.width = parseInt(document.defaultView.getComputedStyle(this.widgetContainer).width, 10);
                this.widgetState.height = parseInt(document.defaultView.getComputedStyle(this.widgetContainer).height, 10);
                this.updateWidgetState();
            };

            document.addEventListener('mousemove', onMouseMove);

            document.addEventListener('mouseup', () => {
                document.removeEventListener('mousemove', onMouseMove);
            }, { once: true });
        });
    }

    resizeContents(padding, container = this.widgetContainer) {
        const contentHeight = parseInt(document.defaultView.getComputedStyle(container).height, 10) - parseInt(document.defaultView.getComputedStyle(this.optionsContainer).height, 10) + parseInt(document.defaultView.getComputedStyle(this.dragHandle).height, 10) - padding;
        this.widgetContents.style.width = `100%`;
        this.widgetContents.style.height = `${contentHeight}px`;
    }

    addWidgetEvents() {
        this.makeEditable();
        this.makeDeletable();
        this.makeDraggable();
        this.makeResizable();
        this.resizeContents(80);
    }

    updateWidgetState() {
        this.widgetState.x = parseInt(this.widgetContainer.style.left, 10);
        this.widgetState.y = parseInt(this.widgetContainer.style.top, 10);
        this.widgetState.width = parseInt(document.defaultView.getComputedStyle(this.widgetContainer).width, 10);
        this.widgetState.height = parseInt(document.defaultView.getComputedStyle(this.widgetContainer).height, 10);
        this.widgetState.content = this.widgetContents.innerHTML;
    }
}