import React from 'react';
import { Printer, Copy, Check } from 'lucide-react';
import { JMartLogo } from '../JMartLogo';
import { STORE_CONFIG } from '../../config/storeConfig';
import { copyText } from '../../utils/clipboard';

export interface ReceiptLineItem {
  id?: string | number;
  name: string;
  sku?: string;
  price: number;
  quantity: number;
  gstRate?: number;
  uom?: string;
}

export interface ReceiptViewProps {
  reservationId: string;
  otp: string;
  items: ReceiptLineItem[];
  subtotal: number;
  total: number;
  discount?: number;
  customerName?: string;
  customerPhone?: string;
  expiresAt?: string | number;
  createdAt?: string | number;
  onPrint?: () => void;
}

export function convertNumberToWords(num: number): string {
  if (isNaN(num) || num < 0) return 'Zero rupees only';
  const a = [
    '', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
    'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen',
    'seventeen', 'eighteen', 'nineteen'
  ];
  const b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

  function convertGroup(n: number): string {
    let out = '';
    if (n >= 100) {
      out += a[Math.floor(n / 100)] + ' hundred ';
      n %= 100;
    }
    if (n >= 20) {
      out += b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '') + ' ';
    } else if (n > 0) {
      out += a[n] + ' ';
    }
    return out.trim();
  }

  // Pre-round to 2 decimal places to avoid floating point anomalies (e.g. 100 paise)
  const fixedNum = Math.round(num * 100) / 100;
  const intPart = Math.floor(fixedNum);
  const decPart = Math.round((fixedNum - intPart) * 100);

  if (intPart === 0 && decPart === 0) return 'Zero rupees only';

  let words = '';
  const crore = Math.floor(intPart / 10000000);
  const lakh = Math.floor((intPart % 10000000) / 100000);
  const thousand = Math.floor((intPart % 100000) / 1000);
  const hundred = intPart % 1000;

  if (crore > 0) words += convertGroup(crore) + ' crore ';
  if (lakh > 0) words += convertGroup(lakh) + ' lakh ';
  if (thousand > 0) words += convertGroup(thousand) + ' thousand ';
  if (hundred > 0) words += convertGroup(hundred) + ' ';

  words = words.trim();
  if (words) words += ' rupees';

  if (decPart > 0 && decPart < 100) {
    const paiseWords = convertGroup(decPart);
    if (words) {
      words += ' and ' + paiseWords + ' paise';
    } else {
      words = paiseWords + ' paise';
    }
  }

  words += ' only';
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export const ReceiptView: React.FC<ReceiptViewProps> = ({
  reservationId,
  otp,
  items,
  subtotal,
  total,
  discount = 0,
  customerName,
  customerPhone,
  createdAt,
}) => {
  const [copied, setCopied] = React.useState(false);
  const [qrDataUrl, setQrDataUrl] = React.useState<string | null>(null);

  const formattedDate = React.useMemo(() => {
    const d = createdAt ? new Date(createdAt) : new Date();
    return (
      d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) +
      ' · ' +
      d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })
    );
  }, [createdAt]);

  // Tax calculation extracted per line item rate from MRP-inclusive prices
  const gstBreakdown = React.useMemo(() => {
    let totalTaxable = 0;
    let totalCgst = 0;
    let totalSgst = 0;

    items.forEach((item) => {
      const qty = Number(item.quantity) || 1;
      const price = Number(item.price) || 0;
      const lineTotal = price * qty;
      const rate = typeof item.gstRate === 'number' ? item.gstRate : 5;
      const taxable = lineTotal / (1 + rate / 100);
      const tax = lineTotal - taxable;
      totalTaxable += taxable;
      totalCgst += tax / 2;
      totalSgst += tax / 2;
    });

    return {
      taxable: totalTaxable,
      cgst: totalCgst,
      sgst: totalSgst,
      tax: totalCgst + totalSgst,
    };
  }, [items]);

  const totalUnits = React.useMemo(() => {
    return items.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
  }, [items]);

  // Generate real QR code for the bill / reservation slip
  React.useEffect(() => {
    let isMounted = true;
    const generateQR = async () => {
      try {
        const QRCode = await import('qrcode');
        const qrPayload = JSON.stringify({
          slip: reservationId,
          otp: otp,
          total: total.toFixed(2),
          items: items.length,
          units: totalUnits,
          store: STORE_CONFIG.name,
          till: 'TILL-01',
        });
        const url = await QRCode.toDataURL(qrPayload, {
          width: 144,
          margin: 1,
          color: {
            dark: '#16150f',
            light: '#fffefb',
          },
        });
        if (isMounted) setQrDataUrl(url);
      } catch (err) {
        console.error('Failed to generate receipt QR code:', err);
      }
    };
    generateQR();
    return () => {
      isMounted = false;
    };
  }, [reservationId, otp, total, items.length, totalUnits]);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyDetails = async () => {
    const slipText = `*${STORE_CONFIG.name} Store Reservation Slip*\nSlip #: ${reservationId}\nOTP Code: ${otp}\nTotal: ₹${total.toFixed(2)}\nItems: ${items.length} items (${totalUnits} units)\nCustomer: ${customerName || 'Customer'} (${customerPhone || 'Counter'})\nAddress: ${STORE_CONFIG.address}, ${STORE_CONFIG.cityStateZip}`;
    const success = await copyText(slipText);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* Dynamic Print Stylesheet matching bill-receipt-advanced.tsx */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #receipt-print-area, #receipt-print-area * {
            visibility: visible !important;
          }
          #receipt-print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            margin: 0 !important;
            padding: 2mm 1mm !important;
            width: 72mm !important;
            max-width: 72mm !important;
            background: #fffefb !important;
            color: #16150f !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
          @page {
            size: 80mm auto !important;
            margin: 0 !important;
          }
        }
      `}</style>

      {/* Action Toolbar */}
      <div className="w-full max-w-[340px] flex items-center justify-between gap-2 mb-3 px-1 no-print">
        <span className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink3)]">
          Thermal Slip Preview
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleCopyDetails}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-[var(--sub)] hover:bg-[var(--rule2)] text-[var(--ink)] border border-[var(--border2)] transition-colors cursor-pointer"
            title="Copy slip details"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[var(--ok)]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-[var(--accent)] hover:bg-[var(--accent-hi)] text-[var(--primary-foreground)] border border-[var(--accent)] transition-colors cursor-pointer"
            title="Print receipt"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Thermal 80mm Paper Mockup */}
      <div
        id="receipt-print-area"
        className="w-full max-w-[340px] bg-[#fffefb] text-[#16150f] rounded-lg p-5 border border-[#e8e4db] shadow-[0_24px_48px_-18px_rgba(0,0,0,0.55)] select-text print:shadow-none print:border-none print:w-full print:max-w-none"
        style={{ fontFamily: "'Public Sans', system-ui, sans-serif" }}
      >
        {/* Store Masthead */}
        <div className="text-center space-y-1 pb-3 border-b border-dashed border-[#ccc7ba]">
          <div className="flex justify-center pb-1">
            <JMartLogo variant="receipt" showSubtitle={false} className="text-[#16150f]" />
          </div>
          <p className="font-mono text-[10px] font-bold tracking-[0.15em] uppercase text-[#6f6b62]">
            SUPERMARKET & RETAIL
          </p>
          <p className="text-[11px] text-[#4a463e] leading-tight">
            {STORE_CONFIG.address}, {STORE_CONFIG.cityStateZip}
          </p>
          <p className="text-[11px] text-[#4a463e]">Ph: {STORE_CONFIG.phone}</p>
          <div className="font-mono text-[10px] text-[#6f6b62] pt-1">
            <span>GSTIN: 33AAAAA0000A1Z5</span>
            <span className="mx-1">·</span>
            <span>TN (33)</span>
          </div>
        </div>

        {/* Title Rule Band */}
        <div className="my-2.5 py-1 border-y border-[#16150f] text-center">
          <span className="font-mono text-[11px] font-black tracking-[0.2em] uppercase text-[#16150f]">
            EXPRESS PICKUP SLIP
          </span>
        </div>

        {/* Slip Metadata Grid */}
        <div className="font-mono text-[11px] leading-tight text-[#4a463e] space-y-1 pb-2.5 border-b border-dashed border-[#ccc7ba]">
          <div className="flex justify-between">
            <span className="text-[#6f6b62]">SLIP NO:</span>
            <span className="font-bold text-[#16150f]">#{reservationId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#6f6b62]">DATE/TIME:</span>
            <span>{formattedDate}</span>
          </div>
          {customerName && (
            <div className="flex justify-between">
              <span className="text-[#6f6b62]">CUSTOMER:</span>
              <span className="font-bold text-[#16150f] truncate max-w-[170px]">{customerName}</span>
            </div>
          )}
          {customerPhone && (
            <div className="flex justify-between">
              <span className="text-[#6f6b62]">PHONE:</span>
              <span>{customerPhone}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-[#6f6b62]">COUNTER:</span>
            <span>Billing Desk 01</span>
          </div>
        </div>

        {/* Line Items Table (Two-row layout per bill-receipt-advanced.tsx: name & amount on line 1, qty/rate on line 2) */}
        <div className="py-2.5 border-b border-[#16150f]">
          <div className="flex justify-between py-1 pb-1.5 font-mono text-[9.5px] font-bold uppercase tracking-[0.1em] text-[#6f6b62] border-b border-[#ece8de]">
            <span>ITEM</span>
            <span>AMOUNT</span>
          </div>

          <div className="border-t border-[#d9d5cb] flex flex-col">
            {items.map((item, idx) => {
              const qty = Number(item.quantity) || 1;
              const price = Number(item.price) || 0;
              const lineTotal = price * qty;
              const rate = typeof item.gstRate === 'number' ? item.gstRate : 5;
              return (
                <div key={idx} className="flex flex-col gap-0.5 py-2 border-b border-[#ece9e0]">
                  <div className="flex justify-between items-baseline gap-2.5">
                    <span className="text-[12px] font-semibold leading-tight break-words text-[#16150f]">
                      {item.name}
                    </span>
                    <span className="font-mono text-[12px] font-bold tabular-nums whitespace-nowrap text-[#16150f]">
                      {lineTotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between font-mono text-[10px] text-[#7d7a71]">
                    <span>
                      {qty} &times; {price.toFixed(2)} {item.uom ? `(${item.uom})` : ''}
                    </span>
                    <span>
                      {item.sku ? `SKU: ${item.sku} · ` : ''}GST {rate}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quantities & GST Extraction Grid */}
        <div className="py-2.5 font-mono text-[11px] text-[#4a463e] space-y-1 border-b border-dashed border-[#ccc7ba]">
          <div className="flex justify-between">
            <span className="text-[#6f6b62]">TOTAL ITEMS / UNITS:</span>
            <span className="font-bold text-[#16150f]">
              {items.length} lines / {totalUnits} pcs
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#6f6b62]">SUBTOTAL (INCL. GST):</span>
            <span className="tabular-nums font-bold">₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#6f6b62]">TAXABLE VALUE:</span>
            <span className="tabular-nums">₹{gstBreakdown.taxable.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-[10px]">
            <span className="text-[#6f6b62]">CGST:</span>
            <span className="tabular-nums">₹{gstBreakdown.cgst.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-[10px]">
            <span className="text-[#6f6b62]">SGST:</span>
            <span className="tabular-nums">₹{gstBreakdown.sgst.toFixed(2)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-[#047857]">
              <span>COUPON DISCOUNT:</span>
              <span className="tabular-nums font-bold">-₹{discount.toFixed(2)}</span>
            </div>
          )}
        </div>

        {/* Reversed Total Block (Dark fill, white mono text, 22px) */}
        <div className="my-3 bg-[#16150f] text-[#fffefb] p-3 rounded-md text-center">
          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] opacity-80 mb-0.5">
            ESTIMATED TOTAL PAYABLE
          </div>
          <div className="font-mono text-2xl font-bold tracking-tight">
            ₹{total.toFixed(2)}
          </div>
          <div className="text-[10px] opacity-75 mt-1 capitalize leading-tight italic">
            {convertNumberToWords(total)}
          </div>
        </div>

        {/* OTP Code Box for Counter Handshake */}
        <div className="my-3 p-3 bg-[#f8f6f1] border-2 border-dashed border-[#16150f] rounded-lg text-center">
          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#6f6b62] mb-1">
            SHOW AT BILL COUNTER
          </div>
          <div className="font-mono text-3xl font-black tracking-[0.3em] text-[#16150f] py-0.5">
            {otp}
          </div>
          <p className="text-[10px] text-[#4a463e] mt-1 font-medium">
            Cashier will scan this OTP to instantly pull your cart & invoice.
          </p>
        </div>

        {/* QR Code & Return Terms matching bill-receipt-advanced.tsx */}
        <div className="flex flex-col items-center gap-2 pt-2 pb-2 text-center">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt="Reservation QR Code"
              className="w-[72px] h-[72px] border border-[#d9d5cb] p-0.5"
            />
          ) : (
            <div className="w-[72px] h-[72px] border border-dashed border-[#b9b5aa] flex items-center justify-center font-mono text-[9px] text-[#8b8880] tracking-[0.08em]">
              QR
            </div>
          )}
          <div className="text-[10px] leading-relaxed text-[#55524a]">
            Scan at express billing till to pull reservation
            <br />
            Exchange within 7 days with bill
          </div>
          <div className="text-[11px] font-bold tracking-[0.12em] text-[#16150f] pt-0.5">
            THANK YOU · VISIT AGAIN
          </div>
        </div>

        {/* Bottom Tear-off Perforation matching bill-receipt-advanced.tsx */}
        <div
          className="h-3.5 my-1"
          style={{
            background: 'repeating-linear-gradient(90deg, #d9d5cb 0 6px, transparent 6px 12px)',
            backgroundSize: '100% 1px',
            backgroundPosition: '0 50%',
            backgroundRepeat: 'no-repeat',
          }}
        />

        {/* 30-Minute Hold Policy Terms */}
        <div className="text-center pt-1 space-y-0.5 text-[10px] text-[#6f6b62] leading-tight">
          <p className="font-bold uppercase tracking-wider text-[#16150f]">
            30-Minute Reservation Hold
          </p>
          <p>Unclaimed items return to shelves automatically after 30 minutes.</p>
        </div>
      </div>
    </div>
  );
};
