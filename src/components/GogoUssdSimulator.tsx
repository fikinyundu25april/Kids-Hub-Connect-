import { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  PhoneCall,
  Radio,
  RotateCcw,
} from 'lucide-react';
import { formatHomeworkDigestSms } from '../data/seedData';
import { FeedAlert, Learner, ParentReply } from '../types';
import { SafetyNotice } from './SafetyNotice';

interface GogoUssdSimulatorProps {
  learners: Learner[];
  selectedLearnerId: string;
  onSelectLearner: (learnerId: string) => void;
  alerts: FeedAlert[];
  onUssdReply: (
    alertId: string,
    learnerId: string,
    kind: Extract<ParentReply['kind'], 'ussd_yes' | 'ussd_no' | 'ussd_call'>,
    label: string
  ) => void;
}

type UssdScreen = 'home' | 'alerts' | 'detail' | 'sent';

export function GogoUssdSimulator({
  learners,
  selectedLearnerId,
  onSelectLearner,
  alerts,
  onUssdReply,
}: GogoUssdSimulatorProps) {
  const [screen, setScreen] = useState<UssdScreen>('home');
  const [selectedAlertIndex, setSelectedAlertIndex] = useState(0);
  const [lastSentMessage, setLastSentMessage] = useState<string>('');
  const [keypadBuffer, setKeypadBuffer] = useState<string>('');

  const activeLearner =
    learners.find((l) => l.id === selectedLearnerId) ?? learners[0];

  const smsAlerts = alerts
    .filter((a) => a.learnerId === activeLearner?.id && a.smsSentToGogo)
    .sort((a, b) => b.timestamp - a.timestamp);

  const currentAlert = smsAlerts[selectedAlertIndex] ?? smsAlerts[0];

  const getFormattedSms = (alert: FeedAlert): string => {
    if (alert.type === 'homework_digest' && alert.homeworkItems) {
      return formatHomeworkDigestSms(
        activeLearner?.firstName ?? 'Learner',
        alert.homeworkItems
      );
    }
    return alert.smsText;
  };

  const triggerQuickReply = (
    kind: Extract<ParentReply['kind'], 'ussd_yes' | 'ussd_no' | 'ussd_call'>,
    label: string
  ) => {
    if (!currentAlert || !activeLearner) return;
    onUssdReply(currentAlert.id, activeLearner.id, kind, label);
    setLastSentMessage(
      `Reply "${label}" sent for ${activeLearner.firstName} (${currentAlert.title}). School office updated.`
    );
    setScreen('sent');
    setKeypadBuffer('');
  };

  const handleDigitPress = (key: string) => {
    if (key === '0') {
      setKeypadBuffer('');
      if (screen === 'detail') {
        setScreen('alerts');
      } else {
        setScreen('home');
      }
      return;
    }

    if (screen === 'home') {
      if (key === '1') {
        setSelectedAlertIndex(0);
        setScreen('alerts');
      } else if (key === '2') {
        const hwIdx = smsAlerts.findIndex((a) => a.type === 'homework_digest');
        setSelectedAlertIndex(hwIdx >= 0 ? hwIdx : 0);
        setScreen('detail');
      } else if (key === '3') {
        setSelectedAlertIndex(0);
        setScreen('detail');
      }
      return;
    }

    if (screen === 'alerts') {
      const idx = Number(key) - 1;
      if (Number.isInteger(idx) && idx >= 0 && idx < smsAlerts.length) {
        setSelectedAlertIndex(idx);
        setScreen('detail');
      }
      return;
    }

    if (screen === 'detail') {
      if (key === '1') {
        triggerQuickReply('ussd_yes', 'Yes');
      } else if (key === '2') {
        triggerQuickReply('ussd_no', 'No');
      } else if (key === '3') {
        triggerQuickReply('ussd_call', 'Please call me');
      }
    }
  };

  const handleDialRestart = () => {
    setScreen('home');
    setKeypadBuffer('');
  };

  if (!activeLearner) return null;

  return (
    <div className="space-y-5">
      {/* Top Bar Info */}
      <section className="bg-white border-2 border-stone-950 rounded-md p-4 text-stone-950">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="font-mono text-xs font-bold tracking-wide text-stone-700">
              ZERO-DATA FEATURE PHONE SIMULATOR · *120*456#
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-stone-950 mt-0.5">
              Gogo USSD (*120*456#)
            </h1>
            <p className="text-xs sm:text-sm text-stone-700 mt-0.5">
              Works on any basic button phone with 0 MB mobile data required.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              aria-label="Select Gogo handset learner"
              value={activeLearner.id}
              onChange={(e) => {
                onSelectLearner(e.target.value);
                setScreen('home');
                setSelectedAlertIndex(0);
              }}
              className="min-h-[44px] px-3 py-2 border-2 border-stone-950 bg-white text-stone-950 rounded-md text-xs sm:text-sm font-bold focus:outline-none"
            >
              {learners.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.gogoName ?? l.parentName} — {l.fullName}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleDialRestart}
              className="min-h-[44px] px-3.5 py-2 border-2 border-stone-950 bg-stone-950 text-white rounded-md text-xs font-mono font-bold inline-flex items-center gap-1.5 whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Redial *120*456#</span>
            </button>
          </div>
        </div>
      </section>

      <SafetyNotice dataFreeMode />

      {/* Desktop 2-column: Handset + Live Feed Sync */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Authentic Basic-Phone Handset Frame */}
        <section className="lg:col-span-5 flex justify-center">
          <div className="w-full max-w-sm bg-stone-900 text-stone-100 rounded-3xl border-4 border-stone-800 p-4 sm:p-5 shadow-md">
            {/* Handset Speaker & Carrier Line */}
            <div className="flex items-center justify-between text-[11px] font-mono text-stone-300 pb-3 border-b border-stone-700">
              <span className="inline-flex items-center gap-1">
                <Radio className="w-3.5 h-3.5 text-[#f59e0b]" aria-hidden="true" />
                <span>MTN/Vodacom 2G</span>
              </span>
              <span className="tabular-nums font-bold text-[#f59e0b]">
                *120*456# · 0.00 MB
              </span>
            </div>

            {/* Monochrome / High-Contrast LCD USSD Display */}
            <div
              role="region"
              aria-label="USSD Screen"
              className="mt-3 bg-[#e7ece4] text-stone-950 border-2 border-stone-700 rounded-lg p-3.5 font-mono text-xs leading-relaxed min-h-[290px] flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="border-b border-stone-950/30 pb-1.5 flex items-center justify-between font-bold text-[11px]">
                  <span>KIDS HUB USSD</span>
                  <span className="tabular-nums">
                    {activeLearner.gogoPhone ?? activeLearner.parentPhone}
                  </span>
                </div>

                {screen === 'home' && (
                  <div className="space-y-2">
                    <p className="font-bold">
                      {activeLearner.school}
                      <br />
                      Learner: {activeLearner.fullName} ({activeLearner.grade})
                    </p>
                    <div className="space-y-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => handleDigitPress('1')}
                        className="w-full min-h-[40px] px-2.5 py-1.5 text-left border border-stone-950 bg-white/80 hover:bg-stone-950 hover:text-white font-bold transition-colors"
                      >
                        1. Read Latest SMS Alerts ({smsAlerts.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDigitPress('2')}
                        className="w-full min-h-[40px] px-2.5 py-1.5 text-left border border-stone-950 bg-white/80 hover:bg-stone-950 hover:text-white font-bold transition-colors"
                      >
                        2. Today’s 15:30 Homework SMS
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDigitPress('3')}
                        className="w-full min-h-[40px] px-2.5 py-1.5 text-left border border-stone-950 bg-white/80 hover:bg-stone-950 hover:text-white font-bold transition-colors"
                      >
                        3. Quick Reply to Latest Alert
                      </button>
                    </div>
                  </div>
                )}

                {screen === 'alerts' && (
                  <div className="space-y-2">
                    <p className="font-bold">
                      Latest SMS Alerts ({activeLearner.firstName}):
                    </p>
                    {smsAlerts.length === 0 ? (
                      <p>No SMS alerts yet today.</p>
                    ) : (
                      <div className="space-y-1.5">
                        {smsAlerts.slice(0, 5).map((al, index) => (
                          <button
                            key={al.id}
                            type="button"
                            onClick={() => {
                              setSelectedAlertIndex(index);
                              setScreen('detail');
                            }}
                            className="w-full min-h-[40px] px-2 py-1.5 text-left border border-stone-950 bg-white/80 hover:bg-stone-950 hover:text-white transition-colors"
                          >
                            <div className="font-bold">
                              {index + 1}. {al.title}
                            </div>
                            <div className="text-[11px] opacity-80">
                              {al.createdAtLabel}
                              {al.parentReply ? ` · Replied: ${al.parentReply.label}` : ''}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => setScreen('home')}
                      className="min-h-[36px] px-2 py-1 border border-stone-950 bg-white/60 text-[11px] font-bold inline-flex items-center gap-1"
                    >
                      <ArrowLeft className="w-3 h-3" aria-hidden="true" />
                      <span>0. Main Menu</span>
                    </button>
                  </div>
                )}

                {screen === 'detail' && currentAlert && (
                  <div className="space-y-2.5">
                    <div className="font-bold text-[11px] uppercase tracking-tight">
                      {currentAlert.title} ({currentAlert.createdAtLabel})
                    </div>
                    <div className="p-2 border border-stone-950 bg-white text-[11px] leading-relaxed break-words">
                      {getFormattedSms(currentAlert)}
                    </div>

                    <div className="space-y-1 pt-1">
                      <div className="text-[11px] font-bold">
                        Quick Reply (posts to school feed):
                      </div>
                      <div className="grid grid-cols-1 gap-1.5">
                        <button
                          type="button"
                          onClick={() => triggerQuickReply('ussd_yes', 'Yes')}
                          className="min-h-[40px] px-2.5 py-1.5 text-left border border-stone-950 bg-white hover:bg-[#064e3b] hover:text-white font-bold transition-colors"
                        >
                          1. Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => triggerQuickReply('ussd_no', 'No')}
                          className="min-h-[40px] px-2.5 py-1.5 text-left border border-stone-950 bg-white hover:bg-stone-950 hover:text-white font-bold transition-colors"
                        >
                          2. No
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            triggerQuickReply('ussd_call', 'Please call me')
                          }
                          className="min-h-[40px] px-2.5 py-1.5 text-left border border-stone-950 bg-white hover:bg-amber-400 hover:text-stone-950 font-bold transition-colors"
                        >
                          3. Please call me
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setScreen('alerts')}
                      className="min-h-[36px] px-2 py-1 border border-stone-950 bg-white/60 text-[11px] font-bold inline-flex items-center gap-1"
                    >
                      <ArrowLeft className="w-3 h-3" aria-hidden="true" />
                      <span>0. Back to Alerts</span>
                    </button>
                  </div>
                )}

                {screen === 'sent' && (
                  <div className="space-y-3 py-2">
                    <div className="flex items-start gap-2 font-bold">
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                      <span>{lastSentMessage}</span>
                    </div>
                    <p className="text-[11px]">
                      This reply is now visible in the Parent Feed and Teacher Morning Roll Call.
                    </p>
                    <div className="flex flex-col gap-1.5 pt-2">
                      <button
                        type="button"
                        onClick={() => setScreen('alerts')}
                        className="min-h-[40px] px-2.5 py-1.5 text-left border border-stone-950 bg-white font-bold"
                      >
                        1. Read More Alerts
                      </button>
                      <button
                        type="button"
                        onClick={() => setScreen('home')}
                        className="min-h-[40px] px-2.5 py-1.5 text-left border border-stone-950 bg-white font-bold"
                      >
                        0. Main Menu
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2 mt-2 border-t border-stone-950/20 flex items-center justify-between text-[10px]">
                <span>Select option or press keypad</span>
                <span className="tabular-nums">Reply: {keypadBuffer || '_'}</span>
              </div>
            </div>

            {/* Physical Feature Phone Keypad */}
            <div className="mt-4 grid grid-cols-3 gap-2">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map(
                (k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => {
                      setKeypadBuffer(k);
                      handleDigitPress(k);
                    }}
                    className="min-h-[44px] rounded-xl bg-stone-800 hover:bg-stone-700 active:bg-stone-600 border border-stone-700 text-stone-100 font-mono text-sm font-bold flex items-center justify-center transition-colors"
                  >
                    {k}
                  </button>
                )
              )}
            </div>
          </div>
        </section>

        {/* Right Side: Live SMS Queue & USSD Reply Log */}
        <section className="lg:col-span-7 bg-white border-2 border-stone-950 rounded-md p-4 sm:p-5 text-stone-950 space-y-4">
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-stone-950">
            <div>
              <h2 className="text-base sm:text-lg font-extrabold">
                Formatted SMS &amp; USSD Sync ({activeLearner.fullName})
              </h2>
              <p className="text-xs text-stone-700 mt-0.5">
                Every Teacher Roll Call, Homework Digest, and Quick Note converts here automatically.
              </p>
            </div>
            <PhoneCall className="w-5 h-5 text-[#064e3b] shrink-0" aria-hidden="true" />
          </div>

          <div className="divide-y divide-stone-300">
            {smsAlerts.map((al, idx) => (
              <div key={al.id} className="py-3 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="font-bold">
                    #{idx + 1} · {al.title}
                  </span>
                  <span className="font-mono tabular-nums text-stone-700">
                    {al.createdAtLabel}
                  </span>
                </div>

                <p className="font-mono text-xs bg-stone-100 border border-stone-400 p-2.5 leading-relaxed">
                  {getFormattedSms(al)}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-xs font-bold text-[#064e3b]">
                    {al.parentReply
                      ? `Reply posted (${al.parentReply.channel}): ${al.parentReply.label} at ${al.parentReply.repliedAt}`
                      : 'Awaiting reply'}
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedAlertIndex(idx);
                        onUssdReply(al.id, activeLearner.id, 'ussd_yes', 'Yes');
                        setLastSentMessage(
                          `Reply "Yes" sent for ${activeLearner.firstName}.`
                        );
                        setScreen('sent');
                      }}
                      className="min-h-[40px] px-3 py-1.5 border-2 border-stone-950 bg-white hover:bg-[#064e3b] hover:text-white text-xs font-bold transition-colors"
                    >
                      1. Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedAlertIndex(idx);
                        onUssdReply(al.id, activeLearner.id, 'ussd_no', 'No');
                        setLastSentMessage(
                          `Reply "No" sent for ${activeLearner.firstName}.`
                        );
                        setScreen('sent');
                      }}
                      className="min-h-[40px] px-3 py-1.5 border-2 border-stone-950 bg-white hover:bg-stone-950 hover:text-white text-xs font-bold transition-colors"
                    >
                      2. No
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedAlertIndex(idx);
                        onUssdReply(
                          al.id,
                          activeLearner.id,
                          'ussd_call',
                          'Please call me'
                        );
                        setLastSentMessage(
                          `Reply "Please call me" sent for ${activeLearner.firstName}.`
                        );
                        setScreen('sent');
                      }}
                      className="min-h-[40px] px-3 py-1.5 border-2 border-stone-950 bg-amber-300 hover:bg-amber-400 text-stone-950 text-xs font-bold transition-colors"
                    >
                      3. Please call me
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
