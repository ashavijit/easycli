/**
 * Calculates Levenshtein distance between two strings.
 * Used for suggesting similar flags/commands when user makes typos.
 */
function levenshtein(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0]![j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i]![j] = matrix[i - 1]![j - 1]!;
      } else {
        matrix[i]![j] = Math.min(
          matrix[i - 1]![j - 1]! + 1, // substitution
          matrix[i]![j - 1]! + 1,     // insertion
          matrix[i - 1]![j]! + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length]![a.length]!;
}

/**
 * Suggests similar strings from a list based on Levenshtein distance.
 *
 * @param input - The user's input (possibly a typo).
 * @param candidates - List of valid options.
 * @param maxDistance - Maximum edit distance to consider (default: 3).
 * @returns The best matching candidate, or null if none found.
 */
export function suggestSimilar(
  input: string,
  candidates: string[],
  maxDistance = 3
): string | null {
  let best: string | null = null;
  let bestDistance = maxDistance + 1;

  for (const candidate of candidates) {
    const distance = levenshtein(input.toLowerCase(), candidate.toLowerCase());
    if (distance < bestDistance) {
      best = candidate;
      bestDistance = distance;
    }
  }

  return bestDistance <= maxDistance ? best : null;
}

/**
 * Formats a missing argument error with valid values.
 *
 * @param argName - The name of the missing argument.
 * @param validValues - Optional list of valid values.
 * @returns Formatted error message.
 */
export function formatMissingArg(
  argName: string,
  validValues?: string[]
): string {
  let message = `Missing required argument: ${argName}`;
  if (validValues && validValues.length > 0) {
    message += `\nValid values: ${validValues.join(", ")}`;
  }
  return message;
}

/**
 * Formats an unknown flag error with a suggestion.
 *
 * @param flag - The unknown flag the user provided.
 * @param validFlags - List of valid flag names.
 * @returns Formatted error message with suggestion if found.
 */
export function formatUnknownFlag(
  flag: string,
  validFlags: string[]
): string {
  let message = `Unknown flag --${flag}`;
  const suggestion = suggestSimilar(flag, validFlags);
  if (suggestion) {
    message += `\nDid you mean --${suggestion}?`;
  }
  return message;
}
