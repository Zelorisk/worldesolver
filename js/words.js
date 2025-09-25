class WordsManager {
  constructor() {
    this.answerWords = null;
    this.validWords = null;
    this.allWords = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    try {
      console.log(
        "Attempting to fetch Wordle word list from reliable source...",
      );

      // Use the URL provided by user for reliable Wordle answers
      const response = await fetch(
        "https://raw.githubusercontent.com/saorav21994/Wordle-Answers/refs/heads/main/wordle-word-answers.txt",
      );

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const text = await response.text();

      // Parse the word list (it contains both answer words and accepted words)
      const lines = text.split("\n").filter((line) => line.trim());

      // Extract answer words from the format
      let answerWords = [];
      let validWords = [];

      for (const line of lines) {
        if (line.includes("List of correct words")) {
          // Extract words from the array format
          const match = line.match(/\[(.*)\]/);
          if (match) {
            answerWords = match[1]
              .split(",")
              .map((word) => word.trim().replace(/"/g, ""));
          }
        } else if (line.includes("List of accepted words")) {
          // Extract valid words from the array format
          const match = line.match(/\[(.*)\]/);
          if (match) {
            validWords = match[1]
              .split(",")
              .map((word) => word.trim().replace(/"/g, ""));
          }
        }
      }

      this.answerWords = new Set(answerWords);
      this.validWords = new Set([...answerWords, ...validWords]);
      this.allWords = Array.from(this.validWords);

      console.log(`Successfully loaded ${answerWords.length} answer words`);
      console.log(
        `Successfully loaded ${this.validWords.size} total valid words`,
      );
      console.log(
        `Sample words: ${Array.from(this.validWords).slice(0, 5).join(", ")}`,
      );

      this.initialized = true;
    } catch (error) {
      console.warn(
        "Failed to fetch from external source, using fallback:",
        error,
      );
      await this.initializeFallback();
    }
  }

  async initializeFallback() {
    console.log("Initializing with essential Wordle words fallback...");

    // Essential Wordle starting words and common answers
    const fallbackWords = [
      "slate",
      "crane",
      "adieu",
      "audio",
      "arise",
      "raise",
      "stone",
      "crate",
      "trace",
      "lance",
      "soare",
      "roate",
      "about",
      "after",
      "again",
      "alive",
      "alone",
      "along",
      "among",
      "angry",
      "apple",
      "basic",
      "beach",
      "began",
      "being",
      "black",
      "blood",
      "board",
      "brain",
      "bread",
      "break",
      "bring",
      "broad",
      "brown",
      "build",
      "carry",
      "catch",
      "chain",
      "chair",
      "charm",
      "chase",
      "cheap",
      "check",
      "chest",
      "chief",
      "child",
      "china",
      "chose",
      "civil",
      "claim",
      "class",
      "clean",
      "clear",
      "click",
      "climb",
      "clock",
      "close",
      "cloud",
      "coach",
      "coast",
      "could",
      "count",
      "court",
      "cover",
      "craft",
      "crash",
      "crazy",
      "cream",
      "crime",
      "cross",
      "crowd",
      "crown",
      "curve",
      "daily",
      "dance",
      "dealt",
      "death",
      "depth",
      "doing",
      "doubt",
      "dozen",
      "draft",
      "drain",
      "drama",
      "drank",
      "dream",
      "dress",
      "drill",
      "drink",
      "drive",
      "drove",
      "dying",
      "eagle",
      "early",
      "earth",
      "eight",
      "empty",
      "enemy",
      "enjoy",
      "enter",
      "entry",
      "equal",
      "error",
      "event",
      "every",
      "exact",
      "exist",
      "extra",
      "faith",
      "false",
      "fault",
      "fiber",
      "field",
      "fifth",
      "fifty",
      "fight",
      "final",
      "first",
      "fixed",
      "flash",
      "fleet",
      "floor",
      "focus",
      "force",
      "forty",
      "forum",
      "found",
      "frame",
      "frank",
      "fresh",
      "front",
      "fruit",
      "fully",
      "funny",
      "giant",
      "given",
      "glass",
      "going",
      "grace",
      "grade",
      "grand",
      "grant",
      "grass",
      "grave",
      "great",
      "green",
      "gross",
      "group",
      "grown",
      "guard",
      "guess",
      "guest",
      "guide",
      "happy",
      "heart",
      "heavy",
      "hence",
      "horse",
      "hotel",
      "house",
      "human",
      "ideal",
      "image",
      "index",
      "inner",
      "input",
      "issue",
      "japan",
      "jimmy",
      "joint",
      "jones",
      "judge",
      "known",
      "label",
      "large",
      "laser",
      "later",
      "laugh",
      "layer",
      "learn",
      "lease",
      "least",
      "leave",
      "legal",
      "level",
      "light",
      "limit",
      "links",
      "lives",
      "local",
      "loose",
      "lower",
      "lucky",
      "lunch",
      "lying",
      "magic",
      "major",
      "maker",
      "march",
      "match",
      "maybe",
      "mayor",
      "meant",
      "media",
      "metal",
      "might",
      "minor",
      "minus",
      "mixed",
      "model",
      "money",
      "month",
      "moral",
      "motor",
      "mount",
      "mouse",
      "mouth",
      "moved",
      "movie",
      "music",
      "needs",
      "never",
      "newly",
      "night",
      "noise",
      "north",
      "noted",
      "novel",
      "nurse",
      "occur",
      "ocean",
      "offer",
      "often",
      "order",
      "other",
      "ought",
      "paint",
      "panel",
      "paper",
      "party",
      "peace",
      "peter",
      "phase",
      "phone",
      "photo",
      "piano",
      "piece",
      "pilot",
      "pitch",
      "place",
      "plain",
      "plane",
      "plant",
      "plate",
      "point",
      "pound",
      "power",
      "press",
      "price",
      "pride",
      "prime",
      "print",
      "prior",
      "prize",
      "proof",
      "proud",
      "prove",
      "queen",
      "quick",
      "quiet",
      "quite",
      "radio",
      "raise",
      "range",
      "rapid",
      "ratio",
      "reach",
      "ready",
      "realm",
      "rebel",
      "refer",
      "relax",
      "reply",
      "right",
      "rigid",
      "risky",
      "river",
      "robin",
      "roger",
      "roman",
      "rough",
      "round",
      "route",
      "royal",
      "rural",
      "scale",
      "scene",
      "scope",
      "score",
      "sense",
      "serve",
      "setup",
      "seven",
      "shade",
      "shake",
      "shall",
      "shame",
      "shape",
      "share",
      "sharp",
      "sheet",
      "shelf",
      "shell",
      "shift",
      "shine",
      "shirt",
      "shock",
      "shoot",
      "shore",
      "short",
      "shown",
      "sides",
      "sight",
      "silly",
      "since",
      "sixth",
      "sixty",
      "sized",
      "skill",
      "sleep",
      "slide",
      "small",
      "smart",
      "smile",
      "smith",
      "smoke",
      "snake",
      "solar",
      "solid",
      "solve",
      "sorry",
      "sound",
      "south",
      "space",
      "spare",
      "speak",
      "speed",
      "spell",
      "spend",
      "spent",
      "split",
      "spoke",
      "sport",
      "staff",
      "stage",
      "stake",
      "stand",
      "start",
      "state",
      "steam",
      "steel",
      "steep",
      "steer",
      "stern",
      "stick",
      "still",
      "stock",
      "stone",
      "stood",
      "store",
      "storm",
      "story",
      "strip",
      "stuck",
      "study",
      "stuff",
      "style",
      "sugar",
      "suite",
      "super",
      "sweet",
      "table",
      "taken",
      "taste",
      "taxes",
      "teach",
      "terms",
      "texas",
      "thank",
      "theft",
      "their",
      "theme",
      "there",
      "these",
      "thick",
      "thing",
      "think",
      "third",
      "those",
      "three",
      "threw",
      "throw",
      "thumb",
      "tiger",
      "tight",
      "timer",
      "title",
      "today",
      "token",
      "tooth",
      "topic",
      "total",
      "touch",
      "tough",
      "tower",
      "track",
      "trade",
      "train",
      "treat",
      "trend",
      "trial",
      "tribe",
      "trick",
      "tried",
      "tries",
      "truck",
      "truly",
      "trunk",
      "trust",
      "truth",
      "twice",
      "twist",
      "tyler",
      "ultra",
      "uncle",
      "under",
      "undue",
      "union",
      "unity",
      "until",
      "upper",
      "upset",
      "urban",
      "usage",
      "usual",
      "valid",
      "value",
      "video",
      "virus",
      "visit",
      "vital",
      "vocal",
      "voice",
      "waste",
      "watch",
      "water",
      "wheel",
      "where",
      "which",
      "while",
      "white",
      "whole",
      "whose",
      "woman",
      "women",
      "world",
      "worry",
      "worse",
      "worst",
      "worth",
      "would",
      "write",
      "wrong",
      "wrote",
      "young",
      "youth",
    ];

    this.answerWords = new Set(fallbackWords);
    this.validWords = new Set(fallbackWords);
    this.allWords = fallbackWords;
    this.initialized = true;

    console.log(`Fallback initialized with ${fallbackWords.length} words`);
    console.log(`Contains 'slate': ${this.validWords.has("slate")}`);
    console.log(`Contains 'crane': ${this.validWords.has("crane")}`);
    console.log(`Sample words: ${fallbackWords.slice(0, 10).join(", ")}`);
  }

  async ensureInitialized() {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  async getAllWords() {
    await this.ensureInitialized();
    return this.allWords;
  }

  async getAnswerWords() {
    await this.ensureInitialized();
    return Array.from(this.answerWords);
  }

  async isValidWord(word) {
    await this.ensureInitialized();
    const lowerWord = word.toLowerCase();
    const isValid = this.validWords.has(lowerWord);
    console.log(
      `Checking word "${lowerWord}": ${isValid ? "VALID" : "INVALID"}`,
    );
    if (!isValid) {
      console.log(
        `Available words starting with '${lowerWord[0]}': ${Array.from(
          this.validWords,
        )
          .filter((w) => w.startsWith(lowerWord[0]))
          .slice(0, 5)
          .join(", ")}`,
      );
    }
    return isValid;
  }

  async isAnswerWord(word) {
    await this.ensureInitialized();
    return this.answerWords.has(word.toLowerCase());
  }

  async getWordsByPattern(pattern) {
    await this.ensureInitialized();
    const regex = new RegExp(pattern, "i");
    return this.allWords.filter((word) => regex.test(word));
  }

  async getWordsContaining(letters) {
    await this.ensureInitialized();
    return this.allWords.filter((word) => {
      return letters.every((letter) =>
        word.toLowerCase().includes(letter.toLowerCase()),
      );
    });
  }

  async getWordsExcluding(letters) {
    await this.ensureInitialized();
    return this.allWords.filter((word) => {
      return !letters.some((letter) =>
        word.toLowerCase().includes(letter.toLowerCase()),
      );
    });
  }

  async filterWords(constraints) {
    await this.ensureInitialized();
    return this.allWords.filter((word) => {
      const lowerWord = word.toLowerCase();

      for (let i = 0; i < 5; i++) {
        const constraint = constraints[i];
        if (!constraint) continue;

        if (
          constraint.status === "correct" &&
          lowerWord[i] !== constraint.letter
        ) {
          return false;
        }

        if (
          constraint.status === "present" &&
          (lowerWord[i] === constraint.letter ||
            !lowerWord.includes(constraint.letter))
        ) {
          return false;
        }

        if (
          constraint.status === "absent" &&
          lowerWord.includes(constraint.letter)
        ) {
          return false;
        }
      }

      return true;
    });
  }

  async getRandomWord() {
    await this.ensureInitialized();
    return this.allWords[Math.floor(Math.random() * this.allWords.length)];
  }

  async getTotalWordCount() {
    await this.ensureInitialized();
    return this.allWords.length;
  }

  async getAnswerWordCount() {
    await this.ensureInitialized();
    return this.answerWords.size;
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = WordsManager;
} else {
  window.WordsManager = WordsManager;
}
