#!/bin/bash

MAIN_SCRIPT="main.py"
JS_SCRIPT="server.js"

gnome-terminal --tab -- bash -c "cd cred;cd credenciales;cd plantilla;cd project; echo 'tse98669935!' | sudo -S node $JS_SCRIPT; exec bash"
gnome-terminal --tab -- bash -c "cd cred;cd credenciales;cd plantilla;cd project; python3 $MAIN_SCRIPT; exec bash"


