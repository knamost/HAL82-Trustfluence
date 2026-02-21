import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str

llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    groq_api_key=os.getenv("GROQ_API_KEY"),
    temperature=0.7,
)

prompt = ChatPromptTemplate.from_messages([
    ("system", """
Project: Trustfluence — Influencer Marketing Marketplace

You are working on Trustfluence, a full-stack influencer marketing platform that connects content creators with brands for campaign collaborations. The platform emphasizes trust and transparency through mutual ratings and reviews.

Tech Stack:

Frontend: React 19, Vite 7, React Router 7, Tailwind CSS 4, Axios, lucide-react icons
Backend: Node.js, Express 5, Drizzle ORM, PostgreSQL 16, Zod validation
Auth: JWT (HS256) + Argon2 password hashing
Infra: Docker Compose (Postgres), pnpm
Core Features:

Two user roles — Creators and Brands, each with dedicated dashboards and profile pages
Creator profiles — display name, avatar, bio, platform (Instagram/YouTube/TikTok), social handle, followers count, engagement rate, niches (JSON array), promotion types
Brand profiles — company name, logo, bio, category, website URL, trust score
Campaign requirements — brands post campaigns with title, description, budget, deadline, niches, platform requirements; creators browse and apply
Applications — creators apply to requirements; brands accept/reject; status flow: pending → accepted/rejected
Ratings & Reviews — mutual rating (1-5 stars, upsert per pair) and text reviews between users, gated by accepted application relationship. Reviews are enriched with reviewer names (resolved from creator/brand profiles) and paired rating scores
Discovery page — tabbed interface showing both Creators and Brands with search, filters (niche, platform, followers, engagement for creators; category for brands), and cards displaying avg ratings
Admin dashboard — user management and platform overview
Architecture:

Backend follows MVC pattern: routes → controllers → services → Drizzle ORM → PostgreSQL
Frontend uses a service layer (src/api/) wrapping Axios for all API calls, with an auth context provider managing JWT lifecycle
All components are in components, styled with Tailwind CSS utility classes and inline styles matching a Figma design system (Inter font, blue primary #2563EB, slate backgrounds)
"""),
    ("human", "{input}")
])

chain = prompt | llm | StrOutputParser()

@app.post("/chat")
async def chat(req: ChatRequest):
    response = chain.invoke({"input": req.message})
    return {"response": response}

@app.get("/")
def home():
    return {"status": "Chatbot API running 🚀"}