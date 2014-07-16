angular.module('services.AccountService', [])

.service('AccountService', ['$log',

  function ($log) {

    var loggedInAccount = '';

    this.set = function (accountObject) {
      loggedInAccount = accountObject;

      userjoy.identify({

        // TODO: logged in user's email.  
        // Used to identify the user and send him email messages  
        // (REQUIRED)  
        email: accountObject.email,

        // TODO: logged in user's unique id.  
        // if your app allows a user to change his email address,  
        // then user_id is required to identify user  
        // (OPTIONAL)  
        user_id: accountObject._id,

        // TODO: logged in user's payment status  
        // MUST be one of 'trial' / 'free' / 'paying' / 'cancelled'  
        // (REQUIRED)  
        status: 'trial',

        // TODO: logged in user's sign-up date in UNIX timestamp  
        // (milliseconds after epoch)  
        // (REQUIRED)  
        joined: new Date(accountObject.ct).getTime()

      });
    };

    this.get = function () {
      return loggedInAccount;
    };

    return this;

  }
])