const { BLUE_LOG_ERR, RESET_COLOR } = require('./constants');
/*eslint no-console: 0 */
class ResultObject {
    constructor(statements, branches, functions, lines) {
        this.statements = statements;
        this.branches = branches;
        this.functions = functions;
        this.lines = lines;
    }
}

class ResultsTable {
    constructor() {
        this.table = {};
    }

    clear() {
        this.table = {};
    }

    update(report, filePath) {
        const { statements, branches, functions, lines } = report;

        this.table[filePath] = new ResultObject(statements, branches, functions, lines);
    }

    show() {
        console.log(BLUE_LOG_ERR, 'Your UNCOMITTED changed files coverage results:', RESET_COLOR);
        console.table(this.table);
    }

    showCommited() {
        console.log(BLUE_LOG_ERR, 'Coverage quality on comitted files:', RESET_COLOR);
        console.table(this.table);
    }
}

module.exports = ResultsTable;
