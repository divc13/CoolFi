'use strict';

require('dotenv/config');
var nearApiJs = require('near-api-js');
require('@scure/base');
var Borsh = require('@dao-xyz/borsh');
var crypto2 = require('crypto');
var axios = require('axios');
var BigNumber = require('bignumber.js');
var NodeCache = require('node-cache');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

function _interopNamespace(e) {
  if (e && e.__esModule) return e;
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  }
  n.default = e;
  return Object.freeze(n);
}

var Borsh__namespace = /*#__PURE__*/_interopNamespace(Borsh);
var crypto2__default = /*#__PURE__*/_interopDefault(crypto2);
var axios__default = /*#__PURE__*/_interopDefault(axios);
var BigNumber__default = /*#__PURE__*/_interopDefault(BigNumber);
var NodeCache__default = /*#__PURE__*/_interopDefault(NodeCache);

var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __decorateClass = (decorators, target, key, kind) => {
  var result = undefined ;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (decorator(target, key, result) ) || result;
  if (result) __defProp(target, key, result);
  return result;
};

// node_modules/tsup/assets/cjs_shims.js
var init_cjs_shims = __esm({
  "node_modules/tsup/assets/cjs_shims.js"() {
  }
});

// node_modules/js-sha256/src/sha256.js
var require_sha256 = __commonJS({
  "node_modules/js-sha256/src/sha256.js"(exports, module) {
    init_cjs_shims();
    (function() {
      var ERROR = "input is invalid type";
      var WINDOW = typeof window === "object";
      var root = WINDOW ? window : {};
      if (root.JS_SHA256_NO_WINDOW) {
        WINDOW = false;
      }
      var WEB_WORKER = !WINDOW && typeof self === "object";
      var NODE_JS = !root.JS_SHA256_NO_NODE_JS && typeof process === "object" && process.versions && process.versions.node;
      if (NODE_JS) {
        root = global;
      } else if (WEB_WORKER) {
        root = self;
      }
      var COMMON_JS = !root.JS_SHA256_NO_COMMON_JS && typeof module === "object" && module.exports;
      var AMD = typeof define === "function" && define.amd;
      var ARRAY_BUFFER = !root.JS_SHA256_NO_ARRAY_BUFFER && typeof ArrayBuffer !== "undefined";
      var HEX_CHARS = "0123456789abcdef".split("");
      var EXTRA = [-2147483648, 8388608, 32768, 128];
      var SHIFT = [24, 16, 8, 0];
      var K = [
        1116352408,
        1899447441,
        3049323471,
        3921009573,
        961987163,
        1508970993,
        2453635748,
        2870763221,
        3624381080,
        310598401,
        607225278,
        1426881987,
        1925078388,
        2162078206,
        2614888103,
        3248222580,
        3835390401,
        4022224774,
        264347078,
        604807628,
        770255983,
        1249150122,
        1555081692,
        1996064986,
        2554220882,
        2821834349,
        2952996808,
        3210313671,
        3336571891,
        3584528711,
        113926993,
        338241895,
        666307205,
        773529912,
        1294757372,
        1396182291,
        1695183700,
        1986661051,
        2177026350,
        2456956037,
        2730485921,
        2820302411,
        3259730800,
        3345764771,
        3516065817,
        3600352804,
        4094571909,
        275423344,
        430227734,
        506948616,
        659060556,
        883997877,
        958139571,
        1322822218,
        1537002063,
        1747873779,
        1955562222,
        2024104815,
        2227730452,
        2361852424,
        2428436474,
        2756734187,
        3204031479,
        3329325298
      ];
      var OUTPUT_TYPES = ["hex", "array", "digest", "arrayBuffer"];
      var blocks = [];
      if (root.JS_SHA256_NO_NODE_JS || !Array.isArray) {
        Array.isArray = function(obj) {
          return Object.prototype.toString.call(obj) === "[object Array]";
        };
      }
      if (ARRAY_BUFFER && (root.JS_SHA256_NO_ARRAY_BUFFER_IS_VIEW || !ArrayBuffer.isView)) {
        ArrayBuffer.isView = function(obj) {
          return typeof obj === "object" && obj.buffer && obj.buffer.constructor === ArrayBuffer;
        };
      }
      var createOutputMethod = function(outputType, is2242) {
        return function(message) {
          return new Sha256(is2242, true).update(message)[outputType]();
        };
      };
      var createMethod = function(is2242) {
        var method2 = createOutputMethod("hex", is2242);
        if (NODE_JS) {
          method2 = nodeWrap(method2, is2242);
        }
        method2.create = function() {
          return new Sha256(is2242);
        };
        method2.update = function(message) {
          return method2.create().update(message);
        };
        for (var i = 0; i < OUTPUT_TYPES.length; ++i) {
          var type = OUTPUT_TYPES[i];
          method2[type] = createOutputMethod(type, is2242);
        }
        return method2;
      };
      var nodeWrap = function(method, is224) {
        var crypto = eval("require('crypto')");
        var Buffer = eval("require('buffer').Buffer");
        var algorithm = is224 ? "sha224" : "sha256";
        var nodeMethod = function(message) {
          if (typeof message === "string") {
            return crypto.createHash(algorithm).update(message, "utf8").digest("hex");
          } else {
            if (message === null || message === undefined) {
              throw new Error(ERROR);
            } else if (message.constructor === ArrayBuffer) {
              message = new Uint8Array(message);
            }
          }
          if (Array.isArray(message) || ArrayBuffer.isView(message) || message.constructor === Buffer) {
            return crypto.createHash(algorithm).update(new Buffer(message)).digest("hex");
          } else {
            return method(message);
          }
        };
        return nodeMethod;
      };
      var createHmacOutputMethod = function(outputType, is2242) {
        return function(key, message) {
          return new HmacSha256(key, is2242, true).update(message)[outputType]();
        };
      };
      var createHmacMethod = function(is2242) {
        var method2 = createHmacOutputMethod("hex", is2242);
        method2.create = function(key) {
          return new HmacSha256(key, is2242);
        };
        method2.update = function(key, message) {
          return method2.create(key).update(message);
        };
        for (var i = 0; i < OUTPUT_TYPES.length; ++i) {
          var type = OUTPUT_TYPES[i];
          method2[type] = createHmacOutputMethod(type, is2242);
        }
        return method2;
      };
      function Sha256(is2242, sharedMemory) {
        if (sharedMemory) {
          blocks[0] = blocks[16] = blocks[1] = blocks[2] = blocks[3] = blocks[4] = blocks[5] = blocks[6] = blocks[7] = blocks[8] = blocks[9] = blocks[10] = blocks[11] = blocks[12] = blocks[13] = blocks[14] = blocks[15] = 0;
          this.blocks = blocks;
        } else {
          this.blocks = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        }
        if (is2242) {
          this.h0 = 3238371032;
          this.h1 = 914150663;
          this.h2 = 812702999;
          this.h3 = 4144912697;
          this.h4 = 4290775857;
          this.h5 = 1750603025;
          this.h6 = 1694076839;
          this.h7 = 3204075428;
        } else {
          this.h0 = 1779033703;
          this.h1 = 3144134277;
          this.h2 = 1013904242;
          this.h3 = 2773480762;
          this.h4 = 1359893119;
          this.h5 = 2600822924;
          this.h6 = 528734635;
          this.h7 = 1541459225;
        }
        this.block = this.start = this.bytes = this.hBytes = 0;
        this.finalized = this.hashed = false;
        this.first = true;
        this.is224 = is2242;
      }
      Sha256.prototype.update = function(message) {
        if (this.finalized) {
          return;
        }
        var notString, type = typeof message;
        if (type !== "string") {
          if (type === "object") {
            if (message === null) {
              throw new Error(ERROR);
            } else if (ARRAY_BUFFER && message.constructor === ArrayBuffer) {
              message = new Uint8Array(message);
            } else if (!Array.isArray(message)) {
              if (!ARRAY_BUFFER || !ArrayBuffer.isView(message)) {
                throw new Error(ERROR);
              }
            }
          } else {
            throw new Error(ERROR);
          }
          notString = true;
        }
        var code, index = 0, i, length = message.length, blocks2 = this.blocks;
        while (index < length) {
          if (this.hashed) {
            this.hashed = false;
            blocks2[0] = this.block;
            blocks2[16] = blocks2[1] = blocks2[2] = blocks2[3] = blocks2[4] = blocks2[5] = blocks2[6] = blocks2[7] = blocks2[8] = blocks2[9] = blocks2[10] = blocks2[11] = blocks2[12] = blocks2[13] = blocks2[14] = blocks2[15] = 0;
          }
          if (notString) {
            for (i = this.start; index < length && i < 64; ++index) {
              blocks2[i >> 2] |= message[index] << SHIFT[i++ & 3];
            }
          } else {
            for (i = this.start; index < length && i < 64; ++index) {
              code = message.charCodeAt(index);
              if (code < 128) {
                blocks2[i >> 2] |= code << SHIFT[i++ & 3];
              } else if (code < 2048) {
                blocks2[i >> 2] |= (192 | code >> 6) << SHIFT[i++ & 3];
                blocks2[i >> 2] |= (128 | code & 63) << SHIFT[i++ & 3];
              } else if (code < 55296 || code >= 57344) {
                blocks2[i >> 2] |= (224 | code >> 12) << SHIFT[i++ & 3];
                blocks2[i >> 2] |= (128 | code >> 6 & 63) << SHIFT[i++ & 3];
                blocks2[i >> 2] |= (128 | code & 63) << SHIFT[i++ & 3];
              } else {
                code = 65536 + ((code & 1023) << 10 | message.charCodeAt(++index) & 1023);
                blocks2[i >> 2] |= (240 | code >> 18) << SHIFT[i++ & 3];
                blocks2[i >> 2] |= (128 | code >> 12 & 63) << SHIFT[i++ & 3];
                blocks2[i >> 2] |= (128 | code >> 6 & 63) << SHIFT[i++ & 3];
                blocks2[i >> 2] |= (128 | code & 63) << SHIFT[i++ & 3];
              }
            }
          }
          this.lastByteIndex = i;
          this.bytes += i - this.start;
          if (i >= 64) {
            this.block = blocks2[16];
            this.start = i - 64;
            this.hash();
            this.hashed = true;
          } else {
            this.start = i;
          }
        }
        if (this.bytes > 4294967295) {
          this.hBytes += this.bytes / 4294967296 << 0;
          this.bytes = this.bytes % 4294967296;
        }
        return this;
      };
      Sha256.prototype.finalize = function() {
        if (this.finalized) {
          return;
        }
        this.finalized = true;
        var blocks2 = this.blocks, i = this.lastByteIndex;
        blocks2[16] = this.block;
        blocks2[i >> 2] |= EXTRA[i & 3];
        this.block = blocks2[16];
        if (i >= 56) {
          if (!this.hashed) {
            this.hash();
          }
          blocks2[0] = this.block;
          blocks2[16] = blocks2[1] = blocks2[2] = blocks2[3] = blocks2[4] = blocks2[5] = blocks2[6] = blocks2[7] = blocks2[8] = blocks2[9] = blocks2[10] = blocks2[11] = blocks2[12] = blocks2[13] = blocks2[14] = blocks2[15] = 0;
        }
        blocks2[14] = this.hBytes << 3 | this.bytes >>> 29;
        blocks2[15] = this.bytes << 3;
        this.hash();
      };
      Sha256.prototype.hash = function() {
        var a = this.h0, b = this.h1, c = this.h2, d = this.h3, e = this.h4, f = this.h5, g = this.h6, h = this.h7, blocks2 = this.blocks, j, s0, s1, maj, t1, t2, ch, ab, da, cd, bc;
        for (j = 16; j < 64; ++j) {
          t1 = blocks2[j - 15];
          s0 = (t1 >>> 7 | t1 << 25) ^ (t1 >>> 18 | t1 << 14) ^ t1 >>> 3;
          t1 = blocks2[j - 2];
          s1 = (t1 >>> 17 | t1 << 15) ^ (t1 >>> 19 | t1 << 13) ^ t1 >>> 10;
          blocks2[j] = blocks2[j - 16] + s0 + blocks2[j - 7] + s1 << 0;
        }
        bc = b & c;
        for (j = 0; j < 64; j += 4) {
          if (this.first) {
            if (this.is224) {
              ab = 300032;
              t1 = blocks2[0] - 1413257819;
              h = t1 - 150054599 << 0;
              d = t1 + 24177077 << 0;
            } else {
              ab = 704751109;
              t1 = blocks2[0] - 210244248;
              h = t1 - 1521486534 << 0;
              d = t1 + 143694565 << 0;
            }
            this.first = false;
          } else {
            s0 = (a >>> 2 | a << 30) ^ (a >>> 13 | a << 19) ^ (a >>> 22 | a << 10);
            s1 = (e >>> 6 | e << 26) ^ (e >>> 11 | e << 21) ^ (e >>> 25 | e << 7);
            ab = a & b;
            maj = ab ^ a & c ^ bc;
            ch = e & f ^ ~e & g;
            t1 = h + s1 + ch + K[j] + blocks2[j];
            t2 = s0 + maj;
            h = d + t1 << 0;
            d = t1 + t2 << 0;
          }
          s0 = (d >>> 2 | d << 30) ^ (d >>> 13 | d << 19) ^ (d >>> 22 | d << 10);
          s1 = (h >>> 6 | h << 26) ^ (h >>> 11 | h << 21) ^ (h >>> 25 | h << 7);
          da = d & a;
          maj = da ^ d & b ^ ab;
          ch = h & e ^ ~h & f;
          t1 = g + s1 + ch + K[j + 1] + blocks2[j + 1];
          t2 = s0 + maj;
          g = c + t1 << 0;
          c = t1 + t2 << 0;
          s0 = (c >>> 2 | c << 30) ^ (c >>> 13 | c << 19) ^ (c >>> 22 | c << 10);
          s1 = (g >>> 6 | g << 26) ^ (g >>> 11 | g << 21) ^ (g >>> 25 | g << 7);
          cd = c & d;
          maj = cd ^ c & a ^ da;
          ch = g & h ^ ~g & e;
          t1 = f + s1 + ch + K[j + 2] + blocks2[j + 2];
          t2 = s0 + maj;
          f = b + t1 << 0;
          b = t1 + t2 << 0;
          s0 = (b >>> 2 | b << 30) ^ (b >>> 13 | b << 19) ^ (b >>> 22 | b << 10);
          s1 = (f >>> 6 | f << 26) ^ (f >>> 11 | f << 21) ^ (f >>> 25 | f << 7);
          bc = b & c;
          maj = bc ^ b & d ^ cd;
          ch = f & g ^ ~f & h;
          t1 = e + s1 + ch + K[j + 3] + blocks2[j + 3];
          t2 = s0 + maj;
          e = a + t1 << 0;
          a = t1 + t2 << 0;
        }
        this.h0 = this.h0 + a << 0;
        this.h1 = this.h1 + b << 0;
        this.h2 = this.h2 + c << 0;
        this.h3 = this.h3 + d << 0;
        this.h4 = this.h4 + e << 0;
        this.h5 = this.h5 + f << 0;
        this.h6 = this.h6 + g << 0;
        this.h7 = this.h7 + h << 0;
      };
      Sha256.prototype.hex = function() {
        this.finalize();
        var h0 = this.h0, h1 = this.h1, h2 = this.h2, h3 = this.h3, h4 = this.h4, h5 = this.h5, h6 = this.h6, h7 = this.h7;
        var hex = HEX_CHARS[h0 >> 28 & 15] + HEX_CHARS[h0 >> 24 & 15] + HEX_CHARS[h0 >> 20 & 15] + HEX_CHARS[h0 >> 16 & 15] + HEX_CHARS[h0 >> 12 & 15] + HEX_CHARS[h0 >> 8 & 15] + HEX_CHARS[h0 >> 4 & 15] + HEX_CHARS[h0 & 15] + HEX_CHARS[h1 >> 28 & 15] + HEX_CHARS[h1 >> 24 & 15] + HEX_CHARS[h1 >> 20 & 15] + HEX_CHARS[h1 >> 16 & 15] + HEX_CHARS[h1 >> 12 & 15] + HEX_CHARS[h1 >> 8 & 15] + HEX_CHARS[h1 >> 4 & 15] + HEX_CHARS[h1 & 15] + HEX_CHARS[h2 >> 28 & 15] + HEX_CHARS[h2 >> 24 & 15] + HEX_CHARS[h2 >> 20 & 15] + HEX_CHARS[h2 >> 16 & 15] + HEX_CHARS[h2 >> 12 & 15] + HEX_CHARS[h2 >> 8 & 15] + HEX_CHARS[h2 >> 4 & 15] + HEX_CHARS[h2 & 15] + HEX_CHARS[h3 >> 28 & 15] + HEX_CHARS[h3 >> 24 & 15] + HEX_CHARS[h3 >> 20 & 15] + HEX_CHARS[h3 >> 16 & 15] + HEX_CHARS[h3 >> 12 & 15] + HEX_CHARS[h3 >> 8 & 15] + HEX_CHARS[h3 >> 4 & 15] + HEX_CHARS[h3 & 15] + HEX_CHARS[h4 >> 28 & 15] + HEX_CHARS[h4 >> 24 & 15] + HEX_CHARS[h4 >> 20 & 15] + HEX_CHARS[h4 >> 16 & 15] + HEX_CHARS[h4 >> 12 & 15] + HEX_CHARS[h4 >> 8 & 15] + HEX_CHARS[h4 >> 4 & 15] + HEX_CHARS[h4 & 15] + HEX_CHARS[h5 >> 28 & 15] + HEX_CHARS[h5 >> 24 & 15] + HEX_CHARS[h5 >> 20 & 15] + HEX_CHARS[h5 >> 16 & 15] + HEX_CHARS[h5 >> 12 & 15] + HEX_CHARS[h5 >> 8 & 15] + HEX_CHARS[h5 >> 4 & 15] + HEX_CHARS[h5 & 15] + HEX_CHARS[h6 >> 28 & 15] + HEX_CHARS[h6 >> 24 & 15] + HEX_CHARS[h6 >> 20 & 15] + HEX_CHARS[h6 >> 16 & 15] + HEX_CHARS[h6 >> 12 & 15] + HEX_CHARS[h6 >> 8 & 15] + HEX_CHARS[h6 >> 4 & 15] + HEX_CHARS[h6 & 15];
        if (!this.is224) {
          hex += HEX_CHARS[h7 >> 28 & 15] + HEX_CHARS[h7 >> 24 & 15] + HEX_CHARS[h7 >> 20 & 15] + HEX_CHARS[h7 >> 16 & 15] + HEX_CHARS[h7 >> 12 & 15] + HEX_CHARS[h7 >> 8 & 15] + HEX_CHARS[h7 >> 4 & 15] + HEX_CHARS[h7 & 15];
        }
        return hex;
      };
      Sha256.prototype.toString = Sha256.prototype.hex;
      Sha256.prototype.digest = function() {
        this.finalize();
        var h0 = this.h0, h1 = this.h1, h2 = this.h2, h3 = this.h3, h4 = this.h4, h5 = this.h5, h6 = this.h6, h7 = this.h7;
        var arr = [
          h0 >> 24 & 255,
          h0 >> 16 & 255,
          h0 >> 8 & 255,
          h0 & 255,
          h1 >> 24 & 255,
          h1 >> 16 & 255,
          h1 >> 8 & 255,
          h1 & 255,
          h2 >> 24 & 255,
          h2 >> 16 & 255,
          h2 >> 8 & 255,
          h2 & 255,
          h3 >> 24 & 255,
          h3 >> 16 & 255,
          h3 >> 8 & 255,
          h3 & 255,
          h4 >> 24 & 255,
          h4 >> 16 & 255,
          h4 >> 8 & 255,
          h4 & 255,
          h5 >> 24 & 255,
          h5 >> 16 & 255,
          h5 >> 8 & 255,
          h5 & 255,
          h6 >> 24 & 255,
          h6 >> 16 & 255,
          h6 >> 8 & 255,
          h6 & 255
        ];
        if (!this.is224) {
          arr.push(h7 >> 24 & 255, h7 >> 16 & 255, h7 >> 8 & 255, h7 & 255);
        }
        return arr;
      };
      Sha256.prototype.array = Sha256.prototype.digest;
      Sha256.prototype.arrayBuffer = function() {
        this.finalize();
        var buffer = new ArrayBuffer(this.is224 ? 28 : 32);
        var dataView = new DataView(buffer);
        dataView.setUint32(0, this.h0);
        dataView.setUint32(4, this.h1);
        dataView.setUint32(8, this.h2);
        dataView.setUint32(12, this.h3);
        dataView.setUint32(16, this.h4);
        dataView.setUint32(20, this.h5);
        dataView.setUint32(24, this.h6);
        if (!this.is224) {
          dataView.setUint32(28, this.h7);
        }
        return buffer;
      };
      function HmacSha256(key, is2242, sharedMemory) {
        var i, type = typeof key;
        if (type === "string") {
          var bytes = [], length = key.length, index = 0, code;
          for (i = 0; i < length; ++i) {
            code = key.charCodeAt(i);
            if (code < 128) {
              bytes[index++] = code;
            } else if (code < 2048) {
              bytes[index++] = 192 | code >> 6;
              bytes[index++] = 128 | code & 63;
            } else if (code < 55296 || code >= 57344) {
              bytes[index++] = 224 | code >> 12;
              bytes[index++] = 128 | code >> 6 & 63;
              bytes[index++] = 128 | code & 63;
            } else {
              code = 65536 + ((code & 1023) << 10 | key.charCodeAt(++i) & 1023);
              bytes[index++] = 240 | code >> 18;
              bytes[index++] = 128 | code >> 12 & 63;
              bytes[index++] = 128 | code >> 6 & 63;
              bytes[index++] = 128 | code & 63;
            }
          }
          key = bytes;
        } else {
          if (type === "object") {
            if (key === null) {
              throw new Error(ERROR);
            } else if (ARRAY_BUFFER && key.constructor === ArrayBuffer) {
              key = new Uint8Array(key);
            } else if (!Array.isArray(key)) {
              if (!ARRAY_BUFFER || !ArrayBuffer.isView(key)) {
                throw new Error(ERROR);
              }
            }
          } else {
            throw new Error(ERROR);
          }
        }
        if (key.length > 64) {
          key = new Sha256(is2242, true).update(key).array();
        }
        var oKeyPad = [], iKeyPad = [];
        for (i = 0; i < 64; ++i) {
          var b = key[i] || 0;
          oKeyPad[i] = 92 ^ b;
          iKeyPad[i] = 54 ^ b;
        }
        Sha256.call(this, is2242, sharedMemory);
        this.update(iKeyPad);
        this.oKeyPad = oKeyPad;
        this.inner = true;
        this.sharedMemory = sharedMemory;
      }
      HmacSha256.prototype = new Sha256();
      HmacSha256.prototype.finalize = function() {
        Sha256.prototype.finalize.call(this);
        if (this.inner) {
          this.inner = false;
          var innerHash = this.array();
          Sha256.call(this, this.is224, this.sharedMemory);
          this.update(this.oKeyPad);
          this.update(innerHash);
          Sha256.prototype.finalize.call(this);
        }
      };
      var exports = createMethod();
      exports.sha256 = exports;
      exports.sha224 = createMethod(true);
      exports.sha256.hmac = createHmacMethod();
      exports.sha224.hmac = createHmacMethod(true);
      if (COMMON_JS) {
        module.exports = exports;
      } else {
        root.sha256 = exports.sha256;
        root.sha224 = exports.sha224;
        if (AMD) {
          define(function() {
            return exports;
          });
        }
      }
    })();
  }
});

// src/index.ts
init_cjs_shims();

// src/actions/crossChainSwap.ts
init_cjs_shims();

// src/utils/deposit.ts
init_cjs_shims();

// src/utils/environment.ts
init_cjs_shims();
function getRuntimeSettings() {
  const accountId = process.env.NEAR_ADDRESS;
  if (!accountId) {
    throw new Error("NEAR_ADDRESS not configured");
  }
  const secretKey = process.env.NEAR_WALLET_SECRET_KEY;
  if (!secretKey) {
    throw new Error("NEAR_WALLET_SECRET_KEY not configured");
  }
  return {
    networkId: process.env.NEAR_NETWORK || "testnet",
    nodeUrl: process.env.NEAR_RPC_URL || `https://rpc.${process.env.NEAR_NETWORK || "testnet"}.near.org`,
    walletUrl: `https://${process.env.NEAR_NETWORK || "testnet"}.mynearwallet.com/`,
    helperUrl: `https://helper.${process.env.NEAR_NETWORK || "testnet"}.near.org`,
    explorerUrl: `https://${process.env.NEAR_NETWORK || "testnet"}.nearblocks.io`,
    accountId: process.env.NEAR_ADDRESS || "",
    secretKey: process.env.NEAR_WALLET_SECRET_KEY || "",
    publicKey: process.env.NEAR_WALLET_PUBLIC_KEY || "",
    SLIPPAGE: process.env.NEAR_SLIPPAGE ? parseInt(process.env.NEAR_SLIPPAGE) : 1,
    defuseContractId: process.env.DEFUSE_CONTRACT_ID || "intents.near",
    coingeckoUrl: process.env.COINGECKO_API_URL || "",
    coingeckoKey: process.env.COINGECKO_API_KEY || ""
  };
}
var settings = getRuntimeSettings();

// src/types/deposit.ts
init_cjs_shims();
var FetchError = class extends Error {
  constructor() {
    super(...arguments);
    this.name = "FetchError";
  }
};
var ResponseError = class extends Error {
  constructor(response, msg) {
    super(msg);
    this.response = response;
    this.name = "ResponseError";
  }
};

// src/types/tokens.ts
init_cjs_shims();

// src/config/tokens.json
var tokens_default = {
  tokens: {
    mainnet: {
      unified_tokens: [
        {
          unifiedAssetId: "usdc",
          decimals: 6,
          symbol: "USDC",
          name: "USD Coin",
          icon: "https://s2.coinmarketcap.com/static/img/coins/128x128/3408.png",
          cgId: "usd-coin",
          addresses: {
            ethereum: {
              address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
              defuse_asset_id: "nep141:eth-0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.omft.near"
            },
            near: {
              address: "17208628f84f5d6ad33f0da3bbbeb27ffcb398eac501a31bd6ad2011e36133a1",
              defuse_asset_id: "nep141:17208628f84f5d6ad33f0da3bbbeb27ffcb398eac501a31bd6ad2011e36133a1"
            },
            turbochain: {
              address: "0x368ebb46aca6b8d0787c96b2b20bd3cc3f2c45f7",
              defuse_asset_id: "nep141:17208628f84f5d6ad33f0da3bbbeb27ffcb398eac501a31bd6ad2011e36133a1"
            },
            aurora: {
              address: "0x368ebb46aca6b8d0787c96b2b20bd3cc3f2c45f7",
              defuse_asset_id: "nep141:17208628f84f5d6ad33f0da3bbbeb27ffcb398eac501a31bd6ad2011e36133a1"
            },
            base: {
              address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
              defuse_asset_id: "nep141:base-0x833589fcd6edb6e08f4c7c32d4f71b54bda02913.omft.near"
            },
            arbitrum: {
              address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
              defuse_asset_id: "nep141:arb-0xaf88d065e77c8cc2239327c5edb3a432268e5831.omft.near"
            },
            solana: {
              address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
              defuse_asset_id: "nep141:sol-5ce3bf3a31af18be40ba30f721101b4341690186.omft.near"
            }
          }
        },
        {
          unifiedAssetId: "eth",
          decimals: 18,
          symbol: "ETH",
          name: "ETH",
          icon: "https://s2.coinmarketcap.com/static/img/coins/128x128/1027.png",
          cgId: "ethereum",
          addresses: {
            ethereum: {
              address: "native",
              defuse_asset_id: "nep141:eth.omft.near",
              type: "native"
            },
            near: {
              address: "aurora",
              defuse_asset_id: "nep141:aurora"
            },
            turbochain: {
              address: "0x5a524251df27A25AC6b9964a93E1c23AD692688D",
              defuse_asset_id: "nep141:aurora"
            },
            aurora: {
              address: "native",
              defuse_asset_id: "nep141:aurora",
              type: "native"
            },
            base: {
              address: "native",
              defuse_asset_id: "nep141:base.omft.near",
              type: "native"
            },
            arbitrum: {
              address: "native",
              defuse_asset_id: "nep141:arb.omft.near",
              type: "native"
            }
          }
        },
        {
          unifiedAssetId: "aurora",
          decimals: 18,
          symbol: "AURORA",
          name: "Aurora",
          icon: "https://s2.coinmarketcap.com/static/img/coins/128x128/14803.png",
          cgId: "auroratoken",
          addresses: {
            near: {
              address: "aaaaaa20d9e0e2461697782ef11675f668207961.factory.bridge.near",
              defuse_asset_id: "nep141:aaaaaa20d9e0e2461697782ef11675f668207961.factory.bridge.near"
            },
            turbochain: {
              address: "0x8BEc47865aDe3B172A928df8f990Bc7f2A3b9f79",
              defuse_asset_id: "nep141:aaaaaa20d9e0e2461697782ef11675f668207961.factory.bridge.near"
            },
            aurora: {
              address: "0x8BEc47865aDe3B172A928df8f990Bc7f2A3b9f79",
              defuse_asset_id: "nep141:aaaaaa20d9e0e2461697782ef11675f668207961.factory.bridge.near"
            },
            ethereum: {
              address: "0xAaAAAA20D9E0e2461697782ef11675f668207961",
              defuse_asset_id: "nep141:eth-0xaaaaaa20d9e0e2461697782ef11675f668207961.omft.near"
            }
          }
        },
        {
          unifiedAssetId: "turbo",
          decimals: 18,
          symbol: "TURBO",
          name: "Turbo",
          icon: "https://s2.coinmarketcap.com/static/img/coins/128x128/24911.png",
          cgId: "turbo",
          addresses: {
            ethereum: {
              address: "0xA35923162C49cF95e6BF26623385eb431ad920D3",
              defuse_asset_id: "nep141:eth-0xa35923162c49cf95e6bf26623385eb431ad920d3.omft.near"
            },
            turbochain: {
              address: "native",
              defuse_asset_id: "nep141:a35923162c49cf95e6bf26623385eb431ad920d3.factory.bridge.near",
              type: "native"
            },
            near: {
              address: "a35923162c49cf95e6bf26623385eb431ad920d3.factory.bridge.near",
              defuse_asset_id: "nep141:a35923162c49cf95e6bf26623385eb431ad920d3.factory.bridge.near"
            }
          }
        }
      ],
      single_chain_tokens: [
        {
          defuseAssetId: "nep141:wrap.near",
          type: "native",
          address: "native",
          decimals: 24,
          icon: "https://s2.coinmarketcap.com/static/img/coins/128x128/1.png",
          chainIcon: "/static/icons/network/near.svg",
          chainName: "near",
          symbol: "NEAR",
          cgId: "near",
          name: "Near"
        },
        {
          defuseAssetId: "nep141:btc.omft.near",
          type: "native",
          address: "native",
          decimals: 8,
          icon: "https://s2.coinmarketcap.com/static/img/coins/128x128/1.png",
          chainIcon: "/static/icons/network/btc.svg",
          chainName: "bitcoin",
          symbol: "BTC",
          cgId: "bitcoin",
          name: "Bitcoin"
        },
        {
          defuseAssetId: "nep141:sol.omft.near",
          type: "native",
          address: "native",
          decimals: 9,
          icon: "https://s2.coinmarketcap.com/static/img/coins/128x128/5426.png",
          chainIcon: "/static/icons/network/solana.svg",
          chainName: "solana",
          symbol: "SOL",
          cgId: "solana",
          name: "Solana"
        },
        {
          defuseAssetId: "nep141:doge.omft.near",
          type: "native",
          address: "native",
          decimals: 8,
          icon: "https://s2.coinmarketcap.com/static/img/coins/128x128/74.png",
          chainIcon: "/static/icons/network/dogecoin.svg",
          chainName: "dogecoin",
          symbol: "DOGE",
          cgId: "dogecoin",
          name: "Dogecoin"
        },
        {
          defuseAssetId: "nep141:xrp.omft.near",
          type: "native",
          address: "native",
          decimals: 6,
          icon: "https://s2.coinmarketcap.com/static/img/coins/128x128/52.png",
          chainIcon: "/static/icons/network/xrpledger.svg",
          chainName: "xrpledger",
          symbol: "XRP",
          cgId: "ripple",
          name: "XRP"
        },
        {
          defuseAssetId: "nep141:eth-0x6982508145454ce325ddbe47a25d4ec3d2311933.omft.near",
          address: "0x6982508145454Ce325dDbE47a25d4ec3d2311933",
          decimals: 18,
          icon: "https://s2.coinmarketcap.com/static/img/coins/128x128/24478.png",
          chainIcon: "/static/icons/network/ethereum.svg",
          chainName: "eth",
          symbol: "PEPE",
          cgId: "pepe",
          name: "Pepe"
        },
        {
          defuseAssetId: "nep141:eth-0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce.omft.near",
          address: "0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE",
          decimals: 18,
          icon: "https://s2.coinmarketcap.com/static/img/coins/128x128/5994.png",
          chainIcon: "/static/icons/network/ethereum.svg",
          chainName: "eth",
          symbol: "SHIB",
          cgId: "shiba-inu",
          name: "Shiba Inu"
        },
        {
          defuseAssetId: "nep141:eth-0x514910771af9ca656af840dff83e8264ecf986ca.omft.near",
          address: "0x514910771AF9Ca656af840dff83E8264EcF986CA",
          decimals: 18,
          icon: "https://s2.coinmarketcap.com/static/img/coins/128x128/1975.png",
          chainIcon: "/static/icons/network/ethereum.svg",
          chainName: "eth",
          symbol: "LINK",
          cgId: "chainlink",
          name: "Chainlink"
        },
        {
          defuseAssetId: "nep141:eth-0x1f9840a85d5af5bf1d1762f925bdaddc4201f984.omft.near",
          address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
          decimals: 18,
          icon: "https://s2.coinmarketcap.com/static/img/coins/128x128/7083.png",
          chainIcon: "/static/icons/network/ethereum.svg",
          chainName: "eth",
          symbol: "UNI",
          cgId: "uniswap",
          name: "Uniswap"
        },
        {
          defuseAssetId: "nep141:arb-0x912ce59144191c1204e64559fe8253a0e49e6548.omft.near",
          address: "0x912CE59144191C1204E64559FE8253a0e49E6548",
          decimals: 18,
          icon: "https://s2.coinmarketcap.com/static/img/coins/128x128/11841.png",
          chainIcon: "/static/icons/network/arbitrum.svg",
          chainName: "arbitrum",
          symbol: "ARB",
          cgId: "arbitrum",
          name: "Arbitrum"
        },
        {
          defuseAssetId: "nep141:eth-0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9.omft.near",
          address: "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9",
          decimals: 18,
          icon: "https://s2.coinmarketcap.com/static/img/coins/128x128/7278.png",
          chainIcon: "/static/icons/network/ethereum.svg",
          chainName: "eth",
          symbol: "AAVE",
          cgId: "aave",
          name: "Aave"
        },
        {
          defuseAssetId: "nep141:arb-0xfc5a1a6eb076a2c7ad06ed22c90d7e710e35ad0a.omft.near",
          address: "0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a",
          decimals: 18,
          icon: "https://s2.coinmarketcap.com/static/img/coins/128x128/11857.png",
          chainIcon: "/static/icons/network/arbitrum.svg",
          chainName: "arbitrum",
          symbol: "GMX",
          cgId: "gmx",
          name: "GMX"
        },
        {
          defuseAssetId: "nep141:eth-0xaaee1a9723aadb7afa2810263653a34ba2c21c7a.omft.near",
          address: "0xaaeE1A9723aaDB7afA2810263653A34bA2C21C7a",
          decimals: 18,
          icon: "https://s2.coinmarketcap.com/static/img/coins/128x128/27659.png",
          chainIcon: "/static/icons/network/ethereum.svg",
          chainName: "eth",
          symbol: "MOG",
          cgId: "mog-coin",
          name: "Mog Coin"
        },
        {
          defuseAssetId: "nep141:base-0x532f27101965dd16442e59d40670faf5ebb142e4.omft.near",
          address: "0x532f27101965dd16442E59d40670FaF5eBB142E4",
          decimals: 18,
          icon: "https://s2.coinmarketcap.com/static/img/coins/128x128/29743.png",
          chainIcon: "/static/icons/network/base.svg",
          chainName: "base",
          symbol: "BRETT",
          cgId: "brett",
          name: "Brett"
        },
        {
          defuseAssetId: "nep141:token.sweat",
          address: "token.sweat",
          decimals: 18,
          icon: "https://s2.coinmarketcap.com/static/img/coins/128x128/21351.png",
          chainIcon: "/static/icons/network/near.svg",
          chainName: "near",
          symbol: "SWEAT",
          cgId: "sweatcoin",
          name: "Sweat Economy"
        },
        {
          defuseAssetId: "nep141:sol-b9c68f94ec8fd160137af8cdfe5e61cd68e2afba.omft.near",
          address: "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm",
          decimals: 6,
          icon: "https://s2.coinmarketcap.com/static/img/coins/128x128/28752.png",
          chainIcon: "/static/icons/network/solana.svg",
          chainName: "solana",
          symbol: "WIF",
          cgId: "dogwifcoin",
          name: "dogwifhat"
        },
        {
          defuseAssetId: "nep141:sol-57d087fd8c460f612f8701f5499ad8b2eec5ab68.omft.near",
          address: "ukHH6c7mMyiWCf1b9pnWe25TSpkDDt3H5pQZgZ74J82",
          decimals: 6,
          icon: "https://s2.coinmarketcap.com/static/img/coins/128x128/29870.png",
          chainIcon: "/static/icons/network/solana.svg",
          chainName: "solana",
          symbol: "BOME",
          cgId: "book-of-meme",
          name: "BOOK OF MEME"
        }
      ]
    }
  }
};

// src/types/tokens.ts
var tokenConfig = tokens_default;
function getTokenBySymbol(symbol) {
  const upperSymbol = symbol.toUpperCase();
  console.log("Looking for token with symbol:", upperSymbol);
  const unifiedToken = tokenConfig.tokens.mainnet.unified_tokens.find(
    (token) => token.symbol.toUpperCase() === upperSymbol
  );
  if (unifiedToken) {
    return unifiedToken;
  }
  return tokenConfig.tokens.mainnet.single_chain_tokens.find(
    (token) => token.symbol.toUpperCase() === upperSymbol
  );
}
function getAllSupportedTokens() {
  const tokens = /* @__PURE__ */ new Set();
  tokenConfig.tokens.mainnet.unified_tokens.forEach((token) => tokens.add(token.symbol));
  tokenConfig.tokens.mainnet.single_chain_tokens.forEach((token) => tokens.add(token.symbol));
  return Array.from(tokens);
}
function getDefuseAssetId(token, chain = "near") {
  if (isUnifiedToken(token)) {
    const chainToken = token.addresses[chain];
    if (!chainToken) {
      if (chain !== "near") {
        const nearToken = token.addresses["near"];
        if (nearToken) {
          console.log(`Chain ${chain} not found for token ${token.symbol}, using NEAR chain instead`);
          return nearToken.defuse_asset_id;
        }
      }
      throw new Error(`Chain ${chain} not supported for token ${token.symbol}`);
    }
    return chainToken.defuse_asset_id;
  }
  return token.defuseAssetId;
}
function isUnifiedToken(token) {
  return "addresses" in token && "unifiedAssetId" in token;
}
function convertAmountToDecimals(amount, token) {
  const [whole, decimal = ""] = amount.split(".");
  const decimals = token.decimals;
  const trimmedDecimal = decimal.slice(0, decimals).padEnd(decimals, "0");
  const fullAmount = `${whole}${trimmedDecimal}`;
  return BigInt(fullAmount);
}

// src/utils/deposit.ts
var FT_DEPOSIT_GAS = `30${"0".repeat(12)}`;
var FT_TRANSFER_GAS = `50${"0".repeat(12)}`;
var BASE_URL = "https://nearrpc.aurora.dev";
function createBatchDepositNearNep141Transaction(assetAccountId, amount, isStorageDepositRequired, minStorageBalance) {
  return [
    {
      receiverId: assetAccountId,
      actions: [
        ...isStorageDepositRequired ? [
          nearApiJs.transactions.functionCall(
            "storage_deposit",
            {
              account_id: settings.defuseContractId,
              registration_only: true
            },
            BigInt(FT_DEPOSIT_GAS),
            minStorageBalance
          )
        ] : [],
        nearApiJs.transactions.functionCall(
          "ft_transfer_call",
          {
            receiver_id: settings.defuseContractId,
            amount: amount.toString(),
            msg: ""
          },
          BigInt(FT_TRANSFER_GAS),
          BigInt(1)
        )
      ]
    }
  ];
}
function createBatchDepositNearNativeTransaction(assetAccountId, amount, isStorageDepositRequired, minStorageBalance, isWrapNearRequired, wrapAmount) {
  return [
    {
      receiverId: assetAccountId,
      actions: [
        ...isWrapNearRequired || isStorageDepositRequired ? [
          nearApiJs.transactions.functionCall(
            "near_deposit",
            {},
            BigInt(FT_DEPOSIT_GAS),
            BigInt(wrapAmount + minStorageBalance)
          )
        ] : [],
        nearApiJs.transactions.functionCall(
          "ft_transfer_call",
          {
            receiver_id: settings.defuseContractId,
            amount: amount.toString(),
            msg: ""
          },
          BigInt(FT_TRANSFER_GAS),
          BigInt(1)
        )
      ]
    }
  ];
}
async function getDepositedBalances(accountId, tokens, nearClient, network) {
  const networkId = network || "near";
  const defuseAssetIds = tokens.map((token) => getDefuseAssetId(token, networkId));
  console.log("defuseAssetIds", defuseAssetIds);
  const output = await nearClient.query({
    request_type: "call_function",
    account_id: settings.defuseContractId,
    method_name: "mt_batch_balance_of",
    args_base64: btoa(
      JSON.stringify({
        account_id: accountId,
        token_ids: defuseAssetIds
      })
    ),
    finality: "optimistic"
  });
  const uint8Array = new Uint8Array(output.result);
  const decoder = new TextDecoder();
  const parsed = JSON.parse(decoder.decode(uint8Array));
  assert(
    Array.isArray(parsed) && parsed.every((a) => typeof a === "string"),
    "Invalid response"
  );
  assert(parsed.length === defuseAssetIds.length, "Invalid response");
  const result = {};
  for (let i = 0; i < defuseAssetIds.length; i++) {
    result[defuseAssetIds[i]] = BigInt(parsed[i]);
  }
  return result;
}
function assert(condition, msg) {
  if (!condition) {
    throw new Error(msg);
  }
}
async function getNearNep141StorageBalanceOf(params) {
  const json = await jsonRPCRequest(
    "query",
    params
  );
  return json.result;
}
async function jsonRPCRequest(method2, params) {
  const response = await request(`${BASE_URL}`, {
    id: "dontcare",
    jsonrpc: "2.0",
    method: method2,
    params: params !== undefined ? params : undefined
  });
  return response.json();
}
async function request(url, body) {
  let response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });
  } catch (err) {
    throw new FetchError(`The request failed ${err}`);
  }
  if (response.ok) {
    return response;
  }
  throw new ResponseError(response, "Response returned an error code");
}
var getNearNep141StorageBalance = async ({
  contractId,
  accountId
}) => {
  try {
    const args = { account_id: accountId };
    const argsBase64 = Buffer.from(JSON.stringify(args)).toString("base64");
    const response = await getNearNep141StorageBalanceOf({
      request_type: "call_function",
      method_name: "storage_balance_of",
      account_id: contractId,
      args_base64: argsBase64,
      finality: "optimistic"
    });
    console.log(response);
    const uint8Array = new Uint8Array(response.result);
    const decoder = new TextDecoder();
    const parsed = JSON.parse(decoder.decode(uint8Array));
    console.log(parsed);
    return BigInt(parsed?.total || "0");
  } catch (err) {
    console.error("Error fetching balance:", err);
    throw new Error(`Error fetching balance: ${err instanceof Error ? err.message : String(err)}`);
  }
};

// src/actions/crossChainSwap.ts
var js_sha256 = __toESM(require_sha256());

// src/types/intents.ts
init_cjs_shims();
var Payload = class {
  constructor({ message, nonce, recipient }) {
    this.tag = 2147484061;
    this.message = message;
    this.nonce = nonce;
    this.recipient = recipient;
  }
};
__decorateClass([
  Borsh.field({ type: "u32" })
], Payload.prototype, "tag");
__decorateClass([
  Borsh.field({ type: "string" })
], Payload.prototype, "message");
__decorateClass([
  Borsh.field({ type: Borsh.fixedArray("u8", 32) })
], Payload.prototype, "nonce");
__decorateClass([
  Borsh.field({ type: "string" })
], Payload.prototype, "recipient");
__decorateClass([
  Borsh.field({ type: Borsh.option("string") })
], Payload.prototype, "callbackUrl");
var createTokenDiffIntent = (defuse_asset_identifier_in, defuse_asset_identifier_out, exact_amount_in, exact_amount_out) => {
  return {
    intent: "token_diff",
    diff: {
      [defuse_asset_identifier_out]: exact_amount_out,
      [defuse_asset_identifier_in]: `-${exact_amount_in}`
    }
  };
};

// src/providers/coingeckoProvider.ts
init_cjs_shims();
var coingeckoApiKey = settings.coingeckoKey ?? "";
var appOriginUrl = "*";
var getTokenPriceUSD = async (id) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": appOriginUrl,
      "x-cg-api-key": coingeckoApiKey
    }
  };
  try {
    const response = await axios__default.default.get(
      `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd&precision=full`,
      config
    );
    const priceStr = response.data?.[id]?.usd ?? "0";
    return Number(priceStr);
  } catch (error) {
    console.error("Error fetching token price:", error);
    return 0;
  }
};

// src/actions/crossChainSwap.ts
var DEFUSE_RPC_URL = "https://solver-relay-v2.chaindefuser.com/rpc";
var POLLING_INTERVAL_MS = 2e3;
var MAX_POLLING_TIME_MS = 3e5;
var FT_MINIMUM_STORAGE_BALANCE_LARGE = "1250000000000000000000";
var SWAP_SAFETY_THRESHOLD_PERCENT_ABOVE_1USD = 0.5;
var SWAP_SAFETY_THRESHOLD_PERCENT_BELOW_1USD = 10;
var SWAP_SAFETY_THRESHOLD_USD = 1;
async function makeRPCRequest(method2, params) {
  const requestBody = {
    id: 1,
    jsonrpc: "2.0",
    method: method2,
    params
  };
  console.log("Making RPC request to:", DEFUSE_RPC_URL, method2);
  console.log("Request body:", JSON.stringify(requestBody, null, 2));
  const response = await fetch(DEFUSE_RPC_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(requestBody)
  });
  if (!response.ok) {
    throw new Error(`RPC request failed: ${response.statusText}`);
  }
  const data = await response.json();
  if (data.error) {
    throw new Error(`RPC error: ${data.error.message}`);
  }
  return data.result;
}
var getQuote = async (params) => {
  return makeRPCRequest("quote", [params]);
};
var publishIntent = async (params) => {
  return makeRPCRequest("publish_intent", [params]);
};
var getIntentStatus = async (intentHash) => {
  return makeRPCRequest("get_status", [{
    intent_hash: intentHash
  }]);
};
var depositIntoDefuse = async (tokenIds, amount, nearConnection) => {
  const contractId = tokenIds[0].replace("nep141:", "");
  const nep141balance = await getNearNep141StorageBalance({
    contractId,
    accountId: settings.accountId
  });
  var transaction = null;
  if (contractId === "wrap.near") {
    transaction = createBatchDepositNearNativeTransaction(contractId, amount, !(nep141balance >= BigInt(FT_MINIMUM_STORAGE_BALANCE_LARGE)), BigInt(FT_MINIMUM_STORAGE_BALANCE_LARGE), amount > 0n, amount);
  } else {
    transaction = createBatchDepositNearNep141Transaction(contractId, amount, !(nep141balance >= BigInt(FT_MINIMUM_STORAGE_BALANCE_LARGE)), BigInt(FT_MINIMUM_STORAGE_BALANCE_LARGE));
  }
  return transaction;
};
async function getBalances(tokens, nearClient, network) {
  const tokenBalances = await getDepositedBalances(
    settings.accountId || "",
    tokens,
    nearClient,
    network
  );
  return tokenBalances;
}
async function pollIntentStatus(intentHash) {
  const startTime = Date.now();
  while (Date.now() - startTime < MAX_POLLING_TIME_MS) {
    const status = await getIntentStatus(intentHash);
    if (status.status === "SETTLED" || status.status === "NOT_FOUND_OR_NOT_VALID") {
      return status;
    }
    await new Promise((resolve) => setTimeout(resolve, POLLING_INTERVAL_MS));
  }
  throw new Error("Timeout waiting for intent to settle");
}
async function signMessage(keyPair, params) {
  if (params.nonce.byteLength !== 32) {
    throw Error("Expected nonce to be a 32 bytes buffer");
  }
  const payload = new Payload({ tag: 2147484061, message: params.message, nonce: Array.from(params.nonce), recipient: params.recipient });
  const borshPayload = Borsh__namespace.serialize(payload);
  const hashedPayload = js_sha256.sha256.array(borshPayload);
  const { signature } = keyPair.sign(Uint8Array.from(hashedPayload));
  return {
    signature: nearApiJs.utils.serialize.base_encode(signature),
    publicKey: nearApiJs.utils.serialize.base_encode(keyPair.getPublicKey().data)
  };
}
async function crossChainSwap(params) {
  const accountId = params.accountId;
  settings.accountId = accountId;
  const function_access_key = params.function_access_key;
  const network = params.network || "near";
  if (!accountId) {
    throw new Error("NEAR_ADDRESS not configured");
  }
  console.log("Looking up tokens:", {
    tokenIn: params.defuse_asset_identifier_in,
    tokenOut: params.defuse_asset_identifier_out
  });
  const defuseTokenIn = getTokenBySymbol(params.defuse_asset_identifier_in);
  const defuseTokenOut = getTokenBySymbol(params.defuse_asset_identifier_out);
  console.log("Found tokens:", {
    defuseTokenIn,
    defuseTokenOut
  });
  if (!defuseTokenIn || !defuseTokenOut) {
    const supportedTokens = getAllSupportedTokens();
    throw new Error(`Token ${params.defuse_asset_identifier_in} or ${params.defuse_asset_identifier_out} not found. Supported tokens: ${supportedTokens.join(", ")}`);
  }
  const amountInBigInt = convertAmountToDecimals(params.exact_amount_in, defuseTokenIn);
  const defuseAssetIdIn = getDefuseAssetId(defuseTokenIn);
  const defuseAssetIdOut = getDefuseAssetId(defuseTokenOut, network);
  console.log("Defuse asset IDs:", {
    defuseAssetIdIn,
    defuseAssetIdOut
  });
  const keyStore = new nearApiJs.keyStores.BrowserLocalStorageKeyStore();
  const keyPair = nearApiJs.utils.KeyPair.fromString(function_access_key);
  await keyStore.setKey(settings.networkId, settings.accountId, keyPair);
  const nearConnection = await nearApiJs.connect({
    networkId: settings.networkId,
    keyStore,
    nodeUrl: settings.nodeUrl
  });
  const tokenBalanceIn = await getBalances([defuseTokenIn], nearConnection.connection.provider, network);
  const tokenBalanceOut = await getBalances([defuseTokenOut], nearConnection.connection.provider, network);
  console.log("Token balances:", tokenBalanceIn, tokenBalanceOut);
  if (tokenBalanceIn[defuseAssetIdIn] != undefined && tokenBalanceIn[defuseAssetIdIn] < amountInBigInt) {
    await depositIntoDefuse([defuseAssetIdIn], amountInBigInt - tokenBalanceIn[defuseAssetIdIn]);
  }
  const quote = await getQuote({
    defuse_asset_identifier_in: defuseAssetIdIn,
    defuse_asset_identifier_out: defuseAssetIdOut,
    exact_amount_in: amountInBigInt.toString()
  });
  console.log("Quote:", quote);
  if (!quote || !Array.isArray(quote) || quote.length === 0) {
    throw new Error("Failed to get quote from Defuse. Response: " + JSON.stringify(quote));
  }
  var best_quote_index = 0;
  var max = 0n;
  for (let index = 0; index < quote.length; index++) {
    const element = quote[index];
    if (BigInt(element.amount_out) > max) {
      max = BigInt(element.amount_out);
      best_quote_index = index;
    }
  }
  const in_token_decimal = defuseTokenIn.decimals;
  const out_token_decimal = defuseTokenOut.decimals;
  const in_usd_price = await getTokenPriceUSD(defuseTokenIn.cgId) * Number(quote[best_quote_index].amount_in) / Number(`1${"0".repeat(in_token_decimal)}`);
  const out_usd_price = await getTokenPriceUSD(defuseTokenOut.cgId) * Number(quote[best_quote_index].amount_out) / Number(`1${"0".repeat(out_token_decimal)}`);
  const loss = in_usd_price - out_usd_price;
  const loss_percent = Number(loss) / Number(in_usd_price) * 100;
  if (loss > SWAP_SAFETY_THRESHOLD_USD && loss_percent > SWAP_SAFETY_THRESHOLD_PERCENT_ABOVE_1USD || loss_percent > SWAP_SAFETY_THRESHOLD_PERCENT_BELOW_1USD) {
    throw new Error("Failed to get good quotes from Defuse. We rejected the quotes obtained . Response: " + JSON.stringify(quote));
  }
  const intentMessage = {
    signer_id: settings.accountId,
    deadline: new Date(Date.now() + 3e5).toISOString(),
    intents: [createTokenDiffIntent(
      quote[best_quote_index].defuse_asset_identifier_in,
      quote[best_quote_index].defuse_asset_identifier_out,
      quote[best_quote_index].amount_in,
      quote[best_quote_index].amount_out
    )]
  };
  const messageString = JSON.stringify(intentMessage);
  const nonce = new Uint8Array(crypto2__default.default.randomBytes(32));
  const recipient = "intents.near";
  const { signature, publicKey } = await signMessage(keyPair, {
    message: messageString,
    recipient,
    nonce
  });
  await ensurePublicKeyRegistered(`ed25519:${publicKey}`);
  const intent = await publishIntent({
    quote_hashes: [quote[best_quote_index].quote_hash],
    signed_data: {
      payload: {
        message: messageString,
        nonce: Buffer.from(nonce).toString("base64"),
        recipient
      },
      standard: "nep413",
      signature: `ed25519:${signature}`,
      public_key: `ed25519:${publicKey}`
    }
  });
  if (intent.status === "OK") {
    const finalStatus = await pollIntentStatus(intent.intent_hash);
    return finalStatus;
  }
  return intent;
}
async function addPublicKeyToIntents(publicKey) {
  const keyStore = new nearApiJs.keyStores.InMemoryKeyStore();
  const keyPair = nearApiJs.utils.KeyPair.fromString(settings.secretKey);
  await keyStore.setKey(settings.networkId, settings.accountId, keyPair);
  const nearConnection = await nearApiJs.connect({
    networkId: settings.networkId,
    keyStore,
    nodeUrl: settings.nodeUrl
  });
  const account = await nearConnection.account(settings.accountId);
  console.log("Adding public key to intents contract:", publicKey);
  await account.functionCall({
    contractId: "intents.near",
    methodName: "add_public_key",
    args: {
      public_key: publicKey
    },
    gas: BigInt(FT_DEPOSIT_GAS),
    attachedDeposit: BigInt(1)
  });
}
async function getPublicKeysOf(accountId) {
  const nearConnection = await nearApiJs.connect({
    networkId: settings.networkId,
    nodeUrl: settings.nodeUrl
  });
  const account = await nearConnection.account(accountId);
  const result = await account.viewFunction({
    contractId: settings.defuseContractId,
    methodName: "public_keys_of",
    args: { account_id: accountId }
  });
  return new Set(result);
}
async function ensurePublicKeyRegistered(publicKey) {
  const existingKeys = await getPublicKeysOf(settings.accountId);
  if (!existingKeys.has(publicKey)) {
    console.log(`Public key ${publicKey} not found, registering...`);
    await addPublicKeyToIntents(publicKey);
  } else {
    console.log(`Public key ${publicKey} already registered`);
  }
}
async function withdrawFromDefuse(params) {
  try {
    const keyStore = new nearApiJs.keyStores.InMemoryKeyStore();
    const keyPair = nearApiJs.utils.KeyPair.fromString(settings.secretKey);
    await keyStore.setKey(settings.networkId, settings.accountId, keyPair);
    const network = params.network || "near";
    const nonce = new Uint8Array(crypto2__default.default.randomBytes(32));
    const token = getTokenBySymbol(params.defuse_asset_identifier_out);
    console.log("Token:", token);
    if (!token) {
      throw new Error(`Token ${params.defuse_asset_identifier_out} not found`);
    }
    const nearConnection = await nearApiJs.connect({
      networkId: settings.networkId,
      keyStore,
      nodeUrl: settings.nodeUrl
    });
    const tokenBalances = await getBalances([token], nearConnection.connection.provider, network);
    console.log("Token balances:", tokenBalances);
    const defuseAssetIdentifierOut = getDefuseAssetId(token, network);
    const defuseAssetOutAddrs = defuseAssetIdentifierOut.replace("nep141:", "");
    const tokenBalance = tokenBalances[defuseAssetIdentifierOut];
    if (tokenBalance === void 0) {
      throw new Error(`No balance found for token ${defuseAssetIdentifierOut}`);
    }
    const amountInBigInt = convertAmountToDecimals(params.exact_amount_in, token);
    const nep141balance = await getNearNep141StorageBalance({
      contractId: defuseAssetOutAddrs,
      accountId: settings.accountId
    });
    const storage_deposit = nep141balance > BigInt(FT_MINIMUM_STORAGE_BALANCE_LARGE) ? 0n : BigInt(FT_MINIMUM_STORAGE_BALANCE_LARGE);
    const intentMessage = {
      signer_id: settings.accountId,
      deadline: new Date(Date.now() + 3e5).toISOString(),
      // 5 minutes from now
      intents: [{
        intent: "ft_withdraw",
        token: defuseAssetOutAddrs,
        receiver_id: params.destination_address,
        amount: amountInBigInt.toString(),
        memo: "",
        deposit: storage_deposit.toString()
      }]
      // intents: [{
      //     intent: "native_withdraw",
      //     receiver_id: params.destination_address,
      //     amount: params.exact_amount_in,
      // }]
    };
    console.log("Intent message:", intentMessage);
    const messageString = JSON.stringify(intentMessage);
    const recipient = "intents.near";
    const { signature, publicKey } = await signMessage(keyPair, {
      message: messageString,
      recipient,
      nonce
    });
    await ensurePublicKeyRegistered(`ed25519:${publicKey}`);
    const intent = await publishIntent({
      quote_hashes: [],
      // Empty for withdrawals
      signed_data: {
        payload: {
          message: messageString,
          nonce: Buffer.from(nonce).toString("base64"),
          recipient
        },
        standard: "nep413",
        signature: `ed25519:${signature}`,
        public_key: `ed25519:${publicKey}`
      }
    });
    if (intent.status === "OK") {
      const finalStatus = await pollIntentStatus(intent.intent_hash);
      return finalStatus;
    }
    return intent;
  } catch (error) {
    console.error("Error in withdrawFromDefuse:", error);
    throw error;
  }
}

// src/providers/wallet.ts
init_cjs_shims();
var PROVIDER_CONFIG = {
  networkId: settings.networkId,
  nodeUrl: settings.nodeUrl,
  walletUrl: settings.walletUrl,
  helperUrl: settings.helperUrl,
  MAX_RETRIES: 3,
  RETRY_DELAY: 2e3};
var WalletProvider = class {
  constructor(accountId) {
    this.accountId = accountId;
    this.account = null;
    this.cache = new NodeCache__default.default({ stdTTL: 300 });
    this.keyStore = new nearApiJs.keyStores.InMemoryKeyStore();
  }
  async get() {
    try {
      return await this.getFormattedPortfolio();
    } catch (error) {
      console.error("Error in wallet provider:", error);
      return null;
    }
  }
  async connect() {
    if (this.account) return this.account;
    const secretKey = settings.secretKey;
    const publicKey = settings.publicKey;
    console.log(secretKey);
    if (!secretKey || !publicKey) {
      throw new Error("NEAR wallet credentials not configured");
    }
    const keyPair = nearApiJs.KeyPair.fromString(secretKey);
    await this.keyStore.setKey(
      PROVIDER_CONFIG.networkId,
      this.accountId,
      keyPair
    );
    const nearConnection = await nearApiJs.connect({
      networkId: PROVIDER_CONFIG.networkId,
      keyStore: this.keyStore,
      nodeUrl: PROVIDER_CONFIG.nodeUrl,
      walletUrl: PROVIDER_CONFIG.walletUrl,
      helperUrl: PROVIDER_CONFIG.helperUrl
    });
    this.account = await nearConnection.account(this.accountId);
    return this.account;
  }
  async fetchWithRetry(url, options = {}) {
    let lastError;
    for (let i = 0; i < PROVIDER_CONFIG.MAX_RETRIES; i++) {
      try {
        const response = await fetch(url, options);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
      } catch (error) {
        console.error(`Attempt ${i + 1} failed:`, error);
        lastError = error;
        if (i < PROVIDER_CONFIG.MAX_RETRIES - 1) {
          await new Promise(
            (resolve) => setTimeout(
              resolve,
              PROVIDER_CONFIG.RETRY_DELAY * Math.pow(2, i)
            )
          );
        }
      }
    }
    throw lastError;
  }
  async fetchPortfolioValue() {
    try {
      const cacheKey = `portfolio-${this.accountId}`;
      const cachedValue = this.cache.get(cacheKey);
      if (cachedValue) {
        console.log("Cache hit for fetchPortfolioValue");
        return cachedValue;
      }
      const account = await this.connect();
      const balance = await account.getAccountBalance();
      const nearBalance = nearApiJs.utils.format.formatNearAmount(
        balance.available
      );
      const nearPrice = await this.fetchNearPrice();
      const valueUsd = new BigNumber__default.default(nearBalance).times(nearPrice);
      const portfolio = {
        totalUsd: valueUsd.toString(),
        totalNear: nearBalance,
        tokens: [
          {
            name: "NEAR Protocol",
            symbol: "NEAR",
            decimals: 24,
            balance: balance.available,
            uiAmount: nearBalance,
            priceUsd: nearPrice.toString(),
            valueUsd: valueUsd.toString()
          }
        ]
      };
      this.cache.set(cacheKey, portfolio);
      return portfolio;
    } catch (error) {
      console.error("Error fetching portfolio:", error);
      throw error;
    }
  }
  async fetchNearPrice() {
    const cacheKey = "near-price";
    const cachedPrice = this.cache.get(cacheKey);
    if (cachedPrice) {
      return cachedPrice;
    }
    try {
      const response = await this.fetchWithRetry(
        "https://api.coingecko.com/api/v3/simple/price?ids=near&vs_currencies=usd"
      );
      const price = response.near.usd;
      this.cache.set(cacheKey, price);
      return price;
    } catch (error) {
      console.error("Error fetching NEAR price:", error);
      return 0;
    }
  }
  formatPortfolio(portfolio) {
    let output = `NEAR Wallet Portfolio Summary
`;
    output += `Account ID: ${this.accountId}

`;
    const totalUsdFormatted = new BigNumber__default.default(portfolio.totalUsd).toFixed(2);
    const totalNearFormatted = portfolio.totalNear;
    output += `Total Value: $${totalUsdFormatted} (${totalNearFormatted} NEAR)

`;
    output += "Token Balances:\n";
    for (const token of portfolio.tokens) {
      output += `${token.name} (${token.symbol}): ${token.uiAmount} ($${new BigNumber__default.default(token.valueUsd).toFixed(2)})
`;
    }
    output += "\nMarket Prices:\n";
    output += `NEAR: $${new BigNumber__default.default(portfolio.tokens[0].priceUsd).toFixed(2)}
`;
    return output;
  }
  async getFormattedPortfolio() {
    try {
      const portfolio = await this.fetchPortfolioValue();
      return this.formatPortfolio(portfolio);
    } catch (error) {
      console.error("Error generating portfolio report:", error);
      return "Unable to fetch wallet information. Please try again later.";
    }
  }
};
/*! Bundled license information:

js-sha256/src/sha256.js:
  (**
   * [js-sha256]{@link https://github.com/emn178/js-sha256}
   *
   * @version 0.9.0
   * @author Chen, Yi-Cyuan [emn178@gmail.com]
   * @copyright Chen, Yi-Cyuan 2014-2017
   * @license MIT
   *)
*/

exports.WalletProvider = WalletProvider;
exports.crossChainSwap = crossChainSwap;
exports.withdrawFromDefuse = withdrawFromDefuse;
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map