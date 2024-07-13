class WidgetManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.storedWidgets = [];
        this.storedWidgetStates = [];
        this.actionStack = [];
        this.actionIndex = 0;
        this.currentState = [];
        this.widgetTypes = {
            'BaseWidget': BaseWidget,
            'ChatWidget': ChatWidget,
            'CodeWidget': CodeWidget,
        };
        document.addEventListener('keydown', (event) => {
            if (event.ctrlKey && event.key === 'z') {
                this.undo();
            } else if (event.ctrlKey && event.key === 'y') {
                this.redo();
            }
        });
    }

    addWidget(x, y, type) {
        const storedWidgetStatesCopy = [...this.storedWidgetStates];
        this.currentState = storedWidgetStatesCopy;
        const widget = new this.widgetTypes[type](x, y);
        this.storedWidgets.push(widget);
        this.storedWidgetStates.push(widget.widgetState);
        const newStoredWidgetStates = [...this.storedWidgetStates];
        this.addActionState(this.currentState, newStoredWidgetStates);
        this.updateLocalStorage();
        return widget;
    }

    updateWidgetStates(widget) {
        for (let i = 0; i < this.storedWidgets.length; i++) {
            if (this.storedWidgets[i] === widget) {
                this.storedWidgetStates[i] = widget.getWidgetState();
            }
        }
        this.updateLocalStorage();
    }

    deleteWidget(widget) {
        const storedWidgetStatesCopy = [...this.storedWidgetStates];
        this.currentState = storedWidgetStatesCopy;
        if (document.body.contains(widget.widgetContainer)) {
            for (let i = 0; i < this.storedWidgets.length; i++) {
                if (this.storedWidgets[i] === widget) {
                    this.currentState = this.storedWidgetStates;
                    this.storedWidgets.splice(i, 1);
                    this.storedWidgetStates.splice(i, 1);
                }
            }
            widget.widgetContainer.remove();
            const newStoredWidgetStates = [...this.storedWidgetStates];
            this.addActionState(this.currentState, newStoredWidgetStates);
            this.updateLocalStorage();
        }
    }

    getStoredWidgets() {
        return this.storedWidgets;
    }

    addActionState(initialState, finalState) {
        console.log(initialState, finalState);
        this.actionStack.push({ initialState : initialState, finalState : finalState });
        if (this.actionStack.length > 0) {
            this.actionIndex = this.actionStack.length;
        }
    }

    undo() {
        this.resetWidgets();
        this.actionIndex -= 1;
        if (this.actionStack.length < 2 || this.actionIndex <= 0) { this.actionIndex = 0; this.updateLocalStorage(); return;}
        this.storedWidgetStates = [...this.actionStack[this.actionIndex].initialState];
        this.renderWidgets();
    }

    redo() {
        this.actionIndex += 1;
        if (this.actionStack.length < this.actionIndex) { this.actionIndex = this.actionStack.length; return; }
        this.resetWidgets();
        this.storedWidgetStates = [...this.actionStack[this.actionIndex - 1].finalState];
        this.renderWidgets();
    }

    renderWidgets() {
        this.storedWidgetStates.forEach(widget => {
            console.log(widget.widgetType);
            const newWidget = new this.widgetTypes[widget.widgetType](widget.x, widget.y, widget.widgetType, widget.width, widget.height, widget.padding, widget.content, false, widget.id, widget.isMinimized);
            this.storedWidgets.push(newWidget);
            this.updateLocalStorage();
        });
    }

    updateLocalStorage() {
        localStorage.setItem('widgets', JSON.stringify(this.storedWidgetStates));
        localStorage.setItem('actionStack', JSON.stringify(this.actionStack));
        localStorage.setItem('actionIndex', JSON.stringify(this.actionIndex));
        localStorage.setItem('canvasStyle', JSON.stringify(this.canvas.getCanvasStyle()));
        this.postWidgets();
    }

    loadWidgets() {
        const storedWidgets = JSON.parse(localStorage.getItem('widgets'));
        if (storedWidgets) {
            for (let i = 0; i < storedWidgets.length; i++) {
                const widget = storedWidgets[i];
                const newWidget = new this.widgetTypes[widget.widgetType](widget.x, widget.y, widget.widgetType, widget.width, widget.height, widget.padding, widget.content, widget.isNew, widget.id, widget.isMinimized);
                this.storedWidgets.push(newWidget);
                this.storedWidgetStates.push(newWidget.widgetState);
            }
            this.actionIndex = JSON.parse(localStorage.getItem('actionIndex'));
            this.actionStack = JSON.parse(localStorage.getItem('actionStack'));
            this.canvas.setCanvasStyle(JSON.parse(localStorage.getItem('canvasStyle')));
        }
    }

    resetWidgets() {
        this.storedWidgets.forEach(widget => {
            widget.widgetContainer.remove();
        });
        this.storedWidgets = [];
        this.storedWidgetStates = [];
    }

    postWidgets() {
        let saveData = {}
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const value = localStorage.getItem(key);
            saveData[key] = value;
        }
        const data = JSON.stringify(saveData);
        const blob = new Blob([data], {type: 'application/json'});
        const url = '/data/set-widget-storage';
    
        if (!navigator.sendBeacon(url, blob)) {
            // Fallback for when sendBeacon is not available or fails
            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: data
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to save widgets');
                }
                return response.json();
            })
            .then(data => {
                console.log(data);
            })
            .catch(error => {
                console.error(error);
            });
        }
    }

    async fetchWidgets() {
        try {
            const response = await fetch('/data/get-widget-storage');
            if (!response.ok) {
                throw new Error('Failed to get widgets');
            }
            const storageData = await response.json(); // Ensure this is awaited
            Object.keys(storageData).forEach(key => {
                // Assuming storageData[key] is already a string; otherwise, JSON.stringify it
                localStorage.setItem(key, storageData[key]);
            });
            this.loadWidgets();
        } catch (error) {
            console.error(error);
        }
    }
    
    clearCanvas () {
        this.storedWidgets.forEach(widget => {
            widget.widgetContainer.remove();
        });
        this.storedWidgets = [];
        this.storedWidgetStates = [];
        this.actionStack = [];
        this.currentState = [];
        localStorage.clear();
        this.postWidgets();
    }
}