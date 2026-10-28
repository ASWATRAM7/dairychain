const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

async function seed() {
  const name = process.env.BOOTSTRAP_ADMIN_NAME?.trim();
  const email = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;

  if (!process.env.MONGO_URI || !name || !email || !password || password.length < 12) {
    throw new Error(
      'Set MONGO_URI, BOOTSTRAP_ADMIN_NAME, BOOTSTRAP_ADMIN_EMAIL, and a BOOTSTRAP_ADMIN_PASSWORD of at least 12 characters.'
    );
  }

  await mongoose.connect(process.env.MONGO_URI);
  const existing = await User.findOne({ email });
  if (existing) {
    console.log(`Admin account already exists: ${email}`);
    return;
  }

  const initials = name
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  await new User({ name, email, password, role: 'admin', initials }).save();
  console.log(`Created admin account: ${email}`);
}

seed()
  .catch((error) => {
    console.error('Admin bootstrap failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
