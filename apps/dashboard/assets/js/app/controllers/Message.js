angular.module('do.message', [])

    .config(['$stateProvider',
        function ($stateProvider) {
            $stateProvider
                .state('message', {
                    url: '/messages',
                    views: {
                        "main": {
                            templateUrl: '/templates/message.inbox.html',
                            controller: 'MessageCtrl'
                        }
                    }
                })
                .state('message.inbox', {
                    url: '/inbox',
                    views: {
                        "panel": {
                            templateUrl: '/templates/message.inbox.html'
                        }
                    }
                });
            /*.state('message.sent', {
                        url: '/sent',
                        views: {
                            "panel": {
                                templateUrl: '/templates/message.sent.html'
                            }
                        }

                    })*/


        }
    ])

    .controller('MessageCtrl', ['$scope',
        function MessageCtrl($scope) {
            
        }
    ]);