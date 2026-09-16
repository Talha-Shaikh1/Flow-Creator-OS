'use client';

import React, { useState, useEffect } from 'react';
import { WorkflowPipeline } from '@/types';
import { INDUSTRY_WORKFLOW_PRESETS } from '@/lib/engine/templates/workflow-presets';
import { WorkflowPipelineModal } from './WorkflowPipelineModal';
import {
  Sparkles,
  Sliders,
  Plus,
  Check,
  BookmarkCheck,
  Layers,
  Camera,
  Zap,
  Mic,
  Trash2,
} from 'lucide-react';

interface Props {
  selectedWorkflow: WorkflowPipeline | null;
  onSelectWorkflow: (workflow: WorkflowPipeline | null) => void;
}

export function WorkflowPipelineSelector({
  selectedWorkflow,
  onSelectWorkflow,
}: Props) {
  const [customWorkflows, setCustomWorkflows] = useState<WorkflowPipeline[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<WorkflowPipeline | null>(null);

  // Load custom workflows from Neon DB
  const loadWorkflows = async () => {
    try {
      const res = await fetch('/api/workflows');
      const data = await res.json();
      if (data.success && Array.isArray(data.workflows)) {
        setCustomWorkflows(data.workflows);
      }
    } catch (err) {
      console.warn('Could not load custom workflows from DB:', err);
    }
  };

  useEffect(() => {
    loadWorkflows();
  }, []);

  const handleSaveWorkflow = async (wf: WorkflowPipeline) => {
    try {
      const res = await fetch('/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(wf),
      });
      const data = await res.json();
      if (data.success && data.workflow) {
        setCustomWorkflows((prev) => [
          data.workflow,
          ...prev.filter((w) => w.id !== data.workflow.id),
        ]);
        onSelectWorkflow(data.workflow);
      }
    } catch (err) {
      console.error('Failed to persist workflow:', err);
      setCustomWorkflows((prev) => [wf, ...prev]);
      onSelectWorkflow(wf);
    }
  };

  const handleDeleteWorkflow = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch(`/api/workflows?id=${id}`, { method: 'DELETE' });
      setCustomWorkflows((prev) => prev.filter((w) => w.id !== id));
      if (selectedWorkflow?.id === id) {
        onSelectWorkflow(null);
      }
    } catch (err) {
      console.error('Failed to delete workflow:', err);
    }
  };

  const allWorkflows = [...customWorkflows, ...INDUSTRY_WORKFLOW_PRESETS];

  return (
    <div className="bg-neutral-950/70 border border-neutral-800 rounded-2xl p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
              <span>Creator Workflow Pipelines & Niche Recipes</span>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30">
                Industry Standard
              </span>
            </h3>
            <p className="text-[11px] text-neutral-400">
              Pick a niche blueprint to auto-configure persona anchors, camera blocking, and hook algorithms
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingWorkflow(null);
            setIsModalOpen(true);
          }}
          className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-semibold text-xs transition flex items-center gap-1.5 shadow-sm shadow-indigo-600/20 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Build Custom Workflow</span>
        </button>
      </div>

      {/* Workflow Cards Carousel / Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {allWorkflows.map((wf) => {
          const isSelected = selectedWorkflow?.id === wf.id;
          const isCustom = !wf.id.startsWith('preset-');

          return (
            <div
              key={wf.id}
              onClick={() => onSelectWorkflow(isSelected ? null : wf)}
              className={`p-3.5 rounded-xl border text-left cursor-pointer transition relative flex flex-col justify-between group ${
                isSelected
                  ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg ring-1 ring-indigo-500/50'
                  : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      isCustom
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-neutral-800 text-neutral-300'
                    }`}
                  >
                    {isCustom ? '⭐ Your Custom Niche' : 'Industry Preset'}
                  </span>

                  <div className="flex items-center gap-1">
                    {isCustom && (
                      <button
                        type="button"
                        onClick={(e) => handleDeleteWorkflow(wf.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-neutral-800 text-rose-400 transition"
                        title="Delete custom workflow"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                    {isSelected && <Check className="w-4 h-4 text-indigo-400" />}
                  </div>
                </div>

                <h4 className="text-xs font-bold text-neutral-100 mb-1">{wf.name}</h4>
                <p className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed mb-2">
                  {wf.description}
                </p>

                {/* Micro Blueprint Specs */}
                <div className="space-y-1 text-[10px] text-neutral-400 bg-neutral-950/60 p-2 rounded border border-neutral-800/80">
                  <div className="flex items-center gap-1 truncate">
                    <Camera className="w-3 h-3 text-blue-400 shrink-0" />
                    <span className="truncate">{wf.cameraShootingStyle}</span>
                  </div>
                  <div className="flex items-center gap-1 truncate">
                    <Zap className="w-3 h-3 text-amber-400 shrink-0" />
                    <span className="truncate">Hook: {wf.hookArchetype.replace('_', ' ')}</span>
                  </div>
                  <div className="flex items-center gap-1 truncate">
                    <Mic className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span className="truncate">Pacing: {wf.pacingCadence.replace('_', ' ')}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2.5 mt-2 border-t border-neutral-800/60 flex items-center justify-between text-[10px]">
                <span className="text-neutral-500">{wf.visualStylePreset}</span>
                <span className={isSelected ? 'text-indigo-400 font-bold' : 'text-neutral-500'}>
                  {isSelected ? '✓ Active Pipeline' : 'Click to Activate'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      <WorkflowPipelineModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaveWorkflow={handleSaveWorkflow}
        initialWorkflow={editingWorkflow}
      />
    </div>
  );
}
