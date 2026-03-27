'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

// Line drawn animated trash can
function TrashIcon({ open }: { open: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {/* Trash Body  */}
      <path d="M19 6l-1 14H6L5 6" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
      {/* Trash lid that rotates open */}
      <g style={{
        transformBox: 'fill-box',
        transformOrigin: 'right bottom',
        transform: open ? 'rotate(40deg)' : 'rotate(0deg)',
        transition: 'transform 220ms ease-out',
      }}>
        <path d="M3 6h18" />
        <path d="M8 6V4h8v2" />
      </g>
    </svg>
  );
}

// Functions to handle delete and render button with confirmation state and loading state
export default function DeleteButton({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirming) {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 3000);
      return;
    }

    setDeleting(true);
    try {
      await fetch(`/api/sessions/${sessionId}`, { method: 'DELETE' });
      router.refresh();
    } catch {
      setDeleting(false);
      setConfirming(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      title={confirming ? 'Click again to confirm delete' : 'Delete'}
      className={`w-8 h-8 flex items-center justify-center rounded-lg border transition-colors disabled:opacity-50 ${
        confirming
          ? 'text-[#f43f5e] border-[#f43f5e]/40 bg-[#f43f5e]/10 hover:bg-[#f43f5e]/20'
          : 'text-[#5a5a7a] hover:text-[#f43f5e] border-[#252540] hover:border-[#f43f5e]/30'
      }`}
    >
      {deleting ? (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="9" strokeDasharray="28" strokeDashoffset="10" style={{ animation: 'spin 0.8s linear infinite', transformOrigin: 'center' }} />
        </svg>
      ) : (
        <TrashIcon open={confirming} />
      )}
    </button>
  );
}
