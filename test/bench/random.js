/*!
  SPDX-FileCopyrightText: 2013 Lovell Fuller and others
  SPDX-License-Identifier: Apache-2.0
*/

const assert = require('node:assert');
const Benchmark = require('benchmark');

const sharp = require('../../');
const fixtures = require('../fixtures');

sharp.cache(false);

const min = 320;
const max = 960;

const randomDimension = () => Math.ceil((Math.random() * (max - min)) + min);

new Benchmark.Suite('random').add('sharp', {
  defer: true,
  fn: (deferred) => {
    sharp(fixtures.inputJpg)
      .resize(randomDimension(), randomDimension())
      .toBuffer((err, buffer) => {
        if (err) {
          throw err;
        } else {
          assert.notStrictEqual(null, buffer);
          deferred.resolve();
        }
      });
  }
}).on('cycle', (event) => {
  console.log(String(event.target));
}).run();
