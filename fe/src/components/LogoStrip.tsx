
interface LogoStripProps {
  title?: string;
  logos?: Array<{ src: string; alt: string; width?: number; height?: number }>;
  centered?: boolean;
}

export default function LogoStrip({ title, logos, centered = true }: LogoStripProps) {
  const items = logos || [
    { src: '/globe.svg', alt: 'Globe' },
    { src: '/vercel.svg', alt: 'Vercel' },
    { src: '/next.svg', alt: 'Next.js' },
    { src: '/file.svg', alt: 'Files' },
    { src: '/window.svg', alt: 'Window' },
  ];
  return (
    <div className={`py-8 ${centered ? 'text-center' : ''}`}>
      {title && (
        <p className="text-sm text-gray-500 mb-4">{title}</p>
      )}
      <div className={`flex flex-wrap items-center gap-8 ${centered ? 'justify-center' : ''}`}>
        {items.map((logo, i) => (
          <div key={i} className="opacity-60 hover:opacity-90 transition-opacity">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logo.src} alt={logo.alt} width={logo.width || 96} height={logo.height || 32} />
          </div>
        ))}
      </div>
    </div>
  );
}
