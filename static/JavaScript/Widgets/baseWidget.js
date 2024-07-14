let scaleRatio = 1;
class BaseWidget {
    constructor(x, y, widgetType="BaseWidget", width = 300, height = 200, padding = 80, content = '', isNew = true, id = 0, isMinimized = false) {
        this.canvas = document.getElementById('canvas');
        const rect = this.canvas.getBoundingClientRect();
        this.characterCount = 5;

        // Calculate the relative position of the mouse within the canvas
        const relativeX = x - rect.left;
        const relativeY = y - rect.top;
        this.widgetState = {
            id: id,
            x: x,
            y: y,
            widgetType: widgetType,
            width: width,
            height: height,
            padding: padding,
            content: content,
            isMinimized: isMinimized
        };
        this.widgetState.id = widgetManager.generateRandomUniqueID();
        this.canvas = document.getElementById('canvas');
        if (isNew) {
            this.widgetContainer = this.createWidgetContainer(relativeX, relativeY, width, height);
        } else {
            this.widgetContainer = this.createWidgetContainer(x, y, width, height);
        }
        this.widgetContents = this.createWidgetContents(content);
        this.resizeHandle = this.createResizeHandle();
        this.dragHandle = this.createDragHandle();
        this.deleteButton = this.createDeleteButton();
        this.optionsContainer = this.createOptionsContainer();

        this.appendToCanvas();
        this.appendElements();
        this.addWidgetEvents();
        this.updateWidgetState();
        this.updateIconifyStatus(this.widgetState.height, this.widgetState.width);
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
            this.characterCount++;
            if (this.characterCount > 5)
            {
                console.log('updating widget state');
                this.characterCount = 0;
            }
        });
    }

    makeDeletable() {
        this.deleteButton.addEventListener('click', (event) => {
            event.stopPropagation();
            widgetManager.removeWidget(this.widgetState.id);
        });
    }

    makeDraggable() {
        this.dragHandle.addEventListener('mousedown', (e) => {
            const initialState = [{...this.getWidgetState()}];
            const startX = e.clientX;
            const startY = e.clientY;
            const startLeft = parseInt(this.widgetContainer.style.left, 10);
            const startTop = parseInt(this.widgetContainer.style.top, 10);

            const onMouseMove = (e) => {
                const dx = (e.clientX - startX) / scaleRatio;
                const dy = (e.clientY - startY) / scaleRatio;
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
                widgetManager.updateWidgetState(this.widgetState.id);
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
                const dx = (e.clientX - startX) / scaleRatio;
                const dy = (e.clientY - startY) / scaleRatio;
                this.resizeWidget(startWidth, dx, startHeight, dy);
                this.updateWidgetState();
                this.updateIconifyStatus(this.widgetState.height, this.widgetState.width);
            };

            document.addEventListener('mousemove', onMouseMove);

            document.addEventListener('mouseup', () => {
                document.removeEventListener('mousemove', onMouseMove);
            }, { once: true });
        });
    }

    resizeWidget(startWidth, dx, startHeight, dy) {
        this.widgetContainer.style.width = `${startWidth + dx}px`;
        this.widgetContainer.style.height = `${startHeight + dy}px`;
        this.resizeContents(this.widgetState.padding, this.widgetContainer);
        this.widgetState.width = parseInt(document.defaultView.getComputedStyle(this.widgetContainer).width, 10);
        this.widgetState.height = parseInt(document.defaultView.getComputedStyle(this.widgetContainer).height, 10);
    }

    updateIconifyStatus(height, width) {
        const blockSize = 50;
        let minSize = 50;
        if (height < minSize || width < minSize) {
            this.widgetContents.classList.add('hidden');
            this.optionsContainer.classList.add('hidden');
            this.resizeWidget(width, 0, height, 0);
            this.widgetState.isMinimized = true;
        }
        if (this.widgetState.isMinimized && height >= minSize && width >= minSize) {
            this.widgetContents.classList.remove('hidden');
            this.optionsContainer.classList.remove('hidden');
            this.resizeWidget(minSize + 20, 0, minSize + 20, 0);
            this.widgetState.isMinimized = false;
        }
        if (height <= blockSize || width <= blockSize) {
            this.resizeWidget(blockSize, 0, blockSize, 0);
        }
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
        this.resizeContents(this.widgetState.padding, this.widgetContainer);
    }

    updateWidgetState() {
        this.widgetState.x = parseInt(this.widgetContainer.style.left, 10);
        this.widgetState.y = parseInt(this.widgetContainer.style.top, 10);
        this.widgetState.width = parseInt(document.defaultView.getComputedStyle(this.widgetContainer).width, 10);
        this.widgetState.height = parseInt(document.defaultView.getComputedStyle(this.widgetContainer).height, 10);
        this.widgetState.content = this.widgetContents.innerHTML;
    }

    getWidgetState() {
        return this.widgetState;
    }

    setWidgetState(widget) {
        this.widgetState = widget.widgetState;
    }

    updateScale(newScale, mouseX, mouseY, zoomRatio) {
        const rect = this.canvas.getBoundingClientRect();
        const canvasX = this.widgetContainer.getBoundingClientRect().left - rect.left;
        const canvasY = this.widgetContainer.getBoundingClientRect().top - rect.top;

        const newLeft = canvasX * zoomRatio + (1 - zoomRatio) * mouseX;
        const newTop = canvasY * zoomRatio + (1 - zoomRatio) * mouseY;

        const newWidth = parseInt(this.widgetContainer.style.width) * zoomRatio;
        const newHeight = parseInt(this.widgetContainer.style.height) * zoomRatio;

        this.widgetContainer.style.left = `${newLeft}px`;
        this.widgetContainer.style.top = `${newTop}px`;
        this.widgetContainer.style.width = `${newWidth}px`;
        this.widgetContainer.style.height = `${newHeight}px`;

        this.resizeContents(this.widgetState.padding);
        this.updateWidgetState();
        this.updateIconifyStatus(this.widgetState.height, this.widgetState.width);
    }
}