import { Button } from "@/shared/ui/Button";
import { Modal } from "@/shared/ui/Modal";

interface ConfirmarProps {
  titulo: string;
  mensaje: string;
  textoConfirmar: string;
  cargando?: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
}

// Pide confirmación antes de una acción destructiva (eliminar, cancelar, desactivar)
export function Confirmar({
  titulo,
  mensaje,
  textoConfirmar,
  cargando = false,
  onConfirmar,
  onCancelar,
}: ConfirmarProps) {
  return (
    <Modal titulo={titulo} onCerrar={onCancelar}>
      <p className="mb-6 text-sm text-stone-600">{mensaje}</p>
      <div className="flex justify-end gap-3">
        <Button variante="secondary" onClick={onCancelar} disabled={cargando}>
          Volver
        </Button>
        <Button variante="danger" onClick={onConfirmar} cargando={cargando}>
          {textoConfirmar}
        </Button>
      </div>
    </Modal>
  );
}