'use strict';

angular.module('EPBUY')
    .controller('OrderListCtrl', function ($scope, $state, $ionicLoading, $location, Util, DataCachePool) {

        var orderStatus = '';
        if ($location.search() && $location.search().type) {
            var type = $location.search().type;
            switch (type) {
            case 'pay':
                orderStatus = '待支付';
                $scope.orderListTitle = '待付款';
                break;
            case 'rec':
                orderStatus = '待收货';
                $scope.orderListTitle = '待收货';
                break;
            default:
                orderStatus = '全部';
                $scope.orderListTitle = '全部';
            }
        } else {
            orderStatus = '全部';
            $scope.orderListTitle = '全部';
        }

        $scope.pageIndex = 1;
        $scope.orderList = [];
        $ionicLoading.show({
            template: '<span class="ion-load-d"></span>'
        });

        Util.backDrop.retain();

        function renderData() {
            Util.ajaxRequest({
                noMask: true,
                url: '$server/Myself/GetOrderListByAuth',
                data: {
                    Auth: DataCachePool.pull('USERAUTH'),
                    OrderStatus: orderStatus,
                    pageIndex: $scope.pageIndex,
                    pageSize: 100
                },
                success: function (data) {

                    $scope.noNetwork = false;

                    if (data.orderList && data.orderList.length > 0) {

                        for (var i = 0; i < data.orderList.length; i++) {
                            data.orderList[i].OrderDate = data.orderList[i].OrderDate.replace(/:{1}\w{2}\.{1}.+$/g, '').replace('T', ' ');
                        }

                        $scope.orderList = $scope.orderList.concat(data.orderList);

                        // 待支付
                        // 待收货
                        // 已取消
                        // 已完成
                        // 已退货
                        // 已退款
                        // 已发货
                        // 已签收
                        // 已拒收
                        // 已完成

                        // if ($scope.pageIndex * 10 >= data.ordercount) {
                        //     $scope.loadMoreAble = false;
                        // } else {
                        //     $scope.$broadcast('scroll.infiniteScrollComplete');
                        //     $scope.pageIndex++;
                        //     $scope.loadMoreAble = true;
                        // }

                    } else {
                        if ($scope.orderList.length === 0) {
                            $scope.noResults = true;
                        } else {
                            $scope.noMordResults = true;
                        }
                    }
                },
                error: function (data) {
                    $scope.noNetwork = true;
                }
            });
        }

        renderData();

        $scope.loadMore = function () { //翻页加载
            renderData();
        };

        $scope.toOrderDetail = function (orderId) {
            if (!orderId) {
                return;
            }

            $state.go('epbuy.order-detail', {
                OrderId: orderId
            });
        };

    });
