# Wordle Solver

An Electron-based desktop application that helps solve Wordle puzzles using an algorithm.

## Installation

1. Clone the repository:
```bash
git clone https://github.com/Zelorisk/worldesolver.git
cd worldesolver
```

2. Install dependencies:
```bash
npm install
```

3. Run the application:
```bash
npm start
```

## How to Use

1. Launch the application
2. Enter your guess in the input field
3. Mark each letter as:
   - **Green**: Letter is in the correct position
   - **Yellow**: Letter is in the word but wrong position  
   - **Gray**: Letter is not in the word
4. Click "Submit" to get your next suggested word
5. Repeat until you solve the puzzle!

## Development

### Scripts

- `npm start` - Run the application
- `npm run dev` - Run in development mode
- `npm run build` - Build the application
- `npm run dist` - Create distribution packages

### Project Structure

```
├── main.js           # Electron main process
├── index.html        # Main application window
├── css/
│   └── styles.css    # Application styles
├── js/
│   ├── app.js        # Main application logic
│   ├── solver.js     # Wordle solving algorithm
│   └── words.js      # Word lists and utilities
├── package.json      # Project configuration
└── .gitignore        # Git ignore rules
```

## Algorithm

The solver uses a combination of:
- **Letter frequency analysis** - Prioritizes common letters
- **Position-based scoring** - Considers letter positions in successful words
- **Elimination logic** - Filters out impossible words based on feedback
- **Information theory** - Maximizes information gain with each guess

## Technologies

- **Electron** - Cross-platform desktop app framework
- **HTML/CSS/JavaScript** - Frontend technologies
- **Node.js** - Runtime environment
