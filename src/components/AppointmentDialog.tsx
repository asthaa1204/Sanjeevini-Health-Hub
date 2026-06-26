import { useMemo, useState } from "react";
import { format, addDays, isSunday } from "date-fns";
import { CalendarIcon, MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { PHONE, WHATSAPP_NUMBER, services } from "@/lib/clinicData";
import { supabase } from "@/integrations/supabase/client";
import { trackEvent } from "@/lib/analytics";
import { toast } from "sonner";

type Props = {
  trigger: React.ReactNode;
  defaultService?: string;
};

const weekdaySlots = [
  "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM",
  "04:30 PM", "05:00 PM", "05:30 PM", "06:00 PM", "06:30 PM",
  "07:00 PM", "07:30 PM", "08:00 PM", "08:30 PM",
];
const sundaySlots = ["10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM"];

export function AppointmentDialog({ trigger, defaultService }: Props) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(addDays(new Date(), 1));
  const [slot, setSlot] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [service, setService] = useState(defaultService ?? services[0].name);

  const slots = useMemo(() => (date && isSunday(date) ? sundaySlots : weekdaySlots), [date]);

  const canSubmit = Boolean(date && slot && name.trim().length > 1 && phone.trim().length >= 7);

  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (!date || !slot || submitting) return;
    setSubmitting(true);
    const { error } = await supabase.from("appointment_bookings").insert({
      name: name.trim(),
      phone: phone.trim(),
      preferred_date: format(date, "yyyy-MM-dd"),
      preferred_time: slot,
      notes: `Service: ${service}`,
      source: "website",
    });
    setSubmitting(false);
    if (error) {
      toast.error("Couldn't save your booking — continuing on WhatsApp.");
    } else {
      toast.success("Booking saved — confirm on WhatsApp to finalize.");
    }
    trackEvent("appointment_booked", {
      service,
      preferred_date: format(date, "yyyy-MM-dd"),
      preferred_time: slot,
    });
    trackEvent("click_whatsapp", { source: "appointment_dialog" });
    const message =
      `Hello Sanjeevini Clinic,%0A%0A` +
      `I'd like to book an appointment.%0A` +
      `• Name: ${encodeURIComponent(name.trim())}%0A` +
      `• Phone: ${encodeURIComponent(phone.trim())}%0A` +
      `• Service: ${encodeURIComponent(service)}%0A` +
      `• Date: ${encodeURIComponent(format(date, "EEE, d MMM yyyy"))}%0A` +
      `• Time: ${encodeURIComponent(slot)}%0A%0A` +
      `Please confirm. Thank you!`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Book an Appointment</DialogTitle>
          <DialogDescription>
            Pick a date and time slot — we'll confirm on WhatsApp.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-foreground">Your Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="Full name"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground">Phone</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                inputMode="tel"
                className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="10-digit mobile"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground">Service</label>
            <select
              value={service}
              onChange={(e) => setService(e.target.value)}
              className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              {services.map((s) => (
                <option key={s.slug} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground">Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "mt-1 h-10 w-full justify-start rounded-lg text-left font-normal",
                    !date && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "EEE, d MMM yyyy") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => { setDate(d); setSlot(null); }}
                  disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0)) || d > addDays(new Date(), 45)}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground">
              Available Slots {date && isSunday(date) && <span className="text-muted-foreground">(Sunday — morning only)</span>}
            </label>
            <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
              {slots.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSlot(s)}
                  className={cn(
                    "rounded-lg border px-2 py-2 text-xs font-semibold transition-colors",
                    slot === s
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-foreground hover:border-primary hover:text-primary",
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row">
          <a href={`tel:${PHONE}`} className="sm:mr-auto">
            <Button variant="outline" className="h-11 w-full rounded-full sm:w-auto">
              <Phone className="h-4 w-4" /> Call instead
            </Button>
          </a>
          <Button
            disabled={!canSubmit || submitting}
            onClick={handleConfirm}
            className="h-11 w-full rounded-full bg-whatsapp text-whatsapp-foreground hover:bg-whatsapp/90 sm:w-auto"
          >
            <MessageCircle className="h-4 w-4" />
            {submitting ? "Saving…" : "Confirm on WhatsApp"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}