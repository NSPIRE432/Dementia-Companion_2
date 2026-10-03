from flask import Flask, render_template, request, redirect, url_for, session, flash
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3
import random

app = Flask(__name__)
app.secret_key = 'super_secret_development_key' # Required for session variables and flashing messages

def get_db_connection():
    conn = sqlite3.connect('database.db')
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        confirm_password = request.form.get('confirm_password')

        if password != confirm_password:
            flash("Passwords do not match!")
            return redirect(url_for('register'))

        # Secure password hashing
        hashed_password = generate_password_hash(password)
        
        # Generate a 6-digit OTP
        otp = str(random.randint(100000, 999999))

        conn = get_db_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute(
                "INSERT INTO users (email, password_hash, otp) VALUES (?, ?, ?)",
                (email, hashed_password, otp)
            )
            conn.commit()
        except sqlite3.IntegrityError:
            # This triggers if the email already exists in the database
            flash("Email is already registered!")
            conn.close()
            return redirect(url_for('register'))
        
        conn.close()

        # Print OTP to terminal (mocking email delivery for now)
        print("\n" + "="*30)
        print(f"MOCK EMAIL SENT TO: {email}")
        print(f"YOUR OTP IS: {otp}")
        print("="*30 + "\n")

        # Save email in session so the OTP page knows which user to verify
        session['registration_email'] = email
        
        return redirect(url_for('otp'))

    return render_template('register.html')

# Basic routes so Flask doesn't crash when testing
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')

        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Look up the user by email
        cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
        user = cursor.fetchone()
        conn.close()

        # Check if user exists and if the password matches the hash
        if user and check_password_hash(user['password_hash'], password):
            # Check if they completed OTP verification
            if user['is_verified'] == 1:
                session['user_id'] = user['id']
                session['email'] = user['email']
                return redirect(url_for('dashboard'))
            else:
                flash("Please verify your email first.")
                return redirect(url_for('login'))
        else:
            flash("Invalid email or password.")
            return redirect(url_for('login'))

    return render_template('login.html')

@app.route('/otp')
def otp():
    return render_template('otp.html')

@app.route('/verify-otp', methods=['POST'])
def verify_otp():
    # Get the OTP entered by the user
    user_otp = request.form.get('otp')
    
    # Retrieve the email we saved in the session during registration
    email = session.get('registration_email')
    
    if not email:
        flash("Session expired. Please register again.")
        return redirect(url_for('register'))

    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Look up the correct OTP for this email in the database
    cursor.execute("SELECT otp FROM users WHERE email = ?", (email,))
    row = cursor.fetchone()
    
    if row and row['otp'] == user_otp:
        # Match found! Mark user as verified and clear the OTP
        cursor.execute("UPDATE users SET is_verified = 1, otp = NULL WHERE email = ?", (email,))
        conn.commit()
        conn.close()
        
        flash("Email verified successfully! You can now log in.")
        return redirect(url_for('login'))
    else:
        conn.close()
        flash("Invalid OTP. Please try again.")
        return redirect(url_for('otp'))

@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('index'))

if __name__ == '__main__':
    app.run(debug=True)