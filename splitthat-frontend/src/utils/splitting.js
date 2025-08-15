import { money } from "../lib/utils";

/**
 * items: [{ item_name, price, assigned_to: [] }]
 * participants: ["A", "B"]
 * tax: { amount, assigned_to } | null
 * tip: { amount, assigned_to } | null
 * options: { tax: "equal"|"proportional", tip: "equal"|"proportional" }
 */
export function computeTotals(items, participants, tax, tip, options) {
  const totals = Object.fromEntries(
    participants.map((p) => [p, 0])
  );

  const subtotal = money(
    items.reduce((acc, it) => acc + Number(it.price || 0), 0)
  );

  // Items
  items.forEach((it) => {
    const assigned = Array.isArray(it.assigned_to)
      ? it.assigned_to
      : [];
    const shareCount = Math.max(assigned.length, 1);
    const per = money((Number(it.price) || 0) / shareCount);
    assigned.forEach((p) => {
      if (p in totals) totals[p] = money(totals[p] + per);
    });
  });

  // Helper: proportional by items total
  const itemsTotals = { ...totals };
  const itemsSum = Object.values(itemsTotals).reduce(
    (a, b) => a + b,
    0
  );

  // Tax
  if (tax && Number(tax.amount) > 0) {
    if (options.tax === "proportional" && itemsSum > 0) {
      participants.forEach((p) => {
        const share = money(
          (itemsTotals[p] / itemsSum) * Number(tax.amount)
        );
        totals[p] = money(totals[p] + share);
      });
    } else {
      const per = money(Number(tax.amount) / participants.length);
      participants.forEach((p) => {
        totals[p] = money(totals[p] + per);
      });
    }
  }

  // Tip
  if (tip && Number(tip.amount) > 0) {
    if (options.tip === "proportional" && itemsSum > 0) {
      participants.forEach((p) => {
        const share = money(
          (itemsTotals[p] / itemsSum) * Number(tip.amount)
        );
        totals[p] = money(totals[p] + share);
      });
    } else {
      const per = money(Number(tip.amount) / participants.length);
      participants.forEach((p) => {
        totals[p] = money(totals[p] + per);
      });
    }
  }

  const taxAmount = money(Number(tax?.amount || 0));
  const tipAmount = money(Number(tip?.amount || 0));
  const grandTotal = money(subtotal + taxAmount + tipAmount);

  return { totals, subtotal, taxAmount, tipAmount, grandTotal };
}