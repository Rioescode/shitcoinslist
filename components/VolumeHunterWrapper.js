'use client';

import VolumeAnalysis from './VolumeAnalysis';

export default function VolumeHunterWrapper({ coins }) {
    const formatNumber = (num) => new Intl.NumberFormat('en-US').format(num);
    const formatPrice = (price) => price < 0.01 ? price.toFixed(8) : price.toFixed(4);

    return (
        <VolumeAnalysis 
            coins={coins}
            formatNumber={formatNumber}
            formatPrice={formatPrice}
        />
    );
} 