import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Clock,
  Mail,
  Lock,
  User,
  ArrowLeft,
} from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import jwtDecode from "jwt-decode"; 
import {
  findUser,
  saveUser,
  setLoggedInUser,
  validateLogin,
} from "@/lib/storage";

/* ================= TYPE ================= */
interface GoogleJWT {
  email: string;
  name: string;
  picture?: string;
  sub: string;
}

/* ================= COMPONENT ================= */
const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  /* ================= LOGIN EMAIL ================= */
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const user = validateLogin(email, password);

      if (!user) {
        toast({
          title: "Gagal masuk",
          description: "Email atau password salah.",
          variant: "destructive",
        });
        return;
      }

      setLoggedInUser(user.email, user.name);

      toast({
        title: "Berhasil masuk!",
        description: `Selamat datang kembali, ${user.name}!`,
      });

      navigate("/dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  /* ================= REGISTER EMAIL ================= */
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (findUser(email)) {
        toast({
          title: "Registrasi gagal",
          description: "Email sudah terdaftar.",
          variant: "destructive",
        });
        return;
      }

      if (!name.trim()) {
        toast({
          title: "Registrasi gagal",
          description: "Nama lengkap wajib diisi.",
          variant: "destructive",
        });
        return;
      }

      if (password.length < 6) {
        toast({
          title: "Registrasi gagal",
          description: "Password minimal 6 karakter.",
          variant: "destructive",
        });
        return;
      }

      saveUser({
        email: email.toLowerCase(),
        password,
        name: name.trim(),
        createdAt: new Date().toISOString(),
      });

      setLoggedInUser(email.toLowerCase(), name.trim());

      toast({
        title: "Registrasi berhasil!",
        description: `Selamat datang, ${name}!`,
      });

      navigate("/dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  /* ================= GOOGLE LOGIN ================= */
  const handleGoogleSuccess = (credentialResponse: any) => {
    if (!credentialResponse.credential) return;

    const decoded = jwtDecode<GoogleJWT>(
      credentialResponse.credential
    );

    if (!decoded.email || !decoded.name) {
      toast({
        title: "Login Google gagal",
        description: "Data akun Google tidak valid.",
        variant: "destructive",
      });
      return;
    }

    const email = decoded.email;
    const name = decoded.name;

    let user = findUser(email);
    if (!user) {
      saveUser({
        email,
        password: "google-auth",
        name,
        createdAt: new Date().toISOString(),
      });
    }

    setLoggedInUser(email, name);

    toast({
      title: "Berhasil masuk dengan Google!",
      description: `Selamat datang, ${name}!`,
    });

    navigate("/dashboard");
  };

  const handleGoogleError = () => {
    toast({
      title: "Login Google gagal",
      description: "Silakan coba lagi.",
      variant: "destructive",
    });
  };

  /* ================= UI ================= */
  return (
    <div className="min-h-screen gradient-soft flex flex-col">
      {/* Header */}
      <header className="container mx-auto px-4 py-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali
        </Button>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 mx-auto rounded-2xl gradient-primary flex items-center justify-center mb-3">
              <Clock className="w-7 h-7 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold">IFJourney</h1>
            <p className="text-sm text-muted-foreground">
              Mulai perjalanan IF Anda
            </p>
          </div>

          <Card>
            <CardHeader className="text-center">
              <CardTitle>{isLogin ? "Masuk" : "Daftar"}</CardTitle>
              <CardDescription>
                {isLogin
                  ? "Masuk ke akun Anda"
                  : "Buat akun baru"}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <form
                onSubmit={isLogin ? handleLogin : handleRegister}
                className="space-y-4"
              >
                {!isLogin && (
                  <div>
                    <Label>Nama Lengkap</Label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                )}

                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label>Password</Label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading
                    ? "Memproses..."
                    : isLogin
                    ? "Masuk"
                    : "Daftar"}
                </Button>
              </form>

              <div className="text-center text-xs text-muted-foreground">
                atau
              </div>

              {/* ✅ GOOGLE LOGIN (FIXED) */}
              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  auto_select={false}
                  useOneTap={false}
                />
              </div>

              <div className="text-center text-sm">
                {isLogin ? (
                  <>
                    Belum punya akun?{" "}
                    <button
                      type="button"
                      onClick={() => setIsLogin(false)}
                      className="text-primary font-medium hover:underline"
                    >
                      Daftar
                    </button>
                  </>
                ) : (
                  <>
                    Sudah punya akun?{" "}
                    <button
                      type="button"
                      onClick={() => setIsLogin(true)}
                      className="text-primary font-medium hover:underline"
                    >
                      Masuk
                    </button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Auth;
