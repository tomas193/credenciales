#!/bin/bash

MAIN_SCRIPT="main.py"
SERVER_SCRIPT="server.py"
JS_SERVER="server.js"

gnome-terminal --tab -- bash -c "cd cred;cd credenciales;cd plantilla;cd project; echo 'tse98669935!' | sudo -S node $JS_SERVER; exec bash"
gnome-terminal --tab -- bash -c "cd cred;cd credenciales;cd plantilla;cd project; python3 $SERVER_SCRIPT; exec bash"
gnome-terminal --tab -- bash -c "cd cred;cd credenciales;cd plantilla;cd project; python3 $MAIN_SCRIPT; exec bash"


