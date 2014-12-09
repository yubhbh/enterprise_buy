'use strict';

angular.module('EPBUY')
    .controller('HomeCtrl', function ($scope, $cacheFactory, $state, $timeout, Util) {

        $scope.bottomBarCur = 'home';
        $scope.searchObj = {};

        var homeData = $cacheFactory.get('homeData');

        if (homeData && homeData.info().commentList) {
            $scope.hasActivity = true;
            $scope.productList = homeData.info().commentList; //取缓存数据
        } else {
            Util.ajaxRequest({
                url: 'GetHomeRestaurantBannerInfo',
                success: function (data) {

                    if (data.commentList && data.commentList.length > 0) {
                        $scope.hasActivity = true;

                        $cacheFactory('homeData', data);

                        $scope.productList = data.commentList; //取数据 todo...
                    }

                }
            });
        }

        $scope.showSearch = function () {
            $scope.searching = true;
            $scope.searchResultList = true;
        };

        $scope.hideSearch = function () {
            $scope.searchObj.searchVal = null;
            $scope.searchResultList = false;
            $scope.searching = false;
        };

        $scope.chooseItemSearch = function (itemId) {
            console.log(itemId);
            if (itemId) {
                $state.go('epbuy.login');
            } else {
                console.log('itemId error');
            }
        };

        var searchTimer = null;
        $scope.searchChange = function () { //监听搜索输入框的值

            if ($scope.searchObj.searchVal) {

                $timeout.cancel(searchTimer);

                searchTimer = $timeout(function () {
                    Util.ajaxRequest({
                        url: 'GetHomeRestaurantBannerInfo',
                        effect: 'false',
                        success: function (data) {
                            if (data.commentList && data.commentList.length > 0) {
                                $scope.searchResultList = data.commentList; //取数据 todo...
                            } else {
                                $scope.searchResultList = false;
                            }
                        },
                        error: function (data) {
                            $scope.searchResultList = false;
                        }
                    });
                }, 300);

            } else {
                $timeout.cancel(searchTimer);
                $scope.searchResultList = false;
            }
        };

        $scope.onScroll = function () {};

    });