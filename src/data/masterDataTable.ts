/**
 * The "Single Source of Truth" - Master Data Table
 * Each number (0-36) mapped to ALL of its properties
 * This is the foundational "ground truth" for all logic
 */

export interface NumberProperties {
  number: number;
  color: 'Red' | 'Black' | 'Green';
  parity: 'Odd' | 'Even';
  range: 'Low (1-18)' | 'High (19-36)' | 'Zero';
  dozen: '1st Dozen' | '2nd Dozen' | '3rd Dozen' | 'Zero';
  column: '1st Column' | '2nd Column' | '3rd Column' | 'Zero';
  street: string; // e.g., "1st Street", "2nd Street", etc.
}

/**
 * Master Data Table - The Single Source of Truth
 * Query this table to resolve any tag combination
 */
export const MASTER_DATA_TABLE: NumberProperties[] = [];

// Generate the complete master table
for (let num = 0; num <= 36; num++) {
  // Color
  let color: 'Red' | 'Black' | 'Green';
  if (num === 0) {
    color = 'Green';
  } else {
    const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
    color = redNumbers.includes(num) ? 'Red' : 'Black';
  }

  // Parity
  const parity: 'Odd' | 'Even' = num === 0 ? 'Even' : num % 2 === 0 ? 'Even' : 'Odd';

  // Range
  let range: 'Low (1-18)' | 'High (19-36)' | 'Zero';
  if (num === 0) {
    range = 'Zero';
  } else if (num >= 1 && num <= 18) {
    range = 'Low (1-18)';
  } else {
    range = 'High (19-36)';
  }

  // Dozen
  let dozen: '1st Dozen' | '2nd Dozen' | '3rd Dozen' | 'Zero';
  if (num === 0) {
    dozen = 'Zero';
  } else if (num >= 1 && num <= 12) {
    dozen = '1st Dozen';
  } else if (num >= 13 && num <= 24) {
    dozen = '2nd Dozen';
  } else {
    dozen = '3rd Dozen';
  }

  // Column
  let column: '1st Column' | '2nd Column' | '3rd Column' | 'Zero';
  if (num === 0) {
    column = 'Zero';
  } else {
    const column1 = [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34];
    const column2 = [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35];
    if (column1.includes(num)) {
      column = '1st Column';
    } else if (column2.includes(num)) {
      column = '2nd Column';
    } else {
      column = '3rd Column';
    }
  }

  // Street
  let street: string;
  if (num === 0) {
    street = 'Zero';
  } else {
    const streetNum = Math.ceil(num / 3);
    const suffix = streetNum === 1 ? 'st' : streetNum === 2 ? 'nd' : streetNum === 3 ? 'rd' : 'th';
    street = `${streetNum}${suffix} Street`;
  }

  MASTER_DATA_TABLE.push({
    number: num,
    color,
    parity,
    range,
    dozen,
    column,
    street,
  });
}

/**
 * Query the master table to find numbers matching specific tag criteria
 * This is the "RESOLVE" step in the Define-Resolve-Track pipeline
 */
export function resolveNumbersByTags(tags: Partial<NumberProperties>): number[] {
  return MASTER_DATA_TABLE.filter((entry) => {
    if (tags.color && entry.color !== tags.color) return false;
    if (tags.parity && entry.parity !== tags.parity) return false;
    if (tags.range && entry.range !== tags.range) return false;
    if (tags.dozen && entry.dozen !== tags.dozen) return false;
    if (tags.column && entry.column !== tags.column) return false;
    if (tags.street && entry.street !== tags.street) return false;
    return true;
  }).map((entry) => entry.number);
}

/**
 * Get all properties for a specific number
 */
export function getNumberProperties(number: number): NumberProperties | undefined {
  return MASTER_DATA_TABLE.find((entry) => entry.number === number);
}

