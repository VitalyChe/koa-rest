var _ = require('lodash');

var defaults = {
    chars: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
};

// Constructor
var HashIndex = function (options) {
    this.options = _.extend({}, defaults, options);
};

// Converts a number into an encoded string
HashIndex.prototype.encode = function (i) {
    return baseEncode(i, this.options.chars);
};

// Converts an encoded string into a number
HashIndex.prototype.decode = function (s) {
    return baseDecode(s, this.options.chars);
};

// Converts a number into a base-n string
function baseEncode(i, chars) {
    if (i === 0) return chars[0];

    var s = ''
        , base = chars.length
        ;
    while (i > 0) {
        s = chars[i % base] + '' + s;
        i = Math.floor(i / base);
    }

    return s;
}

// Converts a base-n string into a number
function baseDecode(s, chars) {
    var n = 0
        , base = chars.length
        ;
    for (var i = 0, len = s.length; i < len; i++) {
        n += chars.indexOf(s[i]) * Math.pow(base, s.length - i - 1);
    }

    return n;
}

function HashString(str) {
    str = str.toString();

    var hash = 5381,
        i = str.length
        ;
    while (i) {
        hash = (hash * 33) ^ str.charCodeAt(--i);
    }

    /* JavaScript does bitwise operations (like XOR, above) on 32-bit signed
     * integers. Since we want the results to be always positive, convert the
     * signed int to an unsigned by doing an unsigned bitshift. */
    return hash >>> 0;
}

module.exports.index = HashIndex;
module.exports.string = HashString;