import { createRoot } from 'react-dom/client';
import './globalStyles.css';
import App from './components/App/App';
import { ApiClientContext } from './contexts/apiClient';
import { SocketContext } from './contexts/socket';
import getApiClient from './utils/apiClient';
import getSocket from './utils/socket';

const apiClient = getApiClient();
const rootElement = document.getElementById('root');
const root = createRoot(rootElement!);

root.render(
	<ApiClientContext.Provider value={{ apiClient }}>
		<SocketContext.Provider value={getSocket()}>
			<App />
		</SocketContext.Provider>
	</ApiClientContext.Provider>,
);
