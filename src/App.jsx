import { useState } from "react";
import ProductsVanilla from "./components/ProductsVanilla.jsx";
import ProductsWithHooks from "./components/ProductsWithHooks.jsx";

function App() {
  const [tab, setTab] = useState("vanilla"); // 'vanilla' | 'hooks'
  return (
    <div className="container">
      <h1>Custom Hooks Playground</h1>
      <p className="muted">
        Compare components implemented without hooks vs. with custom hooks.
      </p>

      <div className="tabs">
        <button
          className={tab === "vanilla" ? "active" : ""}
          onClick={() => setTab("vanilla")}
        >
          Without Hooks
        </button>
        <button
          className={tab === "hooks" ? "active" : ""}
          onClick={() => setTab("hooks")}
        >
          With Hooks
        </button>
      </div>

      {tab === "vanilla" ? <ProductsVanilla /> : <ProductsWithHooks />}
    </div>
  );
}

export default App;
