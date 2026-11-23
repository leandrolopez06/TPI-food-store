import { useForm } from "@tanstack/react-form";
import { useActualizarStock } from "@/features/productos/hooks/useProductos";
import type { Producto } from "@/features/productos/types/producto";
import { errorDeCampo } from "@/shared/utils/errorDeCampo";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import { Modal } from "@/shared/ui/Modal";

interface StockModalProps {
  producto: Producto;
  onCerrar: () => void;
}

// Cambio rápido de stock y disponibilidad (PATCH /productos/{id}/stock)
export function StockModal({ producto, onCerrar }: StockModalProps) {
  const actualizar = useActualizarStock();

  const form = useForm({
    defaultValues: { stock: String(producto.stock), disponible: producto.disponible },
    onSubmit: async ({ value }) => {
      try {
        await actualizar.mutateAsync({
          id: producto.id,
          payload: { stock: Number(value.stock), disponible: value.disponible },
        });
        onCerrar();
      } catch {
        // El mensaje de error ya se mostró en un aviso (lo hace el hook); el modal sigue abierto
      }
    },
  });

  return (
    <Modal titulo={`Stock de ${producto.nombre}`} onCerrar={onCerrar}>
      <form
        noValidate
        onSubmit={(evento) => {
          evento.preventDefault();
          evento.stopPropagation();
          void form.handleSubmit();
        }}
      >
        <form.Field
          name="stock"
          validators={{
            onChange: ({ value }) => {
              if (value.trim() === "") return "El stock es obligatorio";
              if (!/^\d+$/.test(value.trim())) return "Debe ser un número entero, 0 o más";
              return undefined;
            },
          }}
        >
          {(campo) => (
            <Input
              etiqueta="Unidades en stock"
              inputMode="numeric"
              name={campo.name}
              value={campo.state.value}
              onBlur={campo.handleBlur}
              onChange={(evento) => campo.handleChange(evento.target.value)}
              error={errorDeCampo(campo)}
              autoFocus
            />
          )}
        </form.Field>

        <form.Field name="disponible">
          {(campo) => (
            <label className="mb-4 flex items-center gap-2 text-sm font-medium text-stone-700">
              <input
                type="checkbox"
                name={campo.name}
                checked={campo.state.value}
                onChange={(evento) => campo.handleChange(evento.target.checked)}
                className="size-4 accent-orange-600"
              />
              Disponible para la venta
            </label>
          )}
        </form.Field>

        <div className="flex justify-end gap-3">
          <Button variante="secondary" onClick={onCerrar}>
            Cancelar
          </Button>
          <form.Subscribe selector={(estado) => estado.isSubmitting}>
            {(enviando) => (
              <Button type="submit" cargando={enviando}>
                Guardar
              </Button>
            )}
          </form.Subscribe>
        </div>
      </form>
    </Modal>
  );
}