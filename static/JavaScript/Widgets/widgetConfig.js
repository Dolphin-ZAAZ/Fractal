let widgetTypes = {};

document.addEventListener('DOMContentLoaded', () => {
    widgetTypes = {
        'BaseWidget': { 
            "type" : BaseWidget, 
            minSize : 110,
        },
        'CodeWidget': {
            "type" : CodeWidget, 
            minSize : 110,
        },
        'ChatWidget': {
            "type" : ChatWidget, 
            minSize : 110,
        },
    }
});