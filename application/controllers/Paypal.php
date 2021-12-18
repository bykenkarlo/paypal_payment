<?php
defined('BASEPATH') OR exit('No direct script access allowed');
date_default_timezone_set('Asia/Manila');


class Paypal extends CI_Controller {
   
    function __construct() {
        parent::__construct();
        $this->load->model('paypal_model');
        require_once(APPPATH.'libraries/Paypal_config.php');
        require_once(APPPATH.'libraries/PaypalHelper.php');
        if (strpos(base_url(), 'localhost') !== false) {
            DEFINE('PAYPAL_ENV', 'https://www.paypal.com/sdk/js?client-id=sb&commit=false&currency=PHP'); ; /* sandbox */
        }
        else{
            DEFINE('PAYPAL_ENV', 'https://www.paypal.com/sdk/js?client-id=YOUR_CLIENT_ID&commit=false&currency=PHP'); ; /* sandbox */
        }
    }
    public function index(){
        header('location: '.base_url('paypal/order/PP123456789'));
    }
    public function orderPayment($ref_no){
        

        $data['ref_no'] = $ref_no;
        $data['orderData'] = $this->paypal_model->getOrderReferenceNumber($ref_no); /* SAMPLE REF NO */
        $this->session->set_userdata('total_amount', $data['orderData']['amount']); /* SET SESSION FOR TOTAL AMOUNT FOR VERIFICATION LATER */
        $this->load->view('order_payment', $data);
    }
    public function callback(){
        $ref_no = $this->input->post('ref_no'); /* order reference number */
        $orderID = $this->input->post('orderID'); /* PAYPAL Order ID */
        $captured_amount = $this->input->post('capture_amount'); /* amount captured from PAYPAL process*/

        /* get order data */ 
        $orderData = $this->order_model->getOrderDataByRefNo($ref_no); /* GET ORDER DATA BY REFERENCE NO */
        $orderedAmount = number_format($orderData['price'], 2, '.', '');

        /* CHECK IF IN STOCK */ 
        if($orderData['stock'] == 'inStock') {

            /* PAYPAL PAYMENT METHOD ERROR AMOUNT */ 
            if($orderData['payment_method'] !== 'Paypal'){
                $data['status'] = 'failed';
                $data['message'] = 'Payment Error! Refresh the page and try again!';
            }

             /* PAYPAL PAYMENT METHOD ERROR AMOUNT */ 
            else if($captured_amount !== $orderedAmount){
                $data['status'] = 'failed';
                $data['message'] = 'Payment Error! Refresh the page and try again!';
            }

            /* PAYPAL PAYMENT METHOD */ 
            else {
                /* check if order status still PENDING / UNPAID that need to process*/
                if ($orderData['status'] == 'PENDING') { 
                    /* SUCCESS */
                    /* UPDATE DATA STATUS TO PAID/COMPLETE/DELIVERED */
                }


                else {
                    $data['status'] = 'failed';
                    $data['message'] = 'Payment Error! Refresh the page and try again!';
                }
            }
        }

        /* OUT OF STOCK */ 
        else  {
           $data['status'] = 'failed';
           $data['message'] = 'Payment Failed! Product is out of Stock!';
       }
        /*output data*/ 
        $this->output->set_content_type('application/json')->set_output(json_encode($data));
    }
    public function orderCreate(){
        $order_ref_no = $this->input->post('ref_no');
        $orderData = $this->paypal_model->getOrderReferenceNumber($order_ref_no); /* GET ORDER DATA BY REFERENCE NO*/

        $productStock = 'inStock'; /* CHECK DATABASE IF IN OR OUT OF STOCK */

        $subtotal = $orderData['amount'] - $orderData['charge'];
        $sub_total = number_format($subtotal, 2, '.', '');
        $service_charge = number_format($orderData['charge'], 2, '.', '');
        $total_amount = $orderData['amount'] + $orderData['charge'];
        
        // CHECK IF PRODUCT IS OUT OF STOCK
        if($productStock == 'outOfStock'){
            $data['status'] = 'failed';
            $data['message'] = 'Payment Failed! Product is out of Stock!';

            $this->output->set_content_type('application/json')->set_output(json_encode($data));
        }
        
        // CHECK SESSION AMOUNT OR DECLARED AMOUNT IS THE SAME ON YOUR DATABASE
        else if ($orderData['amount'] !== $this->session->total_amount) {
            $data['status'] = 'failed';
            $data['message'] = 'INVALID Paid Amount!';

            $this->output->set_content_type('application/json')->set_output(json_encode($data));
        }
        
        else if($orderData['payment_method'] == 'paypal'){
            $paypalHelper = new PayPalHelper;
            $orderData = '{
                "intent" : "CAPTURE",
                "purchase_units" : [ 
                    {
                        "reference_id" : "'.$this->input->post('ref_no').'",
                        "description" : "Cheapest and easiest way to buy game vouchers online.",
                        "amount" : {
                            "currency_code" : "'.$this->input->post('currency').'",
                            "value" : "'.$this->session->total_amount.'",
                            "breakdown" : {
                                "item_total" : {
                                    "currency_code" : "'.$this->input->post('currency').'",
                                    "value" : "'.$subtotal.'"
                                },
                                "shipping" : {
                                    "currency_code" : "'.$this->input->post('currency').'",
                                    "value" : "0.00"
                                },
                                "tax_total" : {
                                    "currency_code" : "'.$this->input->post('currency').'",
                                    "value" : "0.00"
                                },
                                "handling" : {
                                    "currency_code" : "'.$this->input->post('currency').'",
                                    "value" : "'.$service_charge.'"
                                },
                                "shipping_discount" : {
                                    "currency_code" : "'.$this->input->post('currency').'",
                                    "value" : "0.00"
                                },
                                "insurance" : {
                                    "currency_code" : "'.$this->input->post('currency').'",
                                    "value" : "0.00"
                                }
                            }
                        },
                        "items" : [{
                            "name" : "'.$this->input->post('item_name').' ",
                            "description" : "Order ref. no. '.$this->input->post('ref_no').'",
                            "sku" : "'.$this->input->post('sku').'",
                            "unit_amount" : {
                                "currency_code" : "'.$this->input->post('currency').'",
                                "value" : "'.$subtotal.'"
                            },
                            "quantity" : "1",
                            "category" : "'.$this->input->post('category').'"
                        }]
                    }
                ]
            }';

            // IF SHHIPPING IS APPLICABLE
            // if(array_key_exists('shipping_country_code', $_POST)) {
            //     $orderDataArr = json_decode($orderData, true);
            //     $orderDataArr['application_context']['shipping_preference'] = "SET_PROVIDED_ADDRESS";
            //     $orderDataArr['application_context']['user_action'] = "PAY_NOW";
                
            //     $orderDataArr['purchase_units'][0]['shipping']['address']['address_line_1']= $this->input->post('shipping_line1');
            //     $orderDataArr['purchase_units'][0]['shipping']['address']['address_line_2']= $this->input->post('shipping_line2');
            //     $orderDataArr['purchase_units'][0]['shipping']['address']['admin_area_2']= $this->input->post('shipping_city');
            //     $orderDataArr['purchase_units'][0]['shipping']['address']['admin_area_1']= $this->input->post('shipping_state');
            //     $orderDataArr['purchase_units'][0]['shipping']['address']['postal_code']= $this->input->post('shipping_postal_code');
            //     $orderDataArr['purchase_units'][0]['shipping']['address']['country_code']= $this->input->post('shipping_country_code');

            //     $orderData = json_encode($orderDataArr);
            // }

            $this->output->set_content_type('application/json')->set_output(json_encode($paypalHelper->orderCreate($orderData)));
        }

    }
    public function orderCapture(){
        $paypalHelper = new PayPalHelper;
        $this->output->set_content_type('application/json')->set_output(json_encode($paypalHelper->orderCapture()));

    }
    public function getOrderDetails(){
        $_SESSION['order_id'] = $this->input->get('payment_reference_no');
        $paypalHelper = new PayPalHelper;
        $this->output->set_content_type('application/json')->set_output(json_encode($paypalHelper->orderGet()));
    }   
}