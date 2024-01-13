import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './globalStyles.css';
import App from './components/App/App';
import { ApiClientContext } from './contexts/apiClient';
import getApiClient from './utils/apiClient';

const apiClient = getApiClient();
const rootElement = document.getElementById('root');
const root = createRoot(rootElement!);

root.render(
	<StrictMode>
		<ApiClientContext.Provider value={{ apiClient }}>
			<App />
		</ApiClientContext.Provider>
	</StrictMode>,
);
