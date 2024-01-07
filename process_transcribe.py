# Fonction pour traiter le JSON
def process_transcribe(data):
    processed_data = []
    current_speaker = None
    current_text = ""

    for entry in data:
        for word_info in entry.get("words", []):
            speaker_id = word_info.get("speaker", "SPEAKER_-1")
            speaker_number = int(speaker_id.replace("SPEAKER_", ""))

            if speaker_number == -1:
                current_text += word_info["word"] + " "
                continue
            
            # Vérifier si le locuteur a changé
            if current_speaker is not None and current_speaker != speaker_number:
                # Ajouter la phrase précédente au résultat
                processed_data.append({"text": current_text.strip(), "speaker": current_speaker})
                current_text = ""

            # Mettre à jour le locuteur actuel et ajouter le mot au texte
            current_speaker = speaker_number
            current_text += word_info["word"] + " "

    # Ajouter la dernière phrase s'il y en a une
    if current_text:
        processed_data.append({"text": current_text.strip(), "speaker": current_speaker})

    return processed_data