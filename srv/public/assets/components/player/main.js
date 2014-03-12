
define(['lodash', 'backbone', 'events', 'soundcloud', 'soundmanager', 'models/Track', './fill.hbs'], function (_, Backbone, events, soundcloud, soundmanager, Track, tmplFill) {

	function bindSoundEvent(onObject, toFunction) {
		return function () {
			var args = [].splice.call(arguments);
			args.unshift(this);
			onObject[toFunction].apply(onObject, args);
			// console.log(toFunction, args);
		};
	}

	return Backbone.View.extend({
		template: tmplFill,
		sound: null,
		abortAutoPlay: false,

		initialize: function () {
			var self = this;
			this.render = this.render.bind(this);

			var json = this.$('script.track-data').html();
			try {
				json = json && JSON.parse(json) || false;
			} catch (e) {
				json = false;
			}

			soundmanager.onready(function () {
				if (json) {
					var t = new Track(json);
					self.abortAutoPlay = true;
					self.onTrackPlayEvent({}, t.id);
				}

				events.on('track:play', self.onTrackPlayEvent, self);
			});
			
		},

		loadModel: function (attributes) {
			//if we got a string or number, assume its an id
			if (typeof attributes === 'string' || typeof attributes === 'number') {
				attributes = {id: attributes};
			}

			if (this.model) {
				this.stopListening(this.model);
			}

			this.model = new Track(attributes);
			this.listenTo(this.model, 'sync', this.render);
			return this;
		},

		onTrackPlayEvent: function (event, id) {
			var self = this;
			if (this.sound) {
				this.sound.destruct();
				this.sound = null;
			}

			var autoplay = !self.abortAutoPlay;
			self.abortAutoPlay = false;

			if (!id) {return;}

			if (!this.model || this.model.id !== id) {
				this.loadModel({id: id});
				this.render();

				soundcloud.stream('/tracks/'+this.model.id, function (sound) {
					self.sound = sound;
					if (!sound) {
						self.$el.addClass('error');
						self.$('.details').text('Could not load track for playback');
						return;
					}

					sound[autoplay ? 'play' : 'load']({
						onstop:       bindSoundEvent(self, 'onSoundStop'),
						onplay:       bindSoundEvent(self, 'onSoundPlay'),
						onresume:     bindSoundEvent(self, 'onSoundPlay'),
						onpause:      bindSoundEvent(self, 'onSoundPause'),
						ondataerror:  bindSoundEvent(self, 'onSoundError'),
						onsuspend:    bindSoundEvent(self, 'onSoundSuspend'),
						whileloading: bindSoundEvent(self, 'onSoundPositionChange'),
						whileplaying: bindSoundEvent(self, 'onSoundPositionChange'),
					});
				});
			} else if (this.sound && !this.sound.playState) {
				this.sound.play();
			}
		},

		render: function () {
			var data = {
				track: this.model.toJSON(),
				player: this.sound
			};

			var html = this.template(data);

			this.$('.body').html(html);

			return this;
		},

		events: {
			'click .player-play': 'play',
			'click .player-pause': 'pause'
		},

		play: function () {
			if (!this.sound) {return;}

			this.sound.play();
			this.$el.addClass('playing');
			
		},

		pause: function () {
			if (!this.sound) {return;}

			this.sound.pause();
			this.$el.removeClass('playing');
		},

		jump: function () {

		},

		onSoundStop: function () {
			this.$el.removeClass('playing');
		},
		onSoundPlay: function () {
			this.$el.addClass('playing');
			this.$el.removeClass('error');
			events.trigger('player:playing', this.model.id);
		},
		onSoundPause: function () {
			this.$el.removeClass('playing');
			events.trigger('player:paused', this.model.id);
		},
		onSoundSuspend: function () {},
		onSoundError: function () {
			this.$el.addClass('error');
			this.$('.details').text('An error occurred while loading track data.');
		},
		onSoundPositionChange: function (sound) {
			var loaded = sound.bytesLoaded && sound.bytesTotal && (sound.bytesLoaded / sound.bytesTotal) * 100;
			var position = sound.position && sound.duration && (sound.position / sound.duration) * 100;
			this.$('.loaded').css('width', loaded+'%');
			this.$('.position').css('width', position+'%');
		}
	});

});