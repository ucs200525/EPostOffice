import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Default chart options
export const defaultOptions = {
  responsive: true,
  scales: {
    x: {
      type: 'category',
      display: true,
      grid: {
        display: false
      }
    },
    y: {
      beginAtZero: true,
      grid: {
        borderDash: [2],
        drawBorder: false
      }
    }
  },
  plugins: {
    legend: {
      position: 'top'
    }
  }
};
