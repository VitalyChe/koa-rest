var mongoose = require('mongoose')
    , Schema = mongoose.Schema
    , autoIncrement = require('mongoose-auto-increment')
    ;

var schema = new Schema({
    id: {type: Number, unique: true},
    hash: Number,//origin url hash
    hashUrl: String,//short url hash built on id
    hits: {type: Number, default: 0},
    url: {type: String, trim: true},
    uid: {type: Schema.Types.ObjectId, ref: 'User'},
    pageId: {type: Schema.Types.ObjectId, ref: 'Page'},
    promoterId: {type: Schema.Types.ObjectId, ref: 'Promoter'},
    cAt: {type: Date, 'default': Date.now}//created
}, {
    versionKey: false
});

schema.statics.exists = function*(hashUrl) {
    return yield this.findOne({
        hashUrl: hashUrl
    }).exec();
};

schema.statics.hit = function*(model) {
    return yield this.findOneAndUpdate({
        _id: model._id
    }, {
        $inc: {hits: 1}
    }).exec();
};

schema.plugin(autoIncrement.plugin, {
    model: 'ShortUrl',
    field: 'id',//build hash on it
    startAt: 1
});

schema.index({hashUrl: 1});

module.exports = mongoose.model('ShortUrl', schema);