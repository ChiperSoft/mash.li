/*
 * RequireJS config file
 */

require.config({
	baseUrl:    '/assets/',
	locale:     'en-us',
	waitSeconds: 10,

	paths: {

		'jquery'             : 'vendor/jquery/dist/jquery',
		'lodash'             : 'vendor/lodash/lodash.build',
		'underscore'         : 'vendor/lodash/lodash.build',
		'backbone'           : 'vendor/backbone-amd/backbone',
		'modernizr'          : 'vendor/modernizr/modernizr',
		'moment'             : 'vendor/moment/moment',
		'bootstrap'          : 'vendor/bootstrap/dist/js/bootstrap',
		'async'              : 'vendor/async/lib/async',
		'when'               : 'vendor/when/when',
		'handlebars'         : 'vendor/handlebars/handlebars',
		'pinvault-observer'  : 'vendor/pinvault-observer/pinvault-observer',
		'pinvault'           : 'vendor/pinvault/pinvault',
		'SoundManager'       : 'vendor/soundmanager2/script/soundmanager2',
		'soundmanager2'      : 'js/lib/soundmanager2',
		'soundcloud'         : '//connect.soundcloud.com/sdk',
		'helpers'            : 'vendor/mash.li/helpers',

		'events'             : 'js/lib/events',
		'visitor'            : 'js/lib/visitor',
		'collections'        : 'js/collections',
		'models'             : 'js/models'

	},

	map: {
		'*': {
			underscore:   'lodash',
			jQuery:       'jquery',
			Handlebars:   'handlebars',
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

		soundcloud: {
			exports: 'SC'
		},

		bootstrap: {
			deps: ['jquery']
		}
	}
});

