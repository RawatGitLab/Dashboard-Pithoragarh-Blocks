import React, { useState, useMemo } from 'react';
import {
  GitCompare,
  ArrowRightLeft,
  Users,
  Compass,
  GraduationCap,
  Briefcase,
  Layers,
  Scale,
  Check,
  ChevronDown,
} from 'lucide-react';
import { BlockFeature } from '../types/census';
import { PITHORAGARH_BLOCK_FEATURES } from '../data/pithoragarhGeoJson';
import { calculateDerivedMetrics } from '../utils/metrics';
import { formatDecimal, formatNumber, formatPercent } from '../utils/geoUtils';

interface BlockCompareViewProps {
  initialBlockId?: number | null;
  onSelectBlock: (block: BlockFeature) => void;
}

export const BlockCompareView: React.FC<BlockCompareViewProps> = ({
  initialBlockId,
  onSelectBlock,
}) => {
  // Default to comparing Bin (75 - High density/valley) and Munsiari (82 - High elevation/large area)
  const [blockAId, setBlockAId] = useState<number>(initialBlockId || 75);
  const [blockBId, setBlockBId] = useState<number>(initialBlockId === 82 ? 76 : 82);

  const blockA = useMemo(() => {
    return PITHORAGARH_BLOCK_FEATURES.find((b) => b.properties.OBJECTID === blockAId) || PITHORAGARH_BLOCK_FEATURES[0];
  }, [blockAId]);

  const blockB = useMemo(() => {
    return PITHORAGARH_BLOCK_FEATURES.find((b) => b.properties.OBJECTID === blockBId) || PITHORAGARH_BLOCK_FEATURES[7];
  }, [blockBId]);

  const metricsA = useMemo(() => calculateDerivedMetrics(blockA.properties), [blockA]);
  const metricsB = useMemo(() => calculateDerivedMetrics(blockB.properties), [blockB]);

  const swapBlocks = () => {
    setBlockAId(blockBId);
    setBlockBId(blockAId);
  };

  interface MetricComparisonRow {
    label: string;
    category: string;
    valA: number;
    valB: number;
    format: (v: number) => string;
    higherIsBetter?: boolean;
    unit?: string;
  }

  const comparisonRows: MetricComparisonRow[] = [
    // Demographics
    {
      label: 'Total Population',
      category: 'Demographics',
      valA: blockA.properties.TOT_P,
      valB: blockB.properties.TOT_P,
      format: (v) => formatNumber(v),
    },
    {
      label: 'Geographical Area',
      category: 'Demographics',
      valA: metricsA.areaSqKm,
      valB: metricsB.areaSqKm,
      format: (v) => `${formatDecimal(v, 1)} km²`,
    },
    {
      label: 'Population Density',
      category: 'Demographics',
      valA: metricsA.density,
      valB: metricsB.density,
      format: (v) => `${formatDecimal(v, 1)} /km²`,
    },
    {
      label: 'Total Households',
      category: 'Demographics',
      valA: blockA.properties.No_HH,
      valB: blockB.properties.No_HH,
      format: (v) => formatNumber(v),
    },
    {
      label: 'Avg Household Size',
      category: 'Demographics',
      valA: metricsA.avgHouseholdSize,
      valB: metricsB.avgHouseholdSize,
      format: (v) => formatDecimal(v, 2),
    },
    // Gender
    {
      label: 'Sex Ratio (Overall)',
      category: 'Gender',
      valA: metricsA.sexRatio,
      valB: metricsB.sexRatio,
      format: (v) => `${Math.round(v)} ♀ / 1000 ♂`,
      higherIsBetter: true,
    },
    {
      label: 'Child Sex Ratio (0-6 yrs)',
      category: 'Gender',
      valA: metricsA.childSexRatio,
      valB: metricsB.childSexRatio,
      format: (v) => `${Math.round(v)} ♀ / 1000 ♂`,
      higherIsBetter: true,
    },
    {
      label: 'Child Population %',
      category: 'Gender',
      valA: (blockA.properties.P_06 / blockA.properties.TOT_P) * 100,
      valB: (blockB.properties.P_06 / blockB.properties.TOT_P) * 100,
      format: (v) => formatPercent(v),
    },
    // Literacy
    {
      label: 'Total Literacy Rate',
      category: 'Literacy',
      valA: metricsA.literacyRateTotal,
      valB: metricsB.literacyRateTotal,
      format: (v) => formatPercent(v),
      higherIsBetter: true,
    },
    {
      label: 'Male Literacy Rate',
      category: 'Literacy',
      valA: metricsA.literacyRateMale,
      valB: metricsB.literacyRateMale,
      format: (v) => formatPercent(v),
      higherIsBetter: true,
    },
    {
      label: 'Female Literacy Rate',
      category: 'Literacy',
      valA: metricsA.literacyRateFemale,
      valB: metricsB.literacyRateFemale,
      format: (v) => formatPercent(v),
      higherIsBetter: true,
    },
    {
      label: 'Gender Literacy Gap',
      category: 'Literacy',
      valA: metricsA.literacyGenderGap,
      valB: metricsB.literacyGenderGap,
      format: (v) => `${formatDecimal(v, 1)}%`,
    },
    // Workforce
    {
      label: 'Workforce Participation',
      category: 'Economy',
      valA: metricsA.workforceParticipationRate,
      valB: metricsB.workforceParticipationRate,
      format: (v) => formatPercent(v),
    },
    {
      label: 'Main Workers (% of Workers)',
      category: 'Economy',
      valA: (blockA.properties.MAINWORK_P / blockA.properties.TOT_WORK_P) * 100,
      valB: (blockB.properties.MAINWORK_P / blockB.properties.TOT_WORK_P) * 100,
      format: (v) => formatPercent(v),
    },
    {
      label: 'Cultivators (% of Main)',
      category: 'Economy',
      valA: (blockA.properties.MAIN_CL_P / blockA.properties.MAINWORK_P) * 100,
      valB: (blockB.properties.MAIN_CL_P / blockB.properties.MAINWORK_P) * 100,
      format: (v) => formatPercent(v),
    },
    {
      label: 'Other Workers (Services/Trade)',
      category: 'Economy',
      valA: (blockA.properties.MAIN_OT_P / blockA.properties.MAINWORK_P) * 100,
      valB: (blockB.properties.MAIN_OT_P / blockB.properties.MAINWORK_P) * 100,
      format: (v) => formatPercent(v),
    },
    // Social
    {
      label: 'Scheduled Caste (SC) %',
      category: 'Social',
      valA: metricsA.scPercentage,
      valB: metricsB.scPercentage,
      format: (v) => formatPercent(v),
    },
    {
      label: 'Scheduled Tribe (ST) %',
      category: 'Social',
      valA: metricsA.stPercentage,
      valB: metricsB.stPercentage,
      format: (v) => formatPercent(v),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Block Selectors Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 backdrop-blur-md">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Block A Selector */}
          <div className="flex-1 bg-slate-950/80 border border-emerald-500/30 rounded-xl p-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400 block mb-1">
              Primary Block (A)
            </span>
            <div className="relative">
              <select
                value={blockAId}
                onChange={(e) => setBlockAId(Number(e.target.value))}
                aria-label="Select Primary Block (A)"
                className="w-full bg-slate-900 border border-slate-700 text-white font-semibold rounded-lg px-3 py-2 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {PITHORAGARH_BLOCK_FEATURES.map((b) => (
                  <option key={b.properties.OBJECTID} value={b.properties.OBJECTID} disabled={b.properties.OBJECTID === blockBId}>
                    {b.properties.Name} Block (Pop: {formatNumber(b.properties.TOT_P)})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>
            <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
              <span>Code: {blockA.properties.Block_Code}</span>
              <button
                onClick={() => onSelectBlock(blockA)}
                className="text-emerald-400 hover:underline text-[11px]"
              >
                View Full Dossier →
              </button>
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex items-center justify-center">
            <button
              onClick={swapBlocks}
              className="p-3 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all hover:scale-105 active:scale-95"
              title="Swap Blocks A and B"
            >
              <ArrowRightLeft className="w-5 h-5" />
            </button>
          </div>

          {/* Block B Selector */}
          <div className="flex-1 bg-slate-950/80 border border-cyan-500/30 rounded-xl p-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-cyan-400 block mb-1">
              Comparative Block (B)
            </span>
            <div className="relative">
              <select
                value={blockBId}
                onChange={(e) => setBlockBId(Number(e.target.value))}
                aria-label="Select Comparative Block (B)"
                className="w-full bg-slate-900 border border-slate-700 text-white font-semibold rounded-lg px-3 py-2 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                {PITHORAGARH_BLOCK_FEATURES.map((b) => (
                  <option key={b.properties.OBJECTID} value={b.properties.OBJECTID} disabled={b.properties.OBJECTID === blockAId}>
                    {b.properties.Name} Block (Pop: {formatNumber(b.properties.TOT_P)})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>
            <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
              <span>Code: {blockB.properties.Block_Code}</span>
              <button
                onClick={() => onSelectBlock(blockB)}
                className="text-cyan-400 hover:underline text-[11px]"
              >
                View Full Dossier →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Grid Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">
              Head-to-Head Demographic Differential: {blockA.properties.Name} vs {blockB.properties.Name}
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">18 Census Metrics</span>
        </div>

        <div className="divide-y divide-slate-800/60">
          {comparisonRows.map((row, idx) => {
            const diff = row.valA - row.valB;
            const maxVal = Math.max(row.valA, row.valB) || 1;
            const pctA = (row.valA / maxVal) * 100;
            const pctB = (row.valB / maxVal) * 100;

            const isAWinner = row.valA > row.valB;
            const isTie = Math.abs(diff) < 0.0001;

            return (
              <div
                key={idx}
                className="p-3.5 hover:bg-slate-800/30 transition-colors grid grid-cols-1 md:grid-cols-12 gap-3 items-center text-xs"
              >
                {/* Metric Label & Category */}
                <div className="md:col-span-4">
                  <div className="font-medium text-slate-200 text-sm">{row.label}</div>
                  <div className="text-[11px] text-slate-500 font-mono">{row.category}</div>
                </div>

                {/* Block A Value */}
                <div className="md:col-span-3 text-right">
                  <div className={`font-mono text-sm font-semibold ${isAWinner && !isTie ? 'text-emerald-400' : 'text-slate-300'}`}>
                    {row.format(row.valA)}
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden flex justify-end">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${pctA}%` }} />
                  </div>
                </div>

                {/* Differential Indicator */}
                <div className="md:col-span-2 text-center">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                      isTie
                        ? 'bg-slate-800 text-slate-400'
                        : isAWinner
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                    }`}
                  >
                    {isTie ? 'Equal' : isAWinner ? `+${formatDecimal(Math.abs(diff), 1)} (A)` : `+${formatDecimal(Math.abs(diff), 1)} (B)`}
                  </span>
                </div>

                {/* Block B Value */}
                <div className="md:col-span-3 text-left">
                  <div className={`font-mono text-sm font-semibold ${!isAWinner && !isTie ? 'text-cyan-400' : 'text-slate-300'}`}>
                    {row.format(row.valB)}
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                    <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${pctB}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
