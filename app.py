from flask import Flask, render_template, jsonify, request
import os
import json
import utility_functions as uf
import inferrence_functions as infunc
import save_state as ss

app = Flask(__name__)

model = infunc.main_model

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

@app.route('/data/prism-map')
def prism_map():
    json_path = os.path.join(app.static_folder, 'JSON', 'prismMap.json')
    with open(json_path) as json_file:
        data = json.load(json_file)
    return jsonify(data)

@app.route('/chat/get-response', methods=['POST'])
def get_response():
    data = request.json
    user_input = data['user_input']
    chat_widget_id = data['chat_widget_id']
    response = process_input(user_input, chat_widget_id)
    return jsonify(response=response)

@app.route('/get-history', methods=['POST'])
def get_history():
    user_messages, ai_responses = ss.get_memory_history()
    return jsonify(user_messages=user_messages, ai_responses=ai_responses)

local_storage_data = {}

@app.route('/data/set-widget-storage', methods=['POST'])
def save_local_storage():
    global local_storage_data
    local_storage_data = json.loads(request.data) # Get the data sent from the client
    ss.set_local_storage(local_storage_data)  # Save the data to the local storage file
    return '', 204

@app.route('/data/get-widget-storage', methods=['GET'])
def load_local_storage():
    global local_storage_data
    local_storage_data = ss.get_local_storage()  # Load the local storage data from the file
    return jsonify(local_storage_data)  # Send the saved local storage data to the client

@app.route('/data/delete-memory', methods=['POST'])
def delete_memory():
    data = request.json
    chat_widget_id = data['chat_widget_id']
    ss.delete_memory(chat_widget_id)
    return '', 204

def process_input(message, chat_widget_id):
    global start_logging
    start_logging = True
    messages = ss.get_past_messages(5, chat_widget_id)
    preprompt = ""
    formatted_response = infunc.get_full_ai_response(messages, message, model, preprompt)
    web_response = formatted_response.replace("AI: ", "").replace("\n", "zxz")
    delayed_actions(message, formatted_response, chat_widget_id)
    return web_response

def delayed_actions(message, formatted_response, chat_widget_id):
    global start_logging
    ss.add_to_memory(message, formatted_response.replace("AI: ", ""), chat_widget_id)
    start_logging = False

if __name__ == '__main__':
    app.run(port=8001, debug=True)