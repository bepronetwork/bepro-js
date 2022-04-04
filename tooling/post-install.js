const fs = require('fs');
const path = require('path');
const childProcess = require("child_process");

const DIST_PATH = `dist`;


try {

  console.log(`BEPRO post-install check`);

  const isSelf = !path.resolve().includes(`node_modules`);
  const _exists = (file = []) => fs.existsSync(path.resolve(...file))

  const isBuilding = _exists([`building.tmp`]);
  const wasBuilt = _exists([DIST_PATH]);
  const hasDependencies = _exists([`node_modules`, `truffle`]);

  console.table({isSelf, isBuilding, wasBuilt, hasDependencies, cwd: path.resolve()});

  if (isSelf) {
    console.log(`Post install not needed.`);
    return 0;
  }

  const execOptions = {
    stdio: 'inherit',
    cwd: path.resolve(),
  }

  if (wasBuilt) {
    console.log(`dappkit sdk was already built.`)
    return 0;
  }

  if (isBuilding)
    return 0;
  else if (!isBuilding)
    fs.writeFileSync(path.resolve(`building.tmp`), `${+new Date()}`, `utf-8`);

  if (!hasDependencies) {
    console.log(`Missing dependencies`);
    console.time(`Installed dependencies`);
    childProcess.execSync(`npm --production=false install  .`, execOptions);
    console.timeEnd(`Installed dependencies`);
  }

  console.log(`Building solution`);
  console.time(`Built`);

  childProcess.execSync(`npm run compile`, execOptions);
  childProcess.execSync(`npm run tsc -- -p ./tsconfig.json`, execOptions);
  fs.cpSync(`./build`, `./dist/build`, {recursive: true});
  childProcess.execSync(`npm run tscpaths -- -p ./tsconfig.json -s ./ -o ./dist`, execOptions);
  fs.rmSync(path.resolve(`building.tmp`), {force: true,});

  console.timeEnd(`Built`);


  return 0;
} catch (e) {
  console.log(e);
  console.log(`\nFailed to build dappkit sdk, please issue: npm explore @taikai/dappkit-- npm run build`);
  return 1;
}

