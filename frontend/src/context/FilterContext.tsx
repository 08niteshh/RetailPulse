import React, { createContext, useContext, useState } from 'react';
import { FilterState } from '../types';

interface FilterContextType {
  filters: FilterState;
  setDatePreset: (preset: string) => void;
  setCustomDateRange: (start: string | null, end: string | null) => void;
  setRegionId: (id: number | null) => void;
  setStoreId: (id: number | null) => void;
  setCategoryId: (id: number | null) => void;
  setProductId: (id: number | null) => void;
  resetFilters: () => void;
  toQueryParams: () => Record<string, any>;
}

const defaultFilters: FilterState = {
  datePreset: '30d',
  startDate: null,
  endDate: null,
  regionId: null,
  storeId: null,
  categoryId: null,
  productId: null,
};

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);

  const setDatePreset = (preset: string) => {
    setFilters((prev) => ({
      ...prev,
      datePreset: preset,
      startDate: preset === 'custom' ? prev.startDate : null,
      endDate: preset === 'custom' ? prev.endDate : null,
    }));
  };

  const setCustomDateRange = (start: string | null, end: string | null) => {
    setFilters((prev) => ({
      ...prev,
      datePreset: 'custom',
      startDate: start,
      endDate: end,
    }));
  };

  const setRegionId = (id: number | null) => {
    setFilters((prev) => ({ ...prev, regionId: id, storeId: null })); // reset store if region changes
  };

  const setStoreId = (id: number | null) => {
    setFilters((prev) => ({ ...prev, storeId: id }));
  };

  const setCategoryId = (id: number | null) => {
    setFilters((prev) => ({ ...prev, categoryId: id, productId: null })); // reset product if category changes
  };

  const setProductId = (id: number | null) => {
    setFilters((prev) => ({ ...prev, productId: id }));
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  const toQueryParams = () => {
    const params: Record<string, any> = {
      date_preset: filters.datePreset,
    };
    if (filters.datePreset === 'custom') {
      if (filters.startDate) params.start_date = filters.startDate;
      if (filters.endDate) params.end_date = filters.endDate;
    }
    if (filters.regionId) params.region_id = filters.regionId;
    if (filters.storeId) params.store_id = filters.storeId;
    if (filters.categoryId) params.category_id = filters.categoryId;
    if (filters.productId) params.product_id = filters.productId;
    return params;
  };

  return (
    <FilterContext.Provider
      value={{
        filters,
        setDatePreset,
        setCustomDateRange,
        setRegionId,
        setStoreId,
        setCategoryId,
        setProductId,
        resetFilters,
        toQueryParams,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};

export const useFilters = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
};
