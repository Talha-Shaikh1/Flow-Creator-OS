'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldAlert, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  compact?: boolean;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class ClerkErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      errorMessage: error?.message || 'Failed to load authentication UI',
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('[ClerkErrorBoundary] Caught Clerk UI error:', error.message, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, errorMessage: '' });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      if (this.props.compact) {
        return (
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs cursor-pointer hover:bg-amber-500/20 transition"
            onClick={this.handleRetry}
            title="Clerk script blocked by AdBlocker or slow connection. Click to retry."
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium hidden sm:inline">AdBlocker Detected</span>
            <RefreshCw className="w-3 h-3 ml-0.5" />
          </div>
        );
      }

      return (
        <div className="p-6 rounded-2xl bg-neutral-900/90 border border-amber-500/30 text-neutral-200 space-y-4 shadow-xl text-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white mb-1">
              Authentication UI Blocked (AdBlocker / Network)
            </h3>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto leading-relaxed">
              Browser ad-blocker (uBlock Origin, Brave Shields, AdBlock) ya slow connection ne Clerk CDN script ko block kar diya hai.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-[11px] text-neutral-300 space-y-1 text-left">
            <p className="font-semibold text-amber-300">💡 Hal (Quick Fix):</p>
            <p>1. Apne browser ka <strong>AdBlocker</strong> ya <strong>Brave Shields</strong> is site ke liye pause/disable karein.</p>
            <p>2. Phir neeche &ldquo;Retry Connection&rdquo; par click karein.</p>
          </div>

          <button
            onClick={this.handleRetry}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-indigo-600 hover:from-amber-500 hover:to-indigo-500 text-white text-xs font-bold transition flex items-center justify-center gap-2 mx-auto cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Connection</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
