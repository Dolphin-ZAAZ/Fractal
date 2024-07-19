class WidgetManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.ids = [];
        this.storedWidgets = [];
        this.storedWidgetStates = [];
        this.states = {};
        this.stateNumber = 0;
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

    getWidgetById(id) {
        for (let widget of this.storedWidgets) {
            if (parseInt(widget.widgetState.id) === parseInt(id)) {
                return widget;
            }
        }
    }

    generateRandomUniqueID() {
        let id = Math.floor(Math.random() * 1000000);
        while (this.ids.includes(id)) {
            id = Math.floor(Math.random() * 1000000);
        }
        this.ids.push(id);
        return id;
    }

    addWidget(x, y, widgetType) {
        const widget = new this.widgetTypes[widgetType](x, y, widgetType, 300, 200, 80, '', true, this.generateRandomUniqueID(), false);
        this.storedWidgets.push(widget);
        this.storedWidgetStates.push(widget.getWidgetState());
        this.addState();
        widget.focusDefaultElement();
    }

    removeWidget(id) {
        const widget = this.storedWidgets.find(widget => widget.widgetState.id === id);
        const index = this.storedWidgets.indexOf(widget);
        this.storedWidgets.splice(index, 1);
        this.storedWidgetStates.splice(index, 1);
        widget.widgetContainer.remove();
        this.addState();
    }

    updateWidgetState(id) {
        const widget = this.storedWidgets.find(widget => widget.widgetState.id === id);
        const index = this.storedWidgets.indexOf(widget);
        this.storedWidgetStates[index] = widget.getWidgetState();
        this.addState();
    }

    addState() {
        const stateNumber = JSON.stringify(this.stateNumber);
        const widgetStates = JSON.stringify(this.storedWidgetStates);
        const canvasState = JSON.stringify(this.canvas.getCanvasStyle());
        Object.keys(this.states).forEach(key => {
            if (parseInt(key) > this.stateNumber) {
                delete this.states[key];
            }
        });
        this.states[stateNumber] = { widgetStates : widgetStates, canvasState : canvasState };
        const previousState = {...this.states[this.stateNumber - 1]};
        const newState = {...this.states[this.stateNumber]};
        if (this.stateNumber - 1 > 0) {         
            if (deepEqual(newState, previousState)) {
                return;
            } 
        }
        localStorage.setItem('states', JSON.stringify(this.states));
        localStorage.setItem('stateNumber', JSON.stringify(this.stateNumber));
        this.stateNumber++;
        this.postStates();
    }
    
    loadState(stateNumber) {
        const states = JSON.parse(localStorage.getItem('states'));
        this.states = states;
        const state = states[stateNumber];
        this.stateNumber = stateNumber + 1;
        console.log('Loading state:', stateNumber);
        if (!state) {
            return;
        }
        const widgetStates = JSON.parse(state.widgetStates);
        const canvasState = JSON.parse(state.canvasState);
        this.canvas.setCanvasStyle(canvasState);
        this.storedWidgetStates = widgetStates;
        this.storedWidgets.forEach(widget => {
            widget.widgetContainer.remove();
        });
        this.storedWidgets = [];
        widgetStates.forEach(widgetState => {
            const widget = new this.widgetTypes[widgetState.widgetType](widgetState.x, widgetState.y, widgetState.widgetType, widgetState.width, widgetState.height, widgetState.padding, widgetState.content, false, widgetState.id, widgetState.isMinimized);
            this.storedWidgets.push(widget);
        });
        localStorage.setItem('stateNumber', JSON.stringify(stateNumber));
        this.postStates();
    }
    
    undo() {
        if (this.stateNumber > 1) {
            this.stateNumber--;
            this.loadState(this.stateNumber - 1);
        }
    }

    redo() {
        if (this.stateNumber < Object.keys(this.states).length) {
            this.stateNumber++;
            this.loadState(this.stateNumber - 1);
        }
    }

    postStates() {
        let saveData = {stateNumber : this.stateNumber, states : this.states};
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

    fetchWidgets() {
        return new Promise((resolve, reject) => {
            fetch('/data/get-widget-storage')
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to get widgets');
                    }
                    return response.json();
                })
                .then(storageData => {
                    if (!storageData.states) {
                        return;
                    }
                    localStorage.setItem('states', JSON.stringify(storageData.states));
                    localStorage.setItem('stateNumber', JSON.stringify(storageData.stateNumber));
                    this.loadState(JSON.parse(localStorage.getItem('stateNumber')) - 1);
                    resolve();
                })
                .catch(error => {
                    console.error(error);
                    reject(error);
                });
        });
    }
    
    clearCanvas () {
        this.storedWidgets.forEach(widget => {
            widget.widgetContainer.remove();
        });
        this.storedWidgets = [];
        this.storedWidgetStates = [];
        this.states = {};
        this.stateNumber = 0;
        localStorage.clear();
        this.postStates();
    }

    getStoredWidgets() {
        return this.storedWidgets;
    }
}