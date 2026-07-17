import { zodResolver } from "@hookform/resolvers/zod";
import { LogIn, ShieldCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { StateMessage } from "../components/ui/StateMessage";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { authService } from "../services/authService";

const loginSchema = z.object({
  email: z.email("Email tidak valid."),
  password: z.string().min(8, "Password minimal 8 karakter."),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  useDocumentTitle("Login Admin SIGAP");
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (payload: LoginForm) => {
    try {
      const result = await authService.login(payload);
      localStorage.setItem("sigap_token", result.token);
      navigate("/");
    } catch {
      setError("root", {
        message: "Login gagal. Periksa email dan password admin.",
      });
    }
  };

  return (
    <main className="auth-page">
      <Card className="auth-card">
        <div className="auth-card__header">
          <span className="brand-mark">S</span>
          <div>
            <h1>Login Admin SIGAP</h1>
            <p>Akses pengelolaan informasi resmi Desa Cibenda.</p>
          </div>
        </div>
        {errors.root?.message && (
          <StateMessage type="error" title="Tidak dapat masuk" message={errors.root.message} />
        )}
        <form className="form" onSubmit={(event) => void handleSubmit(onSubmit)(event)}>
          <label>
            Email
            <input type="email" autoComplete="email" {...register("email")} />
            {errors.email?.message && <span>{errors.email.message}</span>}
          </label>
          <label>
            Password
            <input type="password" autoComplete="current-password" {...register("password")} />
            {errors.password?.message && <span>{errors.password.message}</span>}
          </label>
          <Button type="submit" disabled={isSubmitting} icon={<LogIn size={18} />}>
            {isSubmitting ? "Memeriksa..." : "Masuk"}
          </Button>
        </form>
        <p className="auth-card__note">
          <ShieldCheck size={18} aria-hidden="true" />
          Halaman publik SIGAP dapat diakses tanpa login.
        </p>
      </Card>
    </main>
  );
}
