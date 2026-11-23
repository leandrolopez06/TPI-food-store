import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "@tanstack/react-form";
import { leerDestinoTrasLogin, leerRecienRegistrado } from "@/features/auth/utils";
import { handleApiError } from "@/shared/api/handleApiError";
import { errorDeCampo } from "@/shared/utils/errorDeCampo";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { Input } from "@/shared/ui/Input";
import { useAuthStore } from "@/store/authStore";
import { useNotificationStore } from "@/store/notificationStore";

export function LoginPage() {
  const navigate = useNavigate();
  const ubicacion = useLocation();
  const usuario = useAuthStore((estado) => estado.usuario);
  const login = useAuthStore((estado) => estado.login);
  const showNotification = useNotificationStore((estado) => estado.showNotification);
  const [errorApi, setErrorApi] = useState<string | null>(null);

  const destino = leerDestinoTrasLogin(ubicacion.state);
  const recienRegistrado = leerRecienRegistrado(ubicacion.state);

  const form = useForm({
    defaultValues: { username: "", password: "" },
    onSubmit: async ({ value }) => {
      setErrorApi(null);
      try {
        await login(value.username.trim(), value.password);
        const sesion = useAuthStore.getState().usuario;
        showNotification(`¡Hola, ${sesion?.full_name ?? "bienvenido"}!`);
        navigate(destino, { replace: true });
      } catch (error) {
        setErrorApi(handleApiError(error));
      }
    },
  });

  // Si ya hay sesión no tiene sentido mostrar el formulario
  if (usuario !== null) return <Navigate to={destino} replace />;

  return (
    <div className="mx-auto max-w-md">
      <Card className="p-6">
        <h1 className="mb-1 text-2xl font-bold">Iniciar sesión</h1>
        <p className="mb-5 text-sm text-stone-500">Ingresá con tu nombre de usuario y contraseña.</p>

        {recienRegistrado && (
          <p role="status" className="mb-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
            Cuenta creada. Ya podés iniciar sesión.
          </p>
        )}

        <form
          noValidate
          onSubmit={(evento) => {
            evento.preventDefault();
            evento.stopPropagation();
            void form.handleSubmit();
          }}
        >
          <form.Field
            name="username"
            validators={{
              onChange: ({ value }) =>
                value.trim() === "" ? "El nombre de usuario es obligatorio" : undefined,
            }}
          >
            {(campo) => (
              <Input
                etiqueta="Nombre de usuario"
                name={campo.name}
                value={campo.state.value}
                onBlur={campo.handleBlur}
                onChange={(evento) => campo.handleChange(evento.target.value)}
                error={errorDeCampo(campo)}
                autoComplete="username"
                autoFocus
              />
            )}
          </form.Field>

          <form.Field
            name="password"
            validators={{
              onChange: ({ value }) => (value === "" ? "La contraseña es obligatoria" : undefined),
            }}
          >
            {(campo) => (
              <Input
                etiqueta="Contraseña"
                type="password"
                name={campo.name}
                value={campo.state.value}
                onBlur={campo.handleBlur}
                onChange={(evento) => campo.handleChange(evento.target.value)}
                error={errorDeCampo(campo)}
                autoComplete="current-password"
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
                {enviando ? "Ingresando..." : "Ingresar"}
              </Button>
            )}
          </form.Subscribe>
        </form>

        <p className="mt-5 text-center text-sm text-stone-600">
          ¿No tenés cuenta?{" "}
          <Link to="/register" className="font-semibold text-orange-700 hover:underline">
            Registrate
          </Link>
        </p>
      </Card>
    </div>
  );
}