class ChatWidget extends BaseWidget {
    constructor(x, y, widgetType, width, height, padding, content, isNew = true, id = 0, isMinimized = false) {
        super(x, y, widgetType='ChatWidget', width, height, padding, content, isNew, id, isMinimized);
        if (!this.widgetContents.querySelector('.chat-container')) {
            this.chatContainer = document.createElement('div');
        }
        else {
            this.chatContainer = this.widgetContents.querySelector('.chat-container');
        }
        this.chatContainer.className = 'chat-container';
        this.chatContainer.contentEditable = false;
        if (!this.chatContainer.querySelector('.chat-log')) {
            this.chatLog = document.createElement('div');
        }
        else {
            this.chatLog = this.chatContainer.querySelector('.chat-log');
        }
        this.chatLog.className = 'chat-log';
        this.chatContainer.appendChild(this.chatLog);
        this.widgetContents.appendChild(this.chatContainer);
        this.messageBox = document.createElement('textarea');
        this.messageBox.className = 'chat-message-box';
        this.messageBox.id = 'chat-message-box-' + this.widgetState.id;
        this.messageBox.placeholder = 'Type your message...';
        this.optionsContainer.appendChild(this.messageBox);
        this.optionsContainer.classList.remove('options-container');
        this.optionsContainer.classList.add('chat-options-container');
        this.sendButton = document.createElement('button');
        this.sendButton.className = 'send-chat-message-button';
        this.sendButton.textContent = 'Send';
        this.optionsContainer.appendChild(this.sendButton);
        this.defaultElement = this.messageBox;
        this.sendButton.addEventListener('click', () => {
            this.sendMessage();
        });
        // Add an event listener to the button
        this.sendButton.addEventListener('click', function() {
            this.sendMessage();
        }.bind(this));
        this.messageBox.addEventListener('keydown', function(event) {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                this.sendMessage();
            }
        }.bind(this));
        this.resizeContents(80, this.widgetContainer);
    }
    sendMessage() {
        const message = this.messageBox.value.trim();
        const messageElement = document.createElement('div');
        messageElement.classList.add('chat-message');
        
        const speaker_heading = document.createElement('h4');
        speaker_heading.classList.add('name-heading');
        speaker_heading.textContent = 'You';

        const textElement = document.createElement('div'); // Create a new div for the message text
        textElement.style.whiteSpace = 'pre-wrap';
        textElement.textContent = message; // Set the message text
        
        messageElement.appendChild(speaker_heading); // Append the heading
        messageElement.appendChild(textElement); // Append the message text
        
        this.chatLog.appendChild(messageElement);
        this.chatLog.scrollTop = this.chatLog.scrollHeight;    
        this.messageBox.value = '';
        const thinkingElement = document.createElement('div');
        thinkingElement.classList.add('thinking');
        thinkingElement.textContent = 'Remembering...';
        this.chatLog.appendChild(thinkingElement);
        if (message) {
            thinkingElement.classList.add('thinking');
            thinkingElement.textContent = 'Thinking...';
            fetch('/chat/get-response', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({user_input: message, chat_widget_id: this.widgetState.id})
            })
            .then(response => response.json())
            .then(data => {
                const responseElement = document.createElement('div');
                responseElement.classList.add('chat-response');
                let formattedResponse = data.response;
                formattedResponse = formattedResponse.replace(/zxz/g, '<br>');
                formattedResponse = formattedResponse.replace(/### (.*?)(<br>|$)/g, '<h3>$1</h3><br>');
                formattedResponse = formattedResponse.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
                // Check if the response contains code
                const segments = formattedResponse.split(/```/g);
                let text_elements = [];
                let code_elements = [];
                for (let i = 0; i < segments.length; i++) {
                    if (i % 2 === 0) {
                        // This is a non-code segment
                        if (i == 0) {
                            const speaker_heading = document.createElement('h4');
                            speaker_heading.classList.add('bot-heading');
                            speaker_heading.textContent = 'Mobsy';
                            responseElement.appendChild(speaker_heading);
                        }
                        const textElement = document.createElement('div');
                        textElement.innerHTML = segments[i];
                        responseElement.appendChild(textElement); // Append to the responseElement
                    } else {
                        // This is a code segment
                        const codeContainer = document.createElement('div');
                        codeContainer.classList.add('code-container');
                        const codeElement = document.createElement('pre');
                        const headingElement = document.createElement('h4');
                        let correct_innerHTML = segments[i].replace(/<br>/g, '\n');
                        let first_line = correct_innerHTML.split('\n')[0];
                        correct_innerHTML = correct_innerHTML.replace(first_line, '');
                        headingElement.textContent = first_line;
                        const languageClass = languageClassMap[first_line.toLowerCase()];
                        if (languageClass) {
                            codeElement.classList.add(languageClass);
                        }
                        codeElement.textContent = correct_innerHTML;
                        headingElement.classList.add('code-heading');
                        responseElement.appendChild(headingElement);
                        codeElement.classList.add('code-block');
                        codeContainer.appendChild(codeElement); // Append to the responseElement
                        responseElement.appendChild(codeContainer);
                        // Assuming codeElement is already defined as in your provided code snippet
                        // Highlight the code
                        this.chatLog.scrollTop = this.chatLog.scrollHeight;
                        Prism.highlightElement(codeElement);
                        const copyCodeButton = document.createElement('button');
                        copyCodeButton.textContent = 'Copy';
                        copyCodeButton.classList.add('copy-code-button');
                        copyCodeButton.addEventListener('click', () => {
                            navigator.clipboard.writeText(codeElement.textContent);
                        });
                        codeContainer.appendChild(copyCodeButton);
                    }
                }
                this.chatLog.appendChild(responseElement);
                this.chatLog.removeChild(thinkingElement);
            })
            .finally(() => {
                this.updateWidgetState();
            });
            this.chatLog.scrollTop = this.chatLog.scrollHeight;
        }
    }
}