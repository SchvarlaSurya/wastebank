"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import dynamic from "next/dynamic";
import { UserProfileInfo, updateUserProfileInfo } from "@/app/actions/profile";
import { toast } from "sonner";
import { Camera, MapPin, Phone, User as UserIcon, Home, Loader2, Info } from "lucide-react";

// Dynamically load the Leaflet Map component to prevent SSR window reference error
const MapPicker = dynamic(() => import("./MapPicker"), {
  ssr: false,
  loading: () => <div className="h-[300px] w-full bg-stone-100 animate-pulse rounded-xl flex items-center justify-center text-stone-400">Loading Map...</div>
});

const DEFAULT_CENTER = { lat: -6.2088, lng: 106.8456 }; // Jakarta

export default function ProfileForm({ initialData }: { initialData: UserProfileInfo }) {
  const { user, isLoaded } = useUser();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: initialData.phoneNumber || "",
    address: initialData.address || "",
    latitude: initialData.latitude || DEFAULT_CENTER.lat,
    longitude: initialData.longitude || DEFAULT_CENTER.lng,
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        firstName: user.firstName || "",
        lastName: user.lastName || ""
      }));
    }
  }, [user]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    // Validasi tipe file
    if (!file.type.startsWith('image/')) {
      toast.error("Format tidak didukung. Harap unggah gambar.");
      return;
    }
    
    // Validasi ukuran (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ukuran file terlalu besar. Maksimal 2MB.");
      return;
    }

    const loadId = toast.loading("Mengunggah foto profil...");
    try {
      await user.setProfileImage({ file });
      toast.success("Foto profil berhasil diperbarui", { id: loadId });
    } catch (error: any) {
      toast.error(error.message || "Gagal mengunggah foto profil", { id: loadId });
    }
  };

  const handleMapChange = (pos: { lat: number; lng: number }) => {
    setFormData(prev => ({ ...prev, latitude: pos.lat, longitude: pos.lng }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    
    try {
      // 1. Update Clerk Data (Name)
      if (formData.firstName !== user.firstName || formData.lastName !== user.lastName) {
        await user.update({
          firstName: formData.firstName,
          lastName: formData.lastName
        });
      }

      // 2. Update Local DB Data (Phone, Address, LatLng)
      const res = await updateUserProfileInfo({
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        latitude: formData.latitude,
        longitude: formData.longitude,
      });

      if (!res.success) throw new Error(res.error);

      toast.success("Profil berhasil diperbarui!");
    } catch (error: any) {
      toast.error(error.message || "Gagal menyimpan perubahan");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isLoaded || !user) {
    return <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto text-stone-400" /></div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-sm">
      
      {/* 1. Foto Profil */}
      <section className="flex flex-col sm:flex-row items-center sm:items-start gap-6 border-b border-stone-100 pb-8">
        <div className="relative group">
          <div className="h-28 w-28 rounded-full overflow-hidden border-4 border-white shadow-md ring-1 ring-stone-200">
            <img 
              src={user.imageUrl} 
              alt="Profile" 
              className="h-full w-full object-cover"
            />
          </div>
          <label className="absolute bottom-0 right-0 bg-emerald-500 text-white p-2 rounded-full cursor-pointer shadow-lg hover:bg-emerald-600 transition-colors ring-2 ring-white">
            <Camera className="w-4 h-4" />
            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </label>
        </div>
        <div className="text-center sm:text-left flex-1">
          <h2 className="text-xl font-bold text-stone-900 mb-1">Foto Profil</h2>
          <p className="text-sm text-stone-500 max-w-md">Format yang didukung: JPG, PNG, GIF. Maksimal 2MB. Foto ini akan muncul di papan peringkat jika Anda 10 besar.</p>
        </div>
      </section>

      {/* 2. Informasi Pribadi */}
      <section className="space-y-6 border-b border-stone-100 pb-8">
        <h2 className="text-lg font-semibold text-stone-900 flex items-center gap-2">
          <UserIcon className="w-5 h-5 text-emerald-600" /> Informasi Pribadi
        </h2>
        
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-stone-700">Nama Depan</label>
            <input 
              type="text" 
              value={formData.firstName}
              onChange={e => setFormData({...formData, firstName: e.target.value})}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-stone-700">Nama Belakang</label>
            <input 
              type="text" 
              value={formData.lastName}
              onChange={e => setFormData({...formData, lastName: e.target.value})}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-stone-700 flex items-center gap-1.5">
             <Phone className="w-4 h-4" /> Nomor Handphone
          </label>
          <input 
            type="tel" 
            placeholder="Contoh: 081234567890"
            value={formData.phoneNumber}
            onChange={e => setFormData({...formData, phoneNumber: e.target.value})}
            required
            className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
          />
          <p className="text-xs text-stone-500 mt-1">Krusial! Nomor ini akan dihubungi oleh kolektor saat penjemputan sampah.</p>
        </div>
      </section>

      {/* 3. Alamat & Titik Penjemputan */}
      <section className="space-y-6 border-b border-stone-100 pb-8">
        <h2 className="text-lg font-semibold text-stone-900 flex items-center gap-2">
          <Home className="w-5 h-5 text-emerald-600" /> Alamat Penjemputan (Pickup)
        </h2>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-stone-700">Alamat Lengkap</label>
          <textarea 
            rows={3} 
            value={formData.address}
            onChange={e => setFormData({...formData, address: e.target.value})}
            placeholder="Jalan, RT/RW, Kelurahan, Kecamatan, Kode Pos..."
            required
            className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all resize-none"
          />
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium text-stone-700 flex items-center justify-between">
            <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> Pin Lokasi Peta</span>
            <span className="text-xs text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md font-mono">
              {formData.latitude.toFixed(5)}, {formData.longitude.toFixed(5)}
            </span>
          </label>
          
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex gap-3 text-sm text-blue-800 mb-2">
            <Info className="w-5 h-5 flex-shrink-0" />
            <p>Geser pin merah pada peta di bawah ini ke lokasi persis rumah Anda agar armada kami mudah menemukan lokasi penjemputan.</p>
          </div>

          <MapPicker 
            position={{ lat: formData.latitude, lng: formData.longitude }} 
            onChange={handleMapChange} 
          />
        </div>
      </section>

      {/* Footer Submit */}
      <div className="flex justify-end pt-2">
        <button 
          type="submit" 
          disabled={isSaving}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 px-6 rounded-xl transition-all shadow-md shadow-emerald-600/20 disabled:opacity-70 flex items-center gap-2"
        >
          {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</> : "Simpan Perubahan"}
        </button>
      </div>

    </form>
  );
}
