#!/bin/bash

cat "/vagrant/provisioning/self-promotion.txt"

echo "Copying bashrc..."
cp /vagrant/provisioning/files/bashrc /home/vagrant/.bashrc

echo "Seeding mongodb..."
mongorestore /vagrant/provisioning/seeds/mongodb/

echo "Seeding redis..."
service redis-server stop
cp /vagrant/provisioning/seeds/redis/dump.rdb /var/lib/redis/dump.rdb
chown redis:redis /var/lib/redis/dump.rdb
service redis-server start