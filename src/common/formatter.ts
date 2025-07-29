export class Formatter {
  static formatCurrency(value: number) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }

  static formatAPR(value: number, isPercentage: boolean = true) {
    return new Intl.NumberFormat("en-US", {
      style: "percent",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(isPercentage ? value / 100 : value);
  }

  static formatFeeTier(value: number) {
    return (
      new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(value / 10000) + "%"
    );
  }

  static formatPercentage(value: number, showSign: boolean = true) {
    const sign = showSign && value >= 0 ? "+" : "";
    return `${sign}${value.toFixed(2)}%`;
  }

  static formatNumber(value: number, decimals: number = 2) {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals,
    }).format(value);
  }

  static formatTokenAmount(balance: string, decimals: number, symbol: string) {
    const amount = parseFloat(balance) / Math.pow(10, decimals);
    return (
      new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: decimals > 6 ? 6 : decimals,
      }).format(amount) + ` ${symbol}`
    );
  }

  static formatPrice(value: number, decimals: number = 6) {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals,
    }).format(value);
  }

  static formatAge(timestamp: number) {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? "s" : ""}`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? "s" : ""}`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""}`;
    } else {
      return "about 1 hour";
    }
  }

  static shortAddress(address: string) {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }
}
