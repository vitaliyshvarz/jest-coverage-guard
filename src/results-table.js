const { BLUE_BG_LOG_ERR } = require('./constants');
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
        console.log(BLUE_BG_LOG_ERR, 'Your UNCOMITTED changed files coverage results:');
        console.table(this.table);
    }

    showCommited() {
        console.log(BLUE_BG_LOG_ERR, 'Coverage quality on comitted files:');
        console.table(this.table);
    }
}

module.exports = ResultsTable;
