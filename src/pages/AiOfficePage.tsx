/**
 * VOLTRA AI Office Page
 * 
 * 3D Virtual Software Engineering Office visualizing autonomous AI agents
 * working in real-time across specialized architectural workspaces.
 */

import React from 'react';
import { AgentDetailPanel } from '../features/ai-office/components/AgentDetailPanel';
import { OfficeActivityFeed } from '../features/ai-office/components/OfficeActivityFeed';
import { OfficeToolbar } from '../features/ai-office/components/OfficeToolbar';
import { ThreeOfficeScene } from '../features/ai-office/components/ThreeOfficeScene';
import { useAiOffice } from '../features/ai-office/hooks/useAiOffice';

export const AiOfficePage: React.FC = () => {
  const {
    agents,
    selectedAgent,
    selectedAgentId,
    selectAgent,
    cameraPreset,
    setCameraPreset,
    isDemoMode,
    setIsDemoMode,
    recentEvents,
    triggerManualTask
  } = useAiOffice();

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 flex flex-col gap-5">
      {/* 1. Control Toolbar */}
      <OfficeToolbar
        agents={agents}
        selectedAgentId={selectedAgentId}
        onSelectAgent={selectAgent}
        cameraPreset={cameraPreset}
        onSelectCameraPreset={setCameraPreset}
        isDemoMode={isDemoMode}
        onToggleDemoMode={() => setIsDemoMode((prev) => !prev)}
      />

      {/* 2. Main Workspace Split: 3D Scene (Left/Center) + Agent Inspector (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* 3D Virtual Office Canvas (8 columns on lg) */}
        <div className="lg:col-span-8 flex flex-col rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl bg-[#07090E] h-[540px] md:h-[620px] relative">
          <ThreeOfficeScene
            agents={agents}
            selectedAgentId={selectedAgentId}
            onSelectAgent={selectAgent}
            cameraPreset={cameraPreset}
          />
        </div>

        {/* Right Inspector & Activity Column (4 columns on lg) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <AgentDetailPanel
            agent={selectedAgent}
            onFocusCamera={setCameraPreset}
            onAssignTask={triggerManualTask}
          />

          <OfficeActivityFeed events={recentEvents} />
        </div>
      </div>
    </div>
  );
};
