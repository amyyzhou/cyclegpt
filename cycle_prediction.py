import pandas as pd
from datetime import timedelta
from flask import Flask, request, jsonify

# Load the uploaded dataset
file_path = "menstrual_cycle_dataset_with_factors.csv"
df = pd.read_csv(file_path)

# Display the first few rows to understand its structure
df.head()

# Preprocessing
df['Cycle Start Date'] = pd.to_datetime(df['Cycle Start Date'])
df['Next Cycle Start Date'] = pd.to_datetime(df['Next Cycle Start Date'])

# Step 1: Calculate average cycle length per user
user_cycle_info = df.groupby('User ID').agg({
    'Cycle Length': 'mean',
    'Cycle Start Date': 'max'
}).reset_index()

user_cycle_info.rename(columns={
    'Cycle Length': 'Average Cycle Length',
    'Cycle Start Date': 'Last Cycle Start Date'
}, inplace=True)

# Step 2: Define predictor logic
def predict_next_cycle(user_id):
    user_data = df[df['User ID'] == user_id]
    if user_data.empty:
        return None

    latest_entry = user_data.sort_values(by='Cycle Start Date', ascending=False).iloc[0]
    last_cycle_start = pd.to_datetime(latest_entry['Cycle Start Date']).to_pydatetime()
    cycle_length = int(latest_entry['Cycle Length'])

    predicted_next_cycle = last_cycle_start + timedelta(days=cycle_length)

    # Estimate fertile window
    ovulation_day = predicted_next_cycle - timedelta(days=14)
    fertile_window_start = ovulation_day - timedelta(days=4)

    return {
        "predicted_next_cycle": predicted_next_cycle.strftime('%Y-%m-%d'),
        "fertile_window_start": fertile_window_start.strftime('%Y-%m-%d'),
        "fertile_window_end": ovulation_day.strftime('%Y-%m-%d')
    }

# Step 3: Sample run for one user
sample_prediction = predict_next_cycle(user_id=1)

print("Prediction for User 1:")
print(predict_next_cycle(user_id=1))