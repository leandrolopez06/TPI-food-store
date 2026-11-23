import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "@tanstack/react-form";
import { TEXTO_FORMA_PAGO } from "@/features/pedidos/constants";
import { useCrearPedido } from "@/features/pedidos/hooks/useCrearPedido";
import type { FormaPago } from "@/features/pedidos/types/pedido";
import { handleApiError } from "@/shared/api/handleApiError";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import { Textarea } from "@/shared/ui/Textarea";
import { errorDeCampo } from "@/shared/utils/errorDeCampo";
import { useCartStore } from "@/store/cartStore";

const FORMAS_DE_PAGO: FormaPago[] = ["EFECTIVO", "TRANSFERENCIA"];

// Formulario de confirmación del pedido (TanStack Form): envía POST /pedidos con el carrito
export function CheckoutForm() {
  const navigate = useNavigate();
  const vaciar = useCartStore((estado) => estado.vaciar);
  const crear = useCrearPedido();
  const [errorApi, setErrorApi] = useState<string | null>(null);

  const form = useForm({
    defaultValues: { direccion_entrega: "", forma_pago: "EFECTIVO" as FormaPago, notas: "" },
    onSubmit: async ({ value }) => {
      setErrorApi(null);
      const notas = value.notas.trim();
      try {
        await crear.mutateAsync({
          items: useCartStore
            .getState()
            .items.map((item) => ({ producto_id: item.producto_id, cantidad: item.cantidad })),
          forma_pago: value.forma_pago,
          direccion_entrega: value.direccion_entrega.trim(),
          notas: notas === "" ? null : notas,
        });
        vaciar();
        navigate("/mis-pedidos");
      } catch (error) {
        // Por ejemplo: stock insuficiente o producto no disponible (400)
        setErrorApi(handleApiError(error));
      }
    },
  });

  return (
    <form
      noValidate
      onSubmit={(evento) => {
        evento.preventDefault();
        evento.stopPropagation();
        void form.handleSubmit();
      }}
    >
      <form.Field
        name="direccion_entrega"
        validators={{
          onChange: ({ value }) => {
            const texto = value.trim();
            if (texto === "") return "La dirección de entrega es obligatoria";
            if (texto.length < 5) return "Mínimo 5 caracteres";
            if (texto.length > 200) return "Máximo 200 caracteres";
            return undefined;
          },
        }}
      >
        {(campo) => (
          <Input
            etiqueta="Dirección de entrega"
            name={campo.name}
            value={campo.state.value}
            onBlur={campo.handleBlur}
            onChange={(evento) => campo.handleChange(evento.target.value)}
            error={errorDeCampo(campo)}
            autoComplete="street-address"
            autoFocus
          />
        )}
      </form.Field>

      <form.Field name="forma_pago">
        {(campo) => (
          <fieldset className="mb-4">
            <legend className="mb-1 text-sm font-medium text-stone-700">Forma de pago</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {FORMAS_DE_PAGO.map((forma) => (
                <label
                  key={forma}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                    campo.state.value === forma
                      ? "border-orange-500 bg-orange-50 text-orange-800"
                      : "border-stone-300 bg-white text-stone-700 hover:bg-stone-50"
                  }`}
                >
                  <input
                    type="radio"
                    name={campo.name}
                    value={forma}
                    checked={campo.state.value === forma}
                    onChange={() => campo.handleChange(forma)}
                    className="accent-orange-600"
                  />
                  {TEXTO_FORMA_PAGO[forma]}
                </label>
              ))}
            </div>
          </fieldset>
        )}
      </form.Field>

      <form.Field
        name="notas"
        validators={{
          onChange: ({ value }) => (value.length > 500 ? "Máximo 500 caracteres" : undefined),
        }}
      >
        {(campo) => (
          <Textarea
            etiqueta="Notas para el local (opcional)"
            name={campo.name}
            value={campo.state.value}
            onBlur={campo.handleBlur}
            onChange={(evento) => campo.handleChange(evento.target.value)}
            error={errorDeCampo(campo)}
            ayuda="Por ejemplo: sin cebolla, tocar timbre 2B..."
          />
        )}
      </form.Field>

      {errorApi !== null && (
        <p role="alert" className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorApi}
        </p>
      )}

      <form.Subscribe selector={(estado) => estado.isSubmitting}>
        {(enviando) => (
          <Button type="submit" cargando={enviando} className="w-full">
            {enviando ? "Confirmando..." : "Confirmar pedido"}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}