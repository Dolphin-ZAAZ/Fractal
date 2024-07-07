class CodeWidget extends BaseWidget {
    // Add widget functionality
    constructor(x, y, widgetType, width, height, content, isNew = true) {
        super(x, y, widgetType, width, height, '', isNew);

        this.padding = 80;

        // File name input
        const fileNameInput = document.createElement('input');
        fileNameInput.className = 'file-name-input';
        fileNameInput.placeholder = 'File Name';

        // Language selector
        const languageSelector = document.createElement('select');
        languageSelector.className = 'language-selector';
        languageSelector.innerHTML = languageOptions;
        languageSelector.value = languageMap[defaultLanguage];
    
        // CodeMirror textarea  
        this.widgetCodeBlock = this.createCodeBlock();
    
        // Save button
        const saveButton = document.createElement('button');
        saveButton.className = 'save-button';
        saveButton.textContent = 'Save';
    
        this.optionsContainer.appendChild(fileNameInput);
        this.optionsContainer.appendChild(languageSelector);
        this.optionsContainer.appendChild(saveButton);

        this.widgetContents.appendChild(this.widgetCodeBlock);

        // Initialize CodeMirror
        this.editor = CodeMirror.fromTextArea(this.widgetCodeBlock, {
            lineNumbers: true,
            mode: "python",
            theme: "dracula",
            className: 'widget-code-block'
        });
        this.editor.setSize(300, 200);
        this.editor.on('change', () => {
            this.editor.setOption("mode", languageMap[languageSelector.value.toLowerCase()]);
            this.updateWidgetState();
        });
        this.editor.setOption("value", content);
        languageSelector.addEventListener('change', () => {
            this.editor.setOption("mode", languageMap[languageSelector.value.toLowerCase()]);
            this.updateWidgetState();
        });

        this.MakeEditorResizable(this.editor, this.padding, this.widgetContainer);
        document.getElementById('canvas-container').addEventListener('wheel', (e) => {
            e.preventDefault();
            this.updateEditorSize(this.widgetContainer, this.editor);
        });
    }

    updateWidgetState() {
        super.updateWidgetState();
        this.widgetState.content = this.editor.getValue();
    }

    createCodeBlock() {
        const widgetCodeBlock = document.createElement('textarea');
        widgetCodeBlock.className = 'widget-code-block';
        return widgetCodeBlock;
    }

    MakeEditorResizable(editor, padding, container) {
        this.resizeContents(padding, container);
        this.updateWidgetState();
        this.updateEditorSize(container, editor);
        this.resizeHandle.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            const onMouseMove = (e) => {
                this.updateEditorSize(container, editor);
            };

            document.addEventListener('mousemove', onMouseMove);

            document.addEventListener('mouseup', () => {
                document.removeEventListener('mousemove', onMouseMove);
            }, { once: true });
        });
    }

    // Function to update the CodeMirror editor size
    updateEditorSize(container, editor) {
        // Calculate the size of the editor excluding padding and drag handle height
        const padding = 60; // top (10) + bottom (10) padding
        const dragHandleHeight = 20;
        const width = parseInt(document.defaultView.getComputedStyle(container).width, 10);
        const height = parseInt(document.defaultView.getComputedStyle(container).height, 10);
        editor.setSize(width, height);
    }

    // Prism syntax highlighting function
    highlightSyntax(editor, language) {
        editor.classList.add(language);
        Prism.highlightElement(editor);
    } 
}