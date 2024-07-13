class ContextMenu {
    constructor() {
        this.mouseX = 0;
        this.mouseY = 0;
        this.menuItems = [
            { text: 'Add Chat Box', action: (x, y) => widgetManager.addWidget(x, y, 'ChatWidget') },
            { text: 'Add Text Box', action: (x, y) => widgetManager.addWidget(x, y, 'BaseWidget') },
            { text: 'Add Code Box', action: (x, y) => widgetManager.addWidget(x, y, 'CodeWidget') },
            { text: 'Clear Canvas', action: () => widgetManager.clearCanvas() } // Assuming clearCanvas() is not async
        ];
        this.showContextMenu = this.showContextMenu.bind(this);
        this.hideContextMenu = this.hideContextMenu.bind(this);
        this.addEvents();
    }

    createContextMenu(items) {
        const contextMenu = document.getElementById('context-menu');
        const menuList = contextMenu.querySelector('.context-menu-list');

        menuList.innerHTML = ''; // Clear existing items

        items.forEach(item => {
            const menuItem = document.createElement('li');
            menuItem.className = 'context-menu-item';
            menuItem.textContent = item.text;
            menuItem.addEventListener('click', () => item.action(this.mouseX, this.mouseY));
            menuList.appendChild(menuItem);
        });

        return contextMenu;
    }

    showContextMenu(event) {
        event.preventDefault();

        this.mouseX = event.pageX; // Capture mouse position
        this.mouseY = event.pageY;

        const contextMenu = this.createContextMenu(this.menuItems);
        contextMenu.style.left = `${event.pageX}px`;
        contextMenu.style.top = `${event.pageY}px`;
        contextMenu.style.display = 'block';
        document.addEventListener('click', this.hideContextMenu);
    }

    hideContextMenu() {
        const contextMenu = document.getElementById('context-menu');
        contextMenu.style.display = 'none';
        document.removeEventListener('click', this.hideContextMenu);
    }

    addEvents()
    {
        document.addEventListener('contextmenu', this.showContextMenu);
    }
}