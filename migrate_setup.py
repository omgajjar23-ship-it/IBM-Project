import os
import shutil

def main():
    # Rename FastAPI backend
    if os.path.exists("backend") and not os.path.exists("backend_fastapi_backup"):
        os.rename("backend", "backend_fastapi_backup")
        print("Renamed 'backend' to 'backend_fastapi_backup'")
    
    # Create new Django structure
    os.makedirs("backend/myproject", exist_ok=True)
    os.makedirs("backend/core", exist_ok=True)
    os.makedirs("backend/core/migrations", exist_ok=True)

    # Initialize python modules
    with open("backend/core/migrations/__init__.py", "w") as f:
        pass
    with open("backend/core/__init__.py", "w") as f:
        pass
    with open("backend/myproject/__init__.py", "w") as f:
        pass

    # Copy ML Pipeline & Services
    if os.path.exists("backend_fastapi_backup/ml_pipeline"):
        if not os.path.exists("backend/ml_pipeline"):
            shutil.copytree("backend_fastapi_backup/ml_pipeline", "backend/ml_pipeline")
            print("Copied ml_pipeline")
    
    if os.path.exists("backend_fastapi_backup/services"):
        if not os.path.exists("backend/services"):
            shutil.copytree("backend_fastapi_backup/services", "backend/services")
            print("Copied services")

if __name__ == "__main__":
    main()
