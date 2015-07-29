var hash = require('build-hash');
var hashIndex = new hash.index();
var ShortUrlModel = require('../models/short-url');

exports.get = function*() {
    var url = this.params.url;

    if (!url) {
        this.throw(403, 'error');
    }

    var shortUrl = yield ShortUrlModel.exists(url);

    if (shortUrl) {
        yield ShortUrlModel.hit(shortUrl);
        this.redirect(shortUrl.url);
    } else {
        this.redirect('/');
    }

    this.status = 301;
};

exports.post = function*() {
    var url = this.request.body.url;

    if (!url) {
        this.throw(403, 'error');
    }

    var shortUrl = yield new ShortUrlModel({
        url: url,
        hash: hash.string(url)
    }).persist();

    if (shortUrl) {
        var hashUrl = hashIndex.encode(shortUrl.id);
        yield ShortUrlModel.findOneAndUpdate({
            _id: shortUrl._id
        }, {
            hashUrl: hashUrl
        }).exec();
    }
    this.body = hashUrl;
};

