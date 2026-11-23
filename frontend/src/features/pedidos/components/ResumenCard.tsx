import { Card } from "@/shared/ui/Card";

type Tono = "amber" | "blue" | "green" | "red" | "orange" | "stone";

const COLORES: Record<Tono, string> = {
  amber: "text-amber-700",
  blue: "text-blue-700",
  green: "text-green-700",
  red: "text-red-700",
  orange: "text-orange-700",
  stone: "text-stone-800",
};

interface ResumenCardProps {
  titulo: string;
  valor: string | number;
  descripcion?: string;
  tono?: Tono;
}

// Tarjeta con un indicador del resumen de pedidos
export function ResumenCard({ titulo, valor, descripcion, tono = "stone" }: ResumenCardProps) {
  return (
    <Card className="p-5">
      <p className="text-sm font-semibold text-stone-500">{titulo}</p>
      <p className={`mt-1 text-3xl font-bold ${COLORES[tono]}`}>{valor}</p>
      {descripcion !== undefined && <p className="mt-1 text-xs text-stone-400">{descripcion}</p>}
    </Card>
  );
}