'use strict';

// Declare app level module which depends on filters, and services
var cpmodule = angular.module('fridgemagnets');
cpmodule
  // version of this seed app is compatible with angularFire 0.6
  // see tags for other versions: https://github.com/firebase/angularFire-seed/tags
  .constant('version', '0.8.2')
  // your Firebase data URL goes here, no trailing slash
  .constant('FBURL', 'https://lpmfridgemagnets.firebaseio.com/')

  // double check that the app has been configured before running it and blowing up space and time
  .run(['FBURL', '$timeout', function(FBURL, $timeout) {
    if( FBURL.match('//INSTANCE.firebaseio.com') ) {
      angular.element(document.body).html('<h1>Please configure app/js/config.js before running!</h1>');
      $timeout(function() {
        angular.element(document.body).removeClass('hide');
      }, 250);
    }
  }]);

