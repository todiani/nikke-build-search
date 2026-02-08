export const CHOSUNG = [
    'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
];

const CHOSUNG_LEADING = [
    'ᄀ', 'ᄁ', 'ᄂ', 'ᄃ', 'ᄄ', 'ᄅ', 'ᄆ', 'ᄇ', 'ᄈ', 'ᄉ', 'ᄊ', 'ᄋ', 'ᄌ', 'ᄍ', 'ᄎ', 'ᄏ', 'ᄐ', 'ᄑ', 'ᄒ'
];

const normalizeForMatch = (s: string) => s.normalize('NFKC').normalize('NFC').replace(/\s+/g, '');

const toCompatChosung = (c: string) => {
    if (CHOSUNG.includes(c)) return c;
    const idx = CHOSUNG_LEADING.indexOf(c);
    if (idx >= 0) return CHOSUNG[idx];
    return c;
};

export function getChosung(char: string): string {
    const code = char.charCodeAt(0);
    // Check if it's a Hangul Syllable
    if (code >= 0xAC00 && code <= 0xD7A3) {
        const chosungIndex = Math.floor((code - 0xAC00) / 588);
        return CHOSUNG[chosungIndex];
    }
    return char;
}

// Decompose a Hangul char into Chosung
// This is already done by getChosung for single char.
// We need a helper to stringify text to Chosung.

export function getChosungString(text: string): string {
    let result = '';
    for (const char of text) {
        result += getChosung(char);
    }
    return result;
}

export function matchKorean(text: string, query: string): boolean {
    if (!query) return true;
    if (typeof text !== 'string') return false;

    const t = normalizeForMatch(text);
    const q = normalizeForMatch(query);

    if (q.length === 0) return false;

    // Sliding window search
    for (let i = 0; i <= t.length - q.length; i++) {
        let match = true;
        for (let j = 0; j < q.length; j++) {
            const tc = t[i + j];  // Use original case char for Chosung extraction if needed? Chosung works on charCode.
            const qc = q[j];

            // For English, case insensitive match
            const tcLower = tc.toLowerCase();
            const qcLower = qc.toLowerCase();

            // Check if Query Char is a Hangul Jamo (Chosung)
            // Hangul Compatibility Jamo range: 0x3131 (ㄱ) ~ 0x314E (ㅎ) seems to be the CHOSUNG array usually.
            // Let's rely on checking if it matches one of our CHOSUNG chars.
            const isQJamo = CHOSUNG.includes(qc) || CHOSUNG_LEADING.includes(qc);

            if (isQJamo) {
                // Fuzzy match: Text's Chosung == Query Jamo
                if (toCompatChosung(getChosung(tc)) !== toCompatChosung(qc)) {
                    match = false;
                    break;
                }
            } else {
                // Exact match needed (Syllable against Syllable, or English against English)
                if (tcLower !== qcLower) {
                    match = false;
                    break;
                }
            }
        }
        if (match) return true;
    }

    return false;
}
