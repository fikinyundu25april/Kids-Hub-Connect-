import { ShieldCheck } from 'lucide-react';
import { SAFETY_NOTICE_TEXT } from '../types';

interface SafetyNoticeProps {
  dataFreeMode?: boolean;
  compact?: boolean;
}

export function SafetyNotice({
  dataFreeMode = false,
  compact = false,
}: SafetyNoticeProps) {
  if (dataFreeMode) {
    return (
      <div
        role="note"
        className={`border border-stone-900 bg-white text-stone-950 rounded-md flex items-start gap-2.5 ${
          compact ? 'px-3 py-2 text-xs' : 'px-3.5 py-2.5 text-xs sm:text-sm'
        }`}
      >
        <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-stone-950" aria-hidden="true" />
        <p className="font-medium leading-snug">{SAFETY_NOTICE_TEXT}</p>
      </div>
    );
  }

  return (
    <div
      role="note"
      className={`border border-emerald-900/15 bg-emerald-950/[0.04] text-[#064e3b] rounded-xl flex items-start gap-2.5 ${
        compact ? 'px-3 py-2 text-xs' : 'px-4 py-3 text-xs sm:text-sm'
      }`}
    >
      <ShieldCheck
        className="w-4 h-4 shrink-0 mt-0.5 text-[#064e3b]"
        aria-hidden="true"
      />
      <p className="font-medium leading-snug">{SAFETY_NOTICE_TEXT}</p>
    </div>
  );
}
