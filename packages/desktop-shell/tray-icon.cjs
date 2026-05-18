'use strict';

/**
 * Generate a tiny PNG buffer at boot — no binary asset in repo, no
 * external deps. Used for Tray icon + BrowserWindow icon.
 *
 * Strategy: pure 16x16 RGBA PNG of a rounded square in mentor teal.
 * Hand-rolled with zlib.deflateSync + zlib.crc32 (Node 22+).
 */

const zlib = require('zlib');

function makeChunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const body = Buffer.concat([typeBuf, data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(zlib.crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}

/**
 * 16x16 PNG, solid mentor-teal rounded square on transparent background.
 * Corners are clipped to fake a 2px radius.
 */
function buildTrayPng() {
  const W = 16, H = 16;
  const r = 0x6f, g = 0xb5, b = 0xb0;
  const raw = Buffer.alloc(H * (1 + W * 4));
  // 2-pixel radius corner mask
  const inset = 1;
  for (let y = 0; y < H; y++) {
    raw[y * (1 + W * 4)] = 0; // filter byte
    for (let x = 0; x < W; x++) {
      const off = y * (1 + W * 4) + 1 + x * 4;
      // distance from each corner
      const dx = Math.min(x - inset, W - 1 - inset - x);
      const dy = Math.min(y - inset, H - 1 - inset - y);
      let alpha = 0xff;
      if (dx < 0 || dy < 0) {
        // outside the inset → transparent
        alpha = 0;
      } else if (dx < 1 && dy < 1) {
        // corner — soften
        alpha = 0xcc;
      }
      raw[off]     = r;
      raw[off + 1] = g;
      raw[off + 2] = b;
      raw[off + 3] = alpha;
    }
  }
  const idat = zlib.deflateSync(raw);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W, 0);
  ihdr.writeUInt32BE(H, 4);
  ihdr[8]  = 8;  // bit depth
  ihdr[9]  = 6;  // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]),
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', idat),
    makeChunk('IEND', Buffer.alloc(0)),
  ]);
}

module.exports = { buildTrayPng };
