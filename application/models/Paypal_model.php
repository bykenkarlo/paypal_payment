<?php
defined('BASEPATH') OR exit('No direct script access allowed');
date_default_timezone_set('Asia/Manila');

class Paypal_model extends CI_Model {
	
	public function getOrderReferenceNumber($ref_no){
		$orderData = $this->db->SELECT('ot.*, pct.sku')
			->FROM('order-tbl as ot')
			->JOIN('products-tbl as pt', 'pt.pid = ot.pid')
			->JOIN('products_category_tbl as pct', 'pct.prod_cat_id = pt.prod_cat_id')
			->WHERE('reference_no', $ref_no)
			->GET()->row_array();
		$sub_total = $orderData['price'];
		if ($orderData['charge'] > 0) {
			$sub_total = $orderData['price'] - $orderData['charge'];
		}
		$data = array(
			'order_id'=> $orderData['order_id'],
			'pid'=> $orderData['pid'],
			'reference_no'=> $orderData['reference_no'],
			'email_address'=> $orderData['email_address'],
			'order_item'=> $orderData['order_item'],
			'sub_total'=> $sub_total,
			'charge'=>$orderData['charge'],
			'amount'=>$orderData['price'],
			'payment_method'=> $orderData['payment_method'],
			'status'=> $orderData['status'],
			'sku'=> $orderData['sku'].$orderData['pid'].substr($orderData['order_item'], -2).'-'.$orderData['order_item'][0],
			'date_ordered'=> date('F d, Y h:i A', strtotime($orderData['date_ordered'])),
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