import { BlockFeature } from '../types/census';

export interface BoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export interface Point {
  x: number;
  y: number;
}

/**
 * Calculates the bounding box of a list of GeoJSON features
 */
export function getBoundingBox(features: BlockFeature[]): BoundingBox {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  features.forEach((feature) => {
    feature.geometry.coordinates.forEach((multi) => {
      multi.forEach((ring) => {
        ring.forEach(([x, y]) => {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        });
      });
    });
  });

  return { minX, minY, maxX, maxY };
}

/**
 * Creates a projection function that maps UTM coords to SVG pixels preserving aspect ratio
 */
export function createSvgProjector(
  bbox: BoundingBox,
  viewWidth: number,
  viewHeight: number,
  padding: number = 30
) {
  const dataWidth = bbox.maxX - bbox.minX;
  const dataHeight = bbox.maxY - bbox.minY;

  const usableWidth = viewWidth - padding * 2;
  const usableHeight = viewHeight - padding * 2;

  const scale = Math.min(usableWidth / dataWidth, usableHeight / dataHeight);

  // Center the map in the viewBox
  const offsetX = padding + (usableWidth - dataWidth * scale) / 2;
  const offsetY = padding + (usableHeight - dataHeight * scale) / 2;

  return function project(x: number, y: number): [number, number] {
    const px = offsetX + (x - bbox.minX) * scale;
    // Map northing (increasing northwards) to SVG Y (increasing downwards)
    const py = offsetY + (bbox.maxY - y) * scale;
    return [Number(px.toFixed(1)), Number(py.toFixed(1))];
  };
}

/**
 * Converts GeoJSON MultiPolygon coordinates into SVG Path 'd' attribute string
 */
export function multiPolygonToSvgPath(
  coordinates: number[][][][],
  project: (x: number, y: number) => [number, number]
): string {
  let d = '';

  coordinates.forEach((multi) => {
    multi.forEach((ring) => {
      if (ring.length === 0) return;
      ring.forEach(([x, y], idx) => {
        const [px, py] = project(x, y);
        if (idx === 0) {
          d += `M ${px} ${py} `;
        } else {
          d += `L ${px} ${py} `;
        }
      });
      d += 'Z ';
    });
  });

  return d.trim();
}

/**
 * Computes polygon visual centroid for labeling and pin indicators
 */
export function calculateCentroid(coordinates: number[][][][]): Point {
  let sumX = 0;
  let sumY = 0;
  let count = 0;

  coordinates.forEach((multi) => {
    multi.forEach((ring) => {
      ring.forEach(([x, y]) => {
        sumX += x;
        sumY += y;
        count++;
      });
    });
  });

  if (count === 0) return { x: 0, y: 0 };
  return {
    x: sumX / count,
    y: sumY / count,
  };
}

/**
 * Converts UTM Zone 44N (WGS84) coordinates to Latitude / Longitude in degrees.
 * Standard Transverse Mercator inverse projection.
 */
export function utmZone44NToLatLon(easting: number, northing: number): { lat: number; lon: number } {
  const a = 6378137.0; // WGS84 semi-major axis
  const f = 1 / 298.257223563; // flattening
  const k0 = 0.9996; // scale factor
  const lon0 = 81.0 * (Math.PI / 180); // central meridian for UTM Zone 44 (81° E)

  const e = Math.sqrt(2 * f - f * f);
  const eSq = e * e;
  const ePrimeSq = eSq / (1 - eSq);

  const x = easting - 500000.0; // remove false easting
  const y = northing;

  const M = y / k0;
  const mu = M / (a * (1 - eSq / 4 - (3 * eSq * eSq) / 64 - (5 * eSq * eSq * eSq) / 256));

  const e1 = (1 - Math.sqrt(1 - eSq)) / (1 + Math.sqrt(1 - eSq));

  const phi1 =
    mu +
    ((3 * e1) / 2 - (27 * Math.pow(e1, 3)) / 32) * Math.sin(2 * mu) +
    ((21 * e1 * e1) / 16 - (55 * Math.pow(e1, 4)) / 32) * Math.sin(4 * mu) +
    ((151 * Math.pow(e1, 3)) / 96) * Math.sin(6 * mu);

  const N1 = a / Math.sqrt(1 - eSq * Math.sin(phi1) * Math.sin(phi1));
  const T1 = Math.tan(phi1) * Math.tan(phi1);
  const C1 = ePrimeSq * Math.cos(phi1) * Math.cos(phi1);
  const R1 = (a * (1 - eSq)) / Math.pow(1 - eSq * Math.sin(phi1) * Math.sin(phi1), 1.5);
  const D = x / (N1 * k0);

  const latRad =
    phi1 -
    ((N1 * Math.tan(phi1)) / R1) *
      ((D * D) / 2 -
        ((5 + 3 * T1 + 10 * C1 - 4 * C1 * C1 - 9 * ePrimeSq) * Math.pow(D, 4)) / 24 +
        ((61 + 90 * T1 + 298 * C1 + 45 * T1 * T1 - 252 * ePrimeSq - 3 * C1 * C1) * Math.pow(D, 6)) /
          720);

  const lonRad =
    lon0 +
    (D -
      ((1 + 2 * T1 + C1) * Math.pow(D, 3)) / 6 +
      ((5 - 2 * C1 + 28 * T1 - 3 * C1 * C1 + 8 * ePrimeSq + 24 * T1 * T1) * Math.pow(D, 5)) /
        120) /
      Math.cos(phi1);

  return {
    lat: Number((latRad * (180 / Math.PI)).toFixed(4)),
    lon: Number((lonRad * (180 / Math.PI)).toFixed(4)),
  };
}

/**
 * Number formatting utilities
 */
export function formatNumber(val: number): string {
  return new Intl.NumberFormat('en-IN').format(Math.round(val));
}

export function formatDecimal(val: number, decimals: number = 1): string {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(val);
}

export function formatPercent(val: number): string {
  return `${formatDecimal(val, 1)}%`;
}

/**
 * Converts block features into standard CSV formatted string
 */
export function exportBlocksToCSV(features: BlockFeature[]): string {
  const headers = [
    'OBJECTID',
    'Block_Name',
    'Block_Code',
    'District_Name',
    'Total_Population',
    'Total_Males',
    'Total_Females',
    'Children_0_6',
    'Total_Households',
    'Scheduled_Caste_Pop',
    'Scheduled_Tribe_Pop',
    'Total_Literates',
    'Male_Literates',
    'Female_Literates',
    'Total_Illiterates',
    'Total_Workers',
    'Main_Workers',
    'Main_Cultivators',
    'Main_Ag_Labourers',
    'Main_HH_Industry',
    'Main_Other_Workers',
    'Marginal_Workers',
    'Non_Workers',
    'Shape_Area_SqM',
    'Shape_Length_M',
    'Area_SqKm',
    'Density_Per_SqKm',
  ];

  const lines = [headers.join(',')];

  features.forEach((f) => {
    const p = f.properties;
    const areaSqKm = (p.Shape_Area / 1_000_000).toFixed(2);
    const density = (p.TOT_P / (p.Shape_Area / 1_000_000)).toFixed(2);

    const row = [
      p.OBJECTID,
      `"${p.Name}"`,
      `"${p.Block_Code}"`,
      `"${p.Dist_Name}"`,
      p.TOT_P,
      p.TOT_M,
      p.TOT_F,
      p.P_06,
      p.No_HH,
      p.P_SC,
      p.P_ST,
      p.P_LIT,
      p.M_LIT,
      p.F_LIT,
      p.P_ILL,
      p.TOT_WORK_P,
      p.MAINWORK_P,
      p.MAIN_CL_P,
      p.MAIN_AL_P,
      p.MAIN_HH_P,
      p.MAIN_OT_P,
      p.MARGWORK_P,
      p.NON_WORK_P,
      p.Shape_Area.toFixed(4),
      p.Shape_Leng.toFixed(4),
      areaSqKm,
      density,
    ];

    lines.push(row.join(','));
  });

  return lines.join('\n');
}

/**
 * Converts a list of BlockFeatures with UTM Zone 44N coordinates to WGS84 GeoJSON features ([lon, lat])
 */
export function convertFeaturesToWgs84(features: BlockFeature[]): any[] {
  return features.map((f) => ({
    type: 'Feature',
    properties: f.properties,
    geometry: {
      type: 'MultiPolygon',
      coordinates: f.geometry.coordinates.map((multi) =>
        multi.map((ring) =>
          ring.map(([x, y]) => {
            const { lon, lat } = utmZone44NToLatLon(x, y);
            return [lon, lat];
          })
        )
      ),
    },
  }));
}

