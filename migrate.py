import sqlite3

def migrate():
    conn = sqlite3.connect('income_insight.db')
    cursor = conn.cursor()
    
    try:
        print("Adding ref_id column...")
        cursor.execute("ALTER TABLE predictions ADD COLUMN ref_id TEXT")
    except Exception as e:
        print(f"ref_id already exists or error: {e}")
        
    try:
        print("Adding applicant_name column...")
        cursor.execute("ALTER TABLE predictions ADD COLUMN applicant_name TEXT")
    except Exception as e:
        print(f"applicant_name already exists or error: {e}")
        
    try:
        print("Adding user_id column...")
        cursor.execute("ALTER TABLE predictions ADD COLUMN user_id INTEGER REFERENCES users(id)")
    except Exception as e:
        print(f"user_id already exists or error: {e}")
        
    conn.commit()
    conn.close()
    print("Migration complete.")

if __name__ == "__main__":
    migrate()
