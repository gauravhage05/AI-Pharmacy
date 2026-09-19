# AI-Enabled Pharmacy Management System with Medicine Demand Prediction
### Academic DBMS Mini Project (College / University Submission)

---

## 👥 PROJECT TEAM
1. **Gaurav Subhash Hage** (Full-Stack & Database Lead)
2. **Arpit Murlidhar Kogde** (DBMS Architecture & Relational Schema)
3. **Shishir Madhav Mankar** (AI Demand ML & Statistical Forecasting)
4. **Saurabh Dnyaneshwar Alone** (UI/UX & POS Billing Engine)

---

## 📌 1. PROJECT OVERVIEW & OBJECTIVE
Modern retail pharmacies face challenges in stock management, medicine expiration tracking, and accurate demand forecasting. Manual or legacy register-based systems lead to stockouts of life-saving drugs or financial losses due to expired medicines.

This project delivers a **comprehensive, production-ready Pharmacy Management System** that combines:
* **Relational Database Management System (RDBMS)** adhering to 1NF, 2NF, and 3NF normalization.
* **Point-of-Sale (POS) Billing** with instant PDF invoice generation, thermal print layout, and WhatsApp digital sharing.
* **Machine Learning & Statistical AI Engine** using Ordinary Least Squares (OLS) Linear Regression to forecast future medicine demand (7, 15, 30 days) and prevent inventory stockouts.
* **ACID-Compliant Transactions** guaranteeing inventory consistency during sales and purchase orders.
* **Role-Based Access Control (RBAC)** for Admin, Pharmacist, and Staff.

---

## 🛠️ 2. SYSTEM ARCHITECTURE & TECH STACK
* **Frontend UI / UX**: React 18, TypeScript, Tailwind CSS, Lucide Icons, Canvas-Confetti
* **Relational Database Engine**: MySQL 8.0 / MariaDB InnoDB (with ACID atomic transactions, foreign keys, triggers)
* **Local Persistence Simulation**: High-speed, transactional local storage engine simulating MySQL tables and relational integrity
* **PDF & Printing Engine**: `jspdf` & `jspdf-autotable` for GST/retail invoice generation
* **Machine Learning Model**: Ordinary Least Squares (OLS) Linear Regression ($y = mx + c$) with statistical safeguards and trend classification
* **Messaging Service**: Direct WhatsApp Click-to-Chat protocol (`https://wa.me/`) for paperless digital bills

---

## 🗄️ 3. DATABASE SCHEMA & NORMALIZATION (3NF)

### Tables Overview:
1. `users` — Store staff accounts, password hashes, role permissions (`Admin`, `Pharmacist`, `Staff`).
2. `categories` — Pharmaceutical forms (Tablet, Syrup, Injection, Ointment, Drops).
3. `suppliers` — Wholesalers, distributors, contact reps, and GST numbers.
4. `customers` — Patient records, phone numbers (for WhatsApp invoices), addresses.
5. `medicines` — Product master (Batch, generic name, purchase cost, selling price, stock, expiry date).
6. `sales` — Invoice master header (Bill number, customer, subtotal, discount, total, payment method).
7. `sale_items` — Invoice line items (Medicine ID, quantity sold, unit price, total).
8. `purchases` — Inward stock procurement consignments.
9. `sales_history` — Historical transactional records utilized for AI model training.

### Normalization Justification for Viva:
* **1NF (First Normal Form)**: Every cell contains atomic, indivisible values. No multi-valued attributes or repeating groups.
* **2NF (Second Normal Form)**: All tables are in 1NF, and non-key attributes are fully functionally dependent on the entire primary key.
* **3NF (Third Normal Form)**: Eliminates transitive dependencies. For instance, supplier address and category descriptions are maintained in `suppliers` and `categories` tables, rather than redundantly duplicated in `medicines`.

---

## 🤖 4. AI MEDICINE DEMAND PREDICTION ALGORITHM
The demand forecasting engine applies **Ordinary Least Squares (OLS) Linear Regression**:

$$y = m \cdot x + c$$

Where:
* $x$: Sequential time index of historical sales days ($x = 0, 1, 2, \dots$).
* $y$: Quantity of medicine units dispensed on that day.
* $m$ (Slope): Represents the rate of demand change over time:
  $$m = \frac{N \sum(xy) - \sum x \sum y}{N \sum(x^2) - (\sum x)^2}$$
* $c$ (Y-Intercept): Represents baseline consumer demand:
  $$c = \frac{\sum y - m \sum x}{N}$$

### Urgency Classification:
* **High Urgency**: Current Stock < 50% of predicted demand $\rightarrow$ Urgent Reorder recommendation.
* **Moderate Urgency**: Current Stock between 50% and 100% of predicted demand $\rightarrow$ Monitor stock levels.
* **Low / Safe**: Current Stock exceeds 100% of predicted demand $\rightarrow$ Adequate inventory.

---

## ⚡ 5. ACID TRANSACTION DEMONSTRATION
During POS billing checkout:
1. **Atomicity**: The sales record, invoice line items, and inventory decrement happen as a single atomic unit. If stock for any item is insufficient, the transaction rolls back completely.
2. **Consistency**: Foreign keys ensure all sold items link to valid medicine IDs and customer IDs. Stock cannot drop below zero.
3. **Isolation**: Concurrency control locks product records during checkout (`FOR UPDATE`).
4. **Durability**: Committed bills and updated stock are permanently recorded.

---

## 🚀 6. QUICK START & RUNNING THE APPLICATION

```bash
# 1. Install dependencies
npm install

# 2. Run the Vite development server
npm run dev

# 3. Build for production
npm run build
```

The application runs at `http://localhost:3000`.

### Preloaded Credentials:
* **Admin**: `gaurav` / `admin123`
* **Pharmacist**: `arpit` / `pharma123`
* **Staff**: `saurabh` / `staff123`

---

## 🎓 7. FREQUENT VIVA QUESTIONS & DEFENSE ANSWERS

**Q1: Why did you use Linear Regression instead of a deep neural network (LSTM/Transformer)?**  
*Answer*: Retail pharmacy demand over 7–30 days is primarily driven by linear trends and local seasonal spikes. Linear Regression provides fast, interpretable, deterministic forecasts without requiring massive datasets or high GPU compute overhead, making it ideal and reliable for retail store management.

**Q2: How does the system handle medicine batch numbers and expiry dates?**  
*Answer*: The system enforces unique batch numbers per product consignment. The Expiry Surveillance module calculates `DATEDIFF(expiry_date, CURDATE())` to classify medicines as *Expired*, *Critical (≤30 days)*, *Warning (≤90 days)*, or *Safe*.

**Q3: How is customer privacy and digital billing handled?**  
*Answer*: Customers receive instant digital receipts directly via WhatsApp Click-to-Chat without saving their contact to local device phonebooks, minimizing paper waste and enhancing patient convenience.
