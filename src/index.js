/*eslint no-console: 0 */
const appRoot = require('app-root-path');
const config = require(appRoot + '/coverage.guard.config.json');
const {
    ADDED_FILES_QUALITY_GATE,
    CHANGED_FILES_QUALITY_GATE,
    RED_LOG_ERR,
    YELLOW_LOG_ERR
} = require('./constants');
const CoverageGuard = require('./coverage-guard');

class CoverageCheckReporter {
    constructor(globalConfig) {
        this._globalConfig = globalConfig;
    }

    async onRunComplete(contexts, results) {
        const isWatchMode = this._globalConfig.watch || this._globalConfig.watchAll;
        const coverageResults = Object.values(results.coverageMap.data).map(fileCoverage => {
            return {
                path: fileCoverage.path.replace(new RegExp('^.+' + config.appRoot), ''),
                results: fileCoverage.toSummary()
            };
        });

        // check mandatory config
        if (!config) {
            console.log(RED_LOG_ERR, 'Please create coverage.guard.config.json file in your project root');
            return;
        }

        if (config && !config.appRoot) {
            console.log(RED_LOG_ERR, 'Please add appRoot config to your coverage.guard.config.json file');
            return;
        }

        if (config && !config.featureNameRegExp) {
            console.log(RED_LOG_ERR, 'Please add featureNameRegExp config to your coverage.guard.config.json file');
            return;
        }

        if (config && !config.featureNameRegExp) {
            console.log(RED_LOG_ERR, 'Please add featureNameRegExp config to your coverage.guard.config.json file');
            return;
        }

        // check optional config
        if (config && !config.excludeKeywords || !config.excludeKeywords.length) {
            console.log(YELLOW_LOG_ERR, 'No excludeKeywords are provided in your coverage.guard.config.json file');
            config.excludeKeywords = [];
        }

        if (config && !config.excludeFiles || !config.excludeFiles.length) {
            console.log(YELLOW_LOG_ERR, 'No excludeFiles are provided in your coverage.guard.config.json file');
            config.excludeFiles = [];
        }

        if (config && !config.addedFilesQualityGate) {
            console.log(YELLOW_LOG_ERR, 'No addedFilesQualityGate config is provided in your coverage.guard.config.json file, using default');
            config.addedFilesQualityGate = ADDED_FILES_QUALITY_GATE;
        }

        if (config && !config.changedFilesQualityGate) {
            console.log(YELLOW_LOG_ERR, 'No changedFilesQualityGate config is provided in your coverage.guard.config.json file, using default');
            config.changedFilesQualityGate = CHANGED_FILES_QUALITY_GATE;
        }

        const coverageGuard = new CoverageGuard(coverageResults, isWatchMode, config);

        await coverageGuard.start();
    }
}

module.exports = CoverageCheckReporter;
