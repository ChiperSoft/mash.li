
module.exports = function (grunt) {

	grunt.config('amdwrap', {
		helpers: {
			src: 'node_modules/mashli-helpers.js',
			dest: 'public/assets/vendor/mash.li/helpers.js',
		}
	});

	grunt.loadNpmTasks('grunt-amd-wrap');
};
