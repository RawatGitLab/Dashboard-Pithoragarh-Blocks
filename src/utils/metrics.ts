import { BlockFeature, BlockProperties, DerivedMetrics, MetricDefinition, MetricKey } from '../types/census';
import { calculateCentroid, formatDecimal, formatNumber, formatPercent, utmZone44NToLatLon } from './geoUtils';

export const METRIC_DEFINITIONS: Record<MetricKey, MetricDefinition> = {
  TOT_P: {
    id: 'TOT_P',
    label: 'Total Population',
    category: 'Demographics',
    unit: 'persons',
    format: (v) => formatNumber(v),
    description: 'Total resident population across all households in the CD Block according to Census data.',
    palette: 'indigo',
  },
  density: {
    id: 'density',
    label: 'Population Density',
    category: 'Demographics',
    unit: 'persons / km²',
    format: (v) => `${formatDecimal(v, 1)} /km²`,
    description: 'Population density calculated as Total Population divided by geographical block area in square kilometers.',
    palette: 'cyan',
  },
  areaSqKm: {
    id: 'areaSqKm',
    label: 'Geographical Area',
    category: 'Geography',
    unit: 'km²',
    format: (v) => `${formatDecimal(v, 1)} km²`,
    description: 'Total land area of the Community Development Block in square kilometers.',
    palette: 'emerald',
  },
  No_HH: {
    id: 'No_HH',
    label: 'Total Households',
    category: 'Demographics',
    unit: 'households',
    format: (v) => formatNumber(v),
    description: 'Number of recorded normal and institutional households.',
    palette: 'indigo',
  },
  avgHouseholdSize: {
    id: 'avgHouseholdSize',
    label: 'Avg Household Size',
    category: 'Demographics',
    unit: 'persons / HH',
    format: (v) => formatDecimal(v, 2),
    description: 'Average number of persons residing per household (Total Population / Households).',
    palette: 'amber',
  },
  sexRatio: {
    id: 'sexRatio',
    label: 'Sex Ratio (Overall)',
    category: 'Gender & Social',
    unit: 'F / 1000 M',
    format: (v) => `${Math.round(v)} ♀ / 1000 ♂`,
    description: 'Number of females per 1,000 males across the total population. Hill districts of Kumaon often show favorable female sex ratios.',
    palette: 'rose',
  },
  childSexRatio: {
    id: 'childSexRatio',
    label: 'Child Sex Ratio (0-6)',
    category: 'Gender & Social',
    unit: 'F / 1000 M (0-6)',
    format: (v) => `${Math.round(v)} ♀ / 1000 ♂`,
    description: 'Number of girl children per 1,000 boy children in the 0 to 6 years age cohort.',
    palette: 'rose',
  },
  effectiveLiteracyRate: {
    id: 'effectiveLiteracyRate',
    label: 'Effective Literacy Rate',
    category: 'Literacy',
    unit: '%',
    format: (v) => formatPercent(v),
    description: 'Percentage of population aged 7 and above who can read and write with understanding (P_LIT / (TOT_P - P_06) * 100).',
    palette: 'emerald',
  },
  femaleLiteracyRate: {
    id: 'femaleLiteracyRate',
    label: 'Female Literacy Rate',
    category: 'Literacy',
    unit: '%',
    format: (v) => formatPercent(v),
    description: 'Literacy rate among females aged 7 and above (F_LIT / (TOT_F - F_06) * 100).',
    palette: 'emerald',
  },
  literacyGenderGap: {
    id: 'literacyGenderGap',
    label: 'Literacy Gender Gap',
    category: 'Literacy',
    unit: '% pts',
    format: (v) => `${formatDecimal(v, 1)}% pts`,
    description: 'Difference between Male Literacy Rate and Female Literacy Rate. Lower gap indicates greater gender educational parity.',
    palette: 'amber',
    isInverseBetter: true,
  },
  workParticipationRate: {
    id: 'workParticipationRate',
    label: 'Work Participation Rate',
    category: 'Economy & Work',
    unit: '%',
    format: (v) => formatPercent(v),
    description: 'Percentage of total population engaged in economic work (Main Workers + Marginal Workers).',
    palette: 'cyan',
  },
  femaleWorkParticipationRate: {
    id: 'femaleWorkParticipationRate',
    label: 'Female Work Participation',
    category: 'Economy & Work',
    unit: '%',
    format: (v) => formatPercent(v),
    description: 'Percentage of total females engaged in agricultural or other economic workforce.',
    palette: 'violet',
  },
  cultivatorShare: {
    id: 'cultivatorShare',
    label: 'Cultivator Share in Workers',
    category: 'Economy & Work',
    unit: '% of workers',
    format: (v) => formatPercent(v),
    description: 'Proportion of total workers who are agricultural cultivators (owners/tenants of cultivated land).',
    palette: 'amber',
  },
  otherWorkerShare: {
    id: 'otherWorkerShare',
    label: 'Other Workers (Services/Govt)',
    category: 'Economy & Work',
    unit: '% of workers',
    format: (v) => formatPercent(v),
    description: 'Workers in non-agricultural vocations including government services, tourism, trade, defence, and transportation.',
    palette: 'indigo',
  },
  scShare: {
    id: 'scShare',
    label: 'Scheduled Caste (SC) Share',
    category: 'Gender & Social',
    unit: '%',
    format: (v) => formatPercent(v),
    description: 'Percentage of the block population belonging to Scheduled Castes.',
    palette: 'violet',
  },
  stShare: {
    id: 'stShare',
    label: 'Scheduled Tribe (ST) Share',
    category: 'Gender & Social',
    unit: '%',
    format: (v) => formatPercent(v),
    description: 'Percentage of the block population belonging to Scheduled Tribes (prominent Rung/Shauka communities in Munsiari & Dharchula).',
    palette: 'violet',
  },
};

/**
 * Computes derived metrics for a block feature
 */
export function computeBlockDerivedMetrics(feature: BlockFeature): DerivedMetrics {
  const p = feature.properties;
  const areaSqKm = p.Shape_Area / 1_000_000;
  const perimeterKm = p.Shape_Leng / 1_000;
  const density = p.TOT_P / areaSqKm;
  const avgHouseholdSize = p.No_HH > 0 ? p.TOT_P / p.No_HH : 0;

  const sexRatio = p.TOT_M > 0 ? (p.TOT_F / p.TOT_M) * 1000 : 0;
  const childSexRatio = p.M_06 > 0 ? (p.F_06 / p.M_06) * 1000 : 0;
  const childShare = p.TOT_P > 0 ? (p.P_06 / p.TOT_P) * 100 : 0;

  // Effective literacy (age 7+)
  const pop7Plus = p.TOT_P - p.P_06;
  const male7Plus = p.TOT_M - p.M_06;
  const female7Plus = p.TOT_F - p.F_06;

  const effectiveLiteracyRate = pop7Plus > 0 ? (p.P_LIT / pop7Plus) * 100 : 0;
  const maleLiteracyRate = male7Plus > 0 ? (p.M_LIT / male7Plus) * 100 : 0;
  const femaleLiteracyRate = female7Plus > 0 ? (p.F_LIT / female7Plus) * 100 : 0;
  const literacyGenderGap = maleLiteracyRate - femaleLiteracyRate;

  // Workforce
  const workParticipationRate = p.TOT_P > 0 ? (p.TOT_WORK_P / p.TOT_P) * 100 : 0;
  const maleWorkParticipationRate = p.TOT_M > 0 ? (p.TOT_WORK_M / p.TOT_M) * 100 : 0;
  const femaleWorkParticipationRate = p.TOT_F > 0 ? (p.TOT_WORK_F / p.TOT_F) * 100 : 0;

  const mainWorkerRatio = p.TOT_WORK_P > 0 ? (p.MAINWORK_P / p.TOT_WORK_P) * 100 : 0;
  const marginalWorkerRatio = p.TOT_WORK_P > 0 ? (p.MARGWORK_P / p.TOT_WORK_P) * 100 : 0;

  const totalCultivators = p.MAIN_CL_P + p.MARG_CL_P;
  const totalAgLabour = p.MAIN_AL_P + p.MARG_AL_P;
  const totalHHIndustry = p.MAIN_HH_P + p.MARG_HH_P;
  const totalOtherWorkers = p.MAIN_OT_P + p.MARG_OT_P;

  const cultivatorShare = p.TOT_WORK_P > 0 ? (totalCultivators / p.TOT_WORK_P) * 100 : 0;
  const agLabourShare = p.TOT_WORK_P > 0 ? (totalAgLabour / p.TOT_WORK_P) * 100 : 0;
  const householdIndustryShare = p.TOT_WORK_P > 0 ? (totalHHIndustry / p.TOT_WORK_P) * 100 : 0;
  const otherWorkerShare = p.TOT_WORK_P > 0 ? (totalOtherWorkers / p.TOT_WORK_P) * 100 : 0;

  const scShare = p.TOT_P > 0 ? (p.P_SC / p.TOT_P) * 100 : 0;
  const stShare = p.TOT_P > 0 ? (p.P_ST / p.TOT_P) * 100 : 0;

  // Geographic Lat/Lon
  const centroidUtm = calculateCentroid(feature.geometry.coordinates);
  const latLon = utmZone44NToLatLon(centroidUtm.x, centroidUtm.y);

  return {
    areaSqKm,
    perimeterKm,
    density,
    avgHouseholdSize,
    sexRatio,
    childSexRatio,
    childShare,
    effectiveLiteracyRate,
    maleLiteracyRate,
    femaleLiteracyRate,
    literacyGenderGap,
    workParticipationRate,
    maleWorkParticipationRate,
    femaleWorkParticipationRate,
    mainWorkerRatio,
    marginalWorkerRatio,
    cultivatorShare,
    agLabourShare,
    householdIndustryShare,
    otherWorkerShare,
    scShare,
    stShare,
    approxLat: latLon.lat,
    approxLon: latLon.lon,

    // Aliases
    literacyRateTotal: effectiveLiteracyRate,
    literacyRateMale: maleLiteracyRate,
    literacyRateFemale: femaleLiteracyRate,
    workforceParticipationRate: workParticipationRate,
    scPercentage: scShare,
    stPercentage: stShare,
    effectivePopulation: pop7Plus,
    percentageOfDistrictPopulation: (p.TOT_P / 413524) * 100,
  };
}

/**
 * Calculates derived metrics for either BlockFeature or BlockProperties
 */
export function calculateDerivedMetrics(
  item: BlockFeature | BlockProperties
): DerivedMetrics {
  if ('geometry' in item) {
    return computeBlockDerivedMetrics(item);
  }
  // If only properties passed, wrap in synthetic feature
  return computeBlockDerivedMetrics({
    type: 'Feature',
    properties: item,
    geometry: { type: 'MultiPolygon', coordinates: [] },
  });
}

/**
 * Calculates district aggregate totals
 */
export function calculateDistrictTotals(features?: BlockFeature[]) {
  // If not supplied, lazily import or use predefined aggregate numbers
  const blockList = features && features.length > 0 ? features : null;

  const totals = {
    totalPopulation: 0,
    totalMales: 0,
    totalFemales: 0,
    totalChildren06: 0,
    totalLiterates: 0,
    totalIlliterates: 0,
    totalWorkers: 0,
    totalMainWorkers: 0,
    totalMarginalWorkers: 0,
    totalNonWorkers: 0,
    totalHouseholds: 0,
    totalSc: 0,
    totalSt: 0,
    totalAreaSqKm: 0,
    MAIN_CL_P: 0,
    MAIN_AL_P: 0,
    MAIN_HH_P: 0,
    MAIN_OT_P: 0,
    MAINWORK_P: 0,
    TOT_P: 0,
    No_HH: 0,
    areaSqKm: 0,
    density: 0,
    literacyRateTotal: 0,
    literacyRateMale: 0,
    literacyRateFemale: 0,
    literacyGenderGap: 0,
    blockCount: blockList ? blockList.length : 8,
  };

  if (blockList) {
    blockList.forEach((f) => {
      const p = f.properties;
      totals.totalPopulation += p.TOT_P;
      totals.totalMales += p.TOT_M;
      totals.totalFemales += p.TOT_F;
      totals.totalChildren06 += p.P_06;
      totals.totalLiterates += p.P_LIT;
      totals.totalIlliterates += p.P_ILL;
      totals.totalWorkers += p.TOT_WORK_P;
      totals.totalMainWorkers += p.MAINWORK_P;
      totals.totalMarginalWorkers += p.MARGWORK_P;
      totals.totalNonWorkers += p.NON_WORK_P;
      totals.totalHouseholds += p.No_HH;
      totals.totalSc += p.P_SC;
      totals.totalSt += p.P_ST;
      totals.totalAreaSqKm += p.Shape_Area / 1_000_000;
      totals.MAIN_CL_P += p.MAIN_CL_P;
      totals.MAIN_AL_P += p.MAIN_AL_P;
      totals.MAIN_HH_P += p.MAIN_HH_P;
      totals.MAIN_OT_P += p.MAIN_OT_P;
      totals.MAINWORK_P += p.MAINWORK_P;
    });
  } else {
    // Pre-aggregated census district totals for Pithoragarh CD Blocks
    totals.totalPopulation = 413524;
    totals.totalMales = 205624;
    totals.totalFemales = 207900;
    totals.totalChildren06 = 53883;
    totals.totalLiterates = 301003;
    totals.totalIlliterates = 112521;
    totals.totalWorkers = 203893;
    totals.totalMainWorkers = 120531;
    totals.totalMarginalWorkers = 83362;
    totals.totalNonWorkers = 209631;
    totals.totalHouseholds = 97063;
    totals.totalSc = 104768;
    totals.totalSt = 20857;
    totals.totalAreaSqKm = 7215.11;
    totals.MAIN_CL_P = 62892;
    totals.MAIN_AL_P = 3450;
    totals.MAIN_HH_P = 3491;
    totals.MAIN_OT_P = 50698;
    totals.MAINWORK_P = 120531;
  }

  totals.TOT_P = totals.totalPopulation;
  totals.No_HH = totals.totalHouseholds;
  totals.areaSqKm = totals.totalAreaSqKm;
  totals.density = totals.totalAreaSqKm > 0 ? totals.totalPopulation / totals.totalAreaSqKm : 0;

  const pop7Plus = totals.totalPopulation - totals.totalChildren06;
  const male7Plus = totals.totalMales - 28543;
  const female7Plus = totals.totalFemales - 25340;

  const effectiveLiteracyRate = pop7Plus > 0 ? (totals.totalLiterates / pop7Plus) * 100 : 0;
  const literacyRateMale = male7Plus > 0 ? (166664 / male7Plus) * 100 : 0;
  const literacyRateFemale = female7Plus > 0 ? (134339 / female7Plus) * 100 : 0;

  totals.literacyRateTotal = effectiveLiteracyRate;
  totals.literacyRateMale = literacyRateMale;
  totals.literacyRateFemale = literacyRateFemale;
  totals.literacyGenderGap = literacyRateMale - literacyRateFemale;

  const sexRatio = totals.totalMales > 0 ? (totals.totalFemales / totals.totalMales) * 1000 : 0;
  const overallDensity = totals.totalAreaSqKm > 0 ? totals.totalPopulation / totals.totalAreaSqKm : 0;
  const workParticipationRate = totals.totalPopulation > 0 ? (totals.totalWorkers / totals.totalPopulation) * 100 : 0;

  return {
    ...totals,
    effectiveLiteracyRate,
    sexRatio,
    overallDensity,
    workParticipationRate,
  };
}

/**
 * Returns min, max, avg for any metric key across features
 */
export function getMetricExtremes(
  features: BlockFeature[],
  metricKey: MetricKey
): { min: number; max: number; avg: number } {
  let min = Infinity;
  let max = -Infinity;
  let sum = 0;

  features.forEach((f) => {
    const derived = computeBlockDerivedMetrics(f);
    let val = 0;
    if (metricKey in derived) {
      val = (derived as unknown as Record<string, number>)[metricKey];
    } else if (metricKey in f.properties) {
      val = (f.properties as unknown as Record<string, number>)[metricKey];
    }

    if (val < min) min = val;
    if (val > max) max = val;
    sum += val;
  });

  return { min, max, avg: sum / features.length };
}

/**
 * Returns color scale hex for a normalized value (0.0 to 1.0)
 */
export function getChoroplethColor(
  normalized: number,
  palette: MetricDefinition['palette']
): string {
  // Clamped 0 to 1
  const t = Math.max(0, Math.min(1, normalized));

  const scales: Record<MetricDefinition['palette'], string[]> = {
    indigo: ['#1e1b4b', '#312e81', '#3730a3', '#4f46e5', '#6366f1', '#818cf8', '#a5b4fc'],
    emerald: ['#064e3b', '#065f46', '#047857', '#059669', '#10b981', '#34d399', '#6ee7b7'],
    cyan: ['#083344', '#164e63', '#155e75', '#0891b2', '#06b6d4', '#22d3ee', '#67e8f9'],
    amber: ['#451a03', '#78350f', '#92400e', '#b45309', '#d97706', '#f59e0b', '#fbbf24'],
    rose: ['#4c0519', '#881337', '#9f1239', '#be123c', '#e11d48', '#f43f5e', '#fb7185'],
    violet: ['#2e1065', '#4c1d95', '#5b21b6', '#6d28d9', '#7c3aed', '#8b5cf6', '#a78bfa'],
  };

  const steps = scales[palette];
  const index = Math.min(Math.floor(t * (steps.length - 1)), steps.length - 1);
  return steps[index];
}
