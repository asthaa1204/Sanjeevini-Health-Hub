CREATE TABLE public.appointment_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  preferred_date date NOT NULL,
  preferred_time text NOT NULL,
  notes text,
  source text NOT NULL DEFAULT 'website',
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.appointment_bookings TO anon, authenticated;
GRANT ALL ON public.appointment_bookings TO service_role;

ALTER TABLE public.appointment_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit an appointment booking"
ON public.appointment_bookings
FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(trim(name)) BETWEEN 1 AND 100
  AND length(trim(phone)) BETWEEN 7 AND 20
  AND length(trim(preferred_time)) BETWEEN 1 AND 50
  AND (notes IS NULL OR length(notes) <= 2000)
);