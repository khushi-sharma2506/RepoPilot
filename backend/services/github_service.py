import os
import shutil
import uuid
import stat
import time
from git import Repo

TEMP_DIR = "temp_repos"


def clone_repository(github_url: str) -> str:
    os.makedirs(TEMP_DIR, exist_ok=True)

    repo_id = str(uuid.uuid4())
    repo_path = os.path.join(TEMP_DIR, repo_id)

    Repo.clone_from(github_url, repo_path)
    return repo_path


def handle_remove_readonly(func, path, exc):
    os.chmod(path, stat.S_IWRITE)
    func(path)


def delete_repository(repo_path: str):
    if repo_path and os.path.exists(repo_path):
        time.sleep(1)
        shutil.rmtree(repo_path, onerror=handle_remove_readonly)