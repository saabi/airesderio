import blockRangeData from '$lib/data/argentina-block-ranges.json';

/**
 * Range of valid block numbers for a particular area code. Once the area code
 * and subscriber number have been isolated from the input this dictionary is
 * used to verify that the first digits of the subscriber number fall within a
 * range allocated by ENACOM.
 */
export type BlockRangeMap = Record<string, Array<[number, number]>>;
const blockRanges: BlockRangeMap = blockRangeData as BlockRangeMap;

const AREA_CODES = Object.keys(blockRanges);
const SORTED_AREA_CODES = [...AREA_CODES].sort((a, b) => b.length - a.length);
const MIN_AREA_CODES = 300;

if (AREA_CODES.length < MIN_AREA_CODES) {
  throw new Error(
    `Argentine block range dataset appears incomplete: expected at least ${MIN_AREA_CODES} area codes, found ${AREA_CODES.length}`
  );
}

const SPECIAL_CODES = new Set([
  '19',
  '100',
  '101',
  '102',
  '103',
  '105',
  '106',
  '107',
  '108',
  '110',
  '112',
  '113',
  '114',
  '115',
  '121',
  '125',
  '126',
  '130',
  '131',
  '132',
  '133',
  '134',
  '135',
  '136',
  '137',
  '138',
  '139',
  '144',
  '145',
  '147',
  '911',
  '000',
]);

interface SpecificServiceDescriptor {
  prefix: string;
  allowedLengths: number[];
}

const SPECIFIC_SERVICE_PREFIXES: SpecificServiceDescriptor[] = [
  { prefix: '0800', allowedLengths: [7, 8] },
  { prefix: '0810', allowedLengths: [7, 8] },
  { prefix: '0822', allowedLengths: [7, 8] },
  { prefix: '0823', allowedLengths: [7, 8] },
  { prefix: '0610', allowedLengths: [7, 8] },
  { prefix: '0611', allowedLengths: [7, 8] },
  { prefix: '0612', allowedLengths: [7, 8] },
  { prefix: '0609', allowedLengths: [7, 8] },
  { prefix: '0600', allowedLengths: [7, 8] },
  { prefix: '0747', allowedLengths: [7, 8] },
  { prefix: '0939', allowedLengths: [7, 8] },
  { prefix: '0605', allowedLengths: [7, 8] },
  { prefix: '0603', allowedLengths: [7, 8] },
];

export interface PhoneData {
  /** Raw input string, cleaned of whitespace and punctuation */
  input: string;
  /** Optional international prefix (00 or +) */
  international?: string;
  /** Country code, always 54 for Argentina */
  country?: string;
  /** National calling prefix (0) */
  nationalCall?: string;
  /** Mobile indicator for international format (9) */
  mobile?: string;
  /** Prefix 15 indicating a mobile number in national format */
  mobilePrefix?: string;
  /** Area code extracted from the number */
  areaCode?: string;
  /** Subscriber number with area code stripped */
  subscriber: string;
  /** Leading block of subscriber number used for validation */
  blockNumber?: string;
  /** Remaining digits of subscriber number after removing blockNumber */
  givenNumber?: string;
  /** Special service code (e.g. 911) */
  special?: string;
  /** Specific service code (e.g. 0800) */
  specific?: string;
  /** Type of phone: landline, mobile, special or specific */
  type: 'landline' | 'mobile' | 'special' | 'specific' | null;
}

function cleanup(str: string): string {
  return str
    .toString()
    .replace(/[^\\d+]+/g, '')
    .trim();
}

function findBlockNumber(areaCode: string | undefined, subscriber: string): string | undefined {
  if (!areaCode) return undefined;
  const ranges = blockRanges[areaCode];
  if (!ranges) return undefined;
  for (const [min, max] of ranges) {
    const maxLen = String(max).length;
    if (subscriber.length < maxLen) continue;
    const prefix = subscriber.slice(0, maxLen);
    const num = parseInt(prefix, 10);
    if (num >= min && num <= max) {
      return prefix;
    }
  }
  return undefined;
}

function determineType(data: Partial<PhoneData>): PhoneData['type'] {
  if (data.special) return 'special';
  if (data.specific) return 'specific';
  if (data.areaCode && data.subscriber) {
    const total = data.areaCode.length + data.subscriber.length;
    if (total === 10) {
      return data.mobile || data.mobilePrefix ? 'mobile' : 'landline';
    }
  } else if (!data.areaCode && data.subscriber) {
    const len = data.subscriber.length;
    if (len >= 6 && len <= 8) {
      return data.mobile || data.mobilePrefix ? 'mobile' : 'landline';
    }
  }
  return null;
}

function isDigits(value: string): boolean {
  return /^\d+$/.test(value);
}

interface ExtractedNumber {
  areaCode?: string;
  mobilePrefix?: string;
  subscriber: string;
}

function extractAreaAndSubscriber(input: string): ExtractedNumber | undefined {
  if (!input) return undefined;

  for (const code of SORTED_AREA_CODES) {
    if (!input.startsWith(code)) continue;
    let remainder = input.slice(code.length);
    if (!remainder) return undefined;

    let mobilePrefix: string | undefined;
    if (remainder.startsWith('15')) {
      mobilePrefix = '15';
      remainder = remainder.slice(2);
    }

    if (!remainder) return undefined;
    if (!isDigits(remainder)) return undefined;

    return { areaCode: code, mobilePrefix, subscriber: remainder };
  }

  let subscriber = input;
  let mobilePrefix: string | undefined;
  if (subscriber.startsWith('15')) {
    mobilePrefix = '15';
    subscriber = subscriber.slice(2);
  }

  if (!subscriber) return undefined;
  if (!isDigits(subscriber)) return undefined;

  return { subscriber, mobilePrefix };
}

function parseSpecialNumber(cleaned: string): PhoneData | undefined {
  if (!SPECIAL_CODES.has(cleaned)) return undefined;
  return {
    input: cleaned,
    subscriber: '',
    special: cleaned,
    type: 'special',
  } as PhoneData;
}

function parseSpecificService(cleaned: string): PhoneData | undefined {
  for (const descriptor of SPECIFIC_SERVICE_PREFIXES) {
    if (!cleaned.startsWith(descriptor.prefix)) continue;
    const subscriber = cleaned.slice(descriptor.prefix.length);
    if (!subscriber) return undefined;
    if (!descriptor.allowedLengths.includes(subscriber.length)) return undefined;
    if (!isDigits(subscriber)) return undefined;

    return {
      input: cleaned,
      specific: descriptor.prefix,
      subscriber,
      type: 'specific',
    } as PhoneData;
  }
  return undefined;
}

function expectedSubscriberLength(areaCode?: string): number | undefined {
  if (!areaCode) return undefined;
  if (areaCode === '11') return 8;
  return 10 - areaCode.length;
}

function normalisePrefixes(cleaned: string) {
  let rest = cleaned;
  let international: string | undefined;

  if (rest.startsWith('+')) {
    international = '+';
    rest = rest.slice(1);
  } else if (rest.startsWith('00')) {
    international = '00';
    rest = rest.slice(2);
  }

  while (rest.startsWith('+')) {
    rest = rest.slice(1);
  }

  let country: string | undefined;
  if (rest.startsWith('54')) {
    country = '54';
    rest = rest.slice(2);
  }

  let nationalCall: string | undefined;
  if (rest.startsWith('0')) {
    nationalCall = '0';
    rest = rest.slice(1);
  }

  let mobile: string | undefined;
  if (country && rest.startsWith('9')) {
    mobile = '9';
    rest = rest.slice(1);
  }

  if (!nationalCall && rest.startsWith('0')) {
    nationalCall = '0';
    rest = rest.slice(1);
  }

  return { rest, international, country, nationalCall, mobile };
}

export function parseArgentineNumber(raw: string): PhoneData | undefined {
  const cleaned = cleanup(raw);
  if (!cleaned) return undefined;

  const special = parseSpecialNumber(cleaned);
  if (special) return special;

  const specific = parseSpecificService(cleaned);
  if (specific) return specific;

  const { rest, international, country, nationalCall, mobile } = normalisePrefixes(cleaned);
  if (!rest) return undefined;

  const extracted = extractAreaAndSubscriber(rest);
  if (!extracted) return undefined;

  let { areaCode, mobilePrefix, subscriber } = extracted;

  if (!areaCode) {
    const length = subscriber.length;
    if (length < 6 || length > 8) {
      return undefined;
    }
  } else {
    const expectedLength = expectedSubscriberLength(areaCode);
    if (!expectedLength || subscriber.length !== expectedLength) {
      return undefined;
    }
  }

  const data: Partial<PhoneData> = {
    input: cleaned,
    international,
    country,
    nationalCall,
    mobile,
    mobilePrefix,
    areaCode,
    subscriber,
  };

  const areaRef = areaCode ?? (subscriber.length === 8 ? '11' : undefined);
  const block = findBlockNumber(areaRef, subscriber);
  data.blockNumber = block;
  if (block) {
    data.givenNumber = subscriber.slice(block.length);
  }

  data.type = determineType(data);

  if (data.type && areaRef && !block) {
    return undefined;
  }

  return data as PhoneData;
}

export function isValidArgentineNumber(raw: string): boolean {
  const parsed = parseArgentineNumber(raw);
  if (!parsed) return false;
  if (parsed.specific || parsed.special) {
    return true;
  }
  return parsed.blockNumber !== undefined;
}

export interface FormatOptions {
  country?: boolean;
  nationalPrefix?: boolean;
  internationalMobile?: boolean;
}

export function formatArgentineNumber(parsed: PhoneData, opts: FormatOptions = {}): string {
  const { country = true, nationalPrefix = false, internationalMobile = true } = opts;

  if (parsed.type === 'special' && parsed.special) {
    return parsed.special;
  }

  if (parsed.type === 'specific' && parsed.specific) {
    const sub = parsed.subscriber;
    let subscriberFormatted = sub;
    if (sub.length === 7) {
      subscriberFormatted = `${sub.slice(0, 3)}-${sub.slice(3)}`;
    } else if (sub.length === 8) {
      subscriberFormatted = `${sub.slice(0, 4)}-${sub.slice(4)}`;
    }
    return `${parsed.specific} ${subscriberFormatted}`;
  }

  let parts: string[] = [];

  if (country && parsed.country) {
    parts.push(`+${parsed.country}`);
  }

  if (parsed.type === 'mobile') {
    if (internationalMobile && parsed.mobile) {
      parts.push(parsed.mobile);
    } else if (parsed.mobilePrefix) {
      parts.push(parsed.mobilePrefix);
    }
  }

  if (!country && nationalPrefix && parsed.nationalCall) {
    parts.push(parsed.nationalCall);
  }

  if (parsed.areaCode) {
    parts.push(parsed.areaCode);
  }

  const number = parsed.subscriber;
  let formattedSubscriber = number;
  if (number.length === 6) {
    formattedSubscriber = `${number.slice(0, 3)}-${number.slice(3)}`;
  } else if (number.length === 7) {
    formattedSubscriber = `${number.slice(0, 3)}-${number.slice(3)}`;
  } else if (number.length === 8) {
    formattedSubscriber = `${number.slice(0, 4)}-${number.slice(4)}`;
  }
  parts.push(formattedSubscriber);

  return parts.join(' ');
}
