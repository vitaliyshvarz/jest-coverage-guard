const appRoot = require('app-root-path');
const config = require(appRoot + '/coverage.guard.config.json');

function getCommitHashes(commits) {
    return commits.map(commit => commit.hash).reverse();
}

function getAppFiles(files, filesToSkip) {
    // we can use startsWith and endsWith since this script is expected only in node
    return files.filter(
        filePath =>
            filePath.startsWith(config.appRoot) &&
            !filePath.endsWith('-test.js') && // exclude test files
            !filePath.endsWith('.less') && // exclude less files
            // the filesToSkip array contains an array of file urls WITHOUT user-frontend/
            !filesToSkip.includes(filePath.replace(appRoot, ''))
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
