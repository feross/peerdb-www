#!/bin/bash
# Update code and restart server (run from app server)
trap 'exit' ERR

if [ -d "/home/feross/www/peerdb.io-build" ]; then
  echo "ERROR: Build folder already exists. Is another build in progress?"
  exit 1
fi

cp -R /home/feross/www/peerdb.io /home/feross/www/peerdb.io-build

cd /home/feross/www/peerdb.io-build && git pull
cd /home/feross/www/peerdb.io-build && rm -rf node_modules
cd /home/feross/www/peerdb.io-build && npm install --production --quiet
cd /home/feross/www/peerdb.io-build && npm run build

sudo supervisorctl stop peerdb

cd /home/feross/www && mv peerdb.io peerdb.io-old
cd /home/feross/www && mv peerdb.io-build peerdb.io

sudo supervisorctl start peerdb

cd /home/feross/www && rm -rf peerdb.io-old
