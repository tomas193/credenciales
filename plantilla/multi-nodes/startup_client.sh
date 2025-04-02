#!/bin/bash

CLIENT_SCRIPT="client.py"

gnome-terminal --tab -- bash -c "cd cred;cd credenciales;cd plantilla;cd project; python3 $CLIENT_SCRIPT; exec bash"


