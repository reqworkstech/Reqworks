const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Project = require('../models/Project');
const Coupon = require('../models/Coupon');
const Notification = require('../models/Notification');
const Offer = require('../models/Offer');

// ==========================================
// ⚙️ EDIT ADMIN EMAILS & PASSWORDS HERE (Exactly 4 Admins)
// ==========================================
const seedAdmins = [
  {
    name: 'Reqworks Admin',
    email: process.env.ADMIN_EMAIL || 'admin@reqworks.in',
    password: process.env.ADMIN_PASSWORD || 'ChangeMeOnFirstLogin123!',
    role: 'admin',
    isEmailVerified: true
  }
];

// ==========================================
// 👤 EDIT CLIENTS HERE
// ==========================================
const seedClients = [];

// ==========================================
// 📋 EDIT SEED PROJECTS HERE
// ==========================================
const seedProjects = [];

async function seedDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('Error: MONGODB_URI is not defined in environment variables.');
    process.exit(1);
  }

  try {
    console.log('Connecting to MONGODB...');
    await mongoose.connect(uri);
    console.log('Connected to database. Cleaning old auth and project seeds...');

    // Clear old data
    await User.deleteMany({});
    await Project.deleteMany({});
    await Coupon.deleteMany({});
    await Notification.deleteMany({});
    await Offer.deleteMany({});

    // Create Admins
    for (const admin of seedAdmins) {
      await User.create(admin);
      console.log(`✅ Seeded Admin: ${admin.name} (${admin.email})`);
    }

    // Create Clients
    let mainClientUser = null;
    for (const client of seedClients) {
      const created = await User.create(client);
      console.log(`✅ Seeded Client: ${client.name} (${client.email})`);
      if (client.email === 'user@devqueue.studio') {
        mainClientUser = created;
      }
    }

    // Create Projects associated with Aryan Mehta
    if (mainClientUser) {
      for (const proj of seedProjects) {
        await Project.create({
          ...proj,
          userId: mainClientUser._id
        });
        console.log(`✅ Seeded Project: "${proj.projectName}" for ${proj.clientName}`);
      }
    }

    console.log('\n🎉 Auth credentials and dynamic dashboard project seeding complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Database seeding failed:', err.stack);
    process.exit(1);
  }
}

seedDatabase();
