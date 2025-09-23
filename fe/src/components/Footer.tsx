import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center">
              <Image 
                src="/image.png" 
                alt="EventX" 
                width={160} 
                height={160} 
                className="h-24 w-24 md:h-32 md:w-32 object-contain" 
              />
              <p className="ml-4 text-gray-400">
                The future of event ticketing is here. <span className="font-medium text-white">Secure, transparent, and decentralized</span>.
              </p>
            </div>
          </div>
          <div>
            <h5 className="font-semibold mb-4">Platform</h5>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/about" className="text-gray-300 hover:text-white">About</Link>
              </li>
              <li>
                <Link href="/my-tickets" className="text-gray-300 hover:text-white">My Tickets</Link>
              </li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold mb-4">Support</h5>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white">Help Center</a></li>
              <li><a href="#" className="hover:text-white">Contact Us</a></li>
              <li><a href="#" className="hover:text-white">Terms</a></li>
              <li><a href="#" className="hover:text-white">Privacy</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} EventX. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
