
import { Bill, BillItem, Payment } from '../types';

export const calculateBillTotals = (bill: Pick<Bill, 'items' | 'payments'>) => {
    const totalAmount = bill.items.reduce((acc, item) => {
        const itemPrice = (item.weight * item.rate / 10) + item.makingCharge - item.discount;
        return acc + itemPrice;
    }, 0);

    const totalPaid = bill.payments.reduce((acc, payment) => acc + payment.amount, 0);

    const balanceDue = totalAmount - totalPaid;

    return {
        totalAmount: Math.round(totalAmount * 100) / 100,
        totalPaid: Math.round(totalPaid * 100) / 100,
        balanceDue: Math.round(balanceDue * 100) / 100,
    };
};
