import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

// the query string for you.
function useQuery() {
  const { search } = useLocation();

  return useMemo(() => new URLSearchParams(search), [search]);
}

export default useQuery;
