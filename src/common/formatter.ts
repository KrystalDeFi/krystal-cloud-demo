
export class Formatter {
  static formatCurrency(value: number) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }

  static formatAPR(value: number) {
    return new Intl.NumberFormat("en-US", {
      style: "percent",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  }
}
