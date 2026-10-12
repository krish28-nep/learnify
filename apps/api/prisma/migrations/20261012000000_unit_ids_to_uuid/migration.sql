-- Replace existing CUID unit IDs with UUIDs. The foreign key from Content.unitId
-- uses ON UPDATE CASCADE, so associated content rows follow each new unit ID.
UPDATE "Unit"
SET "id" = gen_random_uuid()::text;
