var base_url;
var ref_no;
var payment_ref_no;
var orderStatus;
var pid;
var env_url;
var btn_make_purchase ;


if (orderStatus == 0 ) {
	bitcoinPayment();
}
$(function () {
    $('[data-toggle="tooltip"]').tooltip()
})
  
function bitcoinPayment(){
	$.ajax({
		type: 'GET',
		url: base_url+'bitcoin/bitcoin-payment',
		dataType: 'JSON',
		data: {
			ref_no:ref_no
		}
	})
	.done(function(res){
		data = res.data;
		string = '';
		qrcode = 'bitcoin:'+data.address+'?amount='+data.amount_btc
		if (data.address !== '') {
			string+=
		 	'<div class="text-left font-black" style="margin-top: -5px;">'
	            +'<label for="label">Send the exact amount to the provided wallet address. If you send any other bitcoin amount, payment will ignore it. We recommend to click the <b>Open Wallet</b> button or scan the <b>QR code</b> to avoid such incidents.</label>'
	    	+'</div>'
		 	+'<div class="row margin-top-10" id="btc_address_wrapper">'
	        	+'<div class="col-md-6 col-5"><span class="font-600 label-payment">Address</span></div>'
	        	+'<div class="col-md-6 col-6">'
	        		+'<div class="input-group">'
					  	+'<input type="text" id="btc_addy" disabled value="'+data.address+'" class="form-control color-black"  aria-describedby="basic-addon2">'
					  	+'<div class="input-group-append">'
					    	+'<button id="copy_addy" data-clipboard-text="'+data.address+'"  class="btn btn-outline-secondary" type="button"><i class="fa fa-copy"></i></button>'
					  	+'</div>'
					+'</div>'
	        	+'</div>'
	    	+'</div>'
	    	+'<div class="row margin-top-10" id="btc_amt_wrapper">'
	        	+'<div class="col-md-6 col-5"><span class="font-600 label-payment">Amount in BTC</span></div>'
	        	+'<div class="col-md-6 col-6"><span class="font-400 desc-payment">'+data.amount_btc+' BTC <button data-toggle="tooltip" data-placement="right" title="Copy" data-clipboard-text="'+data.amount_btc+'"   id="copy_amount" class="btn btn-default btn-xs"><i class="fa fa-copy"></i></button></span></div>'
	    	+'</div>'
	    	+'<div class="row margin-top-10" id="payment_status_wrapper">'
	        	+'<div class="col-md-6 col-5"><span class="font-600 label-payment">Payment Status</span></div>'
	        	+'<div class="col-md-6 col-6"><span class="font-400 desc-payment" id="payment_status_res">'+data.status+'</span></div>'
	    	+'</div>'
	    	
	    	+'<div class="row margin-top-10 " id="payment_progress_bar_wrapper">'
		        +'<div style="font-size: 12.5pt;" class="desc-payment margin-bottom-10 col-lg-12" id="payment_countdown"></div>'
		        +'<div class="col-lg-12">'
			       	+'<div class="progress" id="payment_progress_bar" style="height: 12px;">'
					  +'<div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" style="width: 0%;" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div> '
					+'</div> '
		        +'</div>'
	        +'</div>'

	    	+'<div class="margin-top-30 mx-auto d-block btc-qrcode" id="qr_code">'
	        	
	    	+'</div>'
	    	+'<div class="margin-top-20 text-center btc-qrcode" id="btc_wallet_payment_btn">'
	        	+'<a href="bitcoin:'+data.address+'?amount='+data.amount_btc+'" class="btn btc-payment">Open Wallet</a>'
	    	+'</div>'

	    	+'<div class="margin-top-20" id="payment_note">'
	        	+"<label class='font-black'>If the payment transaction is already confirmed and your order is not yet processed just <a onclick='window.location.reload()' href='#referesh'>refresh</a> this page! Or message us on our <a href='https://facebook.com/pg/xquareshop' target='_blank'>Facebook page</a> or email us at info@xquareshop.com</label>"
	    	+'</div>'
		}
		else{
			string+='<div class="text-center alert alert-secondary"><h4 ><i class="fa fa-exclamation-circle"></i> Something went wrong! <br>Please message us if you encounter such error!</h43></div>'
		}

	    $("#bitcoin_payment_wrapper").html(string);
		generateQr(qrcode);
		checkBtcPaymentStatus(ref_no);

		if (data.response == 'pending') {
			timerCountdown(data.expired_at, data.reference_no, );
		}
	});
}

function generateQr(data) {      
    var qrcode = new QRCode(document.getElementById("qr_code"), {
	    width : 350,
	    height : 350
	});
    qrcode.makeCode(data);
    $("#qr_code img").addClass('img-fluid');
}


function copyClipboardBtcAddy(){
    let credit = $('#btc_addy').val();
    const toast = swal.mixin({
      	toast: true,
      	position: 'top-end',
      	showConfirmButton: false,
      	timer:5000
    });

    toast({
      	type: 'success',
        title: 'Copied '+credit+''
    });
    return credit; 
}

function checkBtcPaymentStatus(reference_no){
    $.ajax({
        url: base_url+'bitcoin/check-btc-payment-status',
        type: 'GET',
        dataType: 'JSON',
        data: {reference_no:reference_no},
    })
    .done(function(data) {
        if (data.response == 'yet') {
            setTimeout(function(){checkBtcPaymentStatus(reference_no)}, 5000)
            // $('#payment_status_res').text(data.status)
        }
        else if(data.response == 'payment_received'){
            setTimeout(function(){checkBtcPaymentStatus(reference_no)}, 5000)
            $('#payment_status_res').html(data.status+ ' <span class="font-xs dotted">Txid: </span><a target="_blank" href="https://blockstream.info/tx/'+data.txid+'" class="font-sm dotted">'+data.txid.substr(-10)+' <i class="fa fa-external-link-square-alt font-xs"></i></a>')
            $("#qr_code img").hide();
            $("#qr_code").hide();
            $("#btc_wallet_payment_btn").hide();
            $("#payment_countdown").hide();
            $("#payment_progress_bar_wrapper").hide();
        }
        else if(data.response == 'expired'){
            $("#qr_code img").hide();
            $("#btc_wallet_payment_btn").hide();
        }
        else if (data.response == 'confirmed') {
            window.location.reload();
        }

    })    
}
function timerCountdown(targetDate, ref_no){
	var countDownDate = new Date(targetDate).getTime();
	var now = new Date().getTime();
	var distance = countDownDate - now;
	var days = Math.floor(distance / (1000 * 60 * 60 * 24));
	var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
	var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
	var seconds = Math.floor((distance % (1000 * 60)) / 1000);

	t_min = minutes * 60;
	t_time = seconds + t_min;
	t_total = 30 * 60;
	progressTimer(t_time, t_total, $('#payment_progress_bar'));


	var x = setInterval(function() {
		var now = new Date().getTime();
		var distance = countDownDate - now;
		var days = Math.floor(distance / (1000 * 60 * 60 * 24));
	 	var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
		var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
		var seconds = Math.floor((distance % (1000 * 60)) / 1000);

		$("#payment_countdown").html('<div class=""><span class="font-600 label-payment">Time Left: '+minutes+':'+seconds+'</span></div> ')

		if (distance < 0) {
		    clearInterval(x);
		  	$("#payment_countdown").html('<h4 class="text-danger">Payment EXPIRED!</h4>');
		  	$("#payment_status_wrapper").hide();
		  	$("#qr_code").attr('hidden','hidden');
	        $("#btc_wallet_payment_btn").hide();
	        $("#btc_address_wrapper").hide();
	        $("#btc_amt_wrapper").hide();
	        $("#payment_note").hide();
	        orderPaymentUpdate(ref_no);
		}
	}, 1000);

}

function progressTimer(t_time, t_total, $element){
    var progressBarWidth = t_time * $element.width() / t_total;
    $element.find('div').animate({ width: progressBarWidth }, 500).html();
    if(t_time > 0) {
        setTimeout(function() {
            progressTimer(t_time - 1, t_total, $element);
        }, 1000);
    }

}


function orderPaymentUpdate(ref_no){
	$.ajax({
        url: base_url+'bitcoin/update-payment-status',
        type: 'POST',
        dataType: 'JSON',
        data: {ref_no:ref_no, status:status},
    })
    .done(function(data) {
    	if (data.response == 'success') {
    		$("#ordered_status").html('Closed').addClass('text-danger')
    		// setTimeout(function(){
    		// 	window.location.reload();
    		// }, 15000)
    	}
    })
}