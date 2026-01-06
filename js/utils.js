// Utility functions for HTML escaping, DOM access, and data loading

// Escape HTML special characters to prevent XSS
export function escapeHtml(s){
  return String(s ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll("\"","&quot;")
    .replaceAll("'","&#039;");
}

// Shorthand for document.getElementById
export const $ = (id) => document.getElementById(id);

// Load JSON file with fallback on error
export async function loadJson(path, fallback){
  try{
    const res = await fetch(path);
    if (!res.ok) return fallback;
    return await res.json();
  }catch{
    return fallback;
  }
}

// Check if department matches special category filters
export function deptMatchesCategory(dept, cat){
  if (!dept) return false;
  const d = String(dept);
  if (cat === 'COMMON') return /共同/.test(d);
  if (cat === 'SPORTS') return /體育/.test(d);
  if (cat === 'DEFENSE') return /國防/.test(d);
  if (cat === 'EXCHANGE') return /校際/.test(d);
  return false;
}
