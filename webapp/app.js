let transcriptionProcessed = false;

function getColorForSpeaker(speakerId) {
	const colors = ['#f0f0f0', '#e0f7fa', '#e8eaf6', '#f3e5f5', '#f1f8e9'];
	return colors[speakerId % colors.length];
}

function createInformationMessage(message) {
	const div = document.createElement('div');
	const logo = document.createElement('div');
	logo.innerHTML = 'ℹ️';
	logo.style.cssText = 'margin-right: 10px; font-size: 24px;';
	div.appendChild(logo);
	const text = document.createElement('div');
	text.textContent = message;
	text.style.cssText = 'font-size: 16px;';
	div.appendChild(text);
	div.style.cssText = `
	  display: flex;
	  align-items: center;
	  justify-content: center;
	  margin: 20px auto;
	  padding: 20px;
	  border-radius: 10px;
	  background-color: #f0f0f0;
	  box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.16);
	  max-width: 400px;
	`;
	return div;
}

document.getElementById('submitAudio').addEventListener('click', async () => {
  const audioFile = document.getElementById('audioFile').files[0];

  if (!audioFile) {
    alert("Veuillez sélectionner un fichier audio");
    return;
  }

  if (!audioFile.type.startsWith('audio/')) {
    alert("Veuillez sélectionner un fichier audio");
    return;
  }

  console.log("Fichier audio envoyé pour transcription : ", audioFile.name);

  document.getElementById("modal-loading").style.display = "flex";

  try {
    const formData = new FormData();
    formData.append('audio', audioFile);
    const res = await fetch('/api/transcribe', {
      method: 'POST',
      body: formData,
    });
	if (res.ok) {
		const jsonData = await res.json();
		console.log("Transcription du fichier audio : ", jsonData);
		const container = document.getElementById('transcriptionText');
		container.innerHTML = '';
    transcriptionProcessed = true;

    document.getElementById('conversation').classList.add('hidden');
  
		jsonData.forEach((entry, index) => {
		  const div = document.createElement('div');
		  div.textContent = entry.text;
		  const bgColorClass = getColorForSpeaker(entry.speaker);
		  div.style.cssText = `
			border-radius: 20px; 
			padding: 10px 15px; 
			margin-bottom: 10px; 
			box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.16); 
			background-color: ${bgColorClass}; 
			max-width: 60%; 
			align-self: ${index % 2 === 0 ? 'flex-start' : 'flex-end'};
		  `;
  
		  container.appendChild(div);
		});
	}
    if (!res.ok) {
      throw new Error(`Erreur lors de la transcription du fichier audio : ${res.status}`);
    }
  }
  catch (err) {
    console.error('Erreur lors de la transcription du fichier audio : ', err);
    alert("Erreur lors de la transcription du fichier audio");
  }

  document.getElementById("modal-loading").style.display = "none";
});

document.getElementById('summarizeButton').addEventListener('click', async () => {
  if (!transcriptionProcessed) return;

  document.getElementById('conversation').classList.add('hidden');

  console.log("Demande de résumé de la transcription");
  const container = document.getElementById('transcriptionText');
  container.innerHTML = '';
  container.appendChild(createInformationMessage('Résumé de la transcription'));

  const div = document.createElement('div');
  div.textContent = "Écris un résumé de la transcription que je t'ai envoyé";
  div.style.cssText = `
    border-radius: 20px;
    padding: 10px 15px;
    margin-bottom: 10px;
    box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.16);
    background-color: #e0f7fa;
    max-width: 60%;
    align-self: flex-end;
  `;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;

  try {
    const res = await fetch('/api/summarize');
    if (res.ok) {
      const jsonData = await res.json();
      console.log("Résumé de la transcription : ", jsonData);
      const div = document.createElement('div');
      div.textContent = jsonData.summary;
      div.style.cssText = `
        border-radius: 20px; 
        padding: 10px 15px; 
        margin-bottom: 10px; 
        box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.16); 
        background-color: #f0f0f0; 
        max-width: 60%; 
        align-self: flex-start;
      `;
      container.appendChild(div);
      container.scrollTop = container.scrollHeight;

      const conversationContainer = document.getElementById('conversation');
      conversationContainer.classList.remove('hidden');
      const textarea = conversationContainer.querySelector('textarea');
      textarea.focus();
    }
  }
  catch (err) {
    console.error('Erreur lors de la génération du résumé : ', err);
    alert("Erreur lors de la génération du résumé");
  }
});

document.getElementById('createConversation').addEventListener('click', async () => {
  if (!transcriptionProcessed) return;

  console.log("Conversation avec ChatGPT");
  const container = document.getElementById('transcriptionText');
  container.innerHTML = '';
  container.appendChild(createInformationMessage('Conversation avec ChatGPT'));

  const conversationContainer = document.getElementById('conversation');
  conversationContainer.classList.remove('hidden');
  const textarea = conversationContainer.querySelector('textarea');
  textarea.focus();
});

async function textareaKeydown(e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    const value = document.querySelector('#conversation textarea').value;
    console.log("Demande de réponse à ChatGPT : ", value);
    document.querySelector('#conversation textarea').value = '';

    const container = document.getElementById('transcriptionText');
    const div = document.createElement('div');
    div.textContent = value;
    div.style.cssText = `
      border-radius: 20px;
      padding: 10px 15px;
      margin-bottom: 10px;
      box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.16);
      background-color: #e0f7fa;
      max-width: 60%;
      align-self: flex-end;
    `;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: value }),
      });
      const data = await res.json();
      console.log("Réponse de ChatGPT : ", data.response);

      const container = document.getElementById('transcriptionText');
      const div = document.createElement('div');
      div.textContent = data.response;
      div.style.cssText = `
        border-radius: 20px; 
        padding: 10px 15px; 
        margin-bottom: 10px; 
        box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.16); 
        background-color: #f0f0f0; 
        max-width: 60%; 
        align-self: flex-start;
      `;
      container.appendChild(div);
      container.scrollTop = container.scrollHeight;
    }
    catch (err) {
      console.error('Erreur lors de la réponse de ChatGPT : ', err);
      alert("Erreur lors de la réponse de ChatGPT");
    }
  }
}

document.getElementById('resetButton').addEventListener('click', () => {
  console.log("Demande de réinitialisation de la transcription");
  const container = document.getElementById('transcriptionText');
  container.innerHTML = '';
  container.appendChild(createInformationMessage('Bienvenue sur Transcript AI'));
  const audioInput = document.getElementById('audioFile');
  audioInput.value = '';
  transcriptionProcessed = false;
  document.getElementById('conversation').classList.add('hidden');

  document.querySelector('#conversation textarea').value = '';

  const div1 = document.createElement('div');
  div1.textContent = "Transcript AI est un outil de transcription automatique de vos fichiers audio. Il vous permet de gagner du temps !";
  div1.style.cssText = `
    border-radius: 20px;
    padding: 10px 15px;
    margin-bottom: 10px;
    box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.16);
    background-color: #f0f0f0;
    max-width: 60%;
    align-self: flex-start;
  `;
  container.appendChild(div1);

  const div2 = document.createElement('div');
  div2.textContent = "Comment ça marche ?";
  div2.style.cssText = `
    border-radius: 20px;
    padding: 10px 15px;
    margin-bottom: 10px;
    box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.16);
    background-color: #e0f7fa;
    max-width: 60%;
    align-self: flex-end;
  `;
  container.appendChild(div2);

  const div3 = document.createElement('div');
  div3.textContent = "Importez votre fichier audio, puis cliquez sur le bouton \"Transcrire\". Une fois la transcription terminée, vous pourrez résumer le texte ou créer une liste de tâches.";
  div3.style.cssText = `
    border-radius: 20px;
    padding: 10px 15px;
    margin-bottom: 10px;
    box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.16);
    background-color: #f0f0f0;
    max-width: 60%;
    align-self: flex-start;
  `;
  container.appendChild(div3);

  container.scrollTop = container.scrollHeight;
});