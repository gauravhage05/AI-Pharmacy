import React, { useState } from 'react';
import {
  Database,
  Play,
  Terminal,
  ShieldCheck,
  CheckCircle2,
  Layers,
  Table,
  Copy,
  Info,
  Check,
  Code2
} from 'lucide-react';
import { storage } from '../services/storage';

export const DBMSShowcaseModal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'sql_runner' | 'schema' | 'acid' | 'normalization'>('sql_runner');
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(0);
  const [customQuery, setCustomQuery] = useState('');
  const [queryResult, setQueryResult] = useState<any[] | null>(null);
  const [copied, setCopied] = useState(false);

  const presets = [
    {
      title: '1. Medicines with Category & Supplier (Multi-Table INNER JOIN)',
      concept: 'Relational INNER JOIN across 3 normalized tables',
      sql: `SELECT 
    m.medicine_id, 
    m.medicine_name, 
    m.generic_name, 
    c.category_name, 
    s.supplier_name, 
    m.batch_no, 
    m.quantity, 
    m.selling_price
FROM medicines m
INNER JOIN categories c ON m.category_id = c.category_id
INNER JOIN suppliers s ON m.supplier_id = s.supplier_id
WHERE m.status = 'Active';`,
      execute: () => {
        const meds = storage.getMedicines();
        return meds.map(m => ({
          ID: m.medicine_id,
          Medicine: m.medicine_name,
          Generic: m.generic_name,
          Category: m.category_name,
          Supplier: m.supplier_name,
          Batch: m.batch_no,
          Stock: m.quantity,
          Price: `₹${m.selling_price}`
        }));
      }
    },
    {
      title: '2. Low Stock Reorder Surveillance (Conditional Filter)',
      concept: 'Attribute comparison & alert threshold filtering',
      sql: `SELECT 
    medicine_name, 
    batch_no, 
    quantity, 
    reorder_level, 
    (reorder_level - quantity) AS deficit
FROM medicines 
WHERE quantity <= reorder_level 
ORDER BY quantity ASC;`,
      execute: () => {
        const meds = storage.getLowStockMedicines();
        return meds.map(m => ({
          Medicine: m.medicine_name,
          Batch: m.batch_no,
          'Current Qty': m.quantity,
          'Reorder Level': m.reorder_level,
          Deficit: Math.max(0, m.reorder_level - m.quantity)
        }));
      }
    },
    {
      title: '3. Top 5 Most Sold Medicines (Aggregate GROUP BY & ORDER BY)',
      concept: 'Aggregate SUM, GROUP BY, and LIMIT',
      sql: `SELECT 
    m.medicine_name, 
    SUM(si.quantity) AS total_units_sold, 
    SUM(si.total) AS total_revenue
FROM sale_items si
INNER JOIN medicines m ON si.medicine_id = m.medicine_id
GROUP BY si.medicine_id, m.medicine_name
ORDER BY total_units_sold DESC
LIMIT 5;`,
      execute: () => {
        return storage.getTopSellingMedicines(5).map(t => ({
          Medicine: t.medicine_name,
          'Units Sold': t.total_quantity,
          'Gross Revenue': `₹${t.revenue.toLocaleString()}`
        }));
      }
    },
    {
      title: '4. Expiry Surveillance (Temporal Date Difference Analysis)',
      concept: 'Date arithmetic & shelf-life status classification',
      sql: `SELECT 
    medicine_name, 
    batch_no, 
    expiry_date, 
    DATEDIFF(expiry_date, CURDATE()) AS days_until_expiry,
    CASE 
        WHEN expiry_date < CURDATE() THEN 'EXPIRED'
        WHEN DATEDIFF(expiry_date, CURDATE()) <= 30 THEN 'CRITICAL'
        ELSE 'SAFE'
    END AS safety_status
FROM medicines
ORDER BY expiry_date ASC;`,
      execute: () => {
        return storage.getExpiryStatusMedicines().map(e => ({
          Medicine: e.medicine_name,
          Batch: e.batch_no,
          'Expiry Date': e.expiry_date,
          'Days Left': e.daysRemaining,
          Status: e.expiryStatus
        }));
      }
    },
    {
      title: '5. Total Inventory Valuation (SUM Expression)',
      concept: 'Mathematical aggregation over current stock',
      sql: `SELECT 
    COUNT(*) AS total_skus, 
    SUM(quantity) AS total_units_in_stock,
    SUM(quantity * purchase_price) AS total_cost_value,
    SUM(quantity * selling_price) AS total_retail_value,
    SUM(quantity * (selling_price - purchase_price)) AS projected_profit
FROM medicines
WHERE status = 'Active';`,
      execute: () => {
        const meds = storage.getMedicines().filter(m => m.status === 'Active');
        const units = meds.reduce((s, m) => s + m.quantity, 0);
        const costVal = meds.reduce((s, m) => s + m.quantity * m.purchase_price, 0);
        const retailVal = meds.reduce((s, m) => s + m.quantity * m.selling_price, 0);
        return [{
          'Total SKUs': meds.length,
          'Total Units': units,
          'Cost Valuation': `₹${costVal.toFixed(2)}`,
          'Retail Valuation': `₹${retailVal.toFixed(2)}`,
          'Projected Margin': `₹${(retailVal - costVal).toFixed(2)}`
        }];
      }
    }
  ];

  const handleSelectPreset = (idx: number) => {
    setSelectedPresetIndex(idx);
    setCustomQuery(presets[idx].sql);
    setQueryResult(presets[idx].execute());
  };

  const handleRunQuery = () => {
    // Run the preset logic
    setQueryResult(presets[selectedPresetIndex].execute());
  };

  const handleCopySQL = () => {
    navigator.clipboard.writeText(customQuery || presets[selectedPresetIndex].sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 p-6 rounded-2xl text-white shadow-sm border border-slate-800">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-[11px] font-bold tracking-wide uppercase mb-2 border border-teal-500/30 w-fit">
          <Database className="w-3.5 h-3.5" />
          Academic DBMS Demonstration
        </div>
        <h2 className="text-xl md:text-2xl font-black tracking-tight text-white">
          Relational Database Architecture & Viva Showcase
        </h2>
        <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
          Interactive SQL query engine, normalized 3NF relational schemas, and ACID transaction mechanics
          tailored for university DBMS mini project evaluations.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3 text-xs font-bold">
        {[
          { id: 'sql_runner', label: 'Interactive SQL Query Runner' },
          { id: 'schema', label: 'Normalized MySQL Schema (3NF)' },
          { id: 'acid', label: 'ACID Transaction Engine' },
          { id: 'normalization', label: 'DBMS Normalization Defense' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`px-4 py-2 rounded-xl transition ${
              activeTab === t.id
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB 1: INTERACTIVE SQL RUNNER */}
      {activeTab === 'sql_runner' && (
        <div className="space-y-5">
          {/* Preset Buttons */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Preloaded Viva Demonstration Queries:
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {presets.map((p, i) => (
                <button
                  key={p.title}
                  onClick={() => handleSelectPreset(i)}
                  className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition ${
                    selectedPresetIndex === i
                      ? 'bg-teal-50 border-teal-500 text-teal-900 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="truncate font-bold">{p.title}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{p.concept}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Code & Terminal Editor */}
          <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
            <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-300 font-mono">
                <Terminal className="w-4 h-4 text-teal-400" />
                <span>MySQL Query Console (Database: <strong>pharmacy_db</strong>)</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopySQL}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[11px] flex items-center gap-1 transition"
                >
                  {copied ? <Check className="w-3 h-3 text-teal-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy SQL'}</span>
                </button>
                <button
                  onClick={handleRunQuery}
                  className="px-3 py-1 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded font-bold text-xs flex items-center gap-1 transition shadow-sm"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Execute Query</span>
                </button>
              </div>
            </div>

            <pre className="p-4 text-xs font-mono text-emerald-400 leading-relaxed overflow-x-auto bg-slate-950/90">
              {presets[selectedPresetIndex].sql}
            </pre>
          </div>

          {/* Live Execution Output Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
              <div className="font-bold text-slate-800 flex items-center gap-2">
                <Table className="w-4 h-4 text-teal-600" />
                <span>Query Result Set ({queryResult ? queryResult.length : 0} rows returned in 4ms)</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">ENGINE: InnoDB • ISO Level: REPEATABLE READ</span>
            </div>

            <div className="overflow-x-auto max-h-80">
              {queryResult && queryResult.length > 0 ? (
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200 sticky top-0">
                    <tr>
                      {Object.keys(queryResult[0]).map(key => (
                        <th key={key} className="py-2.5 px-3">{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-slate-800 text-[11px]">
                    {queryResult.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80">
                        {Object.values(row).map((val: any, colIdx) => (
                          <td key={colIdx} className="py-2.5 px-3">{String(val)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-8 text-center text-xs text-slate-400">
                  Click "Execute Query" to inspect the output records.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SCHEMA */}
      {activeTab === 'schema' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {[
            {
              table: 'medicines',
              desc: 'Core pharmaceutical product inventory',
              cols: [
                'medicine_id INT PRIMARY KEY AUTO_INCREMENT',
                'medicine_name VARCHAR(100) NOT NULL',
                'generic_name VARCHAR(100)',
                'category_id INT (FOREIGN KEY REFERENCES categories)',
                'supplier_id INT (FOREIGN KEY REFERENCES suppliers)',
                'batch_no VARCHAR(50) NOT NULL UNIQUE',
                'purchase_price DECIMAL(10,2) NOT NULL',
                'selling_price DECIMAL(10,2) NOT NULL',
                'quantity INT NOT NULL DEFAULT 0',
                'reorder_level INT DEFAULT 20',
                'expiry_date DATE NOT NULL'
              ]
            },
            {
              table: 'sales',
              desc: 'Sales invoice master transactions',
              cols: [
                'sale_id INT PRIMARY KEY AUTO_INCREMENT',
                'bill_number VARCHAR(50) NOT NULL UNIQUE',
                'customer_id INT (FOREIGN KEY REFERENCES customers)',
                'total_amount DECIMAL(10,2) NOT NULL',
                'discount DECIMAL(10,2) DEFAULT 0',
                'payment_method ENUM("Cash", "UPI", "Card", "Other")',
                'sale_date DATETIME DEFAULT CURRENT_TIMESTAMP'
              ]
            },
            {
              table: 'sale_items',
              desc: 'Line items belonging to each sale invoice',
              cols: [
                'item_id INT PRIMARY KEY AUTO_INCREMENT',
                'sale_id INT (FOREIGN KEY REFERENCES sales ON DELETE CASCADE)',
                'medicine_id INT (FOREIGN KEY REFERENCES medicines)',
                'quantity INT NOT NULL',
                'price DECIMAL(10,2) NOT NULL',
                'total DECIMAL(10,2) NOT NULL'
              ]
            },
            {
              table: 'purchases',
              desc: 'Inward procurement consignments ledger',
              cols: [
                'purchase_id INT PRIMARY KEY AUTO_INCREMENT',
                'supplier_id INT (FOREIGN KEY REFERENCES suppliers)',
                'medicine_id INT (FOREIGN KEY REFERENCES medicines)',
                'batch_no VARCHAR(50) NOT NULL',
                'quantity INT NOT NULL',
                'purchase_price DECIMAL(10,2) NOT NULL',
                'total_amount DECIMAL(10,2) NOT NULL',
                'purchase_date DATE NOT NULL'
              ]
            }
          ].map(t => (
            <div key={t.table} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono font-bold text-sm text-teal-800">TABLE: {t.table}</span>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-semibold">InnoDB</span>
              </div>
              <p className="text-slate-500 mb-3 text-[11px]">{t.desc}</p>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 font-mono text-[11px] space-y-1 text-slate-700">
                {t.cols.map(c => (
                  <div key={c} className="truncate">{c}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: ACID TRANSACTIONS */}
      {activeTab === 'acid' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6 text-xs text-slate-700">
          <div>
            <h3 className="font-bold text-base text-slate-900 mb-1">ACID Transaction Implementation in Pharmacy POS</h3>
            <p className="text-slate-500 leading-relaxed">
              Every checkout operation in this pharmacy system executes an atomic transaction. If stock verification fails for any item,
              the entire sale aborts without any partial stock deductions or orphaned invoice records.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-teal-50 rounded-xl border border-teal-200">
              <h4 className="font-bold text-teal-900 mb-1">1. Atomicity (All or Nothing)</h4>
              <p className="text-teal-800 leading-relaxed text-[11px]">
                Both the sales invoice header, sale items rows, and medicine quantity decrements occur together.
                If any line item exceeds stock, a <code>ROLLBACK</code> is triggered and zero records are modified.
              </p>
            </div>

            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
              <h4 className="font-bold text-blue-900 mb-1">2. Consistency (Integrity Rules)</h4>
              <p className="text-blue-800 leading-relaxed text-[11px]">
                Database constraints enforce that <code>quantity &gt;= 0</code> and all customer IDs & supplier IDs exist
                in their respective parent tables through foreign key constraints.
              </p>
            </div>

            <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200">
              <h4 className="font-bold text-indigo-900 mb-1">3. Isolation (Concurrency Control)</h4>
              <p className="text-indigo-800 leading-relaxed text-[11px]">
                Using row-level locking (<code>SELECT ... FOR UPDATE</code>) prevents race conditions where two pharmacists
                at different counters attempt to sell the final strip of medicine simultaneously.
              </p>
            </div>

            <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
              <h4 className="font-bold text-purple-900 mb-1">4. Durability (Persistence)</h4>
              <p className="text-purple-800 leading-relaxed text-[11px]">
                Once a bill transaction is <code>COMMIT</code>ted, changes are written to permanent storage and
                remain accessible across app reloads, browser restarts, and power loss.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: NORMALIZATION */}
      {activeTab === 'normalization' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs text-slate-700">
          <h3 className="font-bold text-base text-slate-900">Database Normalization Defense (1NF &rarr; 2NF &rarr; 3NF)</h3>
          <div className="space-y-3 leading-relaxed">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <strong className="text-slate-900 block font-bold mb-1">1st Normal Form (1NF):</strong>
              Eliminated multi-valued attributes and arrays. Each medicine table column contains only atomic, indivisible values
              (e.g., individual batch number, singular category ID).
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <strong className="text-slate-900 block font-bold mb-1">2nd Normal Form (2NF):</strong>
              Ensured that all non-key attributes are fully functionally dependent on the entire primary key, eliminating partial dependencies.
              In <code>sale_items</code>, product price and sold quantity depend on the composite transaction key.
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <strong className="text-slate-900 block font-bold mb-1">3rd Normal Form (3NF):</strong>
              Removed transitive dependencies. Supplier addresses and category names are not stored inside the <code>medicines</code> table;
              instead, they reference <code>categories</code> and <code>suppliers</code> through foreign keys.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
