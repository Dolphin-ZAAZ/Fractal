document.addEventListener('DOMContentLoaded', () => {
    let mouseX = 0, mouseY = 0;
    
    const menuItems = [
        { text: 'Add Chat Box', action: (x,y) => addWidget(x,y, 'ChatWidget')},
        { text: 'Add Text Box', action: (x,y) => addWidget(x,y, 'BaseWidget') },
        { text: 'Add Code Box', action: (x,y) => addWidget(x,y, 'CodeWidget') },
        { text: 'Clear Canvas', action: () => clearCanvas() }
    ];

    async function addWidget(x, y, widgetType) {
        const widget = new widgetTypes[widgetType]["type"](x, y, widgetType.type, 400, 300, 80, "", true, actionLog.length);
        addAction(actionTypes.add, widget, {position: {x:x, y:y}, widgetType});
        await saveData();
    }

    function createContextMenu(items) {
        const contextMenu = document.getElementById('context-menu');
        const menuList = contextMenu.querySelector('.context-menu-list');

        menuList.innerHTML = ''; // Clear existing items

        items.forEach(item => {
            const menuItem = document.createElement('li');
            menuItem.className = 'context-menu-item';
            menuItem.textContent = item.text;
            menuItem.addEventListener('click', () => item.action(mouseX, mouseY));
            menuList.appendChild(menuItem);
        });

        return contextMenu;
    }

    function showContextMenu(event) {
        event.preventDefault();

        mouseX = event.pageX; // Capture mouse position
        mouseY = event.pageY;

        const contextMenu = createContextMenu(menuItems);
        contextMenu.style.left = `${event.pageX}px`;
        contextMenu.style.top = `${event.pageY}px`;
        contextMenu.style.display = 'block';

        document.addEventListener('click', hideContextMenu);
    }

    function hideContextMenu() {
        const contextMenu = document.getElementById('context-menu');
        contextMenu.style.display = 'none';
        document.removeEventListener('click', hideContextMenu);
    }

    document.addEventListener('contextmenu', showContextMenu);
});