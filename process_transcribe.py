# process the transcription to get the text and speaker
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

      # check if the speaker has changed
      if current_speaker is not None and current_speaker != speaker_number:
        # add the previous sentence
        processed_data.append({"text": current_text.strip(), "speaker": current_speaker})
        current_text = ""

      # update the current speaker  
      current_speaker = speaker_number
      current_text += word_info["word"] + " "

  # add the last sentence
  if current_text:
    processed_data.append({"text": current_text.strip(), "speaker": current_speaker})

  return processed_data