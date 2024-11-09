'use client';

import ComparisonTool from './ComparisonTool';

export default function MemeBattleWrapper({ coins }) {
    const formatNumber = (num) => new Intl.NumberFormat('en-US').format(num);
    const formatPrice = (price) => price < 0.01 ? price.toFixed(8) : price.toFixed(4);
    const formatPercentage = (percent) => percent.toFixed(2);

    return (
        <ComparisonTool 
            coins={coins}
            formatNumber={formatNumber}
            formatPrice={formatPrice}
            formatPercentage={formatPercentage}
        />
    );
} 