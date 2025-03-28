from flask import Flask, request, jsonify
import pandas as pd
import numpy as np
from datetime import timedelta
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import LabelEncoder
import joblib
import os
from flask_cors import CORS

# LangChain + OpenAI
from langchain_openai import ChatOpenAI
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate

app = Flask(__name__)
CORS(app)

os.environ["OPENAI_API_KEY"] = "FILL IN"
# Load and preprocess dataset
df = pd.read_csv("menstrual_cycle_dataset_with_factors.csv")
df['Cycle Start Date'] = pd.to_datetime(df['Cycle Start Date'])
df['Next Cycle Start Date'] = pd.to_datetime(df['Next Cycle Start Date'])

# Encode categorical features for modeling
le_diet = LabelEncoder()
df['Diet_Encoded'] = le_diet.fit_transform(df['Diet'])
le_exercise = LabelEncoder()
df['Exercise_Encoded'] = le_exercise.fit_transform(df['Exercise Frequency'])

# Features and target for cycle length prediction
features = df[['Age', 'BMI', 'Stress Level', 'Sleep Hours', 'Diet_Encoded', 'Exercise_Encoded']]
target = df['Cycle Length']

# Train simple regression model for cycle length
model = LinearRegression()
model.fit(features, target)

# Save model for later use
joblib.dump(model, 'cycle_length_model.pkl')

# Prediction logic
def predict_next_cycle(user_id):
    user_data = df[df['User ID'] == user_id]
    if user_data.empty:
        return None

    latest_entry = user_data.sort_values(by='Cycle Start Date', ascending=False).iloc[0]
    last_cycle_start = pd.to_datetime(latest_entry['Cycle Start Date']).to_pydatetime()

    # Prepare features for prediction
    input_features = np.array([[
        latest_entry['Age'],
        latest_entry['BMI'],
        latest_entry['Stress Level'],
        latest_entry['Sleep Hours'],
        le_diet.transform([latest_entry['Diet']])[0],
        le_exercise.transform([latest_entry['Exercise Frequency']])[0]
    ]])

    predicted_cycle_length = model.predict(input_features)[0]
    predicted_next_cycle = last_cycle_start + timedelta(days=int(predicted_cycle_length))

    ovulation_day = predicted_next_cycle - timedelta(days=14)
    fertile_window_start = ovulation_day - timedelta(days=4)
    fertile_window_end = ovulation_day
    fertile_window_days = (fertile_window_end - fertile_window_start).days

    return {
        "user_id": user_id,
        "predicted_next_cycle": predicted_next_cycle.strftime('%Y-%m-%d'),
        "fertile_window_start": fertile_window_start.strftime('%Y-%m-%d'),
        "fertile_window_end": fertile_window_end.strftime('%Y-%m-%d'),
        "predicted_cycle_length": round(predicted_cycle_length, 2),
        "fertile_window_days": fertile_window_days
    }

# LangChain chatbot setup
llm = ChatOpenAI(model_name="gpt-3.5-turbo", temperature=0.5)

chat_template = PromptTemplate(
    input_variables=["question"],
    template="""
    You are CycleGPT, a compassionate and science-based assistant for menstrual health.
    Answer the following question clearly and concisely, citing medical knowledge when possible.

    Question: {question}
    """
)

chat_chain = LLMChain(llm=llm, prompt=chat_template)

# API endpoint for cycle prediction
@app.route("/predict")
def predict():
    user_id = int(request.args.get("user_id"))
    prediction = predict_next_cycle(user_id)
    if prediction:
        prediction["user_id"] = user_id
        return jsonify(prediction)
    else:
        return jsonify({"error": "User not found"}), 404

# API endpoint for chatbot
@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    question = data.get("question", "")
    if not question:
        return jsonify({"error": "Please provide a question."}), 400

    response = chat_chain.run({"question": question})
    return jsonify({"response": response})

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5001, debug=True)
