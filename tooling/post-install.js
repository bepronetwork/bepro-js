const fs = require('fs');
const path = require('path');

if (fs.existsSync('dist')) {
  console.log(`bepro-js sdk was already built.`)
  return 0;
}

async function buildSolution() {
  try {
    console.log(`Building bepro-js sdk`);
    const {execSync} = require("child_process");

    const pkg = JSON.parse(fs.readFileSync(`package.json`, 'utf8'));
    const isbepro = pkg.name === `bepro-js`;

    console.log(`cwd`, path.resolve());

    const node_modules = fs.existsSync('node_modules');
    const bepro_cwd = isbepro && path.resolve() || path.resolve(`node_modules`, `bepro-js`, `node_modules`);
    const bepro_node_modules = fs.existsSync(isbepro && `node_modules` || bepro_cwd);

    if (!node_modules || !isbepro && node_modules && !bepro_node_modules)
      await execSync(`npm install .`, {stdio: 'inherit', cwd: bepro_cwd});

    await execSync(`npm run build`, {stdio: 'inherit', ... !isbepro && {cwd: bepro_cwd} || {}});

    console.log(`Built bepro-js sdk`);
    return 0;
  } catch (e) {
    console.log(e);
    console.log(`\nFailed to build bepro-js sdk, please issue: npm explore bepro-js -- npm run build`);
    return 1;
  }
}

(async () => await buildSolution())();
