import '../styles/globals.css';
import { VotingProvider } from '../context/Voter';

function MyApp({ Component, pageProps }) {
    return (
        <VotingProvider>
            <Component {...pageProps} />
        </VotingProvider>
    );
}

export default MyApp;
