import { createContext, useContext } from 'react';
import getApiClient from '../utils/apiClient';

interface ApiClientContextType {
	apiClient: ReturnType<typeof getApiClient>;
}

export const ApiClientContext = createContext<ApiClientContextType | null>(null);

export const useApiClient = () => {
	const apiClientContext = useContext(ApiClientContext);

	if (!apiClientContext) {
		throw new Error('useApiClient has to be used within <ApiClientContext.Provider>');
	}

	return apiClientContext;
};
