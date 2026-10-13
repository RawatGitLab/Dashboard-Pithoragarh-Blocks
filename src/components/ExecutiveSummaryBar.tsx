import React from 'react';
import { Users, Mountain, Scale, GraduationCap, Briefcase, Home } from 'lucide-react';
import { calculateDistrictTotals } from '../utils/metrics';
import { formatNumber, formatDecimal, formatPercent } from '../utils/geoUtils';
import { BlockFeature } from '../types/census';

interface ExecutiveSummaryBarProps {
  features: BlockFeature[];
  activeMetricId: string;
  onSelectMetric: (metricId: any) => void;
}

export const ExecutiveSummaryBar: React.FC<ExecutiveSummaryBarProps> = ({
  features,
  activeMetricId,
  onSelectMetric,
}) => {
  const totals = calculateDistrictTotals(features);

  const kpis = [
    {
      id: 'TOT_P',
      label: 'Total District Population',
      value: formatNumber(totals.totalPopulation),
      subtext: `${formatNumber(totals.totalMales)} M · ${formatNumber(totals.totalFemales)} F`,
      icon: Users,
      accent: 'text-indigo-400',
    },
    {
      id: 'areaSqKm',
      label: 'Geographical Area',
      value: `${formatDecimal(totals.totalAreaSqKm, 1)} km²`,
      subtext: '8 CD Blocks · Indo-Nepal-Tibet Border',
      icon: Mountain,
      accent: 'text-emerald-400',
    },
    {
      id: 'density',
      label: 'District Population Density',
      value: `${formatDecimal(totals.overallDensity, 1)} /km²`,
      subtext: 'High in valleys (Bin) · Low in Glaciers',
      icon: Scale,
      accent: 'text-cyan-400',
    },
    {
      id: 'sexRatio',
      label: 'Overall Sex Ratio',
      value: `${Math.round(totals.sexRatio)} ♀`,
      subtext: 'per 1,000 Males (Favorable ratio)',
      icon: Scale,
      accent: 'text-rose-400',
    },
    {
      id: 'effectiveLiteracyRate',
      label: 'Effective Literacy Rate',
      value: formatPercent(totals.effectiveLiteracyRate),
      subtext: `${formatNumber(totals.totalLiterates)} Literate persons (7+)`,
      icon: GraduationCap,
      accent: 'text-emerald-400',
    },
    {
      id: 'workParticipationRate',
      label: 'Work Participation Rate',
      value: formatPercent(totals.workParticipationRate),
      subtext: `${formatNumber(totals.totalWorkers)} Total Workers`,
      icon: Briefcase,
      accent: 'text-amber-400',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        const isActive = activeMetricId === kpi.id;
        return (
          <button
            key={kpi.id}
            onClick={() => onSelectMetric(kpi.id)}
            className={`text-left p-3.5 rounded-lg border transition-all cursor-pointer ${
              isActive
                ? 'bg-slate-800/90 border-emerald-500/50 shadow-md ring-1 ring-emerald-500/20'
                : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/40 hover:border-slate-700/60'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-medium text-slate-400 tracking-wide truncate">
                {kpi.label}
              </span>
              <Icon className={`w-3.5 h-3.5 ${kpi.accent} shrink-0 opacity-80`} />
            </div>
            <div className="text-lg sm:text-xl font-bold font-mono tabular-nums text-white tracking-tight">
              {kpi.value}
            </div>
            <div className="text-[11px] text-slate-500 truncate mt-1">
              {kpi.subtext}
            </div>
          </button>
        );
      })}
    </div>
  );
};
