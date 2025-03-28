# Personalized Menstrual Cycle Predictor

## Overview
CycleGPT is an AI-powered web application that provides personalized predictions for menstrual cycle timing, fertile windows, and menstrual health insights. The app leverages machine learning, data analysis, and AI chatbot interactions to empower users with accurate and tailored information about their reproductive health.

## Features
- **Personalized Cycle Predictions**: Predicts next menstrual cycle dates and fertile windows based on historical data and lifestyle factors.
- **AI Chatbot**: Provides compassionate and scientifically-grounded answers to menstrual health queries.
- **User-Friendly Frontend**: Interactive charts and visualizations created using React, Chart.js, and Tailwind CSS.
- **Robust Backend**: Flask backend with a machine learning model trained using linear regression.

## Tech Stack

### Frontend
- React (18.2.0)
- React DOM (18.2.0)
- React Scripts (5.0.1)
- Tailwind CSS (3.4.1)
- Chart.js (4.4.1)
- React-chartjs-2 (5.2.0)
- Date-fns (2.29.3)

### Backend
- Flask
- Pandas
- Scikit-learn
- LangChain & OpenAI's GPT-3.5-turbo
- Flask-CORS for cross-origin requests

## Installation

### Frontend

1. Navigate to the frontend directory:
```bash
cd cyclegpt-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the React application:
```bash
npm start
```

### Backend

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Ensure the dataset and trained model (`menstrual_cycle_dataset_with_factors.csv` and `cycle_length_model.pkl`) are in the correct directory.

3. Set up your environment variables (replace the placeholder API key with your actual OpenAI API key):
```bash
export OPENAI_API_KEY="your-openai-api-key"
```

4. Start the Flask server:
```bash
python app.py
```

The Flask server runs on port `5001`.

## Project Structure
```
CycleGPT
├── cyclegpt-frontend
│   ├── public
│   ├── src
│   ├── package.json
│   ├── package-lock.json
│   ├── postcss.config
│   └── tailwind.config
├── app.py
├── cycle_prediction.py
├── cycle_length_model.pkl
└── menstrual_cycle_dataset_with_factors.csv
```

## API Endpoints
- **Cycle Prediction** (`GET /predict?user_id=<user_id>`)
  - Provides cycle and fertile window predictions for a specified user ID.

- **AI Chatbot** (`POST /chat`)
  - Accepts JSON input: `{ "question": "Your menstrual health question" }`
  - Returns AI-generated responses on menstrual health topics.

## Contributing
Contributions are welcome! Feel free to fork the repository, submit pull requests, or raise issues to improve the project.

## License
This project is open-source and available under the [MIT License](LICENSE).
Source of dataset: https://www.kaggle.com/datasets/himanshukumar7079/menstural-cycle-lengtg 
