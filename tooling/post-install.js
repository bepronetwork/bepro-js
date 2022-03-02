const fs = require('fs');
const path = require('path');
const childProcess = require("child_process");

const DIST_PATH = `dist`;

function buildSolution() {
  try {

    const wasBuilt = fs.existsSync(path.resolve(DIST_PATH));
    const hasDependencies = fs.existsSync(path.resolve(`node_modules`, `truffle`));

    if (wasBuilt) {
      console.log(`bepro-js sdk was already built.`)
      return 0;
    }

    console.log(`Building bepro-js sdk`);
    console.time(`Building`);

    if (!hasDependencies) {
      console.time(`Install dependencies`)
      childProcess.execSync(`npm install .`);
      console.timeEnd(`Install dependencies`)
    }

    childProcess.execSync(`npm run build`);
    console.log(`Built bepro-js sdk`);
    console.timeEnd(`Building`);

    return 0;
  } catch (e) {
    console.log(e);
    console.log(`\nFailed to build bepro-js sdk, please issue: npm explore bepro-js -- npm run build`);
    return 1;
  }
}

buildSolution();
