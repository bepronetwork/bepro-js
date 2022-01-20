const fs = require('fs');

if (fs.existsSync('dist')) {
  console.log(`bepro-js sdk was already built.`)
  return 0;
}

async function buildSolution() {
  try {
    console.log(`Building bepro-js sdk`);
    const {execSync} = require("child_process");

    await execSync(`npm install .`, {stdio: 'inherit'});
    await execSync(`npm run build`, {stdio: 'inherit'});

    console.log(`Built bepro-js sdk`);
    return 0;
  } catch (e) {
    console.log(e);
    console.log(`\nFailed to build bepro-js sdk, please issue: npm explore bepro-js -- npm run build`);
    return 1;
  }
}

(async () => await buildSolution())();
