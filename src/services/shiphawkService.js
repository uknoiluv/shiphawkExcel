(function () {
  'use strict';

  angular.module('appxls')
    .factory('shiphawkService', ['$http', function($http) {

      var service = {
        getJobs: getJobs
      };

      return service;

      /////////

      function getJobs(term){
        console.log('rocks');
        var url = 'https://stage.shiphawk.com/api/v1/items/search/' +
          term + '?api_key=4d9250a237a5403c6e0b17ba553fabfc' +
          '&callback=JSON_CALLBACK';

        var jobs = $http({
          method: "JSONP",
          url: url,
          params: {
            "content": false
          }
        });

        console.log(jobs);

        return jobs;
      }
    }]);



})();


