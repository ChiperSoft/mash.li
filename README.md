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

*Coming Soon*

##FAQ

*Why do you check-in a symlink in the node_modules folder*   
NodeJS does not allow the definition of module loading paths at runtime, so if you want to load a local module without using relative paths you must either define a NODE_PATH environment variable, or put said modules inside the `node_modules` directory. Creating a symlink in node_modules that points to the local module base is a viable work-around. See https://gist.github.com/branneman/8048520 for more details.

*Why doesn't feature X work?*   
Mash.li is a hobby project being developed in my spare time between working and also being a father and husband. That means I can't fully flesh out every feature from the beginning, and some features still have bugs.  I want to make the site into something great, but I can only do so a little bit at a time.

*Do you want contributions to the codebase?*   
Absolutely, pull requests are very welcome, but please conform with the style of the codebase and make sure to run the `grunt` command before submitting, as it will check the code for style infractions.

##License

The Mash.li source is released under a Creative Commons Attribution NonCommercial ShareAlike (CC-NC-SA) license.  See LICENSE.txt for details.
