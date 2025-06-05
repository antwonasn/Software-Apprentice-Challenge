import React from 'react';

const AdCard = ({ ad }) => {
    return(
        <div className='ad-card'>
            <h3>{ad.campaign}</h3>
            <p>Adset: {ad.adset}</p>
            <p>Creative: {ad.creative}</p>
            <p>Spend: ${ad.spend}</p>
            <p>Impressions: {ad.impressions}</p>
            <p>Clicks: {ad.clicks}</p>
            <p>Results: {ad.results}</p>
        </div>
    );
};

export default AdCard;