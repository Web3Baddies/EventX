'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useParams } from 'next/navigation';
import { useBlockchainIntegration } from '@/hooks/useBlockchainIntegration';
import { Event } from '@/types/contract';

export default function EventDetailsPage() {
  const params = useParams();
  const idParam = params?.id as string;
  const eventId = Number(idParam);
  const search = useSearchParams();
  const metaCid = search.get('metaCid') || '';
  const imgParam = search.get('img') || '';

  const { getEventDetails } = useBlockchainIntegration();

  const [event, setEvent] = useState<Event | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [origin, setOrigin] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') setOrigin(window.location.origin);
  }, []);

  // Load event from chain
  useEffect(() => {
    (async () => {
      if (!eventId || Number.isNaN(eventId)) return;
      const ev = await getEventDetails(eventId);
      setEvent(ev);
    })();
  }, [eventId, getEventDetails]);

  // Resolve and cache imageUrl order: img param > metaCid fetch > localStorage mapping
  useEffect(() => {
    const resolveImage = async () => {
      try {
        // If img provided directly, trust it and cache
        if (imgParam) {
          setImageUrl(imgParam);
          try {
            const raw = localStorage.getItem('event_images');
            const map = raw ? JSON.parse(raw) : {};
            map[String(eventId)] = imgParam;
            localStorage.setItem('event_images', JSON.stringify(map));
          } catch {}
          return;
        }
        // If metaCid provided, fetch JSON from gateway
        if (metaCid) {
          const res = await fetch(`https://gateway.pinata.cloud/ipfs/${metaCid}`);
          if (res.ok) {
            const data = await res.json();
            const url = data?.imageUrl || '';
            if (url) {
              setImageUrl(url);
              try {
                const raw = localStorage.getItem('event_images');
                const map = raw ? JSON.parse(raw) : {};
                map[String(eventId)] = url;
                localStorage.setItem('event_images', JSON.stringify(map));
              } catch {}
              return;
            }
          }
        }
        // Fallback to any cached mapping
        try {
          const raw = localStorage.getItem('event_images');
          const map = raw ? JSON.parse(raw) : {};
          if (map[String(eventId)]) setImageUrl(map[String(eventId)]);
        } catch {}
      } catch (e) {
        // ignore
      }
    };
    if (eventId) resolveImage();
  }, [eventId, metaCid, imgParam]);

  const shareUrl = useMemo(() => {
    if (!origin || !eventId) return '';
    const url = new URL(`${origin}/event/${eventId}`);
    if (metaCid) url.searchParams.set('metaCid', metaCid);
    if (imageUrl && !metaCid) url.searchParams.set('img', imageUrl);
    return url.toString();
  }, [origin, eventId, metaCid, imageUrl]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-brand-600 hover:link-brand">Evnnt</Link>
              <span className="ml-2 text-sm text-gray-700">Event Details</span>
            </div>
            <nav className="flex items-center gap-6">
              <Link href="/" className="text-gray-700 hover:link-brand">Events</Link>
              <Link href="/my-tickets" className="text-gray-700 hover:link-brand">My Tickets</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-xl shadow overflow-hidden">
          {imageUrl && (
            <div className="w-full aspect-[16/9] bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl} alt="Event flyer" className="w-full h-full object-cover" />
            </div>
          )}
          <div className="p-6">
            {event ? (
              <>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{event.title}</h1>
                <div className="text-sm text-gray-800 mb-4">
                  <p className="font-medium">{event.date} at {event.time}</p>
                  <p className="font-medium">{event.location}</p>
                  <p className="mt-1 font-medium">Available: {event.tickets}/{event.maxTickets}</p>
                </div>

                <div className="flex flex-col md:flex-row gap-6 items-start">
                  {/* Share & QR */}
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800 mb-1">Share this event</p>
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                        readOnly
                        value={shareUrl}
                      />
                      <button
                        className="px-4 py-2 text-sm bg-brand-600 text-white rounded hover:bg-brand-700 transition-colors"
                        onClick={() => shareUrl && navigator.clipboard.writeText(shareUrl)}
                      >Copy</button>
                    </div>
                    {shareUrl && (
                      <div className="border rounded p-2 inline-block bg-white">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          alt="Event QR"
                          width={180}
                          height={180}
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(shareUrl)}`}
                        />
                      </div>
                    )}
                  </div>

                  {/* Register link back to app */}
                  <div className="w-full md:w-64">
                    <Link
                      href="/"
                      className="block text-center w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Open App to Register
                    </Link>
                    <p className="text-xs text-gray-600 mt-2">Open the app, find this event, and select your seat to register.</p>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-gray-500">Loading event...</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
