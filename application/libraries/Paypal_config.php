<?php

require_once(APPPATH.'libraries/PaypalHelper.php');
/*
	* Config for PayPal specific values
*/
// PayPal Environment 
define("PAYPAL_ENVIRONMENT", "production");

// PayPal REST API endpoints
define("PAYPAL_ENDPOINTS", array(
	"sandbox" => "https://api.sandbox.paypal.com",
	"production" => "https://api.paypal.com"
));

// PayPal REST App credentials
define("PAYPAL_CREDENTIALS", array(
	"sandbox" => [
		"client_id" => "AURpMV6wCSZWQDfmrtMKNk1YFGCpwzvsyiOV5km6a-MbDmTNlr6gfa1dYSH8BQNBIk0wtNP-fPRBe85t",
		"client_secret" => "ECl2xUjP5PpeH5BgVGzXY6UT2kO6iZdAqUGoHiWBt3-QfY_aQSIlGA1j4FguHfRdenMRiuPLOjFA-zdu"
	],
	"production" => [
		"client_id" => "AekAprLmPosM0ilTBl9AYDxsyxPpmgAw6f3_BcDiHxnsfGyScEkoVQvu07FUKIRHR6Koit1iZ85lgApc",
		"client_secret" => "EJzPXdl8JR93NG5zzXyt7AF_af5gci2gyBx1ij3Z-UN2FvDQLvAtlVyEL96jYVzEMlpYKe-E2ZTYwU4M"
	]
));

// PayPal REST API version
define("PAYPAL_REST_VERSION", "v2");

// ButtonSource Tracker Code
define("SBN_CODE", "PP-DemoPortal-EC-Psdk-ORDv2-php");

