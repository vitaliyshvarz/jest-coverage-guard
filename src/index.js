const appRoot = require('app-root-path');
const config = require(appRoot + '/coverage.guard.config.json');

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

        const gulag = new CoverageGuard(coverageResults, isWatchMode, config);

        await gulag.start();
    }
}

module.exports = CoverageCheckReporter;
