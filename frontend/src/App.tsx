import { useEffect, useState } from "react";
import "./App.css";

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

const API_URL = "https://todo-app-o04q.onrender.com/todos";

type Filter = "all" | "active" | "completed";

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(true);

  // Fetch todos on mount
  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data: Todo[]) => {
        setTodos(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch todos:", err);
        setLoading(false);
      });
  }, []);

  const addTodo = async () => {
    const text = input.trim();
    if (!text) return;

    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const newTodo: Todo = await res.json();
    setTodos((prev) => [...prev, newTodo]);
    setInput("");
  };

  const toggleTodo = async (id: string, completed: boolean) => {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !completed }),
    });
    const updated: Todo = await res.json();
    setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
  };

  const deleteTodo = async (id: string) => {
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  const filteredTodos = todos.filter((t) => {
    if (filter === "active") return !t.completed;
    if (filter === "completed") return t.completed;
    return true;
  });

  if (loading) return <div className="app">Loading...</div>;

  return (
    <div className="app">
      <h1>Todo List</h1>

      <div className="input-row">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTodo()}
          placeholder="What needs to be done?"
        />
        <button onClick={addTodo}>Add</button>
      </div>

      <div className="filters">
        {(["all", "active", "completed"] as Filter[]).map((f) => (
          <button
            key={f}
            className={filter === f ? "active-filter" : ""}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <ul className="todo-list">
        {filteredTodos.map((todo) => (
          <li key={todo.id} className={todo.completed ? "completed" : ""}>
            <span onClick={() => toggleTodo(todo.id, todo.completed)}>
              {todo.text}
            </span>
            <button className="delete-btn" onClick={() => deleteTodo(todo.id)}>
              ✕
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;