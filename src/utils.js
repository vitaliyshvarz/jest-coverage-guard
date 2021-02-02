const appRoot = require('app-root-path');
const config = require(appRoot + '/coverage.guard.config.json');
const path = require('path');

function getCommitHashes(commits) {
    return commits.map(commit => commit.hash).reverse();
}

function getAppFiles(files, excludeFiles, filesToSkip) {
    // we can use startsWith and endsWith since this script is expected only in node
    return files.filter(
        filePath =>
            filePath.startsWith(config.appRootRelativeToGitRepo) &&
            !excludeFiles.some(excludeFile => new RegExp(excludeFile).test(path.basename(filePath))),
            !filesToSkip.includes(filePath)
    );

}

function getReportData(reportForCurrentFile) {
    const statements = reportForCurrentFile.results.statements.pct;
    const branches = reportForCurrentFile.results.branches.pct;
    const functions = reportForCurrentFile.results.functions.pct;
    const lines = reportForCurrentFile.results.lines.pct;

    return {
        statements,
        branches,
        functions,
        lines
    };
}

module.exports = {
    getCommitHashes,
    getReportData,
    getAppFiles
};
