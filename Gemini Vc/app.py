from flask import Flask, request, jsonify, render_template
import google.generativeai as genai
import os

# Initialize Flask app
app = Flask(__name__)

# Set Google Gemini API credentials from environment variable
API_KEY = 'AIzaSyB_QkpxnA-oY1qrei_nUKzBgC-rOR8FBqg'

# Store the chat session object (outside the function)
chat_session = None  # Initialize as None

# Home route
@app.route('/')
def index():
    return render_template('index.html')

# Route to handle chat requests
@app.route('/ask', methods=['POST'])
def ask():
    user_input = request.form.get('question', '').strip()
    if not user_input:
        return jsonify({'answer': "Please provide a question."})

    global chat_session  # Access the global chat session

    try:
        if not chat_session:
            # Configure the Google Gemini API
            genai.configure(api_key=AIzaSyB_QkpxnA-oY1qrei_nUKzBgC-rOR8FBqg)

            generation_config = {
                "temperature": 1,
                "top_p": 0.95,
                "top_k": 64,
                "max_output_tokens": 8192,
                "response_mime_type": "text/plain",
            }

            model = genai.GenerativeModel(
                model_name="gemini-1.5-flash",
                generation_config=generation_config,
            )

            # Start the chat session if not already started
            chat_session = model.start_chat(history=[])

        # Send user input to the model
        response = chat_session.send_message(user_input)
        answer = response.text

        return jsonify({'answer': answer})
    except Exception as e:
        print(f"Unexpected error: {e}")
        return jsonify({'error': "Sorry, there was an unexpected error."})

if __name__ == '__main__':
    # Ensure the API key is set
    if not API_KEY:
        raise ValueError("Please set the GOOGLE_GEMINI_API_KEY environment variable.")

    app.run(debug=True)
