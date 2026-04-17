import { useSearchParams } from 'react-router-dom';
import { useMemo } from 'react';
import type { EventFilters, EventStatus, EventType } from '../types';

export function useEventFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters: EventFilters = useMemo(() => ({
    status: (searchParams.get('status') as EventStatus) || 'all',
    type: (searchParams.get('type') as EventType) || 'all',
    week: searchParams.get('week') || 'all',
    district: searchParams.get('district') || 'all',
    search: searchParams.get('q') || '',
  }), [searchParams]);

  const setFilter = (key: keyof EventFilters, value: string) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (value === 'all' || value === '') {
        next.delete(key === 'search' ? 'q' : key);
      } else {
        next.set(key === 'search' ? 'q' : key, value);
      }
      return next;
    });
  };

  const applyFilters = (newFilters: EventFilters) => {
    setSearchParams(() => {
      const next = new URLSearchParams();
      if (newFilters.status !== 'all') next.set('status', newFilters.status);
      if (newFilters.type !== 'all') next.set('type', newFilters.type);
      if (newFilters.week !== 'all') next.set('week', newFilters.week);
      if (newFilters.district !== 'all') next.set('district', newFilters.district);
      if (newFilters.search) next.set('q', newFilters.search);
      return next;
    });
  };

  return { filters, setFilter, applyFilters };
}
