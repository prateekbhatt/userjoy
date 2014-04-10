angular.module('do.popupmessage', [])

.config(['$stateProvider',
    function ($stateProvider) {
        $stateProvider
            .state('popup', {
                url: '/popup',
                views: {
                    "main": {
                        templateUrl: '/templates/messagesmodule/popupmessage.html',
                        controller: 'PopupCtrl'
                    }
                }
            });
    }
])

.controller('PopupCtrl', ['$scope', '$modal', '$log',
    function ($scope, $modal, $log) {

        $scope.title = "Message Thread - Miss Martha";
        // $scope.content = "Hello Modal<br />This is a multiline message!";

        var popupModal = $modal({
            scope: $scope,
            template: '/templates/popup.html',
            controller: 'addCommentCtrl',
            show: false
        });

        $scope.openModal = function () {
            popupModal.show();
        };

    }
])

.controller('addCommentCtrl', ['$scope', '$log',
    function ($scope, $log) {
        $scope.addComment = function () {
            console.log("inside addCommentCtrl");
        }
    }
])