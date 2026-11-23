import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useForm } from "@tanstack/react-form";
import { registerRequest } from "@/features/auth/api/auth";
import { handleApiError } from "@/shared/api/handleApiError";
import { errorDeCampo } from "@/shared/utils/errorDeCampo";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { Input } from "@/shared/ui/Input";
import { useAuthStore } from "@/store/authStore";

const FORMATO_EMAIL = /^\S+@\S+\.\S+$/;

export function RegisterPage() {
  const navigate = useNavigate();
  const usuario = useAuthStore((estado) => estado.usuario);
  const [errorApi, setErrorApi] = useState<string | null>(null);

  const form = useForm({
    defaultValues: { username: "", full_name: "", email: "", password: "", confirmacion: "" },
    onSubmit: async ({ value }) => {
      setErrorApi(null);
      try {
        await registerRequest({
          username: value.username.trim(),
          full_name: value.full_name.trim(),
          email: value.email.trim(),
          password: value.password,
        });
        navigate("/login", { replace: true, state: { registrado: true } });
      } catch (error) {
        setErrorApi(handleApiError(error));
      }
    },
  });

  if (usuario !== null) return <Navigate to="/" replace />;

  return (
    <div className="mx-auto max-w-md">
      <Card className="p-6">
        <h1 className="mb-1 text-2xl font-bold">Crear cuenta</h1>
        <p className="mb-5 text-sm text-stone-500">Registrate para hacer tus pedidos.</p>

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
              onChange: ({ value }) => {
                const texto = value.trim();
                if (texto === "") return "El nombre de usuario es obligatorio";
                if (texto.length < 3) return "Mínimo 3 caracteres";
                if (texto.length > 50) return "Máximo 50 caracteres";
                return undefined;
              },
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
            name="full_name"
            validators={{
              onChange: ({ value }) => {
                if (value.trim() === "") return "El nombre completo es obligatorio";
                if (value.trim().length > 100) return "Máximo 100 caracteres";
                return undefined;
              },
            }}
          >
            {(campo) => (
              <Input
                etiqueta="Nombre completo"
                name={campo.name}
                value={campo.state.value}
                onBlur={campo.handleBlur}
                onChange={(evento) => campo.handleChange(evento.target.value)}
                error={errorDeCampo(campo)}
                autoComplete="name"
              />
            )}
          </form.Field>

          <form.Field
            name="email"
            validators={{
              onChange: ({ value }) => {
                if (value.trim() === "") return "El email es obligatorio";
                if (!FORMATO_EMAIL.test(value.trim())) return "Escribí un email válido";
                return undefined;
              },
            }}
          >
            {(campo) => (
              <Input
                etiqueta="Email"
                type="email"
                name={campo.name}
                value={campo.state.value}
                onBlur={campo.handleBlur}
                onChange={(evento) => campo.handleChange(evento.target.value)}
                error={errorDeCampo(campo)}
                autoComplete="email"
              />
            )}
          </form.Field>

          <form.Field
            name="password"
            validators={{
              onChange: ({ value }) => {
                if (value === "") return "La contraseña es obligatoria";
                if (value.length < 8) return "Mínimo 8 caracteres";
                if (value.length > 72) return "Máximo 72 caracteres";
                return undefined;
              },
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
                ayuda="Entre 8 y 72 caracteres."
                autoComplete="new-password"
              />
            )}
          </form.Field>

          <form.Field
            name="confirmacion"
            validators={{
              onChangeListenTo: ["password"],
              onChange: ({ value, fieldApi }) =>
                value !== fieldApi.form.getFieldValue("password")
                  ? "Las contraseñas no coinciden"
                  : undefined,
            }}
          >
            {(campo) => (
              <Input
                etiqueta="Repetir contraseña"
                type="password"
                name={campo.name}
                value={campo.state.value}
                onBlur={campo.handleBlur}
                onChange={(evento) => campo.handleChange(evento.target.value)}
                error={errorDeCampo(campo)}
                autoComplete="new-password"
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
                {enviando ? "Creando cuenta..." : "Crear cuenta"}
              </Button>
            )}
          </form.Subscribe>
        </form>

        <p className="mt-5 text-center text-sm text-stone-600">
          ¿Ya tenés cuenta?{" "}
          <Link to="/login" className="font-semibold text-orange-700 hover:underline">
            Iniciá sesión
          </Link>
        </p>
      </Card>
    </div>
  );
}