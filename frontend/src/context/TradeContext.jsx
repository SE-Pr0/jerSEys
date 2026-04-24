import React, { createContext, useCallback, useContext, useState } from 'react';
import { TRADE_LISTINGS, TRADE_REQUESTS } from '../data/trades';
import { getStoredUser } from '../utils/auth';

const TradeContext = createContext(null);

export const TradeProvider = ({ children }) => {
  const [listings, setListings] = useState(TRADE_LISTINGS);
  const [requests, setRequests] = useState(TRADE_REQUESTS);

  const addListing = useCallback((formData) => {
    const user = getStoredUser();
    if (!user) {
      return null;
    }

    const sellerName = user.username || 'member';

    const newListing = {
      id: `trade-${Date.now()}`,
      image: formData.imageUrl
        || (formData.sport === 'Basketball'
          ? 'https://cdn.shopify.com/s/files/1/0378/6653/files/08-hardwood-classics-swingman-jersey_ss5_p-203412844_pv-1_u-s6dxq83ajwg372xfm7vi_v-sdjisrq9pytimfgu7mms.avif?v=1761347616'
          : 'https://cdn.shopify.com/s/files/1/0621/2580/1653/files/11_e419aeb1-a3fa-4c51-a03a-def2d556e732.jpg?v=1753384643'),
      jerseyName: formData.jerseyName,
      club: formData.club,
      size: formData.size,
      condition: formData.condition,
      conditionDetail: formData.condition,
      sport: formData.sport.toLowerCase(),
      type: 'club',
      description: formData.description,
      lookingFor: formData.lookingFor,
      seller: {
        name: sellerName,
        initial: sellerName[0].toUpperCase(),
        color: '#1B3B8A',
      },
      status: 'available',
      listingType: formData.listingType || 'trade',
      price: formData.price ? Number(formData.price) : null,
      listedDate: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: '2-digit',
      }),
      estimatedValue: formData.price ? `$${formData.price}` : '$--',
    };

    setListings((prev) => [newListing, ...prev]);
    return newListing.id;
  }, []);

  const setListingStatus = useCallback((id, status) => {
    setListings((prev) => prev.map((listing) => (listing.id === id ? { ...listing, status } : listing)));
  }, []);

  const addRequest = useCallback((listingId, offerJersey, message) => {
    const user = getStoredUser();
    if (!user) {
      return false;
    }

    const listing = listings.find((item) => item.id === listingId);
    if (!listing) {
      return false;
    }

    const requesterName = user.username || 'member';

    const newRequest = {
      id: `req-${Date.now()}`,
      direction: 'outgoing',
      listing: {
        jerseyName: listing.jerseyName,
        emoji: listing.sport === 'basketball' ? '\uD83C\uDFC0' : '\u26BD',
        owner: listing.seller.name,
      },
      offer: {
        jerseyName: offerJersey,
        emoji: '\u26BD',
        from: requesterName,
        initial: requesterName[0].toUpperCase(),
        color: '#1B3B8A',
      },
      message,
      status: 'pending',
      date: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: '2-digit',
      }),
    };

    setRequests((prev) => [newRequest, ...prev]);
    setListingStatus(listingId, 'pending');
    return true;
  }, [listings, setListingStatus]);

  const respondToRequest = useCallback((id, response) => {
    setRequests((prev) => prev.map((request) => (request.id === id ? { ...request, status: response } : request)));
  }, []);

  return (
    <TradeContext.Provider
      value={{
        listings,
        requests,
        addListing,
        setListingStatus,
        addRequest,
        respondToRequest,
      }}
    >
      {children}
    </TradeContext.Provider>
  );
};

export const useTrade = () => {
  const ctx = useContext(TradeContext);
  if (!ctx) throw new Error('useTrade must be used within a TradeProvider');
  return ctx;
};
