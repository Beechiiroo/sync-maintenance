
-- Email OTP storage for 2FA and password reset
CREATE TABLE IF NOT EXISTS public.email_otp_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  code_hash TEXT NOT NULL,
  purpose TEXT NOT NULL CHECK (purpose IN ('2fa_login','password_reset')),
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  attempts INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_email_otp_lookup ON public.email_otp_codes (email, purpose, used_at);
CREATE INDEX IF NOT EXISTS idx_email_otp_expires ON public.email_otp_codes (expires_at);

ALTER TABLE public.email_otp_codes ENABLE ROW LEVEL SECURITY;

-- No client access; only edge functions (service role) read/write.
CREATE POLICY "no_client_access_select" ON public.email_otp_codes FOR SELECT USING (false);
CREATE POLICY "no_client_access_insert" ON public.email_otp_codes FOR INSERT WITH CHECK (false);
CREATE POLICY "no_client_access_update" ON public.email_otp_codes FOR UPDATE USING (false);
CREATE POLICY "no_client_access_delete" ON public.email_otp_codes FOR DELETE USING (false);
