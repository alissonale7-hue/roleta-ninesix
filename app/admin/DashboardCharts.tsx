"use client";

import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

type Props = {
  prizesCount: Record<string, number>;
};

export default function DashboardCharts({ prizesCount }: Props) {
  const labels = Object.keys(prizesCount);
  const values = Object.values(prizesCount);

  const pieData = {
    labels,
    datasets: [{ data: values }],
  };

  const barData = {
    labels,
    datasets: [{ label: "Quantidade", data: values }],
  };

  return (
    <div style={{ display: "grid", gap: 20, gridTemplateColumns: "1fr 1fr", marginTop: 20 }}>
      <div style={{ border: "1px solid #ddd", borderRadius: 10, padding: 16 }}>
        <h3 style={{ marginTop: 0 }}>Distribuição de prêmios (Pizza)</h3>
        <Pie data={pieData} />
      </div>

      <div style={{ border: "1px solid #ddd", borderRadius: 10, padding: 16 }}>
        <h3 style={{ marginTop: 0 }}>Prêmios por quantidade (Barras)</h3>
        <Bar
          data={barData}
          options={{
            responsive: true,
            plugins: { legend: { display: false }, title: { display: false } },
          }}
        />
      </div>
    </div>
  );
}