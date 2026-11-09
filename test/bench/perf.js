/*!
  SPDX-FileCopyrightText: 2013 Lovell Fuller and others
  SPDX-License-Identifier: Apache-2.0
*/

const fs = require('node:fs');
const { execSync } = require('node:child_process');

const async = require('async');
const Benchmark = require('benchmark');

// Contenders
const sharp = require('../../');

const fixtures = require('../fixtures');

const outputJpg = fixtures.path('output.jpg');
const outputPng = fixtures.path('output.png');
const outputWebP = fixtures.path('output.webp');

const width = 720;
const height = 588;
const heightPng = 540;

// Disable libvips cache to ensure tests are as fair as they can be
sharp.cache(false);

// Spawn one thread per physical CPU core
const physicalCores = Number(execSync('lscpu -p | grep -E -v "^#" | sort -u -t, -k 2,4 | wc -l', { encoding: 'utf-8' }).trim());
console.log(`Detected ${physicalCores} physical cores`);
sharp.concurrency(physicalCores);

async.series({
  jpeg: (callback) => {
    const inputJpgBuffer = fs.readFileSync(fixtures.inputJpg);
    const jpegSuite = new Benchmark.Suite('jpeg');
    // sharp
    jpegSuite.add('sharp-buffer-file', {
      defer: true,
      fn: (deferred) => {
        sharp(inputJpgBuffer)
          .resize(width, height)
          .toFile(outputJpg, (err) => {
            if (err) {
              throw err;
            } else {
              deferred.resolve();
            }
          });
      }
    }).add('sharp-buffer-buffer', {
      defer: true,
      fn: (deferred) => {
        sharp(inputJpgBuffer)
          .resize(width, height)
          .toBuffer((err) => {
            if (err) {
              throw err;
            } else {
              deferred.resolve();
            }
          });
      }
    }).add('sharp-buffer-uint8array', {
      defer: true,
      fn: (deferred) => {
        sharp(inputJpgBuffer)
          .resize(width, height)
          .toUint8Array()
          .then(() => {
            deferred.resolve();
          })
          .catch((err) => {
            throw err;
          });
      }
    }).add('sharp-file-file', {
      defer: true,
      fn: (deferred) => {
        sharp(fixtures.inputJpg)
          .resize(width, height)
          .toFile(outputJpg, (err) => {
            if (err) {
              throw err;
            } else {
              deferred.resolve();
            }
          });
      }
    }).add('sharp-stream-stream', {
      defer: true,
      fn: (deferred) => {
        const readable = fs.createReadStream(fixtures.inputJpg);
        const writable = fs.createWriteStream(outputJpg);
        writable.on('finish', () => {
          deferred.resolve();
        });
        const pipeline = sharp()
          .resize(width, height);
        readable.pipe(pipeline).pipe(writable);
      }
    }).add('sharp-file-buffer', {
      defer: true,
      fn: (deferred) => {
        sharp(fixtures.inputJpg)
          .resize(width, height)
          .toBuffer((err) => {
            if (err) {
              throw err;
            } else {
              deferred.resolve();
            }
          });
      }
    }).add('sharp-file-uint8array', {
      defer: true,
      fn: (deferred) => {
        sharp(fixtures.inputJpg)
          .resize(width, height)
          .toUint8Array()
          .then(() => {
            deferred.resolve();
          })
          .catch((err) => {
            throw err;
          });
      }
    }).add('sharp-promise', {
      defer: true,
      fn: (deferred) => {
        sharp(inputJpgBuffer)
          .resize(width, height)
          .toBuffer()
          .then(() => {
            deferred.resolve();
          })
          .catch((err) => {
            throw err;
          });
      }
    }).on('cycle', (event) => {
      console.log(`jpeg ${String(event.target)}`);
    }).on('complete', function () {
      callback(null, this.filter('fastest').map('name'));
    }).run();
  },
  // Effect of applying operations
  operations: (callback) => {
    const inputJpgBuffer = fs.readFileSync(fixtures.inputJpg);
    const operationsSuite = new Benchmark.Suite('operations');
    operationsSuite.add('sharp-sharpen-mild', {
      defer: true,
      fn: (deferred) => {
        sharp(inputJpgBuffer)
          .resize(width, height)
          .sharpen()
          .toBuffer((err) => {
            if (err) {
              throw err;
            } else {
              deferred.resolve();
            }
          });
      }
    }).add('sharp-sharpen-radius', {
      defer: true,
      fn: (deferred) => {
        sharp(inputJpgBuffer)
          .resize(width, height)
          .sharpen(3, 1, 3)
          .toBuffer((err) => {
            if (err) {
              throw err;
            } else {
              deferred.resolve();
            }
          });
      }
    }).add('sharp-blur-mild', {
      defer: true,
      fn: (deferred) => {
        sharp(inputJpgBuffer)
          .resize(width, height)
          .blur()
          .toBuffer((err) => {
            if (err) {
              throw err;
            } else {
              deferred.resolve();
            }
          });
      }
    }).add('sharp-blur-radius', {
      defer: true,
      fn: (deferred) => {
        sharp(inputJpgBuffer)
          .resize(width, height)
          .blur(3)
          .toBuffer((err) => {
            if (err) {
              throw err;
            } else {
              deferred.resolve();
            }
          });
      }
    }).add('sharp-gamma', {
      defer: true,
      fn: (deferred) => {
        sharp(inputJpgBuffer)
          .resize(width, height)
          .gamma()
          .toBuffer((err) => {
            if (err) {
              throw err;
            } else {
              deferred.resolve();
            }
          });
      }
    }).add('sharp-normalise', {
      defer: true,
      fn: (deferred) => {
        sharp(inputJpgBuffer)
          .resize(width, height)
          .normalise()
          .toBuffer((err) => {
            if (err) {
              throw err;
            } else {
              deferred.resolve();
            }
          });
      }
    }).add('sharp-greyscale', {
      defer: true,
      fn: (deferred) => {
        sharp(inputJpgBuffer)
          .resize(width, height)
          .greyscale()
          .toBuffer((err) => {
            if (err) {
              throw err;
            } else {
              deferred.resolve();
            }
          });
      }
    }).add('sharp-greyscale-gamma', {
      defer: true,
      fn: (deferred) => {
        sharp(inputJpgBuffer)
          .resize(width, height)
          .gamma()
          .greyscale()
          .toBuffer((err) => {
            if (err) {
              throw err;
            } else {
              deferred.resolve();
            }
          });
      }
    }).add('sharp-progressive', {
      defer: true,
      fn: (deferred) => {
        sharp(inputJpgBuffer)
          .resize(width, height)
          .jpeg({ progressive: true })
          .toBuffer((err) => {
            if (err) {
              throw err;
            } else {
              deferred.resolve();
            }
          });
      }
    }).add('sharp-without-chroma-subsampling', {
      defer: true,
      fn: (deferred) => {
        sharp(inputJpgBuffer)
          .resize(width, height)
          .jpeg({ chromaSubsampling: '4:4:4' })
          .toBuffer((err) => {
            if (err) {
              throw err;
            } else {
              deferred.resolve();
            }
          });
      }
    }).add('sharp-rotate', {
      defer: true,
      fn: (deferred) => {
        sharp(inputJpgBuffer)
          .rotate(90)
          .resize(width, height)
          .toBuffer((err) => {
            if (err) {
              throw err;
            } else {
              deferred.resolve();
            }
          });
      }
    }).add('sharp-without-simd', {
      defer: true,
      fn: (deferred) => {
        sharp.simd(false);
        sharp(inputJpgBuffer)
          .resize(width, height)
          .toBuffer((err) => {
            sharp.simd(true);
            if (err) {
              throw err;
            } else {
              deferred.resolve();
            }
          });
      }
    }).add('sharp-random-access-read', {
      defer: true,
      fn: (deferred) => {
        sharp(inputJpgBuffer, { sequentialRead: false })
          .resize(width, height)
          .toBuffer((err) => {
            if (err) {
              throw err;
            } else {
              deferred.resolve();
            }
          });
      }
    }).add('sharp-crop-entropy', {
      defer: true,
      fn: (deferred) => {
        sharp(inputJpgBuffer)
          .resize(width, height, {
            fit: 'cover',
            position: sharp.strategy.entropy
          })
          .toBuffer((err) => {
            if (err) {
              throw err;
            } else {
              deferred.resolve();
            }
          });
      }
    }).add('sharp-crop-attention', {
      defer: true,
      fn: (deferred) => {
        sharp(inputJpgBuffer)
          .resize(width, height, {
            fit: 'cover',
            position: sharp.strategy.attention
          })
          .toBuffer((err) => {
            if (err) {
              throw err;
            } else {
              deferred.resolve();
            }
          });
      }
    }).on('cycle', (event) => {
      console.log(`operations ${String(event.target)}`);
    }).on('complete', function () {
      callback(null, this.filter('fastest').map('name'));
    }).run();
  },
  // Comparative speed of kernels
  kernels: (callback) => {
    const inputJpgBuffer = fs.readFileSync(fixtures.inputJpg);
    (new Benchmark.Suite('kernels')).add('sharp-cubic', {
      defer: true,
      fn: (deferred) => {
        sharp(inputJpgBuffer)
          .resize(width, height, { kernel: 'cubic' })
          .toBuffer((err) => {
            if (err) {
              throw err;
            } else {
              deferred.resolve();
            }
          });
      }
    }).add('sharp-lanczos2', {
      defer: true,
      fn: (deferred) => {
        sharp(inputJpgBuffer)
          .resize(width, height, { kernel: 'lanczos2' })
          .toBuffer((err) => {
            if (err) {
              throw err;
            } else {
              deferred.resolve();
            }
          });
      }
    }).add('sharp-lanczos3', {
      defer: true,
      fn: (deferred) => {
        sharp(inputJpgBuffer)
          .resize(width, height, { kernel: 'lanczos3' })
          .toBuffer((err) => {
            if (err) {
              throw err;
            } else {
              deferred.resolve();
            }
          });
      }
    }).add('sharp-mks2013', {
      defer: true,
      fn: (deferred) => {
        sharp(inputJpgBuffer)
          .resize(width, height, { kernel: 'mks2013' })
          .toBuffer((err) => {
            if (err) {
              throw err;
            } else {
              deferred.resolve();
            }
          });
      }
    }).add('sharp-mks2021', {
      defer: true,
      fn: (deferred) => {
        sharp(inputJpgBuffer)
          .resize(width, height, { kernel: 'mks2021' })
          .toBuffer((err) => {
            if (err) {
              throw err;
            } else {
              deferred.resolve();
            }
          });
      }
    }).on('cycle', (event) => {
      console.log(`kernels ${String(event.target)}`);
    }).on('complete', function () {
      callback(null, this.filter('fastest').map('name'));
    }).run();
  },
  // PNG
  png: (callback) => {
    const inputPngBuffer = fs.readFileSync(fixtures.inputPngAlphaPremultiplicationLarge);
    const pngSuite = new Benchmark.Suite('png');
    const minSamples = 64;
    // sharp
    pngSuite.add('sharp-buffer-file', {
      defer: true,
      minSamples,
      fn: (deferred) => {
        sharp(inputPngBuffer)
          .resize(width, heightPng)
          .png({ compressionLevel: 6 })
          .toFile(outputPng, (err) => {
            if (err) {
              throw err;
            } else {
              deferred.resolve();
            }
          });
      }
    }).add('sharp-buffer-buffer', {
      defer: true,
      minSamples,
      fn: (deferred) => {
        sharp(inputPngBuffer)
          .resize(width, heightPng)
          .png({ compressionLevel: 6 })
          .toBuffer((err) => {
            if (err) {
              throw err;
            } else {
              deferred.resolve();
            }
          });
      }
    }).add('sharp-file-file', {
      defer: true,
      minSamples,
      fn: (deferred) => {
        sharp(fixtures.inputPngAlphaPremultiplicationLarge)
          .resize(width, heightPng)
          .png({ compressionLevel: 6 })
          .toFile(outputPng, (err) => {
            if (err) {
              throw err;
            } else {
              deferred.resolve();
            }
          });
      }
    }).add('sharp-file-buffer', {
      defer: true,
      minSamples,
      fn: (deferred) => {
        sharp(fixtures.inputPngAlphaPremultiplicationLarge)
          .resize(width, heightPng)
          .png({ compressionLevel: 6 })
          .toBuffer((err) => {
            if (err) {
              throw err;
            } else {
              deferred.resolve();
            }
          });
      }
    }).add('sharp-progressive', {
      defer: true,
      minSamples,
      fn: (deferred) => {
        sharp(inputPngBuffer)
          .resize(width, heightPng)
          .png({ compressionLevel: 6, progressive: true })
          .toBuffer((err) => {
            if (err) {
              throw err;
            } else {
              deferred.resolve();
            }
          });
      }
    }).add('sharp-adaptiveFiltering', {
      defer: true,
      minSamples,
      fn: (deferred) => {
        sharp(inputPngBuffer)
          .resize(width, heightPng)
          .png({ adaptiveFiltering: true, compressionLevel: 6 })
          .toBuffer((err) => {
            if (err) {
              throw err;
            } else {
              deferred.resolve();
            }
          });
      }
    }).add('sharp-compressionLevel=9', {
      defer: true,
      minSamples,
      fn: (deferred) => {
        sharp(inputPngBuffer)
          .resize(width, heightPng)
          .png({ compressionLevel: 9 })
          .toBuffer((err) => {
            if (err) {
              throw err;
            } else {
              deferred.resolve();
            }
          });
      }
    });
    pngSuite.on('cycle', (event) => {
      console.log(`png ${String(event.target)}`);
    }).on('complete', function () {
      callback(null, this.filter('fastest').map('name'));
    }).run();
  },
  // WebP
  webp: (callback) => {
    const inputWebPBuffer = fs.readFileSync(fixtures.inputWebP);
    (new Benchmark.Suite('webp')).add('sharp-buffer-file', {
      defer: true,
      fn: (deferred) => {
        sharp(inputWebPBuffer)
          .resize(width, height)
          .toFile(outputWebP, (err) => {
            if (err) {
              throw err;
            } else {
              deferred.resolve();
            }
          });
      }
    }).add('sharp-buffer-buffer', {
      defer: true,
      fn: (deferred) => {
        sharp(inputWebPBuffer)
          .resize(width, height)
          .toBuffer((err) => {
            if (err) {
              throw err;
            } else {
              deferred.resolve();
            }
          });
      }
    }).add('sharp-file-file', {
      defer: true,
      fn: (deferred) => {
        sharp(fixtures.inputWebP)
          .resize(width, height)
          .toFile(outputWebP, (err) => {
            if (err) {
              throw err;
            } else {
              deferred.resolve();
            }
          });
      }
    }).add('sharp-file-buffer', {
      defer: true,
      fn: (deferred) => {
        sharp(fixtures.inputWebP)
          .resize(width, height)
          .toBuffer((err) => {
            if (err) {
              throw err;
            } else {
              deferred.resolve();
            }
          });
      }
    }).on('cycle', (event) => {
      console.log(`webp ${String(event.target)}`);
    }).on('complete', function () {
      callback(null, this.filter('fastest').map('name'));
    }).run();
  }
}, (err) => {
  if (err) {
    throw err;
  }
  console.dir(sharp.cache());
});
