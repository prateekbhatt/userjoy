![UserJoy.co](/apps/website/assets/images/userjoy_logo.png)
==========

Analytics and CRM for SaaS (Subscription as a Service) applications

## Demo
A demo is running at https://app.userjoy.co/demo . Select 'Demo App' in the second-right dropdown (besides the 'Account' dropdown).

## Structure

The UserJoy application itself consists of multiple Node.js / JS applications:. These are present in the `apps/` directory.
* **api**: The backend API. Built using Express.js and MongoDB and runs at `api.userjoy.co`
* **cdn**: It consists of the source code to generate the `userjoy.js` script which tracks and sends the event data from client applications to the `track` api
* **dashboard**: The dashboard. Running at `https://app.userjoy.co`
* **demo**: A demo app with static data. Running at `https://app.userjoy.co`
* **website**: The main website at https://userjoy.co
* **workers**: A Node.js app which runs the background workers to run the periodic analysis, and send the behavioral emails.


## Install

You must have Node.js (>= 0.10.26), Redis, MongoDB (>= 2.4) installed on your computer.

UserJoy is also dependent upon external services:
* Mailgun (for processing emails)
* Iron.io (for maintaining queues for background jobs)
* AWS S3 and Cloudfront (for serving the `userjoy.js` script to client applications)

You need to sign up for the above services and set up their config in the appropriate files by doing the following:

Before installing, you need to search (grep) for "CHECK: REPLACE THE FOLLOWING WITH YOUR CONFIG BEFORE RUNNING" in the root directory, and update the settings at the corresponding places.


Run `./install.sh` from the root directory

Then run `userjoy` in the command line to get a list of commands to start / stop / diagnose the application
