import React, { useState } from 'react';
import { Header, DashboardTab } from './components/Header';
import { ExecutiveSummaryBar } from './components/ExecutiveSummaryBar';
import { MapView } from './components/MapView';
import { AnalyticsView } from './components/AnalyticsView';
import { BlockCompareView } from './components/BlockCompareView';
import { DataTable } from './components/DataTable';
import { BlockDetailDrawer } from './components/BlockDetailDrawer';
import { ExportReportModal } from './components/ExportReportModal';
import { BlockFeature, MetricKey } from './types/census';
import { PITHORAGARH_BLOCK_FEATURES } from './data/pithoragarhGeoJson';

export default function App() {
  const [activeTab, setActiveTab] = useState<DashboardTab>('map');
  const [selectedBlock, setSelectedBlock] = useState<BlockFeature | null>(null);
  const [compareBlockId, setCompareBlockId] = useState<number | null>(null);
  const [activeMetric, setActiveMetric] = useState<MetricKey>('TOT_P');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Handle block selection across any view
  const handleSelectBlock = (block: BlockFeature) => {
    setSelectedBlock(block);
  };

  const handleSelectBlockById = (blockId: number) => {
    const found = PITHORAGARH_BLOCK_FEATURES.find(
      (b) => b.properties.OBJECTID === blockId
    );
    if (found) setSelectedBlock(found);
  };

  // Close block inspector drawer
  const handleCloseDrawer = () => {
    setSelectedBlock(null);
  };

  // Trigger compare from block drawer or analytics
  const handleTriggerCompare = (blockOrId: BlockFeature | number) => {
    const id = typeof blockOrId === 'number' ? blockOrId : blockOrId.properties.OBJECTID;
    setCompareBlockId(id);
    setActiveTab('compare');
    setSelectedBlock(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Top Bar Navigation */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenReport={() => setIsExportModalOpen(true)}
        selectedBlockName={selectedBlock?.properties.Name}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-5 space-y-6">
        {/* Executive Summary Metric Bar */}
        <ExecutiveSummaryBar
          features={PITHORAGARH_BLOCK_FEATURES}
          activeMetricId={activeMetric}
          onSelectMetric={(m: MetricKey) => setActiveMetric(m)}
        />

        {/* Tab 1: Interactive GIS Vector Map */}
        {activeTab === 'map' && (
          <div className="space-y-4">
            <MapView
              features={PITHORAGARH_BLOCK_FEATURES}
              selectedBlockId={selectedBlock?.properties.OBJECTID || null}
              onSelectBlock={handleSelectBlockById}
              activeMetric={activeMetric}
              onChangeMetric={setActiveMetric}
            />
          </div>
        )}

        {/* Tab 2: Census Analytics & Charts */}
        {activeTab === 'analytics' && (
          <AnalyticsView
            onSelectBlock={handleSelectBlock}
            selectedBlockId={selectedBlock?.properties.OBJECTID || null}
            onCompareWith={handleTriggerCompare}
          />
        )}

        {/* Tab 3: Head-to-Head Block Comparison */}
        {activeTab === 'compare' && (
          <BlockCompareView
            initialBlockId={compareBlockId}
            onSelectBlock={handleSelectBlock}
          />
        )}

        {/* Tab 4: Tabular Data Explorer */}
        {activeTab === 'table' && (
          <DataTable
            onSelectBlock={handleSelectBlock}
            selectedBlockId={selectedBlock?.properties.OBJECTID || null}
          />
        )}
      </main>

      {/* Slide-out Block Detail Drawer Modal */}
      {selectedBlock && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
          <div className="h-full w-full max-w-lg p-2 sm:p-4 overflow-y-auto">
            <BlockDetailDrawer
              feature={selectedBlock}
              onClose={handleCloseDrawer}
              onCompareWith={handleTriggerCompare}
            />
          </div>
        </div>
      )}

      {/* Export Report / Data Download Modal */}
      <ExportReportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Pithoragarh District Administration GIS & Demographic Portal · Census of India
          </span>
          <span className="font-mono text-[11px] text-slate-600">
            UTM Zone 44N (EPSG:32644) · 8 Community Development Blocks
          </span>
        </div>
      </footer>
    </div>
  );
}
