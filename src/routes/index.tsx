import { createFileRoute } from "@tanstack/react-router";
import {
  Phone,
  MessageCircle,
  Star,
  MapPin,
  Clock,
  Stethoscope,
  HeartPulse,
  Menu,
  Plus,
  Calendar as CalendarIcon,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AppointmentDialog } from "@/components/AppointmentDialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import {
  PHONE,
  WHATSAPP,
  reviews,
  services,
  faqs,
  weekHours,
  getOpenStatus,
} from "@/lib/clinicData";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import exteriorPhoto from "@/assets/clinic-exterior.jpeg.asset.json";
import waitingPhoto from "@/assets/clinic-waiting.jpeg.asset.json";
import consultationPhoto from "@/assets/clinic-consultation.jpeg.asset.json";
import doctorPhoto from "@/assets/dr-prajna.jpg.asset.json";
import { useQuery } from "@tanstack/react-query";
import { getGoogleReviews } from "@/lib/google-reviews.functions";
import { trackEvent } from "@/lib/analytics";

const ADDRESS_FULL = {
  street: "No 12, 6th Cross, Sreenivasa Complex, Hanumanthe Gowda Main Road, Chikkasandra",
  locality: "Jalahalli West",
  region: "Karnataka",
  city: "Bengaluru",
  postal: "560057",
  country: "IN",
};

const WHATSAPP_ALT = "9743082426";
const ADDRESS =
  "No 12, 6th Cross, Sreenivasa Complex, Hanumanthe Gowda Main Road, Chikkasandra, Jalahalli West, Bengaluru, Karnataka 560057";
const MAPS_QUERY = encodeURIComponent(ADDRESS);

function toIsoDay(idx: number): string {
  return ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"][idx];
}

const openingHoursSpec = weekHours.flatMap((d) =>
  d.windows.map((w) => ({
    "@type": "OpeningHoursSpecification",
    dayOfWeek: `https://schema.org/${["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][d.dayIndex]}`,
    opens: w.open,
    closes: w.close,
  })),
);

const CLINIC_ID = "https://sanjeeviniclinic.in/#clinic";
const DOCTOR_ID = "https://sanjeeviniclinic.in/#physician";

const postalAddress = {
  "@type": "PostalAddress",
  streetAddress: ADDRESS_FULL.street,
  addressLocality: `${ADDRESS_FULL.locality}, ${ADDRESS_FULL.city}`,
  addressRegion: ADDRESS_FULL.region,
  postalCode: ADDRESS_FULL.postal,
  addressCountry: ADDRESS_FULL.country,
};

const contactPoints = [
  {
    "@type": "ContactPoint",
    telephone: `+91${PHONE}`,
    contactType: "Appointments",
    areaServed: "IN",
    availableLanguage: ["English", "Hindi", "Kannada"],
    contactOption: "TollFree",
  },
  {
    "@type": "ContactPoint",
    telephone: `+91${WHATSAPP_ALT}`,
    contactType: "Customer Support",
    areaServed: "IN",
    availableLanguage: ["English", "Kannada"],
  },
];

const medicalBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "MedicalClinic",
  "@id": CLINIC_ID,
  name: "Sanjeevini Clinic",
  description:
    "Trusted general physician clinic in Jalahalli West, Bengaluru run by Dr. Prajna U K. Family care for fever, diabetes, BP, thyroid and more.",
  image: doctorPhoto.url,
  telephone: `+91${PHONE}`,
  url: "/",
  priceRange: "₹₹",
  address: postalAddress,
  contactPoint: contactPoints,
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "5.0",
    reviewCount: "27",
  },
  openingHoursSpecification: openingHoursSpec,
  medicalSpecialty: "https://schema.org/InternalMedicine",
  employee: { "@id": DOCTOR_ID },
  availableService: services.map((s) => ({
    "@type": "MedicalProcedure",
    name: s.name,
  })),
  areaServed: [
    { "@type": "City", name: "Bengaluru" },
    { "@type": "Place", name: "Jalahalli West" },
    { "@type": "Place", name: "Chikkasandra" },
  ],
};

const physicianJsonLd = {
  "@context": "https://schema.org",
  "@type": "Physician",
  "@id": DOCTOR_ID,
  name: "Dr. Prajna U K",
  image: doctorPhoto.url,
  jobTitle: "General Physician",
  description:
    "Soft-spoken general physician providing compassionate, patient-first family care in Jalahalli West, Bengaluru.",
  medicalSpecialty: "https://schema.org/InternalMedicine",
  url: "/#doctor",
  telephone: `+91${PHONE}`,
  worksFor: { "@id": CLINIC_ID },
  address: postalAddress,
  availableService: services.map((s) => ({
    "@type": "MedicalProcedure",
    name: s.name,
  })),
  contactPoint: contactPoints,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

// Avoid SSR/client time-zone mismatch by computing status on the client only.
function useOpenStatus() {
  const [status, setStatus] = useState<ReturnType<typeof getOpenStatus> | null>(null);
  useEffect(() => {
    const tick = () => setStatus(getOpenStatus());
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);
  return status;
}

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sanjeevini Clinic — Trusted General Physician Clinic in Jalahalli West, Bengaluru" },
      {
        name: "description",
        content:
          "Sanjeevini Clinic in Chikkasandra, Jalahalli West, Bengaluru. Dr. Prajna U K, General Physician. Family care for fever, diabetes, BP, thyroid & more. 5.0★ on Google.",
      },
      { property: "og:title", content: "Sanjeevini Clinic — Trusted Family Doctor in Jalahalli West" },
      {
        property: "og:description",
        content: "Compassionate general physician care by Dr. Prajna U K. Open Mon–Sun.",
      },
      { property: "og:url", content: "/" },
      { property: "og:image", content: doctorPhoto.url },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: doctorPhoto.url },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(medicalBusinessJsonLd),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify(physicianJsonLd),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify(faqJsonLd),
      },
    ],
  }),
  component: Index,
});

const navLinks = [
  { href: "#home", label: "Home" },
  { href: "#about", label: "About" },
  { href: "#services", label: "Services" },
  { href: "#doctor", label: "Doctor" },
  { href: "#reviews", label: "Reviews" },
  { href: "#faq", label: "FAQ" },
  { href: "#contact", label: "Contact" },
];

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="relative grid h-10 w-10 place-items-center rounded-xl bg-gradient-primary text-white shadow-[var(--shadow-soft)]">
        <Plus className="h-5 w-5" strokeWidth={3} />
      </div>
      <div className="flex flex-col leading-tight">
        <span className="font-display text-base font-bold text-foreground">Sanjeevini Clinic</span>
        <span className="text-[10px] font-medium uppercase tracking-wider text-primary">
          Family Care
        </span>
      </div>
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <a href="#home" className="shrink-0">
          <Logo />
        </a>
        <nav className="hidden items-center gap-7 lg:flex">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <a href={`tel:${PHONE}`} onClick={() => trackEvent("click_call_now", { source: "header" })}>
            <Button className="hidden h-10 rounded-full bg-gradient-primary px-5 text-white shadow-[var(--shadow-soft)] hover:opacity-95 sm:inline-flex">
              <Phone className="h-4 w-4" /> Call Now
            </Button>
            <Button size="icon" className="h-10 w-10 rounded-full bg-primary text-primary-foreground sm:hidden">
              <Phone className="h-4 w-4" />
            </Button>
          </a>
          <Sheet>
            <SheetTrigger asChild>
              <button
                type="button"
                className="grid h-10 w-10 place-items-center rounded-full border border-border text-foreground lg:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85vw] max-w-sm p-0">
              <SheetHeader className="border-b border-border px-6 py-5 text-left">
                <SheetTitle>
                  <Logo />
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col px-3 py-3">
                {navLinks.map((l) => (
                  <SheetClose asChild key={l.href}>
                    <a
                      href={l.href}
                      className="rounded-xl px-4 py-4 text-base font-semibold text-foreground transition-colors hover:bg-accent/60 active:bg-accent"
                    >
                      {l.label}
                    </a>
                  </SheetClose>
                ))}
              </nav>
              <div className="mt-2 grid gap-2 border-t border-border px-6 py-5">
                <SheetClose asChild>
                  <a
                    href={`tel:${PHONE}`}
                    onClick={() => trackEvent("click_call_now", { source: "mobile_menu" })}
                  >
                    <Button className="h-12 w-full rounded-full bg-gradient-primary text-base text-white shadow-[var(--shadow-soft)] hover:opacity-95">
                      <Phone className="h-4 w-4" /> Call {PHONE}
                    </Button>
                  </a>
                </SheetClose>
                <SheetClose asChild>
                  <a
                    href={WHATSAPP}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => trackEvent("click_whatsapp", { source: "mobile_menu" })}
                  >
                    <Button className="h-12 w-full rounded-full bg-whatsapp text-base text-whatsapp-foreground hover:bg-whatsapp/90">
                      <MessageCircle className="h-4 w-4" /> WhatsApp
                    </Button>
                  </a>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  const status = useOpenStatus();
  return (
    <section
      id="home"
      className="relative overflow-hidden"
      style={{ background: "var(--gradient-hero)" }}
    >
      {/* decorative shapes */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-teal/15 blur-3xl" />
      <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.1fr_1fr] lg:py-28">
        <div className="flex flex-col items-start">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/70 px-3 py-1.5 text-xs font-semibold text-primary shadow-sm backdrop-blur">
            <Star className="h-3.5 w-3.5 fill-current" />
            5.0 on Google · 27 Reviews
          </div>
          <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Sanjeevini <span className="text-primary">Clinic</span>
          </h1>
          <p className="mt-3 font-display text-lg italic text-teal sm:text-xl">
            "Health and Happiness Comes Free"
          </p>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Your trusted neighborhood clinic in Chikkasandra, Jalahalli West — caring,
            unhurried consultations with Dr. Prajna U K, General Physician.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <AppointmentDialog
              trigger={
                <Button className="h-12 w-full rounded-full bg-gradient-primary px-6 text-base text-white shadow-[var(--shadow-soft)] hover:opacity-95 sm:w-auto">
                  <CalendarIcon className="h-4 w-4" /> Book an Appointment
                </Button>
              }
            />
            <a
              href={WHATSAPP}
              target="_blank"
              rel="noreferrer"
              onClick={() => trackEvent("click_whatsapp", { source: "hero" })}
            >
              <Button className="h-12 w-full rounded-full bg-whatsapp px-6 text-base text-whatsapp-foreground shadow-[var(--shadow-soft)] hover:bg-whatsapp/90 sm:w-auto">
                <MessageCircle className="h-4 w-4" /> Chat on WhatsApp
              </Button>
            </a>
          </div>
          <div className="mt-6 flex items-center gap-4 text-sm">
            <span
              className={`inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1.5 font-medium shadow-sm backdrop-blur ring-1 ${
                status?.isOpen ? "ring-green-200 text-green-700" : "ring-border text-muted-foreground"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${status?.isOpen ? "bg-green-500 animate-pulse" : "bg-muted-foreground/50"}`}
              />
              <Clock className="h-4 w-4" />
              {status ? status.statusLine : "Today's hours"}
            </span>
          </div>
        </div>

        {/* Illustrated card */}
        <div className="relative">
          <div className="relative mx-auto aspect-square w-full max-w-md rounded-[2rem] bg-white p-8 shadow-[var(--shadow-soft)] ring-1 ring-primary/10">
            <div className="grid h-full place-items-center">
              <div className="relative">
                <div className="absolute inset-0 -m-8 rounded-full bg-gradient-primary opacity-10 blur-2xl" />
                <div className="relative grid h-44 w-44 place-items-center rounded-full bg-gradient-primary text-white shadow-[var(--shadow-soft)]">
                  <Stethoscope className="h-20 w-20" strokeWidth={1.5} />
                </div>
              </div>
            </div>
            <div className="absolute left-2 top-6 hidden rounded-2xl bg-white px-4 py-3 shadow-[var(--shadow-card)] ring-1 ring-border sm:block sm:-left-4 sm:top-10">
              <div className="flex items-center gap-2">
                <div className="grid h-9 w-9 place-items-center rounded-full bg-accent text-primary">
                  <HeartPulse className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">Trusted by</p>
                  <p className="text-sm font-semibold">Local families</p>
                </div>
              </div>
            </div>
            <div className="absolute right-2 bottom-6 hidden rounded-2xl bg-white px-4 py-3 shadow-[var(--shadow-card)] ring-1 ring-border sm:block sm:-right-3 sm:bottom-10">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-bold">5.0 Rating</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Section({
  id,
  eyebrow,
  title,
  subtitle,
  children,
  className = "",
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`py-16 sm:py-20 ${className}`}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          {eyebrow && (
            <p className="text-xs font-bold uppercase tracking-widest text-primary">{eyebrow}</p>
          )}
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div className="mt-12">{children}</div>
      </div>
    </section>
  );
}

function About() {
  const stats = [
    { value: "5.0★", label: "Google Rating" },
    { value: "27+", label: "Happy Patients" },
    { value: "2–3 yrs", label: "Serving the Community" },
  ];
  return (
    <Section id="about" eyebrow="About Us" title="A neighborhood clinic that feels like family">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
          Sanjeevini Clinic is a trusted neighborhood medical clinic in Chikkasandra, Jalahalli
          West, Bengaluru, run by Dr. Prajna U K. Open for the past 2–3 years, the clinic is
          known for compassionate, patient-first care and a 5.0-star reputation among local
          patients.
        </p>
      </div>
      <div className="mt-12 grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl bg-card p-6 text-center shadow-[var(--shadow-card)] ring-1 ring-border"
          >
            <p className="font-display text-3xl font-extrabold text-primary sm:text-4xl">
              {s.value}
            </p>
            <p className="mt-1 text-sm font-medium text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

function Services() {
  return (
    <Section
      id="services"
      eyebrow="Services"
      title="Comprehensive everyday care"
      subtitle="From common illnesses to long-term conditions, we're here for your family's everyday health needs."
      className="bg-secondary/40"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {services.map(({ icon: Icon, name }) => (
          <div
            key={name}
            className="group flex items-center gap-4 rounded-2xl bg-card p-5 ring-1 ring-border transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)]"
          >
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-accent text-primary transition-colors group-hover:bg-gradient-primary group-hover:text-white">
              <Icon className="h-5 w-5" />
            </div>
            <p className="text-sm font-semibold text-foreground sm:text-base">{name}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

function Doctor() {
  return (
    <Section id="doctor" eyebrow="Meet the Doctor" title="Dr. Prajna U K">
      <div className="mx-auto max-w-3xl">
        <div className="grid gap-8 rounded-3xl bg-card p-8 shadow-[var(--shadow-card)] ring-1 ring-border sm:grid-cols-[auto_1fr] sm:p-10">
          <img
            src={doctorPhoto.url}
            alt="Dr. Prajna U K — General Physician at Sanjeevini Clinic"
            loading="lazy"
            width={320}
            height={320}
            className="mx-auto h-32 w-32 shrink-0 rounded-full object-cover shadow-[var(--shadow-soft)] ring-4 ring-accent sm:mx-0 sm:h-40 sm:w-40"
          />
          <div className="text-center sm:text-left">
            <h3 className="font-display text-2xl font-bold text-foreground">Dr. Prajna U K</h3>
            <p className="mt-1 text-sm font-semibold uppercase tracking-wider text-primary">
              General Physician
            </p>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Dr. Prajna U K brings a soft-spoken, patient-first approach to every consultation,
              helping patients manage everything from everyday illness to chronic conditions like
              diabetes and hypertension with warmth and care.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2 sm:justify-start">
              <AppointmentDialog
                trigger={
                  <Button className="h-10 rounded-full bg-primary text-primary-foreground">
                    <CalendarIcon className="h-4 w-4" /> Book Consultation
                  </Button>
                }
              />
              <a
                href={WHATSAPP}
                target="_blank"
                rel="noreferrer"
                onClick={() => trackEvent("click_whatsapp", { source: "doctor" })}
              >
                <Button variant="outline" className="h-10 rounded-full">
                  <MessageCircle className="h-4 w-4" /> WhatsApp
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

function Reviews() {
  const { data } = useQuery({
    queryKey: ["google-reviews"],
    queryFn: () => getGoogleReviews(),
    staleTime: 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
  const liveReviews = data?.configured && data.reviews.length > 0 ? data.reviews : null;
  const displayed = liveReviews ?? reviews;
  const rating = data?.rating ?? 5.0;
  const total = data?.total ?? 27;
  return (
    <Section
      id="reviews"
      eyebrow="Patient Reviews"
      title="Loved by our community"
      className="bg-secondary/40"
    >
      {liveReviews && (
        <p className="-mt-6 mb-8 text-center text-xs font-medium uppercase tracking-wider text-primary">
          Live from Google · Updated hourly
        </p>
      )}
      <div className="grid gap-5 md:grid-cols-3">
        {displayed.map((r) => (
          <figure
            key={r.name + r.timeAgo}
            className="flex h-full flex-col rounded-2xl bg-card p-6 shadow-[var(--shadow-card)] ring-1 ring-border"
          >
            <div className="flex items-center gap-3">
              {"photo" in r && typeof r.photo === "string" && r.photo.length > 0 ? (
                <img
                  src={r.photo}
                  alt={r.name}
                  loading="lazy"
                  className="h-10 w-10 rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-primary text-sm font-bold text-white">
                  {r.initials}
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{r.name}</p>
                <p className="text-xs text-muted-foreground">{r.timeAgo} · Google</p>
              </div>
            </div>
            <div className="mt-3 flex gap-0.5 text-yellow-400">
              {[...Array(r.rating)].map((_, j) => (
                <Star key={j} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-foreground">
              "{r.text}"
            </blockquote>
          </figure>
        ))}
      </div>
      <div className="mt-10 text-center">
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${MAPS_QUERY}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-foreground shadow-[var(--shadow-card)] ring-1 ring-border transition-colors hover:text-primary"
        >
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          {rating.toFixed(1)} ★ ({total} Google Reviews)
        </a>
      </div>
    </Section>
  );
}

function Gallery() {
  const photos = [
    {
      label: "Clinic Exterior & Signage",
      src: exteriorPhoto.url,
      className: "sm:col-span-2 aspect-[16/9]",
    },
    {
      label: "Waiting Area",
      src: waitingPhoto.url,
      className: "aspect-[4/5]",
    },
    {
      label: "Consultation Room",
      src: consultationPhoto.url,
      className: "aspect-[4/5]",
    },
  ];
  return (
    <Section id="gallery" eyebrow="Our Clinic" title="A calm, welcoming space">
      <div className="grid gap-4 sm:grid-cols-2">
        {photos.map((p) => (
          <figure
            key={p.label}
            className={`group relative overflow-hidden rounded-2xl bg-secondary ring-1 ring-border shadow-[var(--shadow-card)] ${p.className}`}
          >
            <img
              src={p.src}
              alt={`Sanjeevini Clinic — ${p.label}`}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 text-sm font-semibold text-white">
              {p.label}
            </figcaption>
          </figure>
        ))}
      </div>
    </Section>
  );
}

function LocationHours() {
  const status = useOpenStatus();
  const todayIndex = status?.today.dayIndex;
  return (
    <Section id="location" eyebrow="Visit Us" title="Location & Hours">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="overflow-hidden rounded-2xl ring-1 ring-border shadow-[var(--shadow-card)]">
          <iframe
            title="Sanjeevini Clinic location"
            src={`https://www.google.com/maps?q=${MAPS_QUERY}&output=embed`}
            className="h-80 w-full lg:h-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
        <div className="space-y-6">
          <div className="rounded-2xl bg-card p-6 shadow-[var(--shadow-card)] ring-1 ring-border">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent text-primary">
                <MapPin className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h3 className="font-display text-lg font-bold">Address</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{ADDRESS}</p>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${MAPS_QUERY}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex"
                  onClick={() => trackEvent("click_directions", { source: "location" })}
                >
                  <Button className="h-10 rounded-full bg-primary text-primary-foreground">
                    <MapPin className="h-4 w-4" /> Get Directions
                  </Button>
                </a>
              </div>
            </div>
          </div>
          <div className="rounded-2xl bg-card p-6 shadow-[var(--shadow-card)] ring-1 ring-border">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent text-primary">
                <Clock className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-display text-lg font-bold">Opening Hours</h3>
                  {status && (
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                        status.isOpen
                          ? "bg-green-100 text-green-700"
                          : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${status.isOpen ? "bg-green-500" : "bg-muted-foreground/50"}`}
                      />
                      {status.statusLine}
                    </span>
                  )}
                </div>
                <dl className="mt-3 divide-y divide-border text-sm">
                  {[1, 2, 3, 4, 5, 6, 0].map((idx) => {
                    const d = weekHours[idx];
                    const isToday = todayIndex === idx;
                    return (
                      <div
                        key={idx}
                        className={`flex flex-wrap justify-between gap-2 py-2 ${
                          isToday ? "rounded-lg bg-accent/60 px-2 -mx-2" : ""
                        }`}
                      >
                        <dt
                          className={`font-semibold ${isToday ? "text-primary" : "text-foreground"}`}
                        >
                          {d.label}
                          {isToday && (
                            <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-primary">
                              Today
                            </span>
                          )}
                        </dt>
                        <dd className={isToday ? "text-foreground" : "text-muted-foreground"}>
                          {d.display}
                        </dd>
                      </div>
                    );
                  })}
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

function FaqSection() {
  return (
    <Section
      id="faq"
      eyebrow="FAQ"
      title="Common questions, simple answers"
      subtitle="Quick, reassuring answers about visits, services, and what to expect."
    >
      <div className="mx-auto max-w-3xl">
        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((f, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="rounded-2xl border border-border bg-card px-5 shadow-[var(--shadow-card)]"
            >
              <AccordionTrigger className="text-left text-sm font-semibold text-foreground sm:text-base">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </Section>
  );
}

function Contact() {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    const cleanName = name.trim();
    const cleanPhone = phone.trim();
    if (cleanName.length < 2) return toast.error("Please enter your name");
    if (cleanPhone.length < 7) return toast.error("Please enter a valid phone number");
    if (message.length > 2000) return toast.error("Message is too long");
    setSubmitting(true);
    const { error } = await supabase.from("contact_submissions").insert({
      name: cleanName,
      phone: cleanPhone,
      message: message.trim() || null,
      source: "contact_form",
    });
    setSubmitting(false);
    if (error) {
      toast.error("Couldn't send right now. Please call or WhatsApp us.");
      return;
    }
    setDone(true);
    setName(""); setPhone(""); setMessage("");
    trackEvent("contact_submitted");
    toast.success("Message received — we'll get back to you soon!");
  };

  return (
    <Section
      id="contact"
      eyebrow="Get in Touch"
      title="We're here to help"
      subtitle="Call, WhatsApp, or send us a message — we'll get back to you quickly."
      className="bg-secondary/40"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <a
            href={`tel:${PHONE}`}
            className="flex items-center gap-4 rounded-2xl bg-card p-5 shadow-[var(--shadow-card)] ring-1 ring-border transition-colors hover:ring-primary"
            onClick={() => trackEvent("click_call_now", { source: "contact_card" })}
          >
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-primary text-white">
              <Phone className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Call us
              </p>
              <p className="font-display text-xl font-bold text-foreground">{PHONE}</p>
            </div>
          </a>
          <a
            href={WHATSAPP}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-4 rounded-2xl bg-card p-5 shadow-[var(--shadow-card)] ring-1 ring-border transition-colors hover:ring-whatsapp"
            onClick={() => trackEvent("click_whatsapp", { source: "contact_card" })}
          >
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-whatsapp text-whatsapp-foreground">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                WhatsApp
              </p>
              <p className="font-display text-xl font-bold text-foreground">{PHONE}</p>
              <p className="text-xs text-muted-foreground">Alternate: {WHATSAPP_ALT}</p>
            </div>
          </a>
          <div className="flex items-start gap-4 rounded-2xl bg-card p-5 shadow-[var(--shadow-card)] ring-1 ring-border">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-accent text-primary">
              <MapPin className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Visit
              </p>
              <p className="text-sm leading-relaxed text-foreground">{ADDRESS}</p>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl bg-card p-6 shadow-[var(--shadow-card)] ring-1 ring-border sm:p-8"
        >
          <h3 className="font-display text-xl font-bold">Send a message</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            We'll respond as soon as possible.
          </p>
          {done && (
            <div className="mt-4 flex items-start gap-3 rounded-xl bg-accent/60 p-3 text-sm text-foreground">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <p>Thanks! We've received your message and will reach out shortly.</p>
            </div>
          )}
          <div className="mt-5 space-y-4">
            <div>
              <label className="text-xs font-semibold text-foreground">Your Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={100}
                className="mt-1 h-11 w-full rounded-xl border border-input bg-background px-4 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="Full name"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground">Phone Number</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={20}
                className="mt-1 h-11 w-full rounded-xl border border-input bg-background px-4 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="10-digit mobile number"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground">Message</label>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={2000}
                className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="How can we help?"
              />
            </div>
            <Button
              type="submit"
              disabled={submitting}
              className="h-12 w-full rounded-full bg-gradient-primary text-base text-white shadow-[var(--shadow-soft)] hover:opacity-95"
            >
              {submitting ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</>
              ) : (
                "Send Message"
              )}
            </Button>
          </div>
        </form>
      </div>
    </Section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border bg-foreground/[0.03]">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
            Health and Happiness Comes Free — your trusted family clinic in Jalahalli West.
          </p>
        </div>
        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-foreground">Visit</h4>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{ADDRESS}</p>
        </div>
        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-foreground">Contact</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <a
                href={`tel:${PHONE}`}
                className="text-muted-foreground hover:text-primary"
                onClick={() => trackEvent("click_call_now", { source: "footer" })}
              >
                Phone: {PHONE}
              </a>
            </li>
            <li>
              <a
                href={WHATSAPP}
                className="text-muted-foreground hover:text-primary"
                onClick={() => trackEvent("click_whatsapp", { source: "footer" })}
              >
                WhatsApp: {PHONE}
              </a>
            </li>
            <li className="text-muted-foreground">Alt WhatsApp: {WHATSAPP_ALT}</li>
          </ul>
          <div className="mt-4 flex flex-wrap gap-4 text-xs">
            <a href="#about" className="text-muted-foreground hover:text-primary">About</a>
            <a href="#services" className="text-muted-foreground hover:text-primary">Services</a>
            <a href="#contact" className="text-muted-foreground hover:text-primary">Contact</a>
          </div>
        </div>
      </div>
      <div className="border-t border-border">
        <p className="mx-auto max-w-6xl px-4 py-5 text-center text-xs text-muted-foreground sm:px-6">
          © 2026 Sanjeevini Clinic. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

function FloatingWhatsApp() {
  return (
    <a
      href={WHATSAPP}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-5 right-5 z-40 grid h-14 w-14 place-items-center rounded-full bg-whatsapp text-whatsapp-foreground shadow-[var(--shadow-soft)] transition-transform hover:scale-105"
      onClick={() => trackEvent("click_whatsapp", { source: "floating" })}
    >
      <MessageCircle className="h-6 w-6" />
    </a>
  );
}

function Index() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground antialiased">
      <Header />
      <main>
        <Hero />
        <About />
        <Services />
        <Doctor />
        <Reviews />
        <Gallery />
        <LocationHours />
        <FaqSection />
        <Contact />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}

