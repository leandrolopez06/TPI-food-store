import { Link } from "react-router-dom";
import { Card } from "@/shared/ui/Card";

export function UnauthorizedPage() {
  return (
    <div className="mx-auto max-w-md">
      <Card className="p-8 text-center">
        <p className="text-5xl font-bold text-orange-600">403</p>
        <h1 className="mt-2 text-xl font-bold">No tenés permiso para ver esta página</h1>
        <p className="mt-2 text-sm text-stone-500">
          Esta sección es solo para administradores.
        </p>
        <Link
          to="/"
          className="mt-6 inline-block rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700"
        >
          Volver al inicio
        </Link>
      </Card>
    </div>
  );
}