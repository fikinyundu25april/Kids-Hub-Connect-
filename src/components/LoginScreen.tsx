import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  KeyRound,
  Lock,
  Mail,
  RotateCcw,
  School,
  Smartphone,
} from 'lucide-react';
import {
  normalizeSouthAfricanPhone,
  SEED_PARENTS,
  SEED_STAFF,
} from '../data/seedData';
import { AuthSession } from '../types';
import { SafetyNotice } from './SafetyNotice';

interface LoginScreenProps {
  onLogin: (session: AuthSession) => void;
  onResetData: () => void;
  resetFlash: boolean;
}

type LoginDoor = 'parent' | 'teacher';

export function LoginScreen({
  onLogin,
  onResetData,
  resetFlash,
}: LoginScreenProps) {
  const [door, setDoor] = useState<LoginDoor>('parent');

  // Parent door state
  const [phoneInput, setPhoneInput] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [otpRequestedFor, setOtpRequestedFor] = useState<string | null>(null);
  const [parentError, setParentError] = useState<string | null>(null);
  const [simSmsBanner, setSimSmsBanner] = useState<string | null>(null);

  // Teacher / Office door state
  const [emailInput, setEmailInput] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [teacherError, setTeacherError] = useState<string | null>(null);

  const matchedParent = SEED_PARENTS.find(
    (p) =>
      normalizeSouthAfricanPhone(p.phone) ===
      normalizeSouthAfricanPhone(phoneInput)
  );

  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setParentError(null);
    setSimSmsBanner(null);

    const normalized = normalizeSouthAfricanPhone(phoneInput);
    if (!normalized || normalized.replace(/\D/g, '').length < 9) {
      setParentError('Enter a valid South African mobile number (e.g. +27 82 410 8821).');
      return;
    }

    const found = SEED_PARENTS.find(
      (p) => normalizeSouthAfricanPhone(p.phone) === normalized
    );

    if (!found) {
      setOtpRequestedFor(null);
      setParentError(
        `The number ${normalized} is not registered. Please ask the School Clerk at Hazyview Primary or Mkhuhlu Primary to link your mobile number to your child's learner profile.`
      );
      return;
    }

    setPhoneInput(found.phone);
    setOtpRequestedFor(found.id);
    setSimSmsBanner(
      `SMS sent to ${found.phone}: Your Kids Hub Connect OTP is ${found.demoOtp}.`
    );
  };

  const handleVerifyParentOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setParentError(null);

    const normalized = normalizeSouthAfricanPhone(phoneInput);
    const found = SEED_PARENTS.find(
      (p) => normalizeSouthAfricanPhone(p.phone) === normalized
    );

    if (!found) {
      setParentError(
        `The number ${normalized || phoneInput} is not registered. Please ask the School Clerk at Hazyview Primary or Mkhuhlu Primary to link your mobile number.`
      );
      return;
    }

    const cleanOtp = otpInput.trim();
    if (!/^\d{4}$/.test(cleanOtp)) {
      setParentError('Enter the 4-digit SMS OTP code sent to your phone.');
      return;
    }

    if (cleanOtp !== found.demoOtp) {
      setParentError(
        `Incorrect OTP code. Check your SMS message (demo code for ${found.name} is ${found.demoOtp}).`
      );
      return;
    }

    onLogin({
      role: 'parent',
      userId: found.id,
      displayName: found.name,
      subtitle: found.relationLabel,
      linkedLearnerIds: found.learnerIds,
    });
  };

  const handleDemoFillParent = (parentId: string) => {
    const found = SEED_PARENTS.find((p) => p.id === parentId);
    if (!found) return;
    setDoor('parent');
    setParentError(null);
    setPhoneInput(found.phone);
    setOtpRequestedFor(found.id);
    setOtpInput(found.demoOtp);
    setSimSmsBanner(
      `Demo SMS filled for ${found.name} (${found.phone}) · OTP ${found.demoOtp}`
    );
  };

  const handleDemoTestUnregistered = () => {
    setDoor('parent');
    setOtpRequestedFor(null);
    setOtpInput('');
    setSimSmsBanner(null);
    setPhoneInput('+27 81 000 9999');
    setParentError(
      'The number +27 81 000 9999 is not registered. Please ask the School Clerk at Hazyview Primary or Mkhuhlu Primary to link your mobile number to your child\'s learner profile.'
    );
  };

  const handleTeacherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTeacherError(null);

    const cleanEmail = emailInput.trim().toLowerCase();
    const staff = SEED_STAFF.find((s) => s.email.toLowerCase() === cleanEmail);

    if (!staff) {
      setTeacherError(
        'School email not recognized. Use a verified @hazyviewprimary.edu.za or @mkhuhluprimary.edu.za address.'
      );
      return;
    }

    if (pinInput.trim() !== staff.pin) {
      setTeacherError('Incorrect staff PIN. Please verify your 4-digit office PIN.');
      return;
    }

    onLogin({
      role: 'teacher',
      userId: staff.id,
      displayName: staff.name,
      subtitle: `${staff.roleTitle} · ${staff.school}`,
      linkedLearnerIds: [],
      school: staff.school,
    });
  };

  const handleDemoFillTeacher = (staffId: string) => {
    const staff = SEED_STAFF.find((s) => s.id === staffId);
    if (!staff) return;
    setDoor('teacher');
    setTeacherError(null);
    setEmailInput(staff.email);
    setPinInput(staff.pin);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f4] flex flex-col">
      {/* Compact top bar */}
      <header className="bg-white border-b border-stone-200 px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[#064e3b] flex items-center justify-center shrink-0">
            <School className="w-4 h-4 text-[#f59e0b]" aria-hidden="true" />
          </div>
          <span className="text-base sm:text-lg font-bold tracking-tight text-stone-900 whitespace-nowrap truncate">
            Kids Hub Connect
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {resetFlash && (
            <span className="text-xs font-medium text-[#064e3b] whitespace-nowrap">
              Seed data restored
            </span>
          )}
          <button
            type="button"
            onClick={onResetData}
            className="min-h-[40px] px-3 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
            title="Restore seed learners and alerts in localStorage"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Reset</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 lg:py-14 flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Community Context Column */}
          <section className="lg:col-span-5 space-y-6">
            <div className="bg-[#064e3b] text-white rounded-3xl p-6 sm:p-8 shadow-sm">
              <p className="text-xs font-semibold tracking-wide text-[#f59e0b] mb-3">
                Hazyview &amp; Shabalala · Mpumalanga
              </p>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight [text-wrap:balance]">
                School alerts that reach every parent and gogo on time.
              </h1>
              <p className="mt-3 text-sm sm:text-base text-emerald-100 leading-relaxed">
                Morning arrival confirmation, bundled 15:30 homework digests, and zero-data USSD replies connecting Hazyview Primary and Mkhuhlu Primary families.
              </p>

              <div className="mt-6 pt-5 border-t border-white/15 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-emerald-200">Roll Call Window</p>
                  <p className="mt-0.5 font-mono font-semibold text-white tabular-nums">
                    07:30 – 08:00
                  </p>
                </div>
                <div>
                  <p className="text-emerald-200">Homework &amp; Bag Check</p>
                  <p className="mt-0.5 font-mono font-semibold text-[#f59e0b] tabular-nums">
                    15:30 / 06:30
                  </p>
                </div>
                <div>
                  <p className="text-emerald-200">Feature-Phone Line</p>
                  <p className="mt-0.5 font-mono font-semibold text-white tabular-nums">
                    *120*456#
                  </p>
                </div>
                <div>
                  <p className="text-emerald-200">Partner Schools</p>
                  <p className="mt-0.5 font-semibold text-white">
                    Hazyview &amp; Mkhuhlu
                  </p>
                </div>
              </div>
            </div>

            <SafetyNotice />
          </section>

          {/* Right Role-Gated Sign-In Card */}
          <section className="lg:col-span-7 bg-white rounded-3xl border border-stone-200 p-5 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-stone-200">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
                  Role-Gated Sign-In
                </h2>
                <p className="text-sm text-stone-600 mt-0.5">
                  Choose your school portal door below to continue.
                </p>
              </div>
            </div>

            {/* Two Sign-In Doors Selector */}
            <div
              role="tablist"
              aria-label="Sign-in portals"
              className="mt-5 grid grid-cols-2 gap-2 p-1.5 bg-stone-100 rounded-2xl"
            >
              <button
                type="button"
                role="tab"
                aria-selected={door === 'parent'}
                onClick={() => {
                  setDoor('parent');
                  setTeacherError(null);
                }}
                className={`min-h-[48px] px-3 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap flex items-center justify-center gap-2 ${
                  door === 'parent'
                    ? 'bg-[#064e3b] text-white shadow-sm'
                    : 'text-stone-700 hover:text-stone-900 hover:bg-white/60'
                }`}
              >
                <span aria-hidden="true">👩🏾</span>
                <span>Parent Login</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={door === 'teacher'}
                onClick={() => {
                  setDoor('teacher');
                  setParentError(null);
                }}
                className={`min-h-[48px] px-3 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap flex items-center justify-center gap-2 ${
                  door === 'teacher'
                    ? 'bg-[#064e3b] text-white shadow-sm'
                    : 'text-stone-700 hover:text-stone-900 hover:bg-white/60'
                }`}
              >
                <span aria-hidden="true">🍎</span>
                <span>Teacher / Office</span>
              </button>
            </div>

            {/* Door 1: Parent Login */}
            {door === 'parent' && (
              <div className="mt-6 space-y-5">
                <form
                  onSubmit={
                    otpRequestedFor ? handleVerifyParentOtp : handleRequestOtp
                  }
                  className="space-y-4"
                >
                  <div>
                    <label
                      htmlFor="parent-phone"
                      className="block text-sm font-semibold text-stone-800 mb-1.5"
                    >
                      Registered Parent Mobile Number
                    </label>
                    <div className="relative">
                      <Smartphone
                        className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2"
                        aria-hidden="true"
                      />
                      <input
                        id="parent-phone"
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        placeholder="+27 82 410 8821"
                        value={phoneInput}
                        onChange={(e) => {
                          setPhoneInput(e.target.value);
                          setParentError(null);
                          if (otpRequestedFor) {
                            setOtpRequestedFor(null);
                            setOtpInput('');
                            setSimSmsBanner(null);
                          }
                        }}
                        className="w-full min-h-[48px] pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-900 font-mono text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-[#064e3b] focus:border-[#064e3b]"
                      />
                    </div>
                    <p className="mt-1.5 text-xs text-stone-500">
                      Only numbers linked by the School Clerk can receive SMS OTP codes.
                    </p>
                  </div>

                  {simSmsBanner && (
                    <div className="rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2.5 text-xs sm:text-sm text-stone-900 flex items-start gap-2.5">
                      <CheckCircle2
                        className="w-4 h-4 text-[#064e3b] shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                      <span className="font-mono text-xs leading-relaxed">
                        {simSmsBanner}
                      </span>
                    </div>
                  )}

                  {otpRequestedFor && matchedParent && (
                    <div>
                      <label
                        htmlFor="parent-otp"
                        className="block text-sm font-semibold text-stone-800 mb-1.5"
                      >
                        4-Digit SMS OTP Code
                      </label>
                      <div className="relative">
                        <KeyRound
                          className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2"
                          aria-hidden="true"
                        />
                        <input
                          id="parent-otp"
                          type="text"
                          inputMode="numeric"
                          maxLength={4}
                          placeholder="e.g. 4821"
                          value={otpInput}
                          onChange={(e) => {
                            setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 4));
                            setParentError(null);
                          }}
                          className="w-full min-h-[48px] pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-900 font-mono text-base tracking-[0.3em] tabular-nums focus:outline-none focus:ring-2 focus:ring-[#064e3b] focus:border-[#064e3b]"
                        />
                      </div>
                      <p className="mt-1.5 text-xs text-stone-600">
                        Signing in as{' '}
                        <strong className="text-stone-900">{matchedParent.name}</strong>{' '}
                        · {matchedParent.relationLabel}
                      </p>
                    </div>
                  )}

                  {parentError && (
                    <div
                      role="alert"
                      className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs sm:text-sm text-red-900 flex items-start gap-2.5"
                    >
                      <AlertCircle
                        className="w-4 h-4 text-red-700 shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                      <p className="leading-relaxed font-medium">{parentError}</p>
                    </div>
                  )}

                  <div className="pt-1 flex flex-col sm:flex-row gap-2.5">
                    <button
                      type="submit"
                      className="flex-1 min-h-[48px] px-5 py-3 rounded-xl bg-[#064e3b] hover:bg-emerald-900 text-white text-sm font-bold inline-flex items-center justify-center gap-2 transition-colors active:scale-[0.99]"
                    >
                      <span>
                        {otpRequestedFor
                          ? 'Verify OTP & Open Parent Feed'
                          : 'Send 4-Digit SMS OTP'}
                      </span>
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                </form>

                {/* 1-Tap Demo Fill Helpers */}
                <div className="pt-4 border-t border-stone-200">
                  <p className="text-xs font-semibold text-stone-600 mb-2.5">
                    1-Tap Demo Fill (Fast Testing)
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleDemoFillParent('parent-sarah')}
                      className="min-h-[44px] px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-left transition-colors"
                    >
                      <div className="text-xs font-bold text-stone-900">
                        Mama Sarah Nkosi
                      </div>
                      <div className="text-[11px] text-stone-600 font-mono tabular-nums mt-0.5">
                        +27 82 410 8821 · OTP 4821 · Lerato Nkosi
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDemoFillParent('parent-sipho')}
                      className="min-h-[44px] px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-left transition-colors"
                    >
                      <div className="text-xs font-bold text-stone-900">
                        Mr. Sipho Mabuza
                      </div>
                      <div className="text-[11px] text-stone-600 font-mono tabular-nums mt-0.5">
                        +27 83 619 2204 · OTP 7390 · Thabo Mabuza
                      </div>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleDemoTestUnregistered}
                    className="mt-2 w-full min-h-[40px] px-3 py-2 rounded-xl border border-dashed border-stone-300 text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition-colors"
                  >
                    Test Unregistered Number (+27 81 000 9999) — Clerk Block Check
                  </button>
                </div>
              </div>
            )}

            {/* Door 2: Teacher / Office Login */}
            {door === 'teacher' && (
              <div className="mt-6 space-y-5">
                <form onSubmit={handleTeacherSubmit} className="space-y-4">
                  <div>
                    <label
                      htmlFor="staff-email"
                      className="block text-sm font-semibold text-stone-800 mb-1.5"
                    >
                      Verified School Email
                    </label>
                    <div className="relative">
                      <Mail
                        className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2"
                        aria-hidden="true"
                      />
                      <input
                        id="staff-email"
                        type="email"
                        autoComplete="email"
                        placeholder="dlamini@hazyviewprimary.edu.za"
                        value={emailInput}
                        onChange={(e) => {
                          setEmailInput(e.target.value);
                          setTeacherError(null);
                        }}
                        className="w-full min-h-[48px] pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#064e3b] focus:border-[#064e3b]"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="staff-pin"
                      className="block text-sm font-semibold text-stone-800 mb-1.5"
                    >
                      Staff Office PIN
                    </label>
                    <div className="relative">
                      <Lock
                        className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2"
                        aria-hidden="true"
                      />
                      <input
                        id="staff-pin"
                        type="password"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="4-digit PIN"
                        value={pinInput}
                        onChange={(e) => {
                          setPinInput(e.target.value.replace(/\D/g, '').slice(0, 6));
                          setTeacherError(null);
                        }}
                        className="w-full min-h-[48px] pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-900 font-mono text-base tracking-[0.25em] tabular-nums focus:outline-none focus:ring-2 focus:ring-[#064e3b] focus:border-[#064e3b]"
                      />
                    </div>
                  </div>

                  {teacherError && (
                    <div
                      role="alert"
                      className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs sm:text-sm text-red-900 flex items-start gap-2.5"
                    >
                      <AlertCircle
                        className="w-4 h-4 text-red-700 shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                      <p className="leading-relaxed font-medium">{teacherError}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full min-h-[48px] px-5 py-3 rounded-xl bg-[#064e3b] hover:bg-emerald-900 text-white text-sm font-bold inline-flex items-center justify-center gap-2 transition-colors active:scale-[0.99]"
                  >
                    <span>Sign In to Teacher &amp; Office</span>
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                </form>

                {/* 1-Tap Demo Fill Helpers */}
                <div className="pt-4 border-t border-stone-200">
                  <p className="text-xs font-semibold text-stone-600 mb-2.5">
                    1-Tap Demo Fill (Fast Testing)
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleDemoFillTeacher('staff-dlamini')}
                      className="min-h-[44px] px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-left transition-colors"
                    >
                      <div className="text-xs font-bold text-stone-900">
                        Mrs. Dlamini (Teacher)
                      </div>
                      <div className="text-[11px] text-stone-600 font-mono tabular-nums mt-0.5 truncate">
                        dlamini@hazyviewprimary.edu.za · PIN 3030
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDemoFillTeacher('staff-nkosi')}
                      className="min-h-[44px] px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-left transition-colors"
                    >
                      <div className="text-xs font-bold text-stone-900">
                        Mr. Nkosi (Principal)
                      </div>
                      <div className="text-[11px] text-stone-600 font-mono tabular-nums mt-0.5 truncate">
                        principal@hazyviewprimary.edu.za · PIN 9001
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
