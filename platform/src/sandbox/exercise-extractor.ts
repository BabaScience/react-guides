/**
 * Extracts individual exercises from a combined index.tsx file.
 *
 * Exercises are delimited by:
 *   // ============================================
 *   // EXERCISE N: Title
 *   // ============================================
 *
 * Each extracted block includes the docblock, interfaces, and component code
 * belonging to that exercise.
 */

export interface ExtractedExercise {
  number: number;
  title: string;
  code: string;
}

const SEPARATOR = /^\/\/\s*=+\s*$/;
const EXERCISE_HEADER = /^\/\/\s*EXERCISE\s+(\d+)\s*:\s*(.+)$/i;

/**
 * Extract the import line(s) at the top of the file.
 * Everything before the first separator or exercise header.
 */
function extractImports(lines: string[]): string {
  const result: string[] = [];
  for (const line of lines) {
    if (SEPARATOR.test(line.trim()) || EXERCISE_HEADER.test(line.trim())) break;
    result.push(line);
  }
  // Trim trailing blank lines and module-level comments
  while (result.length > 0 && result[result.length - 1].trim() === '') {
    result.pop();
  }
  // Remove the MODULE comment block if present (keep only import lines)
  const importLines: string[] = [];
  let inModuleComment = false;
  for (const line of result) {
    const trimmed = line.trim();
    if (trimmed.startsWith('/**') && !inModuleComment) {
      inModuleComment = true;
      continue;
    }
    if (inModuleComment) {
      if (trimmed.includes('*/')) {
        inModuleComment = false;
      }
      continue;
    }
    if (trimmed.startsWith('import ') || trimmed.startsWith('from ') || trimmed === '') {
      importLines.push(line);
    }
  }
  return importLines.join('\n').trim();
}

/**
 * Split the file into exercise blocks.
 */
export function extractExercises(fullCode: string): ExtractedExercise[] {
  const lines = fullCode.split('\n');
  const exercises: ExtractedExercise[] = [];

  let currentExercise: { number: number; title: string; startLine: number } | null = null;
  let blockStart = -1;

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    const headerMatch = EXERCISE_HEADER.exec(trimmed);

    if (headerMatch) {
      // Save the previous exercise
      if (currentExercise && blockStart >= 0) {
        exercises.push({
          number: currentExercise.number,
          title: currentExercise.title,
          code: extractBlock(lines, blockStart, i),
        });
      }
      currentExercise = {
        number: parseInt(headerMatch[1]),
        title: headerMatch[2].trim(),
      };
      // The block starts after the closing separator line
      // Find the next separator (closing one)
      if (i + 1 < lines.length && SEPARATOR.test(lines[i + 1].trim())) {
        blockStart = i + 2; // skip both header and closing separator
      } else {
        blockStart = i + 1;
      }
    }
  }

  // Don't forget the last exercise
  if (currentExercise && blockStart >= 0) {
    exercises.push({
      number: currentExercise.number,
      title: currentExercise.title,
      code: extractBlock(lines, blockStart, lines.length),
    });
  }

  return exercises;
}

/**
 * Extract lines for a single exercise block, trimming leading/trailing blanks.
 */
function extractBlock(lines: string[], from: number, to: number): string {
  // Walk backwards from `to` to skip separator lines of the next exercise
  let end = to;
  while (end > from) {
    const trimmed = lines[end - 1].trim();
    if (SEPARATOR.test(trimmed) || trimmed === '') {
      end--;
    } else {
      break;
    }
  }

  const block = lines.slice(from, end);

  // Trim leading empty lines
  while (block.length > 0 && block[0].trim() === '') {
    block.shift();
  }

  return block.join('\n');
}

/**
 * Get the import header for the file (to prepend to each exercise).
 */
export function getImportHeader(fullCode: string): string {
  return extractImports(fullCode.split('\n'));
}

/**
 * Build a single exercise's standalone code (imports + exercise body).
 */
export function buildExerciseCode(fullCode: string, exerciseNumber: number): string {
  const imports = getImportHeader(fullCode);
  const exercises = extractExercises(fullCode);
  const exercise = exercises.find((e) => e.number === exerciseNumber);
  if (!exercise) return fullCode; // fallback to full file
  return `${imports}\n\n${exercise.code}\n`;
}

/**
 * Reassemble the full file by replacing one exercise's code with the user's version.
 * This is needed for test execution since tests import from `./index` which
 * expects all exports to be present.
 */
export function reassembleFullCode(
  originalFullCode: string,
  exerciseNumber: number,
  userExerciseCode: string
): string {
  const imports = getImportHeader(originalFullCode);
  const exercises = extractExercises(originalFullCode);

  const parts = exercises.map((ex) => {
    const header = `// ============================================\n// EXERCISE ${ex.number}: ${ex.title}\n// ============================================\n`;
    if (ex.number === exerciseNumber) {
      return header + '\n' + userExerciseCode;
    }
    return header + '\n' + ex.code;
  });

  return `${imports}\n\n${parts.join('\n\n')}\n`;
}
