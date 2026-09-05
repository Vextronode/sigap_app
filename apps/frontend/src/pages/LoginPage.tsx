import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  TriangleAlert,
} from "lucide-react";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { authService } from "../services/authService";
import { useAuthStore } from "../stores/authStore";

// skema validasi form login admin
const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email administrator wajib diisi.")
    .email("Format email tidak valid."),
  password: z.string().min(1, "Kata sandi wajib diisi."),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  useDocumentTitle("SIGAP Admin Portal - Desa Cibenda");
  const navigate = useNavigate();

  // matikan efek dark mode di halaman login admin dan kembalikan saat keluar
  useEffect(() => {
    const previousTheme = document.documentElement.dataset.theme;
    document.documentElement.dataset.theme = "light";
    return () => {
      const stored = localStorage.getItem("sigap_theme");
      document.documentElement.dataset.theme = stored || previousTheme || "light";
    };
  }, []);

  // alihkan langsung jika pengguna sudah memiliki token aktif
  useEffect(() => {
    const token = localStorage.getItem("sigap_token");
    if (token) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [navigate]);

  // state visibilitas kata sandi dan proteksi keamanan
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [remainingAttempts, setRemainingAttempts] = useState(5);
  const [showSecurityWarning, setShowSecurityWarning] = useState(false);
  const [securityMessage, setSecurityMessage] = useState("");

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "admin@cibenda.desa.id",
      password: "",
    },
  });

  // penanganan aksi submit login
  const onSubmit = async (payload: LoginForm) => {
    if (remainingAttempts <= 0) {
      setShowSecurityWarning(true);
      setSecurityMessage(
        "Batas percobaan login telah habis (5x gagal). Akun Anda dikunci sementara selama 15 menit."
      );
      setError("root", {
        message: "Akun terkunci sementara karena batas percobaan habis.",
      });
      return;
    }

    try {
      const result = await authService.login(payload);
      useAuthStore.getState().login(result.token, result.user);

      // simpan atau hapus preferensi email yang diingat
      if (rememberMe) {
        localStorage.setItem("sigap_remember_email", payload.email);
      } else {
        localStorage.removeItem("sigap_remember_email");
      }

      // alihkan dengan replace agar pengguna tidak bisa kembali ke halaman login via tombol back
      navigate("/admin/dashboard", { replace: true });
    } catch {
      const nextAttempts = Math.max(0, remainingAttempts - 1);
      setRemainingAttempts(nextAttempts);
      setShowSecurityWarning(true);

      if (nextAttempts === 0) {
        setSecurityMessage(
          "Batas percobaan login telah habis (5x gagal). Akun Anda dikunci sementara selama 15 menit."
        );
        setError("root", {
          message: "Akun Anda terkunci sementara. Silakan tunggu 15 menit.",
        });
      } else {
        setSecurityMessage(
          `Batas percobaan login tersisa: ${nextAttempts}. Akun akan dikunci jika gagal berturut-turut.`
        );
        setError("root", {
          message: "Kredensial tidak valid. Periksa kembali email dan kata sandi.",
        });
      }
    }
  };


  // penanganan klik lupa kata sandi
  const handleForgotPassword = () => {
    alert(
      "Untuk mereset kata sandi akun admin atau operator, silakan hubungi Administrator Utama Desa Cibenda."
    );
  };

  return (
    <main
      data-theme="light"
      style={{ colorScheme: "light" }}
      className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden text-slate-800"
    >
      {/* elemen latar dekoratif halus */}
      <div
        className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-[#00247D]/5 blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-[#00247D]/5 blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      {/* kartu autentikasi admin */}
      <div className="w-full max-w-[450px] bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/60 p-7 sm:p-9 relative z-10">
        {/* logo lambang kabupaten pangandaran */}
        <div className="text-center">
          <img
            src="/assets/image/lambang-kabupaten-pangandaran.webp"
            alt="Lambang Kabupaten Pangandaran"
            className="w-16 h-16 object-contain mx-auto drop-shadow-sm"
          />
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-4 tracking-tight">
            SIGAP Admin Portal
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
            Desa Cibenda, Kec. Parigi, Kab. Pangandaran
          </p>
        </div>

        {/* banner peringatan keamanan rate limit hanya muncul saat terjadi kesalahan */}
        {showSecurityWarning && (
          <div className="mt-6 bg-red-50/90 border border-red-200 rounded-xl p-3.5 flex items-start gap-3 text-left">
            <TriangleAlert className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="leading-tight">
              <span className="block text-xs font-bold text-red-800">
                Peringatan Keamanan
              </span>
              <span className="block text-[11px] sm:text-xs text-red-700/90 mt-0.5 leading-relaxed">
                {securityMessage}
              </span>
            </div>
          </div>
        )}

        {/* form input kredensial */}
        <form
          className="mt-5 space-y-4"
          onSubmit={(event) => void handleSubmit(onSubmit)(event)}
        >
          {/* input email admin */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Email Admin
            </label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type="email"
                autoComplete="email"
                placeholder="admin@cibenda.desa.id"
                {...register("email")}
                className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-slate-200 bg-slate-50/60 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#00247D] focus:ring-2 focus:ring-[#00247D]/15 transition-all"
              />
            </div>
            {errors.email?.message && (
              <span className="block text-[11px] text-red-600 mt-1 font-medium">
                {errors.email.message}
              </span>
            )}
          </div>

          {/* input kata sandi */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Kata Sandi
            </label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                {...register("password")}
                className="w-full h-11 pl-10 pr-10 rounded-xl border border-slate-200 bg-slate-50/60 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#00247D] focus:ring-2 focus:ring-[#00247D]/15 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-slate-400 hover:text-slate-600 focus:outline-none p-1"
                aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.password?.message && (
              <span className="block text-[11px] text-red-600 mt-1 font-medium">
                {errors.password.message}
              </span>
            )}
          </div>

          {/* baris ingat saya dan lupa sandi */}
          <div className="flex items-center justify-between pt-0.5">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-[#00247D] focus:ring-[#00247D] cursor-pointer"
              />
              <span className="text-xs text-slate-600">Ingat saya</span>
            </label>

            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-xs font-medium text-[#00247D] hover:underline focus:outline-none"
            >
              Lupa sandi?
            </button>
          </div>

          {/* tombol submit masuk dashboard admin */}
          <button
            type="submit"
            disabled={isSubmitting || remainingAttempts <= 0}
            className="w-full h-11 sm:h-12 mt-2 rounded-xl bg-[#00247D] hover:bg-[#001c61] active:bg-[#00174f] text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-md shadow-[#00247D]/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memeriksa...</span>
              </>
            ) : (
              <>
                <span>Masuk ke Dashboard Admin</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* tautan kembali ke portal informasi warga */}
        <div className="mt-8 pt-4 border-t border-slate-200 text-center">
          <Link
            to="/?view=warga"
            style={{ color: "#334155" }}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold !text-slate-700 hover:!text-[#00247D] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 !text-slate-700" style={{ color: "#334155" }} />
            <span style={{ color: "#334155" }}>Kembali ke Portal Informasi Warga</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
