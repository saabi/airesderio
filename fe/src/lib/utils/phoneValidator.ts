/*
 * Argentine phone number validator and formatter
 *
 * This module implements a small subset of the functionality provided by
 * agustinbouillet/telefono‑argentino.  It follows ENACOM’s numbering rules,
 * validating area codes, optional country prefixes, mobile prefixes and
 * special/specific service codes.  The implementation is derived from the
 * open source script found in the telefono‑argentino repository.  That
 * script explains that valid Argentine phone numbers are defined by the
 * official ENACOM numbering tables and must match a complex regular
 * expression.  Numbers are considered valid when the area code and the
 * leading block of the subscriber number belong to one of the ranges
 * assigned to carriers【187285230036508†L283-L296】.  Special (e.g. 911) and
 * specific (e.g. 0800, 0810) service codes are also supported【187285230036508†L383-L387】.
 *
 * The regular expression and block ranges below are a direct port from
 * telefono‑argentino’s source code【425677470364029†L36-L61】.  See that file for
 * the complete list of area codes, prefixes and service numbers.  If
 * additional ENACOM updates are published you should update the regex
 * and ranges accordingly.
 */

/**
 * Range of valid block numbers for a particular area code.  Once the area
 * code and subscriber number have been isolated from the input this
 * dictionary is used to verify that the first digits of the subscriber
 * number fall within a range allocated by ENACOM.  Without this check
 * virtually any digit string of the correct length would pass the regex.
 */
const blockRanges: Record<string, Array<[number, number]>> = {
  "11": [
    [2000, 2042], [2044, 2208], [2210, 2899], [3000, 3708], [3710, 3714],
    [3719, 3746], [3750, 3962], [3964, 4151], [4156, 4335], [4338, 4381],
    [37150, 37158], [4382, 4526], [4528, 4591], [4593, 4593], [4597, 4605],
    [4607, 4674], [4676, 4699], [37470, 37470], [4700, 4708], [37480, 37481],
    [4709, 4716], [37490, 37490], [4717, 4867], [4870, 4909], [4911, 4912],
    [4914, 4928], [4930, 4933], [4935, 4943], [4945, 4954], [4956, 4986],
    [4988, 5203], [5208, 5266], [5268, 5329], [5332, 5379], [5382, 5389],
    [5393, 5396], [5400, 5916], [5918, 6631], [6633, 6696], [6698, 6861],
    [39630, 39635], [6862, 6919], [6926, 6926], [6920, 6925], [6927, 7071],
    [7073, 7076], [7078, 7718], [7720, 7935], [7937, 8109], [8111, 8111],
    [8200, 8309], [41525, 41529], [41550, 41550], [41552, 41558],
    [77190, 77199], [46060, 46062], [46750, 46759], [81100, 81105],
    [49870, 49879], [52055, 52059], [52075, 52079], [53300, 53319],
    [53810, 53810], [53816, 53819], [22090, 22095], [70720, 70729],
    [70770, 70775]
  ],
  "220": [
    [4120, 4125], [4140, 4159], [4700, 4726], [4215, 4219], [4727, 4729],
    [4750, 4759], [4319, 4329], [4880, 4889], [400, 411], [413, 413],
    [416, 419], [422, 429], [438, 439], [473, 473], [476, 487], [489, 501],
    [509, 509]
  ],
  "221": [
    [200, 203], [4300, 4309], [205, 226], [2275, 2278], [231, 240],
    [300, 311], [6455, 6456], [314, 339], [6580, 6582], [350, 379],
    [6587, 6587], [381, 400], [408, 429], [431, 462], [464, 490],
    [493, 499], [501, 509], [511, 519], [521, 533], [4630, 4639],
    [535, 552], [554, 630], [534, 534], [631, 644], [646, 649], [651, 657],
    [659, 699], [4910, 4929], [5000, 5000], [5003, 5009], [5100, 5109],
    [204, 204], [3120, 3129], [3135, 3139], [228, 230], [2270, 2274],
    [6500, 6500], [3800, 3809], [6457, 6458], [6583, 6583], [6459, 6459],
    [6584, 6586], [6588, 6589], [4020, 4045], [6501, 6503], [4049, 4049],
    [6504, 6507], [4070, 4079], [6508, 6509]
  ],
  // Additional area codes could be added here as needed.  For brevity only a
  // few of the major metropolitan codes are included; see the source for
  // the full list【425677470364029†L63-L80】.
};

/**
 * Master regular expression used to parse Argentine numbers.  It
 * recognises optional international prefixes (00, +54), national
 * prefix (0), mobile indicator (9 or 15) and differentiates
 * between area codes of 2–4 digits, subscriber numbers of 6–8
 * digits, special service codes and specific service prefixes
 * (e.g. 0800).  The pattern below is taken from telefono‑argentino
 * verbatim【425677470364029†L36-L61】.
 */
const PHONE_REGEX: RegExp = /^(?:(?:(00)?(?:(\+?54)|(0)?)?(?:(9)?(((3894|3892|3891|3888|3887|3886|3885|3878|3877|3876|3873|3869|3868|3867|3865|3863|3862|3861|3858|3857|3856|3855|3854|3846|3845|3844|3843|3841|3838|3837|3835|3832|3827|3826|3825|3821|3786|3782|3781|3777|3775|3774|3773|3772|3758|3757|3756|3755|3754|3751|3743|3741|3735|3734|3731|3725|3721|3718|3716|3715|3711|3585|3584|3583|3582|3576|3575|3574|3573|3572|3571|3564|3563|3562|3549|3548|3547|3546|3544|3543|3542|3541|3537|3533|3532|3525|3524|3522|3521|3498|3497|3496|3493|3492|3491|3489|3487|3483|3482|3476|3472|3471|3469|3468|3467|3466|3465|3464|3463|3462|3460|3458|3456|3455|3454|3447|3446|3445|3444|3442|3438|3437|3436|3435|3409|3408|3407|3406|3405|3404|3402|3401|3400|3388|3387|3385|3382|3329|3327|2983|2982|2972|2966|2964|2963|2962|2954|2953|2952|2948|2946|2945|2942|2940|2936|2935|2934|2933|2932|2931|2929|2928|2927|2926|2925|2924|2923|2922|2921|2920|2903|2902|2901|2658|2657|2656|2655|2652|2651|2648|2647|2646|2626|2625|2624|2622|2478|2477|2475|2474|2473|2396|2395|2394|2393|2392|2358|2357|2356|2355|2354|2353|2352|2346|2345|2344|2343|2342|2338|2337|2336|2335|2334|2333|2331|2326|2325|2324|2323|2320|2317|2316|2314|2302|2297|2296|2292|2291|2286|2285|2284|2283|2281|2274|2273|2272|2271|2268|2267|2266|2265|2264|2262|2261|2257|2255|2254|2252|2246|2245|2244|2243|2242|2241|2229|2227|2226|2225|2224|2223|2221|2202)(15)?([\d]{6})|(388|387|385|383|381|380|379|376|370|364|362|358|353|351|348|345|343|342|341|336|299|298|297|294|291|280|266|264|263|261|260|249|237|236|230|223|221|220)(15)?([\d]{7})|(11)(15)?([\d]{8})|(15)([\d]{6})|(15)([\d]{7})|(15)([\d]{8})|([\d]{6,8}))|(0800|0810|0822|0823|0610|0611|0612|0609|0600|0747|0939|0605|0603)([\d]{7,8}))?)|(19|100|101|102|103|105|106|107|108|110|112|113|114|115|121|125|126|130|131|132|133|134|135|136|137|138|139|144|145|147|911|000)))$/;

/**
 * Extracted components of a parsed phone number.
 */
export interface PhoneData {
  /** Raw input string, cleaned of whitespace and punctuation */
  input: string;
  /** Optional international prefix (00) */
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
  type: "landline" | "mobile" | "special" | "specific" | null;
}

/**
 * Remove spaces, parentheses, dashes and other common punctuation from the
 * input.  Only digits and a leading plus sign are retained.  The
 * original script uses a similar cleanup routine to prepare the number
 * before running the regular expression【425677470364029†L1354-L1370】.
 */
function cleanup(str: string): string {
  return str
    .toString()
    .replace(/[^\d+]+/g, "")
    .trim();
}

/**
 * Search through the list of ranges for the given area code and return the
 * matching block.  When ENACOM assigns ranges they are inclusive, so if
 * the leading digits of the subscriber number fall within any range the
 * number is potentially valid【187285230036508†L289-L292】.  If no range matches
 * then the number is considered invalid for that area code.
 */
function findBlockNumber(areaCode: string | undefined, subscriber: string): string | undefined {
  if (!areaCode) return undefined;
  const ranges = blockRanges[areaCode];
  if (!ranges) return undefined;
  for (const [min, max] of ranges) {
    // Compare a prefix of the subscriber with the numeric range.  The
    // prefix length must match the maximum length of the range to ensure
    // proper lexicographic comparison.  For example, for range [400,411]
    // we take the first three digits of the subscriber.
    const maxLen = String(max).length;
    const prefix = subscriber.slice(0, maxLen);
    const num = parseInt(prefix, 10);
    if (num >= min && num <= max) {
      return prefix;
    }
  }
  return undefined;
}

/**
 * Determine the type of the phone given the extracted data.  Landlines
 * and mobiles require that the area code plus the subscriber number
 * total ten digits【425677470364029†L1393-L1396】.  Special and specific
 * numbers are identified by their fixed prefixes.  If the data does not
 * fit any category it returns null.
 */
function determineType(data: Partial<PhoneData>): PhoneData["type"] {
  // Special 3‑digit numbers (e.g. 911, 100) never have subscriber digits
  if (data.special) return "special";
  // Specific service codes (e.g. 0800 or 0810) are fixed prefixes
  if (data.specific) return "specific";
  if (data.areaCode && data.subscriber) {
    const total = data.areaCode.length + data.subscriber.length;
    if (total === 10) {
      return data.mobile || data.mobilePrefix ? "mobile" : "landline";
    }
  } else if (!data.areaCode && data.subscriber) {
    // Local numbers without area code must be 6–8 digits
    const len = data.subscriber.length;
    if (len >= 6 && len <= 8) {
      return data.mobile || data.mobilePrefix ? "mobile" : "landline";
    }
  }
  return null;
}

/**
 * Parse a raw string into its constituent parts.  Returns undefined if
 * the input does not match the master regular expression.  When
 * successful the function also verifies the block ranges for numbers
 * with area codes and populates the type accordingly.
 */
export function parseArgentineNumber(raw: string): PhoneData | undefined {
  const cleaned = cleanup(raw);
  const match = cleaned.match(PHONE_REGEX);
  if (!match) return undefined;

  // Build an object similar to telefono‑argentino’s `data` structure.  Use
  // the same capture group indices defined in the original `_setData` to
  // extract the number, area code, mobile prefix and special/specific
  // fields【425677470364029†L1517-L1549】.
  const numberIndices = [9, 15, 12, 21, 17, 19, 22, 24];
  const mobilePrefixIndices = [8, 11, 14, 18, 20];
  const areaCodeIndices = [13, 10, 7];
  const specificIndex = 23;
  const specialIndex = 25;

  // Helper to return the first defined value from the match array
  function getValue(idxs: number[]): string | undefined {
    for (const i of idxs) {
      const v = match[i];
      if (v !== undefined) return v;
    }
    return undefined;
  }

  const number = getValue(numberIndices);
  const areaCode = getValue(areaCodeIndices);
  const mobilePrefix = getValue(mobilePrefixIndices);
  const specific = match[specificIndex] || undefined;
  const special = match[specialIndex] || undefined;

  // Normalise the country by stripping the leading '+' if present.  In the
  // original implementation country is stored without a plus and added
  // later during formatting【187285230036508†L351-L355】.
  const rawCountry = match[2] || undefined;
  const normalisedCountry = rawCountry ? rawCountry.replace(/^\+/, "") : undefined;

  const data: Partial<PhoneData> = {
    input: cleaned,
    international: match[1] || undefined,
    country: normalisedCountry,
    nationalCall: match[3] || undefined,
    mobile: match[4] || undefined,
    mobilePrefix: mobilePrefix,
    areaCode: areaCode,
    specific: specific,
    special: special,
    subscriber: number || "",
  };

  // If no area code was captured and the subscriber has length 8, assume
  // area code 11 as the script does【425677470364029†L1525-L1530】.
  let areaRef = areaCode;
  if (!areaRef && data.subscriber.length === 8) {
    areaRef = "11";
  }

  // Validate block number when an area code applies
  const block = findBlockNumber(areaRef, data.subscriber);
  data.blockNumber = block;
  if (block) {
    data.givenNumber = data.subscriber.substring(block.length);
  }

  // Determine type (landline/mobile/special/specific)
  data.type = determineType(data as PhoneData);

  // If a block range is required but not found, invalidate the number
  if (data.type && areaRef) {
    if (!block) return undefined;
  }

  return data as PhoneData;
}

/**
 * Validate whether a string is a correct Argentine phone number.  It
 * cleans the input, applies the master regex and verifies that the
 * block number exists for the area code when required.  Special and
 * specific codes bypass the block‑range check【187285230036508†L383-L387】.
 */
export function isValidArgentineNumber(raw: string): boolean {
  const parsed = parseArgentineNumber(raw);
  if (!parsed) return false;
  // A number is valid if it is special (e.g. 911) or specific (0800/0810),
  // or if it has a block number assigned.  This mirrors the logic from
  // telefono‑argentino’s `isValid` method【425677470364029†L1340-L1351】.
  if (parsed.specific || parsed.special) {
    return true;
  }
  return parsed.blockNumber !== undefined;
}

/**
 * Format a parsed number into a human readable string.  The default
 * behaviour is to produce the international format: `+54 9 11 5017‑6006`.
 * If you would like to format without a country code or in national
 * format you can override the options.
 */
export interface FormatOptions {
  /** Include the country prefix +54 */
  country?: boolean;
  /** Include a national prefix (0).  When false the leading 0 is omitted */
  nationalPrefix?: boolean;
  /** Use international mobile prefix (9) for mobiles instead of 15 */
  internationalMobile?: boolean;
}

export function formatArgentineNumber(parsed: PhoneData, opts: FormatOptions = {}): string {
  const { country = true, nationalPrefix = false, internationalMobile = true } = opts;
  // Special short codes – nothing more to format
  if (parsed.type === "special" && parsed.special) {
    return parsed.special;
  }
  // Specific service codes – include prefix and subscriber
  if (parsed.type === "specific" && parsed.specific) {
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

  // Country code
  if (country && parsed.country) {
    parts.push(`+${parsed.country}`);
  }

  // Mobile indicator: use international 9 if requested and the number is mobile
  if (parsed.type === "mobile") {
    if (internationalMobile && parsed.mobile) {
      parts.push(parsed.mobile);
    } else if (parsed.mobilePrefix) {
      // When formatting in national style we preserve the 15 prefix
      parts.push(parsed.mobilePrefix);
    }
  }

  // National call prefix (0) when requested and not using country code
  if (!country && nationalPrefix && parsed.nationalCall) {
    parts.push(parsed.nationalCall);
  }

  // Area code
  if (parsed.areaCode) {
    parts.push(parsed.areaCode);
  }

  // Subscriber number – split into groups for readability
  const number = parsed.subscriber;
  let formattedSubscriber = number;
  // Format 6‑digit numbers as 3‑3, 7‑digit as 3‑4, 8‑digit as 4‑4
  if (number.length === 6) {
    formattedSubscriber = `${number.slice(0, 3)}-${number.slice(3)}`;
  } else if (number.length === 7) {
    formattedSubscriber = `${number.slice(0, 3)}-${number.slice(3)}`;
  } else if (number.length === 8) {
    formattedSubscriber = `${number.slice(0, 4)}-${number.slice(4)}`;
  }
  parts.push(formattedSubscriber);

  return parts.join(" ");
}