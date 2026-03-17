import React, { useRef, useState } from "react";
import * as XLSX from "xlsx";

const COLUMN_CONFIG = {
  PrimaryGPSData: [
    "Device Id",
    "Logging Time",
    "Latitude",
    "Longitude",
    "Speed",
    "distFromPrevLatLng",
    "distFromSpeed",
    "last/cur stationCode",
  ],
  HomeSignal: [
    "sn",
    "Station",
    // "DIRN",
    // "Station-DIRN",
    "Type",
    "Latitude",
    "Longitude",
  ],
  Mast: [
    "SectionID",
    "Latitude",
    "Longitude",
    "Altitude",
    "OHEMas",
    "EngFeature",
    "TRDFeature",
    "PWI",
    "Division",
    "Remark",
    "Satellites",
    "ModifiedDate",
  ],
};

const GetExcelData = ({ data, setData }) => {
  const fileInputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) processFile(file);
    e.target.value = "";
  };

  const processFile = (file) => {
    const reader = new FileReader();

    reader.onload = (evt) => {
      const buffer = evt.target.result;
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      const { type, parsedData } = detectAndBuild(rows);

      if (!type) {
        alert("Unknown Excel format");
        return;
      }

      // 🔥 overwrite only that particular type
      setData((prev) => ({
        ...prev,
        [type]: parsedData,
      }));
    };

    reader.readAsArrayBuffer(file);
  };

  /**
   * Detect which excel type it is and build object
   */
  const detectAndBuild = (rows) => {
    for (const [key, columns] of Object.entries(COLUMN_CONFIG)) {
      const isMatch = rows.length > 0 && columns.every((col) => col in rows[0]);

      if (isMatch) {
        const parsedData = rows.map((row) => {
          const obj = {};
          columns.forEach((col) => (obj[col] = row[col]));
          return obj;
        });

        return { type: key, parsedData };
      }
    }

    return { type: null, parsedData: [] };
  };
  return (
    <div style={{ textAlign: "center", marginTop: 40 }}>
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        style={{
          border: "2px dashed #555",
          padding: 40,
          width: 540,
          margin: "0 auto",
          borderRadius: 8,
        }}
      >
        <h3>Drag & Drop Excel File</h3>
        <p>or use this button</p>
        <div>
          <input
            className="border btn form-control"
            type="file"
            accept=".xls,.xlsx,.csv"
            ref={fileInputRef}
            onChange={handleFileInput}
            style={{ marginBottom: 15 }}
          />
        </div>
      </div>
      <div className="d-flex justify-content-center  ">
        <div
          className={`m-1 p-2 border border-1 card text-white ${data?.Mast ? "bg-success" : "bg-danger"}`}
        >
          Mast Locations
        </div>

        <div
          className={`m-1 p-2 border border-1 card  text-white ${data?.HomeSignal ? "bg-success " : "bg-danger"}`}
        >
          Signals
        </div>
        <div
          className={`m-1 p-2 border border-1 card text-white ${data?.PrimaryGPSData ? "bg-success" : "bg-danger"}`}
        >
          Primary Gps
        </div>
      </div>
    </div>
  );
};

export default GetExcelData;
