import type { ButtonHTMLAttributes } from "react";

type Variante = "primary" | "secondary" | "danger" | "ghost";
type Tamano = "sm" | "md";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante;
  tamano?: Tamano;
  cargando?: boolean; // muestra un spinner y bloquea el botón
}

const VARIANTES: Record<Variante, string> = {
  primary: "bg-orange-600 text-white hover:bg-orange-700 focus-visible:ring-orange-300",
  secondary:
    "border border-stone-300 bg-white text-stone-800 hover:bg-stone-100 focus-visible:ring-stone-300",
  danger: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-300",
  ghost: "text-stone-700 hover:bg-stone-200/60 focus-visible:ring-stone-300",
};

const TAMANOS: Record<Tamano, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
};

export function Button({
  variante = "primary",
  tamano = "md",
  cargando = false,
  disabled,
  className = "",
  children,
  type = "button",
  ...resto
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled === true || cargando}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTES[variante]} ${TAMANOS[tamano]} ${className}`}
      {...resto}
    >
      {cargando && (
        <span
          aria-hidden="true"
          className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      {children}
    </button>
  );
}