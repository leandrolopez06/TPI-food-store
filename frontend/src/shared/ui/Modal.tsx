import type { ReactNode } from "react";

interface ModalProps {
  titulo: string;
  onCerrar: () => void;
  children: ReactNode;
}

// Ventana emergente. La página la monta solo cuando hay que mostrarla, así cada apertura
// empieza con el estado limpio. Se cierra con Escape, con el botón × o tocando el fondo.
export function Modal({ titulo, onCerrar, children }: ModalProps) {
  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4"
      onMouseDown={(evento) => {
        if (evento.target === evento.currentTarget) onCerrar();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        tabIndex={-1}
        ref={(elemento) => elemento?.focus()}
        onKeyDown={(evento) => {
          if (evento.key === "Escape") onCerrar();
        }}
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-white p-6 shadow-xl outline-none"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="text-lg font-semibold">{titulo}</h2>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar ventana"
            className="-mt-1 rounded-md px-2 text-2xl leading-none text-stone-400 hover:bg-stone-100 hover:text-stone-700"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}