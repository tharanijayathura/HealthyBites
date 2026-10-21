import 'dotenv/config';
import { app } from './app.js';
import { connectDB } from './config/db.js';

const PORT = Number(process.env.PORT || 5000);
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32 || process.env.JWT_SECRET.startsWith('REPLACE_')) {
  console.error('Set a strong JWT_SECRET (at least 32 characters) in server/.env');
  process.exit(1);
}
try {
  await connectDB();
  app.listen(PORT, () => console.log(`Healy Bite API running at http://localhost:${PORT}`));
} catch (error) {
  console.error('Could not connect to MongoDB:', error.message);
  process.exit(1);
}
