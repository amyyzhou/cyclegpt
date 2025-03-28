import { useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
} from "chart.js";
import "chartjs-adapter-date-fns";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

export default function App() {
  const [day, setDay] = useState("");

  const [userId, setUserId] = useState(1);
  const [prediction, setPrediction] = useState(null);
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState("");

  const fetchPrediction = async () => {
    try {
      const res = await fetch(`/predict?user_id=${userId}`);
      const data = await res.json();
      setPrediction(data);
    } catch (err) {
      console.error("Prediction fetch failed", err);
    }
  };

  const askChatbot = async () => {
    try {
      const res = await fetch("http://localhost:5001/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question })
      });
  
      const data = await res.json();
      if (data.response) {
        setResponse(data.response);
      } else {
        setResponse("No response from CycleGPT.");
      }
    } catch (err) {
      console.error("Chatbot fetch failed", err);
      setResponse("There was an error contacting CycleGPT.");
    }
  };
  

  let chartData = {};
  let chartOptions = {};
  if (prediction) {
    const fertileWindowStart = new Date(prediction.fertile_window_start);
    const fertileWindowEnd = new Date(prediction.fertile_window_end);
    const fertileDays = Math.round((fertileWindowEnd - fertileWindowStart) / (1000 * 60 * 60 * 24)) + 1;
    const ovulationDay = new Date(fertileWindowEnd);
    const nextCycleStart = new Date(prediction.predicted_next_cycle);
    const predictedCycleLength = Math.round(prediction.predicted_cycle_length);

    const menstruationStart = new Date(nextCycleStart);
    menstruationStart.setDate(menstruationStart.getDate() - predictedCycleLength);
    const menstruationEnd = new Date(menstruationStart);
    menstruationEnd.setDate(menstruationStart.getDate() + 5);

    const follicularStart = new Date(menstruationEnd);
    const follicularEnd = new Date(fertileWindowStart);
    follicularEnd.setDate(fertileWindowStart.getDate() - 1);

    const lutealStart = new Date(fertileWindowEnd);
    lutealStart.setDate(fertileWindowEnd.getDate() + 1);

    chartData = {
      labels: [],
      datasets: [
        {
          label: "Menstruation",
          data: [
            { x: menstruationStart, y: 0 },
            { x: menstruationEnd, y: 5 }
          ],
          borderColor: "red",
          backgroundColor: "red",
          fill: false,
          pointRadius: 5,
          pointHoverRadius: 7,
          tooltip: { callbacks: { label: () => "Shedding of the uterine lining." } }
        },
        {
          label: "Follicular Phase",
          data: [
            { x: menstruationEnd, y: 5 },
            { x: follicularEnd, y: 5 + (follicularEnd - menstruationEnd) / (1000 * 60 * 60 * 24) }
          ],
          borderColor: "blue",
          backgroundColor: "blue",
          fill: false,
          pointRadius: 5,
          pointHoverRadius: 7,
          tooltip: { callbacks: { label: () => "Hormones prepare an egg for release." } }
        },
        {
          label: "Fertile Window",
          data: [
            { x: fertileWindowStart, y: 5 + (follicularEnd - menstruationEnd) / (1000 * 60 * 60 * 24) },
            { x: fertileWindowEnd, y: 5 + (follicularEnd - menstruationEnd) / (1000 * 60 * 60 * 24) + fertileDays - 1 }
          ],
          borderColor: "green",
          backgroundColor: "green",
          fill: false,
          pointRadius: 5,
          pointHoverRadius: 7,
          tooltip: { callbacks: { label: () => "The days you're most likely to conceive." } }
        },
        {
          label: "Luteal Phase",
          data: [
            { x: lutealStart, y: 5 + (follicularEnd - menstruationEnd) / (1000 * 60 * 60 * 24) + fertileDays },
            { x: nextCycleStart, y: predictedCycleLength }
          ],
          borderColor: "orange",
          backgroundColor: "orange",
          fill: false,
          pointRadius: 5,
          pointHoverRadius: 7,
          tooltip: { callbacks: { label: () => "Hormones prepare the body for pregnancy or restart." } }
        }
      ]
    };

    chartOptions = {
      responsive: true,
      plugins: {
        legend: { position: "top" },
        title: { display: true, text: "Cycle Timeline by Date" },
        tooltip: {
          callbacks: {
            title: (tooltipItems) => {
              const date = tooltipItems[0].parsed.x;
              return new Date(date).toLocaleDateString(); // removes the hour
            },
            label: (context) => {
              return `${context.dataset.label}: Cycle Day ${context.parsed.y}`;
            }
          }
        }
        
      },
      scales: {
        x: {
          type: "time",
          time: { unit: "day" },
          title: { display: true, text: "Date" }
        },
        y: {
          title: { display: true, text: "Cycle Day" }
        }
      }
    };
  }

  return (
    <div className="p-6 max-w-3xl mx-auto font-sans">
      <h1 className="text-3xl font-bold mb-6 text-center">🌸 CycleGPT Dashboard</h1>

      <div className="mb-6">
        <label className="font-semibold mr-2">User ID:</label>
        <input
          type="number"
          value={userId}
          onChange={(e) => setUserId(Number(e.target.value))}
          className="border rounded px-2 py-1 w-20"
        />
        <button
          onClick={fetchPrediction}
          className="ml-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded"
        >
          Predict
        </button>
      </div>

      {prediction && (
        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-2">🩸 Prediction Results</h2>
          
          <p><strong>Next Cycle:</strong> {prediction.predicted_next_cycle}</p>
          <p><strong>Fertile Window:</strong> {prediction.fertile_window_start} to {prediction.fertile_window_end}</p>
          <p><strong>Predicted Cycle Length:</strong> {prediction.predicted_cycle_length} days</p>
          <div className="mt-6">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
      )}

      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">💬 Ask CycleGPT</h2>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g., Why is ovulation important?"
          className="border w-full px-2 py-2 h-24 rounded mb-2"
        />
        <button
          onClick={askChatbot}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
        >
          Ask
        </button>
      </div>

      {response && (
        <div className="bg-gray-100 p-4 rounded mt-4 shadow">
          <strong>CycleGPT says:</strong>
          <p className="mt-2">{response}</p>
        </div>
      )}
    </div>
  );
}
