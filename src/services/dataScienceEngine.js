/**
 * DATA SCIENCE & RETAIL ANALYTICS ENGINE
 * Algorithms:
 * 1. Apriori Market Basket Analysis (Frequently Bought Together, Support, Confidence, Lift)
 * 2. FSN (Fast, Slow, Non-Moving) Velocity Classification
 * 3. ABC Inventory Pareto Analysis (80/20 Revenue Impact)
 */

/**
 * Historical transaction baskets sample data for Market Basket Association Mining
 */
const BASKET_TRANSACTIONS = [
  ['CLN-849201', 'GRO-194820'], // Jacket + Coffee
  ['CLN-849201', 'GRO-194820', 'MSC-774910'], // Jacket + Coffee + Earbuds
  ['GRO-194820', 'GRO-338291'], // Coffee + Artisan Bread
  ['CLN-849201', 'GRO-194820'], // Jacket + Coffee
  ['MSC-774910', 'GRO-338291'], // Earbuds + Bread
  ['CLN-849201', 'GRO-194820', 'CLN-302910'], // Jacket + Coffee + Sneakers
  ['GRO-194820', 'GRO-338291', 'MSC-774910'], // Coffee + Bread + Earbuds
  ['CLN-849201', 'GRO-194820'], // Jacket + Coffee
  ['CLN-849201', 'MSC-774910'], // Jacket + Earbuds
  ['GRO-194820', 'GRO-338291']  // Coffee + Bread
];

/**
 * APRIORI MARKET BASKET ANALYSIS
 * Mines co-occurrence rules A => B from transaction baskets
 */
export function runMarketBasketAnalysis(products = []) {
  const totalBaskets = BASKET_TRANSACTIONS.length;
  const itemCounts = {};
  const pairCounts = {};

  // Count individual items & item pairs
  BASKET_TRANSACTIONS.forEach(basket => {
    // Unique items per basket
    const uniqueItems = Array.from(new Set(basket));

    uniqueItems.forEach(item => {
      itemCounts[item] = (itemCounts[item] || 0) + 1;
    });

    for (let i = 0; i < uniqueItems.length; i++) {
      for (let j = i + 1; j < uniqueItems.length; j++) {
        const pairKey = [uniqueItems[i], uniqueItems[j]].sort().join('||');
        pairCounts[pairKey] = (pairCounts[pairKey] || 0) + 1;
      }
    }
  });

  // Build Association Rules with Support, Confidence, and Lift metrics
  const rules = [];

  Object.entries(pairCounts).forEach(([pairKey, coCount]) => {
    const [skuA, skuB] = pairKey.split('||');
    const prodA = products.find(p => p.sku === skuA);
    const prodB = products.find(p => p.sku === skuB);

    if (!prodA || !prodB) return;

    const supportA = itemCounts[skuA] / totalBaskets;
    const supportB = itemCounts[skuB] / totalBaskets;
    const pairSupport = coCount / totalBaskets;

    // Rule 1: A => B
    const confA2B = coCount / itemCounts[skuA];
    const liftA2B = confA2B / supportB;

    rules.push({
      itemA: prodA,
      itemB: prodB,
      pairCount: coCount,
      supportPct: parseFloat((pairSupport * 100).toFixed(1)),
      confidencePct: parseFloat((confA2B * 100).toFixed(1)),
      liftScore: parseFloat(liftA2B.toFixed(2)),
      affinityStrength: liftA2B > 1.5 ? 'Very High' : liftA2B > 1.1 ? 'Moderate' : 'Low'
    });
  });

  return rules.sort((a, b) => b.liftScore - a.liftScore);
}

/**
 * FSN (FAST, SLOW, NON-MOVING) INVENTORY CLASSIFICATION
 * Classifies inventory items based on monthly turnover velocity
 */
export function runFSNAnalysis(products = []) {
  return products.map(product => {
    // Estimated monthly sales volume
    let monthlySalesUnits = 15;
    if (product.category === 'Groceries') monthlySalesUnits = 65;
    else if (product.category === 'Clothing') monthlySalesUnits = 28;
    else if (product.category === 'Miscellaneous') monthlySalesUnits = 12;

    const turnoverRatio = product.stock > 0 ? (monthlySalesUnits / product.stock) : 0;

    let fsnCategory = 'S'; // Slow-moving
    let fsnLabel = 'Slow Moving (S)';
    let badgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/30';

    if (turnoverRatio >= 1.5 || monthlySalesUnits >= 35) {
      fsnCategory = 'F';
      fsnLabel = 'Fast Moving (F)';
      badgeColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    } else if (turnoverRatio < 0.4 || monthlySalesUnits < 15) {
      fsnCategory = 'N';
      fsnLabel = 'Non-Moving (N)';
      badgeColor = 'bg-red-500/20 text-red-300 border-red-500/30';
    }

    return {
      ...product,
      monthlySalesUnits,
      turnoverRatio: parseFloat(turnoverRatio.toFixed(2)),
      fsnCategory,
      fsnLabel,
      badgeColor
    };
  }).sort((a, b) => b.turnoverRatio - a.turnoverRatio);
}

/**
 * ABC INVENTORY PARETO ANALYSIS (80/20 RULE)
 * Categorizes inventory by cumulative financial revenue contribution
 */
export function runABCAnalysis(products = []) {
  const valuedProducts = products.map(p => ({
    ...p,
    totalValuation: p.stock * p.price
  })).sort((a, b) => b.totalValuation - a.totalValuation);

  const grandTotalValuation = valuedProducts.reduce((acc, p) => acc + p.totalValuation, 0);

  let cumulativeValuation = 0;

  return valuedProducts.map(p => {
    cumulativeValuation += p.totalValuation;
    const cumulativePct = grandTotalValuation > 0 ? (cumulativeValuation / grandTotalValuation) * 100 : 0;

    let abcClass = 'C';
    let abcDesc = 'Class C (Low revenue impact - 5%)';
    let color = 'bg-slate-800 text-slate-400';

    if (cumulativePct <= 75) {
      abcClass = 'A';
      abcDesc = 'Class A (High revenue driver - 75%)';
      color = 'bg-purple-500/20 text-purple-300 border-purple-500/30';
    } else if (cumulativePct <= 92) {
      abcClass = 'B';
      abcDesc = 'Class B (Moderate revenue impact - 20%)';
      color = 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
    }

    return {
      ...p,
      cumulativePct: parseFloat(cumulativePct.toFixed(1)),
      abcClass,
      abcDesc,
      abcColor: color
    };
  });
}

/**
 * Smart Cross-Sell Recommendation Engine for POS Cart
 */
export function getSmartCartRecommendations(cart = [], products = []) {
  if (cart.length === 0) return [];

  const cartSkus = cart.map(item => item.sku);
  const rules = runMarketBasketAnalysis(products);

  const recs = [];
  rules.forEach(rule => {
    if (cartSkus.includes(rule.itemA.sku) && !cartSkus.includes(rule.itemB.sku)) {
      recs.push({ product: rule.itemB, confidence: rule.confidencePct, lift: rule.liftScore });
    } else if (cartSkus.includes(rule.itemB.sku) && !cartSkus.includes(rule.itemA.sku)) {
      recs.push({ product: rule.itemA, confidence: rule.confidencePct, lift: rule.liftScore });
    }
  });

  // De-duplicate by product ID
  const uniqueRecs = [];
  const seenIds = new Set();
  recs.forEach(r => {
    if (!seenIds.has(r.product.id)) {
      seenIds.add(r.product.id);
      uniqueRecs.push(r);
    }
  });

  return uniqueRecs.slice(0, 3);
}
