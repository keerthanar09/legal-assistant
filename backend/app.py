import os
import re
import pdfplumber
from docx import Document
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def extract_text_from_file(file_path):
    text = ""
    ext = file_path.lower().split('.')[-1]
    if ext == "pdf":
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                text += page.extract_text() or ""
    elif ext == "docx":
        doc = Document(file_path)
        for para in doc.paragraphs:
            text += para.text + "\n"
    elif ext == "txt":
        with open(file_path, "r", encoding="utf-8") as f:
            text = f.read()
    else:
        raise ValueError("Unsupported file format. Use .pdf, .docx, or .txt")
    return text

def clean_and_structure(text):
    return {"extracted_text": text.strip()}

@app.route("/api/parse", methods=["POST"])
def parse_document():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    file = request.files["file"]
    filename = file.filename
    save_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(save_path)
    try:
        extracted_text = extract_text_from_file(save_path)
        structured = clean_and_structure(extracted_text)
        print(structured)
        return jsonify(structured)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/summarize", methods=["POST"])
def summarizer():
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200 
    url = "https://legalsummarizer-138485278829.us-central1.run.app/summarize/"
    data = request.get_json()
    if not data or "extracted_text" not in data:
        return jsonify({"error": "No extracted_text provided"}), 400
    extracted_text = data["extracted_text"]
    try:
        response = requests.post(url, json={"text": extracted_text})
        summary = response.json()
        return jsonify(summary)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
