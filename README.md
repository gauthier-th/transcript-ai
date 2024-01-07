# Transcript AI

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

Copy the `.env.example` file to `.env` and fill in the values.

## Usage

```bash
python3 main.py
```