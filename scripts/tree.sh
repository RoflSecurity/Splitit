#!/bin/bash
# Affiche la structure du projet en ignorant certains dossiers
find . -path ./node_modules -prune -o \
       -path ./.git -prune -o \
       -path ./venv -prune -o \
       -print | sed -e 's;[^/]*/;│  ;g' -e 's;│  $;├─ ;'
