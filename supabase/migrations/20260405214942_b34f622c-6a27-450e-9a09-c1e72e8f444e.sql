
DROP POLICY "System can insert audit logs" ON public.audit_logs;
CREATE POLICY "Admins and technicians can insert audit logs" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'technician'));
