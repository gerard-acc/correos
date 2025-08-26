import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { labels } from "./fakeData";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

export default function Chart() {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom" as const,
      },
      title: {
        display: false,
      },
    },
  };

  const data = {
    labels,
    datasets: [
      {
        label: "Simulación",
        data: [100, 200, 50, 20, 10, 30, 210],
        borderColor: "#002e6d",
        backgroundColor: "#002e6d",
        borderDash: [3],
        borderWidth: 1,
      },
      {
        label: "Modelo",
        data: [10, 240, 30, 200, 100, 90, 110],
        borderColor: "#ffcd00",
        backgroundColor: "#ffcd00",
        borderWidth: 1,
      },
    ],
  };

  return <Line options={options} data={data} />;
}
