const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);
sql`ALTER TABLE claimed_rewards DROP CONSTRAINT IF EXISTS claimed_rewards_user_id_reward_id_key`
  .then(() => console.log('Constraint dropped'))
  .catch(console.error);
