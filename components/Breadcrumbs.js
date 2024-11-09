export default function Breadcrumbs({ items }) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <nav className="text-sm text-gray-400 mb-4">
        {items.map((item, i) => (
          <span key={i}>
            {i > 0 && ' / '}
            <a href={item.url} className="hover:text-purple-400">
              {item.name}
            </a>
          </span>
        ))}
      </nav>
    </>
  );
} 