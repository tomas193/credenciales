#!/bin/bash

sudo apt update && sudo apt upgrade -y
sudo apt install curl -y
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
node -v
npm -v
npm install express
npm install multer
npm install sqlite3
sudo apt install python3-pip
pip3 --version
pip install pillow
pip install opencv-python
pip install python-barcode
pip install numpy
pip install pytz
cd AnyDesk
sleep 3
sudo dpkg -i anydesk_6.3.3-1_amd64.deb
sudo apt --fix-broken install
sleep 3
anydesk
