import React, { useState, useMemo } from 'react';
import {
  Table2,
  Search,
  Download,
  ArrowUpDown,
  Filter,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';
import { BlockFeature } from '../types/census';
import { PITHORAGARH_BLOCK_FEATURES } from '../data/pithoragarhGeoJson';
import { calculateDerivedMetrics } from '../utils/metrics';
import { exportBlocksToCSV, formatNumber, formatPercent, formatDecimal } from '../utils/geoUtils';

interface DataTableProps {
  onSelectBlock: (block: BlockFeature) => void;
  selectedBlockId: number | null;
}

type ColumnViewMode = 'all' | 'demographics' | 'literacy' | 'workforce' | 'social';

export const DataTable: React.FC<DataTableProps> = ({
  onSelectBlock,
  selectedBlockId,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<ColumnViewMode>('all');
  const [sortField, setSortField] = useState<string>('TOT_P');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  // Combine block features and their metrics
  const rows = useMemo(() => {
    return PITHORAGARH_BLOCK_FEATURES.map((b) => {
      const m = calculateDerivedMetrics(b.properties);
      return {
        feature: b,
        p: b.properties,
        m,
      };
    });
  }, []);

  // Filtered and sorted rows
  const filteredRows = useMemo(() => {
    let result = rows.filter((r) => {
      const matchName = r.p.Name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCode = r.p.Block_Code.includes(searchTerm);
      return matchName || matchCode;
    });

    result.sort((a, b) => {
      let valA: any = 0;
      let valB: any = 0;

      switch (sortField) {
        case 'Name':
          valA = a.p.Name;
          valB = b.p.Name;
          return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
        case 'TOT_P':
          valA = a.p.TOT_P;
          valB = b.p.TOT_P;
          break;
        case 'No_HH':
          valA = a.p.No_HH;
          valB = b.p.No_HH;
          break;
        case 'density':
          valA = a.m.density;
          valB = b.m.density;
          break;
        case 'areaSqKm':
          valA = a.m.areaSqKm;
          valB = b.m.areaSqKm;
          break;
        case 'sexRatio':
          valA = a.m.sexRatio;
          valB = b.m.sexRatio;
          break;
        case 'literacyRateTotal':
          valA = a.m.literacyRateTotal;
          valB = b.m.literacyRateTotal;
          break;
        case 'literacyGenderGap':
          valA = a.m.literacyGenderGap;
          valB = b.m.literacyGenderGap;
          break;
        case 'workforceParticipationRate':
          valA = a.m.workforceParticipationRate;
          valB = b.m.workforceParticipationRate;
          break;
        case 'MAINWORK_P':
          valA = a.p.MAINWORK_P;
          valB = b.p.MAINWORK_P;
          break;
        case 'scPercentage':
          valA = a.m.scPercentage;
          valB = b.m.scPercentage;
          break;
        case 'stPercentage':
          valA = a.m.stPercentage;
          valB = b.m.stPercentage;
          break;
        default:
          valA = a.p.TOT_P;
          valB = b.p.TOT_P;
      }

      return sortAsc ? valA - valB : valB - valA;
    });

    return result;
  }, [rows, searchTerm, sortField, sortAsc]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const handleDownloadCSV = () => {
    const csvContent = exportBlocksToCSV(PITHORAGARH_BLOCK_FEATURES);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Pithoragarh_CD_Blocks_Census_2011_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Search, Filter & CSV Export Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/70 border border-slate-800 p-3 rounded-xl backdrop-blur-md">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search block name or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          {/* Column filter tabs */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setViewMode('all')}
              className={`px-2.5 py-1 rounded transition-colors ${
                viewMode === 'all' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Columns
            </button>
            <button
              onClick={() => setViewMode('demographics')}
              className={`px-2.5 py-1 rounded transition-colors ${
                viewMode === 'demographics' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Demographics
            </button>
            <button
              onClick={() => setViewMode('literacy')}
              className={`px-2.5 py-1 rounded transition-colors ${
                viewMode === 'literacy' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Literacy
            </button>
            <button
              onClick={() => setViewMode('workforce')}
              className={`px-2.5 py-1 rounded transition-colors ${
                viewMode === 'workforce' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Workforce
            </button>
            <button
              onClick={() => setViewMode('social')}
              className={`px-2.5 py-1 rounded transition-colors ${
                viewMode === 'social' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              SC / ST
            </button>
          </div>

          <button
            onClick={handleDownloadCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 text-xs font-medium transition-colors shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
                <th
                  onClick={() => handleSort('Name')}
                  className="py-3 px-3 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Block Name</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('TOT_P')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Population</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                {(viewMode === 'all' || viewMode === 'demographics') && (
                  <>
                    <th
                      onClick={() => handleSort('No_HH')}
                      className="py-3 px-3 text-right cursor-pointer hover:text-white transition-colors"
                    >
                      <div className="flex items-center justify-end gap-1">
                        <span>Households</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('areaSqKm')}
                      className="py-3 px-3 text-right cursor-pointer hover:text-white transition-colors"
                    >
                      <div className="flex items-center justify-end gap-1">
                        <span>Area (km²)</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('density')}
                      className="py-3 px-3 text-right cursor-pointer hover:text-white transition-colors"
                    >
                      <div className="flex items-center justify-end gap-1">
                        <span>Density</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('sexRatio')}
                      className="py-3 px-3 text-right cursor-pointer hover:text-white transition-colors"
                    >
                      <div className="flex items-center justify-end gap-1">
                        <span>Sex Ratio</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                  </>
                )}

                {(viewMode === 'all' || viewMode === 'literacy') && (
                  <>
                    <th
                      onClick={() => handleSort('literacyRateTotal')}
                      className="py-3 px-3 text-right cursor-pointer hover:text-white transition-colors"
                    >
                      <div className="flex items-center justify-end gap-1">
                        <span>Literacy %</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="py-3 px-3 text-right">Male Lit %</th>
                    <th className="py-3 px-3 text-right">Female Lit %</th>
                    <th
                      onClick={() => handleSort('literacyGenderGap')}
                      className="py-3 px-3 text-right cursor-pointer hover:text-white transition-colors"
                    >
                      <div className="flex items-center justify-end gap-1">
                        <span>Gender Gap</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                  </>
                )}

                {(viewMode === 'all' || viewMode === 'workforce') && (
                  <>
                    <th
                      onClick={() => handleSort('workforceParticipationRate')}
                      className="py-3 px-3 text-right cursor-pointer hover:text-white transition-colors"
                    >
                      <div className="flex items-center justify-end gap-1">
                        <span>Work Rate</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('MAINWORK_P')}
                      className="py-3 px-3 text-right cursor-pointer hover:text-white transition-colors"
                    >
                      <div className="flex items-center justify-end gap-1">
                        <span>Main Workers</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="py-3 px-3 text-right">Marginal</th>
                    <th className="py-3 px-3 text-right">Cultivators</th>
                  </>
                )}

                {(viewMode === 'all' || viewMode === 'social') && (
                  <>
                    <th
                      onClick={() => handleSort('scPercentage')}
                      className="py-3 px-3 text-right cursor-pointer hover:text-white transition-colors"
                    >
                      <div className="flex items-center justify-end gap-1">
                        <span>SC %</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('stPercentage')}
                      className="py-3 px-3 text-right cursor-pointer hover:text-white transition-colors"
                    >
                      <div className="flex items-center justify-end gap-1">
                        <span>ST %</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                  </>
                )}

                <th className="py-3 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredRows.map(({ feature, p, m }) => {
                const isSelected = selectedBlockId === p.OBJECTID;

                return (
                  <tr
                    key={p.OBJECTID}
                    className={`transition-colors font-mono ${
                      isSelected ? 'bg-emerald-950/20 font-semibold' : 'hover:bg-slate-800/40'
                    }`}
                  >
                    <td className="py-2.5 px-3 font-sans font-medium text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span>{p.Name}</span>
                      <span className="text-[10px] text-slate-500 font-mono">({p.Block_Code})</span>
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-200 font-semibold">
                      {formatNumber(p.TOT_P)}
                    </td>

                    {(viewMode === 'all' || viewMode === 'demographics') && (
                      <>
                        <td className="py-2.5 px-3 text-right text-slate-400">{formatNumber(p.No_HH)}</td>
                        <td className="py-2.5 px-3 text-right text-slate-400">{formatDecimal(m.areaSqKm, 1)}</td>
                        <td className="py-2.5 px-3 text-right text-cyan-400 font-semibold">
                          {formatDecimal(m.density, 1)}
                        </td>
                        <td className="py-2.5 px-3 text-right text-rose-400">{Math.round(m.sexRatio)}</td>
                      </>
                    )}

                    {(viewMode === 'all' || viewMode === 'literacy') && (
                      <>
                        <td className="py-2.5 px-3 text-right text-indigo-400 font-semibold">
                          {formatPercent(m.literacyRateTotal)}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-400">{formatPercent(m.literacyRateMale)}</td>
                        <td className="py-2.5 px-3 text-right text-slate-400">{formatPercent(m.literacyRateFemale)}</td>
                        <td className="py-2.5 px-3 text-right text-amber-400">{formatDecimal(m.literacyGenderGap, 1)}%</td>
                      </>
                    )}

                    {(viewMode === 'all' || viewMode === 'workforce') && (
                      <>
                        <td className="py-2.5 px-3 text-right text-amber-400 font-semibold">
                          {formatPercent(m.workforceParticipationRate)}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-300">{formatNumber(p.MAINWORK_P)}</td>
                        <td className="py-2.5 px-3 text-right text-slate-400">{formatNumber(p.MARGWORK_P)}</td>
                        <td className="py-2.5 px-3 text-right text-emerald-400">{formatNumber(p.MAIN_CL_P)}</td>
                      </>
                    )}

                    {(viewMode === 'all' || viewMode === 'social') && (
                      <>
                        <td className="py-2.5 px-3 text-right text-purple-400">{formatPercent(m.scPercentage)}</td>
                        <td className="py-2.5 px-3 text-right text-amber-400">{formatPercent(m.stPercentage)}</td>
                      </>
                    )}

                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => onSelectBlock(feature)}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-emerald-500/20 hover:text-emerald-400 text-slate-300 text-[11px] font-sans font-medium transition-colors"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="p-3 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {filteredRows.length} of 8 Community Development Blocks</span>
          <span>Source: Census of India 2011 & Uttarakhand State GIS Portal</span>
        </div>
      </div>
    </div>
  );
};
