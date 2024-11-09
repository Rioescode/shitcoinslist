'use client';

import ProfitCalculator from './ProfitCalculator';

export default function MoonCalculatorWrapper({ coins }) {
    const formatNumber = (num) => new Intl.NumberFormat('en-US').format(num);
    const formatPrice = (price) => price < 0.01 ? price.toFixed(8) : price.toFixed(4);

    return (
        <ProfitCalculator 
            coins={coins}
            formatNumber={formatNumber}
            formatPrice={formatPrice}
        />
    );
} 