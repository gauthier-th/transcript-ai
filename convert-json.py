import json

# Spécifiez le chemin d'accès à votre fichier JSON
chemin_fichier_json = 'result-test.json'

# Fonction pour lire le fichier JSON
def lire_json(chemin):
    with open(chemin, 'r', encoding='utf-8') as fichier:
        return json.load(fichier)

# Fonction pour traiter le JSON
def process_json(data):
    processed_data = []
    current_speaker = None
    current_text = ""

    for entry in data:
        for word_info in entry.get("words", []):
            speaker_id = word_info.get("speaker", "SPEAKER_00")
            speaker_number = int(speaker_id.replace("SPEAKER_", ""))
            
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

# Lire le fichier JSON
data = lire_json(chemin_fichier_json)

# Appel de la fonction et affichage du résultat
processed_json = process_json(data)
print(json.dumps(processed_json, indent=2, ensure_ascii=False))

# Save to JSON file
f = open("result-converted.json", "w")
f.write(json.dumps(processed_json, indent=2, ensure_ascii=False))
f.close()
