import {
  FeedAlert,
  HOMEWORK_CATEGORY_META,
  HomeworkTask,
  KidsHubState,
  Learner,
  ParentAccount,
  StaffAccount,
} from '../types';

export const TODAY_KEY = '2026-11-25';

export const SEED_PARENTS: ParentAccount[] = [
  {
    id: 'parent-sarah',
    name: 'Mama Sarah Nkosi',
    phone: '+27 82 410 8821',
    demoOtp: '4821',
    learnerIds: ['lerato-nkosi'],
    relationLabel: 'Mother of Lerato Nkosi (Grade 4B)',
  },
  {
    id: 'parent-sipho',
    name: 'Mr. Sipho Mabuza',
    phone: '+27 83 619 2204',
    demoOtp: '7390',
    learnerIds: ['thabo-mabuza'],
    relationLabel: 'Father of Thabo Mabuza (Grade 4B)',
  },
  {
    id: 'parent-nomsa',
    name: 'Gogo Nomsa Dube',
    phone: '+27 72 504 1198',
    demoOtp: '1955',
    learnerIds: ['amahle-dube'],
    relationLabel: 'Grandmother of Amahle Dube (Grade 5A)',
  },
];

export const SEED_STAFF: StaffAccount[] = [
  {
    id: 'staff-dlamini',
    name: 'Mrs. Dlamini',
    email: 'dlamini@hazyviewprimary.edu.za',
    pin: '3030',
    roleTitle: 'Grade 4B Class Teacher',
    school: 'Hazyview Primary',
  },
  {
    id: 'staff-nkosi',
    name: 'Mr. Nkosi',
    email: 'principal@hazyviewprimary.edu.za',
    pin: '9001',
    roleTitle: 'School Principal',
    school: 'Hazyview Primary',
  },
  {
    id: 'staff-khoza',
    name: 'Mr. Khoza',
    email: 'khoza@mkhuhluprimary.edu.za',
    pin: '2026',
    roleTitle: 'Grade 5A Class Teacher',
    school: 'Mkhuhlu Primary',
  },
];

export const SEED_LEARNERS: Learner[] = [
  {
    id: 'lerato-nkosi',
    fullName: 'Lerato Nkosi',
    firstName: 'Lerato',
    grade: 'Grade 4B',
    school: 'Hazyview Primary',
    parentName: 'Mama Sarah Nkosi',
    parentPhone: '+27 82 410 8821',
    gogoName: 'Gogo Khosi Nkosi',
    gogoPhone: '+27 71 334 9012',
    attendance: 'present',
    attendanceUpdatedAt: '07:34',
  },
  {
    id: 'thabo-mabuza',
    fullName: 'Thabo Mabuza',
    firstName: 'Thabo',
    grade: 'Grade 4B',
    school: 'Hazyview Primary',
    parentName: 'Mr. Sipho Mabuza',
    parentPhone: '+27 83 619 2204',
    gogoName: 'Gogo Thembi Mabuza',
    gogoPhone: '+27 76 218 4401',
    attendance: 'absent',
    attendanceUpdatedAt: '07:45',
  },
  {
    id: 'siphesihle-mnisi',
    fullName: 'Siphesihle Mnisi',
    firstName: 'Siphesihle',
    grade: 'Grade 4B',
    school: 'Hazyview Primary',
    parentName: 'Mrs. Grace Mnisi',
    parentPhone: '+27 82 773 1902',
    attendance: 'unmarked',
  },
  {
    id: 'bongani-silinda',
    fullName: 'Bongani Silinda',
    firstName: 'Bongani',
    grade: 'Grade 4B',
    school: 'Hazyview Primary',
    parentName: 'Mr. Elias Silinda',
    parentPhone: '+27 79 441 6608',
    attendance: 'unmarked',
  },
  {
    id: 'zanele-mathebula',
    fullName: 'Zanele Mathebula',
    firstName: 'Zanele',
    grade: 'Grade 4B',
    school: 'Hazyview Primary',
    parentName: 'Ms. Precious Mathebula',
    parentPhone: '+27 84 902 3315',
    attendance: 'late',
    attendanceUpdatedAt: '07:52',
  },
  {
    id: 'amahle-dube',
    fullName: 'Amahle Dube',
    firstName: 'Amahle',
    grade: 'Grade 5A',
    school: 'Mkhuhlu Primary',
    parentName: 'Gogo Nomsa Dube',
    parentPhone: '+27 72 504 1198',
    gogoName: 'Gogo Nomsa Dube',
    gogoPhone: '+27 72 504 1198',
    attendance: 'unmarked',
  },
];

export function formatHomeworkDigestSms(
  learnerFirstName: string,
  tasks: HomeworkTask[]
): string {
  const parts = tasks.map((t, idx) => {
    const meta = HOMEWORK_CATEGORY_META[t.category];
    const bagPrefix = t.category === 'bring' ? '[06:30 BAG CHECK] ' : '';
    return `${idx + 1}. ${bagPrefix}${meta.shortTag} (${t.subject}): ${t.description}`;
  });
  return `15:30 HOMEWORK - ${learnerFirstName}: ${parts.join(' | ')}`;
}

const leratoTasks: HomeworkTask[] = [
  {
    id: 'hw-lerato-1',
    category: 'written',
    subject: 'Mathematics',
    description: 'Complete fractions worksheet p. 42 (Questions 1 to 6) in blue exercise book.',
    completed: false,
  },
  {
    id: 'hw-lerato-2',
    category: 'reading',
    subject: 'English Home Language',
    description: 'Read "The Kruger River Crossing" pages 14–16 aloud with a family member.',
    completed: true,
  },
  {
    id: 'hw-lerato-3',
    category: 'bring',
    subject: 'Natural Sciences & Technology',
    description: 'Bring one clean 2L plastic bottle and 5 dry leaves for plant water test.',
    completed: false,
    bagCheckTag: '06:30 Bag Check',
  },
];

const thaboTasks: HomeworkTask[] = [
  {
    id: 'hw-thabo-1',
    category: 'written',
    subject: 'Siswati / isiZulu FAL',
    description: 'Copy 8 weather vocabulary words into vocabulary book and draw each symbol.',
    completed: false,
  },
  {
    id: 'hw-thabo-2',
    category: 'bring',
    subject: 'Life Skills',
    description: 'Bring clean sports takkies and water bottle for Friday athletics practice.',
    completed: false,
    bagCheckTag: '06:30 Bag Check',
  },
];

const amahleTasks: HomeworkTask[] = [
  {
    id: 'hw-amahle-1',
    category: 'reading',
    subject: 'Social Sciences',
    description: 'Read Mpumalanga rivers & lowveld map summary on page 28.',
    completed: false,
  },
];

const baseNow = new Date('2026-11-25T15:35:00+02:00').getTime();

export const SEED_ALERTS: FeedAlert[] = [
  {
    id: 'alert-lerato-hw',
    learnerId: 'lerato-nkosi',
    type: 'homework_digest',
    title: '15:30 Homework Digest (3 Tasks)',
    body: 'Daily bundled homework for Lerato Nkosi across 3 subjects.',
    createdAtLabel: 'Today · 15:30',
    timestamp: baseNow - 5 * 60 * 1000,
    dayKey: TODAY_KEY,
    senderName: 'Mrs. Dlamini · Grade 4B',
    homeworkItems: leratoTasks,
    smsSentToGogo: true,
    smsText: formatHomeworkDigestSms('Lerato', leratoTasks),
  },
  {
    id: 'alert-lerato-note',
    learnerId: 'lerato-nkosi',
    type: 'note',
    title: 'Teacher Note: Great Reading Progress',
    body: 'Lerato helped lead today’s morning Siswati reading circle with confidence. Please encourage 10 minutes of reading aloud tonight.',
    createdAtLabel: 'Today · 12:15',
    timestamp: baseNow - 200 * 60 * 1000,
    dayKey: TODAY_KEY,
    senderName: 'Mrs. Dlamini · Grade 4B',
    smsSentToGogo: true,
    smsText:
      'NOTE (Lerato): Mrs Dlamini says Lerato did great in reading circle today. Please read 10 min tonight.',
  },
  {
    id: 'alert-lerato-event',
    learnerId: 'lerato-nkosi',
    type: 'event',
    title: 'Inter-School Netball & Soccer Derby',
    body: 'Hazyview Primary hosts Mkhuhlu Primary on the main fields. Parents and gogos are warmly invited. Gates open at 08:00.',
    createdAtLabel: 'Today · 09:10',
    timestamp: baseNow - 385 * 60 * 1000,
    dayKey: TODAY_KEY,
    senderName: 'Mr. Nkosi · Principal',
    eventDateLabel: 'Fri, 27 Nov 2026 · 08:30',
    eventKind: 'Sports',
    smsSentToGogo: true,
    smsText:
      'SPORTS (Hazyview Primary): Netball & Soccer Derby vs Mkhuhlu Primary on Fri 27 Nov at 08:30. All families welcome.',
  },
  {
    id: 'alert-lerato-arrival',
    learnerId: 'lerato-nkosi',
    type: 'arrival',
    title: 'Morning Arrival Confirmed',
    body: 'Lerato Nkosi arrived safely and was marked Present in Grade 4B Morning Roll Call.',
    createdAtLabel: 'Today · 07:34',
    timestamp: baseNow - 481 * 60 * 1000,
    dayKey: TODAY_KEY,
    senderName: 'Mrs. Dlamini · Grade 4B',
    attendanceStatus: 'present',
    smsSentToGogo: true,
    smsText: 'ARRIVAL: Lerato Nkosi marked PRESENT at Hazyview Primary (07:34).',
    acknowledgedAt: '07:41',
    acknowledgedBy: 'Mama Sarah Nkosi',
    parentReply: {
      kind: 'ack',
      label: 'Acknowledged by Mama Sarah Nkosi',
      repliedAt: '07:41',
      channel: 'App',
    },
  },
  {
    id: 'alert-thabo-absence',
    learnerId: 'thabo-mabuza',
    type: 'absence',
    title: 'Absence Check-In: Thabo Mabuza',
    body: 'Thabo was not in Grade 4B during the 07:45 Morning Roll Call. Please confirm with 1 tap if he is at the clinic, delayed by transport, or resting at home.',
    createdAtLabel: 'Today · 07:45',
    timestamp: baseNow - 470 * 60 * 1000,
    dayKey: TODAY_KEY,
    senderName: 'Mrs. Dlamini · Grade 4B',
    attendanceStatus: 'absent',
    smsSentToGogo: true,
    smsText:
      'ABSENCE CHECK: Thabo Mabuza not in class at 07:45. Reply 1=Yes (safe/clinic), 2=No (expected at school), 3=Please call me.',
  },
  {
    id: 'alert-thabo-hw',
    learnerId: 'thabo-mabuza',
    type: 'homework_digest',
    title: '15:30 Homework Digest (2 Tasks)',
    body: 'Daily bundled homework for Thabo Mabuza.',
    createdAtLabel: 'Today · 15:30',
    timestamp: baseNow - 5 * 60 * 1000,
    dayKey: TODAY_KEY,
    senderName: 'Mrs. Dlamini · Grade 4B',
    homeworkItems: thaboTasks,
    smsSentToGogo: true,
    smsText: formatHomeworkDigestSms('Thabo', thaboTasks),
  },
  {
    id: 'alert-thabo-event',
    learnerId: 'thabo-mabuza',
    type: 'event',
    title: 'Inter-School Netball & Soccer Derby',
    body: 'Hazyview Primary hosts Mkhuhlu Primary on the main fields. Parents and gogos are warmly invited. Gates open at 08:00.',
    createdAtLabel: 'Today · 09:10',
    timestamp: baseNow - 385 * 60 * 1000,
    dayKey: TODAY_KEY,
    senderName: 'Mr. Nkosi · Principal',
    eventDateLabel: 'Fri, 27 Nov 2026 · 08:30',
    eventKind: 'Sports',
    smsSentToGogo: true,
    smsText:
      'SPORTS (Hazyview Primary): Netball & Soccer Derby vs Mkhuhlu Primary on Fri 27 Nov at 08:30. All families welcome.',
  },
  {
    id: 'alert-amahle-hw',
    learnerId: 'amahle-dube',
    type: 'homework_digest',
    title: '15:30 Homework Digest (1 Task)',
    body: 'Daily bundled homework for Amahle Dube.',
    createdAtLabel: 'Today · 15:30',
    timestamp: baseNow - 5 * 60 * 1000,
    dayKey: TODAY_KEY,
    senderName: 'Mr. Khoza · Grade 5A',
    homeworkItems: amahleTasks,
    smsSentToGogo: true,
    smsText: formatHomeworkDigestSms('Amahle', amahleTasks),
  },
  {
    id: 'alert-amahle-event',
    learnerId: 'amahle-dube',
    type: 'event',
    title: 'Shabalala Community Literacy Morning',
    body: 'Mkhuhlu Primary welcomes parents and gogos for Grade 5 reading showcase and uniform swap.',
    createdAtLabel: 'Today · 10:00',
    timestamp: baseNow - 335 * 60 * 1000,
    dayKey: TODAY_KEY,
    senderName: 'Mr. Khoza · Grade 5A',
    eventDateLabel: 'Sat, 28 Nov 2026 · 09:00',
    eventKind: 'Event',
    smsSentToGogo: true,
    smsText:
      'EVENT (Mkhuhlu Primary): Shabalala Literacy Morning on Sat 28 Nov at 09:00.',
  },
];

export function createSeedState(): KidsHubState {
  return {
    learners: structuredClone(SEED_LEARNERS),
    alerts: structuredClone(SEED_ALERTS),
    dataFreeMode: false,
  };
}

export function normalizeSouthAfricanPhone(input: string): string {
  const digits = input.replace(/[^\d+]/g, '');
  if (!digits) return '';
  let bare = digits;
  if (bare.startsWith('+27')) {
    bare = bare.slice(3);
  } else if (bare.startsWith('27') && bare.length >= 11) {
    bare = bare.slice(2);
  } else if (bare.startsWith('0')) {
    bare = bare.slice(1);
  }
  if (bare.length === 9) {
    return `+27 ${bare.slice(0, 2)} ${bare.slice(2, 5)} ${bare.slice(5)}`;
  }
  return input.trim();
}
