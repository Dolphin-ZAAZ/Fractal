document.addEventListener('DOMContentLoaded', () => {
    window.addEventListener('load', async () => {
        await loadData();
    });

    window.addEventListener('beforeunload', async () => {   
        await saveData();
    });

});

async function loadData() {
    try {
        localStorage.clear();
        await getLocalStorage(); // Assuming this is an async function
        getCanvasStyle(); // Modify this function to be async if necessary
        getWidgets(); // Modify this function to be async if necessary
        actionLog = await getActionLog(); // Modify this function to be async if necessary
    } catch (error) {
        console.error("Failed to load data:", error);
    }
}

async function saveData() {
    setCanvasStyle();
    setWidgets();
    saveActionLog(actionLog);
    setLocalStorage();
}

async function getLocalStorage() {
    await fetch('/data/get-local-storage')
    .then(response => response.json())
    .then(data => {
        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                localStorage.setItem(key, data[key]);
                }
            }
        })
        .catch(error => console.error('Error:', error));
    }
    
function setLocalStorage() {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        data[key] = localStorage.getItem(key);
    }

    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    navigator.sendBeacon('/data/set-local-storage', blob);
}