-- Create vehicle status enum
CREATE TYPE public.vehicle_status AS ENUM ('available', 'en_route', 'busy', 'offline');

-- Create vehicles table for real-time tracking
CREATE TABLE public.vehicles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_number TEXT NOT NULL UNIQUE,
  driver_name TEXT NOT NULL,
  driver_phone TEXT,
  status vehicle_status NOT NULL DEFAULT 'offline',
  current_latitude DECIMAL(10, 8),
  current_longitude DECIMAL(11, 8),
  last_location_update TIMESTAMP WITH TIME ZONE,
  assigned_pickup_id UUID REFERENCES public.pickups(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on vehicles
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

-- Admins can manage all vehicles
CREATE POLICY "Admins can view all vehicles"
  ON public.vehicles FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert vehicles"
  ON public.vehicles FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update vehicles"
  ON public.vehicles FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete vehicles"
  ON public.vehicles FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- Society caretakers can view vehicles assigned to their pickups
CREATE POLICY "Caretakers can view assigned vehicles"
  ON public.vehicles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.pickups p
      JOIN public.societies s ON p.society_id = s.id
      WHERE p.id = vehicles.assigned_pickup_id
      AND s.caretaker_id = auth.uid()
    )
  );

-- Update trigger for vehicles
CREATE TRIGGER update_vehicles_updated_at
  BEFORE UPDATE ON public.vehicles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for vehicles
ALTER PUBLICATION supabase_realtime ADD TABLE public.vehicles;

-- Add index for faster lookups
CREATE INDEX idx_vehicles_status ON public.vehicles(status);
CREATE INDEX idx_vehicles_assigned_pickup ON public.vehicles(assigned_pickup_id);

-- Insert some initial vehicles for the system
INSERT INTO public.vehicles (vehicle_number, driver_name, driver_phone, status, current_latitude, current_longitude, last_location_update)
VALUES 
  ('GR-001', 'Rahul Sharma', '+91-9876543210', 'available', 19.0760, 72.8777, now()),
  ('GR-002', 'Amit Patel', '+91-9876543211', 'available', 19.0820, 72.8910, now()),
  ('GR-003', 'Suresh Kumar', '+91-9876543212', 'offline', 19.0650, 72.8650, now());