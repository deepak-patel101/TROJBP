import React from "react";
import ReactECharts from "echarts-for-react";

const MultiXAxisChart = ({ xAxes = [], seriesData = [] }) => {
  const AXIS_GAP = 30;
  // Helper: find nearest category index & value for a given axis & target value
  const findNearest = (axisData = [], target) => {
    if (!axisData?.length) return { index: -1, value: "—" };

    let closestIndex = 0;
    let minDiff = Math.abs(target - (Number(axisData[0]) || 0));

    for (let i = 1; i < axisData.length; i++) {
      const diff = Math.abs(target - (Number(axisData[i]) || 0));
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = i;
      }
    }

    return {
      index: closestIndex,
      value: axisData[closestIndex] ?? "—",
    };
  };

  const option = {
    grid: {
      left: 40,
      right: 20,
      top: 20,
      bottom: xAxes.length * AXIS_GAP + 120,
    },

    tooltip: {
      trigger: "axis",
      confine: true,
      backgroundColor: "rgba(24, 26, 38, 0.92)",
      borderColor: "#444",
      borderWidth: 1,
      padding: [10, 12],
      textStyle: {
        color: "#e5e7eb",
        fontSize: 13,
        fontFamily: "system-ui, -apple-system, sans-serif",
      },
      extraCssText:
        "box-shadow: 0 4px 16px rgba(0,0,0,0.5); border-radius: 6px;",

      axisPointer: {
        type: "cross", // shows crosshair → helps user see snap position
        label: {
          backgroundColor: "#555",
        },
        lineStyle: {
          color: "#888",
          type: "dashed",
        },
      },

      formatter: (params) => {
        if (!params?.length) return "";

        // Use the axisValue from the primary snap (usually first axis or the one with snap)
        const hoveredValue =
          params[0].axisValue != null ? Number(params[0].axisValue) : null;
        const newNearest = params[1].axisValue;
        let header = "";

        xAxes.forEach((axis, i) => {
          let label = "—";

          // Special handling for "Home" axis
          if (axis.name === "Signal") {
            if (hoveredValue != null) {
              const nearest = findNearest(axis.data, hoveredValue);
              label = nearest.value;
              // Example format: "Home - Bhel Home (102.22km)"
              // Adjust this line to your real naming logic
              if (typeof label === "string" && label.includes("km")) {
                label = `${newNearest}`;
              } else if (nearest.value !== "—") {
                label = `${newNearest}`;
              }
            }
          } else {
            // For other axes → try to use aligned index first, fallback to nearest
            const dataIndex = params[0].dataIndex;
            label = axis.data?.[dataIndex] ?? "—";

            // If no match or misalignment → fallback to nearest
            if (label === "—" && hoveredValue != null) {
              label = findNearest(axis.data, hoveredValue).value;
            }
          }

          if (!label || label === "—") return;

          header += `
            <div style="margin:4px 0;">
              <span style="color:#94a3b8; font-weight:500;">${axis.name || `Axis ${i + 1}`}</span>
              <span style="color:#e5e7eb;">: ${label}</span>
            </div>
          `;
        });

        // Series values (filtered out "Home Location" as before)
        const seriesLines = params
          .filter((p) => p.value != null && p.seriesName !== "Home Location")
          .map((p) => {
            const marker = `<span style="display:inline-block; margin-right:8px; width:10px; height:10px; border-radius:50%; background:${p.color || "#999"};"></span>`;
            let val = p.value;
            if (typeof val === "number") {
              val = val.toLocaleString(undefined, { maximumFractionDigits: 2 });
            }
            return `
              <div style="display:flex; align-items:center; margin:6px 0;">
                ${marker}
                <span style="flex:1; color:#d1d5db;">${p.seriesName || "Series"}</span>
                <span style="font-weight:600; color:#fff;">${val}</span>
              </div>`;
          })
          .join("");

        return `
          <div style="min-width:160px; font-size:13px;">
            <div style="margin-bottom:8px; padding-bottom:6px; border-bottom:1px solid #444;">
              ${header || '<div style="color:#888;">No axis label</div>'}
            </div>
            ${seriesLines || '<div style="color:#888; text-align:center;">No data</div>'}
          </div>
        `;
      },
    },

    xAxis: xAxes.map((axis, index) => ({
      type: "category",
      position: "bottom",
      offset: index * AXIS_GAP,
      name: axis.name,
      data: axis.data,
      axisTick: { show: false },
      axisPointer: {
        snap: true, // important: enables snapping to nearest category
      },
    })),

    yAxis: { type: "value" },

    series: seriesData.map((s) => ({
      name: s.name,
      type: s.type || "line",
      data: s.data,
      xAxisIndex: s.xAxisIndex || 0,
      yAxisIndex: s.yAxisIndex || 0,
      smooth: s.smooth ?? false,
      symbol: s.symbol || "circle",
      symbolSize: s.symbolSize || 6,
      lineStyle: s.lineStyle || {},
      itemStyle: s.itemStyle || {},
      barWidth: s.barWidth,
      areaStyle: s.areaStyle,
    })),

    dataZoom: [
      {
        type: "slider",
        show: true,
        xAxisIndex: xAxes.map((_, i) => i),
        bottom: 20,
        height: 20,
      },
      {
        type: "inside",
        xAxisIndex: xAxes.map((_, i) => i),
      },
    ],
  };

  return (
    <ReactECharts option={option} style={{ height: 450, width: "95vw" }} />
  );
};

export default MultiXAxisChart;
