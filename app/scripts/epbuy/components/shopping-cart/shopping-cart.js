'use strict';

angular.module('EPBUY')
	.directive('shoppingCart', function () {
		return {
			restrict: 'E',
			templateUrl: 'scripts/epbuy/components/shopping-cart/shopping-cart.html',
			controller: function ($rootScope, $timeout) {
				$rootScope.shoppingCartShow = false;
				$timeout(function () {
					$rootScope.shoppingCartShow = true;
					$rootScope.shoppingCart = 11; //todo...
					console.log($rootScope);
				}, 300);

			}
		};
	});