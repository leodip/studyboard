import { about } from '../translations';

export default function About() {
    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                {about.title}
            </h1>

            <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
                <p className="text-gray-700 dark:text-gray-300">
                    {about.description}
                </p>
            </div>
        </div>
    );
}