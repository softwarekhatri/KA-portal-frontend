import { Bill } from "@/types";

const BillHtmlContent = ({ bill }: { bill?: Bill }) => {
  return (
    <div className="bill-container">
      <div className="header">
        <div className="mantra">ॐ नमः शिवाय</div>
        <div className="shop-name">KHATRI ALANKAR</div>
        <div className="shop-details">
          Raja Bagicha, Rafiganj - 824125 | +91 9934799534 |
          info@khatrialankar.com
        </div>
      </div>

      <div className="bill-info">
        <div>
          <p>
            <strong>Name:</strong> {bill.customer.name}
          </p>
          <p>
            <strong>Phone:</strong> {bill.customer.phone.join(", ")}
          </p>
          <p>
            <strong>Address:</strong> {bill.customer.address}
          </p>
        </div>
        <div>
          <p>
            <strong>Bill ID:</strong> {bill._id}
          </p>
          <p>
            <strong>Date:</strong>{" "}
            {new Date(bill.billDate).toLocaleDateString()}
          </p>
        </div>
      </div>

      <h3>Item Details</h3>
      <table>
        <thead>
          <tr>
            <th>S.No</th>
            <th>Item</th>
            <th>Wt (g)</th>
            <th>Rate</th>
            <th>Making</th>
            <th>Price</th>
            <th>Disc</th>
            <th>Final</th>
          </tr>
        </thead>
        <tbody>
          {bill.items.map((item, index) => {
            const itemPrice =
              (item.weightInGrams / 10) * item.ratePer10g + item.makingCharge;
            const finalPrice = itemPrice - (item.discount || 0);
            return (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{item.name}</td>
                <td>{item.weightInGrams.toFixed(3)}</td>
                <td>₹{item.ratePer10g.toLocaleString("en-IN")}</td>
                <td>₹{item.makingCharge.toLocaleString("en-IN")}</td>
                <td>₹{itemPrice.toFixed(2)}</td>
                <td>₹{(item.discount || 0).toLocaleString("en-IN")}</td>
                <td>
                  <b>₹{finalPrice.toLocaleString("en-IN")}</b>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <h3>Payments</h3>

      <table>
        <thead>
          <tr>
            <th>Amount</th>
            <th>Date</th>
            <th>Mode</th>
          </tr>
        </thead>
        <tbody>
          {bill.payments.map((payment, index) => (
            <tr key={index}>
              <td>₹{payment.amountPaid.toFixed(2)}</td>
              <td>{new Date(payment.paymentDate).toLocaleDateString()}</td>
              <td>{payment.paymentMode}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="summary">
        <div className="summary-item">
          <div className="summary-label">Total Price</div>
          <div className="summary-value">₹{bill.totalAmount}</div>
        </div>
        <div className="summary-item">
          <div className="summary-label">Paid</div>
          <div className="summary-value text-success">
            ₹{(bill.totalAmount - bill.balanceDues).toLocaleString("en-IN")}
          </div>
        </div>
        <div className="summary-item">
          <div className="summary-label">Due</div>
          <div className="summary-value text-danger">
            ₹{bill.balanceDues.toLocaleString("en-IN")}
          </div>
        </div>
      </div>

      <div className="note">
        *Goods once sold cannot be exchanged or returned. Prices are subject to
        market rate changes.*
      </div>
    </div>
  );
};

export const BillPdf = ({ bill }: { bill?: Bill }) => {
  return (
    <div className="bg-white text-black">
      <style>
        {`
        /* --- GLOBAL PRINT STYLES --- */
        @page {
            size: A4 portrait;
            /* Minimal margins for full paper usage */
            margin: 5mm; 
        }

        body {
            font-family: 'Times New Roman', Times, serif; /* Using a classic, legible font */
            margin: 0;
            padding: 0;
            color: #000;
        }

        /* --- BILL CONTAINER STYLES --- */
        .bill-container {
            /* Calculated for A4 height (297mm) minus top/bottom body margins (10mm total) */
            /* Height is set to exactly 50% of the printable area */
            // height: 48.5vh; 
            min-height: 50vh;
            border: 1px solid #222; /* Thinner border for a cleaner look */
            border-radius: 6px;
            padding: 8px 12px; /* Reduced padding to save space */
            box-sizing: border-box;
            margin-bottom: 5mm; /* Small gap between the two bills */
            page-break-inside: avoid; /* Essential for print layout */
            overflow: hidden; /* Prevents content spillover if it gets too large */
        }

        /* --- HEADER STYLES --- */
        .header {
            text-align: center;
            margin-bottom: 4px; /* Reduced margin */
            line-height: 1.1;
        }

        .mantra {
            font-size: 14px; /* Slightly smaller */
            font-weight: bold;
            color: #555; /* Less aggressive color */
        }

        .shop-name {
            font-size: 17px; /* Maintained prominence */
            font-weight: bold;
            margin-top: 1px;
            color: #8B4513; /* A slight brown/gold for a touch of class */
        }

        .shop-details {
            font-size: 9px; /* Smaller font for details */
            color: #666;
            margin-top: 1px;
        }
        
        /* --- INFO SECTIONS --- */
        .bill-info {
            display: flex;
            justify-content: space-between;
            margin: 5px 0 6px 0; /* Reduced vertical margin */
            font-size: 10px; /* Smallest text for info */
            line-height: 1.4;
            border-bottom: 1px dashed #ccc;
            padding-bottom: 4px;
        }

        .bill-info p {
            margin: 0;
        }

        /* --- TABLES (ITEMS & PAYMENTS) --- */
        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 9.5px; /* Optimised font size for max data */
            margin-bottom: 5px;
        }

        th, td {
            border: 1px solid #ddd; /* Lighter border for readability */
            padding: 3px 4px; /* Reduced padding */
            text-align: left;
        }
        
        th:nth-child(4), th:nth-child(5), th:nth-child(6), td:nth-child(4), td:nth-child(5), td:nth-child(6) {
             text-align: right; /* Align numerical columns right */
        }


        th {
            background: #f0f0f0;
            font-weight: bold;
            color: #333;
        }

        h3 {
            font-size: 11px; /* Smaller heading */
            margin: 8px 0 3px;
            border-bottom: 1px solid #000;
            padding-bottom: 2px;
            text-transform: uppercase;
        }

        /* --- SUMMARY SECTION --- */
        .summary {
            display: flex;
            justify-content: space-between;
            margin-top: 4px;
            padding: 4px;
            background: #e6e6e6; /* Lighter background */
            border-radius: 4px;
            border: 1px solid #ccc;
        }

        .summary-item {
            text-align: center;
            flex: 1;
        }

        .summary-label {
            font-size: 9px; /* Very small label */
            color: #333;
        }

        .summary-value {
            font-size: 13px; /* Smaller value for space */
            font-weight: bold;
        }
        
        .signature {
            margin-top: 5px;
            display: flex;
            justify-content: space-between;
            font-size: 10px;
        }
        
        .note {
            font-size: 9px;
            margin-top: 5px;
            color: #666;
            text-align: center;
            border-top: 1px dashed #ccc;
            padding-top: 2px;
        }
`}
      </style>
      <div id="print-area">
        <div className="flex flex-col">
          <div className="mb-2">
            <BillHtmlContent bill={bill} />
          </div>
        </div>
      </div>
    </div>
  );
};
