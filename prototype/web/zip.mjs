const table = Array.from({length:256},(_,n) => { for(let bit=0;bit<8;bit++)n=n&1?0xedb88320^(n>>>1):n>>>1; return n>>>0; });
function crc32(bytes) { let crc=0xffffffff;for(const byte of bytes)crc=table[(crc^byte)&255]^(crc>>>8);return(crc^0xffffffff)>>>0; }
export async function makeZip(entries) {
  const encoder=new TextEncoder(),parts=[],central=[];let offset=0;
  for(const {path,blob} of entries){
    const name=encoder.encode(path),bytes=new Uint8Array(await blob.arrayBuffer()),crc=crc32(bytes);
    const local=new ArrayBuffer(30+name.length),v=new DataView(local);v.setUint32(0,0x04034b50,true);v.setUint16(4,20,true);v.setUint16(6,0x0800,true);v.setUint32(14,crc,true);v.setUint32(18,bytes.length,true);v.setUint32(22,bytes.length,true);v.setUint16(26,name.length,true);new Uint8Array(local).set(name,30);
    const c=new ArrayBuffer(46+name.length),d=new DataView(c);d.setUint32(0,0x02014b50,true);d.setUint16(4,20,true);d.setUint16(6,20,true);d.setUint16(8,0x0800,true);d.setUint32(16,crc,true);d.setUint32(20,bytes.length,true);d.setUint32(24,bytes.length,true);d.setUint16(28,name.length,true);d.setUint32(42,offset,true);new Uint8Array(c).set(name,46);
    parts.push(local,blob);central.push(c);offset+=local.byteLength+bytes.length;
  }
  const centralSize=central.reduce((n,c)=>n+c.byteLength,0),end=new ArrayBuffer(22),v=new DataView(end);v.setUint32(0,0x06054b50,true);v.setUint16(8,entries.length,true);v.setUint16(10,entries.length,true);v.setUint32(12,centralSize,true);v.setUint32(16,offset,true);
  return new Blob([...parts,...central,end],{type:'application/zip'});
}
