document.addEventListener('DOMContentLoaded', () => {
    const menuItems = [
        { text: 'Option 1', action: () => alert('Option 1 clicked') },
        { text: 'Option 2', action: () => alert('Option 2 clicked') },
        { text: 'Option 3', action: () => alert('Option 3 clicked') }
    ];

    function createContextMenu(items) {
        const contextMenu = document.getElementById('context-menu');
        const menuList = contextMenu.querySelector('.context-menu-list');

        menuList.innerHTML = ''; // Clear existing items

        items.forEach(item => {
            const menuItem = document.createElement('li');
            menuItem.className = 'context-menu-item';
            menuItem.textContent = item.text;
            menuItem.addEventListener('click', item.action);
            menuList.appendChild(menuItem);
        });

        return contextMenu;
    }

    function showContextMenu(event) {
        event.preventDefault();

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