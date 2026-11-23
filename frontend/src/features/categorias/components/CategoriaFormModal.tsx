import { useForm } from "@tanstack/react-form";
import { useActualizarCategoria, useCrearCategoria } from "@/features/categorias/hooks/useCategorias";
import type { Categoria } from "@/features/categorias/types/categoria";
import { errorDeCampo } from "@/shared/utils/errorDeCampo";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import { Modal } from "@/shared/ui/Modal";
import { Textarea } from "@/shared/ui/Textarea";

interface CategoriaFormModalProps {
  categoria: Categoria | null; // null: se está creando una categoría nueva
  onCerrar: () => void;
}

// Formulario (TanStack Form) para crear o editar una categoría
export function CategoriaFormModal({ categoria, onCerrar }: CategoriaFormModalProps) {
  const crear = useCrearCategoria();
  const actualizar = useActualizarCategoria();

  const form = useForm({
    defaultValues: { nombre: categoria?.nombre ?? "", descripcion: categoria?.descripcion ?? "" },
    onSubmit: async ({ value }) => {
      const descripcion = value.descripcion.trim();
      const payload = { nombre: value.nombre.trim(), descripcion: descripcion === "" ? null : descripcion };
      try {
        if (categoria === null) {
          await crear.mutateAsync(payload);
        } else {
          await actualizar.mutateAsync({ id: categoria.id, payload });
        }
        onCerrar();
      } catch {
        // El mensaje de error ya se mostró en un aviso (lo hace el hook); el modal sigue abierto
      }
    },
  });

  return (
    <Modal titulo={categoria === null ? "Nueva categoría" : "Editar categoría"} onCerrar={onCerrar}>
      <form
        noValidate
        onSubmit={(evento) => {
          evento.preventDefault();
          evento.stopPropagation();
          void form.handleSubmit();
        }}
      >
        <form.Field
          name="nombre"
          validators={{
            onChange: ({ value }) => {
              const texto = value.trim();
              if (texto === "") return "El nombre es obligatorio";
              if (texto.length < 2) return "Mínimo 2 caracteres";
              if (texto.length > 100) return "Máximo 100 caracteres";
              return undefined;
            },
          }}
        >
          {(campo) => (
            <Input
              etiqueta="Nombre"
              name={campo.name}
              value={campo.state.value}
              onBlur={campo.handleBlur}
              onChange={(evento) => campo.handleChange(evento.target.value)}
              error={errorDeCampo(campo)}
              autoFocus
            />
          )}
        </form.Field>

        <form.Field
          name="descripcion"
          validators={{
            onChange: ({ value }) => (value.length > 500 ? "Máximo 500 caracteres" : undefined),
          }}
        >
          {(campo) => (
            <Textarea
              etiqueta="Descripción (opcional)"
              name={campo.name}
              value={campo.state.value}
              onBlur={campo.handleBlur}
              onChange={(evento) => campo.handleChange(evento.target.value)}
              error={errorDeCampo(campo)}
            />
          )}
        </form.Field>

        <div className="mt-2 flex justify-end gap-3">
          <Button variante="secondary" onClick={onCerrar}>
            Cancelar
          </Button>
          <form.Subscribe selector={(estado) => estado.isSubmitting}>
            {(enviando) => (
              <Button type="submit" cargando={enviando}>
                {categoria === null ? "Crear" : "Guardar cambios"}
              </Button>
            )}
          </form.Subscribe>
        </div>
      </form>
    </Modal>
  );
}