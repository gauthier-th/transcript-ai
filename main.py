from flask import Flask, request
from werkzeug.utils import secure_filename
import os

app = Flask(__name__,
            static_url_path='', 
            static_folder='./webapp',
            template_folder='./webapp')

file_processing = False

@app.route('/')
def index():
  return app.send_static_file('index.html')

@app.route('/api/transcribe', methods=['POST'])
def process():
  if file_processing:
    return "File already processing", 400
  print(request.files)
  if 'audio' in request.files:
    file = request.files['audio']
    filename = secure_filename(file.filename)
    file.save(os.path.join("uploads", filename))
    return "File uploaded successfully"
  else:
    return "No file uploaded", 400 


if __name__ == '__main__':
  app.run(debug=True, host='0.0.0.0', port=5000)