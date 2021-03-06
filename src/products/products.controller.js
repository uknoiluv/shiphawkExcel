(function () {
'use strict';

angular.module('appxls')
.controller('productsController',
['$scope', '$q', 'productService', 'shiphawkService', productsController]);

/**
* Controller constructor.
*/
function productsController($scope, $q, productService, shiphawkService) {
var vm = this;

// suppliers
vm.suppliers = [];
vm.selectedSupplier = undefined;
// categories
vm.categories = [];
vm.selectedCategory = undefined;
// products
vm.products = [];

vm.clearFilters = clearFilters;
vm.addProducts = addProducts;
vm.addShippingQuotes = addShippingQuotes;
vm.refreshProductList = refreshProductList;
vm.getMatches = getMatches;

/** *********************************************************** */

init();

/**
* Initialize the controller.
*/
function init() {
  // start by loading suppliers
  loadSuppliers()
      .then(function (suppliers) {
        vm.suppliers = suppliers;

        // then load categories
        return loadCategories();
      })
      .then(function (categories) {
        vm.categories = categories;

        // finally load products
        return refreshProductList();
      });

  // setup listeners to filter changes
  $scope.$watch('vm.selectedSupplier', function (newValue, oldValue) {
    console.log('supplier changed to ' + newValue);
    refreshProductList();
  });
  $scope.$watch('vm.selectedCategory', function (newValue, oldValue) {
    console.log('category changed to ' + newValue);
    refreshProductList();
  });

  $scope.$watch('vm.selectedItem', function (newValue, oldValue) {
      if(newValue == 'queen mattress'){
        vm.height = 82;
        vm.length = 60;
        vm.width = 20;
        vm.weight = 60;
      }

  });
}




function getMatches(search){
//   shiphawkService.getJobs(search).success(function(data){
//     console.log('hello', data);
//
//   }).error(function(data){
//     console.log('cores', data);
//
//   });

  return [{value: 'queen mattress', display: 'queen mattress'},
    {value: 'king mattress', display: 'king mattress'},
    {value: 'mattress', display: 'mattress'},
    {value: 'twin mattress', display: 'twin mattress'}
  ];


}

/**
* Refreshes the product list when things change.
*/
function refreshProductList() {
  loadProducts()
      .then(function (results) {
        vm.products = results;
      });
}

function clearFilters(){
  vm.selectedSupplier = undefined;
  vm.selectedCategory = undefined;
}

function addProducts(){
  var results = [];

  vm.products.forEach(function(element){
    if (element.isSelected){
      results.push(element);
    }
  });

  console.log('selected products',results);

  // build data to write out
  var spreadsheetData = [];
  results.forEach(function(product){
    var lineItem = [];
    lineItem.push(product.ProductID);
    lineItem.push(product.ProductName);
    lineItem.push(product.QuantityPerUnit);
    lineItem.push(product.UnitPrice);
    lineItem.push(product.Discontinued);

    spreadsheetData.push(lineItem);
  });


  Office.context.document.bindings.addFromNamedItemAsync('A1:E' + spreadsheetData.length, 'matrix', {id:'invoiceLineItems'}, function (asyncResult) {
    if (asyncResult.status == Office.AsyncResultStatus.Succeeded) {
      // add the data
      Office.select('bindings#invoiceLineItems').setDataAsync(spreadsheetData, {coercionType:'matrix'}, function(asyncResult){
      });
    }
  });

}


function addShippingQuotes() {
  console.log('hit');
  var shippingInfo = [];
  var shippingData = [];
  shippingInfo.push(vm.height);
  shippingInfo.push(vm.width);
  shippingInfo.push(vm.length);
  shippingInfo.push(vm.pounds);
  shippingInfo.push(vm.cost);
  
  shippingData.push(shippingInfo);

  Office.context.document.bindings.addFromNamedItemAsync('A1:E1', 'matrix', {id:'invoiceLineItems'}, function (asyncResult) {
    if (asyncResult.status == Office.AsyncResultStatus.Succeeded) {
      // add the data
      Office.select('bindings#invoiceLineItems').setDataAsync(shippingData, {coercionType:'matrix'}, function(asyncResult){
      });

    }
  });   
}

/**
* Loads the suppliers.
*/
function loadSuppliers() {
  var deferred = $q.defer();

  productService.getSuppliers()
      .then(function (results) {
        deferred.resolve(results);
      });

  return deferred.promise;
}

/**
* Loads the categories.
*/
function loadCategories() {
  var deferred = $q.defer();

  productService.getCategories()
      .then(function (results) {
        deferred.resolve(results);
      });

  return deferred.promise;
}

/**
* Loads the products.
*/
function loadProducts() {
  var deferred = $q.defer();

  productService.getProducts(vm.selectedSupplier, vm.selectedCategory)
      .then(function (results) {
        deferred.resolve(results);
      });

  return deferred.promise;
}

}
})();