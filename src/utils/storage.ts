export interface Spec {
  vision: string;
  users: string;
  features: string[];
  flows: Array<{ name: string; steps: string[]; error_path: string }>;
  architecture: string;
  requirements: string;
}

export interface SpecEntry {
  id: string;
  name: string;
  createdAt: string;
  formData: {
    description: string;
    platform?: string;
  };
  spec: Spec;
}

const STORAGE_KEY = "spec_builder_history";

function getHistory(): SpecEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveHistory(entries: SpecEntry[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function getAllSpecs(): SpecEntry[] {
  return getHistory();
}

export function saveSpec(
  spec: Spec,
  formData: { description: string; platform?: string },
  name?: string
): string {
  const id = crypto.randomUUID();
  const entries = getHistory();

  const entryName = name || `Spec ${new Date().toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })}`;

  const newEntry: SpecEntry = {
    id,
    name: entryName,
    createdAt: new Date().toISOString(),
    formData,
    spec,
  };

  entries.unshift(newEntry);
  saveHistory(entries);

  return id;
}

export function getSpecById(id: string): SpecEntry | undefined {
  return getHistory().find((entry) => entry.id === id);
}

export function renameSpec(id: string, newName: string): void {
  const entries = getHistory();
  const index = entries.findIndex((entry) => entry.id === id);
  if (index !== -1) {
    entries[index].name = newName;
    saveHistory(entries);
  }
}

export function deleteSpec(id: string): void {
  const entries = getHistory().filter((entry) => entry.id !== id);
  saveHistory(entries);
}

export function clearAllSpecs(): void {
  saveHistory([]);
}