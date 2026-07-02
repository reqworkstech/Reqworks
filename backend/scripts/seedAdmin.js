const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

async function seedAdmin() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('Error: MONGODB_URI is not defined in environment variables.');
    process.exit(1);
  }

  try {
    console.log('Connecting to database...');
    await mongoose.connect(uri);
    console.log('Connected successfully. Checking for existing admin...');

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@reqworks.in';
    const adminPassword = process.env.ADMIN_PASSWORD || 'ChangeMeOnFirstLogin123!';

    const existing = await User.findOne({ role: 'admin' });
    if (existing) {
      console.log(`Admin user already exists with email: ${existing.email}. Updating credentials...`);
      existing.email = adminEmail;
      existing.password = adminPassword;
      await existing.save();
      console.log('✅ Admin credentials updated successfully!');
      process.exit(0);
    }

    console.log(`Seeding admin user: ${adminEmail}`);
    await User.create({
      name: 'Reqworks Admin',
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
      isEmailVerified: true
    });

    console.log('✅ Admin seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding admin:', err.message);
    process.exit(1);
  }
}

seedAdmin();
