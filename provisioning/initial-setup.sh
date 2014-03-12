#!/bin/bash

cat "/vagrant/provisioning/self-promotion.txt"

echo "Copying bashrc..."
cp /vagrant/provisioning/files/bashrc /home/vagrant/.bashrc
