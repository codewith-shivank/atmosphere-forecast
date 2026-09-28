import React, { useState } from 'react';
import { Check, Copy, Share2 } from 'lucide-react';
import { Location, Unit } from '../types/weather';

interface ShareButtonProps {
  location: Location;
  unit: Unit;
}

export const ShareButton: React.FC<ShareButtonProps> = ({ location, unit }) => {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;
    const shareData = {
      title: `Atmosphere Weather - ${location.name}`,
      text: `Check live weather forecast and air quality for ${location.name}, ${location.country}!`,
      url,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // user cancelled or share failed, fallback to copy
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
    }
  };

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={handleShare}
        title="Share this weather location"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 text-xs font-medium transition-all shadow-xs focus-ring"
        aria-label="Share location link"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Link Copied!</span>
          </>
        ) : (
          <>
            <Share2 className="w-3.5 h-3.5 text-zinc-500" />
            <span>Share</span>
          </>
        )}
      </button>

      {/* Floating tooltip badge */}
      {copied && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 z-50 px-2.5 py-1 bg-zinc-900 text-white text-[10px] rounded-lg shadow-lg whitespace-nowrap animate-fade-in pointer-events-none">
          URL copied to clipboard
        </div>
      )}
    </div>
  );
};
