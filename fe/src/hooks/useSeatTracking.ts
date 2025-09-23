import { useState, useEffect, useCallback } from 'react';
import { Event } from '@/types/contract';

interface SeatStatus {
  seatNumber: number;
  isAvailable: boolean;
  isReserved: boolean;
  reservedBy?: string;
  reservationExpiry?: number;
}

interface UseSeatTrackingReturn {
  seatStatuses: SeatStatus[];
  reserveSeat: (seatNumber: number, userAddress: string) => Promise<boolean>;
  releaseSeat: (seatNumber: number) => void;
  confirmSeatPurchase: (seatNumber: number) => Promise<boolean>;
  getAvailableSeats: () => number[];
  getTotalAvailable: () => number;
}

const RESERVATION_TIMEOUT = 5 * 60 * 1000; // 5 minutes in milliseconds

export const useSeatTracking = (event: Event): UseSeatTrackingReturn => {
  const [seatStatuses, setSeatStatuses] = useState<SeatStatus[]>([]);

  // Initialize seat statuses
  useEffect(() => {
    if (!event) return;

    const initialSeats: SeatStatus[] = Array.from({ length: event.maxTickets }, (_, index) => ({
      seatNumber: index,
      isAvailable: true,
      isReserved: false,
    }));

    setSeatStatuses(initialSeats);
  }, [event]);

  // Clean up expired reservations
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setSeatStatuses(prev => 
        prev.map(seat => {
          if (seat.isReserved && seat.reservationExpiry && seat.reservationExpiry < now) {
            return {
              ...seat,
              isReserved: false,
              reservedBy: undefined,
              reservationExpiry: undefined,
            };
          }
          return seat;
        })
      );
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const reserveSeat = useCallback(async (seatNumber: number, userAddress: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setSeatStatuses(prev => {
        const seat = prev[seatNumber];
        if (!seat || !seat.isAvailable || seat.isReserved) {
          resolve(false);
          return prev;
        }

        const newStatuses = [...prev];
        newStatuses[seatNumber] = {
          ...seat,
          isReserved: true,
          reservedBy: userAddress,
          reservationExpiry: Date.now() + RESERVATION_TIMEOUT,
        };

        resolve(true);
        return newStatuses;
      });
    });
  }, []);

  const releaseSeat = useCallback((seatNumber: number) => {
    setSeatStatuses(prev => {
      const newStatuses = [...prev];
      if (newStatuses[seatNumber]) {
        newStatuses[seatNumber] = {
          ...newStatuses[seatNumber],
          isReserved: false,
          reservedBy: undefined,
          reservationExpiry: undefined,
        };
      }
      return newStatuses;
    });
  }, []);

  const confirmSeatPurchase = useCallback(async (seatNumber: number): Promise<boolean> => {
    return new Promise((resolve) => {
      setSeatStatuses(prev => {
        const seat = prev[seatNumber];
        if (!seat || !seat.isReserved) {
          resolve(false);
          return prev;
        }

        const newStatuses = [...prev];
        newStatuses[seatNumber] = {
          ...seat,
          isAvailable: false,
          isReserved: false,
          reservedBy: undefined,
          reservationExpiry: undefined,
        };

        resolve(true);
        return newStatuses;
      });
    });
  }, []);

  const getAvailableSeats = useCallback((): number[] => {
    return seatStatuses
      .filter(seat => seat.isAvailable && !seat.isReserved)
      .map(seat => seat.seatNumber);
  }, [seatStatuses]);

  const getTotalAvailable = useCallback((): number => {
    return seatStatuses.filter(seat => seat.isAvailable && !seat.isReserved).length;
  }, [seatStatuses]);

  return {
    seatStatuses,
    reserveSeat,
    releaseSeat,
    confirmSeatPurchase,
    getAvailableSeats,
    getTotalAvailable,
  };
};
