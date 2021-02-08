const YELLOW_LOG_ERR = '\x1b[33m%s\x1b[0m';
const RED_BG_LOG_ERR = '\x1b[41m%s\x1b[0m';
const RED_LOG_ERR = '\x1b[31m%s\x1b[0m';
const BLUE_LOG_ERR = '\x1b[34m';
const GREEN_LOG_ERR = '\x1b[32m%s\x1b[0m';
const BLUE_BG_LOG_ERR = '\x1b[44m%s\x1b[0m';

const ADDED_FILES_QUALITY_GATE = {
    statements: 100,
    branches: 100,
    functions: 100,
    lines: 100
};

const CHANGED_FILES_QUALITY_GATE = {
    statements: 80,
    branches: 80,
    functions: 80,
    lines: 80
};

module.exports = {
    ADDED_FILES_QUALITY_GATE,
    CHANGED_FILES_QUALITY_GATE,
    YELLOW_LOG_ERR,
    RED_BG_LOG_ERR,
    GREEN_LOG_ERR,
    RED_LOG_ERR,
    BLUE_BG_LOG_ERR,
    BLUE_LOG_ERR
};
