-- Create societies table
CREATE TABLE public.societies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  area TEXT NOT NULL,
  number_of_flats INTEGER NOT NULL DEFAULT 0,
  address TEXT,
  caretaker_id UUID REFERENCES auth.users(id),
  eco_points INTEGER NOT NULL DEFAULT 0,
  total_pickups INTEGER NOT NULL DEFAULT 0,
  plastic_collected NUMERIC(10,2) NOT NULL DEFAULT 0,
  cardboard_collected NUMERIC(10,2) NOT NULL DEFAULT 0,
  co2_reduced NUMERIC(10,2) NOT NULL DEFAULT 0,
  plastic_saved NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create waste_type enum
CREATE TYPE public.waste_type AS ENUM ('plastic', 'cardboard');

-- Create pickup_status enum
CREATE TYPE public.pickup_status AS ENUM ('requested', 'scheduled', 'picked', 'recycled');

-- Create quantity_size enum
CREATE TYPE public.quantity_size AS ENUM ('small', 'medium', 'large');

-- Create pickups table
CREATE TABLE public.pickups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pickup_id TEXT NOT NULL UNIQUE,
  society_id UUID REFERENCES public.societies(id),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  waste_type waste_type NOT NULL,
  quantity quantity_size NOT NULL,
  status pickup_status NOT NULL DEFAULT 'requested',
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  scheduled_time TIMESTAMP WITH TIME ZONE,
  vehicle_id TEXT,
  estimated_arrival TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on societies
ALTER TABLE public.societies ENABLE ROW LEVEL SECURITY;

-- Enable RLS on pickups
ALTER TABLE public.pickups ENABLE ROW LEVEL SECURITY;

-- Societies RLS policies
CREATE POLICY "Users can view their own society"
  ON public.societies FOR SELECT
  USING (caretaker_id = auth.uid());

CREATE POLICY "Admins can view all societies"
  ON public.societies FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can create their own society"
  ON public.societies FOR INSERT
  WITH CHECK (caretaker_id = auth.uid());

CREATE POLICY "Users can update their own society"
  ON public.societies FOR UPDATE
  USING (caretaker_id = auth.uid());

CREATE POLICY "Admins can update any society"
  ON public.societies FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Pickups RLS policies
CREATE POLICY "Users can view their own pickups"
  ON public.pickups FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all pickups"
  ON public.pickups FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can create their own pickups"
  ON public.pickups FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own pickups"
  ON public.pickups FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Admins can update any pickup"
  ON public.pickups FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Add triggers for updated_at
CREATE TRIGGER update_societies_updated_at
  BEFORE UPDATE ON public.societies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pickups_updated_at
  BEFORE UPDATE ON public.pickups
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for pickups table
ALTER PUBLICATION supabase_realtime ADD TABLE public.pickups;

-- Add society_id reference to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS registered_society_id UUID REFERENCES public.societies(id);