import { UserProfile } from "@clerk/nextjs";
import ProfileForm from "./ProfileForm";
import { getUserProfileInfo } from "@/app/actions/profile";

export default async function PengaturanPage() {
  const profileRes = await getUserProfileInfo();
  const initialData = profileRes.success ? profileRes.data : { phoneNumber: "", address: "", latitude: -6.2088, longitude: 106.8456 };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 pb-12">
      <header className="flex flex-col gap-1 rounded-3xl border border-stone-200 bg-white px-5 py-4 shadow-sm sm:px-7 sm:py-5">
        <h1 className="text-2xl font-semibold text-stone-900">Pengaturan Akun</h1>
        <p className="text-sm text-stone-600">Kelola informasi pribadi, alamat penjemputan, dan tata kelola platform Anda.</p>
      </header>
      
      <ProfileForm initialData={initialData as any} />

      <div className="pt-4 border-t border-stone-200">
        <h2 className="text-xl font-bold mb-6 text-stone-900">Keamanan & Login</h2>
        <section className="flex flex-col overflow-hidden">
          <UserProfile 
            appearance={{
              elements: {
                cardBox: "shadow-sm border border-stone-200 rounded-2xl w-full max-w-full",
              }
            }}
          />
        </section>
      </div>
    </div>
  );
}
