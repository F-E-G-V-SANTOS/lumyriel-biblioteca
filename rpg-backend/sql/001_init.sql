BEGIN;

CREATE TABLE IF NOT EXISTS rpg_characters (
  character_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  revision INTEGER NOT NULL CHECK (revision >= 1),
  creator_version TEXT NOT NULL,
  character_json JSONB NOT NULL,
  mechanics_json JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_rpg_characters_user ON rpg_characters(user_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS rpg_campaigns (
  campaign_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  campaign_name TEXT NOT NULL,
  character_id TEXT NOT NULL REFERENCES rpg_characters(character_id),
  character_source_revision INTEGER NOT NULL,
  character_snapshot_id TEXT NOT NULL,
  canon_package_id TEXT NOT NULL,
  canon_package_version TEXT NOT NULL,
  canon_policy TEXT NOT NULL CHECK (canon_policy IN ('pinned')),
  situation_id TEXT NOT NULL,
  situation_version INTEGER NOT NULL,
  difficulty_mode TEXT NOT NULL CHECK (difficulty_mode IN ('historia','facil','medio','dificil','lumyriel')),
  duration_mode TEXT NOT NULL CHECK (duration_mode IN ('30','60','90','120','240','continua')),
  campaign_schema_version TEXT NOT NULL,
  state_schema_version TEXT NOT NULL,
  latest_state_version INTEGER NOT NULL,
  latest_event_sequence INTEGER NOT NULL DEFAULT 0,
  latest_checkpoint_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active','archived','abandoned')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_rpg_campaigns_user ON rpg_campaigns(user_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS rpg_character_snapshots (
  snapshot_id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL UNIQUE REFERENCES rpg_campaigns(campaign_id) ON DELETE CASCADE,
  character_id TEXT NOT NULL,
  source_revision INTEGER NOT NULL,
  snapshot_json JSONB NOT NULL,
  mechanics_json JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS rpg_campaign_states (
  campaign_id TEXT PRIMARY KEY REFERENCES rpg_campaigns(campaign_id) ON DELETE CASCADE,
  state_version INTEGER NOT NULL,
  state_json JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS rpg_campaign_events (
  campaign_id TEXT NOT NULL REFERENCES rpg_campaigns(campaign_id) ON DELETE CASCADE,
  event_sequence INTEGER NOT NULL,
  turn_id TEXT,
  operation_id TEXT NOT NULL,
  tool_name TEXT NOT NULL,
  state_version_before INTEGER NOT NULL,
  state_version_after INTEGER NOT NULL,
  arguments_json JSONB NOT NULL,
  result_json JSONB NOT NULL,
  world_time_ref BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (campaign_id, event_sequence),
  UNIQUE (campaign_id, operation_id)
);

CREATE TABLE IF NOT EXISTS rpg_campaign_checkpoints (
  checkpoint_id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL REFERENCES rpg_campaigns(campaign_id) ON DELETE CASCADE,
  state_version INTEGER NOT NULL,
  event_sequence INTEGER NOT NULL,
  state_json JSONB NOT NULL,
  scene_summary TEXT NOT NULL,
  campaign_summary TEXT NOT NULL,
  canon_package_id TEXT NOT NULL,
  canon_package_version TEXT NOT NULL,
  character_snapshot_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_rpg_checkpoints_campaign ON rpg_campaign_checkpoints(campaign_id, created_at DESC);

CREATE TABLE IF NOT EXISTS rpg_situations (
  situation_id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL UNIQUE REFERENCES rpg_campaigns(campaign_id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  public_seed_json JSONB NOT NULL,
  private_truth_json JSONB NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS rpg_turns (
  turn_id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL REFERENCES rpg_campaigns(campaign_id) ON DELETE CASCADE,
  idempotency_key TEXT NOT NULL,
  initial_state_version INTEGER NOT NULL,
  current_state_version INTEGER NOT NULL,
  player_input_json JSONB NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('processing','waiting_model','waiting_tool','completed','recoverable_error','failed')),
  model_response_id TEXT,
  tool_step INTEGER NOT NULL DEFAULT 0,
  final_output_json JSONB,
  error_json JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  UNIQUE (campaign_id, idempotency_key)
);

COMMIT;
