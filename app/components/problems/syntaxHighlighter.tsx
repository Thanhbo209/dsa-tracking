import * as React from "react";

/**
 * Tokenizes and syntax-highlights code matching the exact LeetCode / VS Code Dark+ theme.
 * Distinguishes:
 * - Control flow keywords (if, elif, else, for, while, in, return): #c586c0 (purple/pink)
 * - Declaration keywords (def, class, function, const, let, var, import): #569cd6 (blue)
 * - Booleans, Null, Self (True, False, None, true, false, null, self, this): #569cd6 (blue)
 * - Types & Built-ins (Solution, object, int, str, List, TreeNode): #4ec9b0 (teal)
 * - Function & Method calls (isValid, append, values, keys, len): #dcdcaa (yellow)
 * - Strings ('), '(', "...", `...`): #ce9178 (warm orange)
 * - Numbers (0, 1, -1): #b5cea8 (light green)
 * - Variables & Identifiers (stack, bracket, brackets, s): #9cdcfe (light sky blue)
 * - Brackets & Parentheses ((), {}, []): #ffd700 (gold)
 * - Operators & Punctuation (=, !=, ==, :, ,, .): #d4d4d4 (light gray)
 * - Comments (# ..., // ..., /* ... * /): #6a9955 (green italic)
 */

const TOKEN_REGEX =
  /(\/\/.*$|#.*$|\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|(\b(?:return|if|elif|else|for|while|in|is|not|and|or|break|continue|yield|try|except|catch|finally|throw|raise|switch|case|default)\b)|(\b(?:def|class|function|const|let|var|val|fn|import|from|export|as|new|delete|typeof|instanceof|package|namespace|public|private|protected|static|final|override|struct|enum|interface|type|implements|extends|async|await)\b)|(\b(?:true|false|null|undefined|None|True|False|nil|nullptr|this|self)\b)|(\b(?:object|int|float|double|bool|boolean|char|str|string|number|any|void|auto|vector|List|Dict|Set|Map|Array|Tuple|Optional|TreeNode|ListNode|Pair|Deque|Queue|Stack|PriorityQueue|StringBuilder|HashMap|HashSet|ArrayList|LinkedList|Long|Integer|Double|Boolean)\b)|(\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b)|(\b[a-zA-Z_]\w*(?=\s*\())|([+\-*/%&|^~<>=!]=?|=>|->)|([a-zA-Z_]\w*)|([()[\]{}])|([^\s\w])/g;

export function highlightCodeLine(line: string): React.ReactNode[] {
  if (!line) return [" "];

  // 1. Detect leading indentation spaces for LeetCode-style vertical indent guides
  const leadingMatch = line.match(/^ +/);
  const leadingSpaces = leadingMatch ? leadingMatch[0].length : 0;
  const contentLine = leadingSpaces > 0 ? line.slice(leadingSpaces) : line;

  const elements: React.ReactNode[] = [];

  // Render indent guides for every 4 spaces (exact character width using 4ch)
  if (leadingSpaces > 0) {
    const indentLevels = Math.floor(leadingSpaces / 4);
    const remainder = leadingSpaces % 4;

    for (let i = 0; i < indentLevels; i++) {
      elements.push(
        <span
          key={`indent-${i}`}
          className="inline-block w-[4ch] border-l border-zinc-700/60"
          aria-hidden="true"
        />,
      );
    }

    if (remainder > 0) {
      elements.push(" ".repeat(remainder));
    }
  }

  // 2. Tokenize the remaining line content
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  TOKEN_REGEX.lastIndex = 0;

  while ((match = TOKEN_REGEX.exec(contentLine)) !== null) {
    if (match.index > lastIndex) {
      elements.push(contentLine.slice(lastIndex, match.index));
    }

    const text = match[0];
    const key = `${match.index}-${text}-${lastIndex}`;

    if (match[1]) {
      // Comment
      elements.push(
        <span key={key} className="text-[#6a9955] italic">
          {text}
        </span>,
      );
    } else if (match[2]) {
      // String ('...', "...", `...`)
      elements.push(
        <span key={key} className="text-[#ce9178]">
          {text}
        </span>,
      );
    } else if (match[3]) {
      // Control flow keywords (for, in, if, elif, else, return) -> #c586c0 (pink/purple)
      elements.push(
        <span key={key} className="text-[#c586c0]">
          {text}
        </span>,
      );
    } else if (match[4]) {
      // Declaration keywords (def, class, function, const) -> #569cd6 (blue)
      elements.push(
        <span key={key} className="text-[#569cd6]">
          {text}
        </span>,
      );
    } else if (match[5]) {
      // Booleans & Constants (True, False, None, self, this) -> #569cd6 (blue)
      elements.push(
        <span key={key} className="text-[#569cd6]">
          {text}
        </span>,
      );
    } else if (match[6]) {
      // Types & Classes (object, int, str, Solution) -> #4ec9b0 (teal)
      elements.push(
        <span key={key} className="text-[#4ec9b0]">
          {text}
        </span>,
      );
    } else if (match[7]) {
      // Numbers (0, 1, -1) -> #b5cea8 (light green)
      elements.push(
        <span key={key} className="text-[#b5cea8]">
          {text}
        </span>,
      );
    } else if (match[8]) {
      // Function Calls & Definitions (isValid, append, values, keys, len) -> #dcdcaa (yellow)
      elements.push(
        <span key={key} className="text-[#dcdcaa]">
          {text}
        </span>,
      );
    } else if (match[9]) {
      // Operators (=, !=, ==, <, >, +, -, *, /) -> #d4d4d4
      elements.push(
        <span key={key} className="text-[#d4d4d4]">
          {text}
        </span>,
      );
    } else if (match[10]) {
      // Variables & Identifiers (stack, bracket, brackets, s) -> #9cdcfe (light sky blue)
      elements.push(
        <span key={key} className="text-[#9cdcfe]">
          {text}
        </span>,
      );
    } else if (match[11]) {
      // Brackets ((), {}, []) -> #ffd700 (gold)
      elements.push(
        <span key={key} className="text-[#ffd700]">
          {text}
        </span>,
      );
    } else {
      // Punctuation (:, ,, ;, .) -> #d4d4d4
      elements.push(
        <span key={key} className="text-[#d4d4d4]">
          {text}
        </span>,
      );
    }

    lastIndex = TOKEN_REGEX.lastIndex;
  }

  if (lastIndex < contentLine.length) {
    elements.push(contentLine.slice(lastIndex));
  }

  return elements.length > 0 ? elements : [" "];
}
