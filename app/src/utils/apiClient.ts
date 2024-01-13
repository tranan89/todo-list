import axios from 'axios';

// axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

const getApiClient = () => {
	// TODO: add headers, xsrf protection, response transformers, cookies (if SSR) etc.
	return axios.create({
		baseURL: 'http://localhost:3000',
		timeout: 10000,
	});
};

export default getApiClient;
