var base_url;
var shop_url;
var ref_no;
var pid;
var orderStatus;
var item_name;
var payment_method;
var paymentWindow;

if(orderStatus == '0' || orderStatus == '5'){
	openPaymentSwitchAPI();
}

function openPaymentSwitchAPI(){
	$.ajax({
		url: base_url+'dragonpay/getpaymentSwitchAPI',
		type: 'GET',
		dataType: 'JSON',
		data: {
			ref_no:ref_no,
			item_name:item_name
		},
	})
	.done(function(data) {
        $('.payment-backdrop').removeAttr('hidden');
		// paymentWindow = window.open(data.payment_url);
        paymentWindow = window.open(data.payment_url,'Payment Window','location=1,menubar=1,resizable=1,width=810,height=700');
		checkPaymentStatus(ref_no, paymentWindow)
        paymentWindow.moveTo(500, 90);
	})
}


function checkPaymentStatus(ref_no, paymentWindow){
    $.ajax({
        url: base_url+'v2/order/check-order-status',
        type: 'GET',
        dataType: 'JSON',
        data: {reference_no:ref_no},
    })
    .done(function(data) {
        if (data.response == 'pending') {
            setTimeout(function(){checkPaymentStatus(ref_no, paymentWindow)}, 3000);
        }
        else if(data.response == 'otc_pending'){
            paymentWindow.close();
            setTimeout(function(){checkPaymentStatus(ref_no, paymentWindow)}, 3000);
            checkTxStatus(ref_no)
        }
        else if(data.response == 'confirm'){ 
        	paymentWindow.close();
        	location.reload();
        }
    })    
}


function checkTxStatus(ref_no){
    $.ajax({
        url: base_url+'dragonpay/checkTxStatus',
        type: 'GET',
        dataType: 'JSON',
        data:{
            ref_no:ref_no
        }
    })
    .done(function(data) {
        if (data.response == 'S') {
           updateOrderStatus(ref_no)
        }
    })
}

function updateOrderStatus(ref_no){
    $.ajax({
        url: base_url+'dragonpay/updateOrderStatus',
        type: 'POST',
        dataType: 'JSON',
        data: {ref_no:ref_no},
    })
    .done(function(data) {
    })
}