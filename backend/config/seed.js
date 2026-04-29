require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Institute = require('../models/Institute');
const Item = require('../models/Item');
const IssueLog = require('../models/IssueLog');
const ReturnLog = require('../models/ReturnLog');
const DamageReport = require('../models/DamageReport');
const Otp = require('../models/Otp');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🍃 Connected to MongoDB');

    // Drop all indexes to avoid conflicts with schema changes
    const collections = ['users', 'institutes', 'items', 'issuelogs', 'returnlogs', 'damagereports', 'otps'];
    for (const col of collections) {
      try {
        await mongoose.connection.db.collection(col).dropIndexes();
        console.log(`   Dropped indexes for ${col}`);
      } catch (e) { /* collection may not exist */ }
    }

    // Clear all data
    await Promise.all([
      User.deleteMany({}),
      Institute.deleteMany({}),
      Item.deleteMany({}),
      IssueLog.deleteMany({}),
      ReturnLog.deleteMany({}),
      DamageReport.deleteMany({}),
      Otp.deleteMany({}),
    ]);
    console.log('🗑️  Cleared all collections');

    const passwordHash = await bcrypt.hash('Admin@123', 12);

    // ── SUPER_ADMIN ──────────────────────────────────────────────────
    const superAdmin = await User.create({
      name: 'Super Admin',
      email: 'superadmin@labsphere.com',
      passwordHash,
      role: 'SUPER_ADMIN',
      isActive: true,
      emailVerified: true,
    });
    console.log('👑 Super Admin created: superadmin@labsphere.com / Admin@123');

    // ── Demo Institute ───────────────────────────────────────────────
    const institute = await Institute.create({
      name: 'IIT Demo Institute',
      email: 'admin@iitdemo.edu',
      phone: '+91 9876543210',
      address: 'New Delhi, India',
      status: 'active',
    });

    // ── Institute Admin ──────────────────────────────────────────────
    const instituteAdmin = await User.create({
      name: 'Dr. Sharma',
      email: 'admin@iitdemo.edu',
      passwordHash,
      phone: '+91 9876543210',
      role: 'INSTITUTE_ADMIN',
      institute: institute._id,
      department: 'Chemistry',
      isActive: true,
      emailVerified: true,
    });

    institute.createdBy = instituteAdmin._id;
    await institute.save();
    console.log('🏛️  Institute: IIT Demo Institute (admin@iitdemo.edu / Admin@123)');

    // ── Lab Incharge ─────────────────────────────────────────────────
    const labIncharge = await User.create({
      name: 'Prof. Verma',
      email: 'verma@iitdemo.edu',
      passwordHash,
      role: 'LAB_INCHARGE',
      institute: institute._id,
      department: 'Chemistry Lab',
      isActive: true,
      emailVerified: true,
    });
    console.log('🔬 Lab Incharge: verma@iitdemo.edu / Admin@123');

    // ── Students ─────────────────────────────────────────────────────
    const student1 = await User.create({
      name: 'Rahul Kumar',
      email: 'rahul@iitdemo.edu',
      passwordHash,
      role: 'STUDENT',
      institute: institute._id,
      department: 'Chemistry',
      isActive: true,
      emailVerified: true,
    });

    const student2 = await User.create({
      name: 'Priya Singh',
      email: 'priya@iitdemo.edu',
      passwordHash,
      role: 'STUDENT',
      institute: institute._id,
      department: 'Chemistry',
      isActive: true,
      emailVerified: true,
    });
    console.log('🎓 Students: rahul@iitdemo.edu, priya@iitdemo.edu / Admin@123');

    // ── Items ────────────────────────────────────────────────────────
    const items = await Item.insertMany([
      { institute: institute._id, itemCode: 'CHEM-001', name: 'Hydrochloric Acid', type: 'chemical', quantity: 500, unit: 'ml', minimumLimit: 100, storageLocation: 'Cabinet A-1', hazardLevel: 'high', supplier: 'Merck', createdBy: labIncharge._id },
      { institute: institute._id, itemCode: 'CHEM-002', name: 'Sodium Hydroxide', type: 'chemical', quantity: 1000, unit: 'g', minimumLimit: 200, storageLocation: 'Cabinet A-2', hazardLevel: 'medium', supplier: 'SRL', createdBy: labIncharge._id },
      { institute: institute._id, itemCode: 'CHEM-003', name: 'Ethanol', type: 'chemical', quantity: 2, unit: 'L', minimumLimit: 1, storageLocation: 'Cabinet B-1', hazardLevel: 'medium', createdBy: labIncharge._id },
      { institute: institute._id, itemCode: 'CHEM-004', name: 'Sulfuric Acid', type: 'chemical', quantity: 50, unit: 'ml', minimumLimit: 100, storageLocation: 'Cabinet A-3', hazardLevel: 'extreme', createdBy: labIncharge._id },
      { institute: institute._id, itemCode: 'EQUIP-001', name: 'Digital Microscope', type: 'equipment', quantity: 5, unit: 'pieces', minimumLimit: 2, storageLocation: 'Shelf C-1', hazardLevel: 'low', createdBy: labIncharge._id },
      { institute: institute._id, itemCode: 'EQUIP-002', name: 'Bunsen Burner', type: 'equipment', quantity: 10, unit: 'pieces', minimumLimit: 3, storageLocation: 'Shelf C-2', hazardLevel: 'medium', createdBy: labIncharge._id },
      { institute: institute._id, itemCode: 'EQUIP-003', name: 'Analytical Balance', type: 'equipment', quantity: 3, unit: 'pieces', minimumLimit: 1, storageLocation: 'Table D-1', hazardLevel: 'low', createdBy: labIncharge._id },
      { institute: institute._id, itemCode: 'CHEM-005', name: 'Acetone', type: 'chemical', quantity: 300, unit: 'ml', minimumLimit: 100, storageLocation: 'Cabinet B-2', hazardLevel: 'medium', createdBy: labIncharge._id },
    ]);
    console.log(`📦 ${items.length} items created`);

    // ── Sample Issues ────────────────────────────────────────────────
    const issue1 = await IssueLog.create({
      institute: institute._id, item: items[0]._id, issuedTo: student1._id, issuedBy: labIncharge._id,
      quantity: 50, purpose: 'Titration experiment', expectedReturnDate: new Date(Date.now() + 7 * 86400000),
    });
    const issue2 = await IssueLog.create({
      institute: institute._id, item: items[4]._id, issuedTo: student2._id, issuedBy: labIncharge._id,
      quantity: 1, purpose: 'Cell observation', expectedReturnDate: new Date(Date.now() + 3 * 86400000),
    });
    console.log('📤 2 sample issues created');

    // ── Sample Return ────────────────────────────────────────────────
    await ReturnLog.create({
      institute: institute._id, issue: issue1._id, item: items[0]._id,
      returnedBy: student1._id, receivedBy: labIncharge._id,
      quantityReturned: 30, condition: 'good',
    });
    await IssueLog.findByIdAndUpdate(issue1._id, { status: 'partially_returned' });
    console.log('📥 1 sample return created');

    console.log('\n✅ Seed complete!\n');
    console.log('─'.repeat(50));
    console.log('Credentials (all use password: Admin@123)');
    console.log('─'.repeat(50));
    console.log('SUPER_ADMIN      : superadmin@labsphere.com');
    console.log('INSTITUTE_ADMIN  : admin@iitdemo.edu');
    console.log('LAB_INCHARGE     : verma@iitdemo.edu');
    console.log('STUDENT          : rahul@iitdemo.edu');
    console.log('STUDENT          : priya@iitdemo.edu');
    console.log('─'.repeat(50));

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
};

seed();
