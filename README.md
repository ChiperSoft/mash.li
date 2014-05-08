Mash.li
===

Mash.li is a content aggregate site for locating new music mashup tracks on the SoundCloud audio service.  It scans SoundCloud every evening for new tracks with the "mashup" tag and adds them to a growing pool of songs to pick from.  Every day, 10 new songs are chosen from the pool and made available for voting (voting feature still in progress).  The goal of the Mash.li site is to create a crowd-sourced collection of the best new mashup songs available online.

Mash.li is also a show piece, designed to demonstrate my skills as a web developer and software engineer.  Mash.li is written from scratch by myself ([Jarvis Badgley](mailto:chiper@chipersoft.com)) using the following technologies:


**Backend**:

- Node.js
- Nginx
- Express 4
- Handlebars
- MongoDB / Mongoose
- Redis

**Frontend**:

- Bootstrap & jQuery
- RequireJS
- Lo-Dash
- LESS
- Backbone
- IcoMoon

Developmental:

- Grunt
- Bower
- Vagrant
- Packer

It has also been my first Node.js site to be public deployed on a cloud VPS, hosted by DigitalOcean.

I provide the source of this site to the public as both a show of good faith (please don't steal my site) and so that others may use it to learn the technologies I employ.

##Installing Mash.li

**Please be aware that the Mash.li codebase is written for use on *nix based systems such as Linux or Mac OS X, and will not work on Windows due to the use of symlinks in the git repository.**

The following commands are needed to download and install the mash.li site for the first time:

```
git clone https://github.com/ChiperSoft/mash.li.git
cd mash.li/srv
npm install
bower install
grunt
```

Once those commands are complete, you can start the server using:

	grunt launch

As long as this is running, any changes to LESS files, Handlebars templates or JS modules will automatically be re-compiled, and the server restarted.  Use CONTROL-C to stop the server.

`grunt launch` will run the server in development mode, which avoids concatenation and minification of the front-end code.  Use `grunt deploy` to produce a minified set for use in production.

##Mash.li Vagrant Box

Mash.li requires a running MongoDB and Redis server on whatever computer it is running on.  To facilitate this, I've included a custom vagrant build that will launch a VM running both, which is also pre-loaded with NodeJS 0.10.26.  To use this VM you must have [Vagrant](http://www.vagrantup.com) and [Virtualbox](http://www.virtualbox.org) installed on your computer.

In the terminal, cd to the `srv` directory of this repo and type:

	vagrant up

Vagrant will download the custom base box from the mash.li server and provision a new server on your machine.  The vagrant configuration is setup to port-forward all the databases on the box (memcache and mysql are also running on the VM, tho not used) to your localhost so that you can run the site directly on your computer, but if you do not have NodeJS installed you can also ssh into the VM and run it from there (the `srv` directory mounts at `/srv/`).

##Code Tour

- `bin`: Shell scripts for use within the Vagrant VM
- `logo`: Mashli logo source documents
- `migrations`: Previous database migration scripts
- `provisioning`: Files for provisioning the vagrant environment
- `srv`: Actual site code

- `srv/index.js`: Production site launch point. Runs the server within a Forever.js wrapper to ensure the site restarts in the event of a crash.
- `srv/server.js`: Main site launch point. Contains the majority of the Express initialization code.
- `srv/grunt`: Grunt tasks for building the site.
- `srv/app`: Contains all local modules used throughout the application. Any require for `app/...` loads from here.
- `srv/app/config/index.js`: Default config file, meant to be overridden by copying to `srv/app/config.js`
- `srv/app/db`: Database connection modules for MongoDB and Redis. Each automatically initializes the DB connection on first require.
- `srv/app/helpers`: Custom handlebars helpers for page layout. These files are bundled into a single include via the grunt concat and amdwrap processes.
- `srv/app/lib`: Miscellaneous local libraries, including the libs for interacting with SoundCloud.
- `srv/app/lib/view.js`: Custom express view renderer for handling handlebars files with loaded helper functions and partials.
- `srv/app/middleware`: Local middleware for various reusable pieces of request logic.
- `srv/app/models`: MongoDB data models
- `srv/app/routes`: Express routers for different sections of the site.
- `srv/app/routes/main.js`: Router for the bulk of all requests. Creates the main site page and handles track list loading.
- `srv/app/views/layouts`: Handlebars templates for page chrome.
- `srv/app/views/pages`: Handlebars templates for individual pages.
- `srv/public`: Client side code served up by nginx.
- `srv/public/less`: LESS files to be compiled for the site CSS.
- `srv/public/less/main.less`: Compiles to `src/public/assets/css/main.css`, containing styles for all pages.
- `srv/public/less/pages`: Contents compile to `src/public/assets/css/pages/`, containing styles for specific pages.
- `srv/public/less/all-components.less`: Combines styles for all front-end components to be processed for linting by csslint (since nobody's written a LESS linter yet).
- `srv/utilities`: Server side processes to be ran outside of the main server, such as cron jobs.


##FAQ

*Why do you check-in a symlink in the node_modules folder*   
NodeJS does not allow the definition of module loading paths at runtime, so if you want to load a local module without using relative paths you must either define a NODE_PATH environment variable, or put said modules inside the `node_modules` directory. Creating a symlink in node_modules that points to the local module base is a viable work-around. See https://gist.github.com/branneman/8048520 for more details.

*Why doesn't feature X work?*   
Mash.li is a hobby project being developed in my spare time between working and also being a father and husband. That means I can't fully flesh out every feature from the beginning, and some features still have bugs.  I want to make the site into something great, but I can only do so a little bit at a time.

*Do you want contributions to the codebase?*   
Absolutely, pull requests are very welcome, but please conform with the style of the codebase and make sure to run the `grunt` command before submitting, as it will check the code for style infractions.

##License

The Mash.li source is released under a Creative Commons Attribution NonCommercial ShareAlike (CC-NC-SA) license.  See LICENSE.txt for details.
