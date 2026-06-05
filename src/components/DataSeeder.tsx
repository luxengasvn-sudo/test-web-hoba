'use client';

import { useEffect } from 'react';

export default function DataSeeder() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isSeeded = localStorage.getItem('hoba_website_seeded_v9');
      if (!isSeeded) {
        // Load initial data dynamically to avoid bloating the main page load bundle
        import('@/lib/initialData.json')
          .then((module) => {
            const data = module.default;
            let count = 0;
            Object.entries(data).forEach(([key, value]) => {
              if (value && typeof value === 'string') {
                localStorage.setItem(key, value);
                count++;
              }
            });
            localStorage.setItem('hoba_website_seeded_v9', 'true');
            console.log(`Successfully seeded ${count} configurations into localStorage.`);
            window.location.reload();
          })
          .catch((err) => {
            console.error('Error seeding initial website configurations:', err);
          });
      }
    }
  }, []);

  return null;
}
