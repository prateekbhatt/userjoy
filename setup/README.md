
This folder contains the scripts to:

- setup nginx
- (for development env) add hosts to /etc/hosts
- install project and global dependencies
- install app dependencies inside apps/*
- add symlink to bin/dodatado.js to /usr/local/bin

None of the scripts in this folder should be directly invoked. See usage below.

Usage:

Go back to the project root directory, then run:

    bash install.sh <environment>

where environment is one of:

    development
    production
