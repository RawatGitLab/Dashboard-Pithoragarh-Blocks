import React, { useState, useMemo, useRef } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Layers,
  MapPin,
  Eye,
  SlidersHorizontal,
  ChevronRight,
  Maximize2,
  Map as MapIcon,
  ChevronDown,
  Sliders,
} from 'lucide-react';
import { BlockFeature, MetricKey } from '../types/census';
import {
  getBoundingBox,
  createSvgProjector,
  multiPolygonToSvgPath,
  calculateCentroid,
} from '../utils/geoUtils';
import {
  METRIC_DEFINITIONS,
  computeBlockDerivedMetrics,
  getMetricExtremes,
  getChoroplethColor,
} from '../utils/metrics';
import {
  BasemapGallery,
  BASEMAP_OPTIONS,
  BasemapId,
  BasemapOption,
} from './BasemapGallery';
import { LeafletMap } from './LeafletMap';

interface MapViewProps {
  features: BlockFeature[];
  selectedBlockId: number | null;
  onSelectBlock: (blockId: number) => void;
  activeMetric: MetricKey;
  onChangeMetric: (metric: MetricKey) => void;
}

export const MapView: React.FC<MapViewProps> = ({
  features,
  selectedBlockId,
  onSelectBlock,
  activeMetric,
  onChangeMetric,
}) => {
  // Basemap gallery state (default to OpenStreetMap standard)
  const [activeBasemapId, setActiveBasemapId] = useState<BasemapId>('osm');
  const [isBasemapGalleryOpen, setIsBasemapGalleryOpen] = useState(false);
  const [choroplethOpacity, setChoroplethOpacity] = useState(0.55);

  // SVG Pan/Zoom state (used when vector mode is active)
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredBlock, setHoveredBlock] = useState<BlockFeature | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Map layer options
  const [showLabels, setShowLabels] = useState(true);
  const [showCentroids, setShowCentroids] = useState(true);
  const [showChoropleth, setShowChoropleth] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);

  // SVG viewBox settings
  const SVG_WIDTH = 900;
  const SVG_HEIGHT = 850;

  // Active basemap definition
  const activeBasemap = useMemo(() => {
    return (
      BASEMAP_OPTIONS.find((b) => b.id === activeBasemapId) || BASEMAP_OPTIONS[0]
    );
  }, [activeBasemapId]);

  // Compute Bounding Box and Projection for SVG mode
  const bbox = useMemo(() => getBoundingBox(features), [features]);
  const project = useMemo(
    () => createSvgProjector(bbox, SVG_WIDTH, SVG_HEIGHT, 40),
    [bbox]
  );

  // Precompute paths, centroids, and metrics for each block
  const blockPaths = useMemo(() => {
    return features.map((feature) => {
      const pathD = multiPolygonToSvgPath(feature.geometry.coordinates, project);
      const centroidUtm = calculateCentroid(feature.geometry.coordinates);
      const [cx, cy] = project(centroidUtm.x, centroidUtm.y);
      const derived = computeBlockDerivedMetrics(feature);
      return {
        feature,
        pathD,
        cx,
        cy,
        derived,
      };
    });
  }, [features, project]);

  // Metric definition and extremes for choropleth scale
  const metricDef = METRIC_DEFINITIONS[activeMetric] || METRIC_DEFINITIONS.TOT_P;
  const extremes = useMemo(
    () => getMetricExtremes(features, activeMetric),
    [features, activeMetric]
  );

  // Pan and Zoom handlers for SVG mode
  const handleZoomIn = () => setZoom((z) => Math.min(z * 1.3, 5));
  const handleZoomOut = () => setZoom((z) => Math.max(z / 1.3, 0.6));
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.1 : 0.9;
    setZoom((z) => Math.max(0.6, Math.min(5, z * factor)));
  };

  // Group metrics by category for dropdown
  const metricsByCategory = useMemo(() => {
    const groups: Record<string, MetricKey[]> = {};
    (Object.keys(METRIC_DEFINITIONS) as MetricKey[]).forEach((key) => {
      const cat = METRIC_DEFINITIONS[key].category;
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(key);
    });
    return groups;
  }, []);

  return (
    <div className="relative w-full h-[700px] lg:h-[760px] bg-slate-900/40 rounded-xl border border-slate-800 overflow-hidden flex flex-col">
      {/* Top Map Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-950/80 border-b border-slate-800 z-20 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          {/* Choropleth Metric Selector */}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Choropleth Indicator:</span>
          </div>

          <select
            value={activeMetric}
            onChange={(e) => onChangeMetric(e.target.value as MetricKey)}
            aria-label="Select Choropleth Indicator"
            className="bg-slate-900 text-xs font-medium text-slate-200 border border-slate-700/80 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
          >
            {Object.entries(metricsByCategory).map(([category, keys]) => (
              <optgroup key={category} label={category}>
                {keys.map((k) => (
                  <option key={k} value={k}>
                    {METRIC_DEFINITIONS[k].label} ({METRIC_DEFINITIONS[k].unit})
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Basemap Gallery Button & Layer Toggles */}
        <div className="flex items-center gap-2">
          {/* Basemap Gallery Toggle Button */}
          <button
            onClick={() => setIsBasemapGalleryOpen(!isBasemapGalleryOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-all cursor-pointer ${
              isBasemapGalleryOpen
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/60 shadow-sm ring-1 ring-emerald-500/30'
                : 'bg-slate-900 text-slate-200 hover:text-white border-slate-700/80 hover:bg-slate-800'
            }`}
            title="Open Basemap Gallery (OpenStreetMap, Topo, Satellite, Dark)"
          >
            <MapIcon className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline text-slate-400">Basemap:</span>
            <span className="font-semibold text-white">{activeBasemap.badge}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {/* Layer toggles */}
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-md px-2 py-1 text-xs text-slate-400">
            <button
              onClick={() => setShowChoropleth(!showChoropleth)}
              className={`px-1.5 py-0.5 rounded transition-colors ${
                showChoropleth ? 'text-emerald-400 font-semibold' : 'text-slate-500 hover:text-slate-400'
              }`}
              title="Toggle Color Shading"
            >
              Shading
            </button>
            <span className="text-slate-700">·</span>
            <button
              onClick={() => setShowLabels(!showLabels)}
              className={`px-1.5 py-0.5 rounded transition-colors ${
                showLabels ? 'text-emerald-400 font-semibold' : 'text-slate-500 hover:text-slate-400'
              }`}
              title="Toggle Block Labels"
            >
              Labels
            </button>
            <span className="text-slate-700">·</span>
            <button
              onClick={() => setShowCentroids(!showCentroids)}
              className={`px-1.5 py-0.5 rounded transition-colors ${
                showCentroids ? 'text-emerald-400 font-semibold' : 'text-slate-500 hover:text-slate-400'
              }`}
              title="Toggle Centroid Markers"
            >
              Centroids
            </button>
          </div>

          {/* Vector Map Reset (when in vector mode) */}
          {activeBasemapId === 'vector' && (
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-md p-1">
              <button
                onClick={handleZoomIn}
                className="p-1 hover:bg-slate-800 text-slate-300 rounded transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleZoomOut}
                className="p-1 hover:bg-slate-800 text-slate-300 rounded transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleResetView}
                className="p-1 hover:bg-slate-800 text-slate-300 rounded transition-colors"
                title="Reset View"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Floating Basemap Gallery Dropdown */}
      <BasemapGallery
        isOpen={isBasemapGalleryOpen}
        onClose={() => setIsBasemapGalleryOpen(false)}
        activeBasemapId={activeBasemapId}
        onSelectBasemap={(id) => {
          setActiveBasemapId(id);
          setIsBasemapGalleryOpen(false);
        }}
        choroplethOpacity={choroplethOpacity}
        onChangeOpacity={setChoroplethOpacity}
      />

      {/* Map Display Body */}
      {activeBasemapId !== 'vector' ? (
        /* Leaflet Interactive Tile Map (OpenStreetMap, Topo, Satellite, Dark, Positron) */
        <div className="relative flex-1 w-full h-full min-h-[580px] overflow-hidden">
          <LeafletMap
            features={features}
            selectedBlockId={selectedBlockId}
            onSelectBlock={onSelectBlock}
            activeMetric={activeMetric}
            activeBasemap={activeBasemap}
            choroplethOpacity={showChoropleth ? choroplethOpacity : 0}
            showLabels={showLabels}
            showCentroids={showCentroids}
          />

          {/* Bottom Dynamic Legend Card */}
          <div className="absolute bottom-4 left-4 z-10 bg-slate-950/90 border border-slate-800 rounded-lg p-2.5 backdrop-blur-md shadow-lg max-w-xs text-xs pointer-events-none">
            <div className="text-[11px] font-semibold text-slate-300 mb-1 flex items-center justify-between">
              <span>{metricDef.label}</span>
              <span className="text-[10px] font-normal text-slate-500 font-mono">
                {metricDef.unit}
              </span>
            </div>

            {/* Color Gradient Strip */}
            <div
              className={`h-2.5 w-48 rounded bg-gradient-to-r ${
                metricDef.palette === 'indigo'
                  ? 'from-indigo-950 via-indigo-600 to-indigo-300'
                  : metricDef.palette === 'cyan'
                  ? 'from-cyan-950 via-cyan-600 to-cyan-300'
                  : metricDef.palette === 'amber'
                  ? 'from-amber-950 via-amber-600 to-amber-300'
                  : metricDef.palette === 'rose'
                  ? 'from-rose-950 via-rose-600 to-rose-300'
                  : metricDef.palette === 'violet'
                  ? 'from-purple-950 via-purple-600 to-purple-300'
                  : 'from-emerald-950 via-emerald-600 to-emerald-300'
              } border border-slate-800`}
            />

            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
              <span>{metricDef.format(extremes.min)}</span>
              <span>{metricDef.format(extremes.avg)} (Avg)</span>
              <span>{metricDef.format(extremes.max)}</span>
            </div>
          </div>

          {/* Basemap Watermark Badge */}
          <div className="absolute top-3 right-3 z-10 bg-slate-950/80 border border-slate-800/80 rounded px-2 py-1 text-[10px] text-slate-400 font-mono pointer-events-none flex items-center gap-1.5 shadow">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Basemap: {activeBasemap.name}</span>
          </div>
        </div>
      ) : (
        /* Vector Blueprint SVG Fallback Mode */
        <div
          ref={containerRef}
          className="relative flex-1 w-full h-full min-h-[580px] cursor-grab active:cursor-grabbing select-none overflow-hidden bg-slate-950/60"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onWheel={handleWheel}
        >
          {/* Zoom to Layer Button in Vector Mode */}
          <button
            type="button"
            onClick={handleResetView}
            className="absolute top-[12px] left-[10px] z-20 flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 hover:border-emerald-500/60 rounded-md shadow-lg backdrop-blur-md text-xs font-medium transition-all group cursor-pointer"
            title="Zoom to Layer: Fit all CD Blocks within map extent"
          >
            <Maximize2 className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span className="font-sans font-medium text-[11px] sm:text-xs">Zoom to Layer</span>
          </button>
          <svg
            viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
            preserveAspectRatio="xMidYMid meet"
            shapeRendering="geometricPrecision"
            className="w-full h-full block"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: 'center center',
              transition: isDragging ? 'none' : 'transform 0.15s ease-out',
            }}
          >
            <defs>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="rgba(51, 65, 85, 0.15)"
                  strokeWidth="1"
                />
              </pattern>
            </defs>

            <rect width={SVG_WIDTH} height={SVG_HEIGHT} fill="url(#grid)" />

            <g className="blocks-layer">
              {blockPaths.map(({ feature, pathD, cx, cy, derived }) => {
                const isSelected = selectedBlockId === feature.properties.OBJECTID;
                const isHovered =
                  hoveredBlock?.properties.OBJECTID === feature.properties.OBJECTID;

                let rawVal = 0;
                if (activeMetric in derived) {
                  rawVal = (derived as unknown as Record<string, number>)[activeMetric];
                } else if (activeMetric in feature.properties) {
                  rawVal =
                    (feature.properties as unknown as Record<string, number>)[activeMetric];
                }

                const range = extremes.max - extremes.min || 1;
                const normalized = (rawVal - extremes.min) / range;
                const fillColor = showChoropleth
                  ? getChoroplethColor(normalized, metricDef.palette)
                  : '#1e293b';

                return (
                  <g key={feature.properties.OBJECTID} className="transition-all duration-150">
                    <path
                      d={pathD}
                      fill={fillColor}
                      fillOpacity={isSelected ? 0.95 : isHovered ? 0.85 : choroplethOpacity}
                      stroke={isSelected ? '#34d399' : isHovered ? '#f1f5f9' : '#334155'}
                      strokeWidth={isSelected ? 3.5 : isHovered ? 2.5 : 1.2}
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      className="cursor-pointer transition-colors duration-150"
                      onMouseEnter={() => setHoveredBlock(feature)}
                      onMouseLeave={() => setHoveredBlock(null)}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectBlock(feature.properties.OBJECTID);
                      }}
                    />

                    {showCentroids && (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={isSelected ? 5 : 3.5}
                        fill={isSelected ? '#34d399' : '#f8fafc'}
                        stroke="#0f172a"
                        strokeWidth="1.5"
                        className="pointer-events-none"
                      />
                    )}

                    {showLabels && (
                      <g className="pointer-events-none select-none">
                        <rect
                          x={cx - (feature.properties.Name.length * 4.2 + 10)}
                          y={cy - 24}
                          width={feature.properties.Name.length * 8.4 + 20}
                          height={18}
                          rx={4}
                          fill="rgba(15, 23, 42, 0.92)"
                          stroke={
                            isSelected
                              ? '#34d399'
                              : isHovered
                              ? '#94a3b8'
                              : 'rgba(71, 85, 105, 0.6)'
                          }
                          strokeWidth={isSelected ? 1.5 : 1}
                        />
                        <text
                          x={cx}
                          y={cy - 14}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fontSize="11"
                          fontWeight="600"
                          fill="#f8fafc"
                          style={{ letterSpacing: '0.015em' }}
                        >
                          {feature.properties.Name}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </g>
          </svg>

          {/* Hover Tooltip Card for SVG mode */}
          {hoveredBlock && (
            <div
              className="absolute z-20 pointer-events-none bg-slate-950/95 border border-slate-700/80 rounded-lg p-3 shadow-2xl text-xs backdrop-blur-md min-w-[210px]"
              style={{
                left: `${Math.min(
                  mousePos.x + 16,
                  (containerRef.current?.clientWidth || 500) - 230
                )}px`,
                top: `${Math.min(
                  mousePos.y + 16,
                  (containerRef.current?.clientHeight || 500) - 170
                )}px`,
              }}
            >
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                <span className="font-bold text-sm text-white">
                  {hoveredBlock.properties.Name}
                </span>
                <span className="text-[10px] text-emerald-400 font-mono font-medium">
                  Block {hoveredBlock.properties.Block_Code}
                </span>
              </div>

              <div className="space-y-1.5 pt-2 font-mono">
                <div className="flex justify-between items-center text-slate-300">
                  <span className="text-slate-400 font-sans text-[11px]">
                    {metricDef.label}:
                  </span>
                  <span className="font-semibold text-emerald-300">
                    {(() => {
                      const derived = computeBlockDerivedMetrics(hoveredBlock);
                      let val = 0;
                      if (activeMetric in derived) {
                        val = (derived as unknown as Record<string, number>)[activeMetric];
                      } else if (activeMetric in hoveredBlock.properties) {
                        val =
                          (hoveredBlock.properties as unknown as Record<
                            string,
                            number
                          >)[activeMetric];
                      }
                      return metricDef.format(val);
                    })()}
                  </span>
                </div>

                <div className="flex justify-between items-center text-slate-400 text-[11px]">
                  <span className="font-sans">Population:</span>
                  <span className="text-slate-200">
                    {hoveredBlock.properties.TOT_P.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex justify-between items-center text-slate-400 text-[11px]">
                  <span className="font-sans">Area:</span>
                  <span className="text-slate-200">
                    {(hoveredBlock.properties.Shape_Area / 1_000_000).toFixed(1)} km²
                  </span>
                </div>
              </div>

              <div className="mt-2 pt-1.5 border-t border-slate-800/80 text-[10px] text-slate-500 font-sans flex items-center justify-between">
                <span>Click to view block profile</span>
                <ChevronRight className="w-3 h-3 text-emerald-400" />
              </div>
            </div>
          )}

          {/* Bottom Legend Card */}
          <div className="absolute bottom-3 left-3 bg-slate-950/90 border border-slate-800 rounded-lg p-2.5 backdrop-blur-md shadow-lg max-w-xs text-xs">
            <div className="text-[11px] font-semibold text-slate-300 mb-1 flex items-center justify-between">
              <span>{metricDef.label}</span>
              <span className="text-[10px] font-normal text-slate-500 font-mono">
                {metricDef.unit}
              </span>
            </div>

            <div
              className={`h-2.5 w-48 rounded bg-gradient-to-r ${
                metricDef.palette === 'indigo'
                  ? 'from-indigo-950 via-indigo-600 to-indigo-300'
                  : metricDef.palette === 'cyan'
                  ? 'from-cyan-950 via-cyan-600 to-cyan-300'
                  : metricDef.palette === 'amber'
                  ? 'from-amber-950 via-amber-600 to-amber-300'
                  : metricDef.palette === 'rose'
                  ? 'from-rose-950 via-rose-600 to-rose-300'
                  : metricDef.palette === 'violet'
                  ? 'from-purple-950 via-purple-600 to-purple-300'
                  : 'from-emerald-950 via-emerald-600 to-emerald-300'
              } border border-slate-800`}
            />

            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
              <span>{metricDef.format(extremes.min)}</span>
              <span>{metricDef.format(extremes.avg)} (Avg)</span>
              <span>{metricDef.format(extremes.max)}</span>
            </div>
          </div>

          <div className="absolute top-3 right-3 bg-slate-950/80 border border-slate-800 rounded-lg p-2 backdrop-blur-md flex flex-col items-center justify-center text-center">
            <span className="text-[10px] font-bold text-emerald-400">N</span>
            <div className="w-0.5 h-4 bg-emerald-400 my-0.5" />
            <span className="text-[9px] text-slate-500 font-mono">UTM 44N</span>
          </div>
        </div>
      )}

      {/* Bottom Block Quick-Select Strip */}
      <div className="flex items-center gap-1.5 p-2.5 bg-slate-950/90 border-t border-slate-800 overflow-x-auto z-10 text-xs shrink-0">
        <span className="text-[10px] text-slate-500 font-semibold px-1.5 uppercase tracking-wider shrink-0 font-mono">
          CD Blocks:
        </span>
        {features.map((f) => {
          const isSelected = selectedBlockId === f.properties.OBJECTID;
          return (
            <button
              key={f.properties.OBJECTID}
              onClick={() => onSelectBlock(f.properties.OBJECTID)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer ${
                isSelected
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-sm'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isSelected ? 'bg-emerald-400' : 'bg-slate-500'
                }`}
              />
              <span>{f.properties.Name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
