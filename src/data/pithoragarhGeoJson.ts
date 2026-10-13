import { BlockFeature, BlockFeatureCollection } from '../types/census';
import { PITHORAGARH_BLOCKS_METADATA } from './blockCensusData';
import { BIN_COORDINATES, MUNAKOT_COORDINATES } from './geometries/blocksPart1';
import { GANGOLIHAT_COORDINATES, KANALI_CHHINA_COORDINATES } from './geometries/blocksPart2';
import { BERINAG_COORDINATES, DIDIHAT_COORDINATES } from './geometries/blocksPart3';
import { DHARCHULA_COORDINATES, MUNSIARI_COORDINATES } from './geometries/blocksPart4';

const COORDINATES_MAP: Record<number, number[][][][]> = {
  75: BIN_COORDINATES,
  76: MUNAKOT_COORDINATES,
  77: GANGOLIHAT_COORDINATES,
  78: KANALI_CHHINA_COORDINATES,
  79: BERINAG_COORDINATES,
  80: DIDIHAT_COORDINATES,
  81: DHARCHULA_COORDINATES,
  82: MUNSIARI_COORDINATES,
};

export const PITHORAGARH_BLOCKS_GEOJSON: BlockFeatureCollection = {
  type: 'FeatureCollection',
  name: 'Block_Boundary',
  crs: {
    type: 'name',
    properties: {
      name: 'urn:ogc:def:crs:OGC:1.3:CRS84',
    },
  },
  features: PITHORAGARH_BLOCKS_METADATA.map((meta): BlockFeature => ({
    type: 'Feature',
    properties: meta,
    geometry: {
      type: 'MultiPolygon',
      coordinates: COORDINATES_MAP[meta.OBJECTID] || [],
    },
  })),
};

export const PITHORAGARH_BLOCK_FEATURES: BlockFeature[] = PITHORAGARH_BLOCKS_GEOJSON.features;
export const PITHORAGARH_BLOCK_FEATURE_COLLECTION: BlockFeatureCollection = PITHORAGARH_BLOCKS_GEOJSON;
