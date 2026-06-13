"""
Netlify Serverless Function - Groq Free Tier (COMPLETELY FREE)
No API costs ever - 100% free, open source friendly
"""

from groq import Groq
import praw
import os
import json
from datetime import datetime

# Initialize Groq (FREE - no credit card needed)
groq_client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

# Reddit API credentials (free)
try:
    reddit = praw.Reddit(
        client_id=os.environ.get("REDDIT_CLIENT_ID"),
        client_secret=os.environ.get("REDDIT_CLIENT_SECRET"),
        user_agent=os.environ.get("REDDIT_USER_AGENT", "model-recommender-bot/1.0")
    )
except Exception as e:
    print(f"Reddit config warning: {e}")
    reddit = None

SKILL_PROMPT = """You are an AI Model Advisor. Help users find the best AI models for their needs.

Your job:
1. RESEARCH: Gather info about available AI models (prices, performance, latest releases)
2. REQUIREMENTS: Understand what user actually needs
3. RECOMMEND: Rank models objectively based on user's needs

Guidelines:
- Be UNBIASED - don't favor any provider
- Include free and paid options
- Show cost estimates
- Explain trade-offs
- Highlight newest models with dates
- Be practical and realistic"""


def handler(event, context):
    """Main Netlify function handler"""

    # CORS preflight
    if event["httpMethod"] == "OPTIONS":
        return cors_response(200, "")

    path = event.get("path", "")
    method = event.get("httpMethod", "")

    try:
        if path == "/api/health" and method == "GET":
            return success_response({"status": "healthy", "cost": "$0 - Free forever!"})

        elif path == "/api/recommend" and method == "POST":
            return handle_recommendation(event)

        elif path == "/api/models" and method == "GET":
            return success_response({"status": "free models available"})

        else:
            return error_response("Not found", 404)

    except Exception as e:
        print(f"Error: {str(e)}")
        return error_response(str(e), 500)


def handle_recommendation(event):
    """Handle recommendation request - COMPLETELY FREE"""

    try:
        body = json.loads(event.get("body", "{}"))

        # Validate
        required = ["use_case", "volume", "budget"]
        for field in required:
            if not body.get(field):
                return error_response(f"Missing: {field}", 400)

        use_case = body.get("use_case", "").strip()
        description = body.get("description", "").strip()
        volume = body.get("volume", "medium")
        budget = body.get("budget", "").strip()
        priorities = body.get("priorities", "").strip()
        custom_volume = body.get("custom_volume")

        print(f"Processing (FREE): {use_case}")

        # Step 1: Get Reddit data (free)
        reddit_data = fetch_reddit_data()

        # Step 2: Research with Groq (FREE)
        research = groq_research(
            use_case, description, volume, custom_volume, budget, reddit_data
        )

        # Step 3: Parse requirements with Groq (FREE)
        requirements = groq_requirements(
            use_case, volume, custom_volume, budget, priorities
        )

        # Step 4: Generate recommendations with Groq (FREE)
        recommendations = groq_recommend(research, requirements)

        return success_response({
            "recommendations": recommendations,
            "cost_estimate": estimate_costs(volume),
            "sources": {
                "reddit": len(reddit_data),
                "groq": "Free tier",
                "budget": "$0 forever!"
            },
            "timestamp": datetime.now().isoformat()
        })

    except Exception as e:
        return error_response(str(e), 500)


def fetch_reddit_data():
    """Fetch from Reddit (free)"""
    if not reddit:
        return []

    try:
        subreddits = ["LanguageModels", "OpenAI", "LocalLLaMA", "learnmachinelearning"]
        data = []

        for sub_name in subreddits:
            try:
                sub = reddit.subreddit(sub_name)
                for post in sub.new(limit=3):
                    data.append({
                        "title": post.title,
                        "score": post.score,
                        "subreddit": sub_name,
                    })
            except:
                continue

        return data
    except Exception as e:
        print(f"Reddit error: {e}")
        return []


def groq_research(use_case, description, volume, custom_volume, budget, reddit_data):
    """Research phase with Groq (FREE - Mixtral model)"""

    reddit_str = "\n".join([f"- {item['title']} (r/{item['subreddit']})"
                            for item in reddit_data[:10]]) if reddit_data else "No data"

    prompt = f"""RESEARCH: Find latest AI models for this use case

USE CASE: {use_case}
NEEDS: {description if description else 'General'}
VOLUME: {volume} {f'({custom_volume})' if custom_volume else ''}
BUDGET: {budget}

RECENT REDDIT POSTS:
{reddit_str}

LIST: Top models for this use case with:
- Name, provider, release date (latest first)
- Cost per 1M tokens
- Key strengths
- Community feedback
- FREE options available

Be unbiased and comprehensive."""

    message = groq_client.messages.create(
        model="mixtral-8x7b-32768",  # Free Groq model - very good quality
        max_tokens=1500,
        messages=[{
            "role": "user",
            "content": prompt
        }],
        system=SKILL_PROMPT
    )

    return message.content[0].text


def groq_requirements(use_case, volume, custom_volume, budget, priorities):
    """Requirements phase with Groq (FREE)"""

    prompt = f"""Parse these requirements:
- Use case: {use_case}
- Volume: {volume}
- Budget: {budget}
- Priorities: {priorities if priorities else 'None'}

Return key requirements and success criteria."""

    message = groq_client.messages.create(
        model="mixtral-8x7b-32768",
        max_tokens=400,
        messages=[{"role": "user", "content": prompt}],
        system=SKILL_PROMPT
    )

    return message.content[0].text


def groq_recommend(research_data, requirements_data):
    """Recommendation phase with Groq (FREE)"""

    prompt = f"""Based on research and requirements, provide:

RESEARCH:
{research_data}

REQUIREMENTS:
{requirements_data}

OUTPUT:
1. Top 10 ranked models (with explanations)
2. Cost breakdowns for different usage levels
3. Key trade-offs
4. Final recommendation
5. Links to docs/pricing

Be clear and structured. Highlight free options."""

    message = groq_client.messages.create(
        model="mixtral-8x7b-32768",
        max_tokens=2500,
        messages=[{"role": "user", "content": prompt}],
        system=SKILL_PROMPT
    )

    return message.content[0].text


def estimate_costs(volume):
    """Free cost estimates"""
    if volume == "light":
        return {"light": "Free", "medium": "$5-20", "heavy": "$50-200"}
    elif volume == "medium":
        return {"light": "$10-30", "medium": "$50-150", "heavy": "$500-2000"}
    else:
        return {"light": "$50-100", "medium": "$500-1500", "heavy": "$2000-5000"}


def success_response(data):
    """Return success"""
    return cors_response(200, json.dumps({"status": "success", **data}))


def error_response(message, status_code=400):
    """Return error"""
    return cors_response(status_code, json.dumps({"status": "error", "error": message}))


def cors_response(status_code, body):
    """Response with CORS headers"""
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"
        },
        "body": body
    }
