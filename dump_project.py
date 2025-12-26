import os

# ===== Configuration =====
OUTPUT_FILE = "project_dump.txt"

INCLUDE_EXTENSIONS = {
    ".js", ".jsx", ".ts", ".tsx",
    ".json",
    ".css",
    ".md",
    ".html"
}

EXCLUDE_DIRS = {
    "node_modules",
    ".next",
    ".git",
    "__pycache__",
    "public"
}

EXCLUDE_FILES = {
    "package-lock.json",
    "yarn.lock",
    "pnpm-lock.yaml"
}

# =========================

def is_relevant_file(filename):
    _, ext = os.path.splitext(filename)
    return ext in INCLUDE_EXTENSIONS and filename not in EXCLUDE_FILES


def dump_project(root_dir):
    with open(OUTPUT_FILE, "w", encoding="utf-8") as out:
        for root, dirs, files in os.walk(root_dir):
            # Modify dirs in-place to skip excluded directories
            dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]

            for file in files:
                if is_relevant_file(file):
                    file_path = os.path.join(root, file)
                    rel_path = os.path.relpath(file_path, root_dir)

                    out.write(f"\n{'=' * 80}\n")
                    out.write(f"FILE: {rel_path}\n")
                    out.write(f"{'=' * 80}\n\n")

                    try:
                        with open(file_path, "r", encoding="utf-8") as f:
                            out.write(f.read())
                    except Exception as e:
                        out.write(f"[ERROR READING FILE: {e}]\n")

    print(f"✅ Project dump created: {OUTPUT_FILE}")


if __name__ == "__main__":
    dump_project(os.getcwd())
