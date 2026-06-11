'use client';

import { Check, Copy } from 'lucide-react';
import { useState } from 'react';

type CopyMintButtonProps = {
  mint: string;
};

export function CopyMintButton({ mint }: CopyMintButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(mint);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      className="button button-outline token-copy-button"
      onClick={handleCopy}
      aria-label={`Copy mint address ${mint}`}
    >
      {copied ? <Check className="icon" /> : <Copy className="icon" />}
      {copied ? 'Copied' : 'Copy Mint Address'}
    </button>
  );
}
