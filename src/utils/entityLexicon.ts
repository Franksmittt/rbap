/**
 * The "Lexicon of Entities" - The Definitions
 * This is where we define WHAT we want to track
 * Uses the "Single Source of Truth" to resolve all combinations
 */

import { resolveNumbersByTags, NumberProperties } from '@/data/masterDataTable';

export interface EntityDefinition {
  id: string;
  name: string;
  tags: Partial<NumberProperties>;
  numbers: number[]; // Resolved from tags using master table
  score: number; // Number of numbers in the group (lower = more pinpointed)
}

/**
 * Generate entity name from tags
 */
function generateEntityName(tags: Partial<NumberProperties>): string {
  const parts: string[] = [];
  if (tags.color) parts.push(tags.color);
  if (tags.parity) parts.push(tags.parity);
  if (tags.range) parts.push(tags.range);
  if (tags.dozen) parts.push(tags.dozen);
  if (tags.column) parts.push(tags.column);
  if (tags.street) parts.push(tags.street);
  return parts.join(' ');
}

/**
 * Create an entity definition (DEFINE -> RESOLVE -> CREATE)
 */
function createEntity(tags: Partial<NumberProperties>): EntityDefinition | null {
  // RESOLVE: Query the master table to find intersection
  const numbers = resolveNumbersByTags(tags);
  
  // Only create entity if it has numbers
  if (numbers.length === 0) return null;

  const name = generateEntityName(tags);
  const id = name.toLowerCase().replace(/\s+/g, '_');

  return {
    id,
    name,
    tags,
    numbers,
    score: numbers.length,
  };
}

/**
 * Generate all trackable entities (The Lexicon)
 * This populates the complete list of entities to track
 */
export function generateEntityLexicon(): EntityDefinition[] {
  const entities: EntityDefinition[] = [];

  // Single tag entities
  const colors: Array<'Red' | 'Black' | 'Green'> = ['Red', 'Black', 'Green'];
  const parities: Array<'Odd' | 'Even'> = ['Odd', 'Even'];
  const ranges: Array<'Low (1-18)' | 'High (19-36)' | 'Zero'> = ['Low (1-18)', 'High (19-36)', 'Zero'];
  const dozens: Array<'1st Dozen' | '2nd Dozen' | '3rd Dozen' | 'Zero'> = ['1st Dozen', '2nd Dozen', '3rd Dozen', 'Zero'];
  const columns: Array<'1st Column' | '2nd Column' | '3rd Column' | 'Zero'> = ['1st Column', '2nd Column', '3rd Column', 'Zero'];
  const streets: string[] = Array.from({ length: 12 }, (_, i) => {
    const num = i + 1;
    const suffix = num === 1 ? 'st' : num === 2 ? 'nd' : num === 3 ? 'rd' : 'th';
    return `${num}${suffix} Street`;
  });

  // Single tags
  colors.forEach((color) => {
    const entity = createEntity({ color });
    if (entity) entities.push(entity);
  });

  parities.forEach((parity) => {
    const entity = createEntity({ parity });
    if (entity) entities.push(entity);
  });

  ranges.forEach((range) => {
    const entity = createEntity({ range });
    if (entity) entities.push(entity);
  });

  dozens.forEach((dozen) => {
    const entity = createEntity({ dozen });
    if (entity) entities.push(entity);
  });

  columns.forEach((column) => {
    const entity = createEntity({ column });
    if (entity) entities.push(entity);
  });

  // Two-tag combinations
  colors.forEach((color) => {
    parities.forEach((parity) => {
      const entity = createEntity({ color, parity });
      if (entity) entities.push(entity);
    });
  });

  colors.forEach((color) => {
    dozens.forEach((dozen) => {
      const entity = createEntity({ color, dozen });
      if (entity) entities.push(entity);
    });
  });

  colors.forEach((color) => {
    columns.forEach((column) => {
      const entity = createEntity({ color, column });
      if (entity) entities.push(entity);
    });
  });

  parities.forEach((parity) => {
    dozens.forEach((dozen) => {
      const entity = createEntity({ parity, dozen });
      if (entity) entities.push(entity);
    });
  });

  parities.forEach((parity) => {
    columns.forEach((column) => {
      const entity = createEntity({ parity, column });
      if (entity) entities.push(entity);
    });
  });

  ranges.forEach((range) => {
    columns.forEach((column) => {
      const entity = createEntity({ range, column });
      if (entity) entities.push(entity);
    });
  });

  colors.forEach((color) => {
    streets.forEach((street) => {
      const entity = createEntity({ color, street });
      if (entity) entities.push(entity);
    });
  });

  parities.forEach((parity) => {
    streets.forEach((street) => {
      const entity = createEntity({ parity, street });
      if (entity) entities.push(entity);
    });
  });

  // Three-tag combinations (pinpoints)
  colors.forEach((color) => {
    parities.forEach((parity) => {
      columns.forEach((column) => {
        const entity = createEntity({ color, parity, column });
        if (entity) entities.push(entity);
      });
    });
  });

  colors.forEach((color) => {
    parities.forEach((parity) => {
      dozens.forEach((dozen) => {
        const entity = createEntity({ color, parity, dozen });
        if (entity) entities.push(entity);
      });
    });
  });

  colors.forEach((color) => {
    parities.forEach((parity) => {
      ranges.forEach((range) => {
        const entity = createEntity({ color, parity, range });
        if (entity) entities.push(entity);
      });
    });
  });

  parities.forEach((parity) => {
    ranges.forEach((range) => {
      columns.forEach((column) => {
        const entity = createEntity({ parity, range, column });
        if (entity) entities.push(entity);
      });
    });
  });

  return entities;
}

