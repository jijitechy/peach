import { Listing, Bid, UserState } from "../types";

const SEED_LISTINGS: Listing[] = [
  {
    id: "lst-01",
    title: "iPhone 13 Pro (128GB, Sierra Blue)",
    description: "Highly sought-after, clean, and locally used iPhone 13 Pro. Face ID, TrueTone, and all proximity sensors are working. Battery health is at 88%. This unit has a premium ceramic guard and a complimentary original generic fast charger.",
    category: "Electronics",
    condition: "Good",
    location: "Nairobi, Kilimani",
    seller: { id: "sel-01", name: "Amos Mwangi", rating: 4.9, avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80" },
    startingBid: 58000,
    reservePrice: 65000,
    currentBid: 68500,
    bidsCount: 14,
    endTime: new Date(Date.now() + 1000 * 60 * 45).toISOString(),
    status: "active",
    winnerId: null,
    winnerName: null,
    escrowStatus: "none",
    deliveryOption: null,
    deliveryFee: 0,
    deliveryAddress: null,
    mpesaPhone: null,
    mpesaReceipt: null,
    trackingCode: null,
    imageUrl: "https://images.unsplash.com/photo-1632661674596-df8be070a5c5?auto=format&fit=crop&w=600&q=80",
    bidHistory: [
      { id: "bid-11", listingId: "lst-01", bidderName: "Wycliffe", amount: 68500, timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(), location: "Nairobi", notes: "Can pickup tomorrow" }
    ]
  },
  {
    id: "lst-02",
    title: "Sony PlayStation 5 Console (Disc Edition)",
    description: "Mint-condition PS5 Console with 1 white dual-sense controller. Purchased in the UK, rarely used. Runs extremely cool and silent, loaded with digital extras.",
    category: "Electronics",
    condition: "Like New",
    location: "Mombasa, Nyali",
    seller: { id: "sel-02", name: "Fatma Juma", rating: 4.7, avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80" },
    startingBid: 45000,
    reservePrice: 52000,
    currentBid: 56000,
    bidsCount: 9,
    endTime: new Date(Date.now() + 1000 * 60 * 180).toISOString(),
    status: "active",
    winnerId: null,
    winnerName: null,
    escrowStatus: "none",
    deliveryOption: null,
    deliveryFee: 0,
    deliveryAddress: null,
    mpesaPhone: null,
    mpesaReceipt: null,
    trackingCode: null,
    imageUrl: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=600&q=80",
    bidHistory: [
      { id: "bid-21", listingId: "lst-02", bidderName: "Joji Techy", amount: 56000, timestamp: new Date().toISOString(), location: "Mombasa", notes: "Peach escrow is perfect setup" }
    ]
  },
  {
    id: "lst-03",
    title: "Vintage Cowhide Leather Jacket - MediumSize",
    description: "Thick genuine sheepskin and cowhide leather jacket. Hand-finished vintage brown tone that patinas incredibly over time. Fits regular medium perfectly.",
    category: "Fashion",
    condition: "Good",
    location: "Eldoret, Central",
    seller: { id: "sel-03", name: "Kevin Koech", rating: 4.5, avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80" },
    startingBid: 4500,
    reservePrice: 6000,
    currentBid: 6800,
    bidsCount: 6,
    endTime: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    status: "active",
    winnerId: null,
    winnerName: null,
    escrowStatus: "none",
    deliveryOption: null,
    deliveryFee: 0,
    deliveryAddress: null,
    mpesaPhone: null,
    mpesaReceipt: null,
    trackingCode: null,
    imageUrl: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&q=80",
    bidHistory: []
  },
  {
    id: "lst-04",
    title: "Yamaha FG800 Acoustic Folk Guitar",
    description: "Superb acoustic sound quality with premium spruce solid top. Ideal for intermediate players. Resonant tone with low action setup.",
    category: "Books & Hobbies",
    condition: "Good",
    location: "Nairobi, Westlands",
    seller: { id: "sel-04", name: "Linus Omara", rating: 4.9, avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80" },
    startingBid: 12000,
    reservePrice: 15000,
    currentBid: 17500,
    bidsCount: 8,
    endTime: new Date(Date.now() + 1000 * 60 * 1440).toISOString(),
    status: "active",
    winnerId: null,
    winnerName: null,
    escrowStatus: "none",
    deliveryOption: null,
    deliveryFee: 0,
    deliveryAddress: null,
    mpesaPhone: null,
    mpesaReceipt: null,
    trackingCode: null,
    imageUrl: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "lst-ad-01",
    title: "Kenya Airways Flight Campaign Deal",
    description: "Fly to Mombasa, Nyali, or Kisumu with KQ Pride of Africa campaigns. Claim exclusive flight discounts hosted direct via Peach premium corporate sponsors.",
    category: "Services",
    condition: "New",
    location: "Nairobi, Westlands",
    seller: { id: "kq-corp", name: "Kenya Airways", rating: 5.0, avatar: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=150&q=80" },
    startingBid: 15000,
    reservePrice: 20000,
    currentBid: 22000,
    bidsCount: 0,
    endTime: new Date(Date.now() + 1000 * 60 * 9999).toISOString(),
    status: "active",
    winnerId: null,
    winnerName: null,
    escrowStatus: "none",
    deliveryOption: null,
    deliveryFee: 0,
    deliveryAddress: null,
    mpesaPhone: null,
    mpesaReceipt: null,
    trackingCode: null,
    imageUrl: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=600&q=80",
    isAd: true,
    adTagline: "Fly High with Pride of Africa"
  }
];

export function initLocalStorageDb() {
  if (!localStorage.getItem("peach_listings")) {
    localStorage.setItem("peach_listings", JSON.stringify(SEED_LISTINGS));
  }
}

export function getLocalListings(): Listing[] {
  initLocalStorageDb();
  try {
    const raw = localStorage.getItem("peach_listings");
    return raw ? JSON.parse(raw) : SEED_LISTINGS;
  } catch (e) {
    return SEED_LISTINGS;
  }
}

export function saveLocalListings(listings: Listing[]) {
  localStorage.setItem("peach_listings", JSON.stringify(listings));
}

export function createLocalListing(listing: Listing) {
  const listings = getLocalListings();
  listings.unshift(listing);
  saveLocalListings(listings);
}

export function getLocalListingBids(listingId: string): Bid[] {
  const listings = getLocalListings();
  const listing = listings.find(l => l.id === listingId);
  return listing?.bidHistory || [];
}

export function addLocalBid(listingId: string, bidAmount: number, user: UserState, location: string, notes: string, autoBidLimit?: number | null): Listing | null {
  const listings = getLocalListings();
  const index = listings.findIndex(l => l.id === listingId);
  if (index === -1) return null;

  const listing = listings[index];
  const newBid: Bid = {
    id: "bid-" + Math.random().toString(36).substr(2, 9),
    listingId,
    bidderName: user.name,
    amount: bidAmount,
    timestamp: new Date().toISOString(),
    location,
    notes
  };

  let triggerAutoBid = false;
  let autoBidAmt = 0;
  let autoBidderName = "";
  let autoBidderId = "";

  if (listing.autoBidLimit && listing.autoBidderId !== user.id) {
    if (bidAmount < listing.autoBidLimit) {
      triggerAutoBid = true;
      const minInc = listing.minIncrement || 1000;
      autoBidAmt = Math.min(listing.autoBidLimit, bidAmount + minInc);
      autoBidderName = listing.autoBidderName || "System AutoBidder";
      autoBidderId = listing.autoBidderId || "usr-02";
    } else {
      listing.autoBidLimit = null;
      listing.autoBidderId = null;
      listing.autoBidderName = null;
    }
  }

  const updatedHistory = listing.bidHistory ? [...listing.bidHistory, newBid] : [newBid];
  
  if (triggerAutoBid) {
    const autoBidObj: Bid = {
      id: "bid-" + Math.random().toString(36).substr(2, 9),
      listingId,
      bidderName: autoBidderName,
      amount: autoBidAmt,
      timestamp: new Date().toISOString(),
      location: "Nairobi",
      notes: "🤖 Secure Proxy Auto-Bid System"
    };
    updatedHistory.push(autoBidObj);
  }

  listings[index] = {
    ...listing,
    currentBid: triggerAutoBid ? autoBidAmt : bidAmount,
    bidsCount: (listing.bidsCount || 0) + (triggerAutoBid ? 2 : 1),
    winnerId: triggerAutoBid ? autoBidderId : user.id,
    winnerName: triggerAutoBid ? autoBidderName : user.name,
    bidHistory: updatedHistory,
    autoBidLimit: autoBidLimit !== undefined ? autoBidLimit : listing.autoBidLimit,
    autoBidderId: autoBidLimit ? user.id : (triggerAutoBid ? listing.autoBidderId : listing.autoBidderId),
    autoBidderName: autoBidLimit ? user.name : (triggerAutoBid ? listing.autoBidderName : listing.autoBidderName),
    autoBidLocation: autoBidLimit ? location : (triggerAutoBid ? listing.autoBidLocation : listing.autoBidLocation)
  };

  saveLocalListings(listings);
  return listings[index];
}

export function awardLocalBid(listingId: string, bidId: string): Listing | null {
  const listings = getLocalListings();
  const index = listings.findIndex(l => l.id === listingId);
  if (index === -1) return null;

  const listing = listings[index];
  const bid = listing.bidHistory?.find(b => b.id === bidId);
  if (!bid) return null;

  listings[index] = {
    ...listing,
    status: "completed",
    winnerId: "usr-" + Math.random().toString(36).substr(2, 9), // auto simulated winner ID
    winnerName: bid.bidderName,
    currentBid: bid.amount,
    escrowStatus: "pending_payment"
  };

  saveLocalListings(listings);
  return listings[index];
}

export function updateLocalEscrow(listingId: string, status: any): Listing | null {
  const listings = getLocalListings();
  const index = listings.findIndex(l => l.id === listingId);
  if (index === -1) return null;

  listings[index] = {
    ...listings[index],
    escrowStatus: status
  };

  saveLocalListings(listings);
  return listings[index];
}

const SEED_USERS = [
  { id: 'usr-01', username: 'joji@gmail.com', name: 'Joji Techy', phone: '0711223344', role: 'buyer', balance: 250000, avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80' },
  { id: 'usr-02', username: 'demo@gmail.com', name: 'Mock Investor', phone: '0722334455', role: 'buyer', balance: 29500, avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80' },
  { id: 'usr-03', username: 'jane@gmail.com', name: 'Jane Mwangi', phone: '0733445566', role: 'seller', balance: 95000, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80' },
  { id: 'usr-04', username: 'wycliffe@gmail.com', name: 'Wycliffe', phone: '0744556677', role: 'buyer', balance: 154000, avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80' },
  { id: 'usr-admin', username: 'admin@gmail.com', name: 'Peach Administrator', phone: '0700000000', role: 'admin', balance: 5000000, avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80' }
];

export function getLocalUsers() {
  const raw = localStorage.getItem("peach_simulated_users");
  if (!raw) {
    localStorage.setItem("peach_simulated_users", JSON.stringify(SEED_USERS));
    return SEED_USERS;
  }
  return JSON.parse(raw);
}

export function addLocalUser(user: any) {
  const list = getLocalUsers();
  list.push(user);
  localStorage.setItem("peach_simulated_users", JSON.stringify(list));
}

export function deleteLocalUser(userId: string) {
  const list = getLocalUsers();
  const filtered = list.filter((u: any) => u.id !== userId);
  localStorage.setItem("peach_simulated_users", JSON.stringify(filtered));
}

export function updateLocalUserBalance(userId: string, newBalance: number) {
  const list = getLocalUsers();
  const index = list.findIndex((u: any) => u.id === userId);
  if (index !== -1) {
    list[index].balance = newBalance;
    localStorage.setItem("peach_simulated_users", JSON.stringify(list));
  }
}
