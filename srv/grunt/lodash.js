
module.exports = function (grunt) {

	grunt.config('lodash', {
		build: {
			// output location
			dest: 'public/assets/vendor/lodash/lodash.build.js',
			options: {
				// modifiers for prepared builds
				// backbone, legacy, modern, mobile, strict, underscore
				modifier: 'backbone',
				exports: ['amd'],
				plus: [
					'cloneDeep',
					'createCallback',
					'curry',
					'debounce',
					'flatten',
					'forIn',
					'forOwn',
					'forInRight',
					'forOwnRight',
					'forEachRight',
					'findIndex',
					'findKey',
					'findLast',
					'findLastIndex',
					'findLastKey',
					'isPlainObject',
					'merge',
					'parseInt',
					'partialRight',
					'pull',
					'remove',
					'transform',
					'sortBy',
					'xor'
				]
			}
		}
	});

	grunt.loadNpmTasks('grunt-lodash');
};
