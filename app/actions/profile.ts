"use server";

import { sql } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export type UserProfileInfo = {
  phoneNumber: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
};

export async function getUserProfileInfo(): Promise<{ success: true; data: UserProfileInfo } | { success: false; error: string }> {
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const records = await sql`
      SELECT phone_number, address, latitude, longitude
      FROM user_profiles
      WHERE user_id = ${user.id}
    `;

    if (records.length === 0) {
      // Return empty data if not exist in DB yet
      return {
        success: true,
        data: { phoneNumber: "", address: "", latitude: null, longitude: null },
      };
    }

    const row = records[0];
    return {
      success: true,
      data: {
        phoneNumber: row.phone_number || "",
        address: row.address || "",
        latitude: row.latitude ? Number(row.latitude) : null,
        longitude: row.longitude ? Number(row.longitude) : null,
      },
    };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return { success: false, error: String(error) };
  }
}

export async function updateUserProfileInfo(data: UserProfileInfo) {
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    await sql`
      INSERT INTO user_profiles (user_id, phone_number, address, latitude, longitude)
      VALUES (${user.id}, ${data.phoneNumber}, ${data.address}, ${data.latitude}, ${data.longitude})
      ON CONFLICT (user_id) 
      DO UPDATE SET 
        phone_number = EXCLUDED.phone_number,
        address = EXCLUDED.address,
        latitude = EXCLUDED.latitude,
        longitude = EXCLUDED.longitude,
        updated_at = NOW()
    `;

    revalidatePath("/dashboard/pengaturan");
    return { success: true };
  } catch (error) {
    console.error("Error updating user profile:", error);
    return { success: false, error: String(error) };
  }
}
