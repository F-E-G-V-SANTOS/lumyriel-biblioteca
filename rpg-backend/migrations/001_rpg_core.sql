BEGIN;

CREATE TABLE rpg_campaigns (
  campaign_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  character_id TEXT NOT NULL,
  character_source_revision INTEGER NOT NULL CHECK (character_source_revision >= 0),
  character_snapshot_id TEXT NOT NULL UNIQUE,
  canon_package_id TEXT NOT NULL,
  canon_package_version TEXT NOT NULL,
  canon_policy TEXT NOT NULL CHECK (canon_policy IN ('pinned', 'migrate_if_compatible')),
  situation_id TEXT NOT NULL,
  situation_version INTEGER NOT NULL CHECK (situation_version >= 1),
  difficulty_mode TEXT NOT NULL CHECK (difficulty_mode IN ('historia', 'facil', 'medio', 'dificil', 'lumyriel')),
  duration_mode TEXT NOT NULL CHECK (duration_mode IN ('30', '60', '90', '120', '240', 'continua')),
  campaign_schema_version TEXT NOT NULL,
  state_schema_version TEXT NOT NULL,
  latest_state_version INTEGER NOT NULL CHECK (latest_state_version >= 0),
  latest_event_sequence BIGINT NOT NULL CHECK (latest_event_sequence >= 0),
  latest_checkpoint_id TEXT,
  status TEXT NOT NULL CHECK (status IN ('active', 'completed', 'abandoned', 'archived', 'repair_required')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_played_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE rpg_character_snapshots (
  character_snapshot_id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL UNIQUE REFERENCES rpg_campaigns(campaign_id) ON DELETE CASCADE,
  character_id TEXT NOT NULL,
  source_revision INTEGER NOT NULL CHECK (source_revision >= 0),
  snapshot_json JSONB NOT NULL CHECK (jsonb_typeof(snapshot_json) = 'object'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE rpg_campaigns
  ADD CONSTRAINT rpg_campaigns_character_snapshot_fk
  FOREIGN KEY (character_snapshot_id)
  REFERENCES rpg_character_snapshots(character_snapshot_id)
  DEFERRABLE INITIALLY DEFERRED;

CREATE TABLE rpg_campaign_states (
  campaign_id TEXT PRIMARY KEY REFERENCES rpg_campaigns(campaign_id) ON DELETE CASCADE,
  state_version INTEGER NOT NULL CHECK (state_version >= 0),
  state_json JSONB NOT NULL CHECK (jsonb_typeof(state_json) = 'object'),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE rpg_campaign_events (
  campaign_id TEXT NOT NULL REFERENCES rpg_campaigns(campaign_id) ON DELETE CASCADE,
  event_sequence BIGINT NOT NULL CHECK (event_sequence >= 1),
  turn_id TEXT,
  operation_id TEXT NOT NULL,
  tool_name TEXT NOT NULL,
  state_version_before INTEGER NOT NULL CHECK (state_version_before >= 0),
  state_version_after INTEGER NOT NULL CHECK (state_version_after >= state_version_before),
  arguments_json JSONB NOT NULL CHECK (jsonb_typeof(arguments_json) = 'object'),
  result_json JSONB NOT NULL CHECK (jsonb_typeof(result_json) = 'object'),
  world_time_ref TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (campaign_id, event_sequence),
  UNIQUE (campaign_id, operation_id)
);

CREATE TABLE rpg_checkpoints (
  checkpoint_id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL REFERENCES rpg_campaigns(campaign_id) ON DELETE CASCADE,
  state_version INTEGER NOT NULL CHECK (state_version >= 0),
  event_sequence BIGINT NOT NULL CHECK (event_sequence >= 0),
  state_json JSONB NOT NULL CHECK (jsonb_typeof(state_json) = 'object'),
  scene_summary TEXT NOT NULL DEFAULT '',
  campaign_summary TEXT NOT NULL DEFAULT '',
  canon_package_id TEXT NOT NULL,
  canon_package_version TEXT NOT NULL,
  character_snapshot_id TEXT NOT NULL REFERENCES rpg_character_snapshots(character_snapshot_id),
  reason TEXT NOT NULL CHECK (reason IN ('scene_end', 'high_impact', 'long_transition', 'session_exit', 'periodic', 'manual')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  confirmed BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE (campaign_id, state_version, event_sequence)
);

ALTER TABLE rpg_campaigns
  ADD CONSTRAINT rpg_campaigns_latest_checkpoint_fk
  FOREIGN KEY (latest_checkpoint_id)
  REFERENCES rpg_checkpoints(checkpoint_id)
  DEFERRABLE INITIALLY DEFERRED;

CREATE TABLE rpg_situations (
  situation_id TEXT NOT NULL,
  campaign_id TEXT NOT NULL REFERENCES rpg_campaigns(campaign_id) ON DELETE CASCADE,
  version INTEGER NOT NULL CHECK (version >= 1),
  public_seed_json JSONB NOT NULL CHECK (jsonb_typeof(public_seed_json) = 'object'),
  private_truth_json JSONB NOT NULL CHECK (jsonb_typeof(private_truth_json) = 'object'),
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (campaign_id, situation_id, version)
);

ALTER TABLE rpg_campaigns
  ADD CONSTRAINT rpg_campaigns_situation_fk
  FOREIGN KEY (campaign_id, situation_id, situation_version)
  REFERENCES rpg_situations(campaign_id, situation_id, version)
  DEFERRABLE INITIALLY DEFERRED;

CREATE TABLE rpg_session_entities (
  entity_id TEXT NOT NULL,
  campaign_id TEXT NOT NULL REFERENCES rpg_campaigns(campaign_id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  origin TEXT NOT NULL CHECK (origin IN ('SESSION', 'PLAYER')),
  public_state_json JSONB NOT NULL CHECK (jsonb_typeof(public_state_json) = 'object'),
  private_state_json JSONB NOT NULL CHECK (jsonb_typeof(private_state_json) = 'object'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (campaign_id, entity_id)
);

CREATE TABLE rpg_turns (
  turn_id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL REFERENCES rpg_campaigns(campaign_id) ON DELETE CASCADE,
  idempotency_key TEXT NOT NULL,
  initial_state_version INTEGER NOT NULL CHECK (initial_state_version >= 0),
  current_state_version INTEGER NOT NULL CHECK (current_state_version >= initial_state_version),
  player_input_json JSONB NOT NULL CHECK (jsonb_typeof(player_input_json) = 'object'),
  status TEXT NOT NULL CHECK (status IN ('processing', 'waiting_model', 'waiting_tool', 'completed', 'recoverable_error', 'failed')),
  model_response_id TEXT,
  tool_step INTEGER NOT NULL DEFAULT 0 CHECK (tool_step >= 0),
  final_output_json JSONB,
  error_json JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE (campaign_id, idempotency_key),
  UNIQUE (campaign_id, turn_id)
);

ALTER TABLE rpg_campaign_events
  ADD CONSTRAINT rpg_campaign_events_turn_fk
  FOREIGN KEY (campaign_id, turn_id)
  REFERENCES rpg_turns(campaign_id, turn_id)
  DEFERRABLE INITIALLY DEFERRED;

CREATE INDEX rpg_campaigns_user_status_idx
  ON rpg_campaigns(user_id, status, last_played_at DESC);

CREATE INDEX rpg_events_campaign_created_idx
  ON rpg_campaign_events(campaign_id, created_at);

CREATE INDEX rpg_checkpoints_campaign_confirmed_idx
  ON rpg_checkpoints(campaign_id, confirmed, state_version DESC);

CREATE INDEX rpg_turns_campaign_created_idx
  ON rpg_turns(campaign_id, created_at DESC);

COMMIT;
