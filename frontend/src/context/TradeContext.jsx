import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  acceptTradeRequest,
  cancelTradeListing,
  createTrade,
  getMyTradeListings,
  getReceivedTradeRequests,
  getSentTradeRequests,
  getTrades,
  rejectTradeRequest,
  requestTrade,
} from '../services/tradeService';
import { getStoredUser } from '../utils/auth';

const TradeContext = createContext(null);

const tradeAvatarColor = '#1B3B8A';

const formatDate = (value) => {
  if (!value) {
    return '';
  }

  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: '2-digit',
  });
};

const inferListingType = (description = '') => {
  const normalized = description.toLowerCase();

  if (/buy now|for sale|sell/i.test(normalized)) {
    return /trade/i.test(normalized) ? 'both' : 'sale';
  }

  return 'trade';
};

const inferSport = (title = '', description = '') =>
  /nba|basketball|lakers|bulls|warriors|celtics/i.test(`${title} ${description}`.toLowerCase())
    ? 'basketball'
    : 'football';

const inferCondition = (description = '') => {
  const normalized = description.toLowerCase();

  if (normalized.includes('brand new')) return 'Brand new';
  if (normalized.includes('near mint')) return 'Near mint';
  if (normalized.includes('used')) return 'Used';
  if (normalized.includes('good')) return 'Good';

  return 'Good';
};

const parseTradeTitle = (title = '') => {
  const [club, ...rest] = String(title).split(' - ');
  return {
    club: rest.length > 0 ? club : 'Trade listing',
    jerseyName: rest.length > 0 ? rest.join(' - ') : title,
  };
};

const toListing = (trade) => {
  const { club, jerseyName } = parseTradeTitle(trade.title || '');
  const sport = inferSport(trade.title, trade.description);
  const listingType = inferListingType(trade.description);
  const condition = inferCondition(trade.description);

  return {
    id: String(trade.id),
    image: trade.image_url || '',
    jerseyName: jerseyName || trade.title || 'Trade listing',
    club,
    size: 'N/A',
    condition,
    conditionDetail: condition,
    sport,
    type: 'club',
    description: trade.description || '',
    lookingFor: trade.description || 'Open to offers',
    seller: {
      id: trade.user_id,
      name: trade.owner_name || 'Trader',
      initial: (trade.owner_name || 'T').charAt(0).toUpperCase(),
      color: tradeAvatarColor,
    },
    status: trade.status === 'approved'
      ? 'available'
      : trade.status === 'closed'
        ? 'pending'
        : trade.status,
    listingType,
    price: null,
    listedDate: formatDate(trade.created_at),
    estimatedValue: '$--',
    backendRecord: trade,
  };
};

const toRequest = (request, direction) => ({
  id: String(request.id),
  requestId: String(request.id),
  direction,
  listingId: String(request.listing_id),
  listing: {
    jerseyName: request.listing_title || 'Trade listing',
    owner: request.listing_owner_name || 'Trader',
    image: request.listing_image_url || '',
    description: request.listing_description || '',
    size: '',
    condition: '',
  },
  offer: {
    jerseyName: direction === 'incoming'
      ? `${request.sender_name || 'Trader'} offer`
      : `${request.sender_name || 'You'} offer`,
    from: request.sender_name || 'Trader',
    initial: (request.sender_name || 'T').charAt(0).toUpperCase(),
    color: tradeAvatarColor,
    image: '',
    description: '',
  },
  message: request.listing_description || '',
  status: request.status || 'pending',
  date: formatDate(request.created_at),
  backendRecord: request,
});

export const TradeProvider = ({ children }) => {
  const [listings, setListings] = useState([]);
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const refreshTrades = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const user = getStoredUser();
      const [marketplaceTrades, myTrades, receivedRequests, sentRequests] = await Promise.all([
        getTrades(),
        user ? getMyTradeListings().catch(() => []) : Promise.resolve([]),
        user ? getReceivedTradeRequests().catch(() => []) : Promise.resolve([]),
        user ? getSentTradeRequests().catch(() => []) : Promise.resolve([]),
      ]);

      const marketplaceListings = marketplaceTrades.map(toListing);
      const personalListings = myTrades
        .map(toListing)
        .filter((trade) => !marketplaceListings.some((listing) => listing.id === trade.id));

      setListings([...personalListings, ...marketplaceListings]);
      setRequests([
        ...receivedRequests.map((request) => toRequest(request, 'incoming')),
        ...sentRequests.map((request) => toRequest(request, 'outgoing')),
      ]);
    } catch (requestError) {
      setError(requestError.message || 'Failed to load trade marketplace');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshTrades();
  }, [refreshTrades]);

  useEffect(() => {
    const handleAuthChange = () => {
      refreshTrades();
    };

    window.addEventListener('jerseys-auth-change', handleAuthChange);
    return () => window.removeEventListener('jerseys-auth-change', handleAuthChange);
  }, [refreshTrades]);

  const addListing = useCallback(async (formData) => {
    const title = `${formData.club} - ${formData.jerseyName}`;
    const descriptionParts = [
      formData.description,
      formData.lookingFor ? `Looking for: ${formData.lookingFor}` : '',
      formData.size ? `Size: ${formData.size}` : '',
      formData.condition ? `Condition: ${formData.condition}` : '',
      formData.listingType ? `Listing type: ${formData.listingType}` : '',
      formData.price ? `Price: ${formData.price}` : '',
    ].filter(Boolean);

    const createdTrade = await createTrade({
      title,
      description: descriptionParts.join(' | '),
      image_url: formData.imageDataUrl || formData.imageUrl || '',
    });

    const nextListing = toListing(createdTrade);
    setListings((currentListings) => [nextListing, ...currentListings]);
    return nextListing.id;
  }, []);

  const addRequest = useCallback(async (listingId) => {
    const createdRequest = await requestTrade(listingId);
    const nextRequest = toRequest(createdRequest, 'outgoing');
    setRequests((currentRequests) => [nextRequest, ...currentRequests]);
    return true;
  }, []);

  const removeListing = useCallback(async (listingId) => {
    await cancelTradeListing(listingId);

    setListings((currentListings) =>
      currentListings.filter((listing) => listing.id !== String(listingId)),
    );

    setRequests((currentRequests) =>
      currentRequests.filter((request) => request.listingId !== String(listingId)),
    );
  }, []);

  const respondToRequest = useCallback(async (requestId, response) => {
    const updatedRequest = response === 'accepted'
      ? await acceptTradeRequest(requestId)
      : await rejectTradeRequest(requestId);
    const nextRequest = toRequest(updatedRequest, 'incoming');

    setRequests((currentRequests) =>
      currentRequests.map((request) =>
        request.id === String(requestId)
          ? { ...request, ...nextRequest, direction: request.direction }
          : request),
    );

    if (response === 'accepted') {
      setListings((currentListings) =>
        currentListings.map((listing) =>
          listing.id === String(updatedRequest.listing_id)
            ? { ...listing, status: 'pending' }
            : listing),
      );
    }
  }, []);

  const value = useMemo(() => ({
    listings,
    requests,
    isLoading,
    error,
    refreshTrades,
    addListing,
    addRequest,
    removeListing,
    respondToRequest,
  }), [addListing, addRequest, error, isLoading, listings, refreshTrades, removeListing, requests, respondToRequest]);

  return (
    <TradeContext.Provider value={value}>
      {children}
    </TradeContext.Provider>
  );
};

export const useTrade = () => {
  const ctx = useContext(TradeContext);
  if (!ctx) throw new Error('useTrade must be used within a TradeProvider');
  return ctx;
};
