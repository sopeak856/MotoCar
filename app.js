/**
 * MotoCar Custom - E-commerce Logic
 * Handles B2C/B2B Switch, Vehicle Fitment, Cart, KHQR & Order Tracking
 */

// Global State
let currentMode = 'B2C'; // 'B2C' or 'B2B'
let currentCategory = 'all';
let cart = [];
let includeInstallation = false;

// Mock Vehicle DB for Filter
const vehicleData = {
  car: {
    brands: ['Ford', 'Toyota', 'Mazda', 'Lexus'],
    models: {
      Ford: ['Ranger Raptor', 'Everest', 'F-150'],
      Toyota: ['Hilux Revo', 'Land Cruiser 300', 'Prius 20-30'],
      Mazda: ['BT-50', 'CX-5'],
      Lexus: ['LX570', 'RX350']
    }
  },
  motorcycle: {
    brands: ['Honda', 'Yamaha', 'Kawasaki', 'BMW'],
    models: {
      Honda: ['ADV 160', 'CB650R', 'Click 160', 'Wave 110/125'],
      Yamaha: ['XSR 155', 'MT-09', 'T-MAX', 'YZF-R7'],
      Kawasaki: ['Ninja 400', 'Z900'],
      BMW: ['R 1250 GS', 'S 1000 RR']
    }
  }
};

// Mock Product Catalog
const products = [
  {
    id: 1,
    name: 'កាងមុខដែក Off-Road Bull Bar (Steel Bumper)',
    category: 'car',
    brand: 'Ford',
    model: 'Ranger Raptor',
    priceB2C: 480,
    priceB2B: 350,
    moq: 3,
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80',
    fitment: 'Ford Ranger / Raptor (2018 - 2024)'
  },
  {
    id: 2,
    name: 'បំពង់ស៊ីមាំងកែច្នៃ Full Titanium Exhaust (Akrapovic Style)',
    category: 'motorcycle',
    brand: 'Honda',
    model: 'CB650R',
    priceB2C: 220,
    priceB2B: 155,
    moq: 5,
    image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=600&q=80',
    fitment: 'Honda CB650R / CBR650R'
  },
  {
    id: 3,
    name: 'ឈ្នាន់ជើងអគ្គិសនីស្វ័យប្រវត្ត (Electric Side Steps)',
    category: 'car',
    brand: 'Toyota',
    model: 'Hilux Revo',
    priceB2C: 560,
    priceB2B: 420,
    moq: 2,
    image: 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=600&q=80',
    fitment: 'Toyota Hilux Revo / Fortuner'
  },
  {
    id: 4,
    name: 'ដៃហ្វ្រាំង/ដៃក្ដាប់ CNC Sport Adjustable Levers',
    category: 'motorcycle',
    brand: 'Yamaha',
    model: 'XSR 155',
    priceB2C: 45,
    priceB2B: 28,
    moq: 10,
    image: 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?auto=format&fit=crop&w=600&q=80',
    fitment: 'Yamaha XSR155, MT-15, MT-09'
  },
  {
    id: 5,
    name: 'ឈុតភ្លើងស្ព័រ LED Laser Foglights Ultra Beam (4 គ្រាប់)',
    category: 'car',
    brand: 'Ford',
    model: 'Everest',
    priceB2C: 130,
    priceB2B: 85,
    moq: 5,
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80',
    fitment: 'សកល (Universal 12V-24V SUV/Pick-up)'
  },
  {
    id: 6,
    name: 'កម្រាលជើងរថយន្ត VIP Leather 6D Custom Cut',
    category: 'car',
    brand: 'Lexus',
    model: 'RX350',
    priceB2C: 95,
    priceB2B: 60,
    moq: 5,
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80',
    fitment: 'Lexus RX350 / Toyota RAV4'
  }
];

// Initialize on Load
document.addEventListener('DOMContentLoaded', () => {
  renderProducts();
  initFitmentDropdowns();
  
  // Realtime search
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      const filtered = products.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.brand.toLowerCase().includes(query) ||
        p.fitment.toLowerCase().includes(query)
      );
      renderProducts(filtered);
    });
  }
});

// Mode Switching: B2C vs B2B
function switchMode(mode) {
  currentMode = mode;
  document.getElementById('btnB2C').classList.toggle('active', mode === 'B2C');
  document.getElementById('btnB2B').classList.toggle('active', mode === 'B2B');
  
  const b2bNotice = document.getElementById('b2bNotice');
  const catalogSubtitle = document.getElementById('catalogSubtitle');
  const b2bInvoiceTab = document.getElementById('b2bInvoiceTab');

  if (mode === 'B2B') {
    b2bNotice.classList.remove('hidden');
    catalogSubtitle.innerText = 'តម្លៃបោះដុំពិសេសសម្រាប់យានដ្ឋាន & ដេប៉ូ (MOQ អប្បបរមា)';
    b2bInvoiceTab.style.display = 'block';
  } else {
    b2bNotice.classList.add('hidden');
    catalogSubtitle.innerText = 'ទំនិញលក់រាយគុណភាពខ្ពស់ ធានារយៈពេល ១២ ខែ';
    b2bInvoiceTab.style.display = 'none';
  }

  renderProducts();
  updateCartUI();
}

// Category Filter
function filterCategory(cat, btn) {
  currentCategory = cat;
  document.querySelectorAll('.pill-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  const filtered = cat === 'all' ? products : products.filter(p => p.category === cat);
  renderProducts(filtered);
}

// Render Products Grid
function renderProducts(list = null) {
  const container = document.getElementById('productGrid');
  if (!container) return;

  const data = list || (currentCategory === 'all' ? products : products.filter(p => p.category === currentCategory));
  container.innerHTML = '';

  if (data.length === 0) {
    container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 40px;">
      <i class="fas fa-box-open" style="font-size: 2.5rem; margin-bottom: 10px;"></i>
      <p>មិនមានផលិតផលត្រូវនឹងលក្ខខណ្ឌស្វែងរកនេះទេ</p>
    </div>`;
    return;
  }

  data.forEach(p => {
    const isB2B = currentMode === 'B2B';
    const displayPrice = isB2B ? p.priceB2B : p.priceB2C;

    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <div class="product-thumb" style="background-image: url('${p.image}')">
        <span class="fitment-tag"><i class="fas fa-check-circle text-orange"></i> ${p.fitment}</span>
      </div>
      <div class="product-body">
        <span class="product-category">${p.category === 'car' ? 'Car Custom' : 'Motorcycle Custom'}</span>
        <h4 class="product-title">${p.name}</h4>
        <div class="product-meta">ម៉ាក: <strong>${p.brand}</strong> | ស៊េរី: ${p.model}</div>
        
        <div class="price-row">
          <div>
            <div class="price-tag">$${displayPrice.toFixed(2)}</div>
            ${isB2B ? `<span class="b2b-tier"><i class="fas fa-boxes-stacked"></i> MOQ: ${p.moq} ឈុតឡើង</span>` : ''}
          </div>
          <button class="btn btn-sm btn-primary" onclick="addToCart(${p.id})">
            <i class="fas fa-cart-plus"></i> ${isB2B ? 'កុម្ម៉ង់ដុំ' : 'ដាក់កន្ត្រក'}
          </button>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

// Vehicle Fitment Dynamic Dropdown Logic
function initFitmentDropdowns() {
  const typeSelect = document.getElementById('fitmentType');
  const brandSelect = document.getElementById('fitmentBrand');
  const modelSelect = document.getElementById('fitmentModel');
  if (!typeSelect || !brandSelect || !modelSelect) return;

  onFitmentTypeChange();
}

function onFitmentTypeChange() {
  const type = document.getElementById('fitmentType').value;
  const brandSelect = document.getElementById('fitmentBrand');
  const modelSelect = document.getElementById('fitmentModel');

  brandSelect.innerHTML = '<option value="all">ម៉ាកទាំងអស់</option>';
  modelSelect.innerHTML = '<option value="all">ម៉ូដែលទាំងអស់</option>';

  if (type === 'all') {
    const allBrands = [...new Set([...vehicleData.car.brands, ...vehicleData.motorcycle.brands])];
    allBrands.forEach(b => brandSelect.innerHTML += `<option value="${b}">${b}</option>`);
  } else if (vehicleData[type]) {
    vehicleData[type].brands.forEach(b => brandSelect.innerHTML += `<option value="${b}">${b}</option>`);
  }
}

function onFitmentBrandChange() {
  const type = document.getElementById('fitmentType').value;
  const brand = document.getElementById('fitmentBrand').value;
  const modelSelect = document.getElementById('fitmentModel');
  modelSelect.innerHTML = '<option value="all">ម៉ូដែលទាំងអស់</option>';

  if (brand === 'all') return;

  let models = [];
  if (type === 'car' && vehicleData.car.models[brand]) {
    models = vehicleData.car.models[brand];
  } else if (type === 'motorcycle' && vehicleData.motorcycle.models[brand]) {
    models = vehicleData.motorcycle.models[brand];
  } else {
    models = (vehicleData.car.models[brand] || []).concat(vehicleData.motorcycle.models[brand] || []);
  }

  models.forEach(m => modelSelect.innerHTML += `<option value="${m}">${m}</option>`);
}

function applyFitment(e) {
  e.preventDefault();
  const type = document.getElementById('fitmentType').value;
  const brand = document.getElementById('fitmentBrand').value;
  const model = document.getElementById('fitmentModel').value;

  const filtered = products.filter(p => {
    const matchType = (type === 'all' || p.category === type);
    const matchBrand = (brand === 'all' || p.brand === brand);
    const matchModel = (model === 'all' || p.model === model);
    return matchType && matchBrand && matchModel;
  });

  renderProducts(filtered);

  // Smooth scroll to catalog
  const catalogSec = document.getElementById('catalog');
  if (catalogSec) catalogSec.scrollIntoView({ behavior: 'smooth' });
}

// Shopping Cart Functions
function addToCart(productId) {
  const prod = products.find(p => p.id === productId);
  if (!prod) return;

  const existing = cart.find(item => item.id === productId);
  const minQty = currentMode === 'B2B' ? prod.moq : 1;

  if (existing) {
    existing.qty += minQty;
  } else {
    cart.push({ ...prod, qty: minQty, modeWhenAdded: currentMode });
  }

  updateCartUI();
  openCart();
}

function updateCartUI() {
  const badge = document.getElementById('cartCount');
  const drawerCount = document.getElementById('cartCountDrawer');
  const itemsContainer = document.getElementById('cartItems');

  const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
  if (badge) badge.innerText = totalCount;
  if (drawerCount) drawerCount.innerText = totalCount;

  if (!itemsContainer) return;

  if (cart.length === 0) {
    itemsContainer.innerHTML = `
      <div style="text-align: center; color: var(--text-muted); margin-top: 50px;">
        <i class="fas fa-shopping-basket" style="font-size: 3rem; margin-bottom: 12px; opacity: 0.4;"></i>
        <p>មិនទាន់មានទំនិញក្នុងកន្ត្រកនៅឡើយទេ</p>
      </div>
    `;
    updatePricingTotals(0);
    return;
  }

  itemsContainer.innerHTML = '';
  let subtotal = 0;

  cart.forEach((item, index) => {
    const isB2B = currentMode === 'B2B';
    const unitPrice = isB2B ? item.priceB2B : item.priceB2C;
    const itemTotal = unitPrice * item.qty;
    subtotal += itemTotal;

    const row = document.createElement('div');
    row.className = 'cart-item';
    row.innerHTML = `
      <div class="cart-item-img" style="background-image: url('${item.image}')"></div>
      <div class="cart-item-info">
        <h5 class="cart-item-title">${item.name}</h5>
        <div class="cart-item-price">$${unitPrice.toFixed(2)} x ${item.qty} = $${itemTotal.toFixed(2)}</div>
        <div style="margin-top: 6px; display: flex; gap: 8px; align-items: center;">
          <button class="btn btn-sm btn-outline" style="padding: 2px 8px;" onclick="changeQty(${index}, -1)">-</button>
          <span>${item.qty}</span>
          <button class="btn btn-sm btn-outline" style="padding: 2px 8px;" onclick="changeQty(${index}, 1)">+</button>
          <a href="javascript:void(0)" onclick="removeItem(${index})" style="color: #ef4444; font-size: 0.8rem; margin-left: 10px;"><i class="fas fa-trash"></i></a>
        </div>
      </div>
    `;
    itemsContainer.appendChild(row);
  });

  updatePricingTotals(subtotal);
}

function changeQty(index, diff) {
  if (!cart[index]) return;
  cart[index].qty += diff;
  if (cart[index].qty <= 0) {
    cart.splice(index, 1);
  }
  updateCartUI();
}

function removeItem(index) {
  cart.splice(index, 1);
  updateCartUI();
}

function toggleInstallation(checkbox) {
  includeInstallation = checkbox.checked;
  updateCartUI();
}

function updatePricingTotals(subtotal) {
  const installFee = includeInstallation ? 20.00 : 0.00;
  const grandTotal = subtotal + installFee;

  const subtotalEl = document.getElementById('subtotalPrice');
  const installFeeEl = document.getElementById('installFeePrice');
  const totalEl = document.getElementById('totalPrice');
  const qrAmountDisplay = document.getElementById('qrAmountDisplay');
  const khqrImage = document.getElementById('khqrImage');

  if (subtotalEl) subtotalEl.innerText = `$${subtotal.toFixed(2)}`;
  if (installFeeEl) installFeeEl.innerText = `$${installFee.toFixed(2)}`;
  if (totalEl) totalEl.innerText = `$${grandTotal.toFixed(2)}`;
  if (qrAmountDisplay) qrAmountDisplay.innerText = `$${grandTotal.toFixed(2)}`;

  // Update QR Code with real grand total
  if (khqrImage) {
    khqrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=KHQR_MOTOCAR_CUSTOM_AMOUNT_${grandTotal.toFixed(2)}_USD`;
  }
}

// Drawer Controls
function openCart() {
  document.getElementById('cartDrawer').classList.add('active');
  document.getElementById('cartOverlay').classList.add('active');
}

function closeCart() {
  document.getElementById('cartDrawer').classList.remove('active');
  document.getElementById('cartOverlay').classList.remove('active');
}

// Checkout Modal
function openCheckout() {
  if (cart.length === 0) {
    alert('សូមដាក់ទំនិញចូលកន្ត្រកជាមុនសិន!');
    return;
  }
  closeCart();
  document.getElementById('checkoutModal').classList.add('active');
}

function switchPayTab(tabKey, btn) {
  document.querySelectorAll('.payment-tabs .tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  document.getElementById('payKHQR').classList.toggle('hidden', tabKey !== 'khqr');
  document.getElementById('payCOD').classList.toggle('hidden', tabKey !== 'cod');
  document.getElementById('payInvoice').classList.toggle('hidden', tabKey !== 'invoice');
}

function confirmPayment() {
  alert('អបអរសាទរ! ការបញ្ជាទិញរបស់លោកអ្នកបានជោគជ័យ។ លេខកូដតាមដានរបស់អ្នកគឺ: MC-8892');
  cart = [];
  updateCartUI();
  closeModal('checkoutModal');
}

// RFQ & Generic Modals
function openRFQModal() {
  document.getElementById('rfqModal').classList.add('active');
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('active');
}

function submitRFQ(e) {
  e.preventDefault();
  alert('សំណើសុំសម្រង់តម្លៃបោះដុំ (RFQ) របស់អ្នកត្រូវបានផ្ញើជោគជ័យ! ផ្នែកលក់ B2B នឹងទាក់ទងមកលោកអ្នកក្នុងរយៈពេល ២ ម៉ោង។');
  closeModal('rfqModal');
}

// Order Tracking Simulation
function checkTracking() {
  const code = document.getElementById('trackingInput').value.trim();
  if (!code) {
    alert('សូមបញ្ចូលលេខកូដកុម្ម៉ង់ទិញ!');
    return;
  }

  const resultContainer = document.getElementById('trackingResult');
  resultContainer.style.opacity = '0.5';
  
  setTimeout(() => {
    resultContainer.style.opacity = '1';
    alert(`បានរកឃើញទិន្នន័យសម្រាប់កូដ ${code}: កញ្ចប់ទំនិញកំពុងស្ថិតក្នុងដំណាក់កាលដឹកជញ្ជូនរហ័ស។`);
  }, 400);
}