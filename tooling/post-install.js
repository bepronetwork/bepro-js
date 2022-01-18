const fs = require('fs');

if (fs.existsSync('dist')) {
  console.log(`bepro-js sdk was already built.`)
  return 0;
}

async function buildSolution() {
  try {
    console.log(`Building bepro-js sdk`);
    const {execSync} = require("child_process");

    if (!fs.existsSync('node_modules'))
      await execSync(`npm install .`, {stdio: 'inherit'});

    await execSync(`npm run build`, {stdio: 'inherit'});

    console.log(`Built bepro-js sdk`);
  } catch (e) {
    console.log(e);
    console.log(`\nFailed to build bepro-js sdk, please issue: npm explore bepro-js -- npm run build`);
  }
}

(async () => await buildSolution())();
