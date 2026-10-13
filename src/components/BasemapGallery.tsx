import React from 'react';
import {
  Map,
  X,
  Check,
  Mountain,
  Moon,
  Sun,
  Globe,
  Grid,
  Layers,
  Sliders,
} from 'lucide-react';

export type BasemapId = 'osm' | 'opentopo' | 'carto-dark' | 'carto-light' | 'satellite' | 'vector';

export interface BasemapOption {
  id: BasemapId;
  name: string;
  category: 'OSM' | 'Satellite' | 'Dark' | 'Light' | 'Vector';
  description: string;
  url?: string;
  subdomains?: string[];
  maxZoom?: number;
  attribution?: string;
  badge: string;
}

export const BASEMAP_OPTIONS: BasemapOption[] = [
  {
    id: 'osm',
    name: 'OpenStreetMap (OSM Standard)',
    category: 'OSM',
    description: 'Detailed OpenStreetMap street layer showing towns, roads, villages & Kali/Gori rivers',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    subdomains: ['a', 'b', 'c'],
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    badge: 'OSM',
  },
  {
    id: 'opentopo',
    name: 'OpenTopoMap (OSM Topo Relief)',
    category: 'OSM',
    description: 'Topographic contour lines, mountain hillshading & Himalayan passes',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    subdomains: ['a', 'b', 'c'],
    maxZoom: 17,
    attribution: 'Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap',
    badge: 'Topo',
  },
  {
    id: 'carto-dark',
    name: 'CartoDB Dark Matter',
    category: 'Dark',
    description: 'Sleek dark basemap designed specifically for high-contrast thematic data',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    subdomains: ['a', 'b', 'c', 'd'],
    maxZoom: 20,
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    badge: 'Dark',
  },
  {
    id: 'carto-light',
    name: 'CartoDB Positron',
    category: 'Light',
    description: 'Clean minimal grayscale basemap with subtle geographic labeling',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    subdomains: ['a', 'b', 'c', 'd'],
    maxZoom: 20,
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    badge: 'Light',
  },
  {
    id: 'satellite',
    name: 'ESRI World Satellite Imagery',
    category: 'Satellite',
    description: 'High-resolution true-color satellite view of Himalayan glaciers, snowlines & valleys',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    maxZoom: 18,
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS',
    badge: 'Satellite',
  },
  {
    id: 'vector',
    name: 'Vector Blueprint (SVG Grid)',
    category: 'Vector',
    description: 'High-contrast coordinate projection with precision UTM boundary rendering',
    badge: 'Vector',
  },
];

interface BasemapGalleryProps {
  isOpen: boolean;
  onClose: () => void;
  activeBasemapId: BasemapId;
  onSelectBasemap: (id: BasemapId) => void;
  choroplethOpacity: number;
  onChangeOpacity: (opacity: number) => void;
}

export const BasemapGallery: React.FC<BasemapGalleryProps> = ({
  isOpen,
  onClose,
  activeBasemapId,
  onSelectBasemap,
  choroplethOpacity,
  onChangeOpacity,
}) => {
  if (!isOpen) return null;

  const getBasemapIcon = (id: BasemapId) => {
    switch (id) {
      case 'osm':
        return <Map className="w-5 h-5 text-emerald-400" />;
      case 'opentopo':
        return <Mountain className="w-5 h-5 text-amber-400" />;
      case 'carto-dark':
        return <Moon className="w-5 h-5 text-indigo-400" />;
      case 'carto-light':
        return <Sun className="w-5 h-5 text-sky-400" />;
      case 'satellite':
        return <Globe className="w-5 h-5 text-emerald-300" />;
      case 'vector':
        return <Grid className="w-5 h-5 text-cyan-400" />;
    }
  };

  return (
    <div className="absolute top-14 right-3 z-30 w-80 sm:w-96 bg-slate-950/95 border border-slate-700/80 rounded-xl shadow-2xl backdrop-blur-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
      {/* Gallery Header */}
      <div className="p-3.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-400" />
          <h4 className="text-sm font-bold text-white tracking-tight">Basemap Gallery</h4>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Gallery List */}
      <div className="p-3 space-y-2 max-h-[380px] overflow-y-auto">
        {BASEMAP_OPTIONS.map((opt) => {
          const isSelected = activeBasemapId === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => {
                onSelectBasemap(opt.id);
              }}
              className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-start gap-3 ${
                isSelected
                  ? 'bg-emerald-950/30 border-emerald-500/60 ring-1 ring-emerald-500/30'
                  : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <div className="p-2 rounded-md bg-slate-950 border border-slate-800 shrink-0 mt-0.5">
                {getBasemapIcon(opt.id)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className={`text-xs font-semibold truncate ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                    {opt.name}
                  </span>
                  {isSelected && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5 leading-snug">
                  {opt.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Opacity Control for Choropleth over Basemap */}
      <div className="p-3 bg-slate-900/60 border-t border-slate-800 space-y-1.5">
        <div className="flex items-center justify-between text-xs text-slate-300">
          <span className="flex items-center gap-1.5 font-medium">
            <Sliders className="w-3.5 h-3.5 text-emerald-400" />
            <span>Choropleth Transparency</span>
          </span>
          <span className="font-mono text-emerald-400 font-semibold">
            {Math.round(choroplethOpacity * 100)}%
          </span>
        </div>
        <input
          type="range"
          min="10"
          max="100"
          value={Math.round(choroplethOpacity * 100)}
          onChange={(e) => onChangeOpacity(Number(e.target.value) / 100)}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
        />
        <div className="flex justify-between text-[10px] text-slate-500">
          <span>More Basemap (Transparent)</span>
          <span>More Solid</span>
        </div>
      </div>
    </div>
  );
};
