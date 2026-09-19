import React, { useState } from 'react';
import {
  Code2,
  Database,
  Download,
  Copy,
  Check,
  FileCode,
  Terminal,
  BookOpen
} from 'lucide-react';

export const ProjectCodeViewerModal: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<'database.sql' | 'app.py' | 'ai_model.py' | 'requirements.txt'>('database.sql');
  const [copied, setCopied] = useState(false);

  const files = {
    'database.sql': `-- =====================================================================
-- PHARMACY MANAGEMENT SYSTEM WITH AI MEDICINE DEMAND PREDICTION
-- Academic DBMS Mini Project Database Schema (MySQL 8.0 / MariaDB)
-- Team: Gaurav Hage, Arpit Kogde, Shishir Mankar, Saurabh Alone
-- =====================================================================

CREATE DATABASE IF NOT EXISTS pharmacy_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE pharmacy_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('Admin', 'Pharmacist', 'Staff') NOT NULL DEFAULT 'Staff',
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    status ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 3. Suppliers Table
CREATE TABLE IF NOT EXISTS suppliers (
    supplier_id INT AUTO_INCREMENT PRIMARY KEY,
    supplier_name VARCHAR(100) NOT NULL,
    contact_person VARCHAR(100),
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    address TEXT,
    gst_number VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 4. Customers Table
CREATE TABLE IF NOT EXISTS customers (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 5. Medicines Table (Normalized 3NF)
CREATE TABLE IF NOT EXISTS medicines (
    medicine_id INT AUTO_INCREMENT PRIMARY KEY,
    medicine_name VARCHAR(100) NOT NULL,
    generic_name VARCHAR(100),
    category_id INT NOT NULL,
    supplier_id INT NOT NULL,
    manufacturer VARCHAR(100),
    batch_no VARCHAR(50) NOT NULL UNIQUE,
    purchase_price DECIMAL(10,2) NOT NULL,
    selling_price DECIMAL(10,2) NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    reorder_level INT NOT NULL DEFAULT 20,
    expiry_date DATE NOT NULL,
    description TEXT,
    status ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_med_category FOREIGN KEY (category_id) REFERENCES categories(category_id) ON UPDATE CASCADE,
    CONSTRAINT fk_med_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id) ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 6. Sales Master Invoice Table
CREATE TABLE IF NOT EXISTS sales (
    sale_id INT AUTO_INCREMENT PRIMARY KEY,
    bill_number VARCHAR(50) NOT NULL UNIQUE,
    customer_id INT NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    discount DECIMAL(10,2) DEFAULT 0.00,
    total_amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM('Cash', 'UPI', 'Card', 'Other') NOT NULL,
    sale_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by_user VARCHAR(50),
    CONSTRAINT fk_sale_customer FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 7. Sale Items Table
CREATE TABLE IF NOT EXISTS sale_items (
    item_id INT AUTO_INCREMENT PRIMARY KEY,
    sale_id INT NOT NULL,
    medicine_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    CONSTRAINT fk_item_sale FOREIGN KEY (sale_id) REFERENCES sales(sale_id) ON DELETE CASCADE,
    CONSTRAINT fk_item_medicine FOREIGN KEY (medicine_id) REFERENCES medicines(medicine_id) ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 8. Purchases Table (Inward Stock Consignments)
CREATE TABLE IF NOT EXISTS purchases (
    purchase_id INT AUTO_INCREMENT PRIMARY KEY,
    supplier_id INT NOT NULL,
    medicine_id INT NOT NULL,
    batch_no VARCHAR(50) NOT NULL,
    quantity INT NOT NULL,
    purchase_price DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    expiry_date DATE NOT NULL,
    purchase_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_purchase_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id) ON UPDATE CASCADE,
    CONSTRAINT fk_purchase_medicine FOREIGN KEY (medicine_id) REFERENCES medicines(medicine_id) ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 9. Sales History Table for Machine Learning Training
CREATE TABLE IF NOT EXISTS sales_history (
    history_id INT AUTO_INCREMENT PRIMARY KEY,
    medicine_id INT NOT NULL,
    sale_date DATE NOT NULL,
    quantity_sold INT NOT NULL,
    CONSTRAINT fk_history_medicine FOREIGN KEY (medicine_id) REFERENCES medicines(medicine_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 10. Indexes for High Performance Joins & Searches
CREATE INDEX idx_med_name ON medicines(medicine_name);
CREATE INDEX idx_med_generic ON medicines(generic_name);
CREATE INDEX idx_med_expiry ON medicines(expiry_date);
CREATE INDEX idx_sales_date ON sales(sale_date);
CREATE INDEX idx_history_date ON sales_history(sale_date);
`,
    'ai_model.py': `# =====================================================================
# AI MEDICINE DEMAND PREDICTION ENGINE (Scikit-Learn OLS Linear Regression)
# Pharmacy Management System DBMS Mini Project
# =====================================================================

import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from datetime import datetime, timedelta

class AIDemandPredictor:
    def __init__(self, db_connection=None):
        self.db = db_connection
        self.model = LinearRegression()

    def train_and_predict(self, sales_history_records, forecast_days=15):
        """
        sales_history_records: List of dicts with 'date' and 'quantity_sold'
        forecast_days: Number of future days to project (7, 15, or 30)
        """
        if not sales_history_records or len(sales_history_records) < 3:
            return {
                "predicted_total": 0,
                "daily_average": 0,
                "urgency": "normal",
                "recommendation": "Insufficient historical transactions for reliable regression."
            }

        # Convert to Pandas DataFrame
        df = pd.DataFrame(sales_history_records)
        df['date'] = pd.to_datetime(df['date'])
        df = df.sort_values('date')

        # Feature Engineering: Day sequence index (0, 1, 2, ...)
        df['day_index'] = np.arange(len(df))

        X = df[['day_index']].values
        y = df['quantity_sold'].values

        # Train Ordinary Least Squares (OLS) Model
        self.model.fit(X, y)
        slope = self.model.coef_[0]
        intercept = self.model.intercept_

        # Future sequence projection
        last_index = df['day_index'].iloc[-1]
        future_indices = np.arange(last_index + 1, last_index + 1 + forecast_days).reshape(-1, 1)
        raw_predictions = self.model.predict(future_indices)

        # Baseline safeguards (demand cannot be negative)
        cleaned_predictions = [max(1, int(round(p))) for p in raw_predictions]
        total_predicted_demand = sum(cleaned_predictions)
        avg_daily_demand = round(total_predicted_demand / forecast_days, 1)

        trend = "increasing" if slope > 0.05 else ("decreasing" if slope < -0.05 else "stable")

        return {
            "predicted_total": total_predicted_demand,
            "daily_average": avg_daily_demand,
            "trend": trend,
            "slope": round(float(slope), 4),
            "intercept": round(float(intercept), 2),
            "forecast_series": cleaned_predictions
        }
`,
    'app.py': `# =====================================================================
# FLASK BACKEND SERVER & REST API
# Pharmacy Management System DBMS Mini Project
# =====================================================================

from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import mysql.connector
import os
from ai_model import AIDemandPredictor

app = Flask(__name__)
CORS(app)

# MySQL Database Configuration
DB_CONFIG = {
    'host': os.environ.get('DB_HOST', 'localhost'),
    'user': os.environ.get('DB_USER', 'root'),
    'password': os.environ.get('DB_PASS', 'mysqlpassword'),
    'database': os.environ.get('DB_NAME', 'pharmacy_db')
}

def get_db():
    return mysql.connector.connect(**DB_CONFIG)

@app.route('/api/health')
def health():
    return jsonify({"status": "active", "db": "MySQL Connected", "engine": "InnoDB"})

@app.route('/api/medicines', methods=['GET'])
def list_medicines():
    db = get_db()
    cursor = db.cursor(dictionary=True)
    query = """
        SELECT m.*, c.category_name, s.supplier_name 
        FROM medicines m
        LEFT JOIN categories c ON m.category_id = c.category_id
        LEFT JOIN suppliers s ON m.supplier_id = s.supplier_id
        WHERE m.status = 'Active'
    """
    cursor.execute(query)
    data = cursor.fetchall()
    cursor.close()
    db.close()
    return jsonify(data)

@app.route('/api/sales/checkout', methods=['POST'])
def checkout_sale():
    """ACID Transaction for POS counter billing"""
    data = request.json
    db = get_db()
    cursor = db.cursor()

    try:
        # 1. Begin atomic transaction
        db.start_transaction()

        # 2. Insert Sales Invoice Master
        sale_sql = """
            INSERT INTO sales (bill_number, customer_id, subtotal, discount, total_amount, payment_method)
            VALUES (%s, %s, %s, %s, %s, %s)
        """
        cursor.execute(sale_sql, (
            data['bill_number'], data['customer_id'],
            data['subtotal'], data['discount'],
            data['total_amount'], data['payment_method']
        ))
        sale_id = cursor.lastrowid

        # 3. Deduct medicine stock & insert line items
        for item in data['items']:
            # Verify stock
            cursor.execute("SELECT quantity FROM medicines WHERE medicine_id = %s FOR UPDATE", (item['medicine_id'],))
            current_qty = cursor.fetchone()[0]

            if current_qty < item['quantity']:
                raise Exception(f"Insufficient stock for medicine ID {item['medicine_id']}")

            # Decrement inventory
            cursor.execute("UPDATE medicines SET quantity = quantity - %s WHERE medicine_id = %s",
                           (item['quantity'], item['medicine_id']))

            # Insert line item
            cursor.execute("""
                INSERT INTO sale_items (sale_id, medicine_id, quantity, price, total)
                VALUES (%s, %s, %s, %s, %s)
            """, (sale_id, item['medicine_id'], item['quantity'], item['price'], item['total']))

        # 4. Commit transaction
        db.commit()
        return jsonify({"success": True, "sale_id": sale_id, "message": "Sale committed successfully!"})

    except Exception as e:
        db.rollback()
        return jsonify({"success": False, "error": str(e)}), 400
    finally:
        cursor.close()
        db.close()

if __name__ == '__main__':
    app.run(port=5000, debug=True)
`,
    'requirements.txt': `Flask==3.0.2
flask-cors==4.0.0
mysql-connector-python==8.3.0
pandas==2.2.1
numpy==1.26.4
scikit-learn==1.4.1.post1
reportlab==4.1.0
`
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(files[selectedFile]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([files[selectedFile]], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = selectedFile;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Code2 className="w-5 h-5 text-teal-600" />
            <span>Python & MySQL Backend Scripts Repository</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Complete database DDL schemas, Flask API controllers, and Scikit-Learn regression code ready for submission.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-teal-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Code'}</span>
          </button>
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download {selectedFile}</span>
          </button>
        </div>
      </div>

      {/* File Selector Tabs */}
      <div className="flex flex-wrap gap-2 text-xs font-mono font-semibold">
        {(['database.sql', 'app.py', 'ai_model.py', 'requirements.txt'] as const).map(file => (
          <button
            key={file}
            onClick={() => setSelectedFile(file)}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-2 ${
              selectedFile === file
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <FileCode className="w-3.5 h-3.5 text-teal-400" />
            <span>{file}</span>
          </button>
        ))}
      </div>

      {/* Code Viewer */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs">
          <span className="font-mono text-slate-300 font-bold flex items-center gap-2">
            <Terminal className="w-4 h-4 text-teal-400" />
            <span>{selectedFile}</span>
          </span>
          <span className="text-[11px] text-slate-500 font-mono">
            {selectedFile === 'database.sql' ? 'MySQL DDL & DML Schema' : 'Python 3.10+ / Flask / Scikit-Learn'}
          </span>
        </div>

        <pre className="p-5 text-xs font-mono text-slate-200 leading-relaxed overflow-x-auto max-h-[600px] overflow-y-auto select-text">
          {files[selectedFile]}
        </pre>
      </div>
    </div>
  );
};
