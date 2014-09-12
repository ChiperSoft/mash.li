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
		'backbone'           : 'vendor/backbone/backbone',
		'modernizr'          : 'vendor/modernizr/modernizr',
		'moment'             : 'vendor/moment/moment',
		'bootstrap'          : 'vendor/bootstrap/dist/js/bootstrap',
		'when'               : 'vendor/when/when',
		'handlebars'         : 'vendor/handlebars/dist/handlebars',
		'pinvault-observer'  : 'vendor/pinvault-observer/pinvault-observer',
		'pinvault'           : 'vendor/pinvault-observer/node_modules/pinvault/pinvault',
		'SoundManager'       : 'vendor/SoundManager/script/soundmanager2',
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
			exports: 'Handlebars',
			init: function () {
				this.Handlebars = Handlebars;
				return this.Handlebars;
			}
		},

		soundcloud: {
			exports: 'SC'
		},

		bootstrap: {
			deps: ['jquery']
		}
	}
});

