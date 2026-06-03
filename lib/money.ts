export function formatInr(paise: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(paise / 100);
}

export function rupeesToPaise(rupees: string | number) {
  return Math.round(Number(rupees) * 100);
}
