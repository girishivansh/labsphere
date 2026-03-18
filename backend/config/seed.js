require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const connectDB = require('./db');
const User = require('../models/User');
const Item = require('../models/Item');

const seed = async () => {
  await connectDB();

  await User.deleteMany({});
  await Item.deleteMany({});
  console.log('🗑️  Cleared old data');

  // ── Har user ka ALAG password hash ─────────────────────────────────────────
  const adminHash   = await bcrypt.hash('Shiv@2008',    10);  // Admin password
  
  // ───────────────────────────────────────────────────────────────────────────

  const users = await User.insertMany([
    { name: 'Admin User',  email: 'skgiri21102008@gmail.com', passwordHash: adminHash,   role: 'admin',   department: 'Chemistry' }
    
  ]);
  console.log('👤 Users created');

  await Item.insertMany([
    { itemCode:'CHEM-001', name:'Hydrochloric Acid',   type:'chemical',  quantity:500,  unit:'ml',     minimumLimit:100, storageLocation:'Cabinet A-1', hazardLevel:'high',    description:'37% HCl',             createdBy: users[0]._id },
    { itemCode:'CHEM-002', name:'Sodium Hydroxide',    type:'chemical',  quantity:80,   unit:'g',      minimumLimit:100, storageLocation:'Cabinet A-2', hazardLevel:'medium',  description:'NaOH pellets',        createdBy: users[0]._id },
    { itemCode:'CHEM-003', name:'Ethanol',             type:'chemical',  quantity:1000, unit:'ml',     minimumLimit:200, storageLocation:'Cabinet B-1', hazardLevel:'medium',  description:'95% ethanol',         createdBy: users[0]._id },
    { itemCode:'CHEM-004', name:'Distilled Water',     type:'chemical',  quantity:5000, unit:'ml',     minimumLimit:500, storageLocation:'Cabinet B-2', hazardLevel:'low',     description:'Pure H2O',            createdBy: users[0]._id },
    { itemCode:'CHEM-005', name:'Sulfuric Acid',       type:'chemical',  quantity:40,   unit:'ml',     minimumLimit:100, storageLocation:'Cabinet A-3', hazardLevel:'extreme', description:'Concentrated H2SO4',  createdBy: users[0]._id },
    { itemCode:'EQUIP-001',name:'Beaker 250ml',        type:'equipment', quantity:15,   unit:'pieces', minimumLimit:5,   storageLocation:'Shelf C-1',   hazardLevel:'low',     description:'Borosilicate glass',  createdBy: users[0]._id },
    { itemCode:'EQUIP-002',name:'Bunsen Burner',       type:'equipment', quantity:2,    unit:'pieces', minimumLimit:3,   storageLocation:'Shelf D-1',   hazardLevel:'medium',  description:'Standard lab burner', createdBy: users[0]._id },
    { itemCode:'EQUIP-003',name:'Microscope',          type:'equipment', quantity:5,    unit:'pieces', minimumLimit:2,   storageLocation:'Cabinet E-1', hazardLevel:'low',     description:'Compound microscope', createdBy: users[0]._id },
    { itemCode:'EQUIP-004',name:'pH Meter',            type:'equipment', quantity:1,    unit:'pieces', minimumLimit:2,   storageLocation:'Shelf C-2',   hazardLevel:'low',     description:'Digital pH meter',    createdBy: users[0]._id },
    { itemCode:'EQUIP-005',name:'Conical Flask 500ml', type:'equipment', quantity:4,    unit:'pieces', minimumLimit:5,   storageLocation:'Shelf C-3',   hazardLevel:'low',     description:'Erlenmeyer flask',    createdBy: users[0]._id },
  ]);
  console.log('🧪 Items created');

  console.log('\n✅ Seed complete! Login credentials:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('👑 Admin   : skgiri21102008@gmail.com / Shiv@2008');
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
