declare module 'hypher' {
  export default class Hypher {
    constructor(patterns: {
      patterns: Record<string, string>;
      leftmin: number;
      rightmin: number;
    });

    hyphenate(word: string): string[];
  }
}
