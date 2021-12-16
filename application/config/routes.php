<?php
defined('BASEPATH') OR exit('No direct script access allowed');

/*
| -------------------------------------------------------------------------
| URI ROUTING
| -------------------------------------------------------------------------
| This file lets you re-map URI requests to specific controller functions.
|
| Typically there is a one-to-one relationship between a URL string
| and its corresponding controller class/method. The segments in a
| URL normally follow this pattern:
|
|	example.com/class/method/id/
|
| In some instances, however, you may want to remap this relationship
| so that a different class/function is called than the one
| corresponding to the URL.
|
| Please see the user guide for complete details:
|
|	https://codeigniter.com/user_guide/general/routing.html
|
| -------------------------------------------------------------------------
| RESERVED ROUTES
| -------------------------------------------------------------------------
|
| There are three reserved routes:
|
|	$route['default_controller'] = 'welcome';
|
| This route indicates which controller class should be loaded if the
| URI contains no data. In the above example, the "welcome" class
| would be loaded.
|
|	$route['404_override'] = 'errors/page_missing';
|
| This route will tell the Router which controller/method to use if those
| provided in the URL cannot be matched to a valid route.
|
|	$route['translate_uri_dashes'] = FALSE;
|
| This is not exactly a route, but allows you to automatically route
| controller and method names that contain dashes. '-' isn't a valid
| class or method name character, so it requires translation.
| When you set this option to TRUE, it will replace ALL dashes in the
| controller and method URI segments.
|
| Examples:	my-controller/index	-> my_controller/index
|		my-controller/my-method	-> my_controller/my_method
*/
// payment API version 3
$route['v3/order/(:any)/invoice'] = 'Order/getInvoice/$1/invoice';
$route['v3/order/get-orders-data'] = 'Order/checkReferenceNumVersion3';
// $route['v3/order/source/success'] = 'Order/orderPaymentV3/$1';
// $route['v3/order/callback'] = 'Order/callbackVersion3';
// $route['v3/order/(:any)'] = 'Order/orderPaymentV2/$1';


// payment API version 2
$route['v2/order/bitcoin/callback'] = 'Webhook/orderBitcoinPayment'; /* BLOCKONOMICS CALLBACK */
$route['v2/order/paymaya/webhook/success'] = 'Webhook/orderPaymentWebhook/'; /* PAYMAYA WEBHOOK SUCCESS */
$route['v2/order/paymaya/webhook/failure'] = 'Webhook/orderPaymentWebhook/'; /* PAYMAYA WEBHOOK FAIL */
$route['v2/order/paymaya/webhook/dropout'] = 'Webhook/orderPaymentWebhook/'; /* PAYMAYA WEBHOOK DROPOUT */

$route['v2/order/callback/paymaya'] = 'Paymaya/callback';
$route['v2/order/callback/paypal'] = 'Paypal/callback';
$route['v2/order/check-order-status'] = 'Order/checkOrderStatus';
$route['v2/order/(:any)/invoice'] = 'Order/getInvoice/$1/invoice';
$route['v2/order/callback'] = 'Order/callback';
$route['v2/order/get-orders-data'] = 'Order/checkReferenceNum'; 
$route['v2/order/(:any)/paymaya/webhook'] = 'Paymaya/
/$1/webhook';
$route['v2/order/(:any)'] = 'Order/orderPaymentV2/$1';

$route['bitcoin/check-btc-payment-status'] = 'Bitcoin/checkPaymentStatus'; /* BLOCKONOMICS BITCOIN PAYMENT STATUS */
$route['bitcoin/sample/callback'] = 'bitcoin/callback'; /*  BITCOIN Callback */
$route['api/v2/btc/_callback/c638e8cd612ace68cd34b2ae'] = 'bitcoin/paymentBlockonomicsCallback'; /* BLOCKONOMICS BITCOIN ADDRESS */
$route['bitcoin/bitcoin-payment'] = 'bitcoin/bitcoinPaymentDetails'; /* BLOCKONOMICS BITCOIN ADDRESS */
$route['bitcoin/address/(:any)/txs'] = 'bitcoin/showAddressTxs/$1/txs';
$route['order/tx/(:any)'] = 'order/errorPage';
$route['order/tx'] = 'order/errorPage';
$route['paypal/patch-order/(:any)'] = 'paypal/patchOrder/$1';
$route['get-orders-data'] = 'order/checkReferenceNum';
$route['back_to_shop'] = 'shop/back_to_shop';

$route['default_controller'] = 'Order';
$route['404_override'] = 'Error404';
$route['translate_uri_dashes'] = TRUE;

