var requestLanguage = require('express-request-language');

module.exports = function (keystone) {
	var languageOptions = Object.assign({
		'supported languages': ['en-US'],
		'language cookie': 'language',
		'language cookie options': {},
		'language select url': '/languages/{language}',
	}, keystone.get('language options'));

	return requestLanguage({
		languages: languageOptions['supported languages'],
		cookie: {
			name: languageOptions['language cookie'],
			url: languageOptions['language select url'],
			options: languageOptions['language cookie options'],
		},
		queryName: languageOptions['language query name'],
	});
};
