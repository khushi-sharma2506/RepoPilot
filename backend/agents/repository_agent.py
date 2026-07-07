import os
import json
from services.github_service import clone_repository, delete_repository
from services.ollama_service import generate_project_summary
IMPORTANT_FILES = [
    "README.md",
    "readme.md",
    "package.json",
    "requirements.txt",
    "pyproject.toml",
    "Dockerfile",
    "docker-compose.yml",
    "next.config.js",
    "vite.config.js",
    "tsconfig.json",
]

IGNORE_DIRS = {
    ".git",
    "node_modules",
    "__pycache__",
    "venv",
    "env",
    ".next",
    "dist",
    "build",
}


def get_project_name(github_url: str):
    name = github_url.rstrip("/").split("/")[-1]
    return name.replace(".git", "")


def scan_files(repo_path: str):
    files = []

    for root, dirs, filenames in os.walk(repo_path):
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]

        for filename in filenames:
            full_path = os.path.join(root, filename)
            relative_path = os.path.relpath(full_path, repo_path)
            files.append(relative_path)

    return files


def build_folder_tree(files, max_items=80):
    tree_lines = []

    for file in files[:max_items]:
        depth = file.count(os.sep)
        indent = "  " * depth
        tree_lines.append(f"{indent}- {os.path.basename(file)}")

    return "\n".join(tree_lines)


def detect_languages(files):
    languages = set()

    for file in files:
        if file.endswith(".py"):
            languages.add("Python")
        elif file.endswith((".js", ".jsx")):
            languages.add("JavaScript")
        elif file.endswith((".ts", ".tsx")):
            languages.add("TypeScript")
        elif file.endswith(".java"):
            languages.add("Java")
        elif file.endswith((".cpp", ".cc")):
            languages.add("C++")
        elif file.endswith(".html"):
            languages.add("HTML")
        elif file.endswith(".css"):
            languages.add("CSS")

    return list(languages)


def read_important_files(repo_path: str):
    content = {}

    for file in IMPORTANT_FILES:
        path = os.path.join(repo_path, file)

        if os.path.exists(path):
            try:
                with open(path, "r", encoding="utf-8", errors="ignore") as f:
                    content[file] = f.read()[:5000]
            except Exception:
                content[file] = "Could not read file"

    return content


def extract_dependencies(important_content):
    dependencies = set()

    package_json = important_content.get("package.json")
    if package_json:
        try:
            data = json.loads(package_json)
            for section in ["dependencies", "devDependencies"]:
                if section in data:
                    dependencies.update(data[section].keys())
        except Exception:
            pass

    requirements = important_content.get("requirements.txt")
    if requirements:
        for line in requirements.splitlines():
            line = line.strip()
            if line and not line.startswith("#"):
                package = line.split("==")[0].split(">=")[0].split("<=")[0]
                dependencies.add(package)

    return list(dependencies)


def detect_frameworks(files, important_content):
    frameworks = set()

    package = important_content.get("package.json", "").lower()
    requirements = important_content.get("requirements.txt", "").lower()
    pyproject = important_content.get("pyproject.toml", "").lower()

    combined_python_deps = requirements + "\n" + pyproject

    if "next" in package:
        frameworks.add("Next.js")
    if "react" in package:
        frameworks.add("React")
    if "vite" in package:
        frameworks.add("Vite")
    if "express" in package:
        frameworks.add("Express.js")
    if "remotion" in package:
        frameworks.add("Remotion")

    if "fastapi" in combined_python_deps:
        frameworks.add("FastAPI")
    if "flask" in combined_python_deps:
        frameworks.add("Flask")
    if "django" in combined_python_deps:
        frameworks.add("Django")
    if "streamlit" in combined_python_deps:
        frameworks.add("Streamlit")
    if "tensorflow" in combined_python_deps:
        frameworks.add("TensorFlow")
    if "torch" in combined_python_deps:
        frameworks.add("PyTorch")
    if "sklearn" in combined_python_deps or "scikit-learn" in combined_python_deps:
        frameworks.add("Scikit-learn")

    if any("app/" in f.replace("\\", "/") for f in files) and "Next.js" in frameworks:
        frameworks.add("Next.js App Router")

    return list(frameworks)


def detect_project_type(languages, frameworks, dependencies, files):
    combined = " ".join(frameworks + dependencies + files).lower()

    if any(x in combined for x in ["streamlit", "tensorflow", "torch", "scikit-learn", "sklearn", "model"]):
        return "AI / ML Project"

    if any(x in combined for x in ["next", "react", "vite"]):
        return "Web Application"

    if any(x in combined for x in ["fastapi", "flask", "django", "express"]):
        return "Backend API"

    return "Software Project"


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

    joined_files = " ".join(files).lower().replace("\\", "/")

    for feature, keywords in checks.items():
        if any(keyword in joined_files for keyword in keywords):
            features.append({
                "name": feature,
                "confidence": 0.75,
                "reason": "Detected from file names or folder structure"
            })

    return features


def analyze_repository(github_url: str):
    repo_path = None

    try:
        repo_path = clone_repository(github_url)

        files = scan_files(repo_path)
        important_content = read_important_files(repo_path)

        languages = detect_languages(files)
        dependencies = extract_dependencies(important_content)
        frameworks = detect_frameworks(files, important_content)
        features = detect_features(files)
        project_type = detect_project_type(languages, frameworks, dependencies, files)

        readme = important_content.get("README.md") or important_content.get("readme.md") or ""

        manifest = {
            "project_name": get_project_name(github_url),
            "project_type_guess": project_type,
            "languages": languages,
            "frameworks": frameworks,
            "dependencies": dependencies,
            "features": features,
            "important_files_found": list(important_content.keys()),
            "total_files_scanned": len(files),
            "folder_tree": build_folder_tree(files),
            "readme_preview": readme[:1000],
            "sample_files": files[:30]
        }
        ai_summary = generate_project_summary(manifest)

        return {
            "status": "success",
            "github_url": github_url,
            "manifest": manifest,
            "ai_summary": ai_summary
        }

    except Exception as e:
        return {
            "status": "error",
            "github_url": github_url,
            "error": str(e)
        }

    finally:
        if repo_path:
            try:
                delete_repository(repo_path)
            except Exception:
                pass