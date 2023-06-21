const fs = require("fs");

const packageJsonPath = './package.json';

const packageJsonContent = JSON.parse(fs.readFileSync(packageJsonPath))

const branch = process.env.CI_BRANCH.replace(/\/|_/g, '-').replace(/^refs-heads-/, '');
const commitSha = process.env.COMMIT_SHA.substring(0, 7);
const currentDate = new Date();
const date = currentDate.toISOString().replace(/:/g, '');

console.log(`branch: ${branch}`);
console.log(`commitSha: ${commitSha}`);

if(branch != 'main') {
  // Don't add a tag if we are on main, just go with the plain version.
  packageJsonContent.version = `${packageJsonContent.version}-${branch}-${date}-${commitSha}`;
}
console.log(`Package version: ${packageJsonContent.version}`);

fs.writeFileSync(packageJsonPath, JSON.stringify(packageJsonContent, null, 2), 'utf8');

// Also write a version file so we can report the version to Sentry.
const versionJsonPath = './src/version.json';
const versionJsonContent = { version: packageJsonContent.version}
fs.writeFileSync(versionJsonPath, JSON.stringify(versionJsonContent, null, 2), 'utf8');
