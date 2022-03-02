const fs = require('fs');
const path = require('path');

const DIST_PATH = `dist`;

function buildSolution() {
  try {

    const {execSync} = require("child_process");
    const cwd = path.resolve();

    const wasBuilt = fs.existsSync(path.resolve(DIST_PATH));
    const hasDependencies = fs.existsSync(path.resolve(`node_modules`, `truffle`));

    if (wasBuilt) {
      console.log(`bepro-js sdk was already built.`)
      return 0;
    }

    console.log(`Building bepro-js sdk`);

    if (!hasDependencies)
      execSync(`npm install .`, {stdio: 'inherit', cwd});

    execSync(`npm run build`, {stdio: 'inherit', cwd});

    console.log(`Built bepro-js sdk`);
    return 0;
  } catch (e) {
    console.log(e);
    console.log(`\nFailed to build bepro-js sdk, please issue: npm explore bepro-js -- npm run build`);
    return 1;
  }
}

buildSolution();