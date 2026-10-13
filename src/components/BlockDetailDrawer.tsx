import React from 'react';
import {
  X,
  Users,
  GraduationCap,
  Briefcase,
  Layers,
  MapPin,
  TrendingUp,
  Percent,
  Compass,
  ArrowRightLeft,
  ChevronRight,
} from 'lucide-react';
import { BlockFeature } from '../types/census';
import { computeBlockDerivedMetrics } from '../utils/metrics';
import { formatNumber, formatDecimal, formatPercent } from '../utils/geoUtils';

interface BlockDetailDrawerProps {
  feature: BlockFeature | null;
  onClose: () => void;
  onCompareWith: (blockId: number) => void;
}

export const BlockDetailDrawer: React.FC<BlockDetailDrawerProps> = ({
  feature,
  onClose,
  onCompareWith,
}) => {
  if (!feature) return null;

  const p = feature.properties;
  const d = computeBlockDerivedMetrics(feature);

  // Workforce breakdowns
  const totalCultivators = p.MAIN_CL_P + p.MARG_CL_P;
  const totalAgLabour = p.MAIN_AL_P + p.MARG_AL_P;
  const totalHHIndustry = p.MAIN_HH_P + p.MARG_HH_P;
  const totalOther = p.MAIN_OT_P + p.MARG_OT_P;

  return (
    <aside className="w-full lg:w-[420px] bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex flex-col shadow-2xl h-full">
      {/* Header */}
      <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-white tracking-tight">{p.Name}</span>
            <span className="text-[11px] font-mono font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
              CD BLOCK #{p.Block_Code}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 font-mono">
            <span>{p.Dist_Name} Dist</span>
            <span>·</span>
            <span>{formatDecimal(d.areaSqKm, 1)} km²</span>
            <span>·</span>
            <span>{formatDecimal(d.density, 1)} pop/km²</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
          title="Close Drawer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Body Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs">
        {/* Quick Compare Action */}
        <div className="flex items-center justify-between p-2.5 bg-slate-900/60 rounded-lg border border-slate-800">
          <div className="flex items-center gap-2 text-slate-300">
            <ArrowRightLeft className="w-4 h-4 text-emerald-400" />
            <span className="font-medium">Compare with another block</span>
          </div>
          <button
            onClick={() => onCompareWith(p.OBJECTID)}
            className="px-2.5 py-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 rounded border border-emerald-500/30 transition-colors"
          >
            Compare
          </button>
        </div>

        {/* Section 1: Demographics & Gender Parity */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 uppercase tracking-wider">
            <Users className="w-3.5 h-3.5 text-indigo-400" />
            <span>Population & Gender Composition</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 bg-slate-900/40 rounded-lg border border-slate-800/80">
              <span className="text-[11px] text-slate-400 block">Total Population</span>
              <span className="text-base font-bold font-mono tabular-nums text-white">
                {formatNumber(p.TOT_P)}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5 font-mono">
                {formatNumber(p.No_HH)} households
              </span>
            </div>

            <div className="p-2.5 bg-slate-900/40 rounded-lg border border-slate-800/80">
              <span className="text-[11px] text-slate-400 block">Overall Sex Ratio</span>
              <span className="text-base font-bold font-mono tabular-nums text-rose-300">
                {Math.round(d.sexRatio)}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                females per 1,000 males
              </span>
            </div>
          </div>

          {/* Gender Ratio Bar */}
          <div className="p-2.5 bg-slate-900/40 rounded-lg border border-slate-800/80 space-y-1.5">
            <div className="flex justify-between text-[11px] font-mono">
              <span className="text-indigo-400">Males: {formatNumber(p.TOT_M)} ({formatPercent((p.TOT_M / p.TOT_P) * 100)})</span>
              <span className="text-rose-400">Females: {formatNumber(p.TOT_F)} ({formatPercent((p.TOT_F / p.TOT_P) * 100)})</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 flex overflow-hidden">
              <div
                className="bg-indigo-500 h-full transition-all duration-300"
                style={{ width: `${(p.TOT_M / p.TOT_P) * 100}%` }}
              />
              <div
                className="bg-rose-500 h-full transition-all duration-300"
                style={{ width: `${(p.TOT_F / p.TOT_P) * 100}%` }}
              />
            </div>
          </div>

          {/* Children 0-6 */}
          <div className="p-2.5 bg-slate-900/40 rounded-lg border border-slate-800/80 flex items-center justify-between font-mono">
            <div>
              <span className="text-[11px] text-slate-400 font-sans block">Children (0–6 years)</span>
              <span className="text-sm font-semibold text-slate-200">
                {formatNumber(p.P_06)} ({formatPercent(d.childShare)})
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-400 font-sans block">Child Sex Ratio</span>
              <span className="text-sm font-semibold text-rose-300">
                {Math.round(d.childSexRatio)} ♀ / 1k ♂
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: Literacy & Education */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 uppercase tracking-wider">
            <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
            <span>Literacy & Educational Attainment (7+)</span>
          </div>

          <div className="p-3 bg-slate-900/40 rounded-lg border border-slate-800/80 space-y-2 font-mono">
            <div className="flex items-center justify-between">
              <span className="font-sans text-slate-400 text-xs">Effective Literacy Rate:</span>
              <span className="text-sm font-bold text-emerald-300">{formatPercent(d.effectiveLiteracyRate)}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800">
              <div>
                <span className="text-[10px] text-slate-500 block font-sans">Male Literacy</span>
                <span className="text-xs font-semibold text-slate-200">{formatPercent(d.maleLiteracyRate)}</span>
                <span className="text-[10px] text-slate-500 block">({formatNumber(p.M_LIT)} lit)</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block font-sans">Female Literacy</span>
                <span className="text-xs font-semibold text-slate-200">{formatPercent(d.femaleLiteracyRate)}</span>
                <span className="text-[10px] text-slate-500 block">({formatNumber(p.F_LIT)} lit)</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[11px]">
              <span className="font-sans text-slate-400">Gender Gap in Literacy:</span>
              <span className="text-amber-400 font-semibold">{formatDecimal(d.literacyGenderGap, 1)}% pts</span>
            </div>
          </div>
        </div>

        {/* Section 3: Social Groups */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5 text-violet-400" />
            <span>Social Composition</span>
          </div>

          <div className="grid grid-cols-3 gap-2 font-mono text-center">
            <div className="p-2 bg-slate-900/40 rounded-lg border border-slate-800/80">
              <span className="text-[10px] text-slate-400 font-sans block">Scheduled Caste</span>
              <span className="text-xs font-bold text-violet-300">{formatPercent(d.scShare)}</span>
              <span className="text-[10px] text-slate-500 block">{formatNumber(p.P_SC)}</span>
            </div>

            <div className="p-2 bg-slate-900/40 rounded-lg border border-slate-800/80">
              <span className="text-[10px] text-slate-400 font-sans block">Scheduled Tribe</span>
              <span className="text-xs font-bold text-violet-300">{formatPercent(d.stShare)}</span>
              <span className="text-[10px] text-slate-500 block">{formatNumber(p.P_ST)}</span>
            </div>

            <div className="p-2 bg-slate-900/40 rounded-lg border border-slate-800/80">
              <span className="text-[10px] text-slate-400 font-sans block">General / Others</span>
              <span className="text-xs font-bold text-slate-200">
                {formatPercent(100 - d.scShare - d.stShare)}
              </span>
              <span className="text-[10px] text-slate-500 block">
                {formatNumber(p.TOT_P - p.P_SC - p.P_ST)}
              </span>
            </div>
          </div>
        </div>

        {/* Section 4: Workforce & Economic Classification */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 uppercase tracking-wider">
            <Briefcase className="w-3.5 h-3.5 text-amber-400" />
            <span>Workforce & Occupation Distribution</span>
          </div>

          <div className="p-3 bg-slate-900/40 rounded-lg border border-slate-800/80 space-y-2 font-mono">
            <div className="flex items-center justify-between">
              <span className="font-sans text-slate-400 text-xs">Total Workers:</span>
              <span className="text-sm font-bold text-white">
                {formatNumber(p.TOT_WORK_P)} ({formatPercent(d.workParticipationRate)} WPR)
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-800">
              <div>
                <span className="text-slate-500 font-sans block">Main Workers (&gt;6m)</span>
                <span className="text-slate-200 font-semibold">{formatNumber(p.MAINWORK_P)}</span>
                <span className="text-[10px] text-slate-500 block">({formatPercent(d.mainWorkerRatio)})</span>
              </div>
              <div>
                <span className="text-slate-500 font-sans block">Marginal Workers (&lt;6m)</span>
                <span className="text-slate-200 font-semibold">{formatNumber(p.MARGWORK_P)}</span>
                <span className="text-[10px] text-slate-500 block">({formatPercent(d.marginalWorkerRatio)})</span>
              </div>
            </div>

            {/* Sectoral Breakdown */}
            <div className="pt-2 border-t border-slate-800 space-y-1.5 font-sans">
              <span className="text-[11px] font-medium text-slate-400 block">
                4-Fold Industrial Classification (Main + Marginal):
              </span>

              <div className="space-y-1 font-mono text-[11px]">
                <div className="flex justify-between items-center text-slate-300">
                  <span className="font-sans text-slate-400">1. Cultivators:</span>
                  <span>{formatNumber(totalCultivators)} ({formatPercent(d.cultivatorShare)})</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span className="font-sans text-slate-400">2. Agricultural Labourers:</span>
                  <span>{formatNumber(totalAgLabour)} ({formatPercent(d.agLabourShare)})</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span className="font-sans text-slate-400">3. Household Industry:</span>
                  <span>{formatNumber(totalHHIndustry)} ({formatPercent(d.householdIndustryShare)})</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span className="font-sans text-slate-400">4. Other Workers (Services/Trade):</span>
                  <span>{formatNumber(totalOther)} ({formatPercent(d.otherWorkerShare)})</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 5: Geographical Coordinates */}
        <div className="p-3 bg-slate-900/30 rounded-lg border border-slate-800/60 font-mono text-[11px] space-y-1 text-slate-400">
          <div className="flex items-center gap-1.5 text-xs text-slate-300 font-sans font-semibold mb-1">
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>GIS Reference</span>
          </div>
          <div className="flex justify-between">
            <span className="font-sans">Centroid GPS:</span>
            <span className="text-slate-200">{d.approxLat}° N, {d.approxLon}° E</span>
          </div>
          <div className="flex justify-between">
            <span className="font-sans">Block Perimeter:</span>
            <span className="text-slate-200">{formatDecimal(d.perimeterKm, 1)} km</span>
          </div>
          <div className="flex justify-between">
            <span className="font-sans">Projected CRS:</span>
            <span className="text-slate-200">UTM Zone 44N</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
