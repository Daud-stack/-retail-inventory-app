// src/services/customerEngine.js
const STORAGE_KEY = 'nexus_customers';

const defaultCustomers = [
  { id: 'cust-1', name: 'Tafadzwa Moyo', email: 'tafadzwa@gmail.com', phone: '+263 77 123 4567', tier: 'Gold', points: 450, totalSpent: 1250.00, visitCount: 14, lastVisit: '2026-07-28', status: 'Active' },
  { id: 'cust-2', name: 'Chipo Ndlovu', email: 'chipo@yahoo.com', phone: '+263 71 987 6543', tier: 'Silver', points: 180, totalSpent: 420.50, visitCount: 6, lastVisit: '2026-07-25', status: 'Active' },
  { id: 'cust-3', name: 'Blessing Sithole', email: 'blessing@hotmail.com', phone: '+263 73 456 7890', tier: 'Bronze', points: 40, totalSpent: 95.00, visitCount: 2, lastVisit: '2026-07-10', status: 'Active' }
];

let customers = [];

const loadCustomers = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    customers = JSON.parse(stored);
  } else {
    customers = [...defaultCustomers];
    saveCustomers();
  }
};

const saveCustomers = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
};

export const getCustomers = () => {
  if (customers.length === 0) loadCustomers();
  return [...customers];
};

export const calculateCustomerTier = (points) => {
  if (points >= 1000) return 'Platinum';
  if (points >= 300) return 'Gold';
  if (points >= 100) return 'Silver';
  return 'Bronze';
};

export const addCustomer = (customerData) => {
  const newCustomer = {
    id: `cust-${Date.now()}`,
    points: 0,
    totalSpent: 0,
    visitCount: 0,
    tier: 'Bronze',
    lastVisit: null,
    status: 'Active',
    ...customerData
  };
  customers.push(newCustomer);
  saveCustomers();
  return newCustomer;
};

export const updateCustomer = (id, customerData) => {
  const index = customers.findIndex(c => c.id === id);
  if (index !== -1) {
    customers[index] = { ...customers[index], ...customerData };
    saveCustomers();
    return customers[index];
  }
  return null;
};

export const deleteCustomer = (id) => {
  customers = customers.filter(c => c.id !== id);
  saveCustomers();
};

export const recordCustomerPurchase = (id, amount, currency) => {
  const index = customers.findIndex(c => c.id === id);
  if (index !== -1) {
    const customer = customers[index];
    // Point earn rate: 1 point per $1.00 / 10 ZiG spent
    let pointsEarned = 0;
    if (currency === 'USD') {
        pointsEarned = Math.floor(amount);
    } else if (currency === 'ZIG') {
        pointsEarned = Math.floor(amount / 10);
    }

    customer.points += pointsEarned;
    customer.totalSpent += (currency === 'USD' ? amount : amount / 13.5); // Simplified conversion for total spend tracking
    customer.visitCount += 1;
    customer.lastVisit = new Date().toISOString().split('T')[0];
    customer.tier = calculateCustomerTier(customer.points);
    
    saveCustomers();
    return customer;
  }
  return null;
};

export const redeemPoints = (id, pointsToRedeem) => {
  const index = customers.findIndex(c => c.id === id);
  if (index !== -1) {
    const customer = customers[index];
    if (customer.points >= pointsToRedeem) {
        customer.points -= pointsToRedeem;
        customer.tier = calculateCustomerTier(customer.points);
        saveCustomers();
        return true;
    }
  }
  return false;
};

// Initialize
loadCustomers();
