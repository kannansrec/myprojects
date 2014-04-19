/* Loads config file */
angular.forEach(document.scripts, function(script){
    if(script.attributes["data-config"]){
        //Todo load config file
        //var configURL = script.attributes["data-config"];
    }
});
//Define an angular module for our app
var ZainettoApp = angular.module('ZainettoApp', ['ngRoute', 'ngResource']);

/* Router */
ZainettoApp.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
            when('/home', {
                templateUrl: 'partials/home.html',
                controller: 'HomeController'
            }).
            when('/products', {
                templateUrl: 'partials/product-list.html',
                controller: 'ProductController'
            }).
            when('/techsupport', {
                templateUrl: 'partials/support.html',
                controller: 'SupportController'
            }).
            when('/enquiry', {
                templateUrl: 'partials/enquiry.html',
                controller: 'EnquiryController'
            }).
            when('/careers', {
                templateUrl: 'partials/careers.html',
                controller: 'CareerController'
            }).
            when('/policy', {
                templateUrl: 'partials/policy.html'
            }).
            otherwise({
                redirectTo: '/home'
            });
    }
]);

/* Controller */
ZainettoApp.controller('NavigationController', ['$scope',
    function($scope){
        //TODO read from the config file
        $scope.navs = [
            {"id": 1, "navID": "home", "caption": "Home"},
            {"id": 2, "navID": "products", "caption": "Products"},
            {"id": 3, "navID": "techsupport", "caption": "Support"},
            {"id": 4, "navID": "enquiry", "caption": "Enquiry"},
            {"id": 5, "navID": "careers", "caption": "Careers"}
        ];

        $scope.menuClick = function(event){
            $scope.$parent.selected = this.nav.id;
        }
    }
]);

ZainettoApp.controller('HomeController', ['$scope', 'ZainettoService',
    function($scope, ZainettoService){
        $scope.$parent.selected = 1;
        ZainettoService.getData('data/employees.json')
            .success(function(response){
                $scope.employees = response;
                $scope.selected = $scope.employeeInfo = $scope.employees[0];
                $scope.showEmployee = true;
            })
            .error(function(response){ /*todo error case */ });

        $scope.handleClick = function($event){
            if ($event.stopPropagation) $event.stopPropagation();
            if ($event.preventDefault) $event.preventDefault();
            $scope.selected = $scope.employeeInfo = this.employee;
            $scope.showEmployee = true;
        };

        $scope.isSelected = function(employee) {
            return $scope.selected === employee;
        };

        $scope.hideEmpInfo = function($event){
            $scope.showEmployee = false;
            $scope.selected = "";
            if ($event.stopPropagation) $event.stopPropagation();
            if ($event.preventDefault) $event.preventDefault();
        };
    }
]);

ZainettoApp.controller('ProductController', ['$scope', '$rootScope', 'ZainettoService',
    function($scope, $rootScope, ZainettoService){
        $scope.$parent.selected = 2;
        $scope.showProduct = false;
        $scope.currentPage = 0;
        $scope.pageSize = 15;
        $scope.products = [];
        ZainettoService.getData('data/products.json')
            .success(function(response){
                $scope.initialize(response);
            })
            .error(function(response){ /*todo error case */ });

        $scope.initialize = function(products){
            angular.forEach(products, function(product){
                product.prodImg = 'img/product/' + product.ProductID + '.png';
                $scope.products.push(product);
            });
            $scope.noOfPages =  $scope.products.length/$scope.pageSize;
        };

        $scope.handleRowClick = function(){
            $scope.showProduct = true;
            $scope.$parent.showOverlay = true;
            $scope.productInfo = this.product;
            angular.element(".prod-detail input")[0].focus();
        };

        $scope.handleKeyDown = function(){
            if (event.keyCode == 27) {
                $scope.showProduct = false;
                $scope.$parent.showOverlay = false;
            } else {
                return;
            }
        };

        $scope.isSelected = function(product) {
            return $scope.selected === product;
        }
    }
]);

ZainettoApp.controller('SupportController', ['$scope',
    function($scope) {
        $scope.$parent.selected = 3;
    }
]);

ZainettoApp.controller('EnquiryController', ['$scope',
    function($scope) {
        $scope.$parent.selected = 4;
    }
]);

ZainettoApp.controller('CareerController', ['$scope',
    function($scope) {
        $scope.$parent.selected = 5;
    }
]);

/* Service */
/*
ZainettoApp.service('ZainettoService', ['$resource', '$rootScope', '$http', function($resource, $rootScope, $http){
        this.trigger = function(method) {
            var args = Array.prototype.slice.call(arguments, 1);
            args = args.join(',');
            $rootScope.$broadcast(method, args);
        }

        this.getData = function(url){
            return $http.get(url);
        }
    }]
);
*/

/* Factory */
ZainettoApp.factory('ZainettoService', ['$rootScope', '$http',
    function($rootScope, $http){
        return {

            trigger: function(method) {
                var args = Array.prototype.slice.call(arguments, 1);
                args = args.join(',');
                $rootScope.$broadcast(method, args);
            },

            getData: function(url){
                return $http.get(url);
            }
        };
    }]);

/* Directive */

ZainettoApp.directive('productDetail', function(){
    return{
        restrict: 'A',
        templateUrl : 'partials/careers.html',
        link: function(scope, element){
            scope.close = function(){
                this.showProduct = false;
                this.$parent.showOverlay = false;
            }
        }
    };
});

ZainettoApp.directive('ngGoogleMap', function(){
    return {
        restrict: 'E',
        link: function(scope, element){
            scope.init = function(){
                if(typeof(google) == "undefined"){
                    scope.el.html("<p><h1>You are not connected to internet to access the Google Map</h1></p>");
                    return;
                }
                google.maps.visualRefresh = true;
                var mapOptions = {
                    zoom: 10,
                    center: new google.maps.LatLng(1, 1),
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                };
                scope.map = new google.maps.Map(element[0], mapOptions);
                scope.marker = new google.maps.Marker({ map: scope.map});
            }

            scope.$on('locateByAddress', function(event, data) {
                scope.locateByAddress(data);
            });

            scope.$on('loadMap', function(event, data) {
                scope.init();
            });

            scope.locateByAddress = function(address){
                var position = null;
                var geocoder = new google.maps.Geocoder();
                geocoder.geocode({ 'address': address }, function(results, status) {
                    if (status == google.maps.GeocoderStatus.OK) {
                        position =  results[0].geometry.location;
                        scope.render(position);
                    }
                });
            };

            scope.render = function(position){
                scope.map.setCenter(position);
                scope.marker.setPosition(position);
                //this.marker.setTitle(this.model.get("title"));
                scope.marker.setAnimation("BOUNCE");
            };

            scope.init();
        }
    }
});

ZainettoApp.directive('ngOverlay', function(){
    return{
        restrict: 'E',
        link: function(scope){
            scope.showOverlay = function(){

            }
            scope.hideOverlay = function(){

            }
        }
    };
});

/* Filter */
ZainettoApp.filter('startFrom', function() {
    return function(data, index){
        index = +index; //parse to int
        return data.slice(index);
    }
});