// Utility function to capitalize the first letter of a string
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

function isClickInsideElementWithClass(event, className) {
    let currentNode = event.target;
    while (currentNode) {
        if (currentNode.classList && currentNode.classList.contains(className)) {
            return true;
        }
        currentNode = currentNode.parentNode;
    }
    return false;
}