const { RED_LOG_ERR, YELLOW_LOG_ERR, RESET_COLOR } = require('./constants');
/*eslint no-console: 0 */
class ErrorObject {
    constructor(error) {
        this.error = error;
    }
}

class ErrorTable {
    constructor() {
        this.tables = [];
        this.coverageCheckFailed = false;
    }

    clear() {
        this.tables = [];
    }

    update(report, filePath, qualityGate) {
        const { statements, branches, functions, lines } = report;
        const newErrorTable = {};
        let fileCoverageFailed = false;
        let statementsError = '';
        let branchesError = '';
        let functionsError = '';
        let linesError = '';

        if (statements < qualityGate.statements) {
            fileCoverageFailed = true;
            statementsError = `coverage: ${statements}%, expected: ${qualityGate.statements}%`;
        }

        if (branches < qualityGate.branches) {
            fileCoverageFailed = true;
            branchesError = `coverage: ${branches}%, expected: ${qualityGate.branches}%`;
        }

        if (functions < qualityGate.functions) {
            fileCoverageFailed = true;
            functionsError = `coverage: ${functions}%, expected: ${qualityGate.functions}%`;
        }

        if (lines < qualityGate.lines) {
            fileCoverageFailed = true;
            linesError = `coverage: ${lines}%, expected: ${qualityGate.lines}%`;
        }

        if (fileCoverageFailed) {
            newErrorTable[`${filePath} `] = new ErrorObject('---');

            if (statementsError) {
                newErrorTable['statements'] = new ErrorObject(statementsError);
            }

            if (branchesError) {
                newErrorTable['branches'] = new ErrorObject(branchesError);
            }

            if (functionsError) {
                newErrorTable['functions'] = new ErrorObject(functionsError);
            }

            if (linesError) {
                newErrorTable['lines'] = new ErrorObject(linesError);
            }

            this.tables.push(newErrorTable);
            this.coverageCheckFailed = true;
        }
    }

    show() {
        if (this.tables.length) {
            console.log(YELLOW_LOG_ERR, 'Coverage details on files that failed:');

            this.tables.forEach((table) => {
                console.table(table);
            });
        }
    }

    showCommited() {
        if (this.tables.length > 0) {
            console.log(RED_LOG_ERR, 'Coverage quality gate in previous commits failed', RESET_COLOR);

            this.tables.forEach((table) => {
                console.table(table);
            });
        }
    }

    get containsErrors() {
        return this.coverageCheckFailed;
    }
}

module.exports = ErrorTable;
