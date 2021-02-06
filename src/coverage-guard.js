/*eslint no-console: 0 */
const git = require('simple-git/promise');

const ResultsTable = require('./results-table');
const ErrorTable = require('./error-table');
const {
    getCommitHashes,
    getReportData,
    getAppFiles
} = require('./utils');
const {
    YELLOW_LOG_ERR,
    RED_BG_LOG_ERR,
    GREEN_LOG_ERR
} = require('./constants');

class CoverageGuard {
    constructor(coverageResults, isWatchMode, config) {
        this.isWatchMode = isWatchMode;
        this.coverageResults = coverageResults;
        this.currentTicketNumber = '';
        this.commitHashes = [];
        this.resultsTable = new ResultsTable();
        this.errorTable = new ErrorTable();

        this.newFilesNotAdded = [];
        this.newFilesAdded = [];
        this.modifiedFilesNotAdded = [];
        this.modifiedFilesAdded = [];
        this.filesToSkip = [];
        this.config = config;
    }

    async start() {
        await this.getFilesToExclude();
        try {
            await this.checkCoverageForComittedFiles();
            if (process.env.CI === true || process.env.CI === 'true') {
                await this.checkCoverageForUncomittedFiles();
            }
            this.finalizeCoverage();
        } catch (err) {
            console.error(err);
        }
    }

    async checkCoverageForComittedFiles() {
        await this.getCurrentTicketNumber();
        if (!this.currentTicketNumber) {
            return;
        }

        // get all commits containing current ticket number on current branch
        let commits;
        try {
            commits = await git().log(['--grep=' + this.currentTicketNumber + '', '--first-parent']);
        } catch (error) {
            console.warn('No commits found');
            return;
        }

        // save commit hashes from commits with current ticketnumber
        this.setCommitHashes(commits);

        let allChangedFiles;

        if (this.commitHashes.length > 1) {
            const results = '';

            const allChangedFilesArray = await Promise.all(this.commitHashes.map(async (commit) => {
                const result = await git().raw(['diff-tree', '--no-commit-id', '--name-status', '-r', commit]);

                if (typeof result === 'string' && result.length > 0) {
                    return results.concat(result);
                }
            }));

            allChangedFiles = allChangedFilesArray.join('');
        } else if (this.commitHashes.length === 1) {
            // if there is only one commit - get changed files from 1st generation ancestor of HEAD
            allChangedFiles = await git().raw(['diff', '--name-status', 'HEAD~1']);

        } else {
            console.warn('Error getting changed files for:', commits);

            return;
        }

        console.log(`Getting files from ${this.commitHashes.length} commits
                    for feature: ${this.currentTicketNumber}`);
        console.log('Files changed in these commits: \n', allChangedFiles);

        if (!allChangedFiles) {
            return;
        }

        const changedFilesWithStatuses = allChangedFiles.split('\n')
            .map(fileString => ({
                status: fileString.split('\t')[0],
                path: fileString.split('\t')[1]
            }));
        const addedFiles = changedFilesWithStatuses
            .filter(fileObj => fileObj.status === 'A')
            .map(fileObj => fileObj.path)
            .filter(filePath => filePath && filePath.length);

        const modifiedFiles = changedFilesWithStatuses
            .filter(fileObj => fileObj.status === 'M')
            .map(fileObj => fileObj.path)
            .filter(filePath => filePath && filePath.length);

        this.checkCoverageOnFiles(addedFiles, this.config.addedFilesQualityGate);
        this.checkCoverageOnFiles(modifiedFiles, this.config.changedFilesQualityGate);

        this.showCommitedResult();
        this.clearTablesData();
    }

    async checkCoverageForUncomittedFiles() {
        await this.getCurrentTicketNumber();
        // Now check local changed files
        const statusObject = await git().status();

        this.getLocalStatus(statusObject);

        this.processUncomittedFiles();

        this.showResults();
    }

    async getFilesToExclude() {
        const results = await Promise.all(this.config.excludeKeywords.map(async keyword => {
            const resultString = await git().raw(['grep', '-l', '--full-name', keyword]);
            // grep returns a string we need to split it
            if (resultString && resultString.length) {
                return resultString.split('\n');
            }

            return [];
        }));

        // merge result array to one array
        this.filesToSkip = [].concat.apply([], results);
    }

    async getCurrentTicketNumber() {
        if (process.env.CI === 'true' || process.env.CI === true) {
            this.currentTicketNumber = this.getTicketNumberCI();
            return Promise.resolve();
        }
        // get current brnach name
        const currentBranch = await git().raw(['rev-parse', '--abbrev-ref', 'HEAD']);
        // set current ticket number eg. UB-12345
        this.setCurrentTicketNumber(currentBranch);
    }

    finalizeCoverage() {
        if (this.errorTable.containsErrors) {
            console.error(RED_BG_LOG_ERR, '\n You failed coverage!');

            // we should fail only if not in watch mode
            if (!this.isWatchMode) {
                process.exit(1, 'Coverage quality gate failed');
            }
        } else {
            console.log(GREEN_LOG_ERR, 'Well done Comrade!');
        }
    }

    clearTablesData() {
        this.resultsTable.clear();
        this.errorTable.clear();
    }

    showCommitedResult() {
        this.resultsTable.showCommited();
        this.errorTable.showCommited();
    }

    showResults() {
        this.resultsTable.show();
        this.errorTable.show();
    }

    setCurrentTicketNumber(currentBranch) {
        this.currentTicketNumber = this.getTicketNumberLocal(currentBranch);
    }

    getTicketNumberLocal(currentBranch) {
        const { featureNameRegExp } = this.config;
        const regExp = new RegExp(featureNameRegExp.body, featureNameRegExp.flags);
        const ticketNumberMatches = currentBranch.match(new RegExp(regExp));
        return ticketNumberMatches !== null && ticketNumberMatches.length && ticketNumberMatches[0];
    }

    getBranchNameCI() {
        // gitLab
        if (process.env.CI_COMMIT_REF_NAME) {
            return process.env.CI_COMMIT_REF_NAME;
        }
        // github
        if (process.env.GITHUB_HEAD_REF) {
            return process.env.GITHUB_HEAD_REF;
        }

        return '';
    }

    getTicketNumberCI() {
        const branch = this.getBranchNameCI();
        const { featureNameRegExp } = this.config;
        const regExp = new RegExp(featureNameRegExp.body, featureNameRegExp.flags);
        const ticketNumberMatches = branch.match(regExp);
        return ticketNumberMatches !== null && ticketNumberMatches.length && ticketNumberMatches[0];
    }

    setCommitHashes(commits) {
        this.commitHashes = getCommitHashes(commits.all);
    }

    getLocalStatus(statusSummary) {
        this.newFilesNotAdded = statusSummary.not_added;
        this.newFilesAdded = statusSummary.created;
        this.modifiedFilesNotAdded = statusSummary.modified;
        this.modifiedFilesAdded = statusSummary.staged;
    }

    processUncomittedFiles() {
        // if no files are changed - do nothing
        if (!this.newFilesNotAdded.length &&
            !this.newFilesAdded.length &&
            !this.modifiedFilesNotAdded.length &&
            !this.modifiedFilesAdded.length) {
            return;
        }

        if (this.newFilesNotAdded.length) {
            this.checkCoverageOnFiles(this.newFilesNotAdded, this.config.addedFilesQualityGate);
        }

        if (this.newFilesAdded.length) {
            this.checkCoverageOnFiles(this.newFilesAdded, this.config.addedFilesQualityGate);
        }

        if (this.modifiedFilesNotAdded.length) {
            this.checkCoverageOnFiles(this.modifiedFilesNotAdded, this.config.changedFilesQualityGate);
        }

        if (this.modifiedFilesAdded.length) {
            this.checkCoverageOnFiles(this.modifiedFilesAdded, this.config.changedFilesQualityGate);
        }
    }

    checkCoverageOnFiles(files, qualityGate) {
        const appFiles = getAppFiles(files, this.config.excludeFiles, this.filesToSkip);

        if (files.length && !appFiles.length) {
            console.log(YELLOW_LOG_ERR, `No changed files found in ${this.config.appRootRelativeToGitRepo} folder, check your appRootRelativeToGitRepo config`);
            console.log('Changed files:', files);
        }

        appFiles.forEach(filePath => {
            this.checkCoverageForFile(filePath, qualityGate);
        });

    }

    checkCoverageForFile(filePath, qualityGate) {
        const filePathRaw = filePath.replace(this.config.appRootRelativeToGitRepo, '');
        const reportForCurrentFile = this.coverageResults.find(report => report.path === filePathRaw);

        if (reportForCurrentFile && reportForCurrentFile.results) {
            this.processReport(reportForCurrentFile, qualityGate);
        } else {
            console.warn(YELLOW_LOG_ERR, `No report found for ${filePath}`);
        }
    }

    processReport(reportForCurrentFile, qualityGate) {
        const report = getReportData(reportForCurrentFile);

        this.resultsTable.update(report, reportForCurrentFile.path);
        this.errorTable.update(report, reportForCurrentFile.path, qualityGate);
    }
}

module.exports = CoverageGuard;
