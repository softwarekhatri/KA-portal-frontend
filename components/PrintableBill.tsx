
import React, { useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useData } from '../hooks/useData';
import { calculateBillTotals } from '../utils/calculations';
import { BillItem } from '../types';

const PrintableBill: React.FC = () => {
    const { billId } = useParams();
    const { getBillById, getCustomerById } = useData();

    const bill = useMemo(() => billId ? getBillById(billId) : undefined, [billId, getBillById]);
    const customer = useMemo(() => bill ? getCustomerById(bill.customerId) : undefined, [bill, getCustomerById]);
    
    useEffect(() => {
        if (bill && customer) {
            setTimeout(() => window.print(), 500);
        }
    }, [bill, customer]);

    const getItemPrice = useCallback((item: BillItem) => {
        return ((item.weight * item.rate) / 10) + item.makingCharge - item.discount;
    },[]);

    if (!bill || !customer) {
        return <div className="p-10">Loading bill for printing...</div>;
    }

    const { totalAmount, totalPaid, balanceDue } = calculateBillTotals(bill);
    const inWords = (num: number): string => {
        // Simple implementation for demonstration
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(num) + ' only';
    };

    const BillContent = () => (
        <div className="p-4 border border-black font-sans text-xs" style={{ width: '100%', height: '13.8cm' }}>
            {/* Header */}
            <div className="text-center border-b-2 border-black pb-2">
                <h1 className="text-2xl font-bold tracking-wider">Khatri Alankar</h1>
                <p>Luxury Jewellery</p>
                <p>Jaipur, Rajasthan</p>
            </div>

            {/* Bill Info */}
            <div className="flex justify-between border-b border-black py-1">
                <p><strong>Bill No:</strong> {bill.id}</p>
                <p><strong>Date:</strong> {new Date(bill.date).toLocaleDateString()}</p>
            </div>

            {/* Customer Info */}
            <div className="border-b border-black py-1">
                <p><strong>To:</strong> {customer.name}</p>
                <p>{customer.address || 'N/A'}</p>
                <p><strong>Ph:</strong> {customer.phone || 'N/A'}</p>
            </div>

            {/* Items Table */}
            <table className="w-full my-2">
                <thead className="border-b border-black">
                    <tr>
                        <th className="text-left font-semibold p-1">Item Details</th>
                        <th className="text-right font-semibold p-1">Weight(g)</th>
                        <th className="text-right font-semibold p-1">Rate/10g</th>
                        <th className="text-right font-semibold p-1">Making</th>
                        <th className="text-right font-semibold p-1">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {bill.items.map(item => (
                        <tr key={item.id}>
                            <td className="p-1">{item.name}</td>
                            <td className="text-right p-1">{item.weight.toFixed(3)}</td>
                            <td className="text-right p-1">{item.rate.toLocaleString('en-IN')}</td>
                            <td className="text-right p-1">{item.makingCharge.toLocaleString('en-IN')}</td>
                            <td className="text-right p-1">{getItemPrice(item).toLocaleString('en-IN')}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end mt-auto">
                <div className="w-1/2">
                    <table className="w-full">
                        <tbody>
                            <tr>
                                <td className="font-semibold text-left p-1">Subtotal</td>
                                <td className="font-semibold text-right p-1">₹{totalAmount.toLocaleString('en-IN')}</td>
                            </tr>
                            <tr>
                                <td className="text-left p-1">Paid</td>
                                <td className="text-right p-1">₹{totalPaid.toLocaleString('en-IN')}</td>
                            </tr>
                            <tr className="border-t border-black">
                                <td className="font-bold text-left p-1">Balance Due</td>
                                <td className="font-bold text-right p-1">₹{balanceDue.toLocaleString('en-IN')}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="border-t border-black py-1 text-xs">
                <p><strong>In Words:</strong> {inWords(totalAmount)}</p>
            </div>

            {/* Footer */}
            <div className="text-center mt-4 pt-2 border-t border-dashed border-black">
                <p>Thank you for your business!</p>
            </div>
        </div>
    );
    

    return (
        <div className="bg-white text-black">
            <style>
                {`
                    @media print {
                        body * {
                            visibility: hidden;
                        }
                        #print-area, #print-area * {
                            visibility: visible;
                        }
                        #print-area {
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 100%;
                        }
                        @page {
                            size: A4;
                            margin: 0.5cm;
                        }
                    }
                `}
            </style>
            <div id="print-area">
                <div className="flex flex-col" style={{ height: '29.7cm' }}>
                    <div className="mb-2"><BillContent /></div>
                    <div><BillContent /></div>
                </div>
            </div>
        </div>
    );
};

export default PrintableBill;
