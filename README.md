# Transcript AI

A web app that uses AI to generate transcripts for audio files, using [WhisperX](https://github.com/m-bain/whisperX) and [OpenAI's GPT-3](https://openai.com/blog/chatgpt).

## Overview

Home page                                                                                                        |  Transcription result
-----------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------
![](https://github.com/gauthier-th/transcript-ai/assets/37781713/cc578a6b-2789-4452-8749-81d3b0180fd4)           |  ![](https://github.com/gauthier-th/transcript-ai/assets/37781713/ee4ba483-cc86-4252-885d-187dd0ddf86e)
Transcription summary                                                                                            |  ChatGPT conversation
![](https://github.com/gauthier-th/transcript-ai/assets/37781713/a917d550-780a-4738-b74a-561eb505a92c)           |  ![](https://github.com/gauthier-th/transcript-ai/assets/37781713/70a32f0e-3d6c-4336-ad79-1a0984bb818c)

## Requirements

- Python 3.11
- ffmpeg
- CUDA (optional)

## Installation

Create a virtual environment and activate it:
```bash
python3 -m venv .venv
source .venv/bin/activate
```

Install the libraries:
```bash
pip install git+https://github.com/m-bain/whisperx.git torch flask openai
```

Copy the `.env.example` file to `.env` and fill in the values:
- `OPENAI_API_KEY`: Your OpenAI API key
- `HUGGINGFACE_TOKEN`: Your HuggingFace token

## Usage

```bash
python3 main.py
```