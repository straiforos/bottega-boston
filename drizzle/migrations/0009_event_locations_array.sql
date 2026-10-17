ALTER TABLE public.events ADD COLUMN locations text[] NOT NULL DEFAULT '{}';

-- Backfill: every existing event keeps its single location.
UPDATE public.events SET locations = ARRAY[location_id] WHERE cardinality(locations) = 0;

COMMENT ON COLUMN public.events.location_id IS 'DEPRECATED: replaced by locations (text[]); kept in sync for transition compatibility.';