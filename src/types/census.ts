/**
 * Types and interfaces for Pithoragarh CD Block Census GeoJSON
 */

export interface BlockProperties {
  OBJECTID: number;
  Name: string;
  State_Code: string;
  Dist_Code: string;
  Block_Code: string;
  State_Name: string;
  Dist_Name: string;
  Level_: string;
  No_HH: number;
  TOT_P: number;
  TOT_M: number;
  TOT_F: number;
  P_06: number;
  M_06: number;
  F_06: number;
  P_SC: number;
  M_SC: number;
  F_SC: number;
  P_ST: number;
  M_ST: number;
  F_ST: number;
  P_LIT: number;
  M_LIT: number;
  F_LIT: number;
  P_ILL: number;
  M_ILL: number;
  F_ILL: number;
  TOT_WORK_P: number;
  TOT_WORK_M: number;
  TOT_WORK_F: number;
  MAINWORK_P: number;
  MAINWORK_M: number;
  MAINWORK_F: number;
  MAIN_CL_P: number;
  MAIN_CL_M: number;
  MAIN_CL_F: number;
  MAIN_AL_P: number;
  MAIN_AL_M: number;
  MAIN_AL_F: number;
  MAIN_HH_P: number;
  MAIN_HH_M: number;
  MAIN_HH_F: number;
  MAIN_OT_P: number;
  MAIN_OT_M: number;
  MAIN_OT_F: number;
  MARGWORK_P: number;
  MARGWORK_M: number;
  MARGWORK_F: number;
  MARG_CL_P: number;
  MARG_CL_M: number;
  MARG_CL_F: number;
  MARG_AL_P: number;
  MARG_AL_M: number;
  MARG_AL_F: number;
  MARG_HH_P: number;
  MARG_HH_M: number;
  MARG_HH_F: number;
  MARG_OT_P: number;
  MARG_OT_M: number;
  MARG_OT_F: number;
  MARGWORK_3: number;
  MARGWORK_4: number;
  MARGWORK_5: number;
  MARG_CL_3_: number;
  MARG_CL_31: number;
  MARG_CL_32: number;
  MARG_AL_3_: number;
  MARG_AL_31: number;
  MARG_AL_32: number;
  MARG_HH_3_: number;
  MARG_HH_31: number;
  MARG_HH_32: number;
  MARG_OT_3_: number;
  MARG_OT_31: number;
  MARG_OT_32: number;
  MARGWORK_0: number;
  MARGWORK_1: number;
  MARGWORK_2: number;
  MARG_CL_0_: number;
  MARG_CL_01: number;
  MARG_CL_02: number;
  MARG_AL_0_: number;
  MARG_AL_01: number;
  MARG_AL_02: number;
  MARG_HH_0_: number;
  MARG_HH_01: number;
  MARG_HH_02: number;
  MARG_OT_0_: number;
  MARG_OT_01: number;
  MARG_OT_02: number;
  NON_WORK_P: number;
  NON_WORK_M: number;
  NON_WORK_F: number;
  Shape_Leng: number;
  Shape_Area: number;
}

export interface BlockGeometry {
  type: 'MultiPolygon' | 'Polygon';
  coordinates: number[][][][];
}

export interface BlockFeature {
  type: 'Feature';
  properties: BlockProperties;
  geometry: BlockGeometry;
}

export interface BlockFeatureCollection {
  type: 'FeatureCollection';
  name: string;
  crs?: {
    type: string;
    properties: {
      name: string;
    };
  };
  features: BlockFeature[];
}

export interface DerivedMetrics {
  areaSqKm: number;
  perimeterKm: number;
  density: number; // persons per sq km
  avgHouseholdSize: number;
  sexRatio: number; // females per 1000 males
  childSexRatio: number; // females 0-6 per 1000 males 0-6
  childShare: number; // % 0-6 pop
  effectiveLiteracyRate: number; // P_LIT / (TOT_P - P_06) * 100
  maleLiteracyRate: number;
  femaleLiteracyRate: number;
  literacyGenderGap: number; // male - female
  workParticipationRate: number; // TOT_WORK_P / TOT_P * 100
  maleWorkParticipationRate: number;
  femaleWorkParticipationRate: number;
  mainWorkerRatio: number; // MAINWORK_P / TOT_WORK_P * 100
  marginalWorkerRatio: number; // MARGWORK_P / TOT_WORK_P * 100
  cultivatorShare: number; // (MAIN_CL + MARG_CL) / TOT_WORK * 100
  agLabourShare: number; // (MAIN_AL + MARG_AL) / TOT_WORK * 100
  householdIndustryShare: number; // (MAIN_HH + MARG_HH) / TOT_WORK * 100
  otherWorkerShare: number; // (MAIN_OT + MARG_OT) / TOT_WORK * 100
  scShare: number; // P_SC / TOT_P * 100
  stShare: number; // P_ST / TOT_P * 100
  approxLat: number;
  approxLon: number;
  literacyRateTotal: number;
  literacyRateMale: number;
  literacyRateFemale: number;
  workforceParticipationRate: number;
  scPercentage: number;
  stPercentage: number;
  effectivePopulation: number;
  percentageOfDistrictPopulation: number;
}

export interface BlockData {
  feature: BlockFeature;
  derived: DerivedMetrics;
  pathD: string;
  centroidSvg: { x: number; y: number };
}

export type MetricKey =
  | 'TOT_P'
  | 'density'
  | 'areaSqKm'
  | 'No_HH'
  | 'sexRatio'
  | 'childSexRatio'
  | 'effectiveLiteracyRate'
  | 'femaleLiteracyRate'
  | 'literacyGenderGap'
  | 'workParticipationRate'
  | 'femaleWorkParticipationRate'
  | 'cultivatorShare'
  | 'otherWorkerShare'
  | 'scShare'
  | 'stShare'
  | 'avgHouseholdSize';

export interface MetricDefinition {
  id: MetricKey;
  label: string;
  category: 'Demographics' | 'Gender & Social' | 'Literacy' | 'Economy & Work' | 'Geography';
  unit: string;
  format: (val: number) => string;
  description: string;
  palette: 'emerald' | 'indigo' | 'amber' | 'rose' | 'cyan' | 'violet';
  isInverseBetter?: boolean;
}
