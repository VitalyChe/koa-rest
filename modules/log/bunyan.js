var bunyan = require('bunyan');
var emit = bunyan.prototype._emit;
const CLS = require('continuation-local-storage');

bunyan.prototype._emit = function addReqIdToEveryRecord(rec, noemit) {

    // get it runtime, so that it may be require'd later than this module
    const clsNamespace = CLS.getNamespace('app');

    if (clsNamespace) {
        var clsContext = clsNamespace.get('context');

        if (clsContext) {
            if (!rec.requestId) {
                rec.requestId = clsContext.requestId;
            } else {
                // rec.requestId comes from the child logger object this.log, it is always correct
                // clsContext.requestId kept across async calls by CLS, should be correct
                if (rec.requestId !== clsContext.requestId) {
                    // trust rec.requestId, if we're here => context is lost somewhere (bug)
                    console.error(`LOG: CLS wrong context ${clsContext.requestId} should be ${rec.requestId}`, rec);
                }
            }
        }
    } else {
        console.error("LOG: no CLS namespace");
    }
    return emit.call(this, rec, noemit);
};

module.exports = bunyan;
