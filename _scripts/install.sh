#!/bin/bash
set -x # Show the output of the following commands (useful for debugging)

ssh-keyscan -t $TRAVIS_SSH_KEY_TYPES -H $DEPLOY_HOST 2>&1 | tee -a $HOME/.ssh/known_hosts
# Import the SSH deployment key
openssl aes-256-cbc -K $encrypted_2a275d539911_key -iv $encrypted_2a275d539911_iv -in deploy-key.enc -out deploy-key -d
rm deploy-key.enc # Don't need it anymore
chmod 600 deploy-key
mv deploy-key ~/.ssh/id_rsa
