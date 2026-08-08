export type SmsEncoding = "gsm7" | "unicode";

const GSM_7_BASIC =
    "@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !\"#¤%&'()*+,-./0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà";
const GSM_7_EXTENDED = "^{}\\[~]|€";
const GSM_7_SET = new Set([...GSM_7_BASIC, ...GSM_7_EXTENDED]);

export function detectEncoding(message: string): SmsEncoding {
    for (const char of message) {
        if (!GSM_7_SET.has(char)) return "unicode";
    }
    return "gsm7";
}

export type SegmentInfo = {
    encoding: SmsEncoding;
    characterCount: number;
    segmentCount: number;
    charsPerSegment: number;
    charsRemainingInSegment: number;
};

export function calculateSegments(message: string): SegmentInfo {
    const encoding = detectEncoding(message);
    const characterCount = [...message].length;
    const singleLimit = encoding === "gsm7" ? 160 : 70;
    const multipartLimit = encoding === "gsm7" ? 153 : 67;

    if (characterCount === 0) {
        return {
            encoding,
            characterCount: 0,
            segmentCount: 0,
            charsPerSegment: singleLimit,
            charsRemainingInSegment: singleLimit,
        };
    }

    if (characterCount <= singleLimit) {
        return {
            encoding,
            characterCount,
            segmentCount: 1,
            charsPerSegment: singleLimit,
            charsRemainingInSegment: singleLimit - characterCount,
        };
    }

    const segmentCount = Math.ceil(characterCount / multipartLimit);
    const usedInLastSegment =
        characterCount - (segmentCount - 1) * multipartLimit;

    return {
        encoding,
        characterCount,
        segmentCount,
        charsPerSegment: multipartLimit,
        charsRemainingInSegment: multipartLimit - usedInLastSegment,
    };
}

export const COST_PER_SEGMENT_USD = 0.0083;

export function estimateCost(segments: number, recipients: number): number {
    return segments * recipients * COST_PER_SEGMENT_USD;
}
