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
  Chart.defaults.color = "rgba(247, 247, 252, 0.72)";
  Chart.defaults.borderColor = "rgba(255, 255, 255, 0.08)";
  Chart.defaults.font.family = "Alimama FangYuanTi VF, sans-serif";

  return {
    provide: {
      Chart,
    },
  };
});
