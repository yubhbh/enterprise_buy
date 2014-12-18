'use strict';

angular.module('EPBUY')
    .controller('AddressCtrl', function ($rootScope, $scope, $location, $timeout, $stateParams, $window, Util) {

        $scope.isChoice = $stateParams.Type;
        $scope.addressTitle = $scope.isChoice ? '选择' : '管理';
        $scope.bottomBarCur = 'person'; //初始化bottomBar类型
        $scope.tabIndex = 0; //初始化地址类型
        $scope.choicedIndex = 0; //初始化类型下索引

        $scope.addressCheck = function (type, index) {
            if (!angular.isNumber(type)) {
                return;
            } else {
                if (type === $scope.tabIndex) {
                    $scope.checked = index || 0;
                } else {
                    $scope.checked = -1;
                }
            }
        };

        $scope.addressChoice = function (type, index) {
            if (!angular.isNumber(type) || !angular.isNumber(index)) {
                return;
            } else {
                $scope.tabIndex = type;
                $scope.choicedIndex = index;
                $scope.addressCheck(type, index);
            }
        };

        $scope.addressEdit = function () {
            if ($scope.isChoice) {

                var type = $scope.tabIndex,
                    index = $scope.choicedIndex,
                    obj = $scope.tabIndex ? $scope.enterpriseList[$scope.tabIndex] : $scope.personageList[$scope.choicedIndex];

                $rootScope.addressObj = {
                    Type: type,
                    Index: index,
                    Obj: obj
                };

                $window.history.back();
            } else {
                if ($scope.tabIndex) {}
            }
        };

        Util.ajaxRequest({
            url: 'GetHomeRestaurantBannerInfo',
            data: {
                enterpriseCode: $scope.enterpriseCode // todo...
            },
            success: function (data) {

                $scope.tabIndex = 1;
                $scope.choicedIndex = 3;

                $scope.enterpriseList = data.commentList; //取数据 todo...
                $scope.personageList = data.commentList; //取数据 todo...

                //当选择收货地址时，取order页传过来的index和type，来确定是否企业或是个人的地址索引
                if ($scope.isChoice && $location.search() && $location.search().idx) {
                    $scope.choicedIndex = parseInt($location.search().idx.split('|')[1], 0);
                    $scope.tabIndex = parseInt($location.search().idx.split('|')[0], 0);
                }

                $scope.addressCheck($scope.tabIndex, $scope.choicedIndex);
            }
        });

    });