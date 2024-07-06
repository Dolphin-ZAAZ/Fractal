let languageMap = {};
let languageNames = [];

fetch('/data/class-map')
.then(response => response.json())
.then(data => {
    languageMap = data;
    languageNames = Object.entries(data).map(([key, value]) => { return key; });
    languageOptions = Object.entries(data).map(([key, value]) => {
        return `<option value="${value}">${capitalizeFirstLetter(key)}</option>`;
    }).join('');
})
.catch(error => {
    console.error('Error fetching classMap.json:', error);
});

const defaultLanguage = 'python';