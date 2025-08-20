// Quick DB connectivity smoke test
import mongoose from 'mongoose';

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('MONGODB_URI missing');
  process.exit(1);
}

(async () => {
  try {
    await mongoose.connect(uri, { dbName: 'tasks' });
    console.log('MongoDB connection OK');
    process.exit(0);
  } catch (e) {
    console.error('MongoDB connection FAILED');
    console.error(e?.message || e);
    process.exit(1);
  }
})();
