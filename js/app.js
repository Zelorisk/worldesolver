class WordleApp {
  constructor() {
    this.solver = new WordleSolver();
    this.wordsManager = new WordsManager();
    this.guesses = [];
    this.currentRow = 0;
    this.initialized = false;
    this.init();
  }

  async init() {
    try {
      await this.wordsManager.initialize();
      await this.solver.initialize();
      this.initialized = true;
      await this.updateStats();
      this.setupEventListeners();
      this.addEmptyGuessRow();
    } catch (error) {
      console.error("Failed to initialize app:", error);
      this.showMessage("Failed to load word lists. Using fallback.", "error");
      // Still try to initialize with fallback
      await this.wordsManager.initializeFallback();
      await this.solver.initialize();
      this.initialized = true;
      await this.updateStats();
      this.setupEventListeners();
      this.addEmptyGuessRow();
    }
  }

  setupEventListeners() {
    document.addEventListener("keydown", (e) => this.handleKeyPress(e));

    document.querySelectorAll(".letter").forEach((input) => {
      input.addEventListener("input", (e) => this.handleLetterInput(e));
      input.addEventListener("keydown", (e) => this.handleLetterKeyDown(e));
    });

    document.querySelectorAll(".status").forEach((select) => {
      select.addEventListener("change", (e) => this.handleStatusChange(e));
    });
  }

  handleKeyPress(e) {
    if (e.key === "Enter") {
      const activeElement = document.activeElement;
      if (activeElement.classList.contains("letter")) {
        const row = activeElement.closest(".guess-row");
        if (row) {
          this.addGuessFromRow(row);
        }
      }
    }
  }

  handleLetterInput(e) {
    const input = e.target;
    const value = input.value.toUpperCase();

    if (value.length > 1) {
      input.value = value.charAt(0);
    } else {
      input.value = value;
    }

    if (value && value.match(/[A-Z]/)) {
      const pos = parseInt(input.dataset.pos);
      const row = input.closest(".guess-row");
      const nextInput = row.querySelector(`[data-pos="${pos + 1}"]`);

      if (nextInput) {
        nextInput.focus();
      }
    }

    this.updateGuessRowStatus(input.closest(".guess-row"));
  }

  handleLetterKeyDown(e) {
    if (e.key === "Backspace" && e.target.value === "") {
      const pos = parseInt(e.target.dataset.pos);
      const row = e.target.closest(".guess-row");
      const prevInput = row.querySelector(`[data-pos="${pos - 1}"]`);

      if (prevInput) {
        prevInput.focus();
      }
    }
  }

  handleStatusChange(e) {
    const select = e.target;
    const letterInput = select.parentElement.querySelector(".letter");
    const letterInputContainer = select.parentElement;

    this.updateLetterDisplay(letterInput, select.value);
    this.updateStatusStyling(select, letterInputContainer, select.value);
    this.updateGuessRowStatus(select.closest(".guess-row"));
  }

  updateLetterDisplay(letterInput, status) {
    letterInput.className = "letter";

    switch (status) {
      case "correct":
        letterInput.classList.add("correct");
        break;
      case "present":
        letterInput.classList.add("present");
        break;
      case "absent":
        letterInput.classList.add("absent");
        break;
    }
  }

  updateStatusStyling(select, container, status) {
    // Update select styling
    select.setAttribute("data-status", status);

    // Update container class for letter styling
    container.className = container.className.replace(/status-\w+/g, "");
    if (status !== "unknown") {
      container.classList.add(`status-${status}`);
    }
  }

  updateGuessRowStatus(row) {
    const letters = row.querySelectorAll(".letter");
    const statuses = row.querySelectorAll(".status");

    let allFilled = true;
    let hasStatus = false;

    letters.forEach((letter, index) => {
      if (!letter.value) {
        allFilled = false;
      }
      if (statuses[index].value !== "unknown") {
        hasStatus = true;
      }
    });

    const addBtn = row.querySelector(".add-guess-btn");
    if (addBtn) {
      addBtn.disabled = !allFilled;
      addBtn.textContent = hasStatus ? "Update" : "Add";
    }
  }

  addEmptyGuessRow() {
    const container = document.querySelector(".guess-rows");
    const rowHtml = `
            <div class="guess-row" data-row="${this.currentRow}">
                ${this.createLetterInputsHtml()}
                <button class="add-guess-btn" onclick="app.addGuessFromCurrentRow(${this.currentRow})">Add</button>
            </div>
        `;

    container.insertAdjacentHTML("beforeend", rowHtml);

    const newRow = container.lastElementChild;
    this.setupRowEventListeners(newRow);

    newRow.querySelector(".letter").focus();
  }

  createLetterInputsHtml() {
    let html = "";
    for (let i = 0; i < 5; i++) {
      html += `
                <div class="letter-input">
                    <input type="text" maxlength="1" class="letter" data-pos="${i}">
                    <select class="status">
                        <option value="unknown">?</option>
                        <option value="correct">●</option>
                        <option value="present">◐</option>
                        <option value="absent">○</option>
                    </select>
                </div>
            `;
    }
    return html;
  }

  setupRowEventListeners(row) {
    row.querySelectorAll(".letter").forEach((input) => {
      input.addEventListener("input", (e) => this.handleLetterInput(e));
      input.addEventListener("keydown", (e) => this.handleLetterKeyDown(e));
    });

    row.querySelectorAll(".status").forEach((select) => {
      select.addEventListener("change", (e) => this.handleStatusChange(e));
      // Initialize styling for existing status
      const container = select.parentElement;
      this.updateStatusStyling(select, container, select.value);
    });
  }

  async addGuessFromCurrentRow(rowIndex) {
    const row = document.querySelector(`[data-row="${rowIndex}"]`);
    await this.addGuessFromRow(row);
  }

  async addGuessFromRow(row) {
    const letters = row.querySelectorAll(".letter");
    const statuses = row.querySelectorAll(".status");

    let word = "";
    let feedback = [];
    let allFilled = true;

    letters.forEach((letter, index) => {
      const letterValue = letter.value.toLowerCase();
      const statusValue = statuses[index].value;

      if (!letterValue) {
        allFilled = false;
        return;
      }

      word += letterValue;
      feedback.push(statusValue === "unknown" ? "absent" : statusValue);
    });

    if (!allFilled) {
      this.showMessage("Please fill all letters", "error");
      return;
    }

    // Ensure WordsManager is initialized before validation
    if (!this.initialized) {
      this.showMessage("App is still loading...", "info");
      return;
    }

    console.log(`Attempting to validate word: "${word}"`);
    console.log(`WordsManager initialized: ${this.wordsManager.initialized}`);

    try {
      await this.wordsManager.ensureInitialized();
      const isValid = await this.wordsManager.isValidWord(word);
      console.log(`Word "${word}" is valid: ${isValid}`);

      if (!isValid) {
        this.showMessage(
          `"${word.toUpperCase()}" is not a valid word`,
          "error",
        );
        return;
      }
    } catch (error) {
      console.error("Error validating word:", error);
      console.log("WordsManager state:", {
        initialized: this.wordsManager.initialized,
        hasAnswerWords: !!this.wordsManager.answerWords,
        hasValidWords: !!this.wordsManager.validWords,
        answerWordsSize: this.wordsManager.answerWords?.size || 0,
        validWordsSize: this.wordsManager.validWords?.size || 0,
      });
      this.showMessage(
        "Error validating word, but proceeding anyway",
        "warning",
      );
      // Continue with the guess even if validation fails
    }

    const existingGuessIndex = this.guesses.findIndex((g) => g.word === word);
    if (existingGuessIndex !== -1) {
      this.guesses[existingGuessIndex] = { word, feedback };
      this.showMessage("Guess updated", "success");
    } else {
      this.guesses.push({ word, feedback });
      this.showMessage("Guess added", "success");
    }

    row.classList.add("completed");
    const addBtn = row.querySelector(".add-guess-btn");
    if (addBtn) {
      addBtn.textContent = "Added";
      addBtn.disabled = true;
    }

    this.currentRow++;
    await this.updateStats();

    if (feedback.every((f) => f === "correct")) {
      this.showMessage("Congratulations! You found the word!", "success");
    } else {
      this.addEmptyGuessRow();
    }
  }

  showMessage(text, type = "info") {
    const existingMessage = document.querySelector(".message");
    if (existingMessage) {
      existingMessage.remove();
    }

    const message = document.createElement("div");
    message.className = `message message-${type}`;
    message.textContent = text;
    message.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 24px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            background: ${type === "error" ? "#ef4444" : type === "success" ? "#22c55e" : "#3b82f6"};
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;

    document.body.appendChild(message);

    setTimeout(() => {
      if (message.parentNode) {
        message.remove();
      }
    }, 3000);
  }

  async updateStats() {
    if (!this.initialized) return;

    try {
      const totalWords = await this.wordsManager.getTotalWordCount();
      const answerWords = await this.wordsManager.getAnswerWordCount();

      document.getElementById("totalWords").textContent = totalWords;
      document.getElementById("guessCount").textContent = this.guesses.length;

      if (this.guesses.length > 0) {
        const result = await this.solver.getSuggestions(this.guesses);
        document.getElementById("possibleWords").textContent =
          result.totalPossible;
      } else {
        document.getElementById("possibleWords").textContent = answerWords;
      }
    } catch (error) {
      console.error("Error updating stats:", error);
    }
  }

  async solve() {
    if (!this.initialized) {
      this.showMessage("App is still loading...", "info");
      return;
    }

    const solveBtn = document.querySelector(".solve-btn");
    const originalText = solveBtn.textContent;

    solveBtn.textContent = "Analyzing...";
    solveBtn.classList.add("loading");
    solveBtn.disabled = true;

    try {
      const result = await this.solver.getSuggestions(this.guesses);
      this.displaySuggestions(result);
      await this.updateStats();
    } catch (error) {
      console.error("Solver error:", error);
      this.showMessage("Error getting suggestions", "error");
    }

    solveBtn.textContent = originalText;
    solveBtn.classList.remove("loading");
    solveBtn.disabled = false;
  }

  displaySuggestions(result) {
    const container = document.getElementById("suggestionsList");

    if (result.suggestions.length === 0) {
      container.innerHTML =
        '<div class="suggestion-item">No valid words found with current constraints</div>';
      return;
    }

    container.innerHTML = "";

    result.suggestions.forEach((word, index) => {
      const item = document.createElement("div");
      item.className = "suggestion-item";
      item.innerHTML = `
                <strong>${word.toUpperCase()}</strong>
                ${index === 0 ? '<span style="color: #4ade80; margin-left: 8px;">BEST</span>' : ""}
            `;

      item.addEventListener("click", () => {
        this.fillCurrentRowWithWord(word);
      });

      container.appendChild(item);
    });

    if (result.message) {
      const messageItem = document.createElement("div");
      messageItem.className = "suggestion-item";
      messageItem.style.cssText =
        "background: rgba(79, 172, 254, 0.2); border-color: #4facfe;";
      messageItem.textContent = result.message;
      container.insertBefore(messageItem, container.firstChild);
    }
  }

  fillCurrentRowWithWord(word) {
    const currentRowEl = document.querySelector(
      ".guess-row:not(.completed):last-child",
    );
    if (!currentRowEl) return;

    const letters = currentRowEl.querySelectorAll(".letter");
    const wordLetters = word.toLowerCase().split("");

    letters.forEach((letter, index) => {
      if (wordLetters[index]) {
        letter.value = wordLetters[index].toUpperCase();
      }
    });

    this.updateGuessRowStatus(currentRowEl);
    this.showMessage(`Filled with: ${word.toUpperCase()}`, "info");
  }

  async clearAll() {
    this.guesses = [];
    this.currentRow = 0;

    const container = document.querySelector(".guess-rows");
    container.innerHTML = "";

    const suggestionsContainer = document.getElementById("suggestionsList");
    suggestionsContainer.innerHTML =
      '<div class="suggestion-item">Start by entering your first guess</div>';

    this.addEmptyGuessRow();
    await this.updateStats();
    this.showMessage("All guesses cleared", "info");
  }

  async getOptimalFirstWord() {
    return await this.solver.getOptimalFirstGuess();
  }
}

async function addGuess() {
  const rows = document.querySelectorAll(".guess-row:not(.completed)");
  if (rows.length > 0) {
    await app.addGuessFromRow(rows[rows.length - 1]);
  }
}

async function solve() {
  await app.solve();
}

async function clearAll() {
  await app.clearAll();
}

let app;

document.addEventListener("DOMContentLoaded", async () => {
  app = new WordleApp();

  // Wait for initialization and then set up the first word suggestion
  setTimeout(async () => {
    if (app.initialized) {
      const firstWord = await app.getOptimalFirstWord();
      const suggestionsContainer = document.getElementById("suggestionsList");
      suggestionsContainer.innerHTML = `
                <div class="suggestion-item" onclick="app.fillCurrentRowWithWord('${firstWord}')">
                    <strong>${firstWord.toUpperCase()}</strong>
                    <span style="color: #4ade80; margin-left: 8px;">OPTIMAL START</span>
                </div>
            `;
    }
  }, 1000);
});
