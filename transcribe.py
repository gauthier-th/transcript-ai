import torch
import whisperx
import gc
import time
import json

device = "cuda"
audio_file = "./audio-tests/xavier_niel_-_interview.wav"
batch_size = 16 # reduce if low on GPU mem
compute_type = "float16" # change to "int8" if low on GPU mem (may reduce accuracy)


init_time = time.time()


# 1. Transcribe with original whisper (batched)
# model = whisperx.load_model("small", device, compute_type=compute_type)
model = whisperx.load_model("large-v2", device, compute_type=compute_type)

# save model to local path (optional)
# model_dir = "/path/"
# model = whisperx.load_model("large-v2", device, compute_type=compute_type, download_root=model_dir)

audio = whisperx.load_audio(audio_file)
result = model.transcribe(audio, batch_size=batch_size, language="fr", print_progress=True)
# print(result["segments"]) # before alignment

# delete model if low on GPU resources
import gc; gc.collect(); torch.cuda.empty_cache(); del model

# 2. Align whisper output
model_a, metadata = whisperx.load_align_model(language_code=result["language"], device=device)
result = whisperx.align(result["segments"], model_a, metadata, audio, device, return_char_alignments=False)

# print(result["segments"]) # after alignment

# delete model if low on GPU resources
import gc; gc.collect(); torch.cuda.empty_cache(); del model_a

# 3. Assign speaker labels
diarize_model = whisperx.DiarizationPipeline(
  model_name='pyannote/speaker-diarization@2.1',
  use_auth_token="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",
  device=device
)

# add min/max number of speakers if known
diarize_segments = diarize_model(audio, min_speakers=2)
# diarize_model(audio, min_speakers=min_speakers, max_speakers=max_speakers)


result = whisperx.assign_word_speakers(diarize_segments, result)
# print(result["segments"]) # segments are now assigned speaker IDs


end_time = time.time()

print("Total time:", round(end_time - init_time) , "s")

# 4. Save to JSON file
f = open("result.json", "w")
f.write(json.dumps(result["segments"]))
f.close()