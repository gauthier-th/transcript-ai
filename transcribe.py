import torch
import whisperx
import gc
import time

device = "cuda" # "cpu" or "cuda"
batch_size = 32 # reduce if low on GPU mem
compute_type = "float16" # change to "int8" if low on GPU mem or CPU (may reduce accuracy)


def transcribe(filename):
  init_time = time.time()

  # 1. Transcribe with original whisper (batched)
  # model = whisperx.load_model("small", device, compute_type=compute_type)
  audio = whisperx.load_audio(filename)

  torch.cuda.empty_cache()
  model = whisperx.load_model("large-v3", device, compute_type=compute_type)
  result = model.transcribe(audio, batch_size=batch_size, language="fr", print_progress=True)

  # delete model if low on GPU resources
  # import gc; gc.collect(); torch.cuda.empty_cache(); del model

  # 2. Align whisper output
  model_a, metadata = whisperx.load_align_model(language_code=result["language"], device=device)
  result = whisperx.align(result["segments"], model_a, metadata, audio, device, return_char_alignments=False)

  # delete model if low on GPU resources
  # import gc; gc.collect(); torch.cuda.empty_cache(); del model_a

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

  end_time = time.time()
  print("Total time:", round(end_time - init_time) , "s")

  return result["segments"]