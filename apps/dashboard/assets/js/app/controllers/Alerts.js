angular.module('do.alerts', [])

.config(['$stateProvider',
  function ($stateProvider) {
    $stateProvider
      .state('alerts', {
        url: '/apps/:id/segments/alerts',
        views: {
          "main": {
            templateUrl: '/templates/alertsmodule/users.segments.alerts.html',
            controller: 'alertCtrl'
          }
        },
        authenticate: true
      })
      .state('newalerts', {
        url: '/apps/:id/segments/alerts/new',
        views: {
          "main": {
            templateUrl: '/templates/alertsmodule/users.segments.alerts.new.html',
            controller: 'newAlertCtrl'
          }
        },
        authenticate: true
      })
  }
])

.controller('alertCtrl', ['$scope', 'AlertModel', '$modal', 'modelsSegment',
  '$stateParams', 'segmentService', 'AppModel', 'AppService', 'AlertService',
  function ($scope, AlertModel, $modal, modelsSegment, $stateParams,
    segmentService, AppModel, AppService, AlertService) {

    $scope.segments = [];
    $scope.teammembers = [];
    $scope.appId = $stateParams.id;

    var showAllAlerts = function (err, data) {
      if (err) {
        console.log("error");
        return;
      }
      console.log("alerts: ", data);
      // $scope.allAlerts = data;
      console.log("underscore alerts: ", _.values(data)[0], _.keys(data)
        .length);
      $scope.allAlerts = _.values(data)[0];
    }

    AlertModel.getAllAlerts(showAllAlerts);

    var callback = function (err) {
      if (err) {
        console.log("error");
      }
      for (var i = 0; i < segmentService.getSegments()
        .length; i++) {
        $scope.segments.push({
          name: segmentService.getSegments()[i].name,
          id: segmentService.getSegments()[i]._id
        });

        $scope.selectedSegment = {
          name: $scope.segments[0].name,
          id: $scope.segments[0].id
        };
      }
    }

    modelsSegment.getAllSegments($scope.appId, callback);

    var callbackSingleApp = function () {
      console.log("team : ", AppService.getCurrentApp());
      for (var i = 0; i < AppService.getCurrentApp()
        .team.length; i++) {
        $scope.teammembers.push({
          name: AppService.getCurrentApp()
            .team[i].username,
          checked: true,
          id: AppService.getCurrentApp()
            .team[i]._id
        });
      };
      // $scope.teammembers = AppService.getCurrentApp().
    }

    AppModel.getSingleApp($stateParams.id, callbackSingleApp);

    $scope.userStatus = [{
      value: 'enters'
    }, {
      value: 'leaves'
    }];

    $scope.status = {
      value: 'enters'
    };

    $scope.editAlert = function (id) {
      var callbackSingleAlert = function (err, alert) {
        var openUpdateModal = function () {
          console.log("inside update modal");
          var modalInstance1 = $modal.open({
            templateUrl: '/templates/alertsmodule/update.alert.modal.html',
            controller: 'updateAlertCtrl',
            size: 'lg'
          })
        }
        console.log("callback single alert: ", _.values(alert)[0].when);
        // $scope.statusUpdate = _.values(alert)[0].when;
        AlertService.setSingleAlert(_.values(alert)[0]);
        console.log("statusUpdate Value: ", $scope.statusUpdate);
        openUpdateModal();
      }

      AlertModel.getSingleAlert($stateParams.id, id, callbackSingleAlert);

    }

    $scope.changeBtnTextUpdate = function (index) {
      $scope.statusUpdate = $scope.userStatus[index].value
    }

    $scope.changeSelectedSegmentUpdate = function (index) {
      $scope.selectedSegmentUpdate.name = $scope.segments[index].name;
      $scope.selectedSegmentUpdate.id = $scope.segments[index].id;
    }

    $scope.changeBtnText = function (index) {
      $scope.status.value = $scope.userStatus[index].value;
      console.log("$scope.status.value: ", $scope.status.value);
    }

    $scope.changeSelectedSegment = function (index) {
      $scope.selectedSegment.name = $scope.segments[index].name;
      $scope.selectedSegment.id = $scope.segments[index].id;
    }

    $scope.openNewAlertModal = function (size) {

      var modalInstance = $modal.open({
        templateUrl: '/templates/alertsmodule/new.alert.modal.html',
        controller: 'createNewAlertCtrl',
        size: size
      });

      modalInstance.opened.then(function () {
        // $log.info(
        //   'message modal template downloaded'
        // );
      })

      var alertsTeam = [];

      modalInstance.result.then(function (alert) {
        console.log("team: ", $scope.teammembers);
        for (var i = 0; i < $scope.teammembers.length; i++) {
          console.log("checked or not: ", $scope.teammembers[i].checked);
          if ($scope.teammembers[i].checked) {
            alertsTeam.push($scope.teammembers[i].id);
          }
        };
        console.log("alertsTeam: ", alertsTeam);
        alert.team = alertsTeam;
        // alert.when = $scope.status.value;
        console.log("alert : ", alert);
        console.log("segment: ", alert.segment);
        AlertModel.createNewAlert($scope.appId, alert);
      }, function () {
        // $log.info('Modal dismissed at: ' +
        //   new Date());
      });
    };


  }
])

.controller('newAlertCtrl', ['$scope',
  function ($scope) {

  }
])

.controller('createNewAlertCtrl', ['$scope', '$modal',
  '$modalInstance',
  function ($scope, $modal, $modalInstance) {
    console.log("inside send message ctrl: ");
    var element = document.getElementsByTagName("input");
    console.log("element: ", element, document.myForm);
    for (var i = 0; i < element.length; i++) {
      if (element[i].type == "checkbox") {
          console.log(element[i].checked);
      }
    };
    $scope.createNewAlert = function () {
      $scope.alert = {
        when: document.getElementById('status')
          .textContent,
        title: document.getElementById('title')
          .value,
        sid: document.getElementById('segmentId')
          .textContent
        // team:
      }
      $modalInstance.close($scope.alert);
      console.log("$scope.alert: ", $scope.alert);
      console.log("status: ", document.getElementById('status')
        .textContent);
    }
  }
])

.controller('updateAlertCtrl', ['$scope', '$modal',
  '$modalInstance', 'AlertService',
  function ($scope, $modal, $modalInstance, AlertService) {

    $scope.statusUpdate = AlertService.getSingleAlert().when;
    $scope.selectedSegmentUpdate = {
      name: AlertService.getSingleAlert().segment.name,
      id: AlertService.getSingleAlert().segment._id
    }


    // $scope.statusUpdate = 'enters';
    // console.log("inside send message ctrl: ");
    // var elements = document.getElementsByTagName('input');
    // console.log("elements: ", elements);
    // for (var i = 0; i < elements.length; i++) {
    //   if(elements[i].type == 'checkbox') {
    //     console.log("checkboxes: ", elements[i]);
    //   }
    // };
    // $scope.createNewAlert = function () {
    //   $scope.alert = {
    //     when: document.getElementById('status')
    //       .textContent,
    //     title: document.getElementById('title')
    //       .value,
    //     sid: document.getElementById('segmentId')
    //       .textContent
    //     // team:
    //   }
    //   $modalInstance.close($scope.alert);
    //   console.log("$scope.alert: ", $scope.alert);
    //   console.log("status: ", document.getElementById('status')
    //     .textContent);
    // }
  }
])
