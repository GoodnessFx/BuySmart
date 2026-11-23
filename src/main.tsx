
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import { purgeLegacyDemoData } from "./app/lib/auth";
  import "./styles/index.css";

  // Drop the old demo records once per browser before the app reads its data.
  purgeLegacyDemoData();

  createRoot(document.getElementById("root")!).render(<App />);
