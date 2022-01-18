const fs = require('fs');
const {exec} = require("child_process");

if (fs.existsSync('build')) {
  console.log(`bepro-js sdk was already built.`)
  return;
}

(async function buildSolution() {
  try {
    await exec(`npm install .`);
    await exec(`npm run build`);
    console.log(`Build bepro-js sdk.`);
  } catch (e) {
    console.log(e);
    console.log(`\nFailed to build bepro-js sdk, please issue: npm explore bepro-js -- npm run build`);
  }
})();
