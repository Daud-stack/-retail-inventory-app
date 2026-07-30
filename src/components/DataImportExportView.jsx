import React, { useState, useRef } from 'react';
import { Database, Download, Upload, Save, FileJson, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react';
import { 
  exportProductsCSV, 
  parseProductsCSV, 
  exportFullBackupJSON, 
  importFullBackupJSON 
} from '../services/dataImportExport';

const DataImportExportView = ({ 
  products = [], 
  transactions = [], 
  stockMovements = [], 
  users = [], 
  customers = [],
  onImportProducts, 
  onRestoreBackup 
}) => {
  const [status, setStatus] = useState({ type: '', message: '' });
  const csvInputRef = useRef(null);
  const jsonInputRef = useRef(null);

  const downloadFile = (content, filename, type) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    try {
      const csvData = exportProductsCSV(products);
      downloadFile(csvData, `products_catalog_${new Date().toISOString().slice(0,10)}.csv`, 'text/csv');
      setStatus({ type: 'success', message: 'Products exported successfully.' });
    } catch (err) {
      setStatus({ type: 'error', message: 'Failed to export products.' });
    }
  };

  const handleImportCSV = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csvString = event.target.result;
        const parsedProducts = parseProductsCSV(csvString);
        if (parsedProducts.length > 0) {
          if (onImportProducts) onImportProducts(parsedProducts);
          setStatus({ type: 'success', message: `Successfully imported ${parsedProducts.length} products.` });
        } else {
          setStatus({ type: 'error', message: 'No valid products found in CSV.' });
        }
      } catch (err) {
        setStatus({ type: 'error', message: 'Error parsing CSV file.' });
      }
    };
    reader.readAsText(file);
    if (csvInputRef.current) csvInputRef.current.value = '';
  };

  const handleExportBackup = () => {
    try {
      const storeData = { products, transactions, stockMovements, users, customers };
      const jsonData = exportFullBackupJSON(storeData);
      downloadFile(jsonData, `nexus_backup_${new Date().toISOString().slice(0,10)}.json`, 'application/json');
      setStatus({ type: 'success', message: 'Full system backup exported successfully.' });
    } catch (err) {
      setStatus({ type: 'error', message: 'Failed to create backup.' });
    }
  };

  const handleImportBackup = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const jsonString = event.target.result;
      const result = importFullBackupJSON(jsonString);
      
      if (result.success) {
        if (onRestoreBackup) onRestoreBackup(result.data);
        setStatus({ type: 'success', message: 'System data restored successfully.' });
      } else {
        setStatus({ type: 'error', message: result.error });
      }
    };
    reader.readAsText(file);
    if (jsonInputRef.current) jsonInputRef.current.value = '';
  };

  const downloadTemplate = () => {
    const templateStr = "sku,name,category,price_usd,price_zig,stock_quantity,min_stock_level\nPROD-001,Sample Product,General,10.50,150.00,100,10\n";
    downloadFile(templateStr, 'products_template.csv', 'text/csv');
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-slate-700 pb-4">
        <div className="p-3 bg-indigo-500/20 rounded-xl text-indigo-400">
          <Database size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide">Data Center</h1>
          <p className="text-slate-400">Import, Export & Backup your store data seamlessly.</p>
        </div>
      </div>

      {/* Status Message */}
      {status.message && (
        <div className={`flex items-center gap-3 p-4 rounded-xl border ${
          status.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
            : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
        }`}>
          {status.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span className="font-medium">{status.message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Card 1: Product CSV */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-4 text-white">
            <FileSpreadsheet className="text-blue-400" size={24} />
            <h2 className="text-lg font-semibold">Product Catalog CSV</h2>
          </div>
          <p className="text-slate-400 text-sm mb-6 flex-grow">
            Bulk manage your products via CSV. Export your current catalog or upload a CSV file to add/update items.
          </p>
          <div className="space-y-3 mt-auto">
            <button 
              onClick={handleExportCSV}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors text-sm font-medium"
            >
              <Download size={18} />
              Export Catalog
            </button>
            <div className="relative">
              <input 
                type="file" 
                accept=".csv" 
                className="hidden" 
                ref={csvInputRef}
                onChange={handleImportCSV}
              />
              <button 
                onClick={() => csvInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded-lg transition-colors text-sm font-medium"
              >
                <Upload size={18} />
                Import Products
              </button>
            </div>
            <button 
              onClick={downloadTemplate}
              className="w-full text-xs text-slate-500 hover:text-slate-300 text-center mt-2 transition-colors"
            >
              Download Sample CSV Template
            </button>
          </div>
        </div>

        {/* Card 2: Full Backup Export */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-4 text-white">
            <Save className="text-indigo-400" size={24} />
            <h2 className="text-lg font-semibold">Full System Backup</h2>
          </div>
          <p className="text-slate-400 text-sm mb-6 flex-grow">
            Create a complete JSON snapshot of all your store data including catalog, transactions, and user profiles.
          </p>
          <div className="mt-auto">
            <button 
              onClick={handleExportBackup}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors text-sm font-medium shadow-lg shadow-indigo-500/20"
            >
              <Download size={18} />
              Generate Backup File
            </button>
          </div>
        </div>

        {/* Card 3: Full Backup Restore */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 flex flex-col h-full relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
             <FileJson size={100} />
          </div>
          <div className="flex items-center gap-3 mb-4 text-white relative z-10">
            <Upload className="text-rose-400" size={24} />
            <h2 className="text-lg font-semibold">System Data Restore</h2>
          </div>
          <p className="text-slate-400 text-sm mb-6 flex-grow relative z-10">
            Restore your entire system state from a previous JSON backup file. <span className="text-rose-400/80 font-medium">Warning: This will overwrite current data.</span>
          </p>
          <div className="mt-auto relative z-10">
            <input 
              type="file" 
              accept=".json" 
              className="hidden" 
              ref={jsonInputRef}
              onChange={handleImportBackup}
            />
            <button 
              onClick={() => jsonInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-slate-700 hover:bg-rose-600/20 text-slate-200 hover:text-rose-400 border border-transparent hover:border-rose-500/30 rounded-lg transition-all duration-300 text-sm font-medium"
            >
              <FileJson size={18} />
              Select Backup File to Restore
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DataImportExportView;
