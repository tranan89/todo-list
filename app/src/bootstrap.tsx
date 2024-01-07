import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './globalStyles.css';
import App from './components/App/App';

const rootElement = document.getElementById('root');

// New as of React18
const root = createRoot(rootElement!);

root.render(
	<StrictMode>
		<App />
	</StrictMode>,
);
