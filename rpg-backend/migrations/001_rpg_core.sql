BEGIN;

CREATE TABLE IF NOT EXISTS rpg_campaigns (
  campaign_id uuid PRIMARY KEY,
  user_id uuid NOT NULL,
  character_id text NOT NULL,
  character_source_revision integer NOT NULL DEFAULT 1,
  character_snapshot_id text NOT NULL,
  character_snapshot jsonb NOT NULL,
  canon_package_id text NOT NULL,
  canon_package_version text NOT NULL,
  canon_policy text NOT NULL CHECK (canon_policy IN ('pinned','migrate_if_compatible')),
  situation_id text NOT NULL,
  situation_version integer NOT NULL DEFAULT 1,
  difficulty_mode text NOT NULL CHECK (difficulty_mode IN ('historia','facil','medio','dificil','lumyriel')),
  duration_mode text NOT NULL CHECK (duration_mode IN ('30','60','90','120','240','continua')),
  campaign_schema_version text NOT NULL,
  state_schema_version text NOT NULL,
  latest_state_version bigint NOT NULL DEFAULT 1,
  latest_event_sequence bigint NOT NULL DEFAULT 0,
  latest_checkpoint_id uuid,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','completed','abandoned','archived')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  last_played_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS rpg_campaigns_user_last_played_idx
  ON rpg_campaigns (user_id, last_played_at DESC);

CREATE TABLE IF NOT EXISTS rpg_campaign_states (
  campaign_id uuid NOT NULL REFERENCES rpg_campaigns(campaign_id) ON DELETE CASCADE,
  state_version bigint NOT NULL,
  state_json jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (campaign_id, state_version)
);

CREATE TABLE IF NOT EXISTS rpg_campaign_events (
  event_id uuid PRIMARY KEY,
  campaign_id uuid NOT NULL REFERENCES rpg_campaigns(campaign_id) ON DELETE CASCADE,
  sequence bigint NOT NULL,
  turn_id uuid,
  operation_id text NOT NULL,
  tool_name text NOT NULL,
  state_version_before bigint NOT NULL,
  state_version_after bigint NOT NULL,
  arguments_json jsonb NOT NULL,
  result_json jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (campaign_id, sequence),
  UNIQUE (campaign_id, operation_id)
);

CREATE TABLE IF NOT EXISTS rpg_checkpoints (
  checkpoint_id uuid PRIMARY KEY,
  campaign_id uuid NOT NULL REFERENCES rpg_campaigns(campaign_id) ON DELETE CASCADE,
  state_version bigint NOT NULL,
  event_sequence bigint NOT NULL,
  state_json jsonb NOT NULL,
  canon_package_id text NOT NULL,
  canon_package_version text NOT NULL,
  character_snapshot_id text NOT NULL,
  reason text NOT NULL,
  confirmed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS rpg_situations (
  situation_id text PRIMARY KEY,
  campaign_id uuid NOT NULL UNIQUE REFERENCES rpg_campaigns(campaign_id) ON DELETE CASCADE,
  situation_version integer NOT NULL DEFAULT 1,
  public_seed_json jsonb NOT NULL,
  private_truth_json jsonb NOT NULL,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS rpg_turns (
  turn_id uuid PRIMARY KEY,
  campaign_id uuid NOT NULL REFERENCES rpg_campaigns(campaign_id) ON DELETE CASCADE,
  idempotency_key text NOT NULL,
  request_state_version bigint NOT NULL,
  player_input_json jsonb NOT NULL,
  status text NOT NULL CHECK (status IN ('processing','waiting_model','waiting_tool','completed','recoverable_error','failed')),
  model_response_id text,
  tool_step integer NOT NULL DEFAULT 0,
  final_output_json jsonb,
  error_json jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  UNIQUE (campaign_id, idempotency_key)
);

COMMIT;
