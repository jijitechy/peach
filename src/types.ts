export type EscrowStatus =
  | 'none'
  | 'pending_payment'
  | 'held_in_escrow'
  | 'shipped'
  | 'delivered'
  | 'funds_released'
  | 'disputed';

export interface Seller {
  id: string;
  name: string;
  rating: number;
  avatar: string;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  category: string;
  condition: string;
  location: string;
  seller: Seller;
  startingBid: number;
  reservePrice: number;
  currentBid: number;
  bidsCount: number;
  endTime: string;
  status: 'active' | 'completed' | 'cancelled';
  winnerId: string | null;
  winnerName: string | null;
  escrowStatus: EscrowStatus;
  deliveryOption: string | null;
  deliveryFee: number;
  deliveryAddress: string | null;
  mpesaPhone: string | null;
  mpesaReceipt: string | null;
  trackingCode: string | null;
  imageUrl: string;
  bidHistory?: Bid[];
  isAd?: boolean;
  adTagline?: string;
  brand?: string;
  specs?: string;
  size?: string;
  warranty?: string;
  minIncrement?: number;
  autoBidderId?: string | null;
  autoBidderName?: string | null;
  autoBidLimit?: number | null;
  autoBidLocation?: string | null;
}

export interface Bid {
  id: string;
  listingId: string;
  bidderName: string;
  amount: number;
  timestamp: string;
  location?: string;
  notes?: string;
}

export type ViewportMode = 'web' | 'mobile';

export interface UserState {
  id: string;
  username: string;
  name: string;
  phone: string;
  avatar: string;
  balance: number;
  role: 'buyer' | 'seller' | 'admin';
}

export interface ValuationReport {
  estimatedNewPrice: number;
  recommendedStartingBid: number;
  estimatedEscrowFee: number;
  marketVibe: string;
  expertOpinion: string;
}
