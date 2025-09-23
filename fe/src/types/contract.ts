export interface Event {
  id: number;
  title: string;
  price: bigint;
  tickets: number;
  maxTickets: number;
  date: string;
  time: string;
  location: string;
  maxResalePrice: bigint;
  organizer: string;
  imageUrl?: string;
  eventTimestamp?: number;
  canceled?: boolean;
  occurred?: boolean;
  escrowBalance?: bigint;
}

export interface TicketInfo {
  occasionId: number;
  seatNumber: number;
  isForSale: boolean;
  resalePrice: bigint;
  originalOwner: string;
}

// Solidity tuple return for getEventDetails
export type EventDetailsTuple = readonly [
  id: bigint,
  title: string,
  price: bigint,
  tickets: bigint,
  maxTickets: bigint,
  date: string,
  time: string,
  location: string,
  maxResalePrice: bigint,
  organizer: string,
  eventTimestamp: bigint,
  canceled: boolean,
  occurred: boolean,
  escrowBalance: bigint
];

// Solidity tuple return for getTicketDetails
export type TicketDetailsTuple = readonly [
  occasionId: bigint,
  seatNumber: bigint,
  isForSale: boolean,
  resalePrice: bigint,
  originalOwner: string
];

// Input shape for creating events from UI
export interface CreateEventInput {
  title: string;
  eventType: 'free' | 'paid';
  price?: string;
  maxTickets: string;
  date: string;
  time: string;
  location: string;
  maxResalePrice?: string;
}

export interface ContractConfig {
  address: string;
  chainId: number;
}
