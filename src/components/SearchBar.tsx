import React from 'react';

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    autoFocus?: boolean;
    focusTrigger?: any;
    placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, autoFocus, focusTrigger, placeholder }) => {
    const inputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        if ((autoFocus || focusTrigger !== undefined) && inputRef.current) {
            inputRef.current.focus();
        }
    }, [autoFocus, focusTrigger]);

    return (
        <div className="w-full max-w-2xl mx-auto mb-10">
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-nikke-red to-nikke-accent rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                <input
                    ref={inputRef}
                    type="text"
                    autoFocus={autoFocus}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder || "니케 이름을 검색하세요 (예: 레드 후드, 리터)"}
                    className="relative block w-full bg-nikke-card text-white border border-gray-700 rounded-lg py-4 px-6 focus:outline-none focus:ring-2 focus:ring-nikke-red placeholder-gray-500 text-lg"
                    lang="ko"
                    inputMode="text"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    🔍
                </div>
            </div>
        </div>
    );
};

export default SearchBar;
