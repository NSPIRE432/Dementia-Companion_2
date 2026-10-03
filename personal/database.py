import sqlite3

def init_db():
    # Connects to (or creates) database.db in the current folder
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()
    
    # Create the users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            otp TEXT,
            is_verified INTEGER DEFAULT 0
        )
    ''')
    
    conn.commit()
    conn.close()
    print("Database initialized successfully.")

if __name__ == '__main__':
    init_db()
    
print("Database created successfully!")