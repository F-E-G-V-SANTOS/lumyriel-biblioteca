const LABELS = Object.freeze({
  combate_corpo_a_corpo: 'Combate corpo a corpo',
  combate_distancia: 'Combate à distância',
  praticas_auricas: 'Práticas Áuricas',
  artes_magicas: 'Artes Mágicas',
  runologia: 'Runologia',
  sobrevivencia: 'Sobrevivência',
  oficios: 'Ofícios',
  conhecimentos: 'Conhecimentos',
  influencia: 'Influência',
  atletismo: 'Atletismo'
});

function targetMinutes(durationMode) {
  return durationMode === 'continua' ? null : Number(durationMode);
}

function pacing(durationMode, elapsedSeconds) {
  const target = targetMinutes(durationMode);
  if (!target) return 'desenvolvimento';
  const total = target * 60;
  const ratio = Math.max(0, Math.min(1, elapsedSeconds / total));
  if (ratio < 0.15) return 'abertura';
  if (ratio < 0.65) return 'desenvolvimento';
  if (ratio < 0.80) return 'convergencia';
  if (ratio < 0.95) return 'climax';
  return 'epilogo';
}

function resourceView(resource, value, applicable) {
  if (value && typeof value === 'object') {
    return {
      resource,
      applicable,
      current: Number.isInteger(value.current) ? value.current : null,
      maximum: Number.isInteger(value.maximum) ? value.maximum : null,
      state: value.state == null ? null : String(value.state)
    };
  }
  return { resource, applicable, current: null, maximum: null, state: value == null ? 'nao_calibrado' : String(value) };
}

function injuryView(item, index) {
  return {
    injury_id: String(item?.injury_id || item?.id || `injury-${index + 1}`),
    severity: ['leve','moderado','grave','critico'].includes(item?.severity) ? item.severity : 'leve',
    player_visible_summary: String(item?.player_visible_summary || item?.summary || item?.label || 'Ferimento registrado.')
  };
}

function conditionView(item, index) {
  return {
    condition_id: String(item?.condition_id || item?.id || `condition-${index + 1}`),
    player_visible_summary: String(item?.player_visible_summary || item?.summary || item?.label || item || 'Condição registrada.')
  };
}

function itemView(item, index) {
  return {
    item_id: String(item?.item_id || item?.id || `item-${index + 1}`),
    label: String(item?.label || item?.name || 'Item'),
    quantity: Number.isInteger(item?.quantity) ? item.quantity : 1,
    condition: ['integro','desgastado','danificado','inoperante'].includes(item?.condition) ? item.condition : 'integro',
    relevance: String(item?.relevance || 'presente no inventário')
  };
}

export function buildNarratorTurnContext({ manifest, state, turnId, playerInput, lastNarratorOutput = null }) {
  const elapsedSeconds = Number(state.real_elapsed_time || 0);
  const target = targetMinutes(manifest.duration_mode);
  const manaApplicable = Number(state.competencies?.artes_magicas || 0) > 0;
  const auraApplicable = Number(state.competencies?.praticas_auricas || 0) > 0;
  const source = ['suggested_action','free_action','system_continue'].includes(playerInput?.source)
    ? playerInput.source
    : 'free_action';

  return {
    context_version: '0.1',
    campaign_id: manifest.campaign_id,
    scene_id: `${manifest.situation_id}:scene:${state.state_version}`,
    turn_id: turnId,
    state_version: Number(state.state_version),
    session: {
      difficulty_mode: manifest.difficulty_mode,
      target_minutes: target,
      elapsed_seconds: elapsedSeconds,
      remaining_seconds: target == null ? null : Math.max(0, target * 60 - elapsedSeconds),
      pacing_phase: pacing(manifest.duration_mode, elapsedSeconds)
    },
    player_input: {
      raw_text: String(playerInput?.text || playerInput?.raw_text || ''),
      source,
      selected_action_id: playerInput?.selected_action_id == null ? null : String(playerInput.selected_action_id)
    },
    character_view: {
      character_id: state.character_id,
      display_name: String(state.character_state?.display_name || 'Personagem sem nome'),
      location_id: String(state.current_location?.location_id || state.current_location?.region_id || 'valdren'),
      resources: [
        resourceView('vitalidade', state.resources?.vitalidade, true),
        resourceView('folego', state.resources?.folego, true),
        resourceView('mana', state.resources?.mana, manaApplicable),
        resourceView('aura', state.resources?.aura, auraApplicable)
      ],
      injuries: (state.injuries || []).map(injuryView),
      conditions: (state.conditions || []).map(conditionView),
      relevant_items: (state.inventory || []).slice(0, 12).map(itemView),
      relevant_competencies: Object.entries(state.competencies || {})
        .filter(([,level]) => Number(level) > 0)
        .map(([id,level]) => ({ competence_id: id, label: LABELS[id] || id, level: Number(level), relevance: 'ficha da campanha' })),
      relevant_technique_ids: (state.techniques || []).map(x => String(x?.technique_id || x?.id || x)),
      known_clue_ids: (state.known_clues || []).map(x => String(x?.clue_id || x?.id || x)),
      known_rumor_ids: (state.known_rumors || []).map(x => String(x?.rumor_id || x?.id || x)),
      active_objective_ids: (state.active_objectives || []).map(x => String(x?.objective_id || x?.id || x))
    },
    scene_view: {
      phase: 'abertura',
      player_visible_summary: String(state.scene_summary || ''),
      visible_entity_ids: [],
      spatial_relations: [],
      visible_clock_ids: Object.keys(state.faction_clocks || {})
    },
    canonical_context: [
      {
        ref_id: 'valdren-mvp@0.1',
        domain: 'regiao_mvp',
        authority: 'pacote_rpg',
        summary: 'Valdren é centralidade regional, mercado e nó de redistribuição ligado à hinterlândia, às rotas do Dorso Cinzento e à borda humanizada da Brumamata.',
        limitations: 'Detalhes locais sem autoridade específica devem ser funcionais e de SESSÃO. Não inventar como cânone rua, bairro, ponte, córrego, trilha, mina, posto permanente, coordenada, atalho secreto ou novo assentamento.'
      }
    ],
    roleplay_private_context: [],
    continuity: {
      scene_summary: String(state.scene_summary || ''),
      campaign_summary: String(state.campaign_summary || ''),
      open_hooks: (state.open_hooks || []).map(x => String(x?.summary || x?.label || x))
    },
    last_operation_summary: lastNarratorOutput?.narrative
      ? String(lastNarratorOutput.narrative)
      : lastNarratorOutput?.narrator_output?.narrativa
        ? String(lastNarratorOutput.narrator_output.narrativa)
        : state.last_turn
          ? String(state.scene_summary || 'Há uma operação anterior registrada.')
          : null,
    allowed_tools: ['consultar_estado','realizar_teste']
  };
}

export function readAuthorizedState(state, args) {
  const map = {
    localizacao: () => state.current_location,
    tempo: () => ({ world_time: state.world_time, real_elapsed_time: state.real_elapsed_time }),
    recursos: () => state.resources,
    ferimentos: () => state.injuries,
    condicoes: () => state.conditions,
    inventario: () => state.inventory,
    equipamento: () => state.equipment_condition,
    competencias: () => state.competencies,
    tecnicas: () => state.techniques,
    relacoes: () => state.relationships,
    reputacao: () => state.reputation,
    objetivos: () => state.active_objectives,
    relogios: () => state.faction_clocks,
    fatos: () => (state.session_facts || []).filter(x => x?.player_visible !== false),
    rumores: () => state.known_rumors,
    pistas: () => state.known_clues,
    estado_npc: () => state.npc_states,
    estado_criatura: () => state.creature_states_relevant,
    resumo_cena: () => state.scene_summary,
    resumo_campanha: () => state.campaign_summary
  };
  const result = {};
  for (const field of args.campos || []) {
    if (map[field]) result[field] = map[field]();
  }
  return {
    ok: true,
    perspectiva: args.perspectiva,
    entidades_solicitadas: args.entidades || [],
    state_version: Number(state.state_version),
    dados: result
  };
}
