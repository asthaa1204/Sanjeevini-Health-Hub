import type { LucideIcon } from "lucide-react";
import {
  Stethoscope,
  Thermometer,
  Wind,
  Activity,
  HeartPulse,
  CircleDot,
  Pill,
  Bone,
  Sparkles,
  Flower2,
  Salad,
  Scale,
} from "lucide-react";

export const PHONE = "6364547974";
export const WHATSAPP_NUMBER = "916364547974";
export const WHATSAPP = `https://wa.me/${WHATSAPP_NUMBER}`;

export type Review = {
  name: string;
  initials: string;
  rating: number;
  timeAgo: string;
  text: string;
};

// Curated from real Google reviews of Sanjeevini Clinic.
export const reviews: Review[] = [
  {
    name: "Pavithra R",
    initials: "PR",
    rating: 5,
    timeAgo: "2 months ago",
    text: "Highly recommended for quality healthcare and a warm experience! Dr. Prajna takes time to listen and explain everything clearly. 🌟",
  },
  {
    name: "Manjunath K",
    initials: "MK",
    rating: 5,
    timeAgo: "3 months ago",
    text: "Very nice doctor with a soft-spoken nature. Felt comfortable from the very first visit — and the medicines worked perfectly.",
  },
  {
    name: "Sahana D",
    initials: "SD",
    rating: 5,
    timeAgo: "5 months ago",
    text: "Very good clinic with professional staff and a knowledgeable doctor. Clean, calm and never crowded. Our go-to family clinic now.",
  },
  {
    name: "Rakesh N",
    initials: "RN",
    rating: 5,
    timeAgo: "6 months ago",
    text: "Doctor diagnosed my mother's thyroid issue accurately and put her on the right treatment. Genuine, affordable and trustworthy.",
  },
  {
    name: "Anitha S",
    initials: "AS",
    rating: 5,
    timeAgo: "8 months ago",
    text: "Got relief from my long-running gastric problem within a week. Doctor is patient and doesn't prescribe unnecessary tests.",
  },
  {
    name: "Vinay M",
    initials: "VM",
    rating: 5,
    timeAgo: "10 months ago",
    text: "Best clinic in Chikkasandra for general consultation. Booked over WhatsApp — quick reply and no waiting on arrival.",
  },
];

export type Service = {
  icon: LucideIcon;
  name: string;
  slug: string;
};

export const services: Service[] = [
  { icon: Stethoscope, name: "General Health Checkup", slug: "general" },
  { icon: Thermometer, name: "Fever & Infections", slug: "fever" },
  { icon: Wind, name: "Cough, Cold & Flu", slug: "cold" },
  { icon: Activity, name: "Diabetes Management", slug: "diabetes" },
  { icon: HeartPulse, name: "Hypertension (BP) Care", slug: "bp" },
  { icon: CircleDot, name: "Thyroid Disorders", slug: "thyroid" },
  { icon: Pill, name: "Gastric & Acidity Issues", slug: "gastric" },
  { icon: Bone, name: "Joint Pain & Arthritis", slug: "joints" },
  { icon: Sparkles, name: "Skin Allergies & Infections", slug: "skin" },
  { icon: Flower2, name: "Women's Health & Wellness", slug: "women" },
  { icon: Scale, name: "Lifestyle Disorders", slug: "lifestyle" },
  { icon: Salad, name: "Nutrition & Diet Counseling", slug: "nutrition" },
];

export type Faq = { q: string; a: string };

export const faqs: Faq[] = [
  {
    q: "Do I need an appointment, or can I just walk in?",
    a: "Walk-ins are always welcome during our open hours. If you'd like to skip the wait, you can also book a time slot with us on WhatsApp or by phone.",
  },
  {
    q: "General Health Checkup — what does a first visit cover?",
    a: "A typical first consultation covers your concerns, medical history, vitals (BP, weight, pulse), a basic examination, and clear next steps. No tests are recommended unless truly needed.",
  },
  {
    q: "Fever & Infections — when should I come in?",
    a: "Come in if fever lasts more than 2 days, is above 102°F, or comes with rash, severe headache, breathlessness or vomiting. Early treatment helps you recover faster.",
  },
  {
    q: "Cough, Cold & Flu — do I always need antibiotics?",
    a: "Most colds and flu are viral and clear on their own with rest and supportive care. We only prescribe antibiotics when there's a clear bacterial reason — your safety comes first.",
  },
  {
    q: "Diabetes — can the clinic help me manage long-term?",
    a: "Yes. We help with diagnosis, medication, diet, and regular follow-up. Bring your previous reports and sugar readings on the first visit so we can plan together.",
  },
  {
    q: "Blood Pressure — how often should I get it checked?",
    a: "If you're 30+ or have a family history, get it checked at least once a year. If you're already on BP medication, a monthly check helps keep it well controlled.",
  },
  {
    q: "Thyroid — I feel tired and gaining weight. Should I get tested?",
    a: "Possibly. Symptoms like tiredness, weight change, hair fall or mood changes can point to thyroid issues. A simple blood test (TSH) gives clarity — we'll guide you from there.",
  },
  {
    q: "Gastric & Acidity — what if it keeps coming back?",
    a: "Recurrent acidity often improves with small diet and lifestyle changes alongside short-term medication. We'll look at your eating patterns and tailor a plan that fits your day.",
  },
  {
    q: "Joint Pain — do I need scans right away?",
    a: "Not usually. Most joint pains are managed with examination, simple medication and posture/exercise advice. Scans are suggested only if symptoms don't settle.",
  },
  {
    q: "Skin Allergies — is it safe to use over-the-counter creams?",
    a: "Avoid steroid creams without advice — they can worsen things. A short visit helps identify the trigger and get you the right treatment quickly.",
  },
  {
    q: "Women's Health — is the consultation private and comfortable?",
    a: "Absolutely. Consultations are unhurried, confidential and judgment-free. You're welcome to bring a family member along if you'd prefer.",
  },
  {
    q: "Nutrition & Diet — can I get a plan for my condition?",
    a: "Yes. We give practical, India-friendly diet guidance tailored to diabetes, BP, weight, thyroid and general wellness — no fad diets, just sustainable changes.",
  },
  {
    q: "Do you accept card or UPI payments?",
    a: "Yes, we accept cash, UPI and major cards. A printed receipt is provided after every consultation.",
  },
];

// ---------- Clinic hours (Asia/Kolkata) ----------
// dayIndex follows JS Date.getDay(): 0 = Sunday, 1 = Monday, ... 6 = Saturday.
export type HourWindow = { open: string; close: string }; // "HH:MM" 24h
export type DayHours = {
  dayIndex: number;
  label: string;
  shortLabel: string;
  windows: HourWindow[];
  display: string;
};

const WEEKDAY_WINDOWS: HourWindow[] = [
  { open: "09:30", close: "12:30" },
  { open: "16:30", close: "21:00" },
];
const SUNDAY_WINDOWS: HourWindow[] = [{ open: "10:00", close: "12:00" }];

const WEEKDAY_DISPLAY = "9:30 AM – 12:30 PM · 4:30 PM – 9:00 PM";
const SUNDAY_DISPLAY = "10:00 AM – 12:00 PM";

export const weekHours: DayHours[] = [
  { dayIndex: 0, label: "Sunday", shortLabel: "Sun", windows: SUNDAY_WINDOWS, display: SUNDAY_DISPLAY },
  { dayIndex: 1, label: "Monday", shortLabel: "Mon", windows: WEEKDAY_WINDOWS, display: WEEKDAY_DISPLAY },
  { dayIndex: 2, label: "Tuesday", shortLabel: "Tue", windows: WEEKDAY_WINDOWS, display: WEEKDAY_DISPLAY },
  { dayIndex: 3, label: "Wednesday", shortLabel: "Wed", windows: WEEKDAY_WINDOWS, display: WEEKDAY_DISPLAY },
  { dayIndex: 4, label: "Thursday", shortLabel: "Thu", windows: WEEKDAY_WINDOWS, display: WEEKDAY_DISPLAY },
  { dayIndex: 5, label: "Friday", shortLabel: "Fri", windows: WEEKDAY_WINDOWS, display: WEEKDAY_DISPLAY },
  { dayIndex: 6, label: "Saturday", shortLabel: "Sat", windows: WEEKDAY_WINDOWS, display: WEEKDAY_DISPLAY },
];

function nowInKolkata(): { day: number; minutes: number } {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const weekday = parts.find((p) => p.type === "weekday")?.value ?? "Mon";
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? "0");
  const map: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return { day: map[weekday] ?? 1, minutes: hour * 60 + minute };
}

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function fmt12(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hr = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${hr} ${period}` : `${hr}:${m.toString().padStart(2, "0")} ${period}`;
}

export type OpenStatus = {
  today: DayHours;
  isOpen: boolean;
  // Human-readable status line e.g. "Open now · Closes 12:30 PM" / "Closed · Opens 4:30 PM" / "Closed · Opens Mon 9:30 AM"
  statusLine: string;
};

export function getOpenStatus(): OpenStatus {
  const { day, minutes } = nowInKolkata();
  const today = weekHours[day];

  // Currently open?
  for (const w of today.windows) {
    if (minutes >= toMinutes(w.open) && minutes < toMinutes(w.close)) {
      return { today, isOpen: true, statusLine: `Open now · Closes ${fmt12(w.close)}` };
    }
  }
  // Next opening today?
  const nextToday = today.windows.find((w) => minutes < toMinutes(w.open));
  if (nextToday) {
    return { today, isOpen: false, statusLine: `Closed · Opens ${fmt12(nextToday.open)}` };
  }
  // Otherwise next open day
  for (let i = 1; i <= 7; i++) {
    const d = weekHours[(day + i) % 7];
    if (d.windows.length > 0) {
      return {
        today,
        isOpen: false,
        statusLine: `Closed · Opens ${d.shortLabel} ${fmt12(d.windows[0].open)}`,
      };
    }
  }
  return { today, isOpen: false, statusLine: "Closed" };
}