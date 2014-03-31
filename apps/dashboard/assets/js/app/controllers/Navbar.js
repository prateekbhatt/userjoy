angular.module('do.navbar', [])

// .config(['$stateProvider',
//     function ($stateProvider) {
//         $stateProvider.state('navbar', {
//             url: '',
//             views: {
//                 "navbar": {
//                     controller: 'NavbarCtrl',
//                     templateUrl: '../views/homepage.ejs'
//                 }
//             }
//         });
//     }
// ])

.controller('NavbarCtrl', ['$scope',
    function ($scope) {
        $scope.items = [
          '<span class=\"glyphicon glyphicon-cog\"></span>&nbsp;&nbsp;&nbsp;&nbsp;Settings',
          '<i class=\"fa fa-book\"></i>&nbsp;&nbsp;&nbsp;&nbsp;Docs',
          '<span class=\"glyphicon glyphicon-off\"></span>&nbsp;&nbsp;&nbsp;&nbsp;Logout'
        ];
    }
]);