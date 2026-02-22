// --- Similarity (Levenshtein) ---
function levenshtein(a, b) {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      matrix[i][j] = Math.min(
        matrix[i-1][j] + 1,
        matrix[i][j-1] + 1,
        matrix[i-1][j-1] + (a[j-1] === b[i-1] ? 0 : 1)
      );
    }
  }
  return matrix[b.length][a.length];
}

function similarity(a, b) {
  a = a.toLowerCase();
  b = b.toLowerCase();
  const longer = a.length > b.length ? a : b;
  const shorter = a.length > b.length ? b : a;
  const longerLength = longer.length;
  if (longerLength === 0) return 1.0;
  const editDistance = levenshtein(longer, shorter);
  return (longerLength - editDistance) / longerLength;
}

// --- Engine ---
class WorkflowEngine {
  constructor(workflow, ui) {
    this.workflow = workflow;
    this.ui = ui;
    this.current = workflow.start;
    this.memory = {};
  }

  async run() {
    while (this.current) {
      const block = this.workflow.blocks[this.current];

      switch (block.type) {

        case "input":
          this.ui.ask(block.prompt);
          return; // wait for user input

        case "match":
          const text = this.memory.lastInput || "";
          const matched = block.patterns.some(
            p => similarity(text, p) >= block.similarity
          );
          this.current = matched ? block.onMatch : block.onFail;
          break;

        case "random":
          const reply = block.responses[
            Math.floor(Math.random() * block.responses.length)
          ];
          this.ui.say(reply);
          this.current = block.next;
          break;

        case "text":
          this.ui.say(block.text);
          this.current = block.next;
          break;

        default:
          console.error("Unknown block type:", block.type);
          return;
      }
    }
  }

  userInput(text) {
    this.memory.lastInput = text;
    this.ui.user(text);
    const block = this.workflow.blocks[this.current];
    if (!block || block.type !== "input") {
      console.error("Current block is not an input block");
      return;
    }
    this.current = block.next;
    this.run();
  }
}
