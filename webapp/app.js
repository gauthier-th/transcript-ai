function getColorForSpeaker(speakerId) {
	// const colors = ['bg-red-300', 'bg-yellow-300', 'bg-blue-300', 'bg-green-300', 'bg-purple-300'];
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
  catch {
    console.error('Erreur lors de la transcription du fichier audio : ', err);
    alert("Erreur lors de la transcription du fichier audio");
  }
});

document.getElementById('copyButton').addEventListener('click', () => {
  const transcriptionText = document.getElementById('transcriptionText').innerText;

  if (transcriptionText) {
    try {
      navigator.clipboard.writeText(transcriptionText)
      console.log('Texte copié avec succès !');
      const copyBtn = document.getElementById('copyButton');
      copyBtn.innerHTML = '<i class="fas fa-check"></i>';

      setTimeout(() => {
        copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
      }, 1000);
    }
    catch {
      console.error('Erreur lors de la copie du texte : ', err);
    }
  }
});

document.getElementById('summarizeButton').addEventListener('click', () => {
  console.log("Demande de résumé de la transcription");
  const container = document.getElementById('transcriptionText');
  container.innerHTML = '';
  container.appendChild(createInformationMessage('Résumé de la transcription'));
});

document.getElementById('createTasksButton').addEventListener('click', () => {
  console.log("Demande de création d'une liste de tâches");
  const container = document.getElementById('transcriptionText');
  container.innerHTML = '';
  container.appendChild(createInformationMessage('Liste de tâches'));
});

document.getElementById('resetButton').addEventListener('click', () => {
  console.log("Demande de réinitialisation de la transcription");
  const container = document.getElementById('transcriptionText');
  container.innerHTML = '';
  container.appendChild(createInformationMessage('En attente de la prochaine transcription'));
});