exports.user = require('./user')
exports.article = require('./article')


// exports.index = function(req, res, next) {
// 	req.collections.articles
// 		.find({published: true}, {sort: {_id: -1}})
// 		.toArray((error, articles) => {
// 			if (error) return next(error)
// 			res.render('index', {articles: articles});
// 		});
// }
exports.index = (req, res, next) => {
	req.models.Article.find(
		{published: true}, 
		null, 
		{sort: {_id: -1}}, 
		(error, articles) => {
			if (error) return next(error)
			res.render('index', {articles: articles})
		})
}