export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function getEventTypeLabel(type: string): string {
  const map: Record<string, string> = {
    regional: 'Regional',
    district: 'District',
    district_cmp: 'District Championship',
    champs: 'Championship',
    offseason: 'Offseason',
  };
  return map[type] || type;
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'Ongoing': return 'text-green-400';
    case 'Upcoming': return 'text-yellow-400';
    case 'Completed': return 'text-gray-400';
    default: return 'text-gray-400';
  }
}

export function getStatusBadgeClasses(status: string): string {
  switch (status) {
    case 'Ongoing': return 'bg-green-900/50 text-green-300 border-green-700';
    case 'Upcoming': return 'bg-yellow-900/50 text-yellow-300 border-yellow-700';
    case 'Completed': return 'bg-gray-800/50 text-gray-400 border-gray-600';
    default: return 'bg-gray-800/50 text-gray-400 border-gray-600';
  }
}

export function cn(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
