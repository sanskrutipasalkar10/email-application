import os
import json
import uvicorn
import ollama
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="InboxIQ API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Prioritized list of Ollama models to try
MODELS_TO_TRY = ["qwen3-coder:480b-cloud", "qwen3-vl:235b-instruct-cloud", "qwen2.5-coder:7b"]

class EmailRequest(BaseModel):
    email_body: str
    attachment_text: Optional[str] = None

class ReplyRequest(BaseModel):
    email_body: str
    sender: str
    recommended_action: str

class ChatRequest(BaseModel):
    query: str

# --- MOCK DATA ---
EMAILS = [
    {
        "id": 1, "sender": "plant_manager@shanghai-mfg.com", 
        "subject": "CRITICAL: Hydraulic Press Failure Line 4", 
        "body": "Main hydraulic press on Line 4 has seized. Production is halted. We will miss the Tesla shipment on Friday if not fixed in 12 hours. Need immediate approval for emergency maintenance team ($15k cost).",
        "attachment_name": "Emergency_Quote_v2.pdf",
        "attachment_content": "OFFICIAL QUOTE: Shanghai Heavy Industry Repair. Item: Hydraulic Ram Replacement. Cost: $15,000 USD. Timeline: 12 Hours (Rush Service). Payment Terms: Immediate."
    },
    {
        "id": 2, "sender": "compliance@global-trade-watch.org", 
        "subject": "Customs Hold Notification: Shipment #9921", 
        "body": "Shipment #9921 (Semiconductor chips) is held at Rotterdam port due to missing Certificate of Origin. Demurrage charges start tomorrow at $2000/day. Please provide documents immediately.",
        "attachment_name": "Port_Authority_Notice.pdf",
        "attachment_content": "NOTICE OF SEIZURE: Container MSC-9921. Port of Rotterdam. Reason code: 404 (Missing Origin Documentation). Daily Storage Fee: $2,000.00 commencing 24-Oct."
    },
    {
        "id": 3, "sender": "procurement@raw-materials-inc.com", 
        "subject": "Price Force Majeure - Lithium", 
        "body": "Due to civil unrest in the mining region, we are declaring Force Majeure. Lithium prices will increase by 45% effective immediately for Q3 deliveries. Please confirm acceptance or we pause shipments."
    },
    {
        "id": 4, "sender": "demand_planning@internal-ops.com", 
        "subject": "Inventory Stockout Warning: SKU-550", 
        "body": "Unexpected demand spike from North America. SKU-550 (Battery Casings) will hit zero inventory in 3 days. Standard lead time is 2 weeks. We need to air-freight stock from the EU warehouse ASAP."
    },
    {
        "id": 5, "sender": "logistics_partner@maersk.com", 
        "subject": "Vessel Delay: Maersk Alabama", 
        "body": "The vessel carrying your Q4 retail inventory has been delayed by 5 days due to storm congestion in the Suez Canal. Revised ETA is Nov 12th."
    },
    {
        "id": 6, "sender": "quality_control@factory-z.com", 
        "subject": "Quality Deviation: Batch #303", 
        "body": "Routine inspection found micro-cracks in 3% of the steel brackets in Batch #303. This is within tolerance (5%) but trending higher than usual. Engineering review suggested."
    },
    {
        "id": 7, "sender": "supplier_relations@chip-tech.io", 
        "subject": "End of Life Notice: Controller Board v2", 
        "body": "This is a 6-month notice that Controller Board v2 will be discontinued. Please place final lifetime buy orders by June 30th."
    },
    {
        "id": 8, "sender": "warehouse_mgr@texas-hub.com", 
        "subject": "Weekly Inventory Report", 
        "body": "Cycle counts completed. 99.8% accuracy. No major discrepancies found. Routine update."
    },
    {
        "id": 9, "sender": "promo@office-supplies-discount.com", 
        "subject": "50% Off Toner Cartridges", 
        "body": "Limited time offer! Buy one get one free on all HP and Canon toner cartridges. Click here to claim your discount coupon."
    },
    {
        "id": 10, "sender": "hr-updates@fake-company-portal.net", 
        "subject": "Urgent: Update your direct deposit", 
        "body": "We noticed an error in your recent payroll. Please login to the portal immediately to verify your direct deposit information to avoid payment delays."
    }
]

@app.get("/api/emails")
def get_emails():
    return EMAILS

@app.post("/api/analyze")
def analyze_email(request: EmailRequest):
    # Inject Attachment Content
    attachment_context = ""
    if request.attachment_text:
        attachment_context = f"\n\n[ATTACHMENT FILE CONTENT READ BY SYSTEM]:\n{request.attachment_text}\n(Note: This information comes from a PDF/Document attached to the email. Use it to inform your risk score and action.)"

    prompt = f"""
    Act as a Supply Chain 'Chief of Staff' AI. Analyze this email.
    
    RULES:
    1. CATEGORY must be one of: [Logistics, Procurement, Manufacturing, Planning, Quality, Legal, Spam].
    2. RISK_SCORE: 0-10 (10 = Line Stoppage/Legal Threat, 0 = Spam/Routine).
    3. SUMMARY: Max 15 words. Concise.
    
    JSON FORMAT:
    {{
        "intent": "str",
        "risk_score": int,
        "category": "str",
        "summary": "str",
        "recommended_action": "Action sentence",
        "urgency": "High/Med/Low",
        "assignee": "Role (e.g. Ops Manager, Buyer)"
    }}
    
    EMAIL: "{request.email_body}"
    {attachment_context}
    """
    
    # Attempt generation with fallbacks
    for model_name in MODELS_TO_TRY:
        try:
            print(f"Attempting analysis with model: {model_name}")
            response = ollama.chat(
                model=model_name,
                messages=[{'role': 'user', 'content': prompt}],
                format='json'
            )
            return json.loads(response['message']['content'])
        except Exception as e:
            print(f"Error in /api/analyze with {model_name}: {e}")
            import traceback
            traceback.print_exc()
            continue

    raise HTTPException(status_code=500, detail="Internal server error during analysis across all Ollama models")

@app.post("/api/draft_reply")
def draft_reply(request: ReplyRequest):
    prompt = f"""
    You are a corporate executive. Write a reply to this email.
    
    GUIDELINES:
    1. Be Extremely Concise (Max 75 words).
    2. Be Professional and Direct.
    3. No fluff (e.g., skip "I hope this email finds you well").
    4. Focus on the Action: "{request.recommended_action}"
    
    CONTEXT:
    Sender: {request.sender}
    Original Issue: {request.email_body}
    
    Output the email body text only.
    """
    for model_name in MODELS_TO_TRY:
        try:
            response = ollama.chat(
                model=model_name,
                messages=[{'role': 'user', 'content': prompt}]
            )
            return {"draft_body": response['message']['content'].strip()}
        except Exception as e:
            print(f"Error in /api/draft_reply with {model_name}: {e}")
            import traceback
            traceback.print_exc()
            continue
    raise HTTPException(status_code=500, detail="Error drafting reply across all Ollama models.")

@app.post("/api/chat")
def chat_with_inbox(request: ChatRequest):
    # Convert EMails to a string context for the LLM
    emails_text = json.dumps(EMAILS, indent=2)

    prompt = f"""
    You are an intelligent Inbox Assistant. You have access to the user's emails below.
    
    USER QUESTION: "{request.query}"
    
    YOUR INBOX CONTEXT:
    {emails_text}
    
    INSTRUCTIONS:
    1. Answer the user's question strictly based on the emails provided.
    2. Cite specific senders or subjects when relevant.
    3. If the answer isn't in the emails, say "I couldn't find that information in your current feed."
    4. Keep answers concise and professional.
    """
    
    for model_name in MODELS_TO_TRY:
        try:
            response = ollama.chat(
                model=model_name,
                messages=[{'role': 'user', 'content': prompt}]
            )
            return {"response": response['message']['content'].strip()}
        except Exception as e:
            print(f"Error in /api/chat with {model_name}: {e}")
            import traceback
            traceback.print_exc()
            continue
    return {"response": "I'm sorry, I'm currently having issues with the Ollama service."}

if __name__ == '__main__':
    uvicorn.run("app:app", host="0.0.0.0", port=5000, reload=True)