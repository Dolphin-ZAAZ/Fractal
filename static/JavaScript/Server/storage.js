
// Persistent storage implementation
window.addEventListener('load', () => {
    // Load the canvas content from local storage
    canvas.innerHTML = localStorage.getItem('canvasContent') || canvas.innerHTML;
    
    // Load the canvas style from local storage
    const styleString = localStorage.getItem('canvasStyle');
    if (styleString) {
        const styleProperties = styleString.split(';').filter(Boolean);
        for (const property of styleProperties) {
            const [key, value] = property.split(':').map((s) => s.trim());
            canvas.style[key] = value;
        }
    }

    // Load the children styles from local storage
    const childrenStyles = localStorage.getItem('childrenStyles');
    if (childrenStyles) {
        const children = childrenStyles.split('|').filter(Boolean);
        for (let i = 0; i < canvas.children.length; i++) {
            const child = canvas.children[i];
            const childStyleString = children[i];
            const styleProperties = childStyleString.split(';').filter(Boolean);
            for (const property of styleProperties) {
                const [key, value] = property.split(':').map((s) => s.trim());
                child.style[key] = value;
            }
        }
    }
});

window.addEventListener('beforeunload', () => {
    // Save the canvas content to local
    localStorage.setItem('canvasContent', canvas.innerHTML);
    
    // Save the canvas style to local storage
    let styleString = "";
    for (const property of Object.keys(canvas.style)) {
        if (canvas.style[property]) {
            styleString += `${property}: ${canvas.style[property]}; `;
        }
    }
    localStorage.setItem('canvasStyle', styleString);

    let childrenStyles = '';
    for (const child of canvas.children) {
        let childStyleString = '';
        for (const property of Object.keys(child.style)) {
            if (child.style[property]) {
                childStyleString += `${property}: ${child.style[property]}; `;
            }
        }
        childrenStyles += childStyleString + '|';
    }
});

function clearCanvas() {
    localStorage.clear();
    // Optionally, you might wants to also clear the canvas or reset the state
    canvas.innerHTML = ''; // Clear the canvas content if needed
}