import React, { useEffect, useMemo, useState } from "react";
import GetExcelData from "./GetExcelData";
import MultiXAxisChart from "../../../Charts/MultiXAxisChart";
import { findNearestWithin, getDistanceByOHE } from "./HalperFunction";

const SpeedHome = () => {
  const [data, setData] = useState({});
  const [distance, setDistance] = useState(null);

  // ================= Calculate Distance =================
  useEffect(() => {
    if (data?.Mast?.length) {
      const OheMastWithDistance = getDistanceByOHE(data.Mast);
      setDistance(OheMastWithDistance);
    }
  }, [data?.Mast]);

  // ================= Build Chart Axes =================
  const chartXAxes = useMemo(() => {
    const axes = [];

    // Primary axis – time (index 0)
    if (data?.PrimaryGPSData?.length) {
      const LocoTime = data.PrimaryGPSData.map((o) => o["Logging Time"]);
      axes.push({
        name: "Time",
        type: "category",
        data: LocoTime,
        axisPointer: { type: "line" },
      });
    }

    // Secondary axis – home signals (index 1)
    if (distance && data.Mast && data?.HomeSignal?.length) {
      const matchDataOfHomeSignal = findNearestWithin(
        data.HomeSignal,
        distance,
        38,
      );

      const matchedHomeSignals = matchDataOfHomeSignal.map(
        (o) =>
          `${o.Station}\n${o.Type}(${(o.nearestPoint.distance / 1000).toFixed(1)}km)`,
      );

      const sorted = matchedHomeSignals.sort((a, b) => {
        const getKm = (str) => {
          const match = str.match(/\(([\d.]+)km\)/);
          return match ? parseFloat(match[1]) : 0;
        };
        return getKm(a) - getKm(b);
      });

      axes.push({
        name: "Signal",
        type: "category",
        data: sorted,
        position: "bottom",
        offset: 50, // give space below the chart
        axisLine: { show: true },
        axisTick: { show: true },
        splitLine: { show: false },
        axisLabel: {
          interval: 0,
          rotate: 45,
          fontSize: 11,
        },
      });
    }

    return axes;
  }, [data?.PrimaryGPSData, data?.HomeSignal, distance]);

  // ================= Build Series =================
  const chartSeriesData = useMemo(() => {
    const series = [];

    if (!data?.PrimaryGPSData?.length) return series;

    const LocoTimeSpeed = data.PrimaryGPSData.map((o) => o["Speed"]);

    // Main speed line – on first xAxis (index 0)
    series.push({
      name: "Time wise Speed",
      type: "line",
      smooth: true,
      xAxisIndex: 0,
      yAxisIndex: 0,
      data: LocoTimeSpeed,
      areaStyle: {
        opacity: 0.2,
        color: "#4497e4",
      },
      lineStyle: {
        color: "#0f87ff",
        width: 2,
      },
      z: 10, // make sure line is visible
    });

    // Home signal markers – on second xAxis (index 1)
    if (distance && data?.HomeSignal?.length) {
      const matchDataOfHomeSignal = findNearestWithin(
        data.HomeSignal,
        distance,
        38,
      );

      // Use a large but reasonable dummy value (much higher than max speed)
      const maxSpeed = Math.max(...LocoTimeSpeed, 1); // avoid NaN / empty
      const dummyHeight = maxSpeed; // 5× max speed is usually enough

      const homeMarkerData = matchDataOfHomeSignal.map(() => 120);

      series.push({
        name: "Home Location",
        type: "bar",
        xAxisIndex: 1,
        yAxisIndex: 0,
        barWidth: 1, // thin vertical line look (adjust 2–8)
        itemStyle: {
          color: "#e74c3c",
          opacity: 0.85,
        },
        emphasis: { disabled: true },
        z: 5, // below the line so line stays on top
        animation: false,
        data: homeMarkerData,
      });
    }

    return series;
  }, [data?.PrimaryGPSData, data?.HomeSignal, distance]);
  const a =
    data.HomeSignal &&
    distance &&
    findNearestWithin(data.HomeSignal, distance, 380);

  const findDuplicatesByTwoKeys = (arr, key1, key2) => {
    const seen = new Set();
    const duplicates = [];

    for (let item of arr) {
      const combinedKey = `${item[key1]}-${item[key2]}`;

      if (seen.has(combinedKey)) {
        duplicates.push(item);
      } else {
        seen.add(combinedKey);
      }
    }

    return duplicates;
  };
  const b =
    data.PrimaryGPSData &&
    a &&
    findNearestWithin(data.HomeSignal, data.PrimaryGPSData, 20);
  console.log(b);
  return (
    <div>
      <GetExcelData data={data} setData={setData} />
      <div className="d-flex justify-content-center">
        {chartSeriesData.length > 0 && chartXAxes.length > 0 && (
          <div className="border">
            {data.PrimaryGPSData && data?.HomeSignal && data.Mast ? (
              <MultiXAxisChart
                xAxes={chartXAxes}
                seriesData={chartSeriesData}
                // If MultiXAxisChart accepts yAxes prop, you can force good scaling:
                // yAxes={[{
                //   type: 'value',
                //   min: 0,
                //   max: 'dataMax',     // or fixed e.g. 200 if you know max speed
                //   name: 'Speed (km/h)',
                // }]}
              />
            ) : (
              <MultiXAxisChart
                xAxes={chartXAxes}
                seriesData={chartSeriesData}
                // If MultiXAxisChart accepts yAxes prop, you can force good scaling:
                // yAxes={[{
                //   type: 'value',
                //   min: 0,
                //   max: 'dataMax',     // or fixed e.g. 200 if you know max speed
                //   name: 'Speed (km/h)',
                // }]}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SpeedHome;
