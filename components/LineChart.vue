<template>
  <div class="chart-container">
    <canvas ref="chartRef"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onBeforeUnmount, nextTick } from "vue";
import { Chart } from "chart.js";

const props = defineProps({
  chartData: {
    type: Object,
    required: true,
  },
  options: {
    type: Object,
    default: () => ({}),
  },
});

const chartRef = ref(null);
let chartInstance = null;

// 添加深拷贝函数
const deepClone = (obj) => {
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch (e) {
    console.warn("深拷贝失败，返回原对象", e);
    return obj;
  }
};

const getOrCreateTooltip = (chart) => {
  let tooltipEl = chart.canvas.parentNode.querySelector("div.chart-tooltip");

  if (!tooltipEl) {
    tooltipEl = document.createElement("div");
    tooltipEl.classList.add("chart-tooltip");
    tooltipEl.style.cssText = `
      background: rgba(255, 255, 255, 0.95);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      border-radius: 6px;
      color: #333;
      opacity: 0;
      pointer-events: none;
      position: fixed;
      transform: translate(-50%, 0);
      transition: all .1s ease;
      padding: 8px;
      font-size: 12px;
      z-index: 9999;
    `;

    const table = document.createElement("table");
    table.style.margin = "0px";
    tooltipEl.appendChild(table);
    chart.canvas.parentNode.appendChild(tooltipEl);
  }

  return tooltipEl;
};

const externalTooltipHandler = (context) => {
  const { chart, tooltip } = context;
  const tooltipEl = getOrCreateTooltip(chart);

  if (tooltip.opacity === 0) {
    tooltipEl.style.opacity = 0;
    return;
  }

  if (tooltip.body) {
    const titleLines = tooltip.title || [];
    const bodyLines = tooltip.body.map((b) => b.lines);

    let innerHtml = "<thead>";

    titleLines.forEach((title) => {
      innerHtml += `<tr><th style="text-align: left;">${title}</th></tr>`;
    });

    innerHtml += "</thead><tbody>";

    bodyLines.forEach((body, i) => {
      const colors = tooltip.labelColors[i];
      const style = `background:${colors.backgroundColor};
                    border: 2px solid ${colors.borderColor};
                    width: 10px;
                    height: 10px;
                    display: inline-block;
                    margin-right: 6px;`;

      innerHtml += `
        <tr>
          <td>
            <span style="${style}"></span>
            ${body}
          </td>
        </tr>
      `;
    });
    innerHtml += "</tbody>";

    tooltipEl.querySelector("table").innerHTML = innerHtml;
  }

  const { left: canvasLeft, top: canvasTop } =
    chart.canvas.getBoundingClientRect();

  tooltipEl.style.opacity = 1;
  tooltipEl.style.left = canvasLeft + tooltip.caretX + "px";
  tooltipEl.style.top = canvasTop + tooltip.caretY + "px";
};

const createChart = () => {
  if (chartInstance) {
    chartInstance.destroy();
  }

  const ctx = chartRef.value.getContext("2d");
  const config = {
    type: "line",
    data: deepClone(props.chartData),
    options: {
      ...deepClone(props.options),
      interaction: {
        mode: "index",
        intersect: false,
      },
      plugins: {
        ...props.options.plugins,
        tooltip: {
          enabled: false,
          position: "nearest",
          external: externalTooltipHandler,
        },
      },
    },
  };

  chartInstance = new Chart(ctx, config);
};

onMounted(() => {
  createChart();
});

watch(
  [() => props.chartData, () => props.options],
  () => {
    nextTick(() => {
      createChart();
    });
  },
  { deep: true }
);

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }
});
</script>

<style scoped>
.chart-container {
  position: relative;
}
</style>
