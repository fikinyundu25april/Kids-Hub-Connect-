import React, { useState } from 'react';
import {
  Bus,
  CalendarDays,
  Check,
  CheckCheck,
  Clock,
  HeartPulse,
  Home,
  MessageSquareText,
  Send,
  WifiOff,
} from 'lucide-react';
import {
  FeedAlert,
  HOMEWORK_CATEGORY_META,
  Learner,
  ParentReply,
} from '../types';
import { SafetyNotice } from './SafetyNotice';

interface ParentFeedProps {
  learners: Learner[];
  selectedLearnerId: string;
  onSelectLearner: (learnerId: string) => void;
  alerts: FeedAlert[];
  dataFreeMode: boolean;
  onToggleDataFree: () => void;
  onAcknowledgeAlert: (alertId: string, responderName: string) => void;
  onToggleHomeworkTask: (alertId: string, taskId: string) => void;
  onMarkAllHomeworkDone: (alertId: string, responderName: string) => void;
  onSendAbsenceReply: (
    alertId: string,
    learnerId: string,
    kind: ParentReply['kind'],
    label: string,
    note?: string
  ) => void;
  currentViewerName: string;
  isParentRole: boolean;
}

const ALERT_TYPE_LABELS: Record<FeedAlert['type'], string> = {
  arrival: 'Arrival Update',
  homework_digest: '15:30 Homework Digest',
  event: 'Event / Trip Reminder',
  absence: 'Absence Check-In',
  note: 'Teacher Note',
};

export function ParentFeed({
  learners,
  selectedLearnerId,
  onSelectLearner,
  alerts,
  dataFreeMode,
  onToggleDataFree,
  onAcknowledgeAlert,
  onToggleHomeworkTask,
  onMarkAllHomeworkDone,
  onSendAbsenceReply,
  currentViewerName,
  isParentRole,
}: ParentFeedProps) {
  const [customNoteByAlert, setCustomNoteByAlert] = useState<
    Record<string, string>
  >({});

  const activeLearner =
    learners.find((l) => l.id === selectedLearnerId) ?? learners[0];

  const learnerAlerts = alerts
    .filter((a) => a.learnerId === activeLearner?.id)
    .sort((a, b) => b.timestamp - a.timestamp);

  const unreadAckCount = learnerAlerts.filter(
    (a) => !a.acknowledgedAt && !a.parentReply
  ).length;

  const digestAlerts = learnerAlerts.filter((a) => a.type === 'homework_digest');
  const totalHomeworkCount = digestAlerts.reduce(
    (sum, a) => sum + (a.homeworkItems?.length ?? 0),
    0
  );
  const completedHomeworkCount = digestAlerts.reduce(
    (sum, a) =>
      sum + (a.homeworkItems?.filter((t) => t.completed).length ?? 0),
    0
  );

  const cardClass = dataFreeMode
    ? 'bg-white border-2 border-stone-950 rounded-md p-4 text-stone-950'
    : 'bg-white border border-stone-200 rounded-2xl p-4 sm:p-5 shadow-sm text-stone-900';

  const handleCustomAbsenceSubmit = (
    e: React.FormEvent,
    alert: FeedAlert
  ) => {
    e.preventDefault();
    const txt = (customNoteByAlert[alert.id] ?? '').trim();
    if (!txt) return;
    onSendAbsenceReply(
      alert.id,
      alert.learnerId,
      'custom',
      `Parent Note: ${txt}`,
      txt
    );
    setCustomNoteByAlert((prev) => ({ ...prev, [alert.id]: '' }));
  };

  if (!activeLearner) {
    return null;
  }

  return (
    <div className="space-y-5">
      {/* Top Feed Header + Data-Free Mode Toggle */}
      <section className={cardClass}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="min-w-0">
            <div className="text-xs font-semibold text-[#064e3b] tracking-wide">
              Parent Feed · {activeLearner.school}
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-stone-950 mt-0.5">
              {activeLearner.fullName}
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 mt-0.5 tabular-nums">
              {activeLearner.grade} · Parent: {activeLearner.parentName} (
              <span className="font-mono">{activeLearner.parentPhone}</span>)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {!isParentRole && (
              <label className="sr-only" htmlFor="parent-feed-learner-select">
                Select learner
              </label>
            )}
            {learners.length > 1 && (
              <select
                id="parent-feed-learner-select"
                value={activeLearner.id}
                onChange={(e) => onSelectLearner(e.target.value)}
                aria-label="Switch learner feed"
                className={`min-h-[44px] px-3 py-2 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#064e3b] ${
                  dataFreeMode
                    ? 'border-2 border-stone-950 bg-white text-stone-950 rounded-md'
                    : 'border border-stone-300 bg-stone-50 text-stone-900 rounded-xl'
                }`}
              >
                {learners.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.fullName} ({l.grade})
                  </option>
                ))}
              </select>
            )}

            <button
              type="button"
              role="switch"
              aria-checked={dataFreeMode}
              onClick={onToggleDataFree}
              className={`min-h-[44px] px-3.5 py-2 text-xs sm:text-sm font-bold inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 ${
                dataFreeMode
                  ? 'bg-stone-950 text-white border-2 border-stone-950 rounded-md'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-900 border border-stone-300 rounded-xl'
              }`}
            >
              <WifiOff className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Data-Free Mode: {dataFreeMode ? 'ON' : 'OFF'}</span>
            </button>
          </div>
        </div>

        {dataFreeMode && (
          <div className="mt-3 pt-3 border-t border-stone-900 text-xs font-mono text-stone-950 flex flex-wrap items-center justify-between gap-2">
            <span>LOW-BANDWIDTH HIGH-CONTRAST VIEW ACTIVE</span>
            <span className="tabular-nums">Images &amp; heavy styles disabled</span>
          </div>
        )}
      </section>

      {/* Safety Notice */}
      <SafetyNotice dataFreeMode={dataFreeMode} />

      {/* Desktop 2-column / Mobile 1-column workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Summary Sidebar on Desktop (Top compact strip on mobile) */}
        <aside className="lg:col-span-4 space-y-4">
          <div className={cardClass}>
            <h2 className="text-sm font-bold text-stone-950">
              Today’s Learner Snapshot
            </h2>
            <dl className="mt-3 divide-y divide-stone-200 text-sm">
              <div className="py-2.5 flex items-center justify-between gap-3">
                <dt className="text-stone-600">Roll Call Status</dt>
                <dd className="font-bold text-stone-950 capitalize tabular-nums">
                  {activeLearner.attendance === 'unmarked'
                    ? 'Awaiting Roll Call'
                    : activeLearner.attendance}
                  {activeLearner.attendanceUpdatedAt
                    ? ` · ${activeLearner.attendanceUpdatedAt}`
                    : ''}
                </dd>
              </div>
              <div className="py-2.5 flex items-center justify-between gap-3">
                <dt className="text-stone-600">Homework Progress</dt>
                <dd className="font-bold text-[#064e3b] tabular-nums">
                  {completedHomeworkCount} / {totalHomeworkCount} tasks
                </dd>
              </div>
              <div className="py-2.5 flex items-center justify-between gap-3">
                <dt className="text-stone-600">Pending Confirmations</dt>
                <dd className="font-bold text-stone-950 tabular-nums">
                  {unreadAckCount}
                </dd>
              </div>
              {activeLearner.registerNote && (
                <div className="pt-2.5">
                  <dt className="text-xs font-semibold text-stone-600">
                    Sent to Register
                  </dt>
                  <dd className="mt-1 text-xs font-semibold text-[#064e3b]">
                    {activeLearner.registerNote} ({activeLearner.registerNoteTime})
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </aside>

        {/* Chronological Alert Stream */}
        <section
          aria-label="Chronological alert stream"
          className="lg:col-span-8 space-y-4"
        >
          {learnerAlerts.length === 0 ? (
            <div className={cardClass}>
              <p className="text-sm text-stone-600">
                No alerts posted for {activeLearner.fullName} yet today.
              </p>
            </div>
          ) : (
            learnerAlerts.map((alert) => {
              const isConfirmed = Boolean(
                alert.acknowledgedAt || alert.parentReply
              );

              return (
                <article key={alert.id} className={cardClass}>
                  {/* Clean unboxed metadata kicker */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-600">
                    <div className="flex flex-wrap items-center gap-1.5 font-medium">
                      <span
                        className={`font-bold ${
                          alert.type === 'absence'
                            ? 'text-red-800'
                            : alert.type === 'homework_digest'
                              ? 'text-[#064e3b]'
                              : 'text-stone-800'
                        }`}
                      >
                        {ALERT_TYPE_LABELS[alert.type]}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">
                        {alert.createdAtLabel}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{alert.senderName}</span>
                    </div>

                    {isConfirmed && (
                      <span className="text-xs font-bold text-[#064e3b] inline-flex items-center gap-1 tabular-nums">
                        <CheckCheck className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>
                          {alert.parentReply
                            ? `${alert.parentReply.label} (${alert.parentReply.repliedAt})`
                            : `Confirmed ${alert.acknowledgedAt}`}
                        </span>
                      </span>
                    )}
                  </div>

                  {/* Card Title & Body */}
                  <h3 className="mt-2 text-base sm:text-lg font-bold text-stone-950 leading-snug">
                    {alert.title}
                  </h3>

                  {alert.eventDateLabel && (
                    <div className="mt-1.5 inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#064e3b] tabular-nums">
                      <CalendarDays className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <span>
                        {alert.eventKind ?? 'Event'} Date: {alert.eventDateLabel}
                      </span>
                    </div>
                  )}

                  <p className="mt-1.5 text-sm text-stone-700 leading-relaxed">
                    {alert.body}
                  </p>

                  {/* Bundled 15:30 Homework Digest Tasks */}
                  {alert.type === 'homework_digest' && alert.homeworkItems && (
                    <div className="mt-4 space-y-2.5">
                      <div className="divide-y divide-stone-200 border-t border-b border-stone-200">
                        {alert.homeworkItems.map((task) => {
                          const catMeta = HOMEWORK_CATEGORY_META[task.category];
                          return (
                            <label
                              key={task.id}
                              className="min-h-[48px] py-3 flex items-start gap-3 cursor-pointer select-none"
                            >
                              <input
                                type="checkbox"
                                checked={task.completed}
                                onChange={() =>
                                  onToggleHomeworkTask(alert.id, task.id)
                                }
                                className="mt-0.5 w-5 h-5 accent-[#064e3b] rounded shrink-0 cursor-pointer"
                              />
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                                  <span className="font-bold text-stone-900">
                                    {catMeta.label}
                                  </span>
                                  <span aria-hidden="true" className="text-stone-400">
                                    ·
                                  </span>
                                  <span className="font-semibold text-[#064e3b]">
                                    {task.subject}
                                  </span>
                                  {task.category === 'bring' && (
                                    <>
                                      <span aria-hidden="true" className="text-stone-400">
                                        ·
                                      </span>
                                      <span
                                        className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold font-mono tabular-nums ${
                                          dataFreeMode
                                            ? 'border border-stone-950 bg-white text-stone-950'
                                            : 'bg-amber-100 text-amber-950 border border-amber-300 rounded'
                                        }`}
                                      >
                                        <Clock className="w-3 h-3" aria-hidden="true" />
                                        <span>06:30 Bag Check</span>
                                      </span>
                                    </>
                                  )}
                                </div>
                                <p
                                  className={`mt-1 text-sm leading-snug ${
                                    task.completed
                                      ? 'line-through text-stone-500'
                                      : 'text-stone-800'
                                  }`}
                                >
                                  {task.description}
                                </p>
                              </div>
                            </label>
                          );
                        })}
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                        <span className="text-xs font-medium text-stone-600 tabular-nums">
                          {alert.homeworkItems.filter((t) => t.completed).length} of{' '}
                          {alert.homeworkItems.length} completed
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            onMarkAllHomeworkDone(alert.id, currentViewerName)
                          }
                          disabled={alert.homeworkItems.every((t) => t.completed)}
                          className={`min-h-[44px] px-4 py-2 text-xs sm:text-sm font-bold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                            alert.homeworkItems.every((t) => t.completed)
                              ? 'bg-stone-100 text-stone-500 border border-stone-200 cursor-default rounded-xl'
                              : dataFreeMode
                                ? 'bg-stone-950 text-white border-2 border-stone-950 rounded-md hover:bg-stone-800'
                                : 'bg-[#064e3b] hover:bg-emerald-900 text-white rounded-xl'
                          }`}
                        >
                          <CheckCheck className="w-4 h-4" aria-hidden="true" />
                          <span>
                            {alert.homeworkItems.every((t) => t.completed)
                              ? 'All Tasks Done'
                              : 'Mark All Done'}
                          </span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Absence Check-In 1-Tap Responses */}
                  {alert.type === 'absence' && (
                    <div className="mt-4 pt-3 border-t border-stone-200 space-y-3">
                      <p className="text-xs font-bold text-stone-800">
                        Send 1-tap reason back to the Morning Roll Call register:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            onSendAbsenceReply(
                              alert.id,
                              alert.learnerId,
                              'clinic',
                              'Clinic Visit',
                              'Learner is at the local clinic / medical check-up.'
                            )
                          }
                          className={`min-h-[44px] px-3 py-2 text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors ${
                            alert.parentReply?.kind === 'clinic'
                              ? 'bg-[#064e3b] text-white rounded-xl'
                              : dataFreeMode
                                ? 'border-2 border-stone-950 bg-white text-stone-950 rounded-md hover:bg-stone-100'
                                : 'border border-stone-300 bg-stone-50 hover:bg-stone-100 text-stone-900 rounded-xl'
                          }`}
                        >
                          <HeartPulse className="w-4 h-4 shrink-0" aria-hidden="true" />
                          <span>Clinic Note</span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            onSendAbsenceReply(
                              alert.id,
                              alert.learnerId,
                              'transport',
                              'Transport Delay',
                              'Delayed by morning scholar transport / taxi.'
                            )
                          }
                          className={`min-h-[44px] px-3 py-2 text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors ${
                            alert.parentReply?.kind === 'transport'
                              ? 'bg-[#064e3b] text-white rounded-xl'
                              : dataFreeMode
                                ? 'border-2 border-stone-950 bg-white text-stone-950 rounded-md hover:bg-stone-100'
                                : 'border border-stone-300 bg-stone-50 hover:bg-stone-100 text-stone-900 rounded-xl'
                          }`}
                        >
                          <Bus className="w-4 h-4 shrink-0" aria-hidden="true" />
                          <span>Transport Delay</span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            onSendAbsenceReply(
                              alert.id,
                              alert.learnerId,
                              'sick',
                              'Resting at Home',
                              'Unwell today, resting at home with family.'
                            )
                          }
                          className={`min-h-[44px] px-3 py-2 text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors ${
                            alert.parentReply?.kind === 'sick'
                              ? 'bg-[#064e3b] text-white rounded-xl'
                              : dataFreeMode
                                ? 'border-2 border-stone-950 bg-white text-stone-950 rounded-md hover:bg-stone-100'
                                : 'border border-stone-300 bg-stone-50 hover:bg-stone-100 text-stone-900 rounded-xl'
                          }`}
                        >
                          <Home className="w-4 h-4 shrink-0" aria-hidden="true" />
                          <span>Sick at Home</span>
                        </button>
                      </div>

                      <form
                        onSubmit={(e) => handleCustomAbsenceSubmit(e, alert)}
                        className="flex gap-2"
                      >
                        <input
                          type="text"
                          value={customNoteByAlert[alert.id] ?? ''}
                          onChange={(e) =>
                            setCustomNoteByAlert((prev) => ({
                              ...prev,
                              [alert.id]: e.target.value,
                            }))
                          }
                          placeholder="Or type a short Clinic / Transport note..."
                          aria-label="Custom absence note for register"
                          className={`flex-1 min-h-[44px] px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#064e3b] ${
                            dataFreeMode
                              ? 'border-2 border-stone-950 bg-white rounded-md'
                              : 'border border-stone-300 bg-white rounded-xl'
                          }`}
                        />
                        <button
                          type="submit"
                          className={`min-h-[44px] px-3.5 py-2 text-xs font-bold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                            dataFreeMode
                              ? 'bg-stone-950 text-white rounded-md'
                              : 'bg-[#064e3b] hover:bg-emerald-900 text-white rounded-xl'
                          }`}
                        >
                          <Send className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Send to Register</span>
                        </button>
                      </form>
                    </div>
                  )}

                  {/* Standard 1-Tap Confirmation for Arrival / Event / Note */}
                  {alert.type !== 'homework_digest' &&
                    alert.type !== 'absence' && (
                      <div className="mt-4 pt-3 border-t border-stone-200 flex flex-wrap items-center justify-between gap-2">
                        {alert.smsSentToGogo && (
                          <span className="text-xs text-stone-500 inline-flex items-center gap-1">
                            <MessageSquareText
                              className="w-3.5 h-3.5"
                              aria-hidden="true"
                            />
                            <span>Also queued for Gogo USSD (*120*456#)</span>
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            onAcknowledgeAlert(alert.id, currentViewerName)
                          }
                          disabled={isConfirmed}
                          className={`min-h-[44px] px-4 py-2 text-xs sm:text-sm font-bold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap ml-auto ${
                            isConfirmed
                              ? 'bg-stone-100 text-[#064e3b] border border-stone-200 rounded-xl cursor-default'
                              : dataFreeMode
                                ? 'bg-stone-950 text-white border-2 border-stone-950 rounded-md hover:bg-stone-800'
                                : 'bg-[#064e3b] hover:bg-emerald-900 text-white rounded-xl'
                          }`}
                        >
                          <Check className="w-4 h-4" aria-hidden="true" />
                          <span>
                            {isConfirmed ? 'Confirmed' : '1-Tap Confirm'}
                          </span>
                        </button>
                      </div>
                    )}
                </article>
              );
            })
          )}
        </section>
      </div>
    </div>
  );
}
