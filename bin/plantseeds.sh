mongodump --out /vagrant/provisioning/seeds/mongodb/

redis-cli save
cp /var/lib/redis/dump.rdb /vagrant/provisioning/seeds/redis/dump.rdb
