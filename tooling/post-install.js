const fs = require('fs');
const path = require('path');
const childProcess = require("child_process");

const DIST_PATH = `dist`;

function buildSolution() {
  try {

    const isSelf = !fs.existsSync(path.resolve(`node_modules`, `bepro-js`));
    const localPath = !isSelf && [`node_modules`, `bepro-js`] || [];

    const explore = (command = ``) => (!isSelf && `npm explore bepro-js -- ` || ``) + command;
    const isBuilding = fs.existsSync(path.resolve(... localPath, `building.tmp`));
    const wasBuilt = fs.existsSync(path.resolve(... localPath, DIST_PATH));
    const hasDependencies = fs.existsSync(path.resolve(... localPath, `node_modules`, `truffle`));

    const execOptions = {
      stdio: 'inherit',
    }

    if (wasBuilt) {
      console.log(`bepro-js sdk was already built.`)
      return 0;
    }

    if (isBuilding)
      return 0;
    else if (!isBuilding)
      fs.writeFileSync(path.resolve(...localPath, `building.tmp`), `${+new Date()}`, `utf-8`);

    console.log(`Building bepro-js sdk`);
    console.time(`Building`);

    if (!hasDependencies) {
      console.time(`Install dependencies`);
      childProcess.execSync(explore(`npm install .`), execOptions);
      console.timeEnd(`Install dependencies`);
    }

    childProcess.execSync(explore(`npm run build`, execOptions));

    console.timeEnd(`Building`);

    fs.rmSync(path.resolve(...localPath, `building.tmp`), {force: true,})

    return 0;
  } catch (e) {
    console.log(e);
    console.log(`\nFailed to build bepro-js sdk, please issue: npm explore bepro-js -- npm run build`);
    return 1;
  }
}

buildSolution();
