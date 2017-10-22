/* eslint-disable no-console */

const { execSync } = require('child_process');

const checkVersion = (command, name, expected) => {
  let version = null;
  try {
    version = execSync(command).toString().replace('v', '').trim();
  } catch (e) {
    console.log(`Unable to get ${name} version!  😱`);
    console.log('');
    process.exit(1);
  }
  if (version !== expected) {
    const contributingLink = 'https://github.com/NimaSoroush/differencify/blob/master/CONTRIBUTING.md';
    console.log(`Expected ${name} version ${expected}, but got ${version}.  😱`);
    console.log('');
    console.log(`Please follow Differencify's contributing guide (see ${contributingLink}).`);
    console.log('');
    process.exit(1);
  }
};

console.log('Checking Node & npm versions...');
console.log('');

checkVersion('node --version', 'Node', '8.6.0');
checkVersion('npm --version', 'npm', '5.3.0');

console.log('All good.  👍');
console.log('');
