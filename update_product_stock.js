const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');

async function updateStock() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  const products = await mongoose.connection.db.collection('products').find({}).toArray();

  let inStockCount = 0;
  let outOfStockCount = 0;

  for (const p of products) {
    const isSimCard = p.category === 'sim-cards';
    const isYearOrSixMonthsSim = isSimCard && (p.warrantyYears === 1 || p.warrantyYears === 0.5);

    const targetInStock = Boolean(isYearOrSixMonthsSim);

    await mongoose.connection.db.collection('products').updateOne(
      { _id: p._id },
      { $set: { inStock: targetInStock } }
    );

    if (targetInStock) {
      inStockCount++;
      console.log(`[IN STOCK]   : ${p.name} (${p.category})`);
    } else {
      outOfStockCount++;
      console.log(`[OUT OF STOCK]: ${p.name} (${p.category})`);
    }
  }

  console.log(`\nDone! Total products updated: ${products.length}`);
  console.log(`In Stock (1 year / 6 months SIMs): ${inStockCount}`);
  console.log(`Out of Stock (Routers & other SIM durations): ${outOfStockCount}`);

  await mongoose.disconnect();
}

updateStock().catch(console.error);
