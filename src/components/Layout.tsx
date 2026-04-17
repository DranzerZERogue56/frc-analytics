import { useState } from 'react';
import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import type { ReactNode } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const SITE_URL = 'https://dranzerzerogue56.github.io/frc-analytics/';

export function Layout({ children }: { children: ReactNode }) {
  const [showQR, setShowQR] = useState(false);
  const { isPinkMode, togglePinkMode } = useTheme();

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <Link to="/" className="text-lg sm:text-xl font-bold text-[var(--color-text)] hover:text-[var(--color-primary-light)] no-underline flex items-center gap-1.5 sm:gap-2 shrink-0">
              <span className="text-xl sm:text-2xl">&#9881;</span>
              <span>FRC Analytics</span>
            </Link>
            <span className="text-[var(--color-text-muted)] text-xs sm:text-sm hidden sm:inline truncate">FIRST Robotics Competition Dashboard</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Pink Mode Toggle */}
            <button
              onClick={togglePinkMode}
              className={`shrink-0 text-xs sm:text-sm px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 border ${
                isPinkMode
                  ? 'bg-pink-600 hover:bg-pink-500 text-white border-pink-500'
                  : 'bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] border-[var(--color-border)]'
              }`}
              title="Toggle pastel pink theme"
            >
              <span className="text-sm">&#9829;</span>
              <span className="hidden sm:inline">{isPinkMode ? "I'm Just a Girl" : "I'm Just a Girl"}</span>
            </button>
            {/* QR Code Button */}
            <button
              onClick={() => setShowQR(true)}
              className="shrink-0 text-xs sm:text-sm bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] text-white px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
              title="Open on mobile"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
              </svg>
              <span className="hidden sm:inline">QR Code</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {children}
      </main>

      {/* QR Code Modal */}
      {showQR && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => setShowQR(false)}>
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 sm:p-8 max-w-sm w-full text-center" onClick={e => e.stopPropagation()}>
            <h2 className="text-[var(--color-text)] text-lg font-bold mb-2">Open on Mobile</h2>
            <p className="text-[var(--color-text-muted)] text-sm mb-5">Scan this QR code with your phone camera</p>
            <div className="bg-white rounded-xl p-4 inline-block mb-4">
              <QRCodeSVG
                value={SITE_URL}
                size={200}
                level="M"
                bgColor="#ffffff"
                fgColor="#0f172a"
              />
            </div>
            <p className="text-[var(--color-text-muted)] text-xs mb-5 break-all">{SITE_URL}</p>
            <button
              onClick={() => setShowQR(false)}
              className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] text-white py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
