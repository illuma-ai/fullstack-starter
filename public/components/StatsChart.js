var h = React.createElement;

/**
 * StatsChart — Renders a doughnut chart of item status distribution
 * using Chart.js with Ranger theme CSS variables (--chart-1 through --chart-5).
 *
 * Props:
 *   stats  — { total, byStatus: { todo, in_progress, done }, byPriority: { low, medium, high } }
 *
 * Uses the global `Chart` class from chart.js UMD CDN.
 */
window.StatsChart = function StatsChart(props) {
  var stats = props.stats || { total: 0, byStatus: {}, byPriority: {} };
  var canvasRef = React.useRef(null);
  var chartRef = React.useRef(null);

  /**
   * Read a CSS custom property value from :root and convert to usable color.
   * Ranger stores HSL values without the hsl() wrapper (e.g. "12 76% 61%"),
   * so we wrap them: hsl(12 76% 61%).
   */
  function getChartColor(varName, fallback) {
    var raw = getComputedStyle(document.documentElement)
      .getPropertyValue(varName)
      .trim();
    if (!raw) return fallback;
    // If it already looks like a full color (hex, rgb, hsl with parens), use as-is
    if (
      raw.startsWith("#") ||
      raw.startsWith("rgb") ||
      raw.startsWith("hsl(")
    ) {
      return raw;
    }
    // Otherwise treat as bare HSL components
    return "hsl(" + raw + ")";
  }

  React.useEffect(
    function () {
      if (!canvasRef.current) return;

      // Destroy previous chart instance before creating a new one
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }

      var todo = (stats.byStatus && stats.byStatus.todo) || 0;
      var inProgress = (stats.byStatus && stats.byStatus.in_progress) || 0;
      var done = (stats.byStatus && stats.byStatus.done) || 0;

      // Skip rendering if there's no data at all
      if (todo + inProgress + done === 0) return;

      var colors = [
        getChartColor("--chart-1", "hsl(12 76% 61%)"),
        getChartColor("--chart-2", "hsl(173 58% 39%)"),
        getChartColor("--chart-3", "hsl(197 37% 24%)"),
      ];

      chartRef.current = new Chart(canvasRef.current, {
        type: "doughnut",
        data: {
          labels: ["To Do", "In Progress", "Done"],
          datasets: [
            {
              data: [todo, inProgress, done],
              backgroundColor: colors,
              borderWidth: 0,
              hoverOffset: 6,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: "65%",
          plugins: {
            legend: {
              position: "bottom",
              labels: {
                padding: 16,
                usePointStyle: true,
                pointStyleWidth: 8,
                font: { size: 12 },
                color: getChartColor("--text-secondary", "#565869"),
              },
            },
            tooltip: {
              backgroundColor: "rgba(0,0,0,0.8)",
              titleFont: { size: 13 },
              bodyFont: { size: 12 },
              padding: 10,
              cornerRadius: 8,
            },
          },
        },
      });

      return function () {
        if (chartRef.current) {
          chartRef.current.destroy();
          chartRef.current = null;
        }
      };
    },
    [
      stats.byStatus && stats.byStatus.todo,
      stats.byStatus && stats.byStatus.in_progress,
      stats.byStatus && stats.byStatus.done,
    ],
  );

  var hasData =
    ((stats.byStatus && stats.byStatus.todo) || 0) +
      ((stats.byStatus && stats.byStatus.in_progress) || 0) +
      ((stats.byStatus && stats.byStatus.done) || 0) >
    0;

  return h(
    "div",
    { className: "bg-white rounded-lg border border-gray-200 p-4 card-hover" },
    h(
      "h3",
      { className: "text-sm font-semibold text-gray-700 mb-3" },
      "Status Distribution",
    ),
    hasData
      ? h(
          "div",
          { style: { height: "200px", position: "relative" } },
          h("canvas", { ref: canvasRef }),
        )
      : h(
          "div",
          {
            className:
              "flex items-center justify-center h-48 text-gray-400 text-sm",
          },
          "No data to display",
        ),
  );
};
