import os

for root, dirs, files in os.walk('static/JavaScript/Utility/Tools/codemirror/modes'):
    for file in files:
        if file.endswith('.js'):
            print(file)
