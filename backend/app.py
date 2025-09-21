import os
import re
import pdfplumber
from docx import Document
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import asyncio
import argparse
import json
from vertexai.generative_models import GenerativeModel, GenerationConfig
import vertexai
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from google.api_core.exceptions import ResourceExhausted, ServiceUnavailable
import warnings
from dotenv import load_dotenv
from pydantic import BaseModel
import uvicorn



app = Flask(__name__)
CORS(app)
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = os.path.join(
    os.path.dirname(__file__), "service-account.json"
)


#----------------Document Parsing----------------#
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

#----------------Summarization----------------#
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
    
#----------------Negotiation Analysis----------------#
load_dotenv()
warnings.filterwarnings("ignore")

GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.0-flash-001")
PROJECT_ID = os.getenv("GCP_PROJECT_ID", "gahld-469906")
LOCATION = os.getenv("GCP_REGION", "global")

# Initialize Vertex AI
def init_vertex_ai():
    try:
        vertexai.init(project=PROJECT_ID, location=LOCATION)
    except Exception:
        vertexai.init(project=PROJECT_ID, location="asia-east1")  # Fallback region

init_vertex_ai()
print("Using project:", os.getenv("PROJECT_ID"))
@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=1, max=10),
    retry=retry_if_exception_type((ResourceExhausted, ServiceUnavailable))
)
async def process_chunk(chunk, role, jurisdiction, model, is_final_pass=False, total_clauses=0):
    if is_final_pass and total_clauses > 50:
        prompt = (
            f"As a {role} in {jurisdiction}, extract concise numbered clauses from the legal text. Club short clauses under the same topic (e.g., liability, penalties, obligations) into a single clause with combined text. "
            f"Assess their risk (low, medium, high, very high). Very high risk includes clauses with severe financial, legal, or operational impact (e.g., unlimited liability, strict penalties). "
            f"Return a JSON list of objects with: 'clause_number' (string, use the first number if clubbing), 'clause_text' (string, concise and combined for same-topic clauses), "
            f"'clause_risk' (low, medium, high, very high), 'negotiation' ('NIL' for low/medium/high risk, concise negotiation suggestion for very high risk). Ensure valid JSON output. "
            f'Example: [{{"clause_number": "1", "clause_text": "Combined liability clauses...", "clause_risk": "very high", "negotiation": "Limit liability..."}}]. '
            f"Text: {chunk}"
        )
    else:
        prompt = (
            f"As a {role} in {jurisdiction}, extract concise numbered clauses from the legal text. Club short clauses under the same topic (e.g., liability, penalties, obligations) into a single clause with combined text. "
            f"Assess their risk (low, medium, high, very high). Very high risk includes clauses with severe financial, legal, or operational impact (e.g., unlimited liability, strict penalties). "
            f"Return a JSON list of objects with: 'clause_number' (string, use the first number if clubbing), 'clause_text' (string, concise and combined for same-topic clauses), "
            f"'clause_risk' (low, medium, high, very high), 'negotiation' ('NIL' for all risks). Ensure valid JSON output. "
            f'Example: [{{"clause_number": "1", "clause_text": "Combined liability clauses...", "clause_risk": "very high", "negotiation": "NIL"}}]. '
            f"Text: {chunk}"
        )
    try:
        response = await model.generate_content_async(
            prompt,
            generation_config=GenerationConfig(max_output_tokens=4000, temperature=0.2),
            stream=True
        )
        full_response = ""
        async for part in response:
            full_response += part.text
        # Clean response: Remove markdown, extra whitespace
        cleaned_response = re.sub(r'```json\n|```|\n\s*\n', '', full_response).strip()
        try:
            clauses = json.loads(cleaned_response)
            return clauses
        except json.JSONDecodeError:
            # Fallback: Write chunk as a single clause
            return[ {
                "clause_number": "unknown",
                "clause_text": chunk[:1000],  # Truncate for safety
                "clause_risk": "medium",
                "negotiation": "NIL"
            }]
            
    except Exception as e:
        return [{"error": f"Processing error: {str(e)}"}]

async def process_document(extracted_json, role, jurisdiction, chunk_size=1000):
    model = GenerativeModel(GEMINI_MODEL)
    text = extracted_json.get("text", "")
    if not text:
        return [{"error": "No text provided"}]

    chunks = [text[i:i+chunk_size] for i in range(0, len(text), chunk_size)]
    all_clauses = []

    for chunk in chunks:
        clauses = await process_chunk(chunk, role, jurisdiction, model, is_final_pass=False)
        all_clauses.extend(clauses)

    total_clauses = len([c for c in all_clauses if "error" not in c])
    if total_clauses > 50:
        very_high_clauses = []
        for chunk in chunks:
            clauses = await process_chunk(
                chunk, role, jurisdiction, model,
                is_final_pass=True, total_clauses=total_clauses
            )
            very_high_clauses.extend([c for c in clauses if c.get("clause_risk") == "very high"])

        very_high_clauses = sorted(very_high_clauses, key=lambda x: x["clause_number"])[:50]
        other_clauses = [
            c for c in all_clauses if c.get("clause_risk") != "very high" or c in very_high_clauses
        ]
        return other_clauses + very_high_clauses

    return all_clauses


@app.route("/api/negotiation", methods=["POST"])
def analyze():
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200
    data = request.json
    role = data.get("role")
    jurisdiction = data.get("jurisdiction")
    text = data.get("text")

    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    result = loop.run_until_complete(
        process_document({"text": text}, role, jurisdiction)
    )
    return jsonify({"clauses": result})

if __name__ == "__main__":
    app.run(debug=True)


