import React, { useState, useRef } from 'react';
import { FileText, TrendingUp, Package, ArrowUpDown, Receipt, Download, Calendar } from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const ReportsView = ({ products = [], transactions = [], stockMovements = [], currentUser }) => {
  const [activeReport, setActiveReport] = useState('sales');
  const [dateRange, setDateRange] = useState('THIS_MONTH');
  const reportRef = useRef(null);
  const [isExporting, setIsExporting] = useState(false);

  const reports = [
    { id: 'sales', title: 'Sales Summary', icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' },
    { id: 'inventory', title: 'Inventory Audit', icon: Package, iconColor: 'text-blue-400', color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' },
    { id: 'stock', title: 'Stock Movement', icon: ArrowUpDown, color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20' },
    { id: 'tax', title: 'Tax Summary (ZIMRA)', icon: Receipt, color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20' }
  ];

  const handleExportPDF = async () => {
    if (!reportRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        backgroundColor: '#0f172a' // slate-950
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`nexus-report-${activeReport}-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCSV = () => {
    // Placeholder for CSV export logic
    alert('CSV Export coming soon.');
  };

  // Dummy data for charts
  const salesData = [
    { name: 'Mon', revenue: 4000 },
    { name: 'Tue', revenue: 3000 },
    { name: 'Wed', revenue: 2000 },
    { name: 'Thu', revenue: 2780 },
    { name: 'Fri', revenue: 1890 },
    { name: 'Sat', revenue: 2390 },
    { name: 'Sun', revenue: 3490 },
  ];
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
  const inventoryData = [
    { name: 'Electronics', value: 400 },
    { name: 'Clothing', value: 300 },
    { name: 'Food', value: 300 },
    { name: 'Home', value: 200 },
  ];

  const renderReportContent = () => {
    switch(activeReport) {
      case 'sales':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                <p className="text-slate-400 text-sm">Total Revenue</p>
                <p className="text-2xl font-bold text-white">$12,450.00</p>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                <p className="text-slate-400 text-sm">Transactions</p>
                <p className="text-2xl font-bold text-white">342</p>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                <p className="text-slate-400 text-sm">Avg Basket Size</p>
                <p className="text-2xl font-bold text-white">$36.40</p>
              </div>
            </div>
            
            <div className="bg-slate-800/30 p-6 rounded-xl border border-slate-700 h-80">
              <h3 className="text-sm font-semibold text-slate-300 mb-4">Revenue Trend</h3>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f1f5f9' }} />
                  <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      case 'inventory':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                <p className="text-slate-400 text-sm">Total Stock Value</p>
                <p className="text-2xl font-bold text-white">$84,300.00</p>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                <p className="text-slate-400 text-sm">Items in Stock</p>
                <p className="text-2xl font-bold text-white">1,245</p>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                <p className="text-slate-400 text-sm">Low Stock Items</p>
                <p className="text-2xl font-bold text-amber-400">12</p>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                <p className="text-slate-400 text-sm">Dead Stock</p>
                <p className="text-2xl font-bold text-red-400">5</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-800/30 p-6 rounded-xl border border-slate-700 h-80">
                <h3 className="text-sm font-semibold text-slate-300 mb-4">Stock by Category</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={inventoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {inventoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f1f5f9' }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="bg-slate-800/30 p-6 rounded-xl border border-slate-700 overflow-y-auto max-h-80 custom-scrollbar">
                <h3 className="text-sm font-semibold text-slate-300 mb-4">Low Stock Alerts</h3>
                <ul className="space-y-3">
                  {[1,2,3,4].map(i => (
                    <li key={i} className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg border border-slate-800">
                      <div>
                        <p className="text-sm font-medium text-slate-200">Product XYZ {i}</p>
                        <p className="text-xs text-slate-500">SKU: 1000{i}</p>
                      </div>
                      <span className="px-2 py-1 bg-amber-500/10 text-amber-400 text-xs font-bold rounded">2 left</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        );
      case 'tax':
        return (
          <div className="space-y-6">
            <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl">
              <h3 className="text-lg font-semibold text-white mb-4">ZIMRA Tax Breakdown</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-slate-400 text-xs">Gross Sales</p>
                  <p className="text-lg font-bold text-slate-200">$12,450.00</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Standard Rated (15%)</p>
                  <p className="text-lg font-bold text-slate-200">$10,000.00</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Zero Rated</p>
                  <p className="text-lg font-bold text-slate-200">$2,450.00</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs">VAT Collected</p>
                  <p className="text-lg font-bold text-purple-400">$1,500.00</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-950 p-6 font-mono text-sm border border-slate-800 rounded-xl text-slate-300 max-w-md mx-auto">
              <div className="text-center mb-6">
                <h4 className="font-bold text-lg">NEXUS RETAIL</h4>
                <p>Tax Summary Z-Report</p>
                <p>Date: {new Date().toLocaleDateString()}</p>
              </div>
              
              <div className="space-y-2 border-b border-dashed border-slate-700 pb-4 mb-4">
                <div className="flex justify-between"><span>TOTAL SALES</span><span>$12,450.00</span></div>
                <div className="flex justify-between"><span>TOTAL VAT</span><span>$1,500.00</span></div>
                <div className="flex justify-between text-xs text-slate-500"><span>- USD COMPONENT</span><span>$900.00</span></div>
                <div className="flex justify-between text-xs text-slate-500"><span>- ZIG COMPONENT</span><span>$600.00</span></div>
              </div>
              <div className="text-center text-xs text-slate-500">End of Report</div>
            </div>
          </div>
        );
      default:
        return <div className="text-slate-400 p-8 text-center">Select a report to view details</div>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 flex flex-col space-y-6 text-slate-300">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20">
            <FileText className="text-blue-400" size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Reports & Analytics Center</h1>
            <p className="text-sm text-slate-400">Generate, view, and export business reports</p>
          </div>
        </div>
        
        <div className="flex bg-slate-950 rounded-xl border border-slate-800 p-1">
          {['TODAY', 'THIS_WEEK', 'THIS_MONTH', 'THIS_QUARTER'].map(range => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${dateRange === range ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
            >
              {range.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Report Type Selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {reports.map(report => {
          const Icon = report.icon;
          const isActive = activeReport === report.id;
          return (
            <button
              key={report.id}
              onClick={() => setActiveReport(report.id)}
              className={`flex items-center gap-4 p-4 rounded-2xl border transition-all text-left ${isActive ? 'bg-slate-800 border-indigo-500 ring-1 ring-indigo-500/50 shadow-lg' : 'bg-slate-900 border-slate-800 hover:bg-slate-800/80 hover:border-slate-700'}`}
            >
              <div className={`p-2.5 rounded-xl ${report.bg} ${report.color} ${report.border} border`}>
                <Icon size={20} />
              </div>
              <div className="flex-1">
                <h3 className={`text-sm font-semibold ${isActive ? 'text-white' : 'text-slate-200'}`}>{report.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">Click to view</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Report Preview Area */}
      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col">
        <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              {reports.find(r => r.id === activeReport)?.title}
            </h2>
            <p className="text-sm text-slate-400 flex items-center gap-1 mt-1">
              <Calendar size={14} /> {dateRange.replace('_', ' ')}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-xl transition-colors border border-slate-700"
            >
              <Download size={16} /> CSV
            </button>
            <button 
              onClick={handleExportPDF}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-colors shadow-lg shadow-indigo-500/20 disabled:opacity-50"
            >
              <Download size={16} /> {isExporting ? 'Generating PDF...' : 'Download PDF'}
            </button>
          </div>
        </div>

        {/* The actual printable report section */}
        <div ref={reportRef} className="flex-1 bg-slate-900 text-slate-300 rounded-xl">
          {renderReportContent()}
        </div>
      </div>
    </div>
  );
};

export default ReportsView;
