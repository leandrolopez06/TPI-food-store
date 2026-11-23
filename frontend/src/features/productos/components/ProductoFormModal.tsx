import { useForm } from "@tanstack/react-form";
import { useCategorias } from "@/features/categorias/hooks/useCategorias";
import { useActualizarProducto, useCrearProducto } from "@/features/productos/hooks/useProductos";
import type { Producto } from "@/features/productos/types/producto";
import { errorDeCampo } from "@/shared/utils/errorDeCampo";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import { Modal } from "@/shared/ui/Modal";
import { Select } from "@/shared/ui/Select";
import { Textarea } from "@/shared/ui/Textarea";

interface ProductoFormModalProps {
  producto: Producto | null; // null: se está creando un producto nuevo
  onCerrar: () => void;
}

// Los inputs entregan texto: el precio puede escribirse con coma o con punto
function aNumero(texto: string): number {
  return Number(texto.trim().replace(",", "."));
}

// Formulario (TanStack Form) para crear o editar un producto
export function ProductoFormModal({ producto, onCerrar }: ProductoFormModalProps) {
  const categorias = useCategorias();
  const crear = useCrearProducto();
  const actualizar = useActualizarProducto();

  const form = useForm({
    defaultValues: {
      nombre: producto?.nombre ?? "",
      categoria_id: producto === null ? "" : String(producto.categoria_id),
      precio_base: producto === null ? "" : String(producto.precio_base),
      stock: producto === null ? "0" : String(producto.stock),
      disponible: producto?.disponible ?? true,
      imagen_url: producto?.imagen_url ?? "",
      descripcion: producto?.descripcion ?? "",
    },
    onSubmit: async ({ value }) => {
      const imagen = value.imagen_url.trim();
      const descripcion = value.descripcion.trim();
      const payload = {
        nombre: value.nombre.trim(),
        categoria_id: Number(value.categoria_id),
        precio_base: aNumero(value.precio_base),
        stock: Number(value.stock),
        disponible: value.disponible,
        imagen_url: imagen === "" ? null : imagen,
        descripcion: descripcion === "" ? null : descripcion,
      };
      try {
        if (producto === null) {
          await crear.mutateAsync(payload);
        } else {
          await actualizar.mutateAsync({ id: producto.id, payload });
        }
        onCerrar();
      } catch {
        // El mensaje de error ya se mostró en un aviso (lo hace el hook); el modal sigue abierto
      }
    },
  });

  return (
    <Modal titulo={producto === null ? "Nuevo producto" : "Editar producto"} onCerrar={onCerrar}>
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
              if (texto.length > 150) return "Máximo 150 caracteres";
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
          name="categoria_id"
          validators={{
            onChange: ({ value }) => (value === "" ? "Elegí una categoría" : undefined),
          }}
        >
          {(campo) => (
            <Select
              etiqueta="Categoría"
              name={campo.name}
              value={campo.state.value}
              onBlur={campo.handleBlur}
              onChange={(evento) => campo.handleChange(evento.target.value)}
              error={errorDeCampo(campo)}
            >
              <option value="">Seleccioná una categoría</option>
              {categorias.data?.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nombre}
                </option>
              ))}
            </Select>
          )}
        </form.Field>

        <div className="grid gap-x-4 sm:grid-cols-2">
          <form.Field
            name="precio_base"
            validators={{
              onChange: ({ value }) => {
                if (value.trim() === "") return "El precio es obligatorio";
                const numero = aNumero(value);
                if (!Number.isFinite(numero)) return "Escribí un número válido";
                if (numero < 0) return "No puede ser negativo";
                return undefined;
              },
            }}
          >
            {(campo) => (
              <Input
                etiqueta="Precio"
                inputMode="decimal"
                name={campo.name}
                value={campo.state.value}
                onBlur={campo.handleBlur}
                onChange={(evento) => campo.handleChange(evento.target.value)}
                error={errorDeCampo(campo)}
              />
            )}
          </form.Field>

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
                etiqueta="Stock"
                inputMode="numeric"
                name={campo.name}
                value={campo.state.value}
                onBlur={campo.handleBlur}
                onChange={(evento) => campo.handleChange(evento.target.value)}
                error={errorDeCampo(campo)}
              />
            )}
          </form.Field>
        </div>

        <form.Field
          name="imagen_url"
          validators={{
            onChange: ({ value }) => {
              const texto = value.trim();
              if (texto === "") return undefined;
              if (!/^https?:\/\//i.test(texto)) return "Debe empezar con http:// o https://";
              if (texto.length > 500) return "Máximo 500 caracteres";
              return undefined;
            },
          }}
        >
          {(campo) => (
            <Input
              etiqueta="URL de la imagen (opcional)"
              name={campo.name}
              value={campo.state.value}
              onBlur={campo.handleBlur}
              onChange={(evento) => campo.handleChange(evento.target.value)}
              error={errorDeCampo(campo)}
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
                {producto === null ? "Crear producto" : "Guardar cambios"}
              </Button>
            )}
          </form.Subscribe>
        </div>
      </form>
    </Modal>
  );
}