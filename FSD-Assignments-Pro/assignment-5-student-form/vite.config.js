import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// base "./" makes the build work from any sub-folder (GitHub Pages, school server, file hosting).
export default defineConfig({ plugins: [react()], base: "./" });
