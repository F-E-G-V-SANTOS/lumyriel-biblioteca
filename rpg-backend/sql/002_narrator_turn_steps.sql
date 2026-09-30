BEGIN;

CREATE TABLE IF NOT EXISTS rpg_turn_steps (
  turn_id TEXT NOT NULL REFERENCES rpg_turns(turn_id) ON DELETE CASCADE,
  step_index INTEGER NOT NULL CHECK (step_index >= 0),
  response_id TEXT,
  tool_call_id TEXT,
  tool_name TEXT NOT NULL,
  arguments_json JSONB NOT NULL,
  result_json JSONB,
  status TEXT NOT NULL CHECK (status IN ('requested','completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  PRIMARY KEY (turn_id, step_index),
  UNIQUE (turn_id, tool_call_id)
);

CREATE INDEX IF NOT EXISTS idx_rpg_turn_steps_turn_status
  ON rpg_turn_steps(turn_id, status, step_index);

CREATE UNIQUE INDEX IF NOT EXISTS idx_rpg_turns_one_active_per_campaign
  ON rpg_turns(campaign_id)
  WHERE status IN ('processing','waiting_model','waiting_tool');

COMMIT;
