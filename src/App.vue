<template>
  <div class="chart-container">
    <h1>Front-End Software Engineer Test Projects</h1>
    <h2 class="chart-title">Rise of Bitcoin - Using Vue.js and D3</h2>
    <div id="chart" ref="chartRef"></div>

    <!-- Annotation Manager Component -->
    <div class="annotation-manager">
      <h3 class="manager-title">Annotation Manager</h3>

      <div v-if="annotationList.length === 0" class="no-annotations">
        <p>No annotations to display</p>
      </div>

      <div v-else class="annotation-list">
        <div
          v-for="(annotation, index) in annotationList"
          :key="annotation.id"
          class="annotation-item"
        >
          <div class="annotation-content">
            <div class="annotation-header">
              <span class="annotation-date">{{ annotation.note.title }}</span>
              <span class="annotation-type">{{
                getAnnotationType(annotation.type)
              }}</span>
            </div>
            <p class="annotation-description">{{ annotation.note.label }}</p>
          </div>

          <div class="annotation-actions">
            <button
              @click="deleteAnnotation(index)"
              class="delete-btn"
              :title="`Delete annotation: ${annotation.note.title}`"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import * as d3 from 'd3';
import { useAnnotations } from './composables/useAnnotations';
import {
  ChartAxes,
  ChartDimensions,
  ChartScales,
  PriceData,
  ProcessedData,
} from './types';

const CHART_DIMENSIONS: ChartDimensions = {
  width: 1300,
  height: 600,
  margin: { top: 20, right: 30, bottom: 30, left: 40 },
};

const CHART_COLORS = {
  line: '#3172bc',
  annotation: '#ff6b6b',
  annotationHover: '#ff5252',
  axis: '#333',
  background: '#f5f5f5',
} as const;

// Reactive References
const chartRef = ref<HTMLElement>();

const {
  annotationList,
  createAnnotations,
  renderAnnotations,
  deleteAnnotation,
  getAnnotationType,
} = useAnnotations();

const debugLog = (message: string): void => {
  console.log(`[Chart Debug]: ${message}`);
};

const createScales = (data: ProcessedData[]): ChartScales => {
  const { width, height } = CHART_DIMENSIONS;

  const x = d3
    .scaleTime()
    .domain(d3.extent(data, (d) => d.date) as [Date, Date])
    .range([0, width]);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.value) as number])
    .nice()
    .range([height, 0]);

  return { x, y };
};

const createAxes = (scales: ChartScales): ChartAxes => {
  const { width } = CHART_DIMENSIONS;

  const xAxis = d3
    .axisBottom(scales.x)
    .ticks(width / 80)
    .tickSizeOuter(0);

  const yAxis = d3.axisLeft(scales.y);

  return { xAxis, yAxis };
};

const renderAxes = (
  svg: d3.Selection<SVGGElement, unknown, any, any>,
  axes: ChartAxes,
  height: number
): void => {
  // X-axis
  svg
    .append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0,${height})`)
    .call(axes.xAxis);

  // Y-axis
  svg
    .append('g')
    .attr('class', 'y-axis')
    .call(axes.yAxis)
    .call((g) => g.select('.domain').remove())
    .call((g) =>
      g
        .select('.tick:last-of-type text')
        .clone()
        .attr('x', 3)
        .attr('text-anchor', 'start')
        .attr('font-weight', 'bold')
        .text('Bitcoin Price (USD)')
    );
};

const renderLine = (
  svg: d3.Selection<SVGGElement, unknown, any, any>,
  data: ProcessedData[],
  scales: ChartScales
): void => {
  const line = d3
    .line<ProcessedData>()
    .defined((d) => !isNaN(d.value))
    .x((d) => scales.x(d.date))
    .y((d) => scales.y(d.value))
    .curve(d3.curveMonotoneX);

  svg
    .append('path')
    .datum(data)
    .attr('fill', 'none')
    .attr('stroke', CHART_COLORS.line)
    .attr('stroke-width', 1.5)
    .attr('stroke-linejoin', 'round')
    .attr('stroke-linecap', 'round')
    .attr('d', line);
};

const createChart = async (): Promise<void> => {
  try {
    debugLog('Initializing chart...');

    // Clear existing chart
    if (chartRef.value) {
      chartRef.value.innerHTML = '';
    }

    // Load data
    const response = await fetch('/prices.json');
    const pricesData: PriceData[] = await response.json();

    const data: ProcessedData[] = pricesData.map((d) => ({
      date: new Date(d.date),
      value: d.value,
    }));

    debugLog(`Loaded ${data.length} data points`);

    // Create SVG container
    const { width, height, margin } = CHART_DIMENSIONS;
    const chartHeight = height - margin.top - margin.bottom;

    const svg = d3
      .select('#chart')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left + 40}, ${margin.top})`);

    // Create and render chart components
    const scales = createScales(data);
    const axes = createAxes(scales);

    renderAxes(svg, axes, chartHeight);
    renderLine(svg, data, scales);

    const annotations = createAnnotations(data, scales);
    renderAnnotations(svg, annotations);

    // Add instructions
    svg
      .append('text')
      .attr('x', width + 20)
      .attr('y', 20)
      .attr('font-size', '12px')
      .attr('fill', '#666')
      .text('Annotations are draggable and interactive');

    debugLog('Chart created successfully!');
  } catch (error) {
    debugLog(
      `Error creating chart: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
    console.error('Chart creation failed:', error);
  }
};

onMounted(() => {
  createChart();
});
</script>

<style scoped>
.chart-container {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.chart-title {
  width: 100%;
  text-align: left;
  color: black;
  margin-left: 40px;
  font-weight: 500;
  font-size: 1.2rem;
}

h1 {
  text-align: center;
  color: #333;
  margin-bottom: 10px;
  font-weight: 600;
}

h2 {
  text-align: center;
  color: #666;
  margin-bottom: 30px;
  font-weight: normal;
}

/* Chart Styles */
.x-axis path,
.x-axis line,
.y-axis path,
.y-axis line {
  fill: none;
  stroke: #333;
  shape-rendering: crispEdges;
}

.x-axis text,
.y-axis text {
  font-size: 12px;
  fill: #333;
}

/* Annotation Styles */
.annotation-note {
  background-color: rgba(255, 255, 255, 0.95);
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 8px;
  font-size: 12px;
  max-width: 200px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
}

.annotation-subject {
  fill: #ff6b6b;
  stroke: white;
  stroke-width: 2;
  cursor: move;
}

.annotation-subject:hover {
  fill: #ff5252;
}

/* Custom Annotation Styles */
.custom-annotation {
  cursor: move;
}

.custom-annotation-line {
  stroke: #ff6b6b;
  stroke-width: 2;
}

.custom-annotation-circle {
  fill: #ff6b6b;
  stroke: white;
  stroke-width: 2;
}

.custom-annotation-text {
  font-size: 12px;
  font-weight: bold;
  fill: #333;
  text-anchor: middle;
}

.custom-annotation-event {
  font-size: 10px;
  fill: #666;
  text-anchor: middle;
}

/* Highlighted annotation styles */
.annotation-highlighted {
  filter: drop-shadow(0 0 8px rgba(33, 150, 243, 0.6));
}

.annotation-highlighted .annotation-note {
  background-color: rgba(33, 150, 243, 0.1) !important;
  border-color: #2196f3 !important;
}

.annotation-highlighted .annotation-subject {
  fill: #2196f3 !important;
  stroke: #1976d2 !important;
}

/* Annotation Manager Styles */
.annotation-manager {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-top: 20px;
  overflow: hidden;
}

.manager-title {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  margin: 0;
  padding: 16px 20px;
  font-size: 18px;
  font-weight: 600;
  text-align: center;
}

.no-annotations {
  padding: 40px 20px;
  text-align: center;
  color: #6c757d;
}

.no-annotations p {
  margin: 0;
  font-size: 16px;
  font-style: italic;
}

.annotation-list {
  overflow-y: auto;
  overflow-x: hidden;
}

.annotation-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 16px 20px;
  border-bottom: 1px solid #e9ecef;
  transition: all 0.2s ease;
  background: white;
}

.annotation-item:last-child {
  border-bottom: none;
}

.annotation-item:hover {
  background: #f8f9fa;
  transform: translateX(2px);
}

.annotation-item.highlighted {
  background: #e3f2fd;
  border-left: 4px solid #2196f3;
}

.annotation-content {
  flex: 1;
  margin-right: 16px;
}

.annotation-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.annotation-date {
  font-weight: 600;
  color: #495057;
  font-size: 14px;
}

.annotation-type {
  background: #e9ecef;
  color: #6c757d;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.annotation-description {
  margin: 0;
  color: #6c757d;
  font-size: 13px;
  line-height: 1.4;
  max-width: 300px;
}

.annotation-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.highlight-btn,
.delete-btn {
  background: none;
  border: none;
  border-radius: 6px;
  padding: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.highlight-btn {
  color: #6c757d;
}

.highlight-btn:hover {
  background: #e3f2fd;
  color: #2196f3;
}

.highlight-btn.active {
  background: #2196f3;
  color: white;
}

.delete-btn {
  color: #6c757d;
}

.delete-btn:hover {
  background: #ffebee;
  color: #f44336;
}

.manager-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
}

.footer-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.debug-btn {
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.debug-btn:hover {
  background: #5a6268;
  transform: translateY(-1px);
}

.annotation-count {
  color: #6c757d;
  font-size: 14px;
  font-weight: 500;
}

.clear-all-btn {
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.clear-all-btn:hover {
  background: #c82333;
  transform: translateY(-1px);
}

/* Scrollbar styling */
.annotation-list::-webkit-scrollbar {
  width: 6px;
}

.annotation-list::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.annotation-list::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.annotation-list::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Responsive design */
@media (max-width: 768px) {
  .annotation-item {
    flex-direction: column;
    gap: 12px;
  }

  .annotation-actions {
    align-self: flex-end;
  }

  .annotation-description {
    max-width: none;
  }
}
</style>
