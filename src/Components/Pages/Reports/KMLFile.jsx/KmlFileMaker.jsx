import React, { useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const ExcelToKML = () => {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [markers, setMarkers] = useState({}); // { a: base64, b: base64 }

  // Upload Excel / CSV
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event) => {
      const fileData = new Uint8Array(event.target.result);
      const workbook = XLSX.read(fileData, { type: "array" });

      const sheetName = workbook.SheetNames[0];
      const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
        defval: "",
      });

      setData(jsonData);
      if (jsonData.length > 0) {
        setColumns(Object.keys(jsonData[0]));
      }
    };

    reader.readAsArrayBuffer(file);
  };

  // Upload multiple marker images
  const handleMarkerUpload = (e) => {
    const files = Array.from(e.target.files);
    const newMarkers = {};

    files.forEach((file) => {
      const reader = new FileReader();

      reader.onload = () => {
        const name = file.name.split(".")[0]; // a.png → a
        newMarkers[name] = reader.result;

        // update after all loaded
        setMarkers((prev) => ({ ...prev, ...newMarkers }));
      };

      reader.readAsDataURL(file);
    });
  };

  // Generate KML
  const generateKML = () => {
    if (!data.length) return;

    const defaultIcon =
      "http://maps.google.com/mapfiles/kml/pushpin/red-pushpin.png";

    let kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
<Document>
`;

    // Create styles for each marker
    Object.keys(markers).forEach((key) => {
      kml += `
  <Style id="icon-${key}">
    <IconStyle>
      <scale>1.2</scale>
      <Icon>
        <href>${markers[key]}</href>
      </Icon>
      <hotSpot x="0.5" y="0" xunits="fraction" yunits="fraction"/>
    </IconStyle>
  </Style>
`;
    });

    // Default style
    kml += `
  <Style id="defaultIcon">
    <IconStyle>
      <scale>1.2</scale>
      <Icon>
        <href>${defaultIcon}</href>
      </Icon>
      <hotSpot x="0.5" y="0" xunits="fraction" yunits="fraction"/>
    </IconStyle>
  </Style>
`;

    // Add Placemarks
    data.forEach((row, index) => {
      const lat = row.latitude || row.lat;
      const lng = row.longitude || row.lng;
      const markerKey = row.marker; // <-- IMPORTANT COLUMN

      if (!lat || !lng) return;

      const styleId = markers[markerKey]
        ? `#icon-${markerKey}`
        : "#defaultIcon";

      kml += `
  <Placemark>
    <name>${row.name || "Point " + index}</name>
    <description><![CDATA[
      ${Object.entries(row)
        .map(([key, val]) => `<b>${key}</b>: ${val}`)
        .join("<br/>")}
    ]]></description>
    <styleUrl>${styleId}</styleUrl>
    <Point>
      <coordinates>${lng},${lat},0</coordinates>
    </Point>
  </Placemark>
`;
    });

    kml += `
</Document>
</kml>`;

    const blob = new Blob([kml], {
      type: "application/vnd.google-earth.kml+xml",
    });

    saveAs(blob, "output.kml");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Advanced KML Generator</h2>

      {/* File Upload */}
      <div className="">
        <p>Upload CSV / Excel:</p>
        <input
          className="form-select"
          type="file"
          accept=".xlsx, .xls, .csv"
          onChange={handleFileUpload}
        />

        {/* Marker Upload */}
        <div style={{ marginTop: "15px" }}>
          <p>Upload Marker PNGs (a.png, b.png, etc):</p>
          <input
            className="form-select"
            type="file"
            accept="image/png"
            multiple
            onChange={handleMarkerUpload}
          />
        </div>
      </div>

      {/* Columns */}
      {columns.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h4>Columns:</h4>
          <ul>
            {columns.map((col, i) => (
              <li key={i}>{col}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Generate */}
      {data.length > 0 && (
        <button
          className="btn btn-outline-success"
          onClick={generateKML}
          style={{ marginTop: "20px", padding: "10px 20px" }}
        >
          Generate KML
        </button>
      )}
    </div>
  );
};

export default ExcelToKML;
