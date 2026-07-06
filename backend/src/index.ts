import express, { Request, Response } from "express";
import cors from "cors";
import fs from "fs";
import path from "path";

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_FILE = path.join(__dirname, "..", "todos.json");

app.use(cors({
  origin: "https://todo-app-ten-alpha-26.vercel.app"
}));
app.use(express.json());

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

// Helpers to read/write the JSON "database"
function readTodos(): Todo[] {
  if (!fs.existsSync(DATA_FILE)) return [];
  const raw = fs.readFileSync(DATA_FILE, "utf-8");
  return raw ? JSON.parse(raw) : [];
}

function writeTodos(todos: Todo[]): void {
  fs.writeFileSync(DATA_FILE, JSON.stringify(todos, null, 2));
}

// GET all todos
app.get("/todos", (req: Request, res: Response) => {
  res.json(readTodos());
});

// POST a new todo
app.post("/todos", (req: Request, res: Response) => {
  const { text } = req.body;
  if (!text || typeof text !== "string") {
    return res.status(400).json({ error: "Text is required" });
  }
  const todos = readTodos();
  const newTodo: Todo = { id: Date.now().toString(), text, completed: false };
  todos.push(newTodo);
  writeTodos(todos);
  res.status(201).json(newTodo);
});

// PUT update a todo (toggle complete, edit text)
app.put("/todos/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const todos = readTodos();
  const todo = todos.find((t) => t.id === id);
  if (!todo) return res.status(404).json({ error: "Todo not found" });

  if (typeof req.body.completed === "boolean") todo.completed = req.body.completed;
  if (typeof req.body.text === "string") todo.text = req.body.text;

  writeTodos(todos);
  res.json(todo);
});

// DELETE a todo
app.delete("/todos/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  let todos = readTodos();
  const exists = todos.some((t) => t.id === id);
  if (!exists) return res.status(404).json({ error: "Todo not found" });

  todos = todos.filter((t) => t.id !== id);
  writeTodos(todos);
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});