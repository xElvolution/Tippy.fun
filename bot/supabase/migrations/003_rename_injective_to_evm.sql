-- Existing deployments: rename custody column from Injective (bech32) to Conflux eSpace (0x).
-- New installs that only ran 001_initial.sql already have evm_address; this is a no-op when the old column is absent.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'injective_address'
  ) THEN
    ALTER TABLE public.users RENAME COLUMN injective_address TO evm_address;
  END IF;
END $$;

ALTER TABLE public.tips ALTER COLUMN denom SET DEFAULT 'cfx';

COMMENT ON TABLE public.users IS 'Custodial Conflux eSpace users; keys encrypted at rest';
