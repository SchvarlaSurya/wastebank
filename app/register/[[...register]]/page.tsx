import Link from "next/link";
import { SignUp } from "@clerk/nextjs";

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-stone-100 px-4 py-10 sm:px-6">
      <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-stone-700 hover:text-emerald-800">
            Kembali ke beranda
          </Link>

          <p className="mt-8 inline-flex rounded-full bg-emerald-800 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-50">
            Registrasi akun
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight text-stone-900">
            Buat akun untuk mulai setoran sampah terpilah.
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-stone-600 sm:text-base">
            Akun baru akan dipakai untuk login, pelacakan pickup, dan histori reward. Proses signup sudah diamankan oleh Clerk.
          </p>

          <div className="mt-8 grid gap-3 text-sm text-stone-700">
            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
              Dukungan email/password serta login provider tambahan dari panel Clerk.
            </div>
            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
              Setelah daftar berhasil, pengguna otomatis dialihkan ke dashboard.
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-stone-200 bg-white p-4 shadow-sm sm:p-6">
          <SignUp
            path="/register"
            routing="path"
            signInUrl="/login"
            forceRedirectUrl="/dashboard"
            appearance={{
              elements: {
                cardBox: "shadow-none border border-stone-200 rounded-2xl",
                socialButtonsBlockButton: "border-stone-300 hover:bg-stone-100",
                formButtonPrimary: "bg-emerald-700 hover:bg-emerald-800 text-white",
                footerActionLink: "text-emerald-700 hover:text-emerald-800",
              },
            }}
          />
        </section>
      </div>
    </main>
  );
}
