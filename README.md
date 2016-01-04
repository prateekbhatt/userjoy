![UserJoy.co](/apps/website/assets/images/userjoy_logo.png)
==========

UserJoy is an analytics and CRM tool for SaaS (Subscription as a Service) applications. It helps you convert free accounts, increase user engagement, and reduce churn.

You can learn more about the features and benefits on the project [website](http://userjoy.co), or by directly visiting the following links :
* [Convert more free / trial accounts to paid accounts](http://userjoy.co/convert)
* [Improve customer engagement and retention](http://userjoy.co/retain)
* [Increasing renewals, upsells and referrals](http://userjoy.co/monetize)

## Demo
A demo is running at http://app.userjoy.co/demo . Select 'Demo App' in the second-right dropdown (besides the 'Account' dropdown).

## Structure

The UserJoy application itself consists of multiple Node.js / JS applications:. These are present in the `apps/` directory.
* **api**: The backend API. Built using Express.js and MongoDB and runs at `api.userjoy.co`
* **cdn**: It consists of the source code to generate the `userjoy.js` script which tracks and sends the event data from client applications to the `track` api
* **dashboard**: The dashboard. Running at `http://app.userjoy.co`
* **demo**: A demo app with static data. Running at `http://app.userjoy.co`
* **website**: The main website at http://userjoy.co
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

## License

Released under the [MIT License](/LICENSE.txt)
