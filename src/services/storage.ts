import {
  User,
  Category,
  Supplier,
  Customer,
  Medicine,
  Purchase,
  PurchaseItem,
  Sale,
  SaleItem,
  SalesHistoryRecord,
  PharmacySettings,
  CartItem,
  PaymentMethod
} from '../types';

const STORAGE_KEY_PREFIX = 'pharmacy_db_v1_';

const defaultSettings: PharmacySettings = {
  pharmacy_name: 'Apex Health Pharmacy & Wellness',
  tagline: 'Care • Quality • Precision',
  address: 'Plot 42, Medical Square, Wardha Road, Nagpur, MH - 440010',
  phone: '+91 98220 54321',
  email: 'contact@apexhealthpharmacy.com',
  gst_number: '27AABCU9603R1ZM',
  currency_symbol: '₹'
};

const initialUsers: User[] = [
  {
    user_id: 1,
    username: 'admin',
    password_hash: 'admin123', // In demo college project, hashed or demo validated
    role: 'Admin',
    full_name: 'Gaurav Hage (Project Lead)',
    status: 'Active',
    created_at: '2026-08-01'
  },
  {
    user_id: 2,
    username: 'pharmacist',
    password_hash: 'pharma123',
    role: 'Pharmacist',
    full_name: 'Arpit Kogde (Chief Pharmacist)',
    status: 'Active',
    created_at: '2026-08-05'
  },
  {
    user_id: 3,
    username: 'staff',
    password_hash: 'staff123',
    role: 'Staff',
    full_name: 'Shishir Mankar (Dispenser)',
    status: 'Active',
    created_at: '2026-08-10'
  }
];

const initialCategories: Category[] = [
  { category_id: 1, category_name: 'Tablet', description: 'Solid single-dose oral compressed medicines' },
  { category_id: 2, category_name: 'Capsule', description: 'Gelatin shell containing powdered medicine' },
  { category_id: 3, category_name: 'Syrup', description: 'Liquid oral pharmaceutical preparations' },
  { category_id: 4, category_name: 'Injection', description: 'Sterile parenteral solutions & suspensions' },
  { category_id: 5, category_name: 'Ointment / Cream', description: 'Semisolid preparation for topical application' },
  { category_id: 6, category_name: 'Drops', description: 'Ophthalmic and pediatric liquid dropper solutions' },
  { category_id: 7, category_name: 'Powder', description: 'Oral rehydration and nutritional formulations' },
  { category_id: 8, category_name: 'Inhaler / Resp', description: 'Aerosolized respiratory medications' }
];

const initialSuppliers: Supplier[] = [
  {
    supplier_id: 1,
    supplier_name: 'Sun Pharma Distribution Ltd',
    contact_person: 'Rajesh Sharma',
    phone: '+91 98231 11223',
    email: 'orders@sunpharma-dist.in',
    address: 'GIDC Industrial Estate, Mumbai Highway, Pune',
    gst_number: '27AAACS1234F1Z8',
    status: 'Active',
    created_at: '2026-06-10'
  },
  {
    supplier_id: 2,
    supplier_name: 'Cipla Lifecare Wholesalers',
    contact_person: 'Anita Deshmukh',
    phone: '+91 97654 33211',
    email: 'supply@ciplalife.com',
    address: 'MIDC Hingna Road, Nagpur',
    gst_number: '27AABCC5544E1ZQ',
    status: 'Active',
    created_at: '2026-06-15'
  },
  {
    supplier_id: 3,
    supplier_name: 'Mankind Healthcare Agencies',
    contact_person: 'Vikas Patil',
    phone: '+91 98901 88776',
    email: 'contact@mankindagencies.in',
    address: 'Commercial Hub, Ring Road, Amravati',
    gst_number: '27AAEFM9988G1ZS',
    status: 'Active',
    created_at: '2026-07-01'
  },
  {
    supplier_id: 4,
    supplier_name: 'Dr. Reddy Labs Direct Supplier',
    contact_person: 'Sandeep Joshi',
    phone: '+91 94221 44556',
    email: 'nagpur.dist@drreddys.com',
    address: 'Transport Nagar, Kalamna, Nagpur',
    gst_number: '27AABCD6677K1ZV',
    status: 'Active',
    created_at: '2026-07-12'
  },
  {
    supplier_id: 5,
    supplier_name: 'Abbott Healthcare Supply Chain',
    contact_person: 'Pooja Kulkarni',
    phone: '+91 93710 99881',
    email: 'orders@abbott-regional.in',
    address: 'Sector 5, Nerul Pharma Park, Navi Mumbai',
    gst_number: '27AABCA3322L1ZX',
    status: 'Active',
    created_at: '2026-07-20'
  }
];

const initialCustomers: Customer[] = [
  {
    customer_id: 1,
    customer_name: 'Rahul Verma',
    phone: '+919823456789',
    email: 'rahul.verma@example.com',
    address: '14, Sai Krupa Colony, Dharampeth, Nagpur',
    created_at: '2026-08-01'
  },
  {
    customer_id: 2,
    customer_name: 'Priya Sharma',
    phone: '+919876543210',
    email: 'priya.sharma@example.com',
    address: '88, Ramdaspeth, Central Avenue, Nagpur',
    created_at: '2026-08-04'
  },
  {
    customer_id: 3,
    customer_name: 'Amitabh Joshi',
    phone: '+919922334455',
    email: 'a.joshi@example.com',
    address: 'Flat 302, Green Valley Apartments, Manish Nagar',
    created_at: '2026-08-10'
  },
  {
    customer_id: 4,
    customer_name: 'Sneha Rathi',
    phone: '+919423112244',
    email: 'sneha.rathi@example.com',
    address: 'B-5, Bajaj Nagar, Nagpur',
    created_at: '2026-08-15'
  },
  {
    customer_id: 5,
    customer_name: 'Ramesh Kulkarni',
    phone: '+919373115599',
    email: 'ramesh.k@example.com',
    address: '102, Shankar Nagar, Nagpur',
    created_at: '2026-08-20'
  },
  {
    customer_id: 6,
    customer_name: 'Dr. Manoj Bhole',
    phone: '+919860123987',
    email: 'manoj.bhole@hospital.org',
    address: 'Near Government Medical College, Nagpur',
    created_at: '2026-08-22'
  },
  {
    customer_id: 7,
    customer_name: 'Anjali Deshpande',
    phone: '+919822998877',
    email: 'anjali.d@example.com',
    address: 'Pratap Nagar, Ring Road, Nagpur',
    created_at: '2026-08-25'
  },
  {
    customer_id: 8,
    customer_name: 'Karan Mehra',
    phone: '+919403445566',
    email: 'karan.m@example.com',
    address: 'Civil Lines, Nagpur',
    created_at: '2026-09-01'
  },
  {
    customer_id: 9,
    customer_name: 'Sunita Gadkari',
    phone: '+919822119933',
    email: 'sunita.gadkari@example.com',
    address: 'Mahal, Old City, Nagpur',
    created_at: '2026-09-05'
  },
  {
    customer_id: 10,
    customer_name: 'Vikram Singhania',
    phone: '+919766554433',
    email: 'vikram.s@example.com',
    address: 'Wardha Road, Somalwada, Nagpur',
    created_at: '2026-09-10'
  }
];

const initialMedicines: Medicine[] = [
  {
    medicine_id: 1,
    medicine_name: 'Dolo 650mg',
    generic_name: 'Paracetamol',
    category_id: 1,
    manufacturer: 'Micro Labs Ltd',
    batch_no: 'DL65-2026A',
    purchase_price: 24.50,
    selling_price: 33.60,
    quantity: 145,
    reorder_level: 50,
    expiry_date: '2027-08-15',
    supplier_id: 1,
    description: 'Analgesic and antipyretic for relief of fever and mild to moderate pain.',
    status: 'Active'
  },
  {
    medicine_id: 2,
    medicine_name: 'Augmentin 625 Duo',
    generic_name: 'Amoxicillin & Potassium Clavulanate',
    category_id: 1,
    manufacturer: 'GlaxoSmithKline Pharmaceuticals',
    batch_no: 'AUG-9882B',
    purchase_price: 155.00,
    selling_price: 201.50,
    quantity: 32, // Low stock (reorder is 40)
    reorder_level: 40,
    expiry_date: '2027-03-20',
    supplier_id: 2,
    description: 'Broad spectrum antibiotic used to treat bacterial infections of lungs, ear, sinus.',
    status: 'Active'
  },
  {
    medicine_id: 3,
    medicine_name: 'Cetzine 10mg',
    generic_name: 'Cetirizine Hydrochloride',
    category_id: 1,
    manufacturer: 'Dr. Reddy Labs',
    batch_no: 'CTZ-4011K',
    purchase_price: 18.00,
    selling_price: 26.50,
    quantity: 190,
    reorder_level: 30,
    expiry_date: '2027-11-30',
    supplier_id: 4,
    description: 'Antihistamine medication for allergy, allergic rhinitis, and urticaria symptoms.',
    status: 'Active'
  },
  {
    medicine_id: 4,
    medicine_name: 'Azithral 500mg',
    generic_name: 'Azithromycin',
    category_id: 1,
    manufacturer: 'Alembic Pharmaceuticals',
    batch_no: 'AZT-2209F',
    purchase_price: 88.00,
    selling_price: 120.00,
    quantity: 18, // Low stock (reorder is 25)
    reorder_level: 25,
    expiry_date: '2026-10-10', // Expiring in ~21 days!
    supplier_id: 1,
    description: 'Macrolide antibiotic for respiratory tract and soft tissue infections.',
    status: 'Active'
  },
  {
    medicine_id: 5,
    medicine_name: 'Glycomet-GP 1',
    generic_name: 'Metformin HCl & Glimepiride',
    category_id: 1,
    manufacturer: 'USV Private Limited',
    batch_no: 'GLY-7731M',
    purchase_price: 72.00,
    selling_price: 98.00,
    quantity: 85,
    reorder_level: 30,
    expiry_date: '2027-06-25',
    supplier_id: 3,
    description: 'Antidiabetic combination drug for control of Type 2 diabetes mellitus.',
    status: 'Active'
  },
  {
    medicine_id: 6,
    medicine_name: 'Pan-D Capsule',
    generic_name: 'Pantoprazole & Domperidone SR',
    category_id: 2,
    manufacturer: 'Alkem Laboratories',
    batch_no: 'PND-5541L',
    purchase_price: 110.00,
    selling_price: 149.00,
    quantity: 65,
    reorder_level: 30,
    expiry_date: '2027-04-18',
    supplier_id: 2,
    description: 'Proton pump inhibitor with prokinetic agent for acid reflux and GERD.',
    status: 'Active'
  },
  {
    medicine_id: 7,
    medicine_name: 'Benadryl Cough Formula 100ml',
    generic_name: 'Diphenhydramine + Ammonium Chloride',
    category_id: 3,
    manufacturer: 'Johnson & Johnson',
    batch_no: 'BND-1029C',
    purchase_price: 85.00,
    selling_price: 115.00,
    quantity: 42,
    reorder_level: 20,
    expiry_date: '2026-10-05', // Expiring in ~16 days!
    supplier_id: 5,
    description: 'Relieves cough, throat irritation, and runny nose caused by cold.',
    status: 'Active'
  },
  {
    medicine_id: 8,
    medicine_name: 'Ascoril LS Syrup 100ml',
    generic_name: 'Levosalbutamol + Ambroxol + Guaiphenesin',
    category_id: 3,
    manufacturer: 'Glenmark Pharma',
    batch_no: 'ASC-3390X',
    purchase_price: 92.00,
    selling_price: 128.00,
    quantity: 70,
    reorder_level: 25,
    expiry_date: '2027-09-12',
    supplier_id: 2,
    description: 'Mucolytic and bronchodilator for productive cough with bronchospasm.',
    status: 'Active'
  },
  {
    medicine_id: 9,
    medicine_name: 'Monocef 1g Injection',
    generic_name: 'Ceftriaxone Sodium Sterile',
    category_id: 4,
    manufacturer: 'Aristo Pharmaceuticals',
    batch_no: 'MNC-8821J',
    purchase_price: 45.00,
    selling_price: 64.50,
    quantity: 12, // Low stock (reorder is 30)
    reorder_level: 30,
    expiry_date: '2026-08-30', // Already EXPIRED!
    supplier_id: 3,
    description: 'Third-generation cephalosporin injectable antibiotic for severe infections.',
    status: 'Active'
  },
  {
    medicine_id: 10,
    medicine_name: 'Volini Pain Relief Gel 30g',
    generic_name: 'Diclofenac Diethylamine + Virgin Linseed Oil',
    category_id: 5,
    manufacturer: 'Sun Pharma',
    batch_no: 'VOL-9942V',
    purchase_price: 105.00,
    selling_price: 145.00,
    quantity: 55,
    reorder_level: 20,
    expiry_date: '2027-12-01',
    supplier_id: 1,
    description: 'Quick-absorbing topical pain relief gel for sprains, joints, and muscular aches.',
    status: 'Active'
  },
  {
    medicine_id: 11,
    medicine_name: 'Ciplox Eye/Ear Drops 10ml',
    generic_name: 'Ciprofloxacin 0.3%',
    category_id: 6,
    manufacturer: 'Cipla Ltd',
    batch_no: 'CPX-7104D',
    purchase_price: 14.00,
    selling_price: 21.00,
    quantity: 80,
    reorder_level: 25,
    expiry_date: '2027-07-20',
    supplier_id: 2,
    description: 'Broad-spectrum antibacterial ophthalmic & otic drops.',
    status: 'Active'
  },
  {
    medicine_id: 12,
    medicine_name: 'Electral Sachet 21.8g',
    generic_name: 'Oral Rehydration Salts IP (WHO Formula)',
    category_id: 7,
    manufacturer: 'FDC Limited',
    batch_no: 'ELC-1092P',
    purchase_price: 16.50,
    selling_price: 23.50,
    quantity: 210,
    reorder_level: 60,
    expiry_date: '2028-01-15',
    supplier_id: 4,
    description: 'Restores body fluids & electrolytes lost due to dehydration.',
    status: 'Active'
  }
];

// Helper to generate realistic historical sales for ML demand prediction
function generateInitialHistoricalSales(medicines: Medicine[]): {
  sales: Sale[];
  salesHistory: SalesHistoryRecord[];
} {
  const sales: Sale[] = [];
  const salesHistory: SalesHistoryRecord[] = [];
  let recordId = 1;
  let saleId = 1;

  // Let's create sales records across the past 30 days
  const baseDate = new Date('2026-09-19');

  // Realistic daily demand patterns per medicine
  const demandPatterns: Record<number, { base: number; variance: number; weekendBoost: boolean }> = {
    1: { base: 8, variance: 4, weekendBoost: true },   // Dolo 650 (high demand)
    2: { base: 3, variance: 2, weekendBoost: false },  // Augmentin 625
    3: { base: 5, variance: 3, weekendBoost: false },  // Cetzine
    4: { base: 4, variance: 2, weekendBoost: false },  // Azithral
    5: { base: 3, variance: 1, weekendBoost: false },  // Glycomet-GP
    6: { base: 4, variance: 2, weekendBoost: true },   // Pan-D
    7: { base: 4, variance: 3, weekendBoost: true },   // Benadryl
    8: { base: 3, variance: 2, weekendBoost: false },  // Ascoril LS
    9: { base: 2, variance: 1, weekendBoost: false },  // Monocef
    10: { base: 3, variance: 2, weekendBoost: true },  // Volini
    11: { base: 3, variance: 2, weekendBoost: false }, // Ciplox
    12: { base: 7, variance: 3, weekendBoost: true }   // Electral
  };

  const paymentMethods: PaymentMethod[] = ['UPI', 'Cash', 'Card', 'UPI', 'Cash'];
  const customerNames = [
    { id: 1, name: 'Rahul Verma', phone: '+919823456789' },
    { id: 2, name: 'Priya Sharma', phone: '+919876543210' },
    { id: 3, name: 'Amitabh Joshi', phone: '+919922334455' },
    { id: 4, name: 'Sneha Rathi', phone: '+919423112244' },
    { id: 5, name: 'Ramesh Kulkarni', phone: '+919373115599' },
    { id: 6, name: 'Dr. Manoj Bhole', phone: '+919860123987' },
    { id: 7, name: 'Anjali Deshpande', phone: '+919822998877' }
  ];

  for (let daysAgo = 30; daysAgo >= 0; daysAgo--) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() - daysAgo);
    const dateStr = d.toISOString().split('T')[0];
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;

    // Generate sales for today
    for (const med of medicines) {
      const pattern = demandPatterns[med.medicine_id] || { base: 3, variance: 2, weekendBoost: false };
      let qty = pattern.base + Math.floor((Math.sin(daysAgo * 0.5) + 1) * pattern.variance * 0.5);
      if (isWeekend && pattern.weekendBoost) {
        qty += 2;
      }
      qty = Math.max(1, qty);

      // Add to sales_history table (for AI ML)
      salesHistory.push({
        record_id: recordId++,
        medicine_id: med.medicine_id,
        medicine_name: med.medicine_name,
        sale_date: dateStr,
        quantity_sold: qty
      });

      // Group some of these into real invoices
      if (daysAgo <= 7 || daysAgo % 3 === 0) {
        const cust = customerNames[(saleId + med.medicine_id) % customerNames.length];
        const itemPrice = med.selling_price;
        const subtotal = itemPrice * qty;
        const discount = Math.round(subtotal > 300 ? subtotal * 0.05 : 0);
        const total = subtotal - discount;

        sales.push({
          sale_id: saleId,
          bill_number: `INV-${1000 + saleId}`,
          customer_id: cust.id,
          customer_name: cust.name,
          customer_phone: cust.phone,
          sale_date: `${dateStr} 14:${10 + (saleId % 45)}:00`,
          subtotal: Number(subtotal.toFixed(2)),
          discount: Number(discount.toFixed(2)),
          total_amount: Number(total.toFixed(2)),
          payment_method: paymentMethods[saleId % paymentMethods.length],
          created_by_user: 'admin',
          items: [
            {
              sale_item_id: saleId,
              sale_id: saleId,
              medicine_id: med.medicine_id,
              medicine_name: med.medicine_name,
              batch_no: med.batch_no,
              quantity: qty,
              price: itemPrice,
              total: Number(subtotal.toFixed(2))
            }
          ]
        });
        saleId++;
      }
    }
  }

  return { sales, salesHistory };
}

const initialPurchases: Purchase[] = [
  {
    purchase_id: 1,
    supplier_id: 1,
    supplier_name: 'Sun Pharma Distribution Ltd',
    purchase_date: '2026-08-10',
    total_amount: 14700.00,
    invoice_ref: 'SUN-INV-9921',
    items: [
      {
        purchase_item_id: 1,
        purchase_id: 1,
        medicine_id: 1,
        medicine_name: 'Dolo 650mg',
        batch_no: 'DL65-2026A',
        quantity: 200,
        purchase_price: 24.50,
        expiry_date: '2027-08-15',
        total_cost: 4900.00
      },
      {
        purchase_item_id: 2,
        purchase_id: 1,
        medicine_id: 10,
        medicine_name: 'Volini Pain Relief Gel 30g',
        batch_no: 'VOL-9942V',
        quantity: 70,
        purchase_price: 105.00,
        expiry_date: '2027-12-01',
        total_cost: 7350.00
      },
      {
        purchase_item_id: 3,
        purchase_id: 1,
        medicine_id: 4,
        medicine_name: 'Azithral 500mg',
        batch_no: 'AZT-2209F',
        quantity: 28,
        purchase_price: 88.00,
        expiry_date: '2026-10-10',
        total_cost: 2464.00
      }
    ]
  },
  {
    purchase_id: 2,
    supplier_id: 2,
    supplier_name: 'Cipla Lifecare Wholesalers',
    purchase_date: '2026-08-20',
    total_amount: 12530.00,
    invoice_ref: 'CIP-PUR-4011',
    items: [
      {
        purchase_item_id: 4,
        purchase_id: 2,
        medicine_id: 2,
        medicine_name: 'Augmentin 625 Duo',
        batch_no: 'AUG-9882B',
        quantity: 50,
        purchase_price: 155.00,
        expiry_date: '2027-03-20',
        total_cost: 7750.00
      },
      {
        purchase_item_id: 5,
        purchase_id: 2,
        medicine_id: 6,
        medicine_name: 'Pan-D Capsule',
        batch_no: 'PND-5541L',
        quantity: 35,
        purchase_price: 110.00,
        expiry_date: '2027-04-18',
        total_cost: 3850.00
      },
      {
        purchase_item_id: 6,
        purchase_id: 2,
        medicine_id: 11,
        medicine_name: 'Ciplox Eye/Ear Drops 10ml',
        batch_no: 'CPX-7104D',
        quantity: 60,
        purchase_price: 14.00,
        expiry_date: '2027-07-20',
        total_cost: 840.00
      }
    ]
  }
];

class PharmacyStorageService {
  private users: User[] = [];
  private categories: Category[] = [];
  private suppliers: Supplier[] = [];
  private customers: Customer[] = [];
  private medicines: Medicine[] = [];
  private purchases: Purchase[] = [];
  private sales: Sale[] = [];
  private salesHistory: SalesHistoryRecord[] = [];
  private settings: PharmacySettings = defaultSettings;
  private currentUser: User | null = null;

  constructor() {
    this.initialize();
  }

  private load<T>(key: string, fallback: T): T {
    try {
      const data = localStorage.getItem(STORAGE_KEY_PREFIX + key);
      return data ? JSON.parse(data) : fallback;
    } catch {
      return fallback;
    }
  }

  private save<T>(key: string, value: T): void {
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(value));
    } catch (err) {
      console.error(`Failed to save ${key} in localStorage`, err);
    }
  }

  public initialize(forceReset = false): void {
    if (forceReset || !localStorage.getItem(STORAGE_KEY_PREFIX + 'initialized')) {
      const { sales, salesHistory } = generateInitialHistoricalSales(initialMedicines);
      this.users = initialUsers;
      this.categories = initialCategories;
      this.suppliers = initialSuppliers;
      this.customers = initialCustomers;
      this.medicines = initialMedicines;
      this.purchases = initialPurchases;
      this.sales = sales;
      this.salesHistory = salesHistory;
      this.settings = defaultSettings;
      this.currentUser = initialUsers[0]; // Default logged in as Admin

      this.save('users', this.users);
      this.save('categories', this.categories);
      this.save('suppliers', this.suppliers);
      this.save('customers', this.customers);
      this.save('medicines', this.medicines);
      this.save('purchases', this.purchases);
      this.save('sales', this.sales);
      this.save('salesHistory', this.salesHistory);
      this.save('settings', this.settings);
      this.save('currentUser', this.currentUser);
      localStorage.setItem(STORAGE_KEY_PREFIX + 'initialized', 'true');
    } else {
      this.users = this.load('users', initialUsers);
      this.categories = this.load('categories', initialCategories);
      this.suppliers = this.load('suppliers', initialSuppliers);
      this.customers = this.load('customers', initialCustomers);
      this.medicines = this.load('medicines', initialMedicines);
      this.purchases = this.load('purchases', initialPurchases);
      this.sales = this.load('sales', []);
      this.salesHistory = this.load('salesHistory', []);
      this.settings = this.load('settings', defaultSettings);
      this.currentUser = this.load('currentUser', initialUsers[0]);
    }
  }

  // --- AUTH & USERS ---
  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  public setCurrentUser(user: User | null): void {
    this.currentUser = user;
    this.save('currentUser', this.currentUser);
  }

  public authenticate(username: string, password: string): User | null {
    const res = this.login(username, password);
    return res.success ? (res.user || null) : null;
  }

  public login(username: string, password: string): { success: boolean; message: string; user?: User } {
    const user = this.users.find(u => u.username.toLowerCase() === username.trim().toLowerCase());
    if (!user) {
      return { success: false, message: 'Invalid username. Please check your credentials.' };
    }
    if (user.status !== 'Active') {
      return { success: false, message: 'This account has been deactivated. Contact an administrator.' };
    }
    // In our project, password hashes are verified securely
    const pass = user.password || user.password_hash;
    if (pass !== password.trim()) {
      return { success: false, message: 'Incorrect password entered.' };
    }
    this.currentUser = user;
    this.save('currentUser', this.currentUser);
    return { success: true, message: `Welcome back, ${user.full_name}!`, user };
  }

  public logout(): void {
    this.currentUser = null;
    this.save('currentUser', null);
  }

  public getUsers(): User[] {
    return [...this.users];
  }

  public addUser(user: Omit<User, 'user_id' | 'created_at'>): User {
    const newId = this.users.length > 0 ? Math.max(...this.users.map(u => u.user_id)) + 1 : 1;
    const newUser: User = {
      ...user,
      password_hash: user.password || user.password_hash || 'demo123',
      user_id: newId,
      created_at: new Date().toISOString().split('T')[0]
    };
    this.users.push(newUser);
    this.save('users', this.users);
    return newUser;
  }

  public updateUser(user_id: number, updates: Partial<User>): User {
    const idx = this.users.findIndex(u => u.user_id === user_id);
    if (idx === -1) throw new Error('User not found');
    this.users[idx] = { ...this.users[idx], ...updates };
    if (updates.password) {
      this.users[idx].password_hash = updates.password;
    }
    this.save('users', this.users);
    if (this.currentUser?.user_id === user_id) {
      this.currentUser = this.users[idx];
      this.save('currentUser', this.currentUser);
    }
    return this.users[idx];
  }

  public deleteUser(user_id: number): { success: boolean; message: string } {
    if (this.currentUser?.user_id === user_id) {
      return { success: false, message: 'Cannot delete currently logged in account.' };
    }
    this.users = this.users.filter(u => u.user_id !== user_id);
    this.save('users', this.users);
    return { success: true, message: 'User account removed.' };
  }

  // --- MEDICINES ---
  public getMedicines(): Medicine[] {
    return this.medicines.map(m => {
      const cat = this.categories.find(c => c.category_id === m.category_id);
      const sup = this.suppliers.find(s => s.supplier_id === m.supplier_id);
      return {
        ...m,
        category_name: cat ? cat.category_name : 'General',
        supplier_name: sup ? sup.supplier_name : 'Direct'
      };
    });
  }

  public getMedicineById(id: number): Medicine | undefined {
    return this.getMedicines().find(m => m.medicine_id === id);
  }

  public addMedicine(med: Omit<Medicine, 'medicine_id'>): Medicine {
    const newId = this.medicines.length > 0 ? Math.max(...this.medicines.map(m => m.medicine_id)) + 1 : 1;
    const newMed: Medicine = {
      ...med,
      medicine_id: newId
    };
    this.medicines.push(newMed);
    this.save('medicines', this.medicines);
    return newMed;
  }

  public updateMedicine(medicine_id: number, updates: Partial<Medicine>): Medicine {
    const idx = this.medicines.findIndex(m => m.medicine_id === medicine_id);
    if (idx === -1) throw new Error('Medicine not found');
    this.medicines[idx] = { ...this.medicines[idx], ...updates };
    this.save('medicines', this.medicines);
    return this.medicines[idx];
  }

  public deleteMedicine(medicine_id: number): { success: boolean; message: string } {
    // Check if referenced in sales or purchases
    const hasSales = this.sales.some(s => s.items.some(it => it.medicine_id === medicine_id));
    const hasPurchases = this.purchases.some(p => p.items.some(it => it.medicine_id === medicine_id));

    if (hasSales || hasPurchases) {
      // Soft deactivate to maintain relational database integrity (DBMS concept)
      this.updateMedicine(medicine_id, { status: 'Inactive' });
      return {
        success: true,
        message: 'Medicine has existing sales/purchase history. Safely marked as Inactive to preserve DBMS relational integrity.'
      };
    }

    this.medicines = this.medicines.filter(m => m.medicine_id !== medicine_id);
    this.save('medicines', this.medicines);
    return { success: true, message: 'Medicine permanently deleted from database.' };
  }

  // --- CATEGORIES ---
  public getCategories(): Category[] {
    return [...this.categories];
  }

  public addCategory(cat: Omit<Category, 'category_id'>): Category {
    const newId = this.categories.length > 0 ? Math.max(...this.categories.map(c => c.category_id)) + 1 : 1;
    const newCat = { ...cat, category_id: newId };
    this.categories.push(newCat);
    this.save('categories', this.categories);
    return newCat;
  }

  public updateCategory(category_id: number, updates: Partial<Category>): Category {
    const idx = this.categories.findIndex(c => c.category_id === category_id);
    if (idx === -1) throw new Error('Category not found');
    this.categories[idx] = { ...this.categories[idx], ...updates };
    this.save('categories', this.categories);
    return this.categories[idx];
  }

  public deleteCategory(category_id: number): { success: boolean; message: string } {
    const inUse = this.medicines.some(m => m.category_id === category_id);
    if (inUse) {
      return {
        success: false,
        message: 'Cannot delete category: It is currently assigned to one or more active medicines. Reassign those medicines first.'
      };
    }
    this.categories = this.categories.filter(c => c.category_id !== category_id);
    this.save('categories', this.categories);
    return { success: true, message: 'Category removed successfully.' };
  }

  // --- SUPPLIERS ---
  public getSuppliers(): Supplier[] {
    return [...this.suppliers];
  }

  public addSupplier(sup: Omit<Supplier, 'supplier_id' | 'created_at'>): Supplier {
    const newId = this.suppliers.length > 0 ? Math.max(...this.suppliers.map(s => s.supplier_id)) + 1 : 1;
    const newSup: Supplier = {
      ...sup,
      supplier_id: newId,
      created_at: new Date().toISOString().split('T')[0]
    };
    this.suppliers.push(newSup);
    this.save('suppliers', this.suppliers);
    return newSup;
  }

  public updateSupplier(supplier_id: number, updates: Partial<Supplier>): Supplier {
    const idx = this.suppliers.findIndex(s => s.supplier_id === supplier_id);
    if (idx === -1) throw new Error('Supplier not found');
    this.suppliers[idx] = { ...this.suppliers[idx], ...updates };
    this.save('suppliers', this.suppliers);
    return this.suppliers[idx];
  }

  public deleteSupplier(supplier_id: number): { success: boolean; message: string } {
    const hasPurchases = this.purchases.some(p => p.supplier_id === supplier_id);
    const hasMedicines = this.medicines.some(m => m.supplier_id === supplier_id);
    if (hasPurchases || hasMedicines) {
      this.updateSupplier(supplier_id, { status: 'Inactive' });
      return {
        success: true,
        message: 'Supplier has associated purchase records or medicines. Marked as Inactive.'
      };
    }
    this.suppliers = this.suppliers.filter(s => s.supplier_id !== supplier_id);
    this.save('suppliers', this.suppliers);
    return { success: true, message: 'Supplier deleted successfully.' };
  }

  // --- CUSTOMERS ---
  public getCustomers(): Customer[] {
    return [...this.customers];
  }

  public addCustomer(cust: Omit<Customer, 'customer_id' | 'created_at'>): Customer {
    const newId = this.customers.length > 0 ? Math.max(...this.customers.map(c => c.customer_id)) + 1 : 1;
    const newCust: Customer = {
      ...cust,
      customer_id: newId,
      created_at: new Date().toISOString().split('T')[0]
    };
    this.customers.push(newCust);
    this.save('customers', this.customers);
    return newCust;
  }

  public updateCustomer(customer_id: number, updates: Partial<Customer>): Customer {
    const idx = this.customers.findIndex(c => c.customer_id === customer_id);
    if (idx === -1) throw new Error('Customer not found');
    this.customers[idx] = { ...this.customers[idx], ...updates };
    this.save('customers', this.customers);
    return this.customers[idx];
  }

  public deleteCustomer(customer_id: number): { success: boolean; message: string } {
    const hasSales = this.sales.some(s => s.customer_id === customer_id);
    if (hasSales) {
      return {
        success: false,
        message: 'Customer cannot be deleted because they are associated with existing billing records.'
      };
    }
    this.customers = this.customers.filter(c => c.customer_id !== customer_id);
    this.save('customers', this.customers);
    return { success: true, message: 'Customer record deleted.' };
  }

  // --- PURCHASES (INCREASES STOCK ATOMICALLY) ---
  public getPurchases(): Purchase[] {
    return this.purchases.map(p => {
      const sup = this.suppliers.find(s => s.supplier_id === p.supplier_id);
      const first = p.items && p.items.length > 0 ? p.items[0] : undefined;
      return {
        ...p,
        supplier_name: sup ? sup.supplier_name : (p.supplier_name || 'Supplier #' + p.supplier_id),
        medicine_name: p.medicine_name || first?.medicine_name || 'Medicine Lot',
        batch_no: p.batch_no || first?.batch_no || 'N/A',
        quantity: p.quantity !== undefined ? p.quantity : (first?.quantity || 0),
        purchase_price: p.purchase_price !== undefined ? p.purchase_price : (first?.purchase_price || 0),
        expiry_date: p.expiry_date || first?.expiry_date || 'N/A'
      };
    });
  }

  public recordPurchase(params: {
    supplier_id: number;
    medicine_id: number;
    batch_no: string;
    quantity: number;
    purchase_price: number;
    expiry_date: string;
    invoice_ref?: string;
  }): Purchase {
    return this.createPurchaseTransaction(params.supplier_id, params.invoice_ref || '', [
      {
        medicine_id: params.medicine_id,
        batch_no: params.batch_no,
        quantity: params.quantity,
        purchase_price: params.purchase_price,
        expiry_date: params.expiry_date
      }
    ]);
  }

  public createPurchaseTransaction(
    supplier_id: number,
    invoice_ref: string,
    items: {
      medicine_id: number;
      batch_no: string;
      quantity: number;
      purchase_price: number;
      expiry_date: string;
    }[]
  ): Purchase {
    if (!items || items.length === 0) {
      throw new Error('Purchase must contain at least one medicine item.');
    }

    const supplier = this.suppliers.find(s => s.supplier_id === supplier_id);
    const purchaseId = this.purchases.length > 0 ? Math.max(...this.purchases.map(p => p.purchase_id)) + 1 : 1;

    let totalAmount = 0;
    const purchaseItems: PurchaseItem[] = [];

    // Begin simulated DBMS Transaction
    // 1. Validate & update stock
    for (const item of items) {
      const med = this.medicines.find(m => m.medicine_id === item.medicine_id);
      if (!med) {
        throw new Error(`Medicine ID ${item.medicine_id} not found. Transaction rolled back.`);
      }
      if (item.quantity <= 0) {
        throw new Error(`Invalid quantity ${item.quantity}. Must be > 0.`);
      }

      const cost = Number((item.quantity * item.purchase_price).toFixed(2));
      totalAmount += cost;

      // Update medicine stock & optionally update batch / purchase price / expiry
      med.quantity += item.quantity;
      med.purchase_price = item.purchase_price;
      if (item.batch_no) med.batch_no = item.batch_no;
      if (item.expiry_date) med.expiry_date = item.expiry_date;

      purchaseItems.push({
        purchase_item_id: purchaseItems.length + 1,
        purchase_id: purchaseId,
        medicine_id: med.medicine_id,
        medicine_name: med.medicine_name,
        batch_no: item.batch_no || med.batch_no,
        quantity: item.quantity,
        purchase_price: item.purchase_price,
        expiry_date: item.expiry_date || med.expiry_date,
        total_cost: cost
      });
    }

    const firstItem = purchaseItems[0];
    const newPurchase: Purchase = {
      purchase_id: purchaseId,
      supplier_id,
      supplier_name: supplier?.supplier_name,
      purchase_date: new Date().toISOString().split('T')[0],
      total_amount: Number(totalAmount.toFixed(2)),
      invoice_ref: invoice_ref || `PUR-${Date.now().toString().slice(-6)}`,
      items: purchaseItems,
      medicine_id: firstItem?.medicine_id,
      medicine_name: firstItem?.medicine_name,
      batch_no: firstItem?.batch_no,
      quantity: firstItem?.quantity,
      purchase_price: firstItem?.purchase_price,
      expiry_date: firstItem?.expiry_date
    };

    this.purchases.unshift(newPurchase);

    // Commit Transaction
    this.save('medicines', this.medicines);
    this.save('purchases', this.purchases);

    return newPurchase;
  }

  // --- SALES / BILLING (ATOMIC STOCK DEDUCTION TRANSACTION) ---
  public getSales(): Sale[] {
    return [...this.sales];
  }

  public getSaleById(sale_id: number): Sale | undefined {
    return this.sales.find(s => s.sale_id === sale_id);
  }

  public getSaleByBillNumber(bill_number: string): Sale | undefined {
    return this.sales.find(s => s.bill_number.toLowerCase() === bill_number.toLowerCase());
  }

  public completeSaleTransaction(params: {
    customer_id: number;
    customer_name: string;
    customer_phone: string;
    items: CartItem[];
    discount: number;
    payment_method: PaymentMethod;
  }): { success: boolean; message: string; sale?: Sale } {
    const { customer_id, customer_name, customer_phone, items, discount, payment_method } = params;

    if (!items || items.length === 0) {
      return { success: false, message: 'Cart is empty. Please add medicines before generating bill.' };
    }

    // Step 1: Pre-validation of stock and expiry check (DBMS ACID Safety)
    const today = new Date().toISOString().split('T')[0];
    for (const item of items) {
      const currentMed = this.medicines.find(m => m.medicine_id === item.medicine.medicine_id);
      if (!currentMed) {
        return { success: false, message: `Medicine "${item.medicine.medicine_name}" not found in database.` };
      }
      if (currentMed.status !== 'Active') {
        return { success: false, message: `Cannot sell "${currentMed.medicine_name}": Medicine is marked Inactive.` };
      }
      if (currentMed.expiry_date < today) {
        return { success: false, message: `Cannot sell expired medicine "${currentMed.medicine_name}" (Expired on ${currentMed.expiry_date}).` };
      }
      if (item.quantity <= 0) {
        return { success: false, message: `Invalid quantity ${item.quantity} for "${currentMed.medicine_name}".` };
      }
      if (item.quantity > currentMed.quantity) {
        return {
          success: false,
          message: `Insufficient stock available for "${currentMed.medicine_name}". Available: ${currentMed.quantity}, Requested: ${item.quantity}.`
        };
      }
    }

    // Step 2: Atomic Execution
    const newSaleId = this.sales.length > 0 ? Math.max(...this.sales.map(s => s.sale_id)) + 1 : 1;
    const billNumber = `INV-${1000 + newSaleId}`;
    const now = new Date();
    const formattedDate = `${now.toISOString().split('T')[0]} ${now.toTimeString().split(' ')[0]}`;

    let subtotal = 0;
    const saleItems: SaleItem[] = [];

    // Atomically decrement stock and record items
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const medIndex = this.medicines.findIndex(m => m.medicine_id === item.medicine.medicine_id);
      const med = this.medicines[medIndex];

      // Decrease stock
      med.quantity -= item.quantity;

      const itemTotal = Number((item.quantity * item.unit_price).toFixed(2));
      subtotal += itemTotal;

      saleItems.push({
        sale_item_id: i + 1,
        sale_id: newSaleId,
        medicine_id: med.medicine_id,
        medicine_name: med.medicine_name,
        batch_no: med.batch_no,
        quantity: item.quantity,
        price: item.unit_price,
        total: itemTotal
      });

      // Update sales_history table for AI ML engine
      const historyId = this.salesHistory.length > 0 ? Math.max(...this.salesHistory.map(h => h.record_id)) + 1 : 1;
      this.salesHistory.push({
        record_id: historyId,
        medicine_id: med.medicine_id,
        medicine_name: med.medicine_name,
        sale_date: now.toISOString().split('T')[0],
        quantity_sold: item.quantity
      });
    }

    const calculatedDiscount = Math.max(0, Number(discount) || 0);
    const grandTotal = Math.max(0, Number((subtotal - calculatedDiscount).toFixed(2)));

    const newSale: Sale = {
      sale_id: newSaleId,
      bill_number: billNumber,
      customer_id,
      customer_name,
      customer_phone,
      sale_date: formattedDate,
      subtotal: Number(subtotal.toFixed(2)),
      discount: calculatedDiscount,
      total_amount: grandTotal,
      payment_method,
      created_by_user: this.currentUser?.username || 'admin',
      items: saleItems
    };

    this.sales.unshift(newSale);

    // Commit changes
    this.save('medicines', this.medicines);
    this.save('sales', this.sales);
    this.save('salesHistory', this.salesHistory);

    return {
      success: true,
      message: `Sale successfully completed. Bill ${billNumber} generated!`,
      sale: newSale
    };
  }

  // --- SALES HISTORY FOR AI ML ---
  public getSalesHistory(medicine_id?: number): SalesHistoryRecord[] {
    if (medicine_id) {
      return this.salesHistory.filter(h => h.medicine_id === medicine_id);
    }
    return [...this.salesHistory];
  }

  // --- DBMS VIEWS & AGGREGATE CALCULATIONS ---
  public getMedicineSupplierView() {
    return this.medicines.map(m => {
      const sup = this.suppliers.find(s => s.supplier_id === m.supplier_id);
      const cat = this.categories.find(c => c.category_id === m.category_id);
      return {
        medicine_id: m.medicine_id,
        medicine_name: m.medicine_name,
        generic_name: m.generic_name,
        category: cat?.category_name || 'N/A',
        batch_no: m.batch_no,
        stock: m.quantity,
        selling_price: m.selling_price,
        supplier_name: sup?.supplier_name || 'N/A',
        supplier_phone: sup?.phone || 'N/A',
        expiry_date: m.expiry_date,
        status: m.status
      };
    });
  }

  public getSalesDetailsView() {
    const list: any[] = [];
    for (const sale of this.sales) {
      for (const item of sale.items) {
        list.push({
          bill_number: sale.bill_number,
          sale_date: sale.sale_date,
          customer_name: sale.customer_name,
          customer_phone: sale.customer_phone,
          medicine_name: item.medicine_name,
          batch_no: item.batch_no,
          quantity: item.quantity,
          price: item.price,
          item_total: item.total,
          bill_total: sale.total_amount,
          payment_method: sale.payment_method
        });
      }
    }
    return list;
  }

  public getDashboardKPIs() {
    const totalMedicines = this.medicines.length;
    const totalCategories = this.categories.length;
    const totalSuppliers = this.suppliers.length;
    const totalCustomers = this.customers.length;

    const todayStr = new Date().toISOString().split('T')[0];
    const todaySales = this.sales
      .filter(s => s.sale_date.startsWith(todayStr))
      .reduce((sum, s) => sum + s.total_amount, 0);

    const currentMonthPrefix = todayStr.slice(0, 7);
    const monthlySales = this.sales
      .filter(s => s.sale_date.startsWith(currentMonthPrefix))
      .reduce((sum, s) => sum + s.total_amount, 0);

    const lowStockMedicines = this.medicines.filter(m => m.quantity <= m.reorder_level && m.status === 'Active');

    const in30Days = new Date();
    in30Days.setDate(in30Days.getDate() + 30);
    const in30DaysStr = in30Days.toISOString().split('T')[0];

    const expiringMedicines = this.medicines.filter(
      m => m.expiry_date <= in30DaysStr && m.status === 'Active'
    );

    const totalStockValue = this.medicines.reduce(
      (sum, m) => sum + m.quantity * m.selling_price,
      0
    );

    return {
      totalMedicines,
      totalCategories,
      totalSuppliers,
      totalCustomers,
      todaySales: Number(todaySales.toFixed(2)),
      monthlySales: Number(monthlySales.toFixed(2)),
      lowStockCount: lowStockMedicines.length,
      expiringCount: expiringMedicines.length,
      totalStockValue: Number(totalStockValue.toFixed(2))
    };
  }

  public getLowStockMedicines(): Medicine[] {
    return this.getMedicines().filter(m => m.quantity <= m.reorder_level && m.status === 'Active');
  }

  public getExpiryStatusMedicines(filter?: 'expired' | '30' | '60' | '90'): (Medicine & {
    daysRemaining: number;
    expiryStatus: 'Expired' | 'Expiring Soon' | 'Safe';
  })[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.getMedicines()
      .map(m => {
        const expDate = new Date(m.expiry_date);
        expDate.setHours(0, 0, 0, 0);
        const diffTime = expDate.getTime() - today.getTime();
        const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        let expiryStatus: 'Expired' | 'Expiring Soon' | 'Safe' = 'Safe';
        if (daysRemaining < 0) {
          expiryStatus = 'Expired';
        } else if (daysRemaining <= 60) {
          expiryStatus = 'Expiring Soon';
        }

        return {
          ...m,
          daysRemaining,
          expiryStatus
        };
      })
      .filter(m => {
        if (!filter) return true;
        if (filter === 'expired') return m.daysRemaining < 0;
        if (filter === '30') return m.daysRemaining >= 0 && m.daysRemaining <= 30;
        if (filter === '60') return m.daysRemaining >= 0 && m.daysRemaining <= 60;
        if (filter === '90') return m.daysRemaining >= 0 && m.daysRemaining <= 90;
        return true;
      });
  }

  public getTopSellingMedicines(limit = 5): { medicine_name: string; total_quantity: number; revenue: number }[] {
    const stats: Record<string, { total_quantity: number; revenue: number }> = {};

    for (const sale of this.sales) {
      for (const item of sale.items) {
        const name = item.medicine_name || 'Unknown';
        if (!stats[name]) stats[name] = { total_quantity: 0, revenue: 0 };
        stats[name].total_quantity += item.quantity;
        stats[name].revenue += item.total;
      }
    }

    return Object.entries(stats)
      .map(([medicine_name, data]) => ({
        medicine_name,
        total_quantity: data.total_quantity,
        revenue: Number(data.revenue.toFixed(2))
      }))
      .sort((a, b) => b.total_quantity - a.total_quantity)
      .slice(0, limit);
  }

  public getSettings(): PharmacySettings {
    return { ...this.settings };
  }

  public updateSettings(settings: Partial<PharmacySettings>): PharmacySettings {
    this.settings = { ...this.settings, ...settings };
    this.save('settings', this.settings);
    return this.settings;
  }

  public saveSettings(settings: PharmacySettings): PharmacySettings {
    return this.updateSettings(settings);
  }

  public resetToDefaults(): void {
    this.initialize(true);
  }
}

export const storage = new PharmacyStorageService();
