const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

const seedUsers = [
  { name: 'Aswat Ram', email: 'admin@dairychain.in', password: 'admin123', role: 'admin', initials: 'AR' },
  { name: 'Karthik M', email: 'transport@dairychain.in', password: 'transport123', role: 'transport', initials: 'KM' },
  { name: 'Priya S', email: 'inspector@dairychain.in', password: 'inspector123', role: 'inspector', initials: 'PS' },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    for (const userData of seedUsers) {
      const existing = await User.findOne({ email: userData.email });
      if (existing) {
        console.log(`⚠️  User already exists: ${userData.email}`);
        continue;
      }
      const user = new User(userData);
      await user.save();
      console.log(`✅ Created user: ${userData.email} (${userData.role})`);
    }

    console.log('\n🎉 Seed complete!');
    console.log('\nDemo credentials:');
    seedUsers.forEach((u) => {
      console.log(`  ${u.role.padEnd(10)} | ${u.email.padEnd(28)} | ${u.password}`);
    });

    console.log('\n💡 Tip: Login as admin and visit /users to manage access requests.');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
}

seed();
