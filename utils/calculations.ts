import { Bill } from "../types";

export const calculateBillTotals = (bill: Pick<Bill, "items" | "payments">) => {
  const totalAmount = bill.items.reduce((acc, item) => {
    const itemPrice =
      (item.weightInGrams * item.ratePer10g) / 10 +
      item.makingCharge -
      item.discount;
    return acc + itemPrice;
  }, 0);

  const totalPaid = bill.payments.reduce(
    (acc, payment) => acc + payment.amountPaid,
    0
  );

  const balanceDue = totalAmount - totalPaid;

  return {
    totalAmount: Math.round(totalAmount * 100) / 100,
    totalPaid: Math.round(totalPaid * 100) / 100,
    balanceDue: Math.round(balanceDue * 100) / 100,
  };
};
