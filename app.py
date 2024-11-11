import os
import google.generativeai as genai
from flask import Flask, request, render_template, redirect, url_for, jsonify
from google.cloud import secretmanager

app = Flask(__name__)

# Set up the API key (replace with your key)
api_key = "AIzaSyCarN4yxPKWw9UiiCVsx0H0c_MWJbHjLV8"  # Use environment variable or secure storage in production
genai.configure(api_key=api_key)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/send_message', methods=['POST'])
def send_message():
    user_message = request.form['message']
    
    try:
        # API call to send the message to the chatbot
        response = genai.chat(messages=[{"role": "user", "content": user_message}])
        
        # Debugging: print the raw response to check what's being returned
        print("API Response:", response)

        if 'message' in response:
            chatbot_reply = response['message']['content']
        else:
            chatbot_reply = "No response from the chatbot."
    except Exception as e:
        print(f"Error during API call: {e}")
        chatbot_reply = "Sorry, there was an error with the chatbot."

    return jsonify({"reply": chatbot_reply})

if __name__ == "__main__":
    app.run(debug=True)
