import { Chart } from "chart.js/auto";
import {
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { defineNuxtPlugin } from "nuxt/app";

// 注册必要的组件
Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default defineNuxtPlugin(() => {
  return {
    provide: {
      Chart,
    },
  };
});
