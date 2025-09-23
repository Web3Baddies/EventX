interface TestimonialItem {
  quote: string;
  author: string;
  role?: string;
}

interface TestimonialProps {
  title?: string;
  items: TestimonialItem[];
}

export default function Testimonial({ title, items }: TestimonialProps) {
  return (
    <div className="py-12">
      {title && <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">{title}</h3>}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {items.map((t, i) => (
          <figure key={i} className="rounded-2xl border border-gray-200 bg-white p-6">
            <blockquote className="text-gray-800 leading-relaxed">“{t.quote}”</blockquote>
            <figcaption className="mt-4 text-sm text-gray-600">
              <span className="font-medium text-gray-900">{t.author}</span>
              {t.role ? ` · ${t.role}` : ''}
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
