var base_url;
var ref_no;
var payment_ref_no;
var orderStatus;
var pid;
var env_url;
var btn_make_purchase ;

if (base_url.indexOf('localhost') > -1 || base_url.indexOf('test') > -1) {
  env_url = 'https://pg-sandbox.paymaya.com/';
}
else{
  env_url = 'https://pg.paymaya.com/';
}

function checkPaymentStatusCardFacilitator(payment_src_id, auth, attributes){
  $("#loader").removeAttr('hidden');
  payment_3ds = '';
	var xhr = new XMLHttpRequest();
	xhr.addEventListener("readystatechange", function () {
	if (this.readyState === this.DONE) {
	  source = JSON.parse(this.response)
    
  	 	if (source.paymentStatus == 'PAYMENT_FAILED' && source.status == 'COMPLETED') {
        payment_3ds = source.paymentDetails.error;

        if (payment_3ds !== undefined) {
          error_code = source.paymentDetails.error.name;
        }
        else{
          error_code = source.paymentDetails.responses.efs.unhandledError[0].message;
        }

        message = 'Payment Failed. '+error_code+'.'

        getOrderEvent(ref_no, message); // record error message.

        sweetAlert({
          title:'Error',
          text: message,
          type:'error',
          confirmButtonText: 'OK',
          allowOutsideClick: false,
        },function(isConfirm){
          alert('ok');
        });
        $('.swal2-confirm').click(function(){
          window.location=base_url+'back_to_shop';
        })
        $('#loader').attr('hidden','hidden')
  	 	}

  	 	else if (source.paymentStatus == 'PAYMENT_EXPIRED') {
  	 		sweetAlert({
          title:'Error',
          text: "Payment is already Expired! Please try to purchase again!",
          type:'error',
          confirmButtonText: 'Go Back',
          allowOutsideClick: false,
        },function(isConfirm){
          alert('ok');
        });
        $('.swal2-confirm').click(function(){
            window.location=btn_make_purchase ;
        })
        $('#loader').attr('hidden','hidden')
  	 	}

  	 	else if (source.paymentStatus == 'PENDING_TOKEN' && source.status == 'CREATED') {
  	 		payment_url = 'https://payments.paymaya.com/v2/checkout?id='+payment_src_id
  	 		string = '<a class="btn payment-submit-btn" href="'+payment_url+'"  id="complete_paymaya_btn">Continue to Payment</a>'
  	 		$('#paymaya_payment_wrapper').html(string)
  	 		$('#loader').attr('hidden','hidden')
  	 	}

  	 	else if(source.paymentStatus == 'PAYMENT_SUCCESS'){
  	 		total_amt = source.totalAmount.amount
  	 		console.log(total_amt)
  	 		if (orderStatus == '0') {
  	 			callbackPaymayaTransaction(ref_no, total_amt, payment_ref_no, pid, auth.api, attributes);
  	 		}
  	 	}
      
      else{
        sweetAlert({
          title:'Error',
          text: "Something went wrong! Please try again!",
          type:'error',
          confirmButtonText: 'OK',
          allowOutsideClick: false,
        },function(isConfirm){
          alert('ok');
        });
        $('.swal2-confirm').click(function(){
            window.location=btn_make_purchase ;
        })
        $('#loader').attr('hidden','hidden')
      }
	  }
	});
	xhr.open("GET", auth.url); /* card*/
	xhr.setRequestHeader("content-type", "application/json");
	xhr.setRequestHeader("authorization", "Basic "+auth.api+" ");
	xhr.send();
}

function checkPaymayaWalletPayment(payment_data){
    $("#loader").removeAttr('hidden');

      if (payment_data.status == 'PAYMENT_SUCCESS' && payment_data.isPaid == true) {
        callbackPaymayaTransaction(ref_no);
      }

      else if(payment_data.status == 'PAYMENT_FAILED' && payment_data.isPaid == false){
        sweetAlert({
          title:'Failed',
          text: "Payment Failed! Please try again!",
          type:'error',
          confirmButtonText: 'OK',
          allowOutsideClick: false,
        },function(isConfirm){
          alert('ok');
        });
        $('.swal2-confirm').click(function(){
            window.location=btn_make_purchase ;
        })

        message = 'Payment Status: '+payment_data.status
        getOrderEvent(ref_no, message); // record error message.

        $('#loader').attr('hidden','hidden')
      }

      else if(payment_data.status == 'PAYMENT_EXPIRED' && payment_data.isPaid == false){
        sweetAlert({
          title:'Expired',
          text: "Payment Expired! Please try again!",
          type:'error',
          confirmButtonText: 'Go Back',
          allowOutsideClick: false,
        },function(isConfirm){
          alert('ok');
        });
        $('.swal2-confirm').click(function(){
            window.location=btn_make_purchase ;
        })

        message = 'Payment Status: '+payment_data.status
        getOrderEvent(ref_no, message); // record error message.

        $('#loader').attr('hidden','hidden')
      }

      else if(payment_data.status == 'PENDING_TOKEN' && payment_data.isPaid == false){
        sweetAlert({
          title:'Cancelled',
          text: "Payment Cancelled! Please try again!",
          type:'error',
          confirmButtonText: 'Go Back',
          allowOutsideClick: false,
        },function(isConfirm){
          alert('ok');
        });
        $('.swal2-confirm').click(function(){
            window.location=btn_make_purchase ;
        })

        message = 'Payment Status: '+payment_data.status
        getOrderEvent(ref_no, message); // record error message.

        $('#loader').attr('hidden','hidden')
      }

      else{
        sweetAlert({
          title:'Error',
          text: "Something went wrong! Please try again!",
          type:'error',
          confirmButtonText: 'Go Back',
          allowOutsideClick: false,
        },function(isConfirm){
          alert('ok');
        });
        $('.swal2-confirm').click(function(){
            window.location=btn_make_purchase ;
        })

      message = 'Payment Status: '+payment_data.status
      getOrderEvent(ref_no, message); // record error message.

        $('#loader').attr('hidden','hidden')
      }
 
}

function callbackPaymayaTransaction(ref_no){
  $("#loader").removeAttr('hidden');
  
    $.ajax({
        url: base_url+'v2/order/callback/paymaya',
        type: 'POST',
        dataType: 'JSON',
        data: {
            ref_no:ref_no,
        },
    })
    .done(function(data) {
        if (data.resultStatus == 'invalid_amnt') {
          swal({
              type: 'error',
              title: "Error!",
              text: "You paid with an invalid amount!",
              allowOutsideClick: false,
            });
        }
        else if(data.resultStatus == 'outOfStock'){
            swal({
              type: 'error',
              title: "Error!",
              text: "Sorry, someone purchased before you, the item is now out of stock. Please message us using our email or FB page regarding this issue!",
              allowOutsideClick: false,
            });
        }
        else if (data.resultStatus == 'payment_success') {
            transactionStatus(data);
        }
        else if(data.resultStatus == 'requestError'){
            swal({
              type: 'error',
              title: "Error",
              text: "CSRF Token Mismatch! Refresh the page and try again !  If you made your payment and got this error please message us",
              allowOutsideClick: false,
            });
        }
        else if(data.resultStatus == 'payment_error' && data.status == '402'){
            swal({
              type: 'error',
              title: "Something went wrong!",
              text: "You paid with an invalid amount! If you made your payment and got this error please message us!",
              allowOutsideClick: false,
            });
        }
      $('#loader').attr('hidden','hidden')
    })
}

function checkPaymentOrderStatus(ref_no){
	$.ajax({
		url: base_url+'paymaya/checkOrderStatus',
		type: 'GET',
		dataType: 'JSON',
		data: {ref_no:ref_no},
	})
	.done(function(data) {
		if (data.response == 'pending') {
			setTimeout(function(){ checkPaymentOrderStatus(ref_no) }, 5000);
		}
		else if(data.response == 'complete'){
			callbackPaymayaTransaction(ref_no, payment_ref_no, pid);
		}
	})
}

function getOrderEvent(ref_no, message){
  $.ajax({
    url: base_url+'shop/getOrderEvent',
    type: 'GET',
    data: {ref_no:ref_no, message:message},
  })
  .done(function() {
  })
}

// function getPaymayaOrderData(payment_src_id, auth_api){
//   var xhr = new XMLHttpRequest();
//   xhr.addEventListener("readystatechange", function () {
//   if (this.readyState === this.DONE) {
//     source = JSON.parse(this.response)
//     }
//   });
//   xhr.open("GET", ""+env_url+"checkout/v1/checkouts/"+payment_ref_no); /* card*/
//   xhr.setRequestHeader("content-type", "application/json");
//   xhr.setRequestHeader("authorization", "Basic "+auth_api+" ");
//   xhr.send();
// }