import React from 'react';
import {
  X,
  Download,
  Printer,
  FileCode,
  FileSpreadsheet,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { PITHORAGARH_BLOCK_FEATURE_COLLECTION, PITHORAGARH_BLOCK_FEATURES } from '../data/pithoragarhGeoJson';
import { calculateDistrictTotals, calculateDerivedMetrics } from '../utils/metrics';
import { exportBlocksToCSV, formatNumber, formatPercent, formatDecimal } from '../utils/geoUtils';

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const districtTotals = calculateDistrictTotals();

  const handleDownloadGeoJSON = () => {
    const jsonStr = JSON.stringify(PITHORAGARH_BLOCK_FEATURE_COLLECTION, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/geo+json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Pithoragarh_CD_Blocks_Boundary_Census2011.geojson`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadCSV = () => {
    const csvStr = exportBlocksToCSV(PITHORAGARH_BLOCK_FEATURES);
    const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Pithoragarh_CD_Blocks_Census_2011.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div>
            <h3 className="text-lg font-bold text-white">District Report & Data Export</h3>
            <p className="text-xs text-slate-400">Pithoragarh District CD Blocks Census & GIS Datasets</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Summary Box */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
            <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              Executive Census Summary
            </h4>
            <div className="grid grid-cols-3 gap-3 text-xs pt-1 font-mono">
              <div>
                <span className="text-slate-500 block text-[10px]">TOTAL POPULATION</span>
                <span className="text-white font-bold text-sm">{formatNumber(districtTotals.TOT_P)}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">GEOGRAPHIC AREA</span>
                <span className="text-white font-bold text-sm">{formatDecimal(districtTotals.areaSqKm, 1)} km²</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">OVERALL LITERACY</span>
                <span className="text-white font-bold text-sm">{formatPercent(districtTotals.literacyRateTotal)}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">CD BLOCKS</span>
                <span className="text-white font-bold text-sm">8 Blocks</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">TOTAL HOUSEHOLDS</span>
                <span className="text-white font-bold text-sm">{formatNumber(districtTotals.No_HH)}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">POPULATION DENSITY</span>
                <span className="text-white font-bold text-sm">{formatDecimal(districtTotals.density, 1)} /km²</span>
              </div>
            </div>
          </div>

          {/* Export Options */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Available Export Formats
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleDownloadGeoJSON}
                className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-950 text-left transition-all group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
                    <FileCode className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">Full GeoJSON File</div>
                    <div className="text-[11px] text-slate-400">With polygon boundaries & census tags</div>
                  </div>
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-2 flex items-center gap-1">
                  <Download className="w-3 h-3 text-emerald-400" />
                  <span>Download .geojson</span>
                </div>
              </button>

              <button
                onClick={handleDownloadCSV}
                className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-950 text-left transition-all group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition-transform">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">Census CSV Spreadsheet</div>
                    <div className="text-[11px] text-slate-400">All demographic & economic columns</div>
                  </div>
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-2 flex items-center gap-1">
                  <Download className="w-3 h-3 text-cyan-400" />
                  <span>Download .csv</span>
                </div>
              </button>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-indigo-950/20 border border-indigo-500/20 text-xs text-indigo-300 flex items-start gap-2">
            <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <span>
              All coordinate geometry is formatted in UTM Zone 44N (EPSG:32644) cartographic projection, matching Government of Uttarakhand district GIS spatial standards.
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-medium transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print Executive Brief</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-emerald-500 text-slate-950 text-xs font-semibold hover:bg-emerald-400 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
