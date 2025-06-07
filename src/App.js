import logo from './logo.svg';
import './App.css';
import AdCard from './components/AdCard';
import { useState, useEffect } from 'react';

function App() {
  // create state variables for storage of ads, search strings, and current sorting mode
  const [ads, setAds] = useState([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('');
  
  //fetch request to handle and set various ad cards
  async function getAds() {
    const url = 'http://localhost:3000/fakeDataSet';
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }
  
      const json = await response.json();
      // console.log(json);
      // json comes in the form of an object with 4 arrays, each containing a certain amount of ad objects
      // we need to travese this json, extracting and standardazing all of the ads so that the data can be sent to adcard component and rendered
      // this will be handled by function standardizeAds
      const standardAds = await standardizeAds(json);
      console.log('Standardized Ads:', standardAds);
      setAds(standardAds);
    } catch (error) {
      console.error(error.message);
    }
  }
  
  // function to standardize ad format 
  async function standardizeAds(JSONobject) {
    const finalArray = [];
    // given the json object we need to iterate and standardize the ads based on platform
    // we will create a map for easy storage to better allow for google analtytics matching
    const adMap = {};
    // iterate through google analtytics to create a map of results for later matching
    for (const entry of JSONobject.google_analytics) {
      // key will be comprised of the compaign, medium, and content
      // *Initially considered only using utm_content for ID purposes but potential for conflicts seemed too likely
      const key = `${entry.utm_campaign}|${entry.utm_medium}|${entry.utm_content}`;
      // if entry does not exist it will be set to zero, if it does exist the entrys results will simply be set to the value of the result key.
      adMap[key] = (adMap[key] || 0) + entry.results;
    }

    // lets add a helper function to later add the stored results from google analytics into a matching future ad object and be stored into finalArray
    function attachResults({
      campaign,
      adset,
      creative,
      spend,
      impressions,
      clicks,
    }) {
      const key = `${campaign}|${adset}|${creative}`;
      const results = adMap[key] || 0;
      return { campaign, adset, creative, spend, impressions, clicks, results };
    }

    // we now have to standardize the ads based on how each platform's different naming conventions
    // lets create a helper function to do jsut that
    //* Decided to use switch syntax for better readability, at the cost of scalability
    function standardizeByPlatform(platform, ads) {
      for (const ad of ads) {
        let campaign, adset, creative, spend, impressions, clicks;

        switch (platform) {
          case 'facebook':
            campaign = ad.campaign_name;
            adset = ad.media_buy_name;
            creative = ad.ad_name;
            spend = ad.spend;
            clicks = ad.clicks;
            break;

          case 'twitter':
            campaign = ad.campaign;
            adset = ad.ad_group;
            creative = ad.image_name;
            spend = ad.spend;
            clicks = ad.post_clicks;
            break;

          case 'snapchat':
            campaign = ad.campaign_name;
            adset = ad.ad_squad_name;
            creative = ad.creative_name;
            spend = ad.cost;
            clicks = ad.post_clicks;
            break;

          default:
            console.warn(`Unknown platform: ${platform}`);
            continue;
        }

        impressions = ad.impressions;
        finalArray.push(
          attachResults({
            campaign,
            adset,
            creative,
            spend,
            impressions,
            clicks,
          })
        );
      }
    }
    // we'll have to call standardize for each platform
    standardizeByPlatform('facebook', JSONobject.facebook_ads);
    standardizeByPlatform('twitter', JSONobject.twitter_ads);
    standardizeByPlatform('snapchat', JSONobject.snapchat_ads);

    // return final array of ads
    return finalArray;
  }


  // use effect to set state with standardized ads upon mounting of component
  useEffect(() => {
    getAds();
  }, []);

  // now that we have standardized ads, lets filter by search name and then sort the ads before rendering the card components

  const filteredAds = ads.filter((ad) =>
    ad.campaign.toLowerCase().includes(search.toLowerCase())
  );

  const sortedAds = [...filteredAds].sort((a, b) => {
    if (sort === 'asc') return a.spend - b.spend;
    if (sort === 'desc') return b.spend - a.spend;
    return 0;
  });

  return (
    <div className='App'>
      <header className='dashboard-header'>
        <img src={logo} className='dashboard-logo' alt='logo' />
        <h1>Ad Dashboard</h1>
      </header>
      {/* add search bar and sorting buttons */}
      <div>
        <input
          type='text'
          placeholder='Search campaigns...'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button onClick={() => setSearch('')}>Clear Search</button>
        <button onClick={() => setSort('asc')}>Sort ↑</button>
        <button onClick={() => setSort('desc')}>Sort ↓</button>
        <button onClick={() => setSort('')}>Clear Sort</button>
      </div>
      <div className='card-container'>
        {sortedAds.map((ad, index) => (
          <AdCard
            key={`${ad.campaign}|${ad.adset}|${ad.creative}|${index}`}
            ad={ad}
          />
        ))}
      </div>
    </div>
  );
}

export default App;
