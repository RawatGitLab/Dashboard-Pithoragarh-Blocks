import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  GraduationCap,
  Briefcase,
  Layers,
  ArrowUpDown,
  Compass,
  Scale,
  Sparkles,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { BlockFeature } from '../types/census';
import { PITHORAGARH_BLOCK_FEATURES } from '../data/pithoragarhGeoJson';
import { calculateDistrictTotals, calculateDerivedMetrics } from '../utils/metrics';
import { formatNumber, formatPercent, formatDecimal } from '../utils/geoUtils';

interface AnalyticsViewProps {
  onSelectBlock: (block: BlockFeature) => void;
  selectedBlockId: number | null;
  onCompareWith: (block: BlockFeature) => void;
}

type MetricCategory = 'demographics' | 'literacy' | 'workforce' | 'caste';

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  onSelectBlock,
  selectedBlockId,
  onCompareWith,
}) => {
  const [activeCategory, setActiveCategory] = useState<MetricCategory>('demographics');
  const [sortBy, setSortBy] = useState<'TOT_P' | 'density' | 'litRate' | 'workRate' | 'sexRatio'>('TOT_P');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const districtTotals = useMemo(() => calculateDistrictTotals(), []);

  // Enrich block features with derived metrics
  const blocksWithMetrics = useMemo(() => {
    return PITHORAGARH_BLOCK_FEATURES.map((b) => ({
      feature: b,
      props: b.properties,
      metrics: calculateDerivedMetrics(b.properties),
    }));
  }, []);

  // Sorted blocks
  const sortedBlocks = useMemo(() => {
    const list = [...blocksWithMetrics];
    list.sort((a, b) => {
      let valA = 0;
      let valB = 0;
      switch (sortBy) {
        case 'TOT_P':
          valA = a.props.TOT_P;
          valB = b.props.TOT_P;
          break;
        case 'density':
          valA = a.metrics.density;
          valB = b.metrics.density;
          break;
        case 'litRate':
          valA = a.metrics.literacyRateTotal;
          valB = b.metrics.literacyRateTotal;
          break;
        case 'workRate':
          valA = a.metrics.workforceParticipationRate;
          valB = b.metrics.workforceParticipationRate;
          break;
        case 'sexRatio':
          valA = a.metrics.sexRatio;
          valB = b.metrics.sexRatio;
          break;
      }
      return sortOrder === 'desc' ? valB - valA : valA - valB;
    });
    return list;
  }, [blocksWithMetrics, sortBy, sortOrder]);

  const toggleSort = (field: 'TOT_P' | 'density' | 'litRate' | 'workRate' | 'sexRatio') => {
    if (sortBy === field) {
      setSortOrder(prev => (prev === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const maxPopulation = Math.max(...blocksWithMetrics.map(b => b.props.TOT_P));
  const maxArea = Math.max(...blocksWithMetrics.map(b => b.metrics.areaSqKm));

  return (
    <div className="space-y-6">
      {/* Category Tabs & Quick Sort Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/70 border border-slate-800 p-3 rounded-xl backdrop-blur-md">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveCategory('demographics')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              activeCategory === 'demographics'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Population & Density</span>
          </button>
          <button
            onClick={() => setActiveCategory('literacy')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              activeCategory === 'literacy'
                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Literacy & Gender Gap</span>
          </button>
          <button
            onClick={() => setActiveCategory('workforce')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              activeCategory === 'workforce'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Workforce & Agrarian Economy</span>
          </button>
          <button
            onClick={() => setActiveCategory('caste')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              activeCategory === 'caste'
                ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>SC & ST Demographics</span>
          </button>
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>Sort by:</span>
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => toggleSort('TOT_P')}
              className={`px-2 py-1 rounded text-xs transition-colors ${
                sortBy === 'TOT_P' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Pop {sortBy === 'TOT_P' && (sortOrder === 'desc' ? '↓' : '↑')}
            </button>
            <button
              onClick={() => toggleSort('density')}
              className={`px-2 py-1 rounded text-xs transition-colors ${
                sortBy === 'density' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Density {sortBy === 'density' && (sortOrder === 'desc' ? '↓' : '↑')}
            </button>
            <button
              onClick={() => toggleSort('litRate')}
              className={`px-2 py-1 rounded text-xs transition-colors ${
                sortBy === 'litRate' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Literacy {sortBy === 'litRate' && (sortOrder === 'desc' ? '↓' : '↑')}
            </button>
            <button
              onClick={() => toggleSort('sexRatio')}
              className={`px-2 py-1 rounded text-xs transition-colors ${
                sortBy === 'sexRatio' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sex Ratio {sortBy === 'sexRatio' && (sortOrder === 'desc' ? '↓' : '↑')}
            </button>
          </div>
        </div>
      </div>

      {/* Primary Analytics Content based on Category */}
      {activeCategory === 'demographics' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Visualizer: Population Distribution Bars */}
          <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-white">Block Population Distribution & Gender Ratio</h3>
                <p className="text-xs text-slate-400">Total resident population split by Male and Female in each CD Block</p>
              </div>
              <span className="text-xs text-slate-500 font-mono">Total: {formatNumber(districtTotals.TOT_P)}</span>
            </div>

            <div className="space-y-3.5 pt-2">
              {sortedBlocks.map(({ feature, props, metrics }) => {
                const isSelected = selectedBlockId === props.OBJECTID;
                const popPct = (props.TOT_P / maxPopulation) * 100;
                const malePct = (props.TOT_M / props.TOT_P) * 100;
                const femalePct = (props.TOT_F / props.TOT_P) * 100;

                return (
                  <div
                    key={props.OBJECTID}
                    onClick={() => onSelectBlock(feature)}
                    className={`p-3 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-950/20 border-emerald-500/50 shadow-md ring-1 ring-emerald-500/30'
                        : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700 hover:bg-slate-950/80'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white text-sm">{props.Name}</span>
                        <span className="text-slate-400 text-[11px] font-mono">Code {props.Block_Code}</span>
                        {metrics.sexRatio > 1000 && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20 font-medium">
                            Female+ ({metrics.sexRatio} ♀)
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-slate-300 font-medium">{formatNumber(props.TOT_P)}</span>
                        <span className="text-slate-500 text-[11px]">{formatPercent(metrics.percentageOfDistrictPopulation)}</span>
                      </div>
                    </div>

                    {/* Proportional Bar */}
                    <div className="w-full bg-slate-800/80 h-3 rounded-full overflow-hidden flex">
                      <div
                        className="bg-indigo-500 h-full transition-all duration-500"
                        style={{ width: `${(props.TOT_M / maxPopulation) * 100}%` }}
                        title={`Male: ${formatNumber(props.TOT_M)} (${formatPercent(malePct)})`}
                      />
                      <div
                        className="bg-rose-500 h-full transition-all duration-500"
                        style={{ width: `${(props.TOT_F / maxPopulation) * 100}%` }}
                        title={`Female: ${formatNumber(props.TOT_F)} (${formatPercent(femalePct)})`}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5 font-mono">
                      <span>♂ Male: {formatNumber(props.TOT_M)} ({formatPercent(malePct)})</span>
                      <span>♀ Female: {formatNumber(props.TOT_F)} ({formatPercent(femalePct)})</span>
                      <span>Density: {formatDecimal(metrics.density, 1)} /km²</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-center gap-6 pt-2 text-xs text-slate-400 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-indigo-500 inline-block" />
                <span>Male Population</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-rose-500 inline-block" />
                <span>Female Population</span>
              </div>
              <span className="text-slate-500 text-[11px]">Click any block card to inspect full census profile</span>
            </div>
          </div>

          {/* Side Card: Geographic vs Population Density Contrast */}
          <div className="space-y-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Compass className="w-4 h-4 text-emerald-400" />
                <span>Area vs Density Paradox</span>
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Pithoragarh presents extreme Himalayan topography. The northern Trans-Himalayan and Greater Himalayan blocks
                (<strong>Munsiari</strong> and <strong>Dharchula</strong>) cover <strong>73.4%</strong> of the district's landmass
                (5,296 km²), but house only <strong>28.9%</strong> of its population, resulting in sparse settlement density (&lt; 25/km²).
              </p>

              <div className="space-y-3 pt-2">
                <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
                  <div className="flex justify-between text-xs text-slate-300 font-medium mb-1">
                    <span>Munsiari + Dharchula (High Hills)</span>
                    <span className="text-emerald-400">73.4% Land Area</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full" style={{ width: '73.4%' }} />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                    <span>119,773 residents</span>
                    <span>22.6 persons / km² avg</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
                  <div className="flex justify-between text-xs text-slate-300 font-medium mb-1">
                    <span>6 Valley & Mid-Hill Blocks</span>
                    <span className="text-cyan-400">26.6% Land Area</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-cyan-500 h-full" style={{ width: '26.6%' }} />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                    <span>293,751 residents (71.1%)</span>
                    <span>153.1 persons / km² avg</span>
                  </div>
                </div>
              </div>

              {/* Density Leaderboard */}
              <div className="pt-2">
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Highest Density Blocks
                </h4>
                <div className="space-y-2">
                  {blocksWithMetrics
                    .sort((a, b) => b.metrics.density - a.metrics.density)
                    .slice(0, 4)
                    .map((item, idx) => (
                      <div
                        key={item.props.OBJECTID}
                        onClick={() => onSelectBlock(item.feature)}
                        className="flex items-center justify-between text-xs p-2 rounded bg-slate-950/40 hover:bg-slate-800/60 cursor-pointer border border-slate-800/60"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 font-mono w-4">#{idx + 1}</span>
                          <span className="font-medium text-slate-200">{item.props.Name}</span>
                        </div>
                        <span className="font-mono text-cyan-400 font-semibold">
                          {formatDecimal(item.metrics.density, 1)} /km²
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Child Population Statistics */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" />
                <span>Child Demographics (0–6 Years)</span>
              </h3>
              <p className="text-xs text-slate-400">
                Total 53,883 children (13.0% of population) across the district with district-level child sex ratio of 888 ♀ per 1000 ♂.
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="p-2.5 rounded bg-slate-950/60 border border-slate-800">
                  <div className="text-[11px] text-slate-400">Highest Child Pop</div>
                  <div className="text-sm font-bold text-white mt-0.5">Gangolihat</div>
                  <div className="text-xs text-emerald-400 font-mono">10,214 (14.1%)</div>
                </div>
                <div className="p-2.5 rounded bg-slate-950/60 border border-slate-800">
                  <div className="text-[11px] text-slate-400">Best Child Sex Ratio</div>
                  <div className="text-sm font-bold text-white mt-0.5">Dharchula</div>
                  <div className="text-xs text-rose-400 font-mono">924 ♀ / 1000 ♂</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Literacy & Gender Gap View */}
      {activeCategory === 'literacy' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
              <div className="text-xs text-slate-400">District Literacy Rate</div>
              <div className="text-2xl font-bold text-indigo-400 mt-1 font-mono">
                {formatPercent(districtTotals.literacyRateTotal)}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">301,003 literate citizens out of 359,641 (age 7+)</div>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
              <div className="text-xs text-slate-400">Male Literacy Rate</div>
              <div className="text-2xl font-bold text-cyan-400 mt-1 font-mono">
                {formatPercent(districtTotals.literacyRateMale)}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">166,664 literate males (93.1% in Bin Block)</div>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
              <div className="text-xs text-slate-400">Female Literacy Rate</div>
              <div className="text-2xl font-bold text-rose-400 mt-1 font-mono">
                {formatPercent(districtTotals.literacyRateFemale)}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">134,339 literate females (82.9% in Bin Block)</div>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
              <div className="text-xs text-slate-400">Gender Literacy Gap</div>
              <div className="text-2xl font-bold text-amber-400 mt-1 font-mono">
                {formatDecimal(districtTotals.literacyGenderGap, 1)}%
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Disparity between male and female literacy rates</div>
            </div>
          </div>

          {/* Block-by-block Literacy Breakdown Table & Visual bars */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
            <div>
              <h3 className="text-base font-semibold text-white">Comparative Literacy by CD Block</h3>
              <p className="text-xs text-slate-400">
                Detailed comparison of effective literacy rates (excluding children aged 0–6) and gender disparities
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[11px] tracking-wider">
                    <th className="pb-3 font-semibold">CD Block</th>
                    <th className="pb-3 font-semibold text-right">Effective Pop (7+)</th>
                    <th className="pb-3 font-semibold text-right">Total Literates</th>
                    <th className="pb-3 font-semibold text-right">Overall Rate</th>
                    <th className="pb-3 font-semibold text-right">Male Rate</th>
                    <th className="pb-3 font-semibold text-right">Female Rate</th>
                    <th className="pb-3 font-semibold text-right">Gender Gap</th>
                    <th className="pb-3 font-semibold text-center w-40">Progress Bar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {blocksWithMetrics
                    .sort((a, b) => b.metrics.literacyRateTotal - a.metrics.literacyRateTotal)
                    .map(({ feature, props, metrics }) => (
                      <tr
                        key={props.OBJECTID}
                        onClick={() => onSelectBlock(feature)}
                        className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                      >
                        <td className="py-3 font-medium text-white flex items-center gap-2">
                          <span>{props.Name}</span>
                          {metrics.literacyRateTotal > 85 && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              Top Tier
                            </span>
                          )}
                        </td>
                        <td className="py-3 text-right font-mono text-slate-400">
                          {formatNumber(metrics.effectivePopulation)}
                        </td>
                        <td className="py-3 text-right font-mono text-slate-300">
                          {formatNumber(props.P_LIT)}
                        </td>
                        <td className="py-3 text-right font-mono font-bold text-indigo-400">
                          {formatPercent(metrics.literacyRateTotal)}
                        </td>
                        <td className="py-3 text-right font-mono text-cyan-400">
                          {formatPercent(metrics.literacyRateMale)}
                        </td>
                        <td className="py-3 text-right font-mono text-rose-400">
                          {formatPercent(metrics.literacyRateFemale)}
                        </td>
                        <td className="py-3 text-right font-mono text-amber-400 font-semibold">
                          {formatDecimal(metrics.literacyGenderGap, 1)}%
                        </td>
                        <td className="py-3 px-2">
                          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                            <div
                              className="bg-indigo-500 h-full rounded-full"
                              style={{ width: `${metrics.literacyRateTotal}%` }}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Workforce & Economy View */}
      {activeCategory === 'workforce' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
              <div>
                <h3 className="text-base font-semibold text-white">Workforce Participation Structure</h3>
                <p className="text-xs text-slate-400">
                  Workers classified into Main Workers (&gt;6 months employed) vs Marginal Workers (&lt;6 months employed)
                </p>
              </div>

              <div className="space-y-3.5">
                {blocksWithMetrics
                  .sort((a, b) => b.metrics.workforceParticipationRate - a.metrics.workforceParticipationRate)
                  .map(({ feature, props, metrics }) => (
                    <div
                      key={props.OBJECTID}
                      onClick={() => onSelectBlock(feature)}
                      className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="font-semibold text-white text-sm">{props.Name}</span>
                        <div className="flex items-center gap-3 font-mono">
                          <span className="text-amber-400 font-bold">
                            {formatPercent(metrics.workforceParticipationRate)} Work Participation
                          </span>
                          <span className="text-slate-400">
                            {formatNumber(props.TOT_WORK_P)} Total Workers
                          </span>
                        </div>
                      </div>

                      {/* Stacked Work Breakdown Bar */}
                      <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden flex">
                        <div
                          className="bg-emerald-500 h-full"
                          style={{ width: `${(props.MAINWORK_P / props.TOT_P) * 100}%` }}
                          title={`Main Workers: ${formatNumber(props.MAINWORK_P)}`}
                        />
                        <div
                          className="bg-amber-500 h-full"
                          style={{ width: `${(props.MARGWORK_P / props.TOT_P) * 100}%` }}
                          title={`Marginal Workers: ${formatNumber(props.MARGWORK_P)}`}
                        />
                        <div
                          className="bg-slate-700 h-full"
                          style={{ width: `${(props.NON_WORK_P / props.TOT_P) * 100}%` }}
                          title={`Non-Workers: ${formatNumber(props.NON_WORK_P)}`}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 font-mono">
                        <span className="text-emerald-400">
                          Main: {formatNumber(props.MAINWORK_P)} ({formatPercent((props.MAINWORK_P / props.TOT_WORK_P) * 100)})
                        </span>
                        <span className="text-amber-400">
                          Marginal: {formatNumber(props.MARGWORK_P)} ({formatPercent((props.MARGWORK_P / props.TOT_WORK_P) * 100)})
                        </span>
                        <span className="text-slate-500">
                          Non-Workers: {formatNumber(props.NON_WORK_P)}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>

              <div className="flex items-center justify-center gap-6 pt-3 text-xs text-slate-400 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" />
                  <span>Main Workers</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm bg-amber-500 inline-block" />
                  <span>Marginal Workers</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm bg-slate-700 inline-block" />
                  <span>Non-Workers (Dependents/Students/Elderly)</span>
                </div>
              </div>
            </div>

            {/* Sectoral Classification Card */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-emerald-400" />
                <span>Sectoral Composition of Main Workers</span>
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Aggregated occupational distribution across all eight CD Blocks for main economic earners:
              </p>

              <div className="space-y-3 pt-2">
                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                  <div className="flex justify-between text-xs text-slate-300 font-medium mb-1">
                    <span>Cultivators (Self-employed farmers)</span>
                    <span className="text-emerald-400 font-mono">
                      {formatPercent((districtTotals.MAIN_CL_P / districtTotals.MAINWORK_P) * 100)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full"
                      style={{ width: `${(districtTotals.MAIN_CL_P / districtTotals.MAINWORK_P) * 100}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 font-mono">
                    {formatNumber(districtTotals.MAIN_CL_P)} farmers (High in Munsiari & Didihat)
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                  <div className="flex justify-between text-xs text-slate-300 font-medium mb-1">
                    <span>Agricultural Labourers</span>
                    <span className="text-amber-400 font-mono">
                      {formatPercent((districtTotals.MAIN_AL_P / districtTotals.MAINWORK_P) * 100)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-500 h-full"
                      style={{ width: `${(districtTotals.MAIN_AL_P / districtTotals.MAINWORK_P) * 100}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 font-mono">
                    {formatNumber(districtTotals.MAIN_AL_P)} paid agricultural workers
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                  <div className="flex justify-between text-xs text-slate-300 font-medium mb-1">
                    <span>Household Industry (Handlooms/Crafts)</span>
                    <span className="text-purple-400 font-mono">
                      {formatPercent((districtTotals.MAIN_HH_P / districtTotals.MAINWORK_P) * 100)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-purple-500 h-full"
                      style={{ width: `${(districtTotals.MAIN_HH_P / districtTotals.MAINWORK_P) * 100}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 font-mono">
                    {formatNumber(districtTotals.MAIN_HH_P)} cottage industry workers (e.g. wool & rugs)
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                  <div className="flex justify-between text-xs text-slate-300 font-medium mb-1">
                    <span>Other Workers (Services, Govt, Trade)</span>
                    <span className="text-cyan-400 font-mono">
                      {formatPercent((districtTotals.MAIN_OT_P / districtTotals.MAINWORK_P) * 100)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-cyan-500 h-full"
                      style={{ width: `${(districtTotals.MAIN_OT_P / districtTotals.MAINWORK_P) * 100}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 font-mono">
                    {formatNumber(districtTotals.MAIN_OT_P)} workers (Highest in Bin Block near HQ)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Caste & Social Demographics View */}
      {activeCategory === 'caste' && (
        <div className="space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-white">Scheduled Caste (SC) & Scheduled Tribe (ST) Profile</h3>
                <p className="text-xs text-slate-400">
                  Social distribution across CD Blocks highlighting indigenous Kumaoni and Bhotia tribal settlements
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {blocksWithMetrics.map(({ feature, props, metrics }) => {
                const scPct = metrics.scPercentage;
                const stPct = metrics.stPercentage;
                const genPct = Math.max(0, 100 - scPct - stPct);

                return (
                  <div
                    key={props.OBJECTID}
                    onClick={() => onSelectBlock(feature)}
                    className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-base font-semibold text-white">{props.Name}</span>
                      <span className="text-slate-400 font-mono">{formatNumber(props.TOT_P)} Pop</span>
                    </div>

                    {/* Proportional Segment Bar */}
                    <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden flex mb-2">
                      <div
                        className="bg-purple-500 h-full"
                        style={{ width: `${scPct}%` }}
                        title={`SC: ${formatNumber(props.P_SC)} (${formatPercent(scPct)})`}
                      />
                      <div
                        className="bg-amber-500 h-full"
                        style={{ width: `${stPct}%` }}
                        title={`ST: ${formatNumber(props.P_ST)} (${formatPercent(stPct)})`}
                      />
                      <div
                        className="bg-slate-600 h-full"
                        style={{ width: `${genPct}%` }}
                        title={`General/OBC: ${formatPercent(genPct)}`}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-[11px] font-mono mt-3">
                      <div className="p-2 rounded bg-purple-950/20 border border-purple-500/20 text-purple-300">
                        <div className="text-[10px] text-purple-400">SC Population</div>
                        <div className="font-bold">{formatPercent(scPct)}</div>
                        <div className="text-[10px] text-slate-400">{formatNumber(props.P_SC)}</div>
                      </div>
                      <div className="p-2 rounded bg-amber-950/20 border border-amber-500/20 text-amber-300">
                        <div className="text-[10px] text-amber-400">ST Population</div>
                        <div className="font-bold">{formatPercent(stPct)}</div>
                        <div className="text-[10px] text-slate-400">{formatNumber(props.P_ST)}</div>
                      </div>
                      <div className="p-2 rounded bg-slate-900 border border-slate-800 text-slate-300">
                        <div className="text-[10px] text-slate-400">Gen / OBC</div>
                        <div className="font-bold">{formatPercent(genPct)}</div>
                        <div className="text-[10px] text-slate-500">Remainder</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
