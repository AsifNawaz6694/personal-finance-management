import * as React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MultiSelect, MultiSelectOption } from './multi-select';

export interface FilterOption {
  key: string;
  label: string;
  type: 'select' | 'multi-select' | 'date' | 'text';
  options?: MultiSelectOption[];
  placeholder?: string;
}

interface SearchFilterProps {
  globalSearch: string;
  onGlobalSearchChange: (value: string) => void;
  filters: Record<string, any>;
  onFilterChange: (key: string, value: any) => void;
  filterOptions: FilterOption[];
  className?: string;
  placeholder?: string;
}

export function SearchFilter({
  globalSearch,
  onGlobalSearchChange,
  filters,
  onFilterChange,
  filterOptions,
  className,
  placeholder = 'Search all columns...',
}: SearchFilterProps) {
  const [showFilters, setShowFilters] = React.useState(false);

  const renderFilter = (filterOption: FilterOption) => {
    const value = filters[filterOption.key] ?? '';

    switch (filterOption.type) {
      case 'multi-select':
        return (
          <MultiSelect
            options={filterOption.options || []}
            selected={Array.isArray(value) ? value : []}
            onChange={(selected) => onFilterChange(filterOption.key, selected)}
            placeholder={filterOption.placeholder}
            className="w-full"
          />
        );

      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => onFilterChange(filterOption.key, e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="all">All {filterOption.label}</option>
            {filterOption.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => onFilterChange(filterOption.key, e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        );

      case 'text':
      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => onFilterChange(filterOption.key, e.target.value)}
            placeholder={filterOption.placeholder || `Filter by ${filterOption.label}`}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        );
    }
  };

  const activeFilterCount = Object.keys(filters).filter(key => {
    const value = filters[key];
    return value && value !== 'all' && value !== '' && (!Array.isArray(value) || value.length > 0);
  }).length;

  const clearAllFilters = () => {
    filterOptions.forEach(option => {
      onFilterChange(option.key, option.type === 'multi-select' ? [] : 'all');
    });
    onGlobalSearchChange('');
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Global Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={globalSearch}
          onChange={(e) => onGlobalSearchChange(e.target.value)}
          placeholder={placeholder}
          className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-10 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
        {globalSearch && (
          <button
            type="button"
            onClick={() => onGlobalSearchChange('')}
            className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Filter Toggle */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
            'hover:bg-accent hover:text-accent-foreground',
            activeFilterCount > 0 && 'bg-primary text-primary-foreground hover:bg-primary/90'
          )}
        >
          <Filter className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="rounded-full bg-background px-2 py-0.5 text-xs">
              {activeFilterCount}
            </span>
          )}
        </button>

        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={clearAllFilters}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Filter Options */}
      {showFilters && (
        <div className="rounded-lg border bg-card p-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filterOptions.map((filterOption) => (
              <div key={filterOption.key} className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  {filterOption.label}
                </label>
                {renderFilter(filterOption)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
