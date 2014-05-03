
module.exports = function (grunt) {

	grunt.config('concat', {
		helpers: {
			src: [
				'app/helpers/nl2br.js',
				'app/helpers/durationLong.js',
				'app/helpers/durationShort.js',
				'app/helpers/option.js',
				'node_modules/helper-hoard/src/helpers/math/add.js',
				'node_modules/helper-hoard/src/helpers/math/sub.js',
				'node_modules/helper-hoard/src/helpers/compare/and.js',
				'node_modules/helper-hoard/src/helpers/compare/compare.js',
				'node_modules/helper-hoard/src/helpers/str/numberFormat.js',
				'node_modules/helper-hoard/src/helpers/data/*.js',
				'node_modules/helper-hoard/src/helpers/layout/*.js',
				'node_modules/helper-hoard/src/helpers/date/*.js'
			],
			dest: 'node_modules/mashli-helpers.js',
		}
	});

	grunt.loadNpmTasks('grunt-contrib-concat');
};
