exports.login = (req, res, next) => {
	res.render('login');
}

exports.logout = (req, res, next) => {
	req.session.destroy()
	res.redirect('/');
}

exports.authenticate = (req, res, next) => {
	// res.redirect('/admin');
	if (!req.body.email || !req.body.password) {
		return res.render('login', {error: 'Please enter your email and password.'})
	}

	req.models.User.findOne({
		email: req.body.email,
		password: req.body.password
	}, (error, user) => {
		if (error) return next(error)
		if (!user) return res.render('login', {error: 'Incorrect emal & password combination.'})
		req.session.user = user;
		req.session.admin = user.admin
		res.redirect('/admin')
	})
}