import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Maximize2 } from 'lucide-react';
import { BlockFeature, MetricKey } from '../types/census';
import { BasemapOption } from './BasemapGallery';
import { convertFeaturesToWgs84 } from '../utils/geoUtils';
import {
  METRIC_DEFINITIONS,
  computeBlockDerivedMetrics,
  getMetricExtremes,
  getChoroplethColor,
} from '../utils/metrics';

interface LeafletMapProps {
  features: BlockFeature[];
  selectedBlockId: number | null;
  onSelectBlock: (blockId: number) => void;
  activeMetric: MetricKey;
  activeBasemap: BasemapOption;
  choroplethOpacity: number;
  showLabels: boolean;
  showCentroids: boolean;
}

export const LeafletMap: React.FC<LeafletMapProps> = ({
  features,
  selectedBlockId,
  onSelectBlock,
  activeMetric,
  activeBasemap,
  choroplethOpacity,
  showLabels,
  showCentroids,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const extremes = getMetricExtremes(features, activeMetric);
  const metricDef = METRIC_DEFINITIONS[activeMetric] || METRIC_DEFINITIONS.TOT_P;

  // Initialize Map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Center on Pithoragarh coordinates (~29.8° N, 80.3° E)
    const map = L.map(containerRef.current, {
      center: [29.85, 80.3],
      zoom: 9,
      minZoom: 7,
      maxZoom: 18,
      zoomControl: false, // We use custom or standard controls
    });

    // Add custom zoom control at top-left
    L.control.zoom({ position: 'topleft' }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update Tile Layer when activeBasemap changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !activeBasemap.url) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const tileLayer = L.tileLayer(activeBasemap.url, {
      subdomains: activeBasemap.subdomains || 'abc',
      maxZoom: activeBasemap.maxZoom || 19,
      attribution: activeBasemap.attribution || '© OpenStreetMap contributors',
    });

    tileLayer.addTo(map);
    tileLayerRef.current = tileLayer;
  }, [activeBasemap]);

  // Update GeoJSON Layer when features, metric, selection, or opacity changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (geoJsonLayerRef.current) {
      map.removeLayer(geoJsonLayerRef.current);
    }

    if (markersLayerRef.current) {
      map.removeLayer(markersLayerRef.current);
    }

    const wgs84Data = {
      type: 'FeatureCollection',
      features: convertFeaturesToWgs84(features),
    };

    const markersGroup = L.layerGroup();

    const geoJsonLayer = L.geoJSON(wgs84Data as any, {
      style: (feature: any) => {
        const props = feature.properties;
        const isSelected = selectedBlockId === props.OBJECTID;

        // Compute metric value
        const origFeat = features.find((f) => f.properties.OBJECTID === props.OBJECTID);
        const derived = origFeat ? computeBlockDerivedMetrics(origFeat) : null;

        let rawVal = 0;
        if (derived && activeMetric in derived) {
          rawVal = (derived as unknown as Record<string, number>)[activeMetric];
        } else if (props && activeMetric in props) {
          rawVal = props[activeMetric];
        }

        const range = extremes.max - extremes.min || 1;
        const normalized = (rawVal - extremes.min) / range;
        const fillColor = getChoroplethColor(normalized, metricDef.palette);

        return {
          fillColor,
          fillOpacity: isSelected ? Math.min(choroplethOpacity + 0.25, 0.95) : choroplethOpacity,
          color: isSelected ? '#10b981' : '#38bdf8',
          weight: isSelected ? 3.5 : 1.8,
          dashArray: isSelected ? '' : '2, 3',
        };
      },
      onEachFeature: (feature: any, layer: L.Layer) => {
        const p = feature.properties;
        const origFeat = features.find((f) => f.properties.OBJECTID === p.OBJECTID);
        const derived = origFeat ? computeBlockDerivedMetrics(origFeat) : null;

        let rawVal = 0;
        if (derived && activeMetric in derived) {
          rawVal = (derived as unknown as Record<string, number>)[activeMetric];
        } else if (p && activeMetric in p) {
          rawVal = p[activeMetric];
        }

        // Tooltip HTML
        const tooltipHtml = `
          <div style="font-family: inherit; font-size: 11px; padding: 2px;">
            <div style="font-weight: 700; color: #f8fafc; font-size: 13px; margin-bottom: 2px;">${p.Name} Block</div>
            <div style="color: #34d399; font-weight: 600; font-family: monospace;">${metricDef.label}: ${metricDef.format(rawVal)}</div>
            <div style="color: #94a3b8; margin-top: 2px;">Pop: ${Number(p.TOT_P).toLocaleString('en-IN')} · Area: ${(p.Shape_Area / 1_000_000).toFixed(1)} km²</div>
            <div style="color: #64748b; font-size: 10px; margin-top: 3px;">Click to view census dossier →</div>
          </div>
        `;

        layer.bindTooltip(tooltipHtml, {
          sticky: true,
          className: 'custom-leaflet-tooltip',
          direction: 'auto',
        });

        // Hover events
        layer.on({
          mouseover: (e) => {
            const l = e.target as L.Path;
            l.setStyle({
              weight: 3,
              color: '#f8fafc',
              fillOpacity: Math.min(choroplethOpacity + 0.2, 0.95),
            });
          },
          mouseout: (e) => {
            geoJsonLayer.resetStyle(e.target);
          },
          click: (e) => {
            L.DomEvent.stopPropagation(e);
            onSelectBlock(p.OBJECTID);
          },
        });

        // Add centroid marker & permanent label if enabled
        if (showLabels || showCentroids) {
          const bounds = (layer as any).getBounds();
          const center = bounds.getCenter();

          if (showCentroids) {
            const circle = L.circleMarker(center, {
              radius: selectedBlockId === p.OBJECTID ? 6 : 4,
              fillColor: selectedBlockId === p.OBJECTID ? '#10b981' : '#f8fafc',
              color: '#0f172a',
              weight: 1.5,
              fillOpacity: 1,
            });
            circle.on('click', () => onSelectBlock(p.OBJECTID));
            markersGroup.addLayer(circle);
          }

          if (showLabels) {
            const labelIcon = L.divIcon({
              className: 'custom-leaflet-label',
              html: `<div style="background: rgba(15,23,42,0.85); border: 1px solid rgba(71,85,105,0.7); color: #f8fafc; font-size: 10px; font-weight: 600; padding: 2px 6px; border-radius: 4px; white-space: nowrap; pointer-events: none; transform: translate(-50%, -120%); box-shadow: 0 2px 4px rgba(0,0,0,0.5);">${p.Name}</div>`,
              iconSize: [0, 0],
            });
            const marker = L.marker(center, { icon: labelIcon, interactive: false });
            markersGroup.addLayer(marker);
          }
        }
      },
    });

    geoJsonLayer.addTo(map);
    geoJsonLayerRef.current = geoJsonLayer;

    markersGroup.addTo(map);
    markersLayerRef.current = markersGroup;

    // Fit bounds on first load
    try {
      const bounds = geoJsonLayer.getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [25, 25] });
      }
    } catch {
      // ignore
    }
  }, [features, activeMetric, selectedBlockId, choroplethOpacity, showLabels, showCentroids, onSelectBlock]);

  // Zoom directly to layer bounds
  const handleZoomToLayer = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const map = mapRef.current;
    const geoJsonLayer = geoJsonLayerRef.current;
    if (!map || !geoJsonLayer) return;

    try {
      const bounds = geoJsonLayer.getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, {
          padding: [30, 30],
          maxZoom: 13,
          animate: true,
          duration: 0.8,
        });
      }
    } catch (err) {
      console.error('Error fitting bounds to layer:', err);
    }
  };

  return (
    <div className="relative w-full h-full min-h-[580px]">
      <div
        ref={containerRef}
        className="w-full h-full min-h-[580px] rounded-b-xl z-0"
        style={{ background: '#0b132b' }}
      />

      {/* Zoom to Layer Button placed directly at the annotation position under zoom controls */}
      <button
        type="button"
        onClick={handleZoomToLayer}
        className="absolute top-[82px] left-[10px] z-[1000] flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 hover:border-emerald-500/60 rounded-md shadow-lg backdrop-blur-md text-xs font-medium transition-all group cursor-pointer"
        title="Zoom to Layer (Fit all CD Blocks in view)"
      >
        <Maximize2 className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
        <span className="font-sans font-medium text-[11px] sm:text-xs">Zoom to Layer</span>
      </button>
    </div>
  );
};
