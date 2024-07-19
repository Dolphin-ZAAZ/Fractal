import json
import os
import datetime

data_path = os.getcwd() + '/data'
saved_messages_path = data_path + '/saved_messages.json'
local_storage_path = data_path + '/local_storage.json'

def checkIfStorageExists(local_storage_path):
    if not os.path.exists(local_storage_path):
        with open(local_storage_path, 'w') as f:
            json.dump([], f)
    if not os.path.exists(saved_messages_path):
        with open(saved_messages_path, 'w') as f:
            json.dump([], f)

checkIfStorageExists(local_storage_path)
        
def get_local_storage():
    checkIfStorageExists(local_storage_path)
    with open(local_storage_path, 'r') as f:
        return json.load(f)
    
def set_local_storage(value):
    checkIfStorageExists(local_storage_path)
    with open(local_storage_path, 'w') as f:
        json.dump(value, f)
    

def get_past_messages(num_messages, id):
    past_messages = []
    checkIfStorageExists(local_storage_path)
    with open(saved_messages_path, 'r') as f:  # Open the file in read mode
        messages = json.load(f)
    for message in messages:
        if message['chat_widget_id'] == id:
            past_messages.append({'role' : 'user', 'content' : message['message']})
            past_messages.append({'role' : 'assistant', 'content' : message['response']})
    return past_messages[-num_messages:]

def add_to_memory(message, formatted_response, chat_widget_id):
    checkIfStorageExists(local_storage_path)
    added_message = {
        'message': message,
        'response': formatted_response,
        'chat_widget_id': chat_widget_id,
        'timestamp': str(datetime.datetime.now())
    }
    with open(saved_messages_path, 'r') as f:  # Open the file to read existing data
        existing_messages = json.load(f)
    existing_messages.append(added_message)  # Add the new message to the list
    with open(saved_messages_path, 'w') as f:  # Open the file in write mode to update
        json.dump(existing_messages, f)
    
def get_memory_history():
    checkIfStorageExists(local_storage_path)
    past_messages = get_past_messages(5)
    user_messages = []
    ai_responses = []
    for message in past_messages:
        user_messages.append(message['message'])
        ai_responses.append(message['response'])
    return user_messages, ai_responses

def delete_memory(id, saved_messages_path):
    checkIfStorageExists(local_storage_path)
    # Read the existing data
    with open(saved_messages_path, 'r') as f:
        memories = json.load(f)
    
    # Create a new list excluding the memory to delete
    updated_memories = [memory for memory in memories if memory['chat_widget_id'] != id]
    
    # Write the updated list back to the file
    with open(saved_messages_path, 'w') as f:
        json.dump(updated_memories, f)