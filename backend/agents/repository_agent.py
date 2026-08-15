import os
import json
from services.llm_service import (
    parse_github_url, fetch_repo_tree, fetch_file_content,
    fetch_repo_metadata, generate_project_summary
)

IMPORTANT_FILES = [
    "README.md", "readme.md", "package.json", "requirements.txt",
    "pyproject.toml", "Dockerfile", "docker-compose.yml",
    "next.config.js", "vite.config.js", "tsconfig.json",
]

IGNORE_DIRS = {".git", "node_modules", "__pycache__", "venv", "env", ".next", "dist", "build"}

def detect_languages(files):
    languages = set()
    for file in files:
        if file.endswith(".py"): languages.add("Python")
        elif file.endswith((".js", ".jsx")): languages.add("JavaScript")
        elif file.endswith((".ts", ".tsx")): languages.add("TypeScript")
        elif file.endswith(".java"): languages.add("Java")
        elif file.endswith((".cpp", ".cc")): languages.add("C++")
        elif file.endswith(".html"): languages.add("HTML")
        elif file.endswith(".css"): languages.add("CSS")
    return list(languages)

def detect_frameworks(files, important_content):
    frameworks = set()
    package = important_content.get("package.json", "").lower()
    requirements = important_content.get("requirements.txt", "").lower()
    pyproject = important_content.get("pyproject.toml", "").lower()
    combined_python = requirements + "\n" + pyproject

    if "next" in package: frameworks.add("Next.js")
    if "react" in package: frameworks.add("React")
    if "vite" in package: frameworks.add("Vite")
    if "express" in package: frameworks.add("Express.js")
    if "fastapi" in combined_python: frameworks.add("FastAPI")
    if "flask" in combined_python: frameworks.add("Flask")
    if "django" in combined_python: frameworks.add("Django")
    if "streamlit" in combined_python: frameworks.add("Streamlit")
    if "tensorflow" in combined_python: frameworks.add("TensorFlow")
    if "torch" in combined_python: frameworks.add("PyTorch")
    return list(frameworks)

def detect_features(files):
    features = []
    checks = {
        "Authentication": ["login", "signup", "auth", "jwt", "session"],
        "Dashboard": ["dashboard"],
        "Admin Panel": ["admin"],
        "API Routes": ["api/", "routes"],
        "Database": ["prisma", "models", "schema.sql", "database", "db"],
        "AI Feature": ["openai", "ollama", "langchain", "chatbot", "llm", "ai", "model"],
        "File Upload": ["upload", "file"],
        "Analytics": ["analytics", "chart", "graph", "report"],
        "Payments": ["stripe", "payment", "checkout"],
    }
    joined = " ".join(files).lower().replace("\\", "/")
    for feature, keywords in checks.items():
        if any(kw in joined for kw in keywords):
            features.append({"name": feature, "confidence": 0.75, "reason": "Detected from file structure"})
    return features

import re

def analyze_repository(github_url: str, user_token: str = None):
    # Basic validation for GitHub URLs
    if not re.match(r"^https?://(www\.)?github\.com/[\w.-]+/[\w.-]+/?$", github_url.strip()):
        return {
            "status": "error",
            "github_url": github_url,
            "error": "Invalid URL provided. Please provide a valid GitHub repository URL (e.g. https://github.com/owner/repo)."
        }
    
    try:
        owner, repo = parse_github_url(github_url)

        metadata = fetch_repo_metadata(owner, repo, user_token)
        files = fetch_repo_tree(owner, repo, user_token)

        important_content = {}
        for fname in IMPORTANT_FILES:
            if fname in files:
                important_content[fname] = fetch_file_content(owner, repo, fname, user_token)

        filtered_files = [
            f for f in files
            if not any(part in IGNORE_DIRS for part in f.split("/"))
        ]

        languages = detect_languages(filtered_files)
        frameworks = detect_frameworks(filtered_files, important_content)
        features = detect_features(filtered_files)

        readme = important_content.get("README.md") or important_content.get("readme.md") or ""

        manifest = {
            "project_name": repo,
            "github_description": metadata.get("description", ""),
            "stars": metadata.get("stargazers_count", 0),
            "languages": languages,
            "frameworks": frameworks,
            "features": features,
            "total_files": len(filtered_files),
            "readme_preview": readme[:1500],
            "sample_files": filtered_files[:30],
        }

        ai_summary = generate_project_summary(manifest)

        return {
            "status": "success",
            "github_url": github_url,
            "manifest": manifest,
            "ai_summary": ai_summary
        }

    except Exception as e:
        import traceback
        traceback.print_exc()
        
        error_msg = str(e)
        if "404 Client Error" in error_msg:
            error_msg = "This repository could not be found. It may be private or deleted. If it is private, please temporarily make it public on GitHub to analyze it!"
            
        return {
            "status": "error",
            "github_url": github_url,
            "error": error_msg,
            "traceback": traceback.format_exc()
        }