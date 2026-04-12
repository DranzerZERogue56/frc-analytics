import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link to="/" className="text-xl font-bold text-white hover:text-blue-400 no-underline flex items-center gap-2">
            <span className="text-2xl">&#9881;</span>
            FRC Analytics
          </Link>
          <span className="text-[var(--color-text-muted)] text-sm">FIRST Robotics Competition Dashboard</span>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
