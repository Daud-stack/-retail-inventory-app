import React, { useState } from 'react';
import { 
  Printer, 
  CheckCircle2, 
  X, 
  Store, 
  Download, 
  Barcode,
  Loader2
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function ReceiptModal({ isOpen, onClose, cart, invoiceMeta, onFinalizeCheckout }) {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  if (!isOpen || !invoiceMeta) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById('printable-receipt');
    if (!element) return;

    try {
      setIsGeneratingPDF(true);
      const canvas = await html2canvas(element, { 
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = 190;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 10, 10, pdfWidth, imgHeight);
      pdf.save(`Receipt-${invoiceMeta.invoiceId}.pdf`);
    } catch (err) {
      console.error('PDF Generation failed:', err);
      alert('Failed to generate PDF download.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleDone = () => {
    onFinalizeCheckout();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
        {/* Header Controls */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
            <CheckCircle2 className="w-4 h-4" />
            <span>Transaction Processed & Calculated</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Receipt Paper View */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <div 
            id="printable-receipt" 
            className="bg-white text-slate-900 p-6 rounded-2xl shadow-xl font-mono text-xs space-y-4 border border-slate-200"
          >
            {/* Receipt Store Header with Logo Emblem */}
            <div className="text-center space-y-1 border-b border-dashed border-slate-300 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto mb-2 shadow-md">
                <Store className="w-6 h-6" />
              </div>
              <h2 className="text-base font-black tracking-tight text-slate-950 font-sans">NEXUS RETAIL HUB</h2>
              <p className="text-[10px] text-slate-600">100 Innovation Parkway, Suite 400</p>
              <p className="text-[10px] text-slate-600">Support: +1 (800) 555-0199</p>
              
              <div className="pt-2 flex items-center justify-center gap-2 text-[10px] text-slate-500 font-sans">
                <span className="font-mono font-bold text-indigo-700">{invoiceMeta.invoiceId}</span>
                <span>•</span>
                <span>{invoiceMeta.dateStr}</span>
              </div>
            </div>

            {/* Customer & Payment Method info */}
            <div className="flex justify-between text-[11px] text-slate-700 py-1 border-b border-dashed border-slate-300">
              <div>
                <span className="block font-sans text-[9px] text-slate-500 font-bold uppercase">PAYMENT METHOD</span>
                <span className="font-bold uppercase text-slate-900">{invoiceMeta.paymentMethod}</span>
              </div>
              <div className="text-right">
                <span className="block font-sans text-[9px] text-slate-500 font-bold uppercase">REGISTER</span>
                <span className="font-bold text-slate-900">Terminal #01</span>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="space-y-2 py-2 border-b border-dashed border-slate-300">
              <div className="grid grid-cols-12 font-bold text-[9px] text-slate-500 border-b border-slate-200 pb-1 font-sans">
                <span className="col-span-6">ITEM / SKU</span>
                <span className="col-span-2 text-center">QTY</span>
                <span className="col-span-4 text-right">TOTAL</span>
              </div>

              {cart.map((item) => (
                <div key={item.id} className="grid grid-cols-12 text-[11px]">
                  <div className="col-span-6 pr-1">
                    <span className="font-bold block truncate text-slate-900">{item.name}</span>
                    <span className="text-[9px] text-slate-500 font-sans">SKU: {item.sku}</span>
                  </div>
                  <span className="col-span-2 text-center font-bold">x{item.qty}</span>
                  <span className="col-span-4 text-right font-bold text-slate-900">
                    ${(item.price * item.qty).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculation Totals */}
            <div className="space-y-1 text-right text-xs pt-1">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-bold text-slate-900">${invoiceMeta.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Sales Tax ({invoiceMeta.taxRate}%):</span>
                <span className="font-bold text-slate-900">${invoiceMeta.taxAmount.toFixed(2)}</span>
              </div>
              {invoiceMeta.discount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount:</span>
                  <span className="font-bold">-${invoiceMeta.discount.toFixed(2)}</span>
                </div>
              )}

              {/* Profit & Margin Metrics Line */}
              {invoiceMeta.grossMarginPct && (
                <div className="flex justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                  <span>Est. Transaction Margin:</span>
                  <span className="font-bold text-emerald-700">{invoiceMeta.grossMarginPct}% (${invoiceMeta.grossProfit.toFixed(2)})</span>
                </div>
              )}

              <div className="flex justify-between text-sm font-black text-slate-950 border-t-2 border-slate-950 pt-2 mt-2">
                <span>TOTAL PAID:</span>
                <span>${invoiceMeta.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Bottom Barcode */}
            <div className="text-center pt-4 border-t border-dashed border-slate-300 space-y-1">
              <Barcode className="w-48 h-10 text-slate-900 mx-auto" />
              <span className="text-[9px] text-slate-500 font-mono tracking-widest block">
                *{invoiceMeta.invoiceId}*
              </span>
              <p className="text-[10px] text-slate-600 font-sans italic pt-1">
                Thank you for shopping with Nexus Retail!
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex flex-col gap-2 shrink-0">
          <div className="flex items-center justify-between gap-2">
            {/* Download PDF Button */}
            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              className="flex-1 py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-1.5"
            >
              {isGeneratingPDF ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>Download PDF</span>
            </button>

            {/* Print Receipt Button */}
            <button
              onClick={handlePrint}
              className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 border border-slate-700"
            >
              <Printer className="w-4 h-4" />
              <span>Print Receipt</span>
            </button>
          </div>

          <button
            onClick={handleDone}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Finish & Deduct Stock</span>
          </button>
        </div>
      </div>
    </div>
  );
}
