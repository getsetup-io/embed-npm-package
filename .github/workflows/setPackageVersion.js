const fs = require("fs");

const packageJsonPath = './package.json';

const packageJsonContent = JSON.parse(fs.readFileSync(packageJsonPath));

const gitRef = process.env.REF_NAME.replace(/\/|_/g, '-');
const commitSha = process.env.COMMIT_SHA.substring(0, 7);
const currentDate = new Date();
const date = currentDate.toISOString().replace(/:/g, '');

console.log(`Git Ref: ${gitRef}`);
console.log(`commitSha: ${commitSha}`);
console.log(`IS_PRERELEASE: ${process.env.IS_PRERELEASE}`);

if (process.env.IS_PRERELEASE === 'true') {
  // Only add a tag to the version if we are releasing a prerelease.
  packageJsonContent.version = `${packageJsonContent.version}-${gitRef}-${date}-${commitSha}`;
}
console.log(`Package version: ${packageJsonContent.version}`);

fs.writeFileSync(packageJsonPath, JSON.stringify(packageJsonContent, null, 2), 'utf8');

// Also write a version file so we can report the version to Sentry.
const versionJsonPath = './src/version.json';
const versionJsonContent = { version: packageJsonContent.version };
fs.writeFileSync(versionJsonPath, JSON.stringify(versionJsonContent, null, 2), 'utf8');
