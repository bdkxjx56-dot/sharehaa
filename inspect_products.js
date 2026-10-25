const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  const products = await mongoose.connection.db.collection('products').find({}).toArray();
  
  const inStockList = [];
  const outOfStockList = [];

  products.forEach(p => {
    // Only SIM cards that have duration of 1 year or 6 months stay in stock!
    // SIM cards category: 'sim-cards'
    // Duration: warrantyYears: 1 (1 year) or warrantyYears: 0.5 (6 months)
    const isSimCard = p.category === 'sim-cards';
    const isYearOrSixMonthsSim = isSimCard && (p.warrantyYears === 1 || p.warrantyYears === 0.5);

    if (isYearOrSixMonthsSim) {
      inStockList.push({ id: p._id, name: p.name, category: p.category, brand: p.brand, warrantyYears: p.warrantyYears });
    } else {
      outOfStockList.push({ id: p._id, name: p.name, category: p.category, brand: p.brand, warrantyYears: p.warrantyYears });
    }
  });

  console.log("=== TO BE IN STOCK (سنة / 6 شهور) ===", inStockList.length);
  inStockList.forEach((p, idx) => console.log(`${idx + 1}. [${p.category}] ${p.name} | brand: ${p.brand} | warrantyYears: ${p.warrantyYears}`));

  console.log("\n=== TO BE OUT OF STOCK (نفذت الكمية - راوترات وباقي مدد الشرائح) ===", outOfStockList.length);
  outOfStockList.forEach((p, idx) => console.log(`${idx + 1}. [${p.category}] ${p.name} | brand: ${p.brand} | warrantyYears: ${p.warrantyYears}`));

  await mongoose.disconnect();
}

check().catch(console.error);
