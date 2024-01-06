document.getElementById('submitAudio').addEventListener('click', function() {
    var audioFile = document.getElementById('audioFile').files[0];

	if (!audioFile) {
		alert("Veuillez sélectionner un fichier audio");
		return;
	}

	if (!audioFile.type.startsWith('audio/')) {
		alert("Veuillez sélectionner un fichier audio");
		return;
	}

    console.log("Fichier audio envoyé pour transcription : ", audioFile.name);
});

document.getElementById('copyButton').addEventListener('click', function() {
    const transcriptionText = document.getElementById('transcriptionText').innerText;
    
    if (transcriptionText) {
        navigator.clipboard.writeText(transcriptionText)
            .then(() => {
                console.log('Texte copié avec succès !');
				const copyBtn = document.getElementById('copyButton');
				copyBtn.innerHTML = '<i class="fas fa-check"></i>';
			
				setTimeout(function() {
					copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
				}, 1000);
			})
            .catch(err => {
                console.error('Erreur lors de la copie du texte : ', err);
            });
    }
});

document.getElementById('summarizeButton').addEventListener('click', function() {

    console.log("Demande de résumé de la transcription");
});

document.getElementById('createTasksButton').addEventListener('click', function() {
	
    console.log("Demande de création d'une liste de tâches");
});
