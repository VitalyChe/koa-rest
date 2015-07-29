var Router = require('koa-router');
var router = module.exports = new Router();
var controller = require('./controller/short-url');

router.post('/', controller.post);
router.get('/:url', controller.get);