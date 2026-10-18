'use strict';
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const output = path.join(root, 'www');
fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });
for (const file of ['index.html', 'styles.css', 'app.js', 'build-version.js']) fs.copyFileSync(path.join(root, file), path.join(output, file));
console.log('Prepared Nácar Live web assets for Capacitor.');
