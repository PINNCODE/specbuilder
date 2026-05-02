"use client";

import { useState, useEffect } from "react";
import { Clock, Trash2, Pencil, X, ChevronRight } from "lucide-react";
import { SpecEntry, getAllSpecs, renameSpec, deleteSpec } from "@/utils/storage";

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadSpec: (entry: SpecEntry) => void;
}

export default function HistoryPanel({ isOpen, onClose, onLoadSpec }: HistoryPanelProps) {
  const [entries, setEntries] = useState<SpecEntry[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setEntries(getAllSpecs());
    }
  }, [isOpen]);

  const handleRename = (id: string) => {
    if (editingName.trim()) {
      renameSpec(id, editingName.trim());
      setEntries(getAllSpecs());
    }
    setEditingId(null);
    setEditingName("");
  };

  const handleDelete = (id: string) => {
    deleteSpec(id);
    setEntries(getAllSpecs());
    setDeletingId(null);
  };

  const startEditing = (entry: SpecEntry) => {
    setEditingId(entry.id);
    setEditingName(entry.name);
  };

  const startDeleting = (id: string) => {
    setDeletingId(id);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName("");
  };

  const cancelDelete = () => {
    setDeletingId(null);
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className="fixed left-0 top-0 h-full w-80 bg-[var(--card)] border-r border-[var(--border)] z-50 flex flex-col">
        <header className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[var(--muted-foreground)]" />
            <span className="font-semibold">Historial</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-[var(--secondary)] transition-colors"
            aria-label="Cerrar panel"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto">
          {entries.length === 0 ? (
            <div className="p-4 text-center text-[var(--muted-foreground)] text-sm">
              No hay specs guardadas aún
            </div>
          ) : (
            <ul className="divide-y divide-[var(--border)]">
              {entries.map((entry) => (
                <li key={entry.id} className="p-4 hover:bg-[var(--secondary)]/30 transition-colors">
                  {editingId === entry.id ? (
                    <div className="flex flex-col gap-2">
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="w-full px-2 py-1 text-sm bg-[var(--background)] border border-[var(--border)] rounded"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleRename(entry.id);
                          if (e.key === "Escape") cancelEdit();
                        }}
                      />
                      <div className="flex gap-2 text-xs">
                        <button
                          onClick={() => handleRename(entry.id)}
                          className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded hover:bg-emerald-500/30"
                        >
                          Guardar
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="px-2 py-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : deletingId === entry.id ? (
                    <div className="flex flex-col gap-2">
                      <p className="text-sm text-[var(--muted-foreground)]">
                        ¿Eliminar &quot;{entry.name}&quot;?
                      </p>
                      <div className="flex gap-2 text-xs">
                        <button
                          onClick={() => handleDelete(entry.id)}
                          className="px-2 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30"
                        >
                          Eliminar
                        </button>
                        <button
                          onClick={cancelDelete}
                          className="px-2 py-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => onLoadSpec(entry)}
                        className="w-full text-left group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-sm truncate group-hover:text-amber-400 transition-colors">
                              {entry.name}
                            </h3>
                            <p className="text-xs text-[var(--muted-foreground)] mt-1">
                              {formatDate(entry.createdAt)}
                            </p>
                            <p className="text-xs text-[var(--muted-foreground)] mt-1 line-clamp-2">
                              {entry.spec.vision.slice(0, 80)}...
                            </p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-[var(--muted-foreground)] shrink-0 group-hover:text-amber-400 transition-colors" />
                        </div>
                      </button>
                      <div className="flex gap-1 mt-2">
                        <button
                          onClick={() => startEditing(entry)}
                          className="p-1.5 rounded hover:bg-[var(--secondary)] transition-colors text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                          aria-label="Renombrar"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => startDeleting(entry.id)}
                          className="p-1.5 rounded hover:bg-[var(--secondary)] transition-colors text-[var(--muted-foreground)] hover:text-red-400"
                          aria-label="Eliminar"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </>
  );
}