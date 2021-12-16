<?php
defined('BASEPATH') OR exit('No direct script access allowed');
date_default_timezone_set('Asia/Manila');


class Paypal extends CI_Controller {
   
    function __construct() {
        parent::__construct();
        $this->load->model('paypal_model');
        $this->load->model('order_model');
        $this->load->model('notify_model');
        require_once(APPPATH.'libraries/Paypal_config.php');
        require_once(APPPATH.'libraries/PaypalHelper.php');
    }
    public function callback(){
        $ref_no = $this->input->post('ref_no'); /* order reference number */
        $kenSrf = $this->input->post('kenSrf'); /* csrf */
        $orderID = $this->input->post('orderID'); /* PAYPAL Order ID */
        $captured_amount = $this->input->post('capture_amount'); /* amount captured from PAYPAL process*/

        /* get order data */ 
        $orderData = $this->order_model->getOrderDataByRefNo($ref_no);
        $orderedAmount = number_format($orderData['price'], 2, '.', '');

        /* CHECK IF IN STOCK */ 
        if($orderData['stock'] == 'inStock') {
            /* PAYPAL PAYMENT METHOD ERROR AMOUNT */ 
            if($orderData['payment_method'] == 'Paypal' && $captured_amount !== $orderedAmount){
                $data['resultStatus'] = 'payment_error';
                $data['status'] = '402';
                $data['total_amt'] = number_format($orderData['price'], 2);

                /* INSERT order event logs */
                $message = 'INVALID Paid Amount. Capture_amount:'.$captured_amount. ' ordered_amount:'.$orderedAmount.'';
                $event_logs = array('order_id'=>$orderData['order_id'], 'message'=>$message, 'created_at'=>date('Y-m-d H:i:s') );
                $this->order_model->insertOrderEventLogs($event_logs);
            }

            /* PAYPAL PAYMENT METHOD */ 
            else {
                if ($orderData['status'] == '0') { /* check if order status still PENDING / UNPAID that need to process*/
                    $credits = $this->order_model->getVoucherCodeCredits($orderData['pid']); /*get credits*/
                    $voucher_code = $credits['credits'];
                    $dataInput = array( 
                        'status'=> '1',
                         'game_credit'=>$voucher_code,
                        'payment_reference_no'=> $orderID, 
                         'input_ref_no'=>$orderID,
                         'date_ordered_update'=>date('Y-m-d H:i:s'),
                        'date_ordered_completed'=>date('Y-m-d H:i:s'),
                    );
                    $data['game_credit'] = $voucher_code;

                    /*update credits to USED*/
                    $updateCredit = $this->order_model->updateCredits($credits['credits_id']); 
                        
                     /*transaction paid and update status to complete*/
                    $this->order_model->updateOrderTxStatus($ref_no, $dataInput);

                    /* INSERT order event logs */
                    $message = 'PAID with PAYPAL, and now has COMPLETE status';
                    $event_logs = array('order_id'=>$orderData['order_id'], 'message'=>$message, 'created_at'=>date('Y-m-d H:i:s') );
                    $this->order_model->insertOrderEventLogs($event_logs);

                    /*send credits to CLIENT EMAIL ADDRESS*/ 
                    $orderDataUpdated = $this->order_model->getOrderDataByRefNo($ref_no);
                    $this->order_model->sendCreditsEmail($orderDataUpdated);


                    $data['dateOrdered'] = date('F d, Y h:i A', strtotime($orderData['date_ordered']));
                    $data['resultStatus'] = 'success';

                    /* INSERT order event logs */
                    $message = 'Game voucher '.$credits['credits'].' sent to client email address';
                    $event_logs = array('order_id'=>$orderData['order_id'], 'message'=>$message, 'created_at'=>date('Y-m-d H:i:s') );
                    $this->order_model->insertOrderEventLogs($event_logs);

                    /*fetch data for order receipt*/ 
                    $data = $this->order_model->getOrderReceipt($ref_no);
                        
                    $sub_total = $orderData['price'];
                    if ($orderData['charge'] > 0) {
                        $sub_total = $orderData['price'] - $orderData['charge'];
                    }
                        
                    $data['product_image'] = $orderDataUpdated['image']; 
                    $data['amount'] = number_format($data['price'], 2); 
                    $data['sub_total'] = number_format($sub_total, 2);
                    $data['service_charge'] = number_format($orderData['charge'], 2);

                    /* insert activity logs*/
                        $activity = 'New Order Paid with <b>'.$data['payment_method'].'</b>, Order ref no. '.$data['reference_no'].'.';
                    $uid = 1;
                    $this->order_model->insertActivityLogs($uid ,$activity); 

                    /* send email notification to ADMIN */
                    $this->order_model->sendAdminEmailNotification($data['order_id']);

                    /* change affliate status if existing */
                    $this->order_model->changeAffiliateInviteStatus($ref_no, $data['order_id']); 

                    /* send SMS notification to ADMIN */
                    $smsNotify = $this->notify_model->iTexMo($ref_no, $data['order_item'], 'Paid' );


                    if ($smsNotify == ""){
                            $message = "SMS: (iTexMo) No response from server!!!";
                            
                    }
                    else if ($smsNotify == 0){
                            $message = "SMS was Sent to notify Admin!";
                    }
                    else{   
                            $message = "SMS: (iTexMo) Error was encountered!";
                    }
                    $eventLogs = array('order_id'=>$orderData['order_id'], 'message'=>$message, 'created_at'=>date('Y-m-d H:i:s') );
                    $this->order_model->insertOrderEventLogs($eventLogs);
                    /* END send SMS notification to ADMIN */

                    /* INSERT new profit */
                    $productData = $this->order_model->getProductData($orderData['pid']);
                    $this->order_model->insertNewProfit($orderData['order_id'], $productData['profit']);

                    $message = 'Order Revenue of PHP'. number_format($productData['profit'], 2);
                    $eventLogs = array('order_id'=>$orderData['order_id'], 'message'=>$message, 'created_at'=>date('Y-m-d H:i:s') );
                    $this->order_model->insertOrderEventLogs($eventLogs);

                    /* FETCH DATA RESULT */ 
                    $data['date_ordered_update'] = date('m/d/Y h:i A', strtotime($data['date_ordered_update']));
                    $data['date_ordered'] = date('m/d/Y h:i A', strtotime($data['date_ordered']));
                }
            }
        }

        /* OUT OF STOCK */ 
        else  {
            /* INSERT order event logs */
            $message = 'Ordered item is out of stock.';
            $event_logs = array('order_id'=>$orderData['order_id'], 'message'=>$message, 'created_at'=>date('Y-m-d H:i:s') );
            $this->order_model->insertOrderEventLogs($event_logs);
            $data['resultStatus'] = 'outOfStock'; /* out our stock */
       }
        /*output data*/ 
        $this->output->set_content_type('application/json')->set_output(json_encode($data));
    }
    public function orderCreate(){
        $order_ref_no = $this->input->post('ref_no');
        $csrf_token = $this->input->post('kenSrf');
        $orderData = $this->paypal_model->getOrderReferenceNumber($order_ref_no);

        $productStock = $this->order_model->checkProductQty($orderData['pid']);

        $subtotal = $orderData['amount'] - $orderData['charge'];
        $sub_total = number_format($subtotal, 2, '.', '');
        $service_charge = number_format($orderData['charge'], 2, '.', '');
        $total_amount = $orderData['amount'] + $orderData['charge'];
        
        if($productStock == 'outOfStock'){
            $res = array(
                'response'=>'out_of_stock',
                'sub_total'=>$sub_total,
                'service_charge'=>$service_charge,
                'total_amt'=> number_format($total_amount, 2),
                'captured_amount'=>$orderData['amount'],
            );

            /* INSERT order event logs */
            $message = 'Out of Stock.';
            $event_logs = array('order_id'=>$orderData['order_id'], 'message'=>$message, 'created_at'=>date('Y-m-d H:i:s') );
            $this->order_model->insertOrderEventLogs($event_logs);

            $this->output->set_content_type('application/json')->set_output(json_encode($res));
        }
        else if ($orderData['amount'] !== $this->session->total_amount) {
            $res = array(
                'response'=>'error_amount',
                'sub_total'=>$sub_total,
                'service_charge'=>$service_charge,
                'total_amt'=>number_format($total_amount, 2),
                'captured_amount'=>$orderData['amount'],
            );

            /* INSERT order event logs */
            $message = 'INVALID Paid Amount.';
            $event_logs = array('order_id'=>$orderData['order_id'], 'message'=>$message, 'created_at'=>date('Y-m-d H:i:s') );
            $this->order_model->insertOrderEventLogs($event_logs);

            $this->output->set_content_type('application/json')->set_output(json_encode($res));
        }
        else if($csrf_token == $this->session->csrf) {
            /* INSERT order event logs */
            $message = 'CSRF Mismatch Token';
            $event_logs = array('order_id'=>$orderData['order_id'], 'message'=>$message, 'created_at'=>date('Y-m-d H:i:s') );

            $this->output->set_content_type('application/json')->set_output(json_encode(array('response'=>'csrf_token_mismatch')));
        }
        else {
            $paypalHelper = new PayPalHelper;
            $randNo= (string)rand(10000,20000);
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