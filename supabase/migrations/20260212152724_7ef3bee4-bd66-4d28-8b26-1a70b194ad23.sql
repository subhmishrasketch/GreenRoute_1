
-- Create notification preferences table
CREATE TABLE public.notification_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  email_pickup_confirmed BOOLEAN NOT NULL DEFAULT true,
  email_pickup_scheduled BOOLEAN NOT NULL DEFAULT true,
  email_vehicle_arriving BOOLEAN NOT NULL DEFAULT true,
  email_pickup_completed BOOLEAN NOT NULL DEFAULT true,
  push_pickup_confirmed BOOLEAN NOT NULL DEFAULT true,
  push_pickup_scheduled BOOLEAN NOT NULL DEFAULT true,
  push_vehicle_arriving BOOLEAN NOT NULL DEFAULT true,
  push_pickup_completed BOOLEAN NOT NULL DEFAULT true,
  sms_vehicle_arriving BOOLEAN NOT NULL DEFAULT true,
  sms_pickup_completed BOOLEAN NOT NULL DEFAULT false,
  phone_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own preferences"
ON public.notification_preferences FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
ON public.notification_preferences FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
ON public.notification_preferences FOR UPDATE
USING (auth.uid() = user_id);

-- Admins can view all for sending notifications
CREATE POLICY "Admins can view all preferences"
ON public.notification_preferences FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_notification_preferences_updated_at
BEFORE UPDATE ON public.notification_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
