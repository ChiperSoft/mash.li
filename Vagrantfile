# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure("2") do |config|

	# Every Vagrant virtual environment requires a box to build off of.
	config.vm.box = "node-ubuntu-1310-amd64-vbox438-r1"
	config.vm.box_url = "http://mash.li/vagrant/ubuntu-13.10-amd64-vbox438.box"

	# Assign this VM to a host-only network IP, allowing you to access it
	# via the IP. Host-only networks can talk to the host machine as well as
	# any other machines on the same network, but cannot be accessed (through this
	# network interface) by any external networks.
	config.vm.network :private_network, ip: "192.168.56.151"
	config.vm.network "forwarded_port", guest:  3306, host:  3306 # mysql
	config.vm.network "forwarded_port", guest:  6379, host:  6379 # redis
	config.vm.network "forwarded_port", guest: 11211, host: 11211 # memcached
	config.vm.network "forwarded_port", guest: 27017, host: 27017 # mongodb
	config.vm.hostname = "mash.li"

	config.vm.synced_folder "./srv", "/srv", nfs: true

	config.vm.provider :virtualbox do |virtualbox|
		virtualbox.customize ["modifyvm", :id, "--name", "mashli"]
		virtualbox.customize ["modifyvm", :id, "--memory", "2048"]
		virtualbox.customize ["setextradata", :id, "--VBoxInternal2/SharedFoldersEnableSymlinksCreate/v-root", "1"]
	end

	config.vm.provision "shell" do |s|
		s.path = "provisioning/initial-setup.sh"
		s.args = "/vagrant/provisioning"
	end


end
