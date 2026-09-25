import React from 'react';
import { Search, LayoutGrid, List, Plus, SlidersHorizontal, ArrowUpDown } from 'lucide-react';

interface ControlPanelProps {
  breadcrumbs: string[];
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  searchPlaceholder?: string;
  viewMode?: 'kanban' | 'list';
  onViewModeChange?: (mode: 'kanban' | 'list') => void;
  totalRecords?: number;
  filterLabel?: string;
  onFilterClick?: () => void;
  activeFilter?: string;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  breadcrumbs,
  primaryActionLabel,
  onPrimaryAction,
  secondaryActionLabel,
  onSecondaryAction,
  searchQuery = '',
  onSearchChange,
  searchPlaceholder = 'Search...',
  viewMode,
  onViewModeChange,
  totalRecords,
  filterLabel,
  onFilterClick,
  activeFilter
}) => {
  return (
    <div className="bg-white border-b border-slate-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-xs">
      {/* Left: Breadcrumbs & Action Buttons */}
      <div className="flex items-center flex-wrap gap-3">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm">
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <span className="text-slate-400 font-normal">/</span>}
              <span
                className={`font-semibold ${
                  idx === breadcrumbs.length - 1 ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {crumb}
              </span>
            </React.Fragment>
          ))}
        </nav>

        {(primaryActionLabel || secondaryActionLabel) && (
          <div className="flex items-center gap-2">
            {primaryActionLabel && onPrimaryAction && (
              <button
                onClick={onPrimaryAction}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{primaryActionLabel}</span>
              </button>
            )}

            {secondaryActionLabel && onSecondaryAction && (
              <button
                onClick={onSecondaryAction}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-md border border-slate-300 transition-colors"
              >
                <span>{secondaryActionLabel}</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Right: Search, Filters & View Mode Switcher */}
      <div className="flex items-center flex-wrap gap-2.5">
        {onSearchChange && (
          <div className="relative min-w-[200px] sm:min-w-[260px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-md text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-all"
            />
          </div>
        )}

        {filterLabel && onFilterClick && (
          <button
            onClick={onFilterClick}
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs border transition-colors ${
              activeFilter
                ? 'bg-blue-50 border-blue-500 text-blue-700 font-semibold'
                : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{filterLabel}</span>
          </button>
        )}

        {totalRecords !== undefined && (
          <span className="text-xs font-mono text-slate-500 tabular-nums">
            {totalRecords} records
          </span>
        )}

        {viewMode && onViewModeChange && (
          <div className="flex items-center border border-slate-300 rounded-md overflow-hidden bg-slate-100 p-0.5">
            <button
              onClick={() => onViewModeChange('kanban')}
              className={`p-1 rounded transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Kanban View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`p-1 rounded transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
