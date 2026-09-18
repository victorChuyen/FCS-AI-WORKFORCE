import { useNavigate as useRouterNavigate } from 'react-router-dom';

export function useAppNavigate() {
  const navigate = useRouterNavigate();
  
  return (route: string, params?: Record<string, string>) => {
    if (params && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value);
        }
      });
      navigate(`${route}?${searchParams.toString()}`);
    } else {
      navigate(route);
    }
  };
}
