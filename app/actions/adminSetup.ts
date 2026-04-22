"use server";

import { currentUser, clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function makeMeAdmin() {
  const user = await currentUser();
  if (!user) return { success: false, error: "Not logged in" };

  try {
    const client = await clerkClient();
    await client.users.updateUserMetadata(user.id, {
      publicMetadata: {
        role: "admin",
      },
    });
    
    revalidatePath("/");
    return { success: true, message: `User ${user.id} is now an admin in Clerk metadata.` };
  } catch (error) {
    console.error("Error setting admin role:", error);
    return { success: false, error: String(error) };
  }
}
