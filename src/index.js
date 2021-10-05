const util = require('util');


function noop() {}

var createPattern = function (path) {
    return { pattern: path, included: true, served: true, watched: false };
};

var OrderReporter = function (config, baseReporterDecorator, emitter) {
    const files = config.files;

    baseReporterDecorator(this);

    // Derived from karma-coverage-istanbul-reporter (see
    // https://github.com/mattlewis92/karma-coverage-istanbul-reporter/commit/a17b6ca48053f2b5ff7659f1d5794317187b51d9),
    // which in turn is from https://github.com/angular/angular-cli/pull/9529/files
    const reporterName = 'jasmine-order';
    const hasTrailingReporters = config.reporters.slice(-1).pop() !== reporterName;
    const hasProgressReporter = config.reporters.includes('progress');
    const origWriteCommonMsg = this.writeCommonMsg.bind(this);
    if (hasTrailingReporters) {
        this.writeCommonMsg = noop;
    }

    this.onBrowserError = noop;
    this.onSpecComplete = noop;
    this.onRunComplete = noop;

    files.splice(
        files.length - 1,
        0,
        createPattern(__dirname + '/lib/jasmine-order.reporter.js'),
        createPattern(__dirname + '/lib/jasmine-order.adapter.js')
    );

    const reporter = this; // self reference to use in callback

    // see https://github.com/karma-runner/karma/issues/2192#issuecomment-290230042
    emitter.on('browser_info', (browser, data) => {
        if (!data || data.type !== 'Jasmine Order Reporter') {
            return
        }

        // When there are multiple browsers, the "Started with seed" message may
        // be received before the reporter knows about all of the browsers,
        // which causes the message to sometimes not include the browser name
        let msg = util.format(this.LOG_MULTI_BROWSER, browser, data.type.toUpperCase(), data.seedInfo);
        if (hasProgressReporter) {
            // The progress reporter overwrites lines so we need to include an extra
            // newline character for every browser in which the tests are running
            msg += '\n'.repeat(this._browsers.length);
        }
        origWriteCommonMsg(msg);
    });
};

OrderReporter.$inject = ['config', 'baseReporterDecorator', 'emitter'];

module.exports = {
    "reporter:jasmine-order": ["type", OrderReporter]
};