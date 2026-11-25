import React, { useState } from 'react';
import {
  BookOpen,
  CalendarPlus,
  Check,
  CheckCheck,
  Clock,
  MessageSquarePlus,
  Send,
  Users,
} from 'lucide-react';
import { formatHomeworkDigestSms } from '../data/seedData';
import {
  AttendanceStatus,
  FeedAlert,
  HOMEWORK_CATEGORY_META,
  HOMEWORK_SUBJECTS,
  HomeworkCategory,
  HomeworkSubject,
  Learner,
  SchoolName,
} from '../types';
import { SafetyNotice } from './SafetyNotice';

interface TeacherPortalProps {
  teacherName: string;
  teacherSchool?: SchoolName;
  learners: Learner[];
  alerts: FeedAlert[];
  onMarkAttendance: (
    learnerId: string,
    status: Exclude<AttendanceStatus, 'unmarked'>
  ) => void;
  onMarkAllPresent: (learnerIds: string[]) => void;
  onAddHomeworkTask: (payload: {
    targetLearnerIds: string[];
    category: HomeworkCategory;
    subject: HomeworkSubject;
    description: string;
  }) => void;
  onBroadcastEvent: (payload: {
    targetSchool: SchoolName | 'all';
    eventKind: 'Event' | 'Sports' | 'Trip';
    title: string;
    eventDateLabel: string;
    body: string;
  }) => void;
  onSendQuickNote: (payload: {
    learnerId: string;
    title: string;
    body: string;
    convertToSms: boolean;
  }) => void;
}

type TeacherTab = 'rollcall' | 'homework' | 'events' | 'notes';

export function TeacherPortal({
  teacherName,
  teacherSchool,
  learners,
  alerts,
  onMarkAttendance,
  onMarkAllPresent,
  onAddHomeworkTask,
  onBroadcastEvent,
  onSendQuickNote,
}: TeacherPortalProps) {
  const [activeTab, setActiveTab] = useState<TeacherTab>('rollcall');
  const [schoolFilter, setSchoolFilter] = useState<SchoolName | 'all'>(
    teacherSchool ?? 'all'
  );
  const [actionToast, setActionToast] = useState<string | null>(null);

  // Homework composer state
  const [hwTarget, setHwTarget] = useState<string>('lerato-nkosi');
  const [hwCategory, setHwCategory] = useState<HomeworkCategory>('written');
  const [hwSubject, setHwSubject] = useState<HomeworkSubject>('Mathematics');
  const [hwDescription, setHwDescription] = useState('');

  // Event broadcast state
  const [eventTargetSchool, setEventTargetSchool] = useState<SchoolName | 'all'>(
    teacherSchool ?? 'Hazyview Primary'
  );
  const [eventKind, setEventKind] = useState<'Event' | 'Sports' | 'Trip'>('Trip');
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('2026-12-04');
  const [eventTime, setEventTime] = useState('07:30');
  const [eventBody, setEventBody] = useState('');

  // Quick parent note state
  const [noteLearnerId, setNoteLearnerId] = useState<string>('lerato-nkosi');
  const [noteTitle, setNoteTitle] = useState('');
  const [noteBody, setNoteBody] = useState('');
  const [convertToSms, setConvertToSms] = useState(true);

  const notify = (msg: string) => {
    setActionToast(msg);
    window.setTimeout(() => {
      setActionToast((cur) => (cur === msg ? null : cur));
    }, 3500);
  };

  const visibleLearners =
    schoolFilter === 'all'
      ? learners
      : learners.filter((l) => l.school === schoolFilter);

  const presentCount = visibleLearners.filter(
    (l) => l.attendance === 'present'
  ).length;
  const lateCount = visibleLearners.filter(
    (l) => l.attendance === 'late'
  ).length;
  const absentCount = visibleLearners.filter(
    (l) => l.attendance === 'absent'
  ).length;

  const handleMarkAll = () => {
    onMarkAllPresent(visibleLearners.map((l) => l.id));
    notify(
      `Marked ${visibleLearners.length} learners Present and pushed arrival alerts.`
    );
  };

  const handleSingleMark = (
    learner: Learner,
    status: Exclude<AttendanceStatus, 'unmarked'>
  ) => {
    onMarkAttendance(learner.id, status);
    const verb =
      status === 'present'
        ? 'Present (Arrival alert sent)'
        : status === 'late'
          ? 'Late (Late alert sent)'
          : 'Absent (Check-in prompt sent)';
    notify(`${learner.firstName}: marked ${verb}.`);
  };

  const handleHomeworkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const desc = hwDescription.trim();
    if (!desc) return;

    const targetIds =
      hwTarget === 'all-hazyview'
        ? learners
            .filter((l) => l.school === 'Hazyview Primary')
            .map((l) => l.id)
        : hwTarget === 'all-mkhuhlu'
          ? learners
              .filter((l) => l.school === 'Mkhuhlu Primary')
              .map((l) => l.id)
          : [hwTarget];

    onAddHomeworkTask({
      targetLearnerIds: targetIds,
      category: hwCategory,
      subject: hwSubject,
      description: desc,
    });

    setHwDescription('');
    notify(
      `Added ${HOMEWORK_CATEGORY_META[hwCategory].shortTag} task (${hwSubject}) to 15:30 Homework Digest.`
    );
  };

  const handleEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim() || !eventBody.trim()) return;

    const parsed = new Date(`${eventDate}T12:00:00`);
    const datePart = Number.isNaN(parsed.getTime())
      ? eventDate
      : parsed.toLocaleDateString('en-ZA', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        });

    onBroadcastEvent({
      targetSchool: eventTargetSchool,
      eventKind,
      title: eventTitle.trim(),
      eventDateLabel: `${datePart} · ${eventTime}`,
      body: eventBody.trim(),
    });

    setEventTitle('');
    setEventBody('');
    notify(`Broadcast "${eventTitle.trim()}" sent to Parent Feeds & Gogo SMS.`);
  };

  const handleNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteBody.trim()) return;
    const learner = learners.find((l) => l.id === noteLearnerId);
    onSendQuickNote({
      learnerId: noteLearnerId,
      title: noteTitle.trim() || `Note from ${teacherName}`,
      body: noteBody.trim(),
      convertToSms,
    });
    setNoteTitle('');
    setNoteBody('');
    notify(
      `Sent note for ${learner?.fullName ?? 'learner'}${
        convertToSms ? ' (converted to Gogo SMS)' : ''
      }.`
    );
  };

  const previewNoteLearner = learners.find((l) => l.id === noteLearnerId);
  const previewSmsText = noteBody.trim()
    ? `NOTE (${previewNoteLearner?.firstName ?? 'Learner'}): ${noteBody.trim().slice(0, 125)}`
    : `NOTE (${previewNoteLearner?.firstName ?? 'Learner'}): Your message will convert to a concise SMS for Gogo.`;

  const todayDigests = alerts.filter((a) => a.type === 'homework_digest');
  const recentReplies = alerts
    .filter((a) => a.parentReply || a.acknowledgedAt)
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 6);

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <section className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-[#064e3b] tracking-wide">
              Teacher &amp; Office Portal · {teacherSchool ?? 'Hazyview & Mkhuhlu Cluster'}
            </p>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-stone-950 mt-0.5">
              Classroom &amp; Office Dispatch
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
              Signed in as <strong className="text-stone-900">{teacherName}</strong>
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 sm:gap-4 text-center bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 shrink-0">
            <div>
              <div className="text-[11px] font-medium text-stone-600">Present</div>
              <div className="text-lg font-extrabold text-[#064e3b] tabular-nums">
                {presentCount}
              </div>
            </div>
            <div>
              <div className="text-[11px] font-medium text-stone-600">Late</div>
              <div className="text-lg font-extrabold text-amber-700 tabular-nums">
                {lateCount}
              </div>
            </div>
            <div>
              <div className="text-[11px] font-medium text-stone-600">Absent</div>
              <div className="text-lg font-extrabold text-red-700 tabular-nums">
                {absentCount}
              </div>
            </div>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div
          role="tablist"
          aria-label="Teacher and office tools"
          className="mt-5 grid grid-cols-2 lg:grid-cols-4 gap-2 p-1.5 bg-stone-100 rounded-xl"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'rollcall'}
            onClick={() => setActiveTab('rollcall')}
            className={`min-h-[44px] px-3 py-2 rounded-lg text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'rollcall'
                ? 'bg-[#064e3b] text-white shadow-sm'
                : 'text-stone-700 hover:text-stone-950 hover:bg-white/60'
            }`}
          >
            <Users className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Morning Roll Call</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'homework'}
            onClick={() => setActiveTab('homework')}
            className={`min-h-[44px] px-3 py-2 rounded-lg text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'homework'
                ? 'bg-[#064e3b] text-white shadow-sm'
                : 'text-stone-700 hover:text-stone-950 hover:bg-white/60'
            }`}
          >
            <BookOpen className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>15:30 Homework</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'events'}
            onClick={() => setActiveTab('events')}
            className={`min-h-[44px] px-3 py-2 rounded-lg text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'events'
                ? 'bg-[#064e3b] text-white shadow-sm'
                : 'text-stone-700 hover:text-stone-950 hover:bg-white/60'
            }`}
          >
            <CalendarPlus className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Events &amp; Trips</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'notes'}
            onClick={() => setActiveTab('notes')}
            className={`min-h-[44px] px-3 py-2 rounded-lg text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'notes'
                ? 'bg-[#064e3b] text-white shadow-sm'
                : 'text-stone-700 hover:text-stone-950 hover:bg-white/60'
            }`}
          >
            <MessageSquarePlus className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Quick Parent Note</span>
          </button>
        </div>
      </section>

      {actionToast && (
        <div
          role="status"
          className="rounded-xl border border-[#064e3b]/30 bg-emerald-50 px-4 py-3 text-xs sm:text-sm font-semibold text-[#064e3b] flex items-center gap-2"
        >
          <CheckCheck className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{actionToast}</span>
        </div>
      )}

      {/* Tab 1: 30-Second Morning Roll Call */}
      {activeTab === 'rollcall' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <section className="lg:col-span-8 bg-white border border-stone-200 rounded-2xl p-4 sm:p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-stone-200">
              <div>
                <h2 className="text-lg font-bold text-stone-950">
                  30-Second Morning Roll Call
                </h2>
                <p className="text-xs text-stone-600 mt-0.5">
                  Tap P, L, or A to immediately push Arrival, Late, or Absence check-in alerts.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  aria-label="Filter roll call by school"
                  value={schoolFilter}
                  onChange={(e) =>
                    setSchoolFilter(e.target.value as SchoolName | 'all')
                  }
                  className="min-h-[44px] px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 text-xs sm:text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#064e3b]"
                >
                  <option value="all">All Schools ({learners.length})</option>
                  <option value="Hazyview Primary">Hazyview Primary</option>
                  <option value="Mkhuhlu Primary">Mkhuhlu Primary</option>
                </select>

                <button
                  type="button"
                  onClick={handleMarkAll}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-[#064e3b] hover:bg-emerald-900 text-white text-xs sm:text-sm font-bold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap"
                >
                  <Check className="w-4 h-4" aria-hidden="true" />
                  <span>✓ Mark All Present</span>
                </button>
              </div>
            </div>

            <div className="divide-y divide-stone-200">
              {visibleLearners.map((learner) => (
                <div
                  key={learner.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <span className="text-sm sm:text-base font-bold text-stone-950">
                        {learner.fullName}
                      </span>
                      <span className="text-xs text-stone-500">
                        {learner.grade} · {learner.school}
                      </span>
                    </div>
                    <div className="text-xs text-stone-600 mt-0.5 tabular-nums">
                      Parent: {learner.parentName} ·{' '}
                      <span className="font-mono">{learner.parentPhone}</span>
                    </div>

                    {learner.registerNote && (
                      <div className="mt-1.5 text-xs font-semibold text-[#064e3b]">
                        Register Reply ({learner.registerNoteTime}):{' '}
                        {learner.registerNote}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleSingleMark(learner, 'present')}
                      aria-label={`Mark ${learner.fullName} Present`}
                      className={`min-h-[44px] min-w-[48px] px-3.5 rounded-xl text-sm font-extrabold transition-colors ${
                        learner.attendance === 'present'
                          ? 'bg-[#064e3b] text-white'
                          : 'bg-stone-100 hover:bg-emerald-50 text-stone-800 border border-stone-200'
                      }`}
                    >
                      P
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSingleMark(learner, 'late')}
                      aria-label={`Mark ${learner.fullName} Late`}
                      className={`min-h-[44px] min-w-[48px] px-3.5 rounded-xl text-sm font-extrabold transition-colors ${
                        learner.attendance === 'late'
                          ? 'bg-[#f59e0b] text-stone-950'
                          : 'bg-stone-100 hover:bg-amber-50 text-stone-800 border border-stone-200'
                      }`}
                    >
                      L
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSingleMark(learner, 'absent')}
                      aria-label={`Mark ${learner.fullName} Absent`}
                      className={`min-h-[44px] min-w-[48px] px-3.5 rounded-xl text-sm font-extrabold transition-colors ${
                        learner.attendance === 'absent'
                          ? 'bg-red-700 text-white'
                          : 'bg-stone-100 hover:bg-red-50 text-stone-800 border border-stone-200'
                      }`}
                    >
                      A
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Live Parent & Gogo Responses Panel */}
          <aside className="lg:col-span-4 space-y-4">
            <SafetyNotice compact />
            <div className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-5 shadow-sm">
              <h3 className="text-sm font-bold text-stone-950">
                Recent Parent &amp; Gogo Replies
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Live confirmations from Parent App and USSD *120*456#
              </p>

              <div className="mt-3 divide-y divide-stone-200">
                {recentReplies.length === 0 ? (
                  <p className="py-3 text-xs text-stone-500">
                    No confirmations received yet.
                  </p>
                ) : (
                  recentReplies.map((item) => {
                    const l = learners.find((x) => x.id === item.learnerId);
                    return (
                      <div key={item.id} className="py-2.5 text-xs">
                        <div className="font-bold text-stone-900">
                          {l?.fullName ?? 'Learner'} · {item.title}
                        </div>
                        <div className="text-[#064e3b] font-semibold mt-0.5">
                          {item.parentReply
                            ? `${item.parentReply.label} via ${item.parentReply.channel} (${item.parentReply.repliedAt})`
                            : `Confirmed by ${item.acknowledgedBy} (${item.acknowledgedAt})`}
                        </div>
                        {item.parentReply?.note && (
                          <p className="text-stone-600 mt-0.5">
                            “{item.parentReply.note}”
                          </p>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Tab 2: Bundled 15:30 Homework Digest */}
      {activeTab === 'homework' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <section className="lg:col-span-7 bg-white border border-stone-200 rounded-2xl p-4 sm:p-5 shadow-sm">
            <h2 className="text-lg font-bold text-stone-950">
              Bundled 15:30 Homework Digest
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
              Multiple tasks added for the same learner automatically bundle into one 15:30 digest card.
            </p>

            <form onSubmit={handleHomeworkSubmit} className="mt-4 space-y-4">
              <div>
                <label
                  htmlFor="hw-target"
                  className="block text-xs font-bold text-stone-800 mb-1.5"
                >
                  Target Learner or Class
                </label>
                <select
                  id="hw-target"
                  value={hwTarget}
                  onChange={(e) => setHwTarget(e.target.value)}
                  className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-stone-300 bg-white text-sm font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#064e3b]"
                >
                  <option value="all-hazyview">
                    Whole Class — Hazyview Primary (Grade 4B)
                  </option>
                  <option value="all-mkhuhlu">
                    Whole Class — Mkhuhlu Primary (Grade 5A)
                  </option>
                  {learners.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.fullName} ({l.grade} · {l.school})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <span className="block text-xs font-bold text-stone-800 mb-1.5">
                  Task Category
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {(
                    ['written', 'reading', 'bring'] as HomeworkCategory[]
                  ).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setHwCategory(cat)}
                      className={`min-h-[44px] px-3 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-colors whitespace-nowrap ${
                        hwCategory === cat
                          ? 'bg-[#064e3b] text-white border-[#064e3b]'
                          : 'bg-stone-50 hover:bg-stone-100 text-stone-900 border-stone-200'
                      }`}
                    >
                      {HOMEWORK_CATEGORY_META[cat].label}
                    </button>
                  ))}
                </div>
                {hwCategory === 'bring' && (
                  <p className="mt-1.5 text-xs font-semibold text-amber-800 inline-flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>
                      Automatically tagged with 06:30 Bag Check for morning readiness.
                    </span>
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="hw-subject"
                  className="block text-xs font-bold text-stone-800 mb-1.5"
                >
                  Subject
                </label>
                <select
                  id="hw-subject"
                  value={hwSubject}
                  onChange={(e) =>
                    setHwSubject(e.target.value as HomeworkSubject)
                  }
                  className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-stone-300 bg-white text-sm font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#064e3b]"
                >
                  {HOMEWORK_SUBJECTS.map((subj) => (
                    <option key={subj} value={subj}>
                      {subj}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="hw-desc"
                  className="block text-xs font-bold text-stone-800 mb-1.5"
                >
                  Task Instructions
                </label>
                <textarea
                  id="hw-desc"
                  rows={3}
                  value={hwDescription}
                  onChange={(e) => setHwDescription(e.target.value)}
                  placeholder="e.g. Complete multiplication problems on page 19 (numbers 1 to 8)."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#064e3b]"
                />
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setHwCategory('written');
                      setHwSubject('Mathematics');
                      setHwDescription(
                        'Complete division exercises p. 45 (Questions 1–5).'
                      );
                    }}
                    className="min-h-[36px] px-2.5 py-1 rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 text-xs font-medium text-stone-700"
                  >
                    Fill Maths Task
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setHwCategory('bring');
                      setHwSubject('Natural Sciences & Technology');
                      setHwDescription(
                        'Bring small empty tin and bean seeds for germination activity.'
                      );
                    }}
                    className="min-h-[36px] px-2.5 py-1 rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 text-xs font-medium text-stone-700"
                  >
                    Fill Bag Check Item
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={!hwDescription.trim()}
                className="w-full sm:w-auto min-h-[48px] px-5 py-2.5 rounded-xl bg-[#064e3b] hover:bg-emerald-900 disabled:bg-stone-300 text-white text-sm font-bold inline-flex items-center justify-center gap-2 transition-colors"
              >
                <Send className="w-4 h-4" aria-hidden="true" />
                <span>Add to 15:30 Homework Digest</span>
              </button>
            </form>
          </section>

          {/* Bundled Digest Live Overview */}
          <aside className="lg:col-span-5 bg-white border border-stone-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-stone-950">
              Active Bundled Digests Today
            </h3>
            <div className="divide-y divide-stone-200">
              {todayDigests.map((digest) => {
                const learner = learners.find((l) => l.id === digest.learnerId);
                const items = digest.homeworkItems ?? [];
                return (
                  <div key={digest.id} className="py-3 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold text-stone-950">
                        {learner?.fullName ?? digest.learnerId}
                      </span>
                      <span className="text-xs font-semibold text-[#064e3b] tabular-nums">
                        {items.length} bundled {items.length === 1 ? 'task' : 'tasks'}
                      </span>
                    </div>
                    <ul className="space-y-1 text-xs text-stone-700">
                      {items.map((item) => (
                        <li key={item.id} className="flex items-start gap-1.5">
                          <span>{HOMEWORK_CATEGORY_META[item.category].emoji}</span>
                          <span>
                            <strong>{item.subject}:</strong> {item.description}
                            {item.category === 'bring' ? ' [06:30 Bag Check]' : ''}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-[11px] font-mono text-stone-500 pt-1">
                      SMS preview:{' '}
                      {formatHomeworkDigestSms(
                        learner?.firstName ?? 'Learner',
                        items
                      )}
                    </p>
                  </div>
                );
              })}
            </div>
          </aside>
        </div>
      )}

      {/* Tab 3: Event / Sports / Trip Broadcast */}
      {activeTab === 'events' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <section className="lg:col-span-7 bg-white border border-stone-200 rounded-2xl p-4 sm:p-5 shadow-sm">
            <h2 className="text-lg font-bold text-stone-950">
              Event / Sports / Trip Broadcast
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
              Send date-stamped school reminders to Parent Feeds and Gogo USSD.
            </p>

            <form onSubmit={handleEventSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="ev-school"
                    className="block text-xs font-bold text-stone-800 mb-1.5"
                  >
                    Target School
                  </label>
                  <select
                    id="ev-school"
                    value={eventTargetSchool}
                    onChange={(e) =>
                      setEventTargetSchool(e.target.value as SchoolName | 'all')
                    }
                    className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-stone-300 bg-white text-sm font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#064e3b]"
                  >
                    <option value="Hazyview Primary">Hazyview Primary</option>
                    <option value="Mkhuhlu Primary">Mkhuhlu Primary</option>
                    <option value="all">Both Hazyview &amp; Mkhuhlu</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="ev-kind"
                    className="block text-xs font-bold text-stone-800 mb-1.5"
                  >
                    Reminder Type
                  </label>
                  <select
                    id="ev-kind"
                    value={eventKind}
                    onChange={(e) =>
                      setEventKind(
                        e.target.value as 'Event' | 'Sports' | 'Trip'
                      )
                    }
                    className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-stone-300 bg-white text-sm font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#064e3b]"
                  >
                    <option value="Event">School Event</option>
                    <option value="Sports">Sports Match / Derby</option>
                    <option value="Trip">Educational Trip</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="ev-date"
                    className="block text-xs font-bold text-stone-800 mb-1.5"
                  >
                    Event Date
                  </label>
                  <input
                    id="ev-date"
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-stone-300 bg-white text-sm font-mono tabular-nums text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#064e3b]"
                  />
                </div>
                <div>
                  <label
                    htmlFor="ev-time"
                    className="block text-xs font-bold text-stone-800 mb-1.5"
                  >
                    Start Time
                  </label>
                  <input
                    id="ev-time"
                    type="time"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-stone-300 bg-white text-sm font-mono tabular-nums text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#064e3b]"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="ev-title"
                  className="block text-xs font-bold text-stone-800 mb-1.5"
                >
                  Reminder Headline
                </label>
                <input
                  id="ev-title"
                  type="text"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="e.g. Kruger Gate Conservation Excursion"
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-stone-300 bg-white text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#064e3b]"
                />
              </div>

              <div>
                <label
                  htmlFor="ev-body"
                  className="block text-xs font-bold text-stone-800 mb-1.5"
                >
                  Details &amp; What Learners Need
                </label>
                <textarea
                  id="ev-body"
                  rows={3}
                  value={eventBody}
                  onChange={(e) => setEventBody(e.target.value)}
                  placeholder="e.g. Grade 4 bus departs Hazyview Primary gate at 07:30. Learners must wear full uniform, sun hat, and bring packed lunch."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#064e3b]"
                />
                <button
                  type="button"
                  onClick={() => {
                    setEventKind('Trip');
                    setEventTitle('Kruger Gate Conservation Excursion');
                    setEventBody(
                      'Grade 4 learners depart from Hazyview Primary main gate at 07:30 sharp. Please pack a water bottle, sun hat, and lunch.'
                    );
                  }}
                  className="mt-2 min-h-[36px] px-2.5 py-1 rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 text-xs font-medium text-stone-700"
                >
                  Fill Sample Trip Reminder
                </button>
              </div>

              <button
                type="submit"
                disabled={!eventTitle.trim() || !eventBody.trim()}
                className="w-full sm:w-auto min-h-[48px] px-5 py-2.5 rounded-xl bg-[#064e3b] hover:bg-emerald-900 disabled:bg-stone-300 text-white text-sm font-bold inline-flex items-center justify-center gap-2 transition-colors"
              >
                <Send className="w-4 h-4" aria-hidden="true" />
                <span>Send Date-Stamped Broadcast</span>
              </button>
            </form>
          </section>

          <aside className="lg:col-span-5 space-y-4">
            <SafetyNotice />
            <div className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-5 shadow-sm">
              <h3 className="text-sm font-bold text-stone-950">
                Recent Event &amp; Trip Reminders
              </h3>
              <div className="mt-3 divide-y divide-stone-200">
                {alerts
                  .filter((a) => a.type === 'event')
                  .slice(0, 4)
                  .map((ev) => (
                    <div key={ev.id} className="py-2.5 text-xs">
                      <div className="font-bold text-stone-900">{ev.title}</div>
                      <div className="text-[#064e3b] font-semibold mt-0.5 tabular-nums">
                        {ev.eventKind} · {ev.eventDateLabel}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Tab 4: Quick Parent Note */}
      {activeTab === 'notes' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <section className="lg:col-span-7 bg-white border border-stone-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
            <div>
              <h2 className="text-lg font-bold text-stone-950">
                Quick Parent Note
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
                Send a direct note to the Parent Feed and convert it to SMS for Gogo’s feature phone.
              </p>
            </div>

            <SafetyNotice compact />

            <form onSubmit={handleNoteSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="note-learner"
                  className="block text-xs font-bold text-stone-800 mb-1.5"
                >
                  Select Learner
                </label>
                <select
                  id="note-learner"
                  value={noteLearnerId}
                  onChange={(e) => setNoteLearnerId(e.target.value)}
                  className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-stone-300 bg-white text-sm font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#064e3b]"
                >
                  {learners.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.fullName} ({l.grade} · {l.parentName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="note-title"
                  className="block text-xs font-bold text-stone-800 mb-1.5"
                >
                  Subject / Note Title
                </label>
                <input
                  id="note-title"
                  type="text"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="e.g. Afternoon Netball Practice Pickup"
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-stone-300 bg-white text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#064e3b]"
                />
              </div>

              <div>
                <label
                  htmlFor="note-body"
                  className="block text-xs font-bold text-stone-800 mb-1.5"
                >
                  Message to Parent &amp; Family
                </label>
                <textarea
                  id="note-body"
                  rows={3}
                  value={noteBody}
                  onChange={(e) => setNoteBody(e.target.value)}
                  placeholder="Write a clear message for the Parent Feed and Gogo SMS..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#064e3b]"
                />
              </div>

              <label className="min-h-[44px] flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={convertToSms}
                  onChange={(e) => setConvertToSms(e.target.checked)}
                  className="w-5 h-5 accent-[#064e3b] rounded cursor-pointer"
                />
                <span className="text-xs sm:text-sm font-semibold text-stone-900">
                  Convert to SMS for Gogo (*120*456#)
                </span>
              </label>

              {convertToSms && (
                <div className="rounded-xl border border-stone-200 bg-stone-50 p-3">
                  <div className="text-[11px] font-bold text-stone-600">
                    Gogo SMS Preview
                  </div>
                  <p className="mt-1 font-mono text-xs text-stone-900 leading-relaxed">
                    {previewSmsText}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={!noteBody.trim()}
                className="w-full sm:w-auto min-h-[48px] px-5 py-2.5 rounded-xl bg-[#064e3b] hover:bg-emerald-900 disabled:bg-stone-300 text-white text-sm font-bold inline-flex items-center justify-center gap-2 transition-colors"
              >
                <Send className="w-4 h-4" aria-hidden="true" />
                <span>Send Parent Note</span>
              </button>
            </form>
          </section>

          <aside className="lg:col-span-5 bg-white border border-stone-200 rounded-2xl p-4 sm:p-5 shadow-sm">
            <h3 className="text-sm font-bold text-stone-950">
              Recent Sent Notes
            </h3>
            <div className="mt-3 divide-y divide-stone-200">
              {alerts
                .filter((a) => a.type === 'note')
                .slice(0, 5)
                .map((note) => {
                  const l = learners.find((x) => x.id === note.learnerId);
                  return (
                    <div key={note.id} className="py-3 text-xs space-y-1">
                      <div className="font-bold text-stone-900">
                        {l?.fullName ?? 'Learner'} · {note.title}
                      </div>
                      <p className="text-stone-700">{note.body}</p>
                      {note.smsSentToGogo && (
                        <div className="font-mono text-[11px] text-[#064e3b]">
                          SMS sent to Gogo USSD
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
