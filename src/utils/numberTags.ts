import { getRouletteColor } from './rouletteColors';

export interface NumberTags {
  color: 'Red' | 'Black' | 'Green';
  parity: 'Odd' | 'Even';
  range: 'Low (1-18)' | 'High (19-36)' | 'Zero';
  dozen: '1st Dozen' | '2nd Dozen' | '3rd Dozen' | 'Zero';
  column: '1st Column' | '2nd Column' | '3rd Column' | 'Zero';
  street: string; // e.g., "1st Street", "5th Street", etc.
}

/**
 * Gets all tags/properties for a roulette number
 */
export function getNumberTags(num: number): NumberTags {
  // Color
  const colorValue = getRouletteColor(num);
  const color = colorValue === 'red' ? 'Red' : colorValue === 'black' ? 'Black' : 'Green';

  // Parity (Odd/Even)
  const parity = num === 0 ? 'Even' : num % 2 === 0 ? 'Even' : 'Odd';

  // Range (Low/High)
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

  // Column (based on position in 3x12 grid)
  // Column 1: 1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34
  // Column 2: 2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35
  // Column 3: 3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36
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

  // Street (Row in 3x12 grid)
  // Street 1: 1, 2, 3
  // Street 2: 4, 5, 6
  // ... Street 12: 34, 35, 36
  let street: string;
  if (num === 0) {
    street = 'Zero';
  } else {
    const streetNum = Math.ceil(num / 3);
    const suffix = streetNum === 1 ? 'st' : streetNum === 2 ? 'nd' : streetNum === 3 ? 'rd' : 'th';
    street = `${streetNum}${suffix} Street`;
  }

  return {
    color,
    parity,
    range,
    dozen,
    column,
    street,
  };
}

