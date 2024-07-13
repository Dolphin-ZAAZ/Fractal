class CodeWidget extends BaseWidget {
    // Add widget functionality
    constructor(x, y, widgetType, width, height, padding, content, isNew = true, id = 0) {
        super(x, y, widgetType='CodeWidget', width, height, padding, '', isNew, id);

        // File name input
        const fileNameInput = this.createFileNameInput();

        // Language selector
        const languageSelector = this.createLanguageSelector();
    
        // CodeMirror textarea  
        this.widgetCodeBlock = this.createCodeBlock();
    
        // Save button
        const saveButton = this.createSaveButton();
    
        this.addOptionsToContainer(fileNameInput, languageSelector, saveButton);
        
        // Initialize CodeMirror
        this.initializeCodeMirror(languageSelector, content);
    }

    initializeCodeMirror(languageSelector, content) {
        this.widgetContents.appendChild(this.widgetCodeBlock);
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
        if (content && content != '') {
            this.editor.setOption("value", content);
        }
        languageSelector.addEventListener('change', () => {
            this.editor.setOption("mode", languageMap[languageSelector.value.toLowerCase()]);
            this.updateWidgetState();
        });

        this.MakeEditorResizable(this.editor, this.widgetState.padding, this.widgetContainer);
        document.getElementById('canvas-container').addEventListener('wheel', (e) => {
            this.updateEditorSize(this.widgetContents, this.editor);
        });
    }

    addOptionsToContainer(fileNameInput, languageSelector, saveButton) {
        this.optionsContainer.appendChild(fileNameInput);
        this.optionsContainer.appendChild(languageSelector);
        this.optionsContainer.appendChild(saveButton);
    }

    createSaveButton() {
        const saveButton = document.createElement('button');
        saveButton.className = 'save-button';
        saveButton.textContent = 'Save';
        return saveButton;
    }

    createFileNameInput() {
        const fileNameInput = document.createElement('input');
        fileNameInput.className = 'file-name-input';
        fileNameInput.placeholder = 'File Name';
        return fileNameInput;
    }

    createLanguageSelector() {
        const languageSelector = document.createElement('select');
        languageSelector.className = 'language-selector';
        languageSelector.innerHTML = languageOptions;
        languageSelector.value = languageMap[defaultLanguage];
        return languageSelector;
    }

    updateWidgetState() {
        super.updateWidgetState();
        if (this.editor) {
            this.widgetState.content = this.editor.getValue();
        }
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