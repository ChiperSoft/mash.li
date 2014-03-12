/*
 * RequireJS config file
 */

require.config({
	baseUrl: '/assets/',
	locale: 'en-us',
	waitSeconds: 10,
	paths: {

		'jquery'                        : 'vendor/jquery/dist/jquery',
		'lodash'                        : 'vendor/lodash/lodash.build',
		'underscore'                    : 'vendor/lodash/lodash.build',
		'backbone'                      : 'vendor/backbone-amd/backbone',
		'modernizr'                     : 'vendor/modernizr/modernizr',
		'moment'                        : 'vendor/moment/moment',
		'bootstrap'                     : 'vendor/bootstrap/dist/js/bootstrap',
		'async'                         : 'vendor/async/lib/async',
		'when'                          : 'vendor/when/when',
		'handlebars'                    : 'vendor/handlebars/handlebars',
		'pinvault-observer'             : 'vendor/pinvault-observer/pinvault-observer',
		'pinvault'                      : 'vendor/pinvault/pinvault',
		'soundmanager2'                 : 'vendor/soundmanager2/script/soundmanager2',
		'soundcloud'                    : '//connect.soundcloud.com/sdk',
		'helper-hoard'                  : 'vendor/helper-hoard/build/hoard.all',
		'davis'                         : 'vendor/davis/davis',

		'events'                        : 'js/lib/events',
		'collections'                   : 'js/collections',
		'models'                        : 'js/models'

	},
	map: {
		'*': {
			underscore: 'lodash',
			jQuery: 'jquery',
			Handlebars: 'handlebars',
			soundmanager: 'soundmanager2'
		}
	},
	deps: [],
	shim: {
		backbone: {
			deps: [
				'underscore',
				'jquery'
			],
			exports: 'Backbone'
		},
		handlebars: {
			exports: 'Handlebars'
		},
		'soundmanager2': {
			exports: 'soundManager'
		},
		soundcloud: {
			exports: 'SC'
		},
		bootstrap: {
			deps: ['jquery']
		},
		davis: {
			exports: 'Davis'
		}
	}
});

