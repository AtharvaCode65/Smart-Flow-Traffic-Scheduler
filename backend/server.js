import 'dotenv/config';
import app from './src/app.js';
import connectDatabase from './src/config/db.js';

const port = Number(process.env.PORT) || 5000;

async function startServer() {
  try {
    await connectDatabase();
    app.listen(port, () => {
      console.log(`SmartFlow Express API listening on http://localhost:${port}`);
    });
  } catch (error) {
    console.error(`Unable to start API: ${error.message}`);
    process.exit(1);
  }
}

startServer();
