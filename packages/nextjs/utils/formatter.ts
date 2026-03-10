
const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function priceFormatter(num: number, digits: number) {
    const lookup = [
      { value: 1, symbol: "" },
      { value: 1e3, symbol: "k" },
      { value: 1e6, symbol: "M" },
      { value: 1e9, symbol: "B" },
      { value: 1e12, symbol: "T" },
      { value: 1e15, symbol: "P" },
      { value: 1e18, symbol: "E" },
    ];
    const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
    var item = lookup
      .slice()
      .reverse()
      .find(function (item) {
        return num >= item.value;
      });
    return item
      ? (num / item.value).toFixed(digits).replace(rx, "$1") + item.symbol
      : "0";
  }
  
  export const currencyPairFormatter = (pair: string) => {
    return pair.split("_").join("/");
  };
  
  export const formatToLocalPrice = (price: number) => {
    const formattedPrice = price.toLocaleString('en-US', {
      style: 'decimal',
      maximumFractionDigits: 7
    });
  
    return formattedPrice;
}


export function formatDurationFromMonths(months: number) {
    const avgDaysPerMonth = 30.44;
  
    if (months < 1) {
      const days = Math.round(months * avgDaysPerMonth);
      return `${days} day${days !== 1 ? 's' : ''}`;
    }
  
    if (months < 12) {
      const roundedMonths = Math.floor(months);
      const remainder = months - roundedMonths;
  
      if (remainder === 0) {
        return `${roundedMonths} month${roundedMonths !== 1 ? 's' : ''}`;
      }
  
      const days = Math.round(remainder * avgDaysPerMonth);
      return `${roundedMonths} month${roundedMonths !== 1 ? 's' : ''}, ${days} day${days !== 1 ? 's' : ''}`;
    }
  
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
  
    if (remainingMonths === 0) {
      return `${years} year${years !== 1 ? 's' : ''}`;
    }
  
    if (remainingMonths >= 1) {
      const roundedMonths = Math.floor(remainingMonths);
      const remainder = remainingMonths - roundedMonths;
  
      if (remainder === 0) {
        return `${years} year${years !== 1 ? 's' : ''}, ${roundedMonths} month${roundedMonths !== 1 ? 's' : ''}`;
      }
  
      const days = Math.round(remainder * avgDaysPerMonth);
      return `${years} year${years !== 1 ? 's' : ''}, ${roundedMonths} month${roundedMonths !== 1 ? 's' : ''}, ${days} day${days !== 1 ? 's' : ''}`;
    }
  
    const days = Math.round(remainingMonths * avgDaysPerMonth);
    return `${years} year${years !== 1 ? 's' : ''}, ${days} day${days !== 1 ? 's' : ''}`;
  }

  export const formatRentData = (data: {month: string, collected: number, expected: number}[]) => {
    return data.map(item => {
      const [year, month] = item.month.split('-');
      return {
        ...item,
        monthName: monthNames[parseInt(month) - 1] || month,
        year: parseInt(year)
      };
    });
  };

export const formatLandlordEquityChart = (data: {
  month: string;
  equity: number;
}[]) => {
    return data.map(item => {
        const [year, month] = item.month.split('-');
        return {
          ...item,
          monthName: monthNames[parseInt(month) - 1] || month,
          year: parseInt(year)
        };
    });
}

  export function safeDateFromTimestamp(timestamp?: number): Date | null {
    return timestamp ? new Date(timestamp * 1000) : null;
  }
  // export function calculateTokensFromEquity(equity: number, propertyId: number): number {
  //   // Implementation depends on your tokenomics
  //   // Example: equity% of total property tokens
  //   return equity * TOTAL_TOKENS_PER_PROPERTY / 100;
  // }
  
  // export function calculateNextPayment(
  //   payments: PaymentRecord[],
  //   property: Property
  // ): { dueDate: Date; amount: number } | undefined {
  //   if (payments.length >= property.duration) return undefined;
    
  //   const lastPayment = payments[0]?.date || new Date();
  //   const monthlyAmount = Number(ethers.formatUnits(property.value, 18)) / 12;
    
  //   return {
  //     dueDate: new Date(lastPayment.setMonth(lastPayment.getMonth() + 1)),
  //     amount: monthlyAmount
  //   };
  // }
  
  // function isSameMonth(date1: Date, date2: Date): boolean {
  //   return date1.getFullYear() === date2.getFullYear() && 
  //          date1.getMonth() === date2.getMonth();
  // }
  