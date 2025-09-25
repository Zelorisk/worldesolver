class WordleSolver {
  constructor() {
    this.wordsManager = new WordsManager();
    this.allWords = [];
    this.answerWords = [];
    this.possibleWords = [];
    this.guesses = [];
    this.letterFrequency = {};
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    await this.wordsManager.initialize();
    this.allWords = await this.wordsManager.getAllWords();
    this.answerWords = await this.wordsManager.getAnswerWords();
    this.possibleWords = [...this.answerWords]; // Start with answer words only
    this.letterFrequency = this.calculateLetterFrequency();
    this.initialized = true;
  }

  async ensureInitialized() {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  calculateLetterFrequency() {
    const frequency = {};
    const alphabet = "abcdefghijklmnopqrstuvwxyz";

    for (let letter of alphabet) {
      frequency[letter] = 0;
    }

    for (let word of this.possibleWords) {
      for (let letter of word.toLowerCase()) {
        frequency[letter]++;
      }
    }

    return frequency;
  }

  calculateWordScore(word) {
    let score = 0;
    const usedLetters = new Set();

    for (let letter of word.toLowerCase()) {
      if (!usedLetters.has(letter)) {
        score += this.letterFrequency[letter] || 0;
        usedLetters.add(letter);
      }
    }

    // Bonus for common starting letters
    const firstLetter = word.toLowerCase()[0];
    const commonStarters = ["s", "c", "b", "p", "t", "f", "g", "d", "m", "h"];
    if (commonStarters.includes(firstLetter)) {
      score += 10;
    }

    return score;
  }

  addGuess(word, feedback) {
    this.guesses.push({ word: word.toLowerCase(), feedback });
    this.updatePossibleWords();
  }

  updatePossibleWords() {
    this.possibleWords = this.answerWords.filter((word) => {
      return this.guesses.every((guess) => this.isWordCompatible(word, guess));
    });

    // Recalculate letter frequency with updated possible words
    this.letterFrequency = this.calculateLetterFrequency();
  }

  isWordCompatible(word, guess) {
    const wordLower = word.toLowerCase();
    const guessWord = guess.word.toLowerCase();
    const feedback = guess.feedback;

    // Count letters in both words
    const wordLetterCount = {};
    const guessLetterCount = {};

    for (let letter of wordLower) {
      wordLetterCount[letter] = (wordLetterCount[letter] || 0) + 1;
    }

    for (let letter of guessWord) {
      guessLetterCount[letter] = (guessLetterCount[letter] || 0) + 1;
    }

    // First pass: check correct positions
    for (let i = 0; i < 5; i++) {
      const guessLetter = guessWord[i];
      const wordLetter = wordLower[i];
      const status = feedback[i];

      if (status === "correct") {
        if (wordLetter !== guessLetter) {
          return false;
        }
      }
    }

    // Second pass: check present/absent with proper letter counting
    const requiredLetters = {};
    const forbiddenLetters = new Set();

    for (let i = 0; i < 5; i++) {
      const guessLetter = guessWord[i];
      const status = feedback[i];

      if (status === "correct") {
        requiredLetters[guessLetter] = (requiredLetters[guessLetter] || 0) + 1;
      } else if (status === "present") {
        requiredLetters[guessLetter] = (requiredLetters[guessLetter] || 0) + 1;
        // Letter must not be in this position
        if (wordLower[i] === guessLetter) {
          return false;
        }
      } else if (status === "absent") {
        // Count how many of this letter are marked as correct or present
        let requiredCount = 0;
        for (let j = 0; j < 5; j++) {
          if (
            guessWord[j] === guessLetter &&
            (feedback[j] === "correct" || feedback[j] === "present")
          ) {
            requiredCount++;
          }
        }

        if (requiredCount === 0) {
          // Letter should not appear at all
          forbiddenLetters.add(guessLetter);
        } else {
          // Letter should appear exactly requiredCount times
          if ((wordLetterCount[guessLetter] || 0) !== requiredCount) {
            return false;
          }
        }
      }
    }

    // Check if word contains forbidden letters
    for (let letter of forbiddenLetters) {
      if (wordLetterCount[letter] > 0) {
        return false;
      }
    }

    // Check if word contains required letters in correct amounts
    for (let [letter, count] of Object.entries(requiredLetters)) {
      if ((wordLetterCount[letter] || 0) < count) {
        return false;
      }
    }

    return true;
  }

  async getBestGuesses(count = 10) {
    await this.ensureInitialized();

    if (this.possibleWords.length === 0) {
      return [];
    }

    if (this.possibleWords.length === 1) {
      return this.possibleWords;
    }

    // Use answer words only for suggestions (more likely to be correct)
    const wordsToScore =
      this.possibleWords.length > 50
        ? this.possibleWords.slice(0, 50)
        : this.possibleWords;

    const scoredWords = wordsToScore.map((word) => ({
      word,
      score: this.calculateWordScore(word),
    }));

    scoredWords.sort((a, b) => b.score - a.score);

    return scoredWords.slice(0, count).map((item) => item.word);
  }

  async getOptimalFirstGuess() {
    await this.ensureInitialized();

    // Best starting words based on letter frequency analysis
    const bestStarters = [
      "slate",
      "adieu",
      "audio",
      "raise",
      "arose",
      "stone",
      "crate",
      "trace",
      "lance",
    ];

    for (let word of bestStarters) {
      if (await this.wordsManager.isAnswerWord(word)) {
        return word;
      }
    }

    return "slate"; // Default fallback
  }

  async getSuggestions(constraints) {
    await this.ensureInitialized();

    if (!constraints || constraints.length === 0) {
      const firstGuess = await this.getOptimalFirstGuess();
      return {
        suggestions: [firstGuess],
        totalPossible: this.answerWords.length,
        message: "Try this optimal starting word!",
      };
    }

    this.resetSolver();

    for (let constraint of constraints) {
      if (constraint.word && constraint.feedback) {
        this.addGuess(constraint.word, constraint.feedback);
      }
    }

    const suggestions = await this.getBestGuesses(8);

    let message;
    if (this.possibleWords.length === 0) {
      message = "No valid words found. Check your feedback entries.";
    } else if (this.possibleWords.length === 1) {
      message = "Found the answer!";
    } else {
      message = `${this.possibleWords.length} possible answer${this.possibleWords.length > 1 ? "s" : ""} remaining`;
    }

    return {
      suggestions,
      totalPossible: this.possibleWords.length,
      message,
    };
  }

  resetSolver() {
    this.possibleWords = [...this.answerWords];
    this.guesses = [];
    this.letterFrequency = this.calculateLetterFrequency();
  }

  getPossibleWords() {
    return this.possibleWords;
  }

  async getTotalWordCount() {
    await this.ensureInitialized();
    return this.allWords.length;
  }

  async getAnswerWordCount() {
    await this.ensureInitialized();
    return this.answerWords.length;
  }

  analyzeGuess(targetWord, guess) {
    const target = targetWord.toLowerCase();
    const guessWord = guess.toLowerCase();
    const feedback = new Array(5).fill("absent");

    // Count letters in target
    const targetCounts = {};
    for (let letter of target) {
      targetCounts[letter] = (targetCounts[letter] || 0) + 1;
    }

    // First pass: mark correct positions
    for (let i = 0; i < 5; i++) {
      if (guessWord[i] === target[i]) {
        feedback[i] = "correct";
        targetCounts[guessWord[i]]--;
      }
    }

    // Second pass: mark present positions
    for (let i = 0; i < 5; i++) {
      if (feedback[i] === "absent" && targetCounts[guessWord[i]] > 0) {
        feedback[i] = "present";
        targetCounts[guessWord[i]]--;
      }
    }

    return feedback;
  }

  calculateEntropy(word) {
    const patterns = {};

    for (let possibleAnswer of this.possibleWords) {
      const feedback = this.analyzeGuess(possibleAnswer, word);
      const pattern = feedback.join("");
      patterns[pattern] = (patterns[pattern] || 0) + 1;
    }

    let entropy = 0;
    const total = this.possibleWords.length;

    for (let count of Object.values(patterns)) {
      if (count > 0) {
        const probability = count / total;
        entropy -= probability * Math.log2(probability);
      }
    }

    return entropy;
  }

  async getOptimalGuess() {
    await this.ensureInitialized();

    if (this.possibleWords.length <= 2) {
      return this.possibleWords[0];
    }

    // For larger sets, use a heuristic approach
    const suggestions = await this.getBestGuesses(1);
    return suggestions[0] || this.possibleWords[0];
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = WordleSolver;
} else {
  window.WordleSolver = WordleSolver;
}
