from flask import Flask, request
from werkzeug.utils import secure_filename
import os
import json
from dotenv import load_dotenv
from openai import OpenAI

from transcribe import transcribe
from process_transcribe import process_transcribe

load_dotenv()

app = Flask(__name__,
            static_url_path='', 
            static_folder='./webapp',
            template_folder='./webapp')

client = OpenAI()


file_processing = False

@app.route('/')
def index():
  return app.send_static_file('index.html')

@app.route('/api/transcribe', methods=['POST'])
def process():
  global file_processing
  if file_processing:
    return "File already processing", 400
  print(request.files)
  if 'audio' in request.files:
    file_processing = True

    file = request.files['audio']
    filename = secure_filename(file.filename)

    num_files = len(os.listdir("uploads"))
    if not os.path.exists(str(num_files)):
      os.makedirs(os.path.join("uploads", str(num_files)))
    extension = filename.split(".")[-1]
    filename = os.path.join("uploads", str(num_files), "audio." + extension)
    file.save(filename)
    
    # convert to wav if needed
    if extension != "wav":
      original_filename = filename
      filename = filename.replace(extension, "wav")
      # convert to wav, 48000 Hz, 16-bit, mono
      os.system("ffmpeg -i " + original_filename + " -acodec pcm_s16le -ac 1 -ar 48000 " + filename)

    print("Transcribing", filename)
    data = transcribe(filename)
    data_json = json.dumps(data, ensure_ascii=False)

    f = open(os.path.join("uploads", str(num_files), "result.json"), "w")
    f.write(data_json)
    f.close()

    file_processing = False

    return process_transcribe(data)
  else:
    return "No file uploaded", 400 

@app.route('/api/summarize')
def summarize():
  num_files = len(os.listdir("uploads"))
  f = open(os.path.join("uploads", str(num_files - 1), "result.json"), "r")
  data = json.loads(f.read())
  f.close()

  transcription = process_transcribe(data)

  prompt = "Tu es un assistant virtuel qui aide les gens à résumer des conversations. Tu dois résumer la conversation. N'utilise pas le terme \"Personne X\" pour désigner les interlocuteurs. Au début du résumé, tu dois indiquer de quel type de conversation il s'agit (interview, conversation entre amis, etc.) et tu dois aussi indiquer le nombre de personnes qui participent à la conversation. Marque ces informations là de cette façon : \"Résumé de l'interview/conversation/etc. avec X interlocuteurs :\n\n\""
  conversation = "\n".join([("Personne " + str(x["speaker"]) + " : " + x["text"]) for x in transcription])

  chat_completion = client.chat.completions.create(
    messages=[
      {
        "role": "system",
        "content": prompt
      },
      {
        "role": "user",
        "content": conversation
      }
    ],
    model="gpt-3.5-turbo-1106",
  )

  summary = chat_completion.choices[0].message.content

  return { "summary": summary }

@app.route('/api/createTaskList')
def createTaskList():
  num_files = len(os.listdir("uploads"))
  f = open(os.path.join("uploads", str(num_files - 1), "result.json"), "r")
  data = json.loads(f.read())
  f.close()

  transcription = process_transcribe(data)

  prompt = "Tu es un assistant virtuel qui aide les gens à créer des listes de tâches. Tu dois créer une liste de tâches à partir de la conversation si la conversation indique des tâches à réaliser à chaque personne, si ce n'est pas le cas, réponds que la conversation ne donne pas de tâches à réaliser. N'utilise pas le terme \"Personne X\" pour désigner les interlocuteurs. Au début de la liste, tu dois indiquer de quel type de conversation il s'agit (interview, conversation entre amis, etc.) et tu dois aussi indiquer le nombre de personnes qui participent à la conversation. Marque ces informations là de cette façon : \"Liste de tâches à partir de l'interview/conversation/etc. avec X interlocuteurs :\n\n\""
  conversation = "\n".join([("Personne " + str(x["speaker"]) + " : " + x["text"]) for x in transcription])

  chat_completion = client.chat.completions.create(
    messages=[
      {
        "role": "system",
        "content": prompt
      },
      {
        "role": "user",
        "content": conversation
      }
    ],
    model="gpt-3.5-turbo-1106",
  )

  taskList = chat_completion.choices[0].message.content

  return { "taskList": taskList }


if __name__ == '__main__':
  app.run(debug=True, host='0.0.0.0', port=5000)