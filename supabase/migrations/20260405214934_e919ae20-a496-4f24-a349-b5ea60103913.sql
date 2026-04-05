
-- ============================================
-- EQUIPMENT TABLE
-- ============================================
CREATE TYPE public.equipment_status AS ENUM ('operational', 'maintenance', 'critical', 'warning', 'decommissioned');

CREATE TABLE public.equipment (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  serial_number TEXT UNIQUE,
  category TEXT NOT NULL DEFAULT 'general',
  location TEXT NOT NULL DEFAULT '',
  status equipment_status NOT NULL DEFAULT 'operational',
  manufacturer TEXT,
  model TEXT,
  purchase_date DATE,
  warranty_expires DATE,
  health_score INTEGER DEFAULT 100 CHECK (health_score >= 0 AND health_score <= 100),
  image_url TEXT,
  specifications JSONB DEFAULT '{}',
  last_maintenance TIMESTAMPTZ,
  next_maintenance TIMESTAMPTZ,
  mtbf_hours NUMERIC,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_equipment_status ON public.equipment(status);
CREATE INDEX idx_equipment_category ON public.equipment(category);
CREATE INDEX idx_equipment_location ON public.equipment(location);

ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view equipment" ON public.equipment FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins and technicians can insert equipment" ON public.equipment FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'technician'));
CREATE POLICY "Admins and technicians can update equipment" ON public.equipment FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'technician'));
CREATE POLICY "Admins can delete equipment" ON public.equipment FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));

-- ============================================
-- INTERVENTIONS TABLE
-- ============================================
CREATE TYPE public.intervention_priority AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE public.intervention_status AS ENUM ('planned', 'in_progress', 'completed', 'cancelled');
CREATE TYPE public.intervention_type AS ENUM ('preventive', 'corrective', 'predictive', 'emergency');

CREATE TABLE public.interventions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  equipment_id UUID REFERENCES public.equipment(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id),
  priority intervention_priority NOT NULL DEFAULT 'medium',
  status intervention_status NOT NULL DEFAULT 'planned',
  type intervention_type NOT NULL DEFAULT 'corrective',
  scheduled_date TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  duration_minutes INTEGER,
  cost NUMERIC(12,2) DEFAULT 0,
  notes TEXT,
  photos TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_interventions_status ON public.interventions(status);
CREATE INDEX idx_interventions_priority ON public.interventions(priority);
CREATE INDEX idx_interventions_assigned ON public.interventions(assigned_to);
CREATE INDEX idx_interventions_equipment ON public.interventions(equipment_id);
CREATE INDEX idx_interventions_scheduled ON public.interventions(scheduled_date);

ALTER TABLE public.interventions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view interventions" ON public.interventions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins and technicians can create interventions" ON public.interventions FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'technician') OR has_role(auth.uid(), 'assistant'));
CREATE POLICY "Admins and assignees can update interventions" ON public.interventions FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin') OR assigned_to = auth.uid());
CREATE POLICY "Admins can delete interventions" ON public.interventions FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));

-- ============================================
-- TICKETS TABLE
-- ============================================
CREATE TYPE public.ticket_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');
CREATE TYPE public.ticket_priority AS ENUM ('low', 'medium', 'high', 'urgent');

CREATE TABLE public.tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  equipment_id UUID REFERENCES public.equipment(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id),
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  priority ticket_priority NOT NULL DEFAULT 'medium',
  status ticket_status NOT NULL DEFAULT 'open',
  category TEXT DEFAULT 'general',
  resolution TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_tickets_status ON public.tickets(status);
CREATE INDEX idx_tickets_priority ON public.tickets(priority);
CREATE INDEX idx_tickets_created_by ON public.tickets(created_by);
CREATE INDEX idx_tickets_assigned_to ON public.tickets(assigned_to);

ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tickets or admins all" ON public.tickets FOR SELECT TO authenticated USING (created_by = auth.uid() OR assigned_to = auth.uid() OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'technician'));
CREATE POLICY "Authenticated users can create tickets" ON public.tickets FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Admins and assignees can update tickets" ON public.tickets FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin') OR assigned_to = auth.uid() OR created_by = auth.uid());
CREATE POLICY "Admins can delete tickets" ON public.tickets FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));

-- ============================================
-- SPARE PARTS TABLE
-- ============================================
CREATE TYPE public.stock_status AS ENUM ('ok', 'low', 'critical', 'out_of_stock');

CREATE TABLE public.spare_parts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  reference TEXT UNIQUE NOT NULL,
  category TEXT DEFAULT 'general',
  quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  min_stock INTEGER NOT NULL DEFAULT 5,
  price NUMERIC(12,2) DEFAULT 0,
  supplier TEXT,
  location TEXT,
  status stock_status NOT NULL DEFAULT 'ok',
  image_url TEXT,
  compatible_equipment UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_spare_parts_status ON public.spare_parts(status);
CREATE INDEX idx_spare_parts_reference ON public.spare_parts(reference);
CREATE INDEX idx_spare_parts_category ON public.spare_parts(category);

ALTER TABLE public.spare_parts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view spare parts" ON public.spare_parts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins and technicians can manage spare parts" ON public.spare_parts FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'technician'));
CREATE POLICY "Admins and technicians can update spare parts" ON public.spare_parts FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'technician'));
CREATE POLICY "Admins can delete spare parts" ON public.spare_parts FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));

-- ============================================
-- STOCK MOVEMENTS TABLE
-- ============================================
CREATE TYPE public.movement_type AS ENUM ('in', 'out', 'adjustment');

CREATE TABLE public.stock_movements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  spare_part_id UUID NOT NULL REFERENCES public.spare_parts(id) ON DELETE CASCADE,
  type movement_type NOT NULL,
  quantity INTEGER NOT NULL,
  performed_by UUID REFERENCES auth.users(id),
  intervention_id UUID REFERENCES public.interventions(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_stock_movements_part ON public.stock_movements(spare_part_id);
CREATE INDEX idx_stock_movements_type ON public.stock_movements(type);

ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view movements" ON public.stock_movements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins and technicians can create movements" ON public.stock_movements FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'technician'));

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TYPE public.notification_type AS ENUM ('info', 'warning', 'alert', 'task', 'system');

CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type notification_type NOT NULL DEFAULT 'info',
  read BOOLEAN NOT NULL DEFAULT false,
  link TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(user_id, read);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "System can create notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin') OR user_id = auth.uid());

-- ============================================
-- MESSAGES TABLE
-- ============================================
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  attachments TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_messages_sender ON public.messages(sender_id);
CREATE INDEX idx_messages_receiver ON public.messages(receiver_id);
CREATE INDEX idx_messages_conversation ON public.messages(sender_id, receiver_id);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own messages" ON public.messages FOR SELECT TO authenticated USING (sender_id = auth.uid() OR receiver_id = auth.uid());
CREATE POLICY "Users can send messages" ON public.messages FOR INSERT TO authenticated WITH CHECK (sender_id = auth.uid());
CREATE POLICY "Users can update own sent messages" ON public.messages FOR UPDATE TO authenticated USING (sender_id = auth.uid() OR receiver_id = auth.uid());

-- ============================================
-- MAINTENANCE SCHEDULES TABLE
-- ============================================
CREATE TYPE public.schedule_frequency AS ENUM ('daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'semi_annual', 'annual');

CREATE TABLE public.maintenance_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  equipment_id UUID NOT NULL REFERENCES public.equipment(id) ON DELETE CASCADE,
  task TEXT NOT NULL,
  frequency schedule_frequency NOT NULL DEFAULT 'monthly',
  next_due TIMESTAMPTZ NOT NULL,
  last_performed TIMESTAMPTZ,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'upcoming',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_schedules_equipment ON public.maintenance_schedules(equipment_id);
CREATE INDEX idx_schedules_next_due ON public.maintenance_schedules(next_due);
CREATE INDEX idx_schedules_assigned ON public.maintenance_schedules(assigned_to);

ALTER TABLE public.maintenance_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view schedules" ON public.maintenance_schedules FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins and technicians can manage schedules" ON public.maintenance_schedules FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'technician'));
CREATE POLICY "Admins and technicians can update schedules" ON public.maintenance_schedules FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'technician'));
CREATE POLICY "Admins can delete schedules" ON public.maintenance_schedules FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));

-- ============================================
-- CONTRACTS TABLE
-- ============================================
CREATE TYPE public.contract_type AS ENUM ('maintenance', 'service', 'warranty', 'lease');
CREATE TYPE public.contract_status AS ENUM ('active', 'expiring', 'expired', 'cancelled');

CREATE TABLE public.contracts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  supplier TEXT NOT NULL,
  type contract_type NOT NULL DEFAULT 'maintenance',
  status contract_status NOT NULL DEFAULT 'active',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  value NUMERIC(12,2) DEFAULT 0,
  sla_response_hours INTEGER DEFAULT 24,
  sla_resolution_hours INTEGER DEFAULT 72,
  compliance_score INTEGER DEFAULT 100 CHECK (compliance_score >= 0 AND compliance_score <= 100),
  penalties NUMERIC(12,2) DEFAULT 0,
  document_url TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_contracts_status ON public.contracts(status);
CREATE INDEX idx_contracts_end_date ON public.contracts(end_date);

ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view contracts" ON public.contracts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage contracts" ON public.contracts FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update contracts" ON public.contracts FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete contracts" ON public.contracts FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));

-- ============================================
-- AUDIT LOGS TABLE
-- ============================================
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  module TEXT NOT NULL,
  details TEXT,
  ip_address TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_user ON public.audit_logs(user_id);
CREATE INDEX idx_audit_action ON public.audit_logs(action);
CREATE INDEX idx_audit_module ON public.audit_logs(module);
CREATE INDEX idx_audit_created ON public.audit_logs(created_at);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs" ON public.audit_logs FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "System can insert audit logs" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (true);

-- ============================================
-- ENABLE REALTIME FOR KEY TABLES
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.interventions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tickets;
