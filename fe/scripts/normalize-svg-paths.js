/**
 * Normalize SVG path coordinates: viewBox (0 0 210 297) -> image (1674 x 792) -> normalized (min dimension = 1).
 * norm_x = svg_x * 1674/(210*792), norm_y = svg_y / 297
 */
const SVG_WIDTH = 210;
const SVG_HEIGHT = 297;
const IMG_WIDTH = 590.577;
const IMG_HEIGHT = 279.413;
const NORM = Math.min(IMG_WIDTH, IMG_HEIGHT); // 792
const SVG_NORM = Math.max(SVG_WIDTH, SVG_HEIGHT);

const scaleX = 1 / NORM;
const scaleY = 1 / NORM;

function normalizePathD(d) {
  const result = [];
  let i = 0;
  const len = d.length;
  const numRe = /[-+]?\d*\.?\d+(?:[eE][-+]?\d+)?/g;

  while (i < len) {
    const rest = d.slice(i);
    const cmdMatch = rest.match(/^\s*([mMlLhHvVcCsSqQtTaAzZ])\s*/);
    if (!cmdMatch) {
      i++;
      continue;
    }
    const cmd = cmdMatch[1];
    i += cmdMatch[0].length;
    const afterCmd = d.slice(i);
    const nums = [];
    let numMatch;
    const numRe2 = /[-+]?\d*\.?\d+(?:[eE][-+]?\d+)?/g;
    while ((numMatch = numRe2.exec(afterCmd)) !== null) {
      const nextChar = afterCmd[numMatch.index + numMatch[0].length];
      if (nextChar && /[,\s]/.test(nextChar) || nextChar === undefined) {
        nums.push(parseFloat(numMatch[0]));
      } else break;
    }
    const consumed = nums.length;
    let j = 0;
    result.push(cmd);

    if (cmd === 'Z' || cmd === 'z') {
      i = d.slice(i).search(/\S/) + i;
      if (d.slice(i)[0]?.match(/[mMlLhHvVcCsSqQtTaAaZz]/)) continue;
      break;
    }

    if (cmd === 'h' || cmd === 'H') {
      while (j < nums.length) {
        const x = nums[j++] * (cmd === 'h' ? scaleX : scaleX);
        result.push(Number(x.toFixed(6)));
      }
    } else if (cmd === 'v' || cmd === 'V') {
      while (j < nums.length) {
        const y = nums[j++] * scaleY;
        result.push(Number(y.toFixed(6)));
      }
    } else if (cmd === 'c' || cmd === 'C') {
      while (j + 5 < nums.length) {
        result.push(
          Number((nums[j++] * scaleX).toFixed(6)), Number((nums[j++] * scaleY).toFixed(6)),
          Number((nums[j++] * scaleX).toFixed(6)), Number((nums[j++] * scaleY).toFixed(6)),
          Number((nums[j++] * scaleX).toFixed(6)), Number((nums[j++] * scaleY).toFixed(6))
        );
      }
    } else {
      while (j + 1 < nums.length) {
        result.push(Number((nums[j++] * scaleX).toFixed(6)), Number((nums[j++] * scaleY).toFixed(6)));
      }
    }
    i += (afterCmd.match(/^[\s,]*([-\d.eE+]+[\s,]*)+/) || [''])[0].length;
  }

  return result.join(' ').replace(/\s+/g, ' ').trim();
}

// Simpler: just replace every number in order; path has only m,l,c,C (pairs or 6) and one v, one h in br.
// Count numbers per path and transform in order. Actually the safest is to split d by commands and process each.
function normalizePathDSimple(d) {
  const numbers = [];
  const re = /[-+]?\d*\.?\d+(?:[eE][-+]?\d+)?/g;
  let match;
  while ((match = re.exec(d)) !== null) numbers.push(parseFloat(match[0]));

  const out = [];
  let idx = 0;
  const parts = d.split(/([mMlLhHvVcCsSqQtTaAzZ])/).filter(Boolean);
  for (let p = 0; p < parts.length; p++) {
    const token = parts[p].trim();
    if (/^[mMlLhHvVcCsSqQtTaAzZ]$/.test(token)) {
      out.push(token);
      continue;
    }
    const nextToken = parts[p + 1]?.trim();
    const cmd = nextToken && /^[mMlLhHvVcCsSqQtTaAzZ]$/.test(nextToken) ? nextToken : (out[out.length - 1] || '');
    const nums = token.split(/[\s,]+/).filter(Boolean).map(Number).filter((n) => !isNaN(n));
    if (cmd === 'v' || cmd === 'V') {
      nums.forEach((n) => out.push((n * scaleY).toFixed(6)));
    } else if (cmd === 'h' || cmd === 'H') {
      nums.forEach((n) => out.push((n * scaleX).toFixed(6)));
    } else if (cmd === 'c' || cmd === 'C') {
      for (let k = 0; k < nums.length; k += 6) {
        if (k + 5 < nums.length) {
          out.push(
            (nums[k] * scaleX).toFixed(6), (nums[k + 1] * scaleY).toFixed(6),
            (nums[k + 2] * scaleX).toFixed(6), (nums[k + 3] * scaleY).toFixed(6),
            (nums[k + 4] * scaleX).toFixed(6), (nums[k + 5] * scaleY).toFixed(6)
          );
        }
      }
    } else {
      for (let k = 0; k < nums.length; k += 2) {
        if (k + 1 < nums.length) out.push((nums[k] * scaleX).toFixed(6), (nums[k + 1] * scaleY).toFixed(6));
      }
    }
  }
  return out.join(' ');
}

// Even simpler: the d string has a sequence of numbers. We need to replace them according to command. 
// Parse by iterating: read command letter, then read numbers for that command.
function normalizePath(d) {
  const out = [];
  const regex = /([mMlLhHvVcCsSqQtTaAzZ])|([-+]?\d*\.?\d+(?:[eE][-+]?\d+)?)/g;
  let cmd = '';
  let tokens = [];
  let m;
  while ((m = regex.exec(d)) !== null) {
    if (m[1]) {
      if (tokens.length) {
        applyCmd(cmd, tokens, out);
        tokens = [];
      }
      cmd = m[1];
      out.push(cmd);
      if (cmd === 'Z' || cmd === 'z') cmd = '';
    } else if (m[2]) {
      tokens.push(parseFloat(m[2]));
    }
  }
  if (tokens.length) applyCmd(cmd, tokens, out);
  return out.join(' ').replace(/\s+/g, ' ').trim();
}

function applyCmd(cmd, tokens, out) {
  if (cmd === 'h' || cmd === 'H') {
    tokens.forEach((n) => out.push((n * scaleX).toFixed(6)));
  } else if (cmd === 'v' || cmd === 'V') {
    tokens.forEach((n) => out.push((n * scaleY).toFixed(6)));
  } else if (cmd === 'c' || cmd === 'C') {
    for (let i = 0; i < tokens.length; i += 6) {
      if (i + 5 < tokens.length) {
        out.push(
          (tokens[i] * scaleX).toFixed(6), (tokens[i + 1] * scaleY).toFixed(6),
          (tokens[i + 2] * scaleX).toFixed(6), (tokens[i + 3] * scaleY).toFixed(6),
          (tokens[i + 4] * scaleX).toFixed(6), (tokens[i + 5] * scaleY).toFixed(6)
        );
      }
    }
  } else {
    for (let i = 0; i < tokens.length; i += 2) {
      if (i + 1 < tokens.length) out.push((tokens[i] * scaleX).toFixed(6), (tokens[i + 1] * scaleY).toFixed(6));
    }
  }
}

const paths = {
  fl: 'm 34.246626,7.5166196 227.490414,2.5861684 -0.0935,-5.4255714 12.72203,2e-7 -0.28064,76.7998972 -21.60874,2e-6 0.0935,30.963174 -31.05671,0.18709 0.37418,29.18583 -216.7422217,0.74836 c 0,0 0.1683694,-38.53723 0.093544,-60.616734 C 5.0870169,37.250116 34.246626,7.5166196 34.246626,7.5166196 Z',
  fr: 'm 33.829976,272.61089 240.161364,-0.49041 -0.0468,-76.56606 -17.86696,0.28064 c -4.30144,0.0676 -5.36019,-2.1899 -5.37881,-4.25627 -0.0468,-5.19171 0,-24.88279 0,-24.88279 l -28.62456,-0.37417 -0.0548,-29.61481 -217.022853,-0.0775 -0.1105677,135.1234 28.9497867,-0.27495 z',
  bl: 'm 586.35525,3.3983183 -243.23464,0.6240881 -0.0935,77.4547076 19.55076,0.09354 v 30.495456 l 32.74052,-0.18709 0.0935,30.21482 191.01752,-0.0935 z',
  br: 'm 586.12705,273.67764 -90.2953,0.50079 -0.0468,-2.47893 -152.53208,0.0855 -0.0661,-76.58539 c 0,0 16.54129,-0.0227 18.59927,-0.0227 2.05799,0 3.22395,-0.62741 3.22395,-3.3449 0,-3.18051 0.37417,-25.79084 0.37417,-25.79084 l 29.9342,0.0935 v -29.56001 h 191.20461 z',
  b: 'm 342.92412,82.262603 -0.0454,-78.101257 243.58944,-0.5064692 -0.0388,270.5235732 -89.98963,0.28063 -0.0468,-2.89987 -153.1321,0.1403 -0.14031,-75.63059 19.22336,-0.0468 c 1.87088,-0.005 2.47892,-1.07576 2.47892,-2.94665 0,-3.36759 -0.71527,-65.6237 -0.71527,-65.6237 l -1.08947,-0.0104 -0.0973,-45.198938 z'
};

const normalized = {};
for (const [key, pathD] of Object.entries(paths)) {
  normalized[key] = normalizePath(pathD);
}
console.log(JSON.stringify(normalized, null, 2));
