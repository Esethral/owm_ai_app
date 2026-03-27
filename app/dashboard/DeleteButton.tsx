'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function DeleteButton({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirming) {
      setConfirming(true);
      // Auto-cancel confirm state after 3s
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
      className={`px-3 py-1.5 text-xs rounded-lg border transition-colors disabled:opacity-50 ${
        confirming
          ? 'text-[#f43f5e] border-[#f43f5e]/40 bg-[#f43f5e]/10 hover:bg-[#f43f5e]/20'
          : 'text-[#5a5a7a] hover:text-[#f43f5e] border-[#252540] hover:border-[#f43f5e]/30'
      }`}
    >
      {deleting ? '…' : confirming ? 'Confirm?' : 'Delete'}
    </button>
  );
}
