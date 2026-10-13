-- Replace remaining CUID primary keys with UUIDs. Updating Subject IDs cascades
-- to Unit.subjectId through the existing ON UPDATE CASCADE foreign key.
UPDATE "User"
SET "id" = gen_random_uuid()::text;

UPDATE "Subject"
SET "id" = gen_random_uuid()::text;

UPDATE "Content"
SET "id" = gen_random_uuid()::text;
