// Haversine formula to calculate distance in meters
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth radius in meters
  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // distance in meters
}

// Convert OHEMas like 745/2 or 745/02 -> 74502 (for sorting)
function normalizeOHEMas(val) {
  if (!val) return 0;

  const [main, sub = "0"] = val.split("/");
  return parseInt(main + sub.padStart(2, "0"), 10);
}

export function getDistanceByOHE(data) {
  // Step 1: Sort data based on normalized OHEMas
  // // const sorted = [...data].sort((a, b) => {
  // // console.log(normalizeOHEMas(a.OHEMas));
  // // return normalizeOHEMas(a.OHEMas) - normalizeOHEMas(b.OHEMas);
  //  // });
  const sorted = data; // or your sorted logic

  let cumulativeDistance = 0;

  return sorted.map((item, index, arr) => {
    if (index === 0) {
      return { ...item, distance: 0 };
    }

    const prev = arr[index - 1];

    const segmentDistance = calculateDistance(
      prev.Latitude,
      prev.Longitude,
      item.Latitude,
      item.Longitude,
    );

    cumulativeDistance += segmentDistance;

    return {
      ...item,
      distance: Number(cumulativeDistance.toFixed(2)), // cumulative
    };
  });
}

////////////////////////////////////////////////////////////
export function findNearestWithin(array1, array2, maxDistance = 300) {
  const result = [];

  array1.forEach((point1) => {
    let nearest = null;
    let minDistance = Infinity;

    array2.forEach((point2) => {
      const distance = calculateDistance(
        point1.Latitude,
        point1.Longitude,
        point2.Latitude,
        point2.Longitude,
      );

      if (distance < minDistance) {
        minDistance = distance;
        nearest = point2;
      }
    });

    if (minDistance <= maxDistance) {
      result.push({
        ...point1,
        nearestPoint: nearest,
        distance: minDistance,
      });
    }
  });

  return result;
}
