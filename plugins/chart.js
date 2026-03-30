import Vue from "vue";
import { Bar, Line, Doughnut, Pie } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  ArcElement,
} from "chart.js";

// 注册必要的Chart.js组件
ChartJS.register(
  Title,
  Tooltip,
  Legend,
  PointElement,
  BarElement,
  CategoryScale,
  LinearScale,
  LineElement,
  ArcElement
);

// 添加基础图表混入
const BaseChart = {
  props: {
    chartData: {
      type: Object,
      required: true,
    },
    options: {
      type: Object,
      default: () => ({}),
    },
  },
  watch: {
    chartData: {
      handler(newVal) {
        this.renderChart(newVal, this.options);
      },
      deep: true,
    },
    options: {
      handler(newVal) {
        this.renderChart(this.chartData, newVal);
      },
      deep: true,
    },
  },
  mounted() {
    this.renderChart(this.chartData, this.options);
  },
};

// 全局注册图表组件
Vue.component("line-chart", {
  extends: Line,
  mixins: [BaseChart],
});

Vue.component("doughnut-chart", {
  extends: Doughnut,
  mixins: [BaseChart],
});

Vue.component("bar-chart", {
  extends: Bar,
  mixins: [BaseChart],
});

Vue.component("pie-chart", {
  extends: Pie,
  mixins: [BaseChart],
});
