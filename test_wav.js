const fs = require('fs');
let pcmData = new Int16Array(16000); // 1 second of silence
const buffer = new ArrayBuffer(44 + pcmData.length * 2);
const view = new DataView(buffer);
const writeString = (v, offset, string) => {
    for (let i = 0; i < string.length; i++) {
        v.setUint8(offset + i, string.charCodeAt(i));
    }
};
writeString(view, 0, 'RIFF');
view.setUint32(4, 36 + pcmData.length * 2, true);
writeString(view, 8, 'WAVE');
writeString(view, 12, 'fmt ');
view.setUint32(16, 16, true);
view.setUint16(20, 1, true);
view.setUint16(22, 1, true);
view.setUint32(24, 16000, true);
view.setUint32(28, 16000 * 2, true);
view.setUint16(32, 2, true);
view.setUint16(34, 16, true);
writeString(view, 36, 'data');
view.setUint32(40, pcmData.length * 2, true);
let offset = 44;
for (let i = 0; i < pcmData.length; i++, offset += 2) {
    view.setInt16(offset, pcmData[i], true); 
}
let binary = '';
const bytes = new Uint8Array(buffer);
const chunkSize = 8192;
for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
}
const base64 = btoa(binary);
fs.writeFileSync('test_wav.txt', base64);
