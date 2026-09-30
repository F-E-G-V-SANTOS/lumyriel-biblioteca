const STATE_FIELD_MAP = {
  localizacao: ['current_location_id'],
  tempo: ['world_time', 'timing'],
  recursos: ['character.resources', 'character.vitality', 'character.vitality_max'],
  ferimentos: ['injuries'],
  condicoes: ['conditions'],
  inventario: ['inventory'],
  equipamento: ['equipment_condition'],
  competencias: ['competencies', 'practice_marks'],
  tecnicas: ['techniques'],
  relacoes: ['relationships'],
  reputacao: ['reputation'],
  objetivos: ['objectives'],
  relogios: ['clocks'],
  fatos: ['session_facts'],
  rumores: ['rumors'],
  pistas: ['clues'],
  estado_npc: ['npc_states'],
  estado_criatura: ['creature_states'],
  resumo_cena: ['scene_summary'],
  resumo_campanha: ['campaign_summary'],
};

function pickPath(source, path) {
  const parts = path.split('.');
  let current = source;
  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    current = current[part];
  }
  return current;
}

function assignPath(target, path, value) {
  if (value === undefined) return;
  const parts = path.split('.');
  let current = target;
  for (let i = 0; i < parts.length - 1; i += 1) {
    current[parts[i]] ??= {};
    current = current[parts[i]];
  }
  current[parts.at(-1)] = structuredClone(value);
}

export function queryStateSlice(state, { entidades = [], campos, perspectiva }) {
  const result = {
    state_version: state.state_version,
    perspectiva,
    entidades_solicitadas: entidades,
    dados: {},
  };

  for (const field of campos) {
    const paths = STATE_FIELD_MAP[field] ?? [];
    for (const path of paths) {
      assignPath(result.dados, path, pickPath(state, path));
    }
  }

  if (perspectiva === 'personagem') {
    // MVP: hidden engine-only structures never enter the player perspective.
    delete result.dados.private_truth;
  }

  return result;
}

export function buildNarratorTurnContext({ state, playerInput, turnId, sceneId = 'scene:mvp', lastOperationSummary = null }) {
  return {
    context_version: 'rpg-narrator-turn-context-0.1',
    campaign_id: state.campaign_id,
    scene_id: sceneId,
    turn_id: turnId,
    state_version: state.state_version,
    session: {
      difficulty_mode: state.difficulty_mode,
      target_minutes: state.timing.target_minutes,
      elapsed_seconds: state.timing.elapsed_seconds,
      remaining_seconds: state.timing.remaining_seconds,
      pacing_phase: state.timing.pacing_phase,
    },
    player_input: {
      raw_text: playerInput.raw_text,
      source: playerInput.source,
      selected_action_id: playerInput.selected_action_id,
    },
    character_view: {
      character_id: state.character.character_id,
      attributes: structuredClone(state.character.attributes),
      vitality: state.character.vitality,
      vitality_max: state.character.vitality_max,
      resources: structuredClone(state.character.resources),
      injuries: structuredClone(state.injuries),
      conditions: structuredClone(state.conditions),
      competencies: structuredClone(state.competencies),
      techniques: structuredClone(state.techniques),
      inventory: structuredClone(state.inventory),
    },
    scene_view: {
      current_location_id: state.current_location_id,
      world_time: structuredClone(state.world_time),
      player_visible_summary: state.scene_summary,
      visible_entity_ids: [],
      spatial_relations: [],
      visible_clock_ids: state.clocks.filter((c) => c.visibility !== 'oculto').map((c) => c.clock_id),
    },
    canonical_context: state.canonical_context_refs.map((refId) => ({
      ref_id: refId,
      domain: 'mvp_regional',
      authority: 'pacote_rpg',
      summary: 'Referência canônica pinada para a campanha; consultar somente pelos dados publicados no backend.',
      limitations: 'Este contexto mínimo não autoriza criar novos fatos canônicos, topônimos permanentes ou instituições.',
    })),
    roleplay_private_context: [],
    continuity: {
      scene_summary: state.scene_summary,
      campaign_summary: state.campaign_summary,
      open_hooks: structuredClone(state.open_hooks),
    },
    last_operation_summary: lastOperationSummary,
    allowed_tools: ['consultar_estado', 'realizar_teste'],
  };
}
