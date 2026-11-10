/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ReturnIQ Application Root
 * DataNova 2026 Global Data-thon Submission — GenOS Team
 */

import React, { useState } from 'react';
import { Navbar, AppTab } from './components/Navbar';
import { Footer } from './components/Footer';
import { SimulatorView } from './views/SimulatorView';
import { ResultsView } from './views/ResultsView';
import { OptimizerView } from './views/OptimizerView';
import { FraudRingsView } from './views/FraudRingsView';
import { PlaybookView } from './views/PlaybookView';
import { AskDataView } from './views/AskDataView';
import { FairnessView } from './views/FairnessView';
import { WriteupView } from './views/WriteupView';
import { CostMatrix, ReturnCase } from './types';
import { DEFAULT_COST_MATRIX } from './lib/decisionEngine';
import { CASE_ARCHETYPES } from './data/caseArchetypes';

export default function App() {
  const [currentTab, setCurrentTab] = useState<AppTab>('simulator');
  const [costMatrix, setCostMatrix] = useState<CostMatrix>(DEFAULT_COST_MATRIX);
  const [activeCase, setActiveCase] = useState<ReturnCase>(CASE_ARCHETYPES[0].caseData);
  const [activeThreshold, setActiveThreshold] = useState<number>(0.28); // Default Pareto-optimal operating threshold

  const handleResetDefaults = () => {
    setCostMatrix(DEFAULT_COST_MATRIX);
    setActiveThreshold(0.28);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-blue-500/25 selection:text-blue-200">
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onResetDefaults={handleResetDefaults}
      />

      <main className="flex-1 pb-12">
        {currentTab === 'simulator' && (
          <SimulatorView
            costMatrix={costMatrix}
            onCostMatrixChange={setCostMatrix}
            activeCase={activeCase}
            onSelectCase={setActiveCase}
          />
        )}

        {currentTab === 'results' && (
          <ResultsView costMatrix={costMatrix} />
        )}

        {currentTab === 'optimizer' && (
          <OptimizerView
            costMatrix={costMatrix}
            activeThreshold={activeThreshold}
            onSelectThreshold={setActiveThreshold}
          />
        )}

        {currentTab === 'fraud-rings' && (
          <FraudRingsView />
        )}

        {currentTab === 'playbook' && (
          <PlaybookView />
        )}

        {currentTab === 'ask' && (
          <AskDataView />
        )}

        {currentTab === 'fairness' && (
          <FairnessView />
        )}

        {currentTab === 'writeup' && (
          <WriteupView />
        )}
      </main>

      <Footer />
    </div>
  );
}
