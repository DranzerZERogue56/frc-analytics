import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { getEvents } from '../api/statbotics';
import { useEventFilters } from '../hooks/useEventFilters';
import { useDebounce } from '../hooks/useDebounce';
import { FilterBar } from '../components/FilterBar';
import { EventCard } from '../components/EventCard';
import { LoadingSpinner, ErrorMessage } from '../components/LoadingSpinner';
const YEAR = 2025;

export function EventBrowser() {
  const { filters, setFilter } = useEventFilters();
  const debouncedSearch = useDebounce(filters.search, 150);

  const { data: events, isLoading, error } = useQuery({
    queryKey: ['events', YEAR],
    queryFn: () => getEvents(YEAR),
  });

  const { weeks, districts } = useMemo(() => {
    if (!events) return { weeks: [], districts: [] };
    const ws = [...new Set(events.map(e => e.week))].sort((a, b) => a - b);
    const ds = [...new Set(events.map(e => e.district).filter(Boolean) as string[])].sort();
    return { weeks: ws, districts: ds };
  }, [events]);

  const filtered = useMemo(() => {
    if (!events) return [];
    let result = events;

    if (filters.status !== 'all') {
      result = result.filter(e => e.status === filters.status);
    }
    if (filters.type !== 'all') {
      result = result.filter(e => e.type === filters.type);
    }
    if (filters.week !== 'all') {
      result = result.filter(e => e.week === Number(filters.week));
    }
    if (filters.district !== 'all') {
      result = result.filter(e => e.district === filters.district);
    }
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(e =>
        e.name.toLowerCase().includes(q) ||
        (e.state && e.state.toLowerCase().includes(q)) ||
        e.country.toLowerCase().includes(q) ||
        e.key.toLowerCase().includes(q)
      );
    }

    return result.sort((a, b) => {
      const statusOrder: Record<string, number> = { Ongoing: 0, Upcoming: 1, Completed: 2 };
      const sa = statusOrder[a.status] ?? 3;
      const sb = statusOrder[b.status] ?? 3;
      if (sa !== sb) return sa - sb;
      return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
    });
  }, [events, filters, debouncedSearch]);

  const statusCounts = useMemo(() => {
    if (!events) return { total: 0, ongoing: 0, upcoming: 0, completed: 0 };
    return {
      total: events.length,
      ongoing: events.filter(e => e.status === 'Ongoing').length,
      upcoming: events.filter(e => e.status === 'Upcoming').length,
      completed: events.filter(e => e.status === 'Completed').length,
    };
  }, [events]);

  if (isLoading) return <LoadingSpinner message="Loading events..." />;
  if (error) return <ErrorMessage message={`Failed to load events: ${(error as Error).message}`} />;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">FRC {YEAR} Events</h1>
        <div className="flex gap-4 text-sm text-[var(--color-text-muted)]">
          <span>{statusCounts.total} total</span>
          {statusCounts.ongoing > 0 && <span className="text-green-400">{statusCounts.ongoing} live</span>}
          <span className="text-yellow-400">{statusCounts.upcoming} upcoming</span>
          <span>{statusCounts.completed} completed</span>
        </div>
      </div>

      <FilterBar filters={filters} setFilter={setFilter} weeks={weeks} districts={districts} />

      <p className="text-sm text-[var(--color-text-muted)] mb-4">{filtered.length} events shown</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(event => (
          <EventCard key={event.key} event={event} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-[var(--color-text-muted)]">
          <p className="text-lg mb-2">No events match your filters</p>
          <p className="text-sm">Try adjusting your search criteria</p>
        </div>
      )}
    </div>
  );
}
