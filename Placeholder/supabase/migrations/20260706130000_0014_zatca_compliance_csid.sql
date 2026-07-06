-- ZATCA CSID onboarding, step 2: exchange the CSR + a portal OTP for a
-- Compliance CSID. Adds the fields the exchange needs/produces to the
-- existing zatca_csr_requests table (migration 0013) rather than a new
-- table — this is a continuation of the same per-workspace onboarding
-- record, not a separate concern.
--
-- `environment` is chosen at CSR-generation time (it changes the CSR's CN
-- and certificate template name — see src/lib/zatca/csr.ts) and reused here
-- to pick the right ZATCA base URL.
--
-- `compliance_secret` is encrypted the same way as the CSR private key: it's
-- a real bearer credential (the Basic Auth password for later ZATCA calls),
-- not a demo artifact. `compliance_csid` (ZATCA's binarySecurityToken) is
-- stored as-is — it's a certificate, and it also functions as the Basic Auth
-- *username*, which is useless without the paired secret.

alter table public.zatca_csr_requests
  add column environment text not null default 'simulation' check (environment in ('simulation', 'production')),
  add column zatca_request_id text,
  add column compliance_csid text,
  add column encrypted_compliance_secret text;

alter table public.zatca_csr_requests
  drop constraint zatca_csr_requests_status_check,
  add constraint zatca_csr_requests_status_check
    check (status in ('not_started', 'csr_generated', 'compliance_csid_received'));
