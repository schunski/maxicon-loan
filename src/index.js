import dotenv from 'dotenv';
import { createApp } from './app.js';
import { initDatabase } from './database.js';

dotenv.config();

const port = Number(process.env.PORT) || 3000;

async function main() {
  await initDatabase();
  const app = createApp();
  app.listen(port, '0.0.0.0', () => {
    console.log('Servidor em http://localhost:' + port);
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
