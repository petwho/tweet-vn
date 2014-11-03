Tweet-vn
========

A QA social network platform

##Overview
This is a QA social network platform written using NodeJS and MongoDB.

Technology stack:
* Sever: NodeJS v0.10+, MongoDB v.2.4
* Client: Backbone 1.1.0, jQuery 2.0.3
* Other: Twitter Bootstrap v.3, RequireJS 2.1.9, Less CSS Preprocessor

Developyment process exensively makes use of `forever`, a NodeJS package which helps to run NodeJS on port 80. You may use whatever technique you like
to deploy the app.

##Quickstart

In order to run this app, you need to install NodeJS version 0.10 or above, MongoDB v.2.4 or above on your server. You also need to
create a `.config.js` file which tells Node about specific application's startup configuraiton variables. A sample file is provided as follows (most of them
are self-explanatory):

```
=== Config Vars
AWS_ACCESS_KEY_ID:     ThisIsYourAmazonBucketAccessId
AWS_BUCKET_NAME:       example.net
AWS_REGION:            ap-southeast-1
AWS_SECRET_ACCESS_KEY: ThisIsYourAmazonBucketAccessKey
COOKIE_SECRET:         n4IS7y3HHEbSLEldzFRqX4uxlDtJRkHTTOzH6qHvZdeBhAQ7sHQ17pTv5JYdzZUV
DB_ADMIN_EMAIL_ADD:    johndoe@example.net
FACEBOOK_APP_ID:       YourFacebookClientAppID
FACEBOOK_APP_SECRET:   YourFacebookClientAppSecret
GOOGLE_CLIENT_ID:      YourGoogleClientID
GOOGLE_CLIENT_SECRET:  YourGoogleClientSecret
GOOGLE_REDIRECT_URL:   http://www.example.net/google-oauth-redirect
MONGOLAB_URI:          mongodb://username@host:27819/mongo_lab_id
NODE_ENV:              production
NOTIFIER_EMAIL_ADD:    no-reply@tweet.vn
NOTIFIER_NAME:         no-reply
SENDGRID_PASSWORD:     SendgridIsAwsome
SENDGRID_USERNAME:     app12345@example.net
SESSION_SECRET:        DRVwanKdnpqo8aRnHgcZuAWOq70M0kWIFtxJdSO4PYHBriRh15zSTwIjpDVvP8PF
SYS_ADMIN_EMAIL_ADD:   johndoe@example.net
```

##License

(The MIT License)

Copyright (c) 2014 Tran Khanh <trankhanhsvn@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
