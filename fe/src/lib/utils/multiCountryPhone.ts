/*
  Multi‑Country Phone Number Validation and Formatting

  This module defines a simple architecture for parsing, validating and formatting
  phone numbers from multiple countries.  It is intentionally data‑driven:
  each country’s numbering rules live in a configuration object (`countryPlans`)
  so that validators can be updated without modifying the core logic.  The
  primary entry points (`validatePhoneNumber` and `formatPhoneNumber`) take the
  country as a separate argument from the phone number.  Callers can therefore
  explicitly specify the desired country regardless of how the phone number is
  formatted.  Formatting exposes an option to include or omit the international
  prefix.

  NOTE: The patterns below are simplified representations of national
  numbering plans.  They illustrate how a data‑driven validator might be
  implemented but may not capture every nuance (e.g. full lists of area
  codes, block ranges, or historical exceptions).  Adjust or extend the
  `countryPlans` definitions to suit real‑world requirements.
*/

export interface CountryPlan {
  /** The human readable name of the country (e.g. "Argentina"). */
  name: string;
  /** The numeric country code used in international dialling (without '+'). */
  countryCode: string;
  /** Array of allowed national significant number lengths (NSN lengths). */
  nsnLengths: number[];
  /**
   * Regular expressions describing valid prefixes for mobile numbers.  At
   * least one pattern must match for a number to be considered mobile.  If
   * empty, the country does not distinguish mobile by prefix.
   */
  mobilePrefixes?: RegExp[];
  /**
   * Regular expressions describing valid prefixes for fixed/landline numbers.
   * These patterns help discriminate landlines from mobiles but are not
   * strictly required for validation (numbers may be considered valid even if
   * they match neither set).
   */
  fixedLinePrefixes?: RegExp[];
  /**
   * Regular expressions describing known special, toll‑free, or emergency
   * service prefixes.  Matching one of these patterns marks the number as
   * special.  These numbers often have lengths outside the normal NSN range.
   */
  specialPrefixes?: RegExp[];
  /**
   * The domestic trunk prefix used to dial long distance within the country
   * (e.g. '0' in many countries).  This is removed when parsing national
   * numbers and may be added back when formatting national output.
   */
  trunkPrefix?: string;
  /**
   * A grouping schema describing how to split the national number when
   * formatting.  Each entry represents the length of the next group of
   * digits.  For example, `[2,4,4]` means the number should be displayed as
   * `XX XXXX XXXX`.  If no schema is provided, a simple grouping of 3‑3‑4
   * digits is used for numbers ≥10 digits, or 3‑4 otherwise.
   */
  grouping?: number[];
}

/**
 * Internal registry of numbering plans.  These definitions are intentionally
 * lightweight—real implementations should expand the prefix patterns and
 * grouping according to official documents.  See report for citation of
 * numbering rules.
 */
const countryPlans: Record<string, CountryPlan> = {
  argentina: {
    name: 'Argentina',
    countryCode: '54',
    // Total NSN is always 10 digits (area code + subscriber)【185636828100435†L143-L149】.
    nsnLengths: [10],
    // Mobile numbers use the same area codes but the domestic prefix 15 is
    // inserted before the subscriber; internationally a 9 is inserted before
    // the area code【185636828100435†L216-L229】【185636828100435†L283-L288】.  We
    // consider numbers starting with 9 (after removing country code) as
    // mobiles when the length is 10.
    mobilePrefixes: [/^9/],
    // Landline numbers can start with a two‑ to four‑digit area code but there
    // is no universal prefix; we do not enforce fixedLinePrefixes here.
    fixedLinePrefixes: [],
    // Toll‑free and other non‑geographic prefixes【185636828100435†L344-L353】.
    specialPrefixes: [/^0800/, /^0810/, /^0600/, /^0609/, /^0610/, /^911/],
    trunkPrefix: '0',
    grouping: [2, 4, 4],
  },
  bolivia: {
    name: 'Bolivia',
    countryCode: '591',
    // NSN length is eight digits【624113304393908†L120-L124】.
    nsnLengths: [8],
    // Mobile prefixes 6 or 7【624113304393908†L129-L153】.
    mobilePrefixes: [/^6/, /^7/],
    // Landlines start with 2–7 (except 6/7 used for mobiles).  We list 2–5.
    fixedLinePrefixes: [/^[2-5]/],
    specialPrefixes: [/^1\d{2}/],
    trunkPrefix: '',
    grouping: [3, 3, 2],
  },
  brasil: {
    name: 'Brasil',
    countryCode: '55',
    // Landlines have 10 digits, mobiles have 11 digits【529456426295658†L149-L167】.
    nsnLengths: [10, 11],
    // Mobile numbers are 11 digits and start with 9【529456426295658†L149-L167】.
    mobilePrefixes: [/^9/],
    // Landlines start with 2–5 after the area code (2‑digit area codes).  We
    // loosely match 2‑digit area codes followed by [2-8].
    fixedLinePrefixes: [/^[2-9]\d[2-8]/],
    specialPrefixes: [/^1\d{2}/],
    trunkPrefix: '0',
    grouping: [2, 5, 4],
  },
  chile: {
    name: 'Chile',
    countryCode: '56',
    // All numbers are 9 digits with no area code【322193636461553†L136-L138】.
    nsnLengths: [9],
    // There is no distinction between mobile/fixed; we leave prefixes empty.
    mobilePrefixes: [],
    fixedLinePrefixes: [],
    specialPrefixes: [/^1\d{2}/],
    trunkPrefix: '',
    grouping: [3, 3, 3],
  },
  colombia: {
    name: 'Colombia',
    countryCode: '57',
    // NSN is 10 digits for both fixed and mobile【2792527637557†L143-L158】.
    nsnLengths: [10],
    // Mobile numbers start with 3【2792527637557†L210-L214】.
    mobilePrefixes: [/^3/],
    // Landlines start with 60 (zone B)【2792527637557†L175-L182】.
    fixedLinePrefixes: [/^60/],
    // Toll‑free 01800 numbers【2792527637557†L284-L295】.
    specialPrefixes: [/^1800/],
    trunkPrefix: '',
    grouping: [3, 3, 4],
  },
  ecuador: {
    name: 'Ecuador',
    countryCode: '593',
    // Landlines are 8 digits (1‑digit area + 7‑digit subscriber); mobiles are 9
    // digits starting with 9X【673701712194252†L181-L194】.
    nsnLengths: [8, 9],
    mobilePrefixes: [/^9[2-9]/],
    // Landline area codes are 1‑digit 2–7; we match 2‑7.
    fixedLinePrefixes: [/^[2-7]/],
    specialPrefixes: [/^800/, /^900/, /^700/, /^1\d{2}/],
    trunkPrefix: '0',
    grouping: [2, 4, 3],
  },
  paraguay: {
    name: 'Paraguay',
    countryCode: '595',
    // National numbers are 9 digits【853192362873591†L124-L139】.
    nsnLengths: [9],
    // Mobile numbers start with 9 and second digit is 2–9【853192362873591†L311-L323】.
    mobilePrefixes: [/^9[2-9]/],
    // Landlines start with 2–8 (except mobiles).  We match 2–8.
    fixedLinePrefixes: [/^[2-8]/],
    specialPrefixes: [/^1\d{2}/],
    trunkPrefix: '0',
    grouping: [3, 3, 3],
  },
  peru: {
    name: 'Perú',
    countryCode: '51',
    // Mobiles are 9 digits; landlines are 7 or 8 digits depending on area
    // (Lima uses 7‑digit subscriber; outside use 6).  We allow 6–9 digits
    // nationally【317441887349355†L157-L158】【317441887349355†L146-L151】.
    nsnLengths: [6, 7, 8, 9],
    // Mobile numbers start with 9【317441887349355†L146-L151】.
    mobilePrefixes: [/^9/],
    // Landline area codes vary; we approximate with two digits not starting
    // with 9 or 0 (e.g. 1 for Lima).  This pattern matches two digits 1–8.
    fixedLinePrefixes: [/^[1-8]\d/],
    specialPrefixes: [/^1\d{2}/],
    trunkPrefix: '0',
    grouping: [3, 3, 3],
  },
  uruguay: {
    name: 'Uruguay',
    countryCode: '598',
    // All numbers are 8 digits【412652503981061†L133-L150】.
    nsnLengths: [8],
    // Mobile numbers historically begin with 09; after dropping trunk prefix
    // they start with 9【412652503981061†L279-L285】.
    mobilePrefixes: [/^9/],
    // Fixed lines start with 2 (Montevideo) or 4 (rest)【412652503981061†L161-L178】.
    fixedLinePrefixes: [/^[24]/],
    specialPrefixes: [/^1\d{2}/],
    trunkPrefix: '',
    grouping: [4, 4],
  },
  venezuela: {
    name: 'Venezuela',
    countryCode: '58',
    // Area codes are 3 digits and subscriber numbers are 7 digits【22126412675660†L124-L127】.
    nsnLengths: [10],
    // Mobile area codes include 412, 414, 424, 415, 416, 426, etc.【22126412675660†L170-L179】.
    mobilePrefixes: [/^(412|414|415|416|424|426)/],
    // Fixed line area codes vary but start with 2 for Caracas (212) and other
    // digits; we match 2 or 3 as first digit but not 4 which is mobile.
    fixedLinePrefixes: [/^[235]/],
    specialPrefixes: [/^800/, /^900/, /^1\d{2}/],
    trunkPrefix: '0',
    grouping: [3, 4, 3],
  },
  mexico: {
    name: 'México',
    countryCode: '52',
    // Since 2019 all numbers are 10 digits【661495600076735†L145-L163】.
    nsnLengths: [10],
    // There is no dedicated mobile prefix after 2019; we leave empty.
    mobilePrefixes: [],
    fixedLinePrefixes: [],
    specialPrefixes: [/^800/, /^900/, /^1\d{2}/],
    trunkPrefix: '',
    grouping: [3, 3, 4],
  },
  espana: {
    name: 'España',
    countryCode: '34',
    // Closed plan with 9‑digit numbers【781411421512909†L181-L187】.
    nsnLengths: [9],
    // Mobile numbers start with 6 or 7 with second digit 1–9【781411421512909†L189-L223】.
    mobilePrefixes: [/^(6\d|7[1-9])/],
    // Landlines start with 9【781411421512909†L181-L187】.
    fixedLinePrefixes: [/^9/],
    specialPrefixes: [/^800/, /^900/, /^1\d{2}/, /^5\d{2}/, /^80\d/, /^90\d/],
    trunkPrefix: '',
    grouping: [3, 3, 3],
  },
  usa: {
    name: 'Estados Unidos',
    countryCode: '1',
    // NANP numbers have 10 digits【592791073543680†L538-L553】.
    nsnLengths: [10],
    // Mobile numbers share the same area codes as landlines; there is no
    // dedicated prefix【592791073543680†L621-L631】.  We leave both arrays
    // undefined.
    mobilePrefixes: [],
    fixedLinePrefixes: [],
    specialPrefixes: [/^800/, /^888/, /^877/, /^866/, /^855/, /^844/, /^833/, /^822/, /^900/, /^1\d{2}/],
    trunkPrefix: '1',
    grouping: [3, 3, 4],
  },
};

/**
 * Sanitises a phone number by removing all non‑digit characters except a
 * leading plus.  This helper is used internally during parsing.
 */
function sanitize(input: string): string {
  input = input.trim();
  // Preserve a leading '+' if present.
  const hasPlus = input.startsWith('+');
  const digits = input.replace(/\D+/g, '');
  return (hasPlus ? '+' : '') + digits;
}

/**
 * Looks up a country plan by name or country code.  The lookup is case
 * insensitive and will match keys based on the country’s English name,
 * Spanish name (if provided) or numeric country code.  Returns undefined
 * if no plan exists.
 */
function getCountryPlan(key: string): CountryPlan | undefined {
  const normalised = key.replace(/^\+/, '').toLowerCase();
  // Try direct key match.
  if (countryPlans[normalised]) return countryPlans[normalised];
  // Search by country code.
  for (const plan of Object.values(countryPlans)) {
    if (plan.countryCode === normalised) return plan;
    if (plan.name.toLowerCase() === normalised) return plan;
  }
  return undefined;
}

/**
 * Parses a raw phone string into its components.  If a country name or code
 * is provided, it takes precedence when determining the numbering plan.
 * Otherwise, the function attempts to infer the country from a leading
 * international prefix (e.g. "+54").
 */
function parsePhoneNumber(raw: string, country?: string) {
  const cleaned = sanitize(raw);
  let plan: CountryPlan | undefined;
  let nationalNumber: string;

  if (country) {
    plan = getCountryPlan(country);
    if (!plan) throw new Error(`Unknown country: ${country}`);
    // Remove any international prefix (00 or +countryCode) and trunk prefix.
    nationalNumber = cleaned.replace(/^\+?/, '');
    if (nationalNumber.startsWith(plan.countryCode)) {
      nationalNumber = nationalNumber.slice(plan.countryCode.length);
    }
  } else if (cleaned.startsWith('+')) {
    // Infer from +countryCode.
    const digits = cleaned.slice(1);
    // Try to match the longest possible country code.
    plan = Object.values(countryPlans).find((p) => digits.startsWith(p.countryCode));
    if (!plan) throw new Error(`Unable to infer country from ${raw}`);
    nationalNumber = digits.slice(plan.countryCode.length);
  } else {
    throw new Error('Country must be specified when no international prefix is present');
  }
  // Remove leading trunk prefix if present.
  if (plan.trunkPrefix && nationalNumber.startsWith(plan.trunkPrefix)) {
    nationalNumber = nationalNumber.slice(plan.trunkPrefix.length);
  }
  return { plan, nationalNumber };
}

/**
 * Validates a phone number according to the rules defined in the country plan.
 * The country can be specified by name or country code.  If the number
 * contains a leading '+' and the country is omitted, validation is attempted
 * based on the detected country code.  Returns true if the number’s length
 * matches one of the allowed NSN lengths and its prefix matches either a
 * mobile, fixed or special prefix (if defined).
 */
export function validatePhoneNumber(phone: string, country?: string): boolean {
  try {
    const { plan, nationalNumber } = parsePhoneNumber(phone, country);
    // Check length.
    if (!plan.nsnLengths.includes(nationalNumber.length)) {
      // Allow special numbers outside the normal NSN range.
      if (!plan.specialPrefixes?.some((rx) => rx.test(nationalNumber))) {
        return false;
      }
    }
    // Check prefixes: if any mobile or fixedLine pattern is defined, the
    // national number must match at least one of the categories.  Special
    // prefixes are accepted regardless of length.
    const isSpecial = plan.specialPrefixes?.some((rx) => rx.test(nationalNumber)) ?? false;
    if (isSpecial) return true;
    const matchesMobile = plan.mobilePrefixes?.some((rx) => rx.test(nationalNumber)) ?? false;
    const matchesFixed = plan.fixedLinePrefixes?.some((rx) => rx.test(nationalNumber)) ?? false;
    // If both arrays are empty, we accept any prefix.
    if (!plan.mobilePrefixes?.length && !plan.fixedLinePrefixes?.length) {
      return true;
    }
    return matchesMobile || matchesFixed;
  } catch {
    return false;
  }
}

/**
 * Formats a phone number according to the country plan.  The caller may
 * specify whether to include the international country code in the result.
 * If the number cannot be parsed for the specified country, it will throw.
 */
export function formatPhoneNumber(
  phone: string,
  country: string,
  options: { includeCountryCode?: boolean } = {}
): string {
  const includeCC = options.includeCountryCode ?? true;
  const { plan, nationalNumber } = parsePhoneNumber(phone, country);
  // Determine grouping: use plan.grouping or fallback.
  const grouping = plan.grouping && plan.grouping.length > 0 ? plan.grouping :
    (nationalNumber.length === 10 ? [3, 3, 4] : nationalNumber.length === 8 ? [4, 4] : [3, 4]);
  const groups: string[] = [];
  let idx = 0;
  for (const size of grouping) {
    if (idx >= nationalNumber.length) break;
    const end = Math.min(idx + size, nationalNumber.length);
    groups.push(nationalNumber.slice(idx, end));
    idx = end;
  }
  // Append any remaining digits as the last group.
  if (idx < nationalNumber.length) {
    groups.push(nationalNumber.slice(idx));
  }
  const nationalFormatted = groups.join(' ');
  return includeCC ? `+${plan.countryCode} ${nationalFormatted}` : nationalFormatted;
}

/**
 * Expose the registry for advanced use.  Applications can import this
 * constant to inspect or extend the supported countries.
 */
export const numberingPlans = countryPlans;