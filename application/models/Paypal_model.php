<?php
defined('BASEPATH') OR exit('No direct script access allowed');
date_default_timezone_set('Asia/Manila');

class Paypal_model extends CI_Model {
	
	public function getOrderReferenceNumber($ref_no){
		$date_today = date('Y-m-d H:i:s');
		// GET ORDER DATA IN DATABASE TABLE
		
		// $orderData = $this->db->SELECT('ot.*, pct.sku')
		// 	->FROM('order-tbl as ot')
		// 	->JOIN('products-tbl as pt', 'pt.pid = ot.pid')
		// 	->JOIN('products_category_tbl as pct', 'pct.prod_cat_id = pt.prod_cat_id')
		// 	->WHERE('reference_no', $ref_no)
		// 	->GET()->row_array();
		// $sub_total = $orderData['price'];
		// if ($orderData['charge'] > 0) {
		// 	$sub_total = $orderData['price'] - $orderData['charge'];
		// }

		$data = array(
			'order_id'=> 'PO19BD0C0EA57',
			'pid'=> '1000212',
			'payment_reference_no'=> 'XDE981U2QEJKDH',
			'reference_no'=> 'PP123456789',
			'email_address'=> 'hello@dev.kenkarlo.com',
			'order_description'=> 'Reign over the game world with the combined power of a 11th Gen Intel® ',
			'order_item'=> 'Acer Nitro 5', /* IF MULTIPLE USE RESULT ARRAY */
			'sub_total'=> '1000',
			'charge'=> '44',
			'amount'=>'1000',
			'payment_method'=> 'paypal',
			'status'=> 'pending',
			'sku'=> 'SKU09QIWSDJC',
			'date_ordered'=> date('F d, Y h:i A', strtotime($date_today)),
		);

        return $data;
	}

	public function checkProductQty($pid){
		$credits = $this->db->WHERE('product_id',$pid)
			->WHERE('status','new')
			->GET('credits_tbl')->result_array();
		if(!empty($credits)){
			return 'inStock';
		}
		else{
			return 'outOfStock';
		}
	}
}