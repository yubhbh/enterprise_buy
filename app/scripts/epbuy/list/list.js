'use strict';

angular.module('EPBUY')
    .controller('ListCtrl', function ($scope, $state, $ionicScrollDelegate, $ionicLoading, $ionicPopup, $timeout, Util, DataCachePool) {

        $scope.isSingle = true; //初始化单列列表
        $scope.priceUp = 'asc'; //初始化价格升序
        $scope.discountUp = 'asc'; //初始化折扣升序
        $scope.pageIndex = 1; //初始化第一页
        $scope.isHeart = $state.is('epbuy.heart');

        $ionicLoading.show({
            template: '<span class="ion-load-d"></span>'
        });

        Util.backDrop.retain();

        if ($scope.isHeart) { //底部bar高亮判断
            $scope.bottomBarCur = 'heart';
            $scope.searchType = 'want'; //列表页搜索接口类型定义

            $scope.wantMore = function () {
                $state.go('epbuy.want-more');
            };

        } else {
            $scope.bottomBarCur = 'home';
            $scope.searchType = 'detail'; //列表页搜索接口类型定义
        }

        $scope.getCategoryList = function () {
            Util.ajaxRequest({ // 分类接口。参数传来Auth, 返回一级产品分类 和二级产品分类列表
                noMask: true,
                url: '$server/InternalPurchase/GetProductCategoryList' + ($scope.isHeart ? '' : ''),
                data: {
                    Auth: DataCachePool.pull('USERAUTH')
                },
                success: function (data) {
                    if (data.List.length > 0) {
                        $scope.sortPrimary = data.List;
                        $scope.sortPrimarySelected = 0;
                        $scope.sortSecondary = data.List[0].SubCategory;
                    }
                },
                error: function (data) {
                    $scope.loadFail = true;
                }
            });
        };

        $scope.getBrandList = function () {
            Util.ajaxRequest({ // 品牌接口，参数传来Auth, 返回品牌列表
                noMask: true,
                url: '$server/InternalPurchase/GetProductBrandList' + ($scope.isHeart ? '' : ''),
                data: {
                    Auth: DataCachePool.pull('USERAUTH')
                },
                success: function (data) {
                    if (data.List.length > 0) {
                        $scope.brandList = data.List;
                    }
                },
                error: function (data) {
                    $scope.loadFail = true;
                }
            });
        };

        $scope.getCategoryList();
        $scope.getBrandList();

        $scope.filtersCtrl = function (type) {
            switch (type) {
            case 'sort': //筛选
                $scope.showBrand = false;
                $scope.showSort = $scope.showSort ? false : true;
                $ionicScrollDelegate.$getByHandle('sortPrimary').scrollTo(0, 0);
                break;
            case 'brand': //品牌
                $scope.showSort = false;
                $scope.showBrand = $scope.showBrand ? false : true;
                break;
            case 'price': //价格
                renderData(type);
                break;
            case 'discount': //折扣
                renderData(type);
                break;
            case 'backdrop':
                $scope.showSort = false;
                $scope.showBrand = false;
                break;
            default:
                $ionicScrollDelegate.$getByHandle('listScroll').scrollTo(0, 0, true);
                $scope.isSingle = $scope.isSingle ? false : true;
                $scope.showSort = false;
                $scope.showBrand = false;
            }
        };

        $scope.sortSelect = function (index) {
            if (typeof index === 'number') {
                $scope.sortPrimarySelected = index;

                var arr = $scope.sortPrimary[index].SubCategory || [];
                if (arr.length > 0) {
                    $scope.sortSecondary = $scope.sortPrimary[index].SubCategory;
                } else {
                    $scope.sortSecondary = [$scope.sortPrimary[index]];
                }

                $ionicScrollDelegate.$getByHandle('sortSecondary').scrollTo(0, 0, true);
            } else {
                $scope.categoryId = index;
                renderData(true);
            }
        };

        $scope.brandSelect = function (brandId) {
            $scope.brandId = brandId;
            renderData(true);
        };

        function dateSubtract(startDate, endDate) { // 活动时间处理

            var sDate = new Date(Date.parse(startDate.replace(/-/g, '/'))),
                eDate = new Date(Date.parse(endDate.replace(/-/g, '/'))),
                rest = '';

            if (sDate.getTime() > eDate.getTime()) {
                console.log('数据错误，开始日期不能大于结束日期！');
            } else {
                var diff = eDate.getTime() - sDate.getTime(),
                    days = Math.floor(diff / (1000 * 60 * 60 * 24));

                diff = diff - days * (1000 * 60 * 60 * 24);

                var hours = Math.floor(diff / (1000 * 60 * 60));

                diff = diff - hours * (1000 * 60 * 60);

                var minutes = diff / 1000;

                if (parseInt(days, 0)) {
                    rest = days + '天' + hours + '小时';
                } else if (parseInt(hours, 0)) {
                    rest = hours + '小时';
                } else {
                    rest = minutes + '分钟';
                }

                return rest;
            }

        }

        function renderData(sort) {

            $scope.showSort = false;
            $scope.showBrand = false;
            $scope.pageIndex = sort ? 1 : $scope.pageIndex;

            Util.ajaxRequest({
                noMask: !sort,
                url: '$server/InternalPurchase/GetActivityProductList' + ($scope.isHeart ? '' : ''),
                data: {
                    Auth: DataCachePool.pull('USERAUTH'),
                    PageNo: $scope.pageIndex,
                    PageSize: 10,
                    Con_CategoryIds: $scope.categoryId || '',
                    Con_BrandIds: $scope.brandId || '',
                    Con_Price: $scope.priceUp,
                    Con_Discount: $scope.discountUp
                },
                success: function (data) {

                    $scope.noNetwork = false;

                    if (data.List && data.List.length > 0) {

                        $scope.startTime = '2014-12-20 12:43:16'.substr(5, 5);
                        $scope.endTime = '2014-12-22 12:43:16'.substr(5, 5);
                        $scope.restTime = dateSubtract('2014-12-20 12:53:16', '2014-12-22 12:43:16');

                        $scope.pageIndex++;
                        $scope.goodsList = sort ? [] : ($scope.goodsList || []);
                        $scope.goodsList = $scope.goodsList.concat(data.List); //拼接数据

                        $scope.$broadcast('scroll.infiniteScrollComplete');

                        if (sort) { // 处理筛选&首屏加载

                            switch (sort) {
                            case 'price':
                                $scope.priceUp = $scope.priceUp === 'asc' ? 'desc' : 'asc';
                                break;
                            case 'discount':
                                $scope.discountUp = $scope.discountUp === 'asc' ? 'desc' : 'asc';
                                break;
                            }

                            $ionicScrollDelegate.$getByHandle('listScroll').scrollTo(0, 0); //刷列表后置顶
                        }

                    } else {
                        $scope.noResults = true;
                    }
                },
                error: function (data) {
                    $scope.noNetwork = true;
                }
            });
        }

        $scope.loadMore = function () { //翻页加载
            renderData(false);
        };

        $scope.toDetail = function (goodsId) {
            var router = $scope.isHeart ? 'want' : 'detail';
            $state.go('epbuy.' + router, {
                GoodsId: goodsId
            });
        };

        $scope.wantToHeart = function (index, item) {
            if ($scope.goodsList[index].hasHeart) {
                return;
            }

            Util.ajaxRequest({
                url: 'GetHomeRestaurantBannerInfo',
                data: {
                    enterpriseCode: item.commentPrize // todo...
                },
                success: function (data) {

                    $scope.goodsList[index].hasHeart = true; // todo...
                    $scope.goodsList[index].commentPrize++;

                }
            });

        };

    });