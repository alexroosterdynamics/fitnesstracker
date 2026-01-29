import os

# Configuration
OUTPUT_FILE = "project_dump.txt"
# Folders you want to include
TARGET_FOLDERS = ['app', 'components', 'lib', 'data']
# File extensions to capture
EXTENSIONS = ('.js', '.jsx', '.ts', '.tsx', '.css', '.json')
# Files or directories to ignore (to keep the dump clean)
IGNORE_LIST = ['node_modules', '.next', 'package-lock.json', '.DS_Store']

def generate_dump():
    project_root = os.getcwd()
    
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as outfile:
        outfile.write(f"PROJECT DUMP - {os.path.basename(project_root)}\n")
        outfile.write("=" * 50 + "\n\n")

        for folder in TARGET_FOLDERS:
            folder_path = os.path.join(project_root, folder)
            
            if not os.path.exists(folder_path):
                print(f"Skipping: {folder} (Folder not found)")
                continue

            print(f"Processing: {folder}...")

            for root, dirs, files in os.walk(folder_path):
                # Filter out ignored directories
                dirs[:] = [d for d in dirs if d not in IGNORE_LIST]

                for file in files:
                    if file.endswith(EXTENSIONS) and file not in IGNORE_LIST:
                        file_path = os.path.join(root, file)
                        relative_path = os.path.relpath(file_path, project_root)
                        
                        outfile.write(f"\nFILE: {relative_path}\n")
                        outfile.write("-" * len(f"FILE: {relative_path}") + "\n")
                        
                        try:
                            with open(file_path, 'r', encoding='utf-8') as infile:
                                outfile.write(infile.read())
                        except Exception as e:
                            outfile.write(f"[Error reading file: {e}]")
                        
                        outfile.write("\n\n" + "="*30 + "\n")

    print(f"\nSuccess! Dump created at: {OUTPUT_FILE}")

if __name__ == "__main__":
    generate_dump()