import { useEffect } from 'react';

interface PageMetaOptions {
  title: string;
  description?: string;
}

export function usePageMeta({ title, description }: PageMetaOptions) {
  useEffect(() => {
    // Set document title
    const fullTitle = title.includes('SUST')
      ? title
      : `${title} | SUST FES Academic Resource Library`;
    document.title = fullTitle;

    // Set meta description
    if (description) {
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', description);

      // OpenGraph description
      let ogDesc = document.querySelector('meta[property="og:description"]');
      if (!ogDesc) {
        ogDesc = document.createElement('meta');
        ogDesc.setAttribute('property', 'og:description');
        document.head.appendChild(ogDesc);
      }
      ogDesc.setAttribute('content', description);

      // OpenGraph title
      let ogTitle = document.querySelector('meta[property="og:title"]');
      if (!ogTitle) {
        ogTitle = document.createElement('meta');
        ogTitle.setAttribute('property', 'og:title');
        document.head.appendChild(ogTitle);
      }
      ogTitle.setAttribute('content', fullTitle);
    }
  }, [title, description]);
}
