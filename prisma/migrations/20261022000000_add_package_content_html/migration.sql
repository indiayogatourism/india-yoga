-- The CMS package editor stores authored HTML in this optional column.
-- Keep this migration safe for databases where the column was added manually.
ALTER TABLE "Package" ADD COLUMN IF NOT EXISTS "contentHtml" TEXT;
