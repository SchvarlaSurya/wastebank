import { UserProfile } from "@clerk/nextjs";

export default function PengaturanPage() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <header className="flex flex-col gap-1 rounded-3xl border border-stone-200 bg-white px-5 py-4 shadow-sm sm:px-7 sm:py-5">
        <h1 className="text-2xl font-semibold text-stone-900">Pengaturan Akun</h1>
        <p className="text-sm text-stone-600">Kelola profil pribadi dan pengaturan keamanan akun Anda melalui panel Clerk.</p>
      </header>
      
      <section className="flex justify-center overflow-hidden pb-10">
        <UserProfile 
          appearance={{
            elements: {
              cardBox: "shadow-sm border border-stone-200 rounded-2xl w-full max-w-[calc(100vw-2rem)] sm:max-w-[700px]",
            }
          }}
        />
      </section>
    </div>
  );
}
