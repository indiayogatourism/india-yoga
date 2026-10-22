-- Apply this additive schema change before deploying the package HTML editor.
ALTER TABLE "Package" ADD COLUMN IF NOT EXISTS "contentHtml" TEXT;
