import * as React from "react";

/**
 * Tokenizes and syntax-highlights code matching the exact LeetCode / VS Code Dark+ theme.
 * Distinguishes:
 * - Comments (# ... in Python/Ruby/Shell, // ... and /* ... * / in C-family): #6a9955 (green italic)
 * - Strings (', ", `, """..."""): #ce9178 (warm orange)
 * - Preprocessor (#include, #define in C/C++): #c586c0 (purple)
 * - Control flow keywords (if, elif, else, for, while, in, return): #c586c0 (purple/pink)
 * - Declaration keywords (def, class, function, const, let, var, import): #569cd6 (blue)
 * - Booleans, Null, Self (True, False, None, true, false, null, self, this): #569cd6 (blue)
 * - Types & Built-ins (Solution, object, int, str, List, TreeNode): #4ec9b0 (teal)
 * - Function & Method calls (isValid, append, values, keys, len): #dcdcaa (yellow)
 * - Numbers (0, 1, -1): #b5cea8 (light green)
 * - Operators (=, !=, ==, //, **, +, -, *, /): #d4d4d4 (light gray)
 * - Variables & Identifiers (stack, bracket, brackets, s): #9cdcfe (light sky blue)
 * - Brackets & Parentheses ((), {}, []): #ffd700 (gold)
 * - Punctuation (:, ,, .): #d4d4d4 (light gray)
 */

export function isHashCommentLanguage(language?: string): boolean {
  if (!language) return false;
  const lang = language.toLowerCase().trim();
  return (
    lang === "python" ||
    lang === "python3" ||
    lang === "py" ||
    lang === "py3" ||
    lang === "python2" ||
    lang === "ruby" ||
    lang === "rb" ||
    lang === "bash" ||
    lang === "sh" ||
    lang === "shell" ||
    lang === "zsh" ||
    lang === "r" ||
    /\bpython[23]?\b/.test(lang) ||
    /\b(py|py3)\b/.test(lang) ||
    lang.startsWith("python")
  );
}

export function isPython(language?: string): boolean {
  return isHashCommentLanguage(language);
}

export function detectLanguageFromCode(code: string): string | undefined {
  if (!code) return undefined;
  if (
    /^\s*def\s+[a-zA-Z_]\w*\s*\([^)]*\)\s*:/m.test(code) ||
    /^\s*class\s+[a-zA-Z_]\w*(?:\s*\([^)]*\))?\s*:/m.test(code) ||
    /^\s*elif\s+/m.test(code) ||
    /\bself\.[a-zA-Z_]\w*/.test(code) ||
    /^\s*from\s+[a-zA-Z_]\w*\s+import\s+/m.test(code) ||
    /^\s*import\s+[a-zA-Z_]\w+/m.test(code)
  ) {
    return "python";
  }
  return undefined;
}

function resolveImplicitPython(line: string): boolean {
  return (
    /^\s*(?:def|class|elif|from|import|raise|pass|with)\b/.test(line) ||
    /\bself\./.test(line) ||
    /\b(True|False|None)\b/.test(line) ||
    /:\s*$/.test(line)
  );
}

// ── Python Tokenizer Regex ───────────────────────────────────────────────────
// Group 1: Comment (# only - NEVER //)
// Group 2: Strings ("...", '...', `...`, """...""", '''...''')
// Group 3: Preprocessor dummy (?!)
// Group 4: Control flow keywords
// Group 5: Declaration keywords
// Group 6: Booleans / Constants (True, False, None, self, cls)
// Group 7: Types & Built-ins (Solution, object, int, str, len, sum, etc.)
// Group 8: Numbers
// Group 9: Function / Method calls
// Group 10: Operators (//, //=, **, **=, +, -, *, /, ==, !=, etc.)
// Group 11: Identifiers
// Group 12: Brackets
// Else: Punctuation
const PYTHON_TOKEN_REGEX =
  /(#.*$)|("""[\s\S]*?"""|'''[\s\S]*?'''|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|((?!))|(\b(?:return|if|elif|else|for|while|in|is|not|and|or|break|continue|yield|try|except|finally|throw|raise|switch|case|default|pass|with|assert)\b)|(\b(?:def|class|import|from|as|global|nonlocal|lambda|function|const|let|var)\b)|(\b(?:True|False|None|self|cls|true|false|null|undefined|this)\b)|(\b(?:Solution|object|int|float|double|bool|boolean|char|str|string|number|any|void|auto|vector|List|Dict|Set|Map|Array|Tuple|Optional|TreeNode|ListNode|Pair|Deque|Queue|Stack|PriorityQueue|StringBuilder|HashMap|HashSet|ArrayList|LinkedList|Long|Integer|Double|Boolean|list|dict|set|tuple|bytes|range|len|print|sum|min|max|abs|all|any|map|filter|zip|enumerate|sorted|reversed)\b)|(\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b)|(\b[a-zA-Z_]\w*(?=\s*\())|(\/\/=?|\*\*=?|<<=?|>>=?|==|!=|<=|>=|[+\-*/%&|^~<>=!]=?|->)|([a-zA-Z_]\w*)|([()[\]{}])|([^\s\w])/g;

// ── C-Family / Default Tokenizer Regex ──────────────────────────────────────
// Group 1: Comment (// and /* */)
// Group 2: Strings
// Group 3: C/C++ Preprocessor directive (#include, #define, etc.)
// Group 4: Control flow keywords
// Group 5: Declaration keywords
// Group 6: Booleans / Constants
// Group 7: Types & Built-ins
// Group 8: Numbers
// Group 9: Function / Method calls
// Group 10: Operators (===, !==, &&, ||, ??, ?., +, -, *, /, ==, !=, etc.)
// Group 11: Identifiers
// Group 12: Brackets
// Else: Punctuation
const DEFAULT_TOKEN_REGEX =
  /(\/\/.*$|\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|(#\s*(?:include|define|undef|ifdef|ifndef|if|elif|else|endif|pragma)\b[^\n]*)|(\b(?:return|if|elif|else|for|while|in|is|not|and|or|break|continue|yield|try|except|catch|finally|throw|raise|switch|case|default)\b)|(\b(?:def|class|function|const|let|var|val|fn|import|from|export|as|new|delete|typeof|instanceof|package|namespace|public|private|protected|static|final|override|struct|enum|interface|type|implements|extends|async|await)\b)|(\b(?:true|false|null|undefined|None|True|False|nil|nullptr|this|self)\b)|(\b(?:Solution|object|int|float|double|bool|boolean|char|str|string|number|any|void|auto|vector|List|Dict|Set|Map|Array|Tuple|Optional|TreeNode|ListNode|Pair|Deque|Queue|Stack|PriorityQueue|StringBuilder|HashMap|HashSet|ArrayList|LinkedList|Long|Integer|Double|Boolean)\b)|(\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b)|(\b[a-zA-Z_]\w*(?=\s*\())|(===|!==|<<=?|>>=?|&&|\|\||\?\?|\?.|==|!=|<=|>=|[+\-*/%&|^~<>=!]=?|->)|([a-zA-Z_]\w*)|([()[\]{}])|([^\s\w])/g;

export function highlightCodeLine(
  line: string,
  language?: string,
): React.ReactNode[] {
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

  // 2. Select appropriate tokenizer for language
  const isPy =
    isHashCommentLanguage(language) ||
    (!language && resolveImplicitPython(contentLine));
  const regex = isPy ? PYTHON_TOKEN_REGEX : DEFAULT_TOKEN_REGEX;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  regex.lastIndex = 0;

  while ((match = regex.exec(contentLine)) !== null) {
    if (match.index > lastIndex) {
      elements.push(contentLine.slice(lastIndex, match.index));
    }

    const text = match[0];
    const key = `${match.index}-${text}-${lastIndex}`;

    if (match[1]) {
      // Comment (# in Python, // or /* */ in C-family) -> #6a9955 (green italic)
      elements.push(
        <span key={key} className="text-[#6a9955] italic">
          {text}
        </span>,
      );
    } else if (match[2]) {
      // String ('...', "...", `...`, """...""") -> #ce9178 (warm orange)
      elements.push(
        <span key={key} className="text-[#ce9178]">
          {text}
        </span>,
      );
    } else if (match[3]) {
      // Preprocessor directive (#include, #define in C/C++) -> #c586c0 (purple)
      elements.push(
        <span key={key} className="text-[#c586c0]">
          {text}
        </span>,
      );
    } else if (match[4]) {
      // Control flow keywords (if, elif, else, for, while, in, return) -> #c586c0 (purple/pink)
      elements.push(
        <span key={key} className="text-[#c586c0]">
          {text}
        </span>,
      );
    } else if (match[5]) {
      // Declaration keywords (def, class, function, const, let, import) -> #569cd6 (blue)
      elements.push(
        <span key={key} className="text-[#569cd6]">
          {text}
        </span>,
      );
    } else if (match[6]) {
      // Booleans & Constants (True, False, None, self, this) -> #569cd6 (blue)
      elements.push(
        <span key={key} className="text-[#569cd6]">
          {text}
        </span>,
      );
    } else if (match[7]) {
      // Types & Built-ins (Solution, object, int, str, List, TreeNode) -> #4ec9b0 (teal)
      elements.push(
        <span key={key} className="text-[#4ec9b0]">
          {text}
        </span>,
      );
    } else if (match[8]) {
      // Numbers (0, 1, -1) -> #b5cea8 (light green)
      elements.push(
        <span key={key} className="text-[#b5cea8]">
          {text}
        </span>,
      );
    } else if (match[9]) {
      // Function Calls & Definitions (isValid, append, values, keys, len) -> #dcdcaa (yellow)
      elements.push(
        <span key={key} className="text-[#dcdcaa]">
          {text}
        </span>,
      );
    } else if (match[10]) {
      // Operators (=, !=, ==, <, >, +, -, *, /, //, **, //=, **=) -> #d4d4d4 (light gray)
      elements.push(
        <span key={key} className="text-[#d4d4d4]">
          {text}
        </span>,
      );
    } else if (match[11]) {
      // Variables & Identifiers (stack, bracket, brackets, s) -> #9cdcfe (light sky blue)
      elements.push(
        <span key={key} className="text-[#9cdcfe]">
          {text}
        </span>,
      );
    } else if (match[12]) {
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

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < contentLine.length) {
    elements.push(contentLine.slice(lastIndex));
  }

  return elements.length > 0 ? elements : [" "];
}
