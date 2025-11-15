import { getRouletteColor } from './rouletteColors';

/**
 * Master data: All numbers by their properties
 */
const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
const BLACK_NUMBERS = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35];
const GREEN_NUMBERS = [0];

const ODD_NUMBERS = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35];
const EVEN_NUMBERS = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36];

const LOW_NUMBERS = Array.from({ length: 18 }, (_, i) => i + 1); // 1-18
const HIGH_NUMBERS = Array.from({ length: 18 }, (_, i) => i + 19); // 19-36

const DOZEN_1 = Array.from({ length: 12 }, (_, i) => i + 1); // 1-12
const DOZEN_2 = Array.from({ length: 12 }, (_, i) => i + 13); // 13-24
const DOZEN_3 = Array.from({ length: 12 }, (_, i) => i + 25); // 25-36

const COLUMN_1 = [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34];
const COLUMN_2 = [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35];
const COLUMN_3 = [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36];

// Streets: Each street is 3 consecutive numbers
const STREETS: { [key: number]: number[] } = {};
for (let i = 1; i <= 12; i++) {
  STREETS[i] = [(i - 1) * 3 + 1, (i - 1) * 3 + 2, (i - 1) * 3 + 3];
}

/**
 * Tag type definitions
 */
export type ColorTag = 'Red' | 'Black' | 'Green';
export type ParityTag = 'Odd' | 'Even';
export type RangeTag = 'Low (1-18)' | 'High (19-36)' | 'Zero';
export type DozenTag = '1st Dozen' | '2nd Dozen' | '3rd Dozen' | 'Zero';
export type ColumnTag = '1st Column' | '2nd Column' | '3rd Column' | 'Zero';
export type StreetTag = string; // e.g., "1st Street", "2nd Street", etc.

export interface TagSet {
  color?: ColorTag;
  parity?: ParityTag;
  range?: RangeTag;
  dozen?: DozenTag;
  column?: ColumnTag;
  street?: StreetTag;
}

/**
 * Get numbers for a single tag
 */
function getNumbersForTag(tag: string, value: string): number[] {
  switch (tag) {
    case 'color':
      if (value === 'Red') return RED_NUMBERS;
      if (value === 'Black') return BLACK_NUMBERS;
      if (value === 'Green') return GREEN_NUMBERS;
      break;
    case 'parity':
      if (value === 'Odd') return ODD_NUMBERS;
      if (value === 'Even') return EVEN_NUMBERS;
      break;
    case 'range':
      if (value === 'Low (1-18)') return LOW_NUMBERS;
      if (value === 'High (19-36)') return HIGH_NUMBERS;
      if (value === 'Zero') return GREEN_NUMBERS;
      break;
    case 'dozen':
      if (value === '1st Dozen') return DOZEN_1;
      if (value === '2nd Dozen') return DOZEN_2;
      if (value === '3rd Dozen') return DOZEN_3;
      if (value === 'Zero') return GREEN_NUMBERS;
      break;
    case 'column':
      if (value === '1st Column') return COLUMN_1;
      if (value === '2nd Column') return COLUMN_2;
      if (value === '3rd Column') return COLUMN_3;
      if (value === 'Zero') return GREEN_NUMBERS;
      break;
    case 'street':
      // Extract street number from "1st Street", "2nd Street", etc.
      const streetMatch = value.match(/(\d+)(st|nd|rd|th) Street/);
      if (streetMatch) {
        const streetNum = parseInt(streetMatch[1], 10);
        return STREETS[streetNum] || [];
      }
      break;
  }
  return [];
}

/**
 * Resolve numbers for a combination of tags (find intersection)
 */
export function resolveEntityNumbers(tags: TagSet): number[] {
  const tagArrays: number[][] = [];

  if (tags.color) {
    tagArrays.push(getNumbersForTag('color', tags.color));
  }
  if (tags.parity) {
    tagArrays.push(getNumbersForTag('parity', tags.parity));
  }
  if (tags.range) {
    tagArrays.push(getNumbersForTag('range', tags.range));
  }
  if (tags.dozen) {
    tagArrays.push(getNumbersForTag('dozen', tags.dozen));
  }
  if (tags.column) {
    tagArrays.push(getNumbersForTag('column', tags.column));
  }
  if (tags.street) {
    tagArrays.push(getNumbersForTag('street', tags.street));
  }

  if (tagArrays.length === 0) {
    return [];
  }

  // Find intersection of all arrays
  return tagArrays.reduce((intersection, currentArray) => {
    return intersection.filter((num) => currentArray.includes(num));
  });
}

/**
 * Generate entity name from tags
 */
export function generateEntityName(tags: TagSet): string {
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
 * Generate all possible trackable entities
 */
export function generateAllTrackableEntities(): Array<{ name: string; tags: TagSet; numbers: number[] }> {
  const entities: Array<{ name: string; tags: TagSet; numbers: number[] }> = [];

  // Single tag entities
  const colors: ColorTag[] = ['Red', 'Black', 'Green'];
  const parities: ParityTag[] = ['Odd', 'Even'];
  const ranges: RangeTag[] = ['Low (1-18)', 'High (19-36)', 'Zero'];
  const dozens: DozenTag[] = ['1st Dozen', '2nd Dozen', '3rd Dozen', 'Zero'];
  const columns: ColumnTag[] = ['1st Column', '2nd Column', '3rd Column', 'Zero'];
  const streets: StreetTag[] = Array.from({ length: 12 }, (_, i) => {
    const num = i + 1;
    const suffix = num === 1 ? 'st' : num === 2 ? 'nd' : num === 3 ? 'rd' : 'th';
    return `${num}${suffix} Street`;
  });

  // Single tags
  colors.forEach((color) => {
    const tags: TagSet = { color };
    const numbers = resolveEntityNumbers(tags);
    if (numbers.length > 0) {
      entities.push({ name: generateEntityName(tags), tags, numbers });
    }
  });

  parities.forEach((parity) => {
    const tags: TagSet = { parity };
    const numbers = resolveEntityNumbers(tags);
    if (numbers.length > 0) {
      entities.push({ name: generateEntityName(tags), tags, numbers });
    }
  });

  ranges.forEach((range) => {
    const tags: TagSet = { range };
    const numbers = resolveEntityNumbers(tags);
    if (numbers.length > 0) {
      entities.push({ name: generateEntityName(tags), tags, numbers });
    }
  });

  dozens.forEach((dozen) => {
    const tags: TagSet = { dozen };
    const numbers = resolveEntityNumbers(tags);
    if (numbers.length > 0) {
      entities.push({ name: generateEntityName(tags), tags, numbers });
    }
  });

  columns.forEach((column) => {
    const tags: TagSet = { column };
    const numbers = resolveEntityNumbers(tags);
    if (numbers.length > 0) {
      entities.push({ name: generateEntityName(tags), tags, numbers });
    }
  });

  // Two-tag combinations
  colors.forEach((color) => {
    parities.forEach((parity) => {
      const tags: TagSet = { color, parity };
      const numbers = resolveEntityNumbers(tags);
      if (numbers.length > 0) {
        entities.push({ name: generateEntityName(tags), tags, numbers });
      }
    });
  });

  colors.forEach((color) => {
    dozens.forEach((dozen) => {
      const tags: TagSet = { color, dozen };
      const numbers = resolveEntityNumbers(tags);
      if (numbers.length > 0) {
        entities.push({ name: generateEntityName(tags), tags, numbers });
      }
    });
  });

  colors.forEach((color) => {
    columns.forEach((column) => {
      const tags: TagSet = { color, column };
      const numbers = resolveEntityNumbers(tags);
      if (numbers.length > 0) {
        entities.push({ name: generateEntityName(tags), tags, numbers });
      }
    });
  });

  parities.forEach((parity) => {
    dozens.forEach((dozen) => {
      const tags: TagSet = { parity, dozen };
      const numbers = resolveEntityNumbers(tags);
      if (numbers.length > 0) {
        entities.push({ name: generateEntityName(tags), tags, numbers });
      }
    });
  });

  parities.forEach((parity) => {
    columns.forEach((column) => {
      const tags: TagSet = { parity, column };
      const numbers = resolveEntityNumbers(tags);
      if (numbers.length > 0) {
        entities.push({ name: generateEntityName(tags), tags, numbers });
      }
    });
  });

  ranges.forEach((range) => {
    columns.forEach((column) => {
      const tags: TagSet = { range, column };
      const numbers = resolveEntityNumbers(tags);
      if (numbers.length > 0) {
        entities.push({ name: generateEntityName(tags), tags, numbers });
      }
    });
  });

  colors.forEach((color) => {
    streets.forEach((street) => {
      const tags: TagSet = { color, street };
      const numbers = resolveEntityNumbers(tags);
      if (numbers.length > 0) {
        entities.push({ name: generateEntityName(tags), tags, numbers });
      }
    });
  });

  parities.forEach((parity) => {
    streets.forEach((street) => {
      const tags: TagSet = { parity, street };
      const numbers = resolveEntityNumbers(tags);
      if (numbers.length > 0) {
        entities.push({ name: generateEntityName(tags), tags, numbers });
      }
    });
  });

  // Three-tag combinations (pinpoints)
  colors.forEach((color) => {
    parities.forEach((parity) => {
      columns.forEach((column) => {
        const tags: TagSet = { color, parity, column };
        const numbers = resolveEntityNumbers(tags);
        if (numbers.length > 0) {
          entities.push({ name: generateEntityName(tags), tags, numbers });
        }
      });
    });
  });

  colors.forEach((color) => {
    parities.forEach((parity) => {
      dozens.forEach((dozen) => {
        const tags: TagSet = { color, parity, dozen };
        const numbers = resolveEntityNumbers(tags);
        if (numbers.length > 0) {
          entities.push({ name: generateEntityName(tags), tags, numbers });
        }
      });
    });
  });

  colors.forEach((color) => {
    parities.forEach((parity) => {
      ranges.forEach((range) => {
        const tags: TagSet = { color, parity, range };
        const numbers = resolveEntityNumbers(tags);
        if (numbers.length > 0) {
          entities.push({ name: generateEntityName(tags), tags, numbers });
        }
      });
    });
  });

  parities.forEach((parity) => {
    ranges.forEach((range) => {
      columns.forEach((column) => {
        const tags: TagSet = { parity, range, column };
        const numbers = resolveEntityNumbers(tags);
        if (numbers.length > 0) {
          entities.push({ name: generateEntityName(tags), tags, numbers });
        }
      });
    });
  });

  return entities;
}

