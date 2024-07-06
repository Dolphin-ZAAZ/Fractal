import os

def make_js_bundle(app):
    working_dir = os.path.dirname(os.path.abspath(__file__))
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

    # Generate import statements
    import_statements = [f"import '{url}';" for url in js_urls]

    # Write import statements to index.js
    index_file_path = os.path.join(js_dir, 'index.js')
    with open(index_file_path, 'w') as index_file:
        index_file.write('\n'.join(import_statements))

    print(f'index.js file created at {index_file_path}')
