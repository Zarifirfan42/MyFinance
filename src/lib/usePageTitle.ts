import { useEffect } from 'react';

export function usePageTitle(pageName: string) {
  useEffect(() => {
    document.title = `${pageName} — MyFinance MYR`;
  }, [pageName]);
}
