class CodeWidget extends Widget {
    // Add widget functionality
    constructor(x, y) {
        super(x, y);
        // Widget container
        const widgetContainer = document.createElement('div');
        widgetContainer.className = 'text-widget';
        widgetContainer.style.left = `${x}px`;
        widgetContainer.style.top = `${y}px`;
        widgetContainer.style.width = '300px';
        widgetContainer.style.height = '200px';

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
        const widgetCodeBlock = document.createElement('textarea');
        widgetCodeBlock.className = 'widget-code-block';

        // Resize handle
        const resizeHandle = document.createElement('div');
        resizeHandle.className = 'resize-handle';

        // Drag handle
        const dragHandle = document.createElement('div');
        dragHandle.className = 'drag-handle';
        dragHandle.textContent = '☰'; // Unicode character for a drag handle

        // Delete button
        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-button';
        deleteButton.textContent = '  X  ';
        deleteButton.addEventListener('click', (event) => {
            // Prevent any potential event propagation issues
            event.stopPropagation();
        
            // Check if widgetContainer is part of the DOM
            if (document.body.contains(widgetContainer)) {
                widgetContainer.remove();
            }
        });

        // Save button
        const saveButton = document.createElement('button');
        saveButton.className = 'save-button';
        saveButton.textContent = 'Save';

        const optionsContainer = document.createElement('div');
        optionsContainer.className = 'options-container';
        optionsContainer.appendChild(fileNameInput);
        optionsContainer.appendChild(languageSelector);
        optionsContainer.appendChild(saveButton);

        document.getElementById('canvas').appendChild(widgetContainer);
        widgetContainer.appendChild(dragHandle);
        widgetContainer.appendChild(deleteButton);
        widgetContainer.appendChild(widgetCodeBlock);
        widgetContainer.appendChild(resizeHandle);
        widgetContainer.appendChild(optionsContainer);

        
        // Initialize CodeMirror
        const editor = CodeMirror.fromTextArea(widgetCodeBlock , {
            lineNumbers: true,
            mode: "python",
            theme: "dracula",
            className: 'widget-code-block'
        });
        editor.setSize(300, 200);
        editor.on('change', () => {
            editor.setOption("mode", languageMap[languageSelector.value.toLowerCase()]);
        });
        
        languageSelector.addEventListener('change', () => {
            editor.setOption("mode", languageMap[languageSelector.value.toLowerCase()]);
        });
        // Set initial size for CodeMirror editor
        updateEditorSize(widgetContainer, editor);
        makeCodeDraggable(dragHandle, widgetContainer);
        makeCodeResizable(widgetContainer, editor, resizeHandle);
    }

    // Function to update the CodeMirror editor size
    function updateEditorSize(container, editor) {
        // Calculate the size of the editor excluding padding and drag handle height
        const padding = 60; // top (10) + bottom (10) padding
        const dragHandleHeight = 20;
        const width = container.clientWidth - 20; // left (10) + right (10) padding
        const height = container.clientHeight - padding - dragHandleHeight;
        editor.setSize(width, height);
    }

    // Make widgets draggable
    function makeCodeDraggable(handle, widget) {
        handle.addEventListener('mousedown', (e) => {
            const startX = e.clientX;
            const startY = e.clientY;
            const startLeft = parseInt(widget.style.left, 10);
            const startTop = parseInt(widget.style.top, 10);

            function onMouseMove(e) {
                const dx = (e.clientX - startX) / scale;
                const dy = (e.clientY - startY) / scale;
                widget.style.left = `${startLeft + dx}px`;
                widget.style.top = `${startTop + dy}px`;
            }

            document.addEventListener('mousemove', onMouseMove);

            document.addEventListener('mouseup', () => {
                document.removeEventListener('mousemove', onMouseMove);
            }, { once: true });
        });
    }

    // Make widgets resizable
    function makeCodeResizable(widget, editor, handle) {
        handle.addEventListener('mousedown', (e) => {
            e.stopPropagation(); // Prevent dragging while resizing
            let startX = e.clientX;
            let startY = e.clientY;
            let startWidth = parseInt(document.defaultView.getComputedStyle(widget).width, 10);
            let startHeight = parseInt(document.defaultView.getComputedStyle(widget).height, 10);

            function onMouseMove(e) {
                const dx = (e.clientX - startX) / scale;
                const dy = (e.clientY - startY) / scale;
                const newWidth = startWidth + dx;
                const newHeight = startHeight + dy;
                widget.style.width = `${newWidth}px`;
                widget.style.height = `${newHeight}px`;
                updateEditorSize(widget, editor);
            }

            document.addEventListener('mousemove', onMouseMove);

            document.addEventListener('mouseup', () => {
                document.removeEventListener('mousemove', onMouseMove);
            }, { once: true });
        });
    }
    // Prism syntax highlighting function
    function highlightSyntax(editor, language) {
        editor.classList.add(language);
        Prism.highlightElement(editor);
    } 
}