export type PortalView = 'parent' | 'teacher' | 'ussd';

export type SchoolName = 'Hazyview Primary' | 'Mkhuhlu Primary';

export type AttendanceStatus = 'unmarked' | 'present' | 'late' | 'absent';

export type HomeworkCategory = 'written' | 'reading' | 'bring';

export const HOMEWORK_SUBJECTS = [
  'Mathematics',
  'English Home Language',
  'Siswati / isiZulu FAL',
  'Natural Sciences & Technology',
  'Social Sciences',
  'Life Skills',
] as const;

export type HomeworkSubject = (typeof HOMEWORK_SUBJECTS)[number];

export const HOMEWORK_CATEGORY_META: Record<
  HomeworkCategory,
  {
    emoji: string;
    label: string;
    shortTag: string;
  }
> = {
  written: {
    emoji: '📝',
    label: '📝 Written Task',
    shortTag: 'Written',
  },
  reading: {
    emoji: '📖',
    label: '📖 Reading Aloud',
    shortTag: 'Reading',
  },
  bring: {
    emoji: '🎒',
    label: '🎒 Bring to School',
    shortTag: 'Bring',
  },
};

export const SAFETY_NOTICE_TEXT =
  'Messages and acknowledgments are monitored by school administration for safety.';

export interface ParentAccount {
  id: string;
  name: string;
  phone: string;
  demoOtp: string;
  learnerIds: string[];
  relationLabel: string;
}

export interface StaffAccount {
  id: string;
  name: string;
  email: string;
  pin: string;
  roleTitle: string;
  school: SchoolName;
}

export interface Learner {
  id: string;
  fullName: string;
  firstName: string;
  grade: string;
  school: SchoolName;
  parentName: string;
  parentPhone: string;
  gogoName?: string;
  gogoPhone?: string;
  attendance: AttendanceStatus;
  attendanceUpdatedAt?: string;
  registerNote?: string;
  registerNoteTime?: string;
}

export interface HomeworkTask {
  id: string;
  category: HomeworkCategory;
  subject: HomeworkSubject;
  description: string;
  completed: boolean;
  bagCheckTag?: '06:30 Bag Check';
}

export type AlertType =
  | 'arrival'
  | 'homework_digest'
  | 'event'
  | 'absence'
  | 'note';

export interface ParentReply {
  kind:
    | 'ack'
    | 'clinic'
    | 'transport'
    | 'sick'
    | 'ussd_yes'
    | 'ussd_no'
    | 'ussd_call'
    | 'custom';
  label: string;
  note?: string;
  repliedAt: string;
  channel: 'App' | 'USSD *120*456#';
}

export interface FeedAlert {
  id: string;
  learnerId: string;
  type: AlertType;
  title: string;
  body: string;
  createdAtLabel: string;
  timestamp: number;
  dayKey: string;
  senderName: string;
  attendanceStatus?: 'present' | 'late' | 'absent';
  eventDateLabel?: string;
  eventKind?: 'Event' | 'Sports' | 'Trip';
  homeworkItems?: HomeworkTask[];
  smsSentToGogo: boolean;
  smsText: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  parentReply?: ParentReply;
}

export interface AuthSession {
  role: 'parent' | 'teacher';
  userId: string;
  displayName: string;
  subtitle: string;
  linkedLearnerIds: string[];
  school?: SchoolName;
}

export interface KidsHubState {
  learners: Learner[];
  alerts: FeedAlert[];
  dataFreeMode: boolean;
}
