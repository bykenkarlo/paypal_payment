var base_url;
var ref_no;
var pid;
var orderStatus;

// getTransactionData()

if (orderStatus == '0') {
   getTransactionData();
}
else {
    getOrderData(ref_no);
}

function copyClipboard(){
    let credit = $('#paid_credit_voucher').val();
    $("#alert_message_wrapper").removeAttr('hidden', 'hidden').text(credit+' copied!');
    $('.alert-message').text($(this).data('text')).fadeIn(400).delay(3000).fadeOut(400);
    return credit; 
}

/* Show order details including the payment provider*/ 
function getTransactionData(){
    // $("#loader").removeAttr('hidden')
    $.ajax({
        url: base_url+'v3/order/get-orders-data',
        type: 'GET',
        dataType: 'JSON',
        data: {reference_no: ref_no},
    })
    .done(function(data) {
        retrievePaymentSource(data.payment_src_id, data.token);
    })
}

/* Retrive payment source details */ 
function retrievePaymentSource(payment_src_id, token){
    var data = null;
    var xhr = new XMLHttpRequest();

    xhr.addEventListener("readystatechange", function () {
      if (this.readyState === this.DONE) {
        var source = JSON.parse(this.response);
        if (source.data.attributes.status == 'chargeable') { /* check if customers already paid*/
            authorizePaymentResource(source.data.attributes.amount, payment_src_id, token);
        }

        else if(source.data.attributes.status == 'pending'){
            getPendingTransactionData();
            $("#payment_source_btn").attr('onclick', 'openPaymentPage(\''+source.data.attributes.redirect.checkout_url+'\',\''+source.data.id+'\',\''+token+'\')')
        }

        else if(source.data.attributes.status == 'expired'){
            sweetAlert({
                title:'Error!',
                text: 'Order Expired. You may try to purchase again !',
                type:'error',
                confirmButtonText: 'OK',
                allowOutsideClick: false,
           },function(isConfirm){
                alert('ok');
            });
            $('.swal2-confirm').click(function(){
               window.location='https://kenkarlo.com/shop';
            })
        }

        else if(source.data.attributes.status == 'cancelled'){
            sweetAlert({
                title:'Error!',
                text: 'Order Cancellsed. You may try to purchase again !',
                type:'error',
                confirmButtonText: 'OK',
                allowOutsideClick: false,
           },function(isConfirm){
                alert('ok');
            });
            $('.swal2-confirm').click(function(){
               window.location='https://kenkarlo.com/shop';
            })
        }

        else if(source.data.attributes.status == 'pending'){
           $("#payment_source_btn").attr('onclick', 'openPaymentPage(\''+source.data.attributes.redirect.checkout_url+'\',\''+source.data.id+'\',\''+token+'\')')
        }

        else{
            window.location.href="https://kenkarlo.com/shop";
        }
      }
    });
    xhr.open("GET", "https://api.paymongo.com/v1/sources/"+payment_src_id+"");
    xhr.setRequestHeader("authorization", "Basic "+token+"");
    xhr.send(data); 
}

/* Open payment page*/ 
function openPaymentPage(url, id, token){
    window.open(""+url+"", "_self"); /* payment page */

    checkPaymentStatus(id, token);
}

/* Check the payment status */ 
function checkPaymentStatus(id, token){
    var data = null;

    var xhr = new XMLHttpRequest();

    xhr.addEventListener("readystatechange", function () {
        if (this.readyState === this.DONE) {
            var source = JSON.parse(this.response);
            if (source.data.attributes.status == 'chargeable') { /* check if customers already paid*/
                authorizePaymentResource(source.data.attributes.amount, id, token)
            }
            else{
                setTimeout(function(){ checkPaymentStatus(id, token) }, 3000)
            }
        }
    });

    xhr.open("GET", "https://api.paymongo.com/v1/sources/"+id+"");
    xhr.setRequestHeader("authorization", "Basic "+token+"");
    xhr.send(data);
}

/* authorize the payment of the customers */ 
function authorizePaymentResource(amount, id, token){
    source_id = id;
    store = 'KenKarlo Digital';
    message = 'Thank you! Your order is now complete!';
    var data = "{\"data\":{\"attributes\":{\"amount\":"+amount+",\"source\":{\"id\":\""+source_id+"\",\"type\":\"source\"},\"currency\":\"PHP\",\"statement_descriptor\":\""+store+"\",\"description\":\""+message+"\"}}}";

    var xhr = new XMLHttpRequest();

    xhr.addEventListener("readystatechange", function () {
        if (this.readyState === this.DONE) {
            var source = JSON.parse(this.response);
            if (source.data.attributes.status == 'paid') { /* check if customers successfully paid*/
                callbackTransaction();
            }
            else{
                setTimeout(function(){ createPayment(amount, id) }, 3000)
            }
        }
    });

    xhr.open("POST", "https://api.paymongo.com/v1/payments");
    xhr.setRequestHeader("content-type", "application/json");
    xhr.setRequestHeader("authorization", "Basic "+token+"");
    xhr.send(data);
}

/*  */ 
function callbackTransaction(){
    // $("#loader").removeAttr('hidden');

    $.ajax({
        url: base_url+'v3/order/callback',
        type: 'POST',
        dataType: 'JSON',
        data: {
            ref_no:ref_no,
        },
    })
    .done(function(data) {

        if(data.resultStatus == 'outOfStock'){
            swal({
              type: 'error',
              title: "Error!",
              text: "Sorry, someone purchased before you, the item is now out of stock. Please message us using our email or FB page regarding this issue!",
              allowOutsideClick: false,
            });
        }

        else if (data.status == '1') {
            transactionStatus(data);
        }

        else if(data.resultStatus == 'requestError'){
            swal({
              type: 'error',
              title: "Something went wrong!",
              text: "Please try again later!",
              allowOutsideClick: false,
            });
        }
        // $('#loader').attr('hidden','hidden')
    })
}


function transactionStatus(data){
    // $("#loader").removeAttr('hidden');
    string = '';
    paid_credit ='';
    parag = '';

    if (data.status == '1') {
        img_status = base_url+'assets/images/check.png';
        order_title = 'Transaction Complete!';
        paid_credit+='<div class="row margin-top-10" id="game_credit_wrapper">'
                      +'<div class="col-md-12 col-12">'
                        +'<span class="font-600 label-payment font-black">Game Credits:</span>'
                        +'<div class="credit-style">'
                            +'<input type="hidden" id="paid_credit_voucher" value="'+data.game_credit+'">'
                            +'<div class="font-600 text-center font font-black " id="success_credit">'+data.game_credit+'</div>'
                            +'<button id="copy_clipboard" title="Copy Game Credit" data-clipboard-text="'+data.game_credit+'" class="copy-paid-credit btn btn-sm"><i class="fas fa-copy"></i></button>'
                        +'</div>'
                      +'</div>'
                    +'</div>';
        parag += "<div style='margin-top:-10px;'>We hope you're happy with your purchase. We'd love to hear how satisfied you are with your order. Please don't forget to give us review <a href='https://kenkarlo.com/reviews' target='_blank' rel='noopener'>here</a> or to our <a target='_blank' rel='noopener nofollow' href='https://facebook.com/pg/kenkarlodigital/reviews/'>facebook page</a>. Thank you! :).</div>"
        +"<div class='margin-top-10'>For inquiries, you may contact us on shop@kenkarlo.com or message our <a href='https://facebook.com/kenkarlodigital' rel='noopener nofollow' blank='_blank'>FB Page</a>.</div>";
    }
    else if(data.status == '4'){
        img_status = base_url+'assets/images/pending-loader.gif';
        order_title = 'Transaction on Process';
        parag = "<div>Thank you for your order, we will validate your transaction first, make sure you input the correct "+data.payment_method+" ref.no./transaction code. </div>"
            +"<div class='margin-top-10'>For inquiries, you may contact us on shop@kenkarlo.com or on our <a target='_blank' rel='noopener nofollow' href='https://facebook.com/kenkarlodigital' rel='noopener nofollow' blank='_blank'>FB Page</a> Thank you!</div>"
    }
    

    $("#payment_button_wrapper").hide();
    string+='<div class="margin-bottom-40" id="form_transaction_wrapper">'
        +'<div class=" margin-top-10">'
            +'<div class="margin-bottom-20">'
            +'<div class="margin-bottom-20 text-center">'
                +'<img src="'+img_status+'" class="img-fluid" width="90" height="90">'
                +'<h2 id="product-title" style="font-weight: 400; color: #3c3c3d; font-size: 23px; margin-top:15px;" class="text-capitalize tx-success-title" class="margin-top-10">'+order_title+'</h2>'
                +'<span class="font-black">Thank you for your order!</span>'
                +'<div><span style="color:#a5a5a5;">Payment Receipt</span></div>'
            +'</div>'
            // +'<h3 class="font-500 margin-top-20" style="color: #3a3a3a !important; font-family: Poppins !important;font-size: 21px; "><img src="'+base_url+'assets/images/payment-receipt.png" alt="payment-receipt" width="37"> Order '+data.order_item+' - '+data.payment_method+' </h3>'
            +'<div class="hr-line"></div>'
            +'</div>'

            +paid_credit

            +'<div class="row  margin-top-10">'
                +'<div class="col-md-6 col-5"><span class="font-600 label-payment">Order Ref. No.</span></div>'
                    +'<div class="col-md-6 col-6"><span class="font-400 desc-payment">'+data.reference_no+'</span></div>'
                +'</div>'
            +'</div>'


            +'<div class="row margin-top-5">'
                +'<div class="col-md-6 col-5"> '
                    +'<span class="font-600 label-payment">Ordered Item</span></div>'
                +'<div class="col-md-6 col-6"><span class="font-400 desc-payment">'+data.order_item+'</span></div>'
            +'</div>'

            +'<div class="row margin-top-5">'
                +'<div class="col-md-6 col-5"><span class="font-600 label-payment">Amount</span></div>'
                +'<div class="col-md-6 col-6"><span class="font-400 desc-payment">₱ '+data.price+'.00</span></div>'
            +'</div>'

            +'<div class="row margin-top-5">'
                +'<div class="col-md-6 col-5"> <span class="font-600 label-payment">Payment Method</span></div>'
                +'<div class="col-md-6 col-6"><span class="font-400 desc-payment">'+data.payment_method+'</span></div>'
            +'</div>'

            +'<div class="row margin-top-5">'
                +'<div class="col-md-6 col-5"><span class="font-600 label-payment">Email Address</span></div>'
                +'<div class="col-md-6 col-6"><span class="font-400 desc-payment ">'+data.email_address+'</span></div>'
            +'</div>'

            +'<div class="row margin-top-5">'
                +'<div class="col-md-6 col-5"><span class="font-600 label-payment">Date Ordered</span></div>'
                +'<div class="col-md-6 col-6"><span class="font-400 desc-payment">'+data.date_ordered+'</span></div>'
            +'</div>'
            +'<div style="border-bottom: 1px solid #ddd;" class="margin-top-30"></div></div><input type="hidden" id="amountToPay" value="'+data.price+'">'
        +'</div>'

        +parag
    $("#transaction_summary_wrapper").html(string);
    // $("#loader").attr('hidden','hidden');
    window.scrollTo(800,0);
}


function getOrderData(ref_no){
    $.ajax({
        url: base_url+'v2/order/get-orders-data',
        type: 'GET',
        dataType: 'JSON',
        data: {reference_no:ref_no},
    })
    .done(function(data) {
        // if (data.status == '4') {
        //     transactionStatus(data);
        //     checkOrderStatus(data.reference_no)
        // }

        if (data.status == '1') {
            transactionStatus(data);
        }
    })
}

function getPendingTransactionData(){
    $("#loader").removeAttr('hidden')
    $.ajax({
        url: base_url+'v3/order/get-orders-data',
        type: 'GET',
        dataType: 'JSON',
        data: {reference_no: ref_no},
    })
    .done(function(data) {
        // retrievePaymentSource(data.payment_src_id, data.token);
        string = '';
        status = '';
        status_color = '';
            if (data.status == '0') {
                status = 'Pending';
                status_color = 'text-secondary';
            }
            else if(data.status == '1'){
                status = 'FulFilled';
                status_color = 'text-success';
            }
            else if(data.status == '4'){
                status = 'Processing';
                status_color = 'text-primary';
            }

            string+='<div class="margin-bottom-40 transactionForm">'
                +'<div class=" margin-top-10">'
                  +'<div class="margin-bottom-20">'
                    +'<h3 class="font-500 margin-top-20 text-center" style="color: #3a3a3a !important; font-family: Poppins !important; font-size: 21px;"><img src="'+base_url+'assets/images/payment-receipt.png" alt="payment-receipt" width="37"> Order '+data.order_item+' - '+data.payment_method+' </h3>'
                    +'<div class="hr-line"></div>'
                  +'</div>'
                  +'<div class="row  margin-top-10">'
                    +'<div class="col-md-6 col-5"><span class="font-600 label-payment">Order Ref. No.</span></div>'
                      +'<div class="col-md-6 col-6"><span class="font-400 desc-payment">'+data.reference_no+'</span></div>'
                    +'</div>'
                  +'</div>'

                  +'<div class="row margin-top-10">'
                    +'<div class="col-md-6 col-5"><span class="font-600 label-payment">Order Status</span></div>'
                    +'<div class="col-md-6 col-6">'
                      +'<span class="font-400 desc-payment '+status_color+'" id="ordered_status">'+status+'</span>'
                    +'</div>'
                  +'</div>'

                  +'<div class="row margin-top-10">'
                    +'<div class="col-md-6 col-5"> '
                      +'<span class="font-600 label-payment">Ordered Item</span></div>'
                    +'<div class="col-md-6 col-6"><span class="font-400 desc-payment">'+data.order_item+'</span></div>'
                  +'</div>'

                  +'<div class="row margin-top-10">'
                    +'<div class="col-md-6 col-5"><span class="font-600 label-payment">Amount</span></div>'
                    +'<div class="col-md-6 col-6"><span class="font-400 desc-payment">₱ '+data.price+'.00</span></div>'
                  +'</div>'

                  +'<div class="row margin-top-10">'
                    +'<div class="col-md-6 col-5"> <span class="font-600 label-payment">Payment Method</span></div>'
                    +'<div class="col-md-6 col-6"><span class="font-400 desc-payment text-capitalize">'+data.payment_method+'</span></div>'
                  +'</div>'

                  +'<div class="row margin-top-10">'
                    +'<div class="col-md-6 col-5"><span class="font-600 label-payment">Email Address</span></div>'
                    +'<div class="col-md-6 col-6"><span class="font-400 desc-payment tx_email_address">'+data.email_address+'</span></div>'
                  +'</div>'

                  +'<div class="row margin-top-10">'
                    +'<div class="col-md-6 col-5"><span class="font-600 label-payment">Date Ordered</span></div>'
                    +'<div class="col-md-6 col-6"><span class="font-400 desc-payment">'+data.date_ordered+'</span></div>'
                  +'</div>'
                  +'<div style="border-bottom: 1px solid #ddd;" class="margin-top-30"></div></div><input type="hidden" id="amountToPay" value="'+data.price+'">'
              +'</div>'
        $("#transaction_summary_wrapper").html(string);
        $("#loader").attr('hidden','hidden');
        $("#payment_button_wrapper").removeAttr('hidden');
    })
}
