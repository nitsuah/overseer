import { getNeonClient } from '../lib/db';

async function checkLastSync() {
  const db = getNeonClient();
  const rows = await db`SELECT name, last_synced FROM repos WHERE name = 'overseer'`;
  console.log(JSON.stringify(rows, null, 2));
}

checkLastSync();
