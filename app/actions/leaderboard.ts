"use server";

import { clerkClient } from "@clerk/nextjs/server";
import { sql } from "@/lib/db";

export async function getRegisteredUsers() {
  try {
    const client = await clerkClient();
    
    // Fetch users representing the real registered users
    const users = await client.users.getUserList({
      limit: 50,
    });

    // Fetch user profiles from database to get real XP for this month
    const profiles = await sql`
      SELECT user_id, SUM(weight * 50) as total_xp 
      FROM transactions 
      WHERE date >= date_trunc('month', NOW())
      GROUP BY user_id
    `;
    const profileMap = new Map(profiles.map(p => [p.user_id, Number(p.total_xp)]));

    return users.data.map((user) => {
      const name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'Eco Warrior';
      
      // Get real XP from database, default to 0 if no record
      const xp = profileMap.get(user.id) || 0;

      return {
        id: user.id,
        name: name,
        avatar: user.imageUrl, // Clerk provides direct imageUrl
        xp: xp,
      };
    });
  } catch (error) {
    console.error("Error fetching Clerk users:", error);
    return [];
  }
}
