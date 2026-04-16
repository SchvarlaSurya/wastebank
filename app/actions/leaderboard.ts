"use server";

import { clerkClient } from "@clerk/nextjs/server";

export async function getRegisteredUsers() {
  try {
    const client = await clerkClient();
    
    // Fetch users representing the real registered users
    const users = await client.users.getUserList({
      limit: 50,
    });

    return users.data.map((user) => {
      // Create a deterministic pseudo-random XP based on user ID logic
      const idStr = user.id;
      let hash = 0;
      for (let i = 0; i < idStr.length; i++) {
        hash = idStr.charCodeAt(i) + ((hash << 5) - hash);
      }
      // Give them a random XP between 500 and 3500 so they are competitive
      const randomBase = 500 + (Math.abs(hash) % 3000);
      
      const name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'Eco Warrior';

      return {
        id: user.id,
        name: name,
        avatar: user.imageUrl, // Clerk provides direct imageUrl
        xp: randomBase,
      };
    });
  } catch (error) {
    console.error("Error fetching Clerk users:", error);
    return [];
  }
}
