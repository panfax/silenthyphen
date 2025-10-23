import React, { useState } from 'react';

interface HyphenationBuilderProps {
  word: string;
  onPatternChange: (pattern: string) => void;
  initialPattern?: string;
}

export function HyphenationBuilder({ word, onPatternChange, initialPattern }: HyphenationBuilderProps) {
  // Parse initial pattern to get break positions
  const getInitialBreaks = (): Set<number> => {
    if (!initialPattern) return new Set();

    const breaks = new Set<number>();
    let position = 0;

    for (let i = 0; i < initialPattern.length; i++) {
      if (initialPattern[i] === '\u00AD') {
        breaks.add(position);
      } else {
        position++;
      }
    }

    return breaks;
  };

  const [breaks, setBreaks] = useState<Set<number>>(getInitialBreaks());

  const toggleBreak = (position: number) => {
    const newBreaks = new Set(breaks);

    if (newBreaks.has(position)) {
      newBreaks.delete(position);
    } else {
      newBreaks.add(position);
    }

    setBreaks(newBreaks);

    // Build pattern string with soft hyphens
    let pattern = '';
    for (let i = 0; i < word.length; i++) {
      pattern += word[i];
      if (newBreaks.has(i + 1) && i < word.length - 1) {
        pattern += '\u00AD';
      }
    }

    onPatternChange(pattern);
  };

  if (!word || word.length === 0) {
    return (
      <div className="text-sm text-muted-foreground italic">
        Enter a word above to start building the hyphenation pattern
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium">Click between letters to add break points:</div>

      {/* Interactive word builder */}
      <div className="flex items-center justify-center gap-0 p-4 bg-muted/30 rounded-lg min-h-[60px]">
        {word.split('').map((letter, index) => (
          <React.Fragment key={index}>
            {/* Letter */}
            <span className="text-2xl font-mono font-semibold select-none">
              {letter}
            </span>

            {/* Break point button (not after last letter) */}
            {index < word.length - 1 && (
              <button
                type="button"
                onClick={() => toggleBreak(index + 1)}
                className={`
                  mx-0.5 w-6 h-10 rounded transition-all
                  ${breaks.has(index + 1)
                    ? 'bg-yellow-400 dark:bg-yellow-600 hover:bg-yellow-500 dark:hover:bg-yellow-700 border-2 border-yellow-600 dark:border-yellow-400'
                    : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 border-2 border-transparent'
                  }
                `}
                title={breaks.has(index + 1) ? 'Click to remove break' : 'Click to add break'}
              >
                <span className="text-xs font-bold">
                  {breaks.has(index + 1) ? '|' : '+'}
                </span>
              </button>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Result preview */}
      <div className="text-sm">
        <span className="text-muted-foreground">Result: </span>
        <span className="font-mono font-semibold">
          {word.split('').map((letter, index) => (
            <React.Fragment key={index}>
              {letter}
              {breaks.has(index + 1) && index < word.length - 1 && (
                <span className="bg-yellow-200 dark:bg-yellow-800 px-0.5 font-bold">|</span>
              )}
            </React.Fragment>
          ))}
        </span>
        {breaks.size > 0 && (
          <span className="ml-2 text-green-600 dark:text-green-400 text-xs">
            ✓ {breaks.size} break point{breaks.size !== 1 ? 's' : ''} added
          </span>
        )}
      </div>
    </div>
  );
}
