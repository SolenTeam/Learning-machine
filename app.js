const output = document.getElementById("output");
const input = document.getElementById("user-input");
const send = document.getElementById("send");

function addMessage(text, cls) {
  const div = document.createElement("div");
  div.className = "message " + cls;
  div.textContent = text;
  output.appendChild(div);
  output.scrollTop = output.scrollHeight;
}

const UI = {
  say: (t) => addMessage(t, "bot"),
  user: (t) => addMessage(t, "user"),
  ask: (t) => addMessage(t, "bot")
};

let engine = null;

async function loadWorkflow() {
  const res = await fetch("workflows/demo.json");
  const wf = await res.json();
  engine = new WorkflowEngine(wf, UI);
  engine.run();
}

send.onclick = () => {
  const text = input.value.trim();
  if (!text || !engine) return;
  input.value = "";
  engine.userInput(text);
};

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") send.click();
});

loadWorkflow();
