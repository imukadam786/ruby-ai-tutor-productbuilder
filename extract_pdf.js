const fs = require('fs');
const zlib = require('zlib');

const buf = fs.readFileSync('C:/Users/rrazz/Downloads/Updated Ruby_Platform_Specification_v2 (1).pdf', 'binary');

function decodeASCII85(str) {
  str = str.replace(/\s/g, '').replace(/~>$/, '');
  const out = [];
  for (let i = 0; i < str.length; ) {
    if (str[i] === 'z') { out.push(0,0,0,0); i++; continue; }
    const chunk = str.slice(i, i+5).padEnd(5, 'u');
    let v = 0;
    for (let j = 0; j < 5; j++) v = v * 85 + (chunk.charCodeAt(j) - 33);
    const n = Math.min(5, str.length - i) - 1;
    for (let j = 3; j >= 3 - n + 1; j--) out.push((v >> (j*8)) & 0xff);
    i += 5;
  }
  return Buffer.from(out);
}

const streamRegex = /\/Filter \[ \/ASCII85Decode \/FlateDecode \][^\n]*\n[^\n]*\nstream\n([\s\S]*?)endstream/g;
let match;
let pageNum = 0;
let allText = '';

while ((match = streamRegex.exec(buf)) !== null) {
  try {
    const decoded = decodeASCII85(match[1]);
    const inflated = zlib.inflateSync(decoded);
    const text = inflated.toString('latin1');

    // Extract Tj (single string) operators
    const tjRe = /\(([^)]*)\)\s*Tj/g;
    // Extract TJ (array) operators
    const tjArrRe = /\[([^\]]*)\]\s*TJ/g;

    let pageText = '';
    let m2;

    while ((m2 = tjRe.exec(text)) !== null) {
      pageText += m2[1].replace(/\\n/g, '\n').replace(/\\r/g, '').replace(/\\/g, '') + ' ';
    }
    while ((m2 = tjArrRe.exec(text)) !== null) {
      const arr = m2[1];
      const strRe = /\(([^)]*)\)/g;
      let m3;
      while ((m3 = strRe.exec(arr)) !== null) {
        pageText += m3[1].replace(/\\/g, '');
      }
    }

    if (pageText.trim()) {
      allText += '=== PAGE ' + (++pageNum) + ' ===\n' + pageText.trim() + '\n\n';
    }
  } catch(e) {
    // skip unreadable streams
  }
}

console.log(allText);
