import { useSearchParams } from 'react-router-dom';
import { errorPage as t } from '../translations';

const ErrorPage = () => {
    const [searchParams] = useSearchParams();
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    const code = searchParams.get('code');

    return (
        <div className="flex items-center justify-center min-h-screen px-4 bg-gray-900">
            <div className="w-full max-w-md p-8 bg-gray-800 rounded-lg shadow-lg">
                <div className="text-center">
                    <h2 className="mb-4 text-3xl font-bold text-red-500">
                        {t.title}
                    </h2>
                    <div className="p-4 mb-6 space-y-3 text-left rounded-lg bg-red-900/50">
                        {code && (
                            <p className="text-red-200">
                                <span className="font-semibold">{t.errorCode}:</span> {code}
                            </p>
                        )}
                        {error && (
                            <p className="text-red-200">
                                <span className="font-semibold">{t.errorType}:</span> {error}
                            </p>
                        )}
                        {errorDescription && (
                            <p className="text-red-200">
                                <span className="font-semibold">{t.description}:</span> {errorDescription}
                            </p>
                        )}
                        {!code && !error && !errorDescription && (
                            <p className="text-red-200">
                                {t.unknownError}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="px-6 py-2 font-bold text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                        {t.returnHome}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ErrorPage;