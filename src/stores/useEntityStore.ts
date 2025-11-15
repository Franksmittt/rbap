import { create } from 'zustand';
import { generateEntityLexicon, EntityDefinition } from '@/utils/entityLexicon';
import { GapAnalysisEngine, GapMap } from './gapAnalysisEngine';

export interface TrackableEntity {
  id: string;
  name: string;
  numbers: number[];
  score: number; // Number of numbers in the group (lower = more pinpointed)
  lastSeenAgo: number; // Spins since last hit
  longestGap: number; // Longest gap in history
  expectedGap: number; // Expected gap (37 / count)
  threshold: number; // Trigger threshold (3x expected gap)
}

interface EntityState {
  entities: TrackableEntity[];
  gapMap: GapMap;
  isInitialized: boolean;
  engine: GapAnalysisEngine;
  initializeEntities: () => void;
  processSpinHistory: (spinHistory: number[]) => void;
  resetEngine: () => void;
  getActiveAlerts: (maxScore?: number) => TrackableEntity[];
}

export const useEntityStore = create<EntityState>((set, get) => ({
  entities: [],
  gapMap: {},
  isInitialized: false,
  engine: new GapAnalysisEngine(),
  initializeEntities: () => {
    if (get().isInitialized) return;

    // Generate the Lexicon of Entities
    const entityDefinitions = generateEntityLexicon();

    // Create trackable entities with calculated thresholds
    const trackableEntities: TrackableEntity[] = entityDefinitions.map((entity) => {
      const expectedGap = 37 / entity.score; // Expected spins between hits
      const threshold = expectedGap * 3; // 3x expected gap as trigger

      return {
        id: entity.id,
        name: entity.name,
        numbers: entity.numbers,
        score: entity.score,
        lastSeenAgo: 0,
        longestGap: 0,
        expectedGap,
        threshold,
      };
    });

    set({
      entities: trackableEntities,
      isInitialized: true,
    });
  },
  processSpinHistory: (spinHistory: number[]) => {
    const state = get();
    if (!state.isInitialized) return;

    // If history is empty, reset everything
    if (spinHistory.length === 0) {
      state.engine.reset();
      const resetEntities = state.entities.map((entity) => ({
        ...entity,
        lastSeenAgo: 0,
        longestGap: 0,
      }));
      set({
        entities: resetEntities,
        gapMap: {},
      });
      return;
    }

    // Use the Gap Analysis Engine to process all entities
    const entitiesForEngine = state.entities.map((e) => ({
      id: e.id,
      numbers: e.numbers,
    }));

    // Process through the engine (Map-Then-Analyze)
    // This processes the ENTIRE history fresh each time
    const gapMap = state.engine.processAllEntities(entitiesForEngine, spinHistory);

    // Update entities with gap data from the engine
    const updatedEntities = state.entities.map((entity) => {
      const gapData = gapMap[entity.id];
      if (gapData) {
        return {
          ...entity,
          lastSeenAgo: gapData.lastSeenAgo,
          longestGap: gapData.longestGap,
        };
      }
      return entity;
    });

    set({
      entities: updatedEntities,
      gapMap,
    });
  },
  resetEngine: () => {
    const state = get();
    state.engine.reset();
    const resetEntities = state.entities.map((entity) => ({
      ...entity,
      lastSeenAgo: 0,
      longestGap: 0,
    }));
    set({
      entities: resetEntities,
      gapMap: {},
    });
  },
  getActiveAlerts: (maxScore = 6) => {
    const state = get();
    return state.entities.filter(
      (entity) => entity.score <= maxScore && entity.lastSeenAgo >= entity.threshold
    );
  },
}));
