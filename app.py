from flask import Flask, render_template, jsonify
import os
import json
import utility_functions as uf

app = Flask(__name__)

@app.route('/')
def index():
    working_dir = os.path.dirname(os.path.abspath(__file__))
    css_dir = os.path.join(app.static_folder, 'CSS')  # Path to your CSS directory
    css_paths = []
    css_urls = []
    for root, dirs, files in os.walk(css_dir):
        for file in files:
            if file.endswith('.css'):
                css_paths.append(os.path.join(root, file))
    for path in css_paths:
        path.replace(working_dir, '\\')
        path = path.replace(working_dir, '')
        path = path.replace('\\', '/')
        css_urls.append(path)
    js_dir = os.path.join(app.static_folder, 'JavaScript')  # Path to your JavaScript directory
    js_paths = []
    js_urls = []
    for root, dirs, files in os.walk(js_dir):
        for file in files:
            if file.endswith('.js'):
                js_paths.append(os.path.join(root, file))
    for path in js_paths:
        path.replace(working_dir, '\\')
        path = path.replace(working_dir, '')
        path = path.replace('\\', '/')
        js_urls.append(path)
    print(js_urls)
    return render_template('canvas.html', css_files=css_urls, js_files=js_urls)

@app.route('/data/class-map')
def class_map():
    json_path = os.path.join(app.static_folder, 'JSON', 'classMap.json')
    with open(json_path) as json_file:
        data = json.load(json_file)
    return jsonify(data)

if __name__ == '__main__':
    app.run(port=8001, debug=True)