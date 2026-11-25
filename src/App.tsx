import { useEffect, useState } from 'react';
import { LogOut, RotateCcw, School } from 'lucide-react';
import { GogoUssdSimulator } from './components/GogoUssdSimulator';
import { LoginScreen } from './components/LoginScreen';
import { ParentFeed } from './components/ParentFeed';
import { TeacherPortal } from './components/TeacherPortal';
import { formatHomeworkDigestSms, TODAY_KEY } from './data/seedData';
import {
  AttendanceStatus,
  AuthSession,
  FeedAlert,
  HomeworkCategory,
  HomeworkSubject,
  HomeworkTask,
  KidsHubState,
  ParentReply,
  PortalView,
  SchoolName,
} from './types';
import {
  loadAppState,
  loadAuthSession,
  resetAppState,
  saveAppState,
  saveAuthSession,
} from './utils/storage';

function formatCurrentTime(): string {
  const now = new Date();
  return now.toLocaleTimeString('en-ZA', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export default function App() {
  const [appState, setAppState] = useState<KidsHubState>(() => loadAppState());
  const [session, setSession] = useState<AuthSession | null>(() =>
    loadAuthSession()
  );
  const [activePortal, setActivePortal] = useState<PortalView>(() =>
    loadAuthSession()?.role === 'teacher' ? 'teacher' : 'parent'
  );
  const [selectedLearnerId, setSelectedLearnerId] = useState<string>(() => {
    const existing = loadAuthSession();
    if (existing?.linkedLearnerIds?.[0]) {
      return existing.linkedLearnerIds[0];
    }
    return 'lerato-nkosi';
  });
  const [resetFlash, setResetFlash] = useState(false);

  useEffect(() => {
    saveAppState(appState);
  }, [appState]);

  useEffect(() => {
    saveAuthSession(session);
  }, [session]);

  const handleLogin = (newSession: AuthSession) => {
    setSession(newSession);
    if (newSession.role === 'teacher') {
      setActivePortal('teacher');
    } else {
      setActivePortal('parent');
      if (newSession.linkedLearnerIds[0]) {
        setSelectedLearnerId(newSession.linkedLearnerIds[0]);
      }
    }
  };

  const handleSignOut = () => {
    setSession(null);
    saveAuthSession(null);
  };

  const handleResetData = () => {
    const restored = resetAppState();
    setAppState(restored);
    setResetFlash(true);
    window.setTimeout(() => {
      setResetFlash(false);
    }, 2500);
  };

  const handleToggleDataFree = () => {
    setAppState((prev) => ({
      ...prev,
      dataFreeMode: !prev.dataFreeMode,
    }));
  };

  const handleMarkAttendance = (
    learnerId: string,
    status: Exclude<AttendanceStatus, 'unmarked'>
  ) => {
    const timeStr = formatCurrentTime();
    const nowMs = Date.now();

    setAppState((prev) => {
      const learner = prev.learners.find((l) => l.id === learnerId);
      if (!learner) return prev;

      const updatedLearners = prev.learners.map((l) =>
        l.id === learnerId
          ? {
              ...l,
              attendance: status,
              attendanceUpdatedAt: timeStr,
            }
          : l
      );

      let newAlert: FeedAlert;
      if (status === 'present') {
        newAlert = {
          id: `alert-att-${learnerId}-${nowMs}`,
          learnerId,
          type: 'arrival',
          title: 'Morning Arrival Confirmed',
          body: `${learner.fullName} arrived safely and was marked Present in ${learner.grade} Morning Roll Call.`,
          createdAtLabel: `Today · ${timeStr}`,
          timestamp: nowMs,
          dayKey: TODAY_KEY,
          senderName:
            session?.role === 'teacher'
              ? `${session.displayName} · ${learner.grade}`
              : 'School Office',
          attendanceStatus: 'present',
          smsSentToGogo: true,
          smsText: `ARRIVAL: ${learner.fullName} marked PRESENT at ${learner.school} (${timeStr}).`,
        };
      } else if (status === 'late') {
        newAlert = {
          id: `alert-att-${learnerId}-${nowMs}`,
          learnerId,
          type: 'arrival',
          title: `Late Arrival: ${learner.firstName}`,
          body: `${learner.fullName} arrived late and checked into ${learner.grade} at ${timeStr}.`,
          createdAtLabel: `Today · ${timeStr}`,
          timestamp: nowMs,
          dayKey: TODAY_KEY,
          senderName:
            session?.role === 'teacher'
              ? `${session.displayName} · ${learner.grade}`
              : 'School Office',
          attendanceStatus: 'late',
          smsSentToGogo: true,
          smsText: `LATE ARRIVAL: ${learner.fullName} arrived late at ${learner.school} (${timeStr}).`,
        };
      } else {
        newAlert = {
          id: `alert-abs-${learnerId}-${nowMs}`,
          learnerId,
          type: 'absence',
          title: `Absence Check-In: ${learner.fullName}`,
          body: `${learner.firstName} was absent during ${learner.grade} Morning Roll Call at ${timeStr}. Please tap below to send a Clinic, Transport, or Home note to the register.`,
          createdAtLabel: `Today · ${timeStr}`,
          timestamp: nowMs,
          dayKey: TODAY_KEY,
          senderName:
            session?.role === 'teacher'
              ? `${session.displayName} · ${learner.grade}`
              : 'School Office',
          attendanceStatus: 'absent',
          smsSentToGogo: true,
          smsText: `ABSENCE CHECK: ${learner.fullName} not in class at ${timeStr}. Reply 1=Yes (safe/clinic), 2=No, 3=Please call me.`,
        };
      }

      return {
        ...prev,
        learners: updatedLearners,
        alerts: [newAlert, ...prev.alerts],
      };
    });
  };

  const handleMarkAllPresent = (learnerIds: string[]) => {
    const timeStr = formatCurrentTime();
    const nowMs = Date.now();

    setAppState((prev) => {
      const targetSet = new Set(learnerIds);
      const newlyMarked: FeedAlert[] = [];

      const updatedLearners = prev.learners.map((l, idx) => {
        if (!targetSet.has(l.id)) return l;
        if (l.attendance !== 'present') {
          newlyMarked.push({
            id: `alert-all-${l.id}-${nowMs + idx}`,
            learnerId: l.id,
            type: 'arrival',
            title: 'Morning Arrival Confirmed',
            body: `${l.fullName} arrived safely and was marked Present in ${l.grade} Morning Roll Call.`,
            createdAtLabel: `Today · ${timeStr}`,
            timestamp: nowMs + idx,
            dayKey: TODAY_KEY,
            senderName:
              session?.role === 'teacher'
                ? `${session.displayName} · ${l.grade}`
                : 'School Office',
            attendanceStatus: 'present',
            smsSentToGogo: true,
            smsText: `ARRIVAL: ${l.fullName} marked PRESENT at ${l.school} (${timeStr}).`,
          });
        }
        return {
          ...l,
          attendance: 'present' as const,
          attendanceUpdatedAt: timeStr,
        };
      });

      return {
        ...prev,
        learners: updatedLearners,
        alerts: [...newlyMarked, ...prev.alerts],
      };
    });
  };

  const handleAddHomeworkTask = (payload: {
    targetLearnerIds: string[];
    category: HomeworkCategory;
    subject: HomeworkSubject;
    description: string;
  }) => {
    const nowMs = Date.now();
    const timeStr = formatCurrentTime();

    setAppState((prev) => {
      let nextAlerts = [...prev.alerts];

      payload.targetLearnerIds.forEach((learnerId, idx) => {
        const learner = prev.learners.find((l) => l.id === learnerId);
        if (!learner) return;

        const newTask: HomeworkTask = {
          id: `hw-${learnerId}-${nowMs}-${idx}`,
          category: payload.category,
          subject: payload.subject,
          description: payload.description,
          completed: false,
          ...(payload.category === 'bring'
            ? { bagCheckTag: '06:30 Bag Check' as const }
            : {}),
        };

        const existingIndex = nextAlerts.findIndex(
          (a) =>
            a.learnerId === learnerId &&
            a.type === 'homework_digest' &&
            a.dayKey === TODAY_KEY
        );

        if (existingIndex >= 0) {
          const existing = nextAlerts[existingIndex];
          const updatedTasks = [...(existing.homeworkItems ?? []), newTask];
          nextAlerts[existingIndex] = {
            ...existing,
            title: `15:30 Homework Digest (${updatedTasks.length} ${
              updatedTasks.length === 1 ? 'Task' : 'Tasks'
            })`,
            createdAtLabel: `Today · ${timeStr}`,
            timestamp: nowMs + idx,
            homeworkItems: updatedTasks,
            smsSentToGogo: true,
            smsText: formatHomeworkDigestSms(learner.firstName, updatedTasks),
          };
        } else {
          const tasks = [newTask];
          nextAlerts.unshift({
            id: `alert-hw-${learnerId}-${nowMs}-${idx}`,
            learnerId,
            type: 'homework_digest',
            title: '15:30 Homework Digest (1 Task)',
            body: `Daily bundled homework for ${learner.fullName}.`,
            createdAtLabel: `Today · ${timeStr}`,
            timestamp: nowMs + idx,
            dayKey: TODAY_KEY,
            senderName:
              session?.role === 'teacher'
                ? `${session.displayName} · ${learner.grade}`
                : 'Class Teacher',
            homeworkItems: tasks,
            smsSentToGogo: true,
            smsText: formatHomeworkDigestSms(learner.firstName, tasks),
          });
        }
      });

      return {
        ...prev,
        alerts: nextAlerts,
      };
    });
  };

  const handleBroadcastEvent = (payload: {
    targetSchool: SchoolName | 'all';
    eventKind: 'Event' | 'Sports' | 'Trip';
    title: string;
    eventDateLabel: string;
    body: string;
  }) => {
    const nowMs = Date.now();
    const timeStr = formatCurrentTime();

    setAppState((prev) => {
      const targetLearners =
        payload.targetSchool === 'all'
          ? prev.learners
          : prev.learners.filter((l) => l.school === payload.targetSchool);

      const createdAlerts: FeedAlert[] = targetLearners.map((learner, idx) => ({
        id: `alert-ev-${learner.id}-${nowMs}-${idx}`,
        learnerId: learner.id,
        type: 'event',
        title: payload.title,
        body: payload.body,
        createdAtLabel: `Today · ${timeStr}`,
        timestamp: nowMs + idx,
        dayKey: TODAY_KEY,
        senderName:
          session?.role === 'teacher'
            ? `${session.displayName} · ${learner.school}`
            : learner.school,
        eventDateLabel: payload.eventDateLabel,
        eventKind: payload.eventKind,
        smsSentToGogo: true,
        smsText: `${payload.eventKind.toUpperCase()} (${learner.school}): ${payload.title} on ${payload.eventDateLabel}. ${payload.body.slice(0, 95)}`,
      }));

      return {
        ...prev,
        alerts: [...createdAlerts, ...prev.alerts],
      };
    });
  };

  const handleSendQuickNote = (payload: {
    learnerId: string;
    title: string;
    body: string;
    convertToSms: boolean;
  }) => {
    const nowMs = Date.now();
    const timeStr = formatCurrentTime();

    setAppState((prev) => {
      const learner = prev.learners.find((l) => l.id === payload.learnerId);
      if (!learner) return prev;

      const noteAlert: FeedAlert = {
        id: `alert-note-${learner.id}-${nowMs}`,
        learnerId: learner.id,
        type: 'note',
        title: payload.title,
        body: payload.body,
        createdAtLabel: `Today · ${timeStr}`,
        timestamp: nowMs,
        dayKey: TODAY_KEY,
        senderName:
          session?.role === 'teacher'
            ? `${session.displayName} · ${learner.grade}`
            : 'School Office',
        smsSentToGogo: payload.convertToSms,
        smsText: `NOTE (${learner.firstName}): ${payload.body.slice(0, 125)}`,
      };

      return {
        ...prev,
        alerts: [noteAlert, ...prev.alerts],
      };
    });
  };

  const handleAcknowledgeAlert = (alertId: string, responderName: string) => {
    const timeStr = formatCurrentTime();
    setAppState((prev) => ({
      ...prev,
      alerts: prev.alerts.map((a) =>
        a.id === alertId
          ? {
              ...a,
              acknowledgedAt: timeStr,
              acknowledgedBy: responderName,
              parentReply: {
                kind: 'ack',
                label: `Confirmed by ${responderName}`,
                repliedAt: timeStr,
                channel: 'App',
              },
            }
          : a
      ),
    }));
  };

  const handleToggleHomeworkTask = (alertId: string, taskId: string) => {
    setAppState((prev) => ({
      ...prev,
      alerts: prev.alerts.map((a) => {
        if (a.id !== alertId || !a.homeworkItems) return a;
        return {
          ...a,
          homeworkItems: a.homeworkItems.map((t) =>
            t.id === taskId ? { ...t, completed: !t.completed } : t
          ),
        };
      }),
    }));
  };

  const handleMarkAllHomeworkDone = (
    alertId: string,
    responderName: string
  ) => {
    const timeStr = formatCurrentTime();
    setAppState((prev) => ({
      ...prev,
      alerts: prev.alerts.map((a) => {
        if (a.id !== alertId || !a.homeworkItems) return a;
        return {
          ...a,
          homeworkItems: a.homeworkItems.map((t) => ({ ...t, completed: true })),
          acknowledgedAt: timeStr,
          acknowledgedBy: responderName,
          parentReply: {
            kind: 'ack',
            label: `All tasks marked done by ${responderName}`,
            repliedAt: timeStr,
            channel: 'App',
          },
        };
      }),
    }));
  };

  const handleSendAbsenceReply = (
    alertId: string,
    learnerId: string,
    kind: ParentReply['kind'],
    label: string,
    note?: string
  ) => {
    const timeStr = formatCurrentTime();
    setAppState((prev) => ({
      ...prev,
      learners: prev.learners.map((l) =>
        l.id === learnerId
          ? {
              ...l,
              registerNote: note ? `${label} — ${note}` : label,
              registerNoteTime: timeStr,
            }
          : l
      ),
      alerts: prev.alerts.map((a) =>
        a.id === alertId
          ? {
              ...a,
              acknowledgedAt: timeStr,
              acknowledgedBy: session?.displayName ?? 'Parent',
              parentReply: {
                kind,
                label,
                note,
                repliedAt: timeStr,
                channel: 'App',
              },
            }
          : a
      ),
    }));
  };

  const handleUssdReply = (
    alertId: string,
    learnerId: string,
    kind: Extract<ParentReply['kind'], 'ussd_yes' | 'ussd_no' | 'ussd_call'>,
    label: string
  ) => {
    const timeStr = formatCurrentTime();
    setAppState((prev) => ({
      ...prev,
      learners: prev.learners.map((l) =>
        l.id === learnerId
          ? {
              ...l,
              registerNote: `Gogo USSD: ${label}`,
              registerNoteTime: timeStr,
            }
          : l
      ),
      alerts: prev.alerts.map((a) =>
        a.id === alertId
          ? {
              ...a,
              acknowledgedAt: timeStr,
              acknowledgedBy: 'Gogo USSD',
              parentReply: {
                kind,
                label: `Gogo USSD: ${label}`,
                repliedAt: timeStr,
                channel: 'USSD *120*456#',
              },
            }
          : a
      ),
    }));
  };

  if (!session) {
    return (
      <LoginScreen
        onLogin={handleLogin}
        onResetData={handleResetData}
        resetFlash={resetFlash}
      />
    );
  }

  return (
    <div
      className={`min-h-screen flex flex-col ${
        appState.dataFreeMode && activePortal === 'parent'
          ? 'bg-white'
          : 'bg-[#f5f5f4]'
      }`}
    >
      {/* Top Bar (Compact <= 56px) */}
      <header className="sticky top-0 z-30 bg-white border-b border-stone-200 px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Zone 1: Single-line Brand */}
        <div className="flex items-center gap-2.5 min-w-0 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-[#064e3b] flex items-center justify-center shrink-0">
            <School className="w-4 h-4 text-[#f59e0b]" aria-hidden="true" />
          </div>
          <span className="text-base sm:text-lg font-bold tracking-tight text-stone-950 whitespace-nowrap">
            Kids Hub Connect
          </span>
        </div>

        {/* Zone 2: Desktop Portal Switcher */}
        <nav
          aria-label="Portal switcher"
          className="hidden md:flex items-center gap-6 text-sm font-semibold"
        >
          <button
            type="button"
            onClick={() => setActivePortal('parent')}
            className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 ${
              activePortal === 'parent'
                ? 'border-[#064e3b] text-[#064e3b]'
                : 'border-transparent text-stone-600 hover:text-stone-950'
            }`}
          >
            👩🏾 Parent Feed
          </button>
          <button
            type="button"
            onClick={() => setActivePortal('teacher')}
            className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 ${
              activePortal === 'teacher'
                ? 'border-[#064e3b] text-[#064e3b]'
                : 'border-transparent text-stone-600 hover:text-stone-950'
            }`}
          >
            🍎 Teacher &amp; Office
          </button>
          <button
            type="button"
            onClick={() => setActivePortal('ussd')}
            className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 ${
              activePortal === 'ussd'
                ? 'border-[#064e3b] text-[#064e3b]'
                : 'border-transparent text-stone-600 hover:text-stone-950'
            }`}
          >
            📟 Gogo USSD (*120*456#)
          </button>
        </nav>

        {/* Zone 3: Reset & Sign Out */}
        <div className="flex items-center gap-2 shrink-0">
          {resetFlash && (
            <span className="hidden sm:inline text-xs font-semibold text-[#064e3b] whitespace-nowrap">
              Restored
            </span>
          )}
          <button
            type="button"
            onClick={handleResetData}
            aria-label="Reset seed learners and alerts"
            title="Restore seed learners and alerts in localStorage"
            className="min-h-[40px] px-2.5 sm:px-3 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-800 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Reset</span>
          </button>
          <button
            type="button"
            onClick={handleSignOut}
            className="min-h-[40px] px-2.5 sm:px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
          >
            <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 pt-5 pb-24 md:pb-10">
        {activePortal === 'parent' && (
          <ParentFeed
            learners={appState.learners}
            selectedLearnerId={selectedLearnerId}
            onSelectLearner={setSelectedLearnerId}
            alerts={appState.alerts}
            dataFreeMode={appState.dataFreeMode}
            onToggleDataFree={handleToggleDataFree}
            onAcknowledgeAlert={handleAcknowledgeAlert}
            onToggleHomeworkTask={handleToggleHomeworkTask}
            onMarkAllHomeworkDone={handleMarkAllHomeworkDone}
            onSendAbsenceReply={handleSendAbsenceReply}
            currentViewerName={session.displayName}
            isParentRole={session.role === 'parent'}
          />
        )}

        {activePortal === 'teacher' && (
          <TeacherPortal
            teacherName={session.displayName}
            teacherSchool={session.school}
            learners={appState.learners}
            alerts={appState.alerts}
            onMarkAttendance={handleMarkAttendance}
            onMarkAllPresent={handleMarkAllPresent}
            onAddHomeworkTask={handleAddHomeworkTask}
            onBroadcastEvent={handleBroadcastEvent}
            onSendQuickNote={handleSendQuickNote}
          />
        )}

        {activePortal === 'ussd' && (
          <GogoUssdSimulator
            learners={appState.learners}
            selectedLearnerId={selectedLearnerId}
            onSelectLearner={setSelectedLearnerId}
            alerts={appState.alerts}
            onUssdReply={handleUssdReply}
          />
        )}
      </main>

      {/* Mobile Bottom Portal Switcher (<= 56px height to keep total sticky < 15%) */}
      <nav
        aria-label="Mobile portal switcher"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-stone-200 h-14 grid grid-cols-3"
      >
        <button
          type="button"
          onClick={() => setActivePortal('parent')}
          className={`flex flex-col items-center justify-center text-[11px] font-bold transition-colors ${
            activePortal === 'parent'
              ? 'text-[#064e3b] bg-emerald-950/[0.04]'
              : 'text-stone-600'
          }`}
        >
          <span className="text-sm leading-none" aria-hidden="true">
            👩🏾
          </span>
          <span className="mt-0.5 whitespace-nowrap">Parent Feed</span>
        </button>

        <button
          type="button"
          onClick={() => setActivePortal('teacher')}
          className={`flex flex-col items-center justify-center text-[11px] font-bold transition-colors ${
            activePortal === 'teacher'
              ? 'text-[#064e3b] bg-emerald-950/[0.04]'
              : 'text-stone-600'
          }`}
        >
          <span className="text-sm leading-none" aria-hidden="true">
            🍎
          </span>
          <span className="mt-0.5 whitespace-nowrap">Teacher</span>
        </button>

        <button
          type="button"
          onClick={() => setActivePortal('ussd')}
          className={`flex flex-col items-center justify-center text-[11px] font-bold transition-colors ${
            activePortal === 'ussd'
              ? 'text-[#064e3b] bg-emerald-950/[0.04]'
              : 'text-stone-600'
          }`}
        >
          <span className="text-sm leading-none" aria-hidden="true">
            📟
          </span>
          <span className="mt-0.5 whitespace-nowrap">*120*456#</span>
        </button>
      </nav>
    </div>
  );
}
