import { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import Datepicker from "flowbite-datepicker/Datepicker";

import pt from '../../node_modules/flowbite-datepicker/js/i18n/locales/pt.js';
import fr from '../../node_modules/flowbite-datepicker/js/i18n/locales/fr.js';

const LOCALES = {
    pt,
    fr
};

const FlowbiteDatepicker = ({
    id,
    placeholder = "Select a date",
    language = "en",
    onChange,
    className = "",
    value,
    ...props
}) => {
    const datepickerRef = useRef(null);
    const eventListenerRef = useRef(null);
    const onChangeRef = useRef(onChange);

    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    useEffect(() => {
        const cleanup = () => {
            const element = document.getElementById(id);
            if (eventListenerRef.current && element) {
                element.removeEventListener('changeDate', eventListenerRef.current);
                eventListenerRef.current = null;
            }
            if (datepickerRef.current) {
                datepickerRef.current.destroy();
                datepickerRef.current = null;
            }
        };

        cleanup();

        const element = document.getElementById(id);
        if (!element) {
            return;
        }

        try {
            const today = new Date();
            const oneYearAgo = new Date(today);
            oneYearAgo.setFullYear(today.getFullYear() - 1);

            const oneYearAhead = new Date(today);
            oneYearAhead.setFullYear(today.getFullYear() + 1);

            // Create instance without explicit format
            const instance = new Datepicker(element, {
                autohide: true,
                minDate: oneYearAgo,
                maxDate: oneYearAhead
            });

            // apply localization if language is not English and locale exists
            if (language !== 'en' && LOCALES[language]) {
                Object.assign(instance.constructor.locales, LOCALES[language]);
                instance.setOptions({ language });
            }

            datepickerRef.current = instance;

            if (value) {
                instance.setDate(new Date(value));
            } else {
                instance.setDate({ clear: true });
                element.value = '';
            }

            if (onChangeRef.current) {
                const handleChange = (e) => {
                    const date = e.detail.date;
                    if (onChangeRef.current && date) {
                        onChangeRef.current(date.toISOString());
                    }
                };
                eventListenerRef.current = handleChange;
                element.addEventListener('changeDate', handleChange);
            }
        } catch (error) {
            console.error('Error initializing datepicker:', error);
        }

        return cleanup;
    }, [id, language, value]);

    const defaultClassName = "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500";

    return (
        <div className="relative max-w-sm">
            <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
                <svg
                    className="w-4 h-4 text-gray-500 dark:text-gray-400"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z" />
                </svg>
            </div>
            <input
                id={id}
                type="text"
                className={`${defaultClassName} ${className}`.trim()}
                placeholder={placeholder}
                {...props}
            />
        </div>
    );
};

FlowbiteDatepicker.propTypes = {
    id: PropTypes.string.isRequired,
    placeholder: PropTypes.string,
    language: PropTypes.oneOf(['en', 'pt', 'fr']),
    onChange: PropTypes.func,
    className: PropTypes.string,
    value: PropTypes.string
};

export default FlowbiteDatepicker;