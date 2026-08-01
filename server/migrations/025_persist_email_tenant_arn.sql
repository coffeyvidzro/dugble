ALTER TABLE email_tenants
ADD COLUMN tenant_arn TEXT;

ALTER TABLE email_tenants
ADD CONSTRAINT chk_email_tenants_tenant_arn
CHECK (tenant_arn IS NULL OR length(trim(tenant_arn)) > 0);
