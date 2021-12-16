var base_url;
var shop_url;
var ref_no;
var pid;
var orderStatus;
var amount;
var btn_make_purchase;

if (orderStatus == '0' || orderStatus == '5') {
   getTransactionData() 
}
else {
    getOrderData(ref_no);
}

$("#proceed-payment-btn").on('click', function(e){
    e.preventDefault();
    proceedPayment();
})
function copyClipboard(){
    let credit = $('#paid_voucher_code').val();
    $("#alert_message_wrapper").removeAttr('hidden', 'hidden').text(credit+' copied!');
    $('.alert-message').text($(this).data('text')).fadeIn(400).delay(3000).fadeOut(400);
    return credit; 
}

function proceedPayment() {
  input_ref_no = $('#input_ref_no').val();
  if (!input_ref_no || input_ref_no == ref_no) {
    swal({
      type: 'error',
      title: "Error!",
      text: "Please fill all the required field(s)!",
      allowOutsideClick: false,
    });
    return false;
  }
  callbackTransaction();
}
function getTransactionData(){
    $("#loader").removeAttr('hidden')
    $.ajax({
        url: base_url+'v2/order/get-orders-data',
        type: 'GET',
        dataType: 'JSON',
        data: {reference_no: ref_no},
    })
    .done(function(data) {
        if (data.payment_method == 'Paymaya') {
            checkPaymayaWalletPayment(data.payment_data);
        }
        else if (data.payment_method == 'Credit or Debit Card') {
            checkPaymentStatusCardFacilitator(data.payment_reference_no, data.auth, data.attributes);
        }

        string = '';
        status = '';
        status_color = '';
            if (data.status == '0' || data.status == '5') {
                status = 'Pending';
                status_color = 'text-secondary';
            }
            if (data.status == '2') {
                status = 'Closed';
                status_color = 'text-danger';
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
                    +'<div>'
                        +'<h3 class="font-400 margin-top-20 text-left text-uppercase order-summary-title"><i class="fa fa-shopping-cart"></i> Order Summary:</h3> '
                        // +'<button class="back-btn-order-summary btn btn-secondary btn-sm" onclick="window.history.back();">Back</button>'
                    +'</div>'
                    +'<div style="border-bottom: 1px dashed #ababab;" class="margin-top-20"></div>'
                  +'</div>'

                  +'<div class="row margin-top-10">'
                    +'<div class="col-md-6 col-5"><span class="font-600 label-payment">Order Status</span></div>'
                    +'<div class="col-md-6 col-6">'
                      +'<span class="font-400 desc-payment '+status_color+'" id="ordered_status">'+status+'</span>'
                    +'</div>'
                  +'</div>'

                  +'<div class="row margin-top-10">'
                    +'<div class="col-md-6 col-5"> '
                      +'<span class="font-600 label-payment">Product Item</span></div>'
                    +'<div class="col-md-6 col-6"><span class="font-400 desc-payment"><img src="'+shop_url+''+data.product_image+'" height="25"> '+data.order_item+'</span></div>'
                  +'</div>'

                  +'<div class="row  margin-top-10">'
                    +'<div class="col-md-6 col-5"><span class="font-600 label-payment">Reference No.</span></div>'
                      +'<div class="col-md-6 col-6"><span class="font-400 desc-payment">'+data.reference_no+'</span></div>'
                    +'</div>'
                  +'</div>'

                  +'<div class="row margin-top-10">'
                    +'<div class="col-md-6 col-5"><span class="font-600 label-payment">Email Address</span></div>'
                    +'<div class="col-md-6 col-6"><span class="font-400 desc-payment tx_email_address">'+data.email_address+'</span></div>'
                  +'</div>'

                  +'<div class="row margin-top-10">'
                    +'<div class="col-md-6 col-5"> <span class="font-600 label-payment">Payment Method</span></div>'
                    +'<div class="col-md-6 col-6"><span class="font-400 desc-payment">'+data.payment_method+'</span></div>'
                  +'</div>'

                  +'<div class="row margin-top-10">'
                    +'<div class="col-md-6 col-5"><span class="font-600 label-payment">Subtotal</span></div>'
                    +'<div class="col-md-6 col-6"><span class="font-400 desc-payment">₱ '+data.sub_total+'</span></div>'
                  +'</div>'

                   +'<div class="row margin-top-10">'
                    +'<div class="col-md-6 col-5"><span class="font-600 label-payment">Processing fee</span></div>'
                    +'<div class="col-md-6 col-6"><span class="font-400 desc-payment">₱ '+data.service_charge+'</span></div>'
                  +'</div>'

                  +'<div class="row margin-top-10">'
                    +'<div class="col-md-6 col-5"><span class="font-600 label-payment">Total</span></div>'
                    +'<div class="col-md-6 col-6"><span class="font-700 desc-payment">₱ '+data.amount+'</span></div>'
                  +'</div>'

                  
                  +'<div class="row margin-top-10">'
                    +'<div class="col-md-6 col-5"><span class="font-600 label-payment">Date Ordered</span></div>'
                    +'<div class="col-md-6 col-6"><span class="font-400 desc-payment">'+data.date_ordered+'</span></div>'
                  +'</div >'
                  +'<div style="border-bottom: 1px dashed #ababab;" class="margin-top-30"></div>'

              +'</div>'
        $("#transaction_summary_wrapper").html(string);
        if (data.payment_method !== 'Paymaya') {
            $("#loader").attr('hidden','hidden');
        }
        $("#payment_button_wrapper").removeAttr('hidden');
    })
}

function callbackTransaction(){
    $("#loader").removeAttr('hidden');
    input_ref_no = $("#input_ref_no").val();
    input_fullname = $("#input_fullname").val();
    input_mobile_num = $("#input_mobile_num").val();
    kenSrf = $("#kenSrf").val();
    $.ajax({
        url: base_url+'v2/order/callback',
        type: 'POST',
        dataType: 'JSON',
        data: {
            ref_no:ref_no,
            input_ref_no:input_ref_no,
            input_fullname:input_fullname,
            input_mobile_num:input_mobile_num,
            kenSrf:kenSrf
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

        else if (data.status == '4') {
            checkOrderStatus(data.reference_no);
            transactionStatus(data);
        }

        else if (data.status == '1') {
            transactionStatus(data);
        }

        else if(data.resultStatus == 'requestError'){
            swal({
              type: 'error',
              title: "Error",
              text: "Something technical went wrong! Please message us if you encountered this issue!",
              allowOutsideClick: false,
            });
        }
        $('#loader').attr('hidden','hidden')
    })
}

function checkOrderStatus(reference_no){
    $.ajax({
        url: base_url+'v2/order/check-order-status',
        type: 'GET',
        dataType: 'JSON',
        data: {reference_no:reference_no},
    })
    .done(function(data) {
        if (data.response == 'yet') {
            setTimeout(function(){checkOrderStatus(reference_no)}, 3000)
        }

        else if (data.response == 'closed') {
            sweetAlert({
                title:'Something went wrong!',
                text: 'No payment received! Order status closed !',
                type:'error',
                confirmButtonText: 'OK',
                allowOutsideClick: false,
           },function(isConfirm){
                alert('ok');
            });
            $('.swal2-confirm').click(function(){
               window.location='https://xquareshop.com';
            })
        }

        else if (data.response == 'confirm') {
            getOrderData(ref_no);
        }

        else if (data.response == 'pending') {
            sweetAlert({
                title:'Error!',
                text: 'You have input a wrong Reference No./Transaction Code. Please try again!',
                type:'error',
                confirmButtonText: 'OK',
                allowOutsideClick: false,
           },function(isConfirm){
                alert('ok');
            });
            $('.swal2-confirm').click(function(){
               window.location.reload();
            })
            
        }
    })    
}

function transactionStatus(data){
    $("#loader").removeAttr('hidden');
    string = '';
    paid_credit ='';
    parag = '';
    receipt = '';
    date_status = '';
    payment_status = '';
    paypal_payment_div = '';

    if (data.status == '1') {
        if (data.payment_method == 'Paypal') {
            paypal_payment_div +='<div class="row margin-top-10">'
                    +'<div class="col-md-6 col-5"><span class="font-600 label-payment">Paypal Transaction ID</span></div>'
                    +'<div class="col-md-6 col-6"><span class="font-400 desc-payment" id="paypal_payment_tx_id">Loading...</span></div>'
                +'</div>'
        }
        img_status = base_url+'assets/images/check-mark.gif';
        order_title = 'Transaction Complete!';
        paid_credit+='<div class="row margin-top-10" id="game_credit_wrapper">'
                      +'<div class="col-md-12 col-12">'
                        +'<span class="font-600 label-payment font-black">Voucher Code:</span>'
                        +'<div class="credit-style">'
                            +'<input type="hidden" id="paid_voucher_code" value="'+data.game_credit+'">'
                            +'<div class="font-600 text-center font font-black " id="success_credit">'+data.game_credit+'</div>'
                            +'<button id="copy_clipboard" title="Copy voucher code" data-clipboard-text="'+data.game_credit+'" class="copy-paid-credit btn btn-sm"><i class="fas fa-copy"></i></button>'
                        +'</div>'
                      +'</div>'
                    +'</div>';
        parag += "<div>We hope you're happy with your purchase. We'd love to hear how satisfied you are with your order. Please don't forget to give us review. Thank you! :).</div>"
        +"<div class='margin-top-10'>For inquiries, you may contact us on <a href='mailto:info@xquareshop.com'>info@xquareshop.com</a> or message our <a href='https://facebook.com/xquareshop' rel='noopener nofollow' blank='_blank'>Facebook Page</a>.</div>"
        +"<div class='text-left margin-top-20'>"
          +"<a class='btn btn-dark margin-right-5 margin-top-5' href='"+btn_make_purchase+"?utm_source=xquareshop&utm_medium=make_another_purchase&utm_campaign=order_page'>Make another purchase</a>"
          +"<a class='btn btn-dark margin-top-5' href='"+shop_url+"order/review/"+ref_no+"?utm_source=xquareshop&utm_medium=review_order_btn&utm_campaign=order_page'>Review order</a>"
        +"</div>";

        receipt +='<div class="row invoice-header-wrapper margin-bottom-20" >'
            +'<div class="col-xs-9 invoice-header" ><h4 class="font-300">Order Details</h4></div>'
            +'<div class="col-xs-3 text-right print-wrapper"><a class="btn btn-default" href="'+base_url+'v2/order/'+data.reference_no+'/invoice?utm_source=order_page" onclick="printInvoice()" ><i class="fa fa-receipt"></i> Want a receipt?</a></div>'
        +'</div>'
        date_status = 'Date Completed';
        payment_status = 'Total Amount';
        $("#source_wrapper").removeAttr('hidden');
    }
    else if(data.status == '4'){
        img_status = base_url+'assets/images/pending-loader.gif';
        order_title = 'Transaction on Process';
        parag = "<div>Thank you for your order, we will validate your transaction first, <b>make sure you input the correct "+data.payment_method+" ref.no./transaction code</b>. </div>"
            +"<div class='margin-top-10'>For inquiries, you may contact us on info@xquareshop.com or on our <a target='_blank' rel='noopener nofollow' href='https://facebook.com/xquareshop' rel='noopener nofollow' blank='_blank'>FB Page</a> Thank you!</div>"
        date_status = 'Date Paid';
        payment_status = 'Total Amount';
    }
    

    $("#payment_button_wrapper").hide();
    string+='<div class="margin-bottom-30" id="form_transaction_wrapper">'
       
       +receipt

        +'<div class=" margin-top-10">'
            +'<div class="margin-bottom-20">'
            +'<div class="margin-bottom-20 text-center">'
                +'<img src="'+img_status+'" draggable="false" class="img-fluid" width="170" height="170">'
                +'<h2 id="product-title" style="font-weight: 400; color: #3c3c3d; font-size: 26px;" class="text-capitalize tx-success-title margin-top-10">'+order_title+'</h2>'
                +'<span class="font-black">Thank you for your order!</span>'
                // +'<div><span style="color:#a5a5a5;">Payment Receipt</span></div>'
            +'</div>'
            // +'<h3 class="font-500 margin-top-20" style="color: #3a3a3a !important; font-family: Poppins !important;font-size: 21px; "><img src="'+base_url+'assets/images/payment-receipt.png" alt="payment-receipt" width="37"> Order '+data.order_item+' - '+data.payment_method+' </h3>'
            +'<div style="border-bottom: 1px dashed #ababab;" ></div>'
            +'</div>'

            +paid_credit

            +'<div class="row  margin-top-10">'
                +'<div class="col-md-6 col-5"><span class="font-600 label-payment">Reference No.</span></div>'
                    +'<div class="col-md-6 col-6"><span class="font-400 desc-payment">'+data.reference_no+'</span></div>'
                +'</div>'
            +'</div>'

            +paypal_payment_div

            +'<div class="row margin-top-10">'
                +'<div class="col-md-6 col-5"> '
                    +'<span class="font-600 label-payment">Product Item</span></div>'
                +'<div class="col-md-6 col-6"><span class="font-400 desc-payment"><img src="'+shop_url+''+data.product_image+'" height="25"> '+data.order_item+'</span></div>'
            +'</div>'

            +'<div class="row margin-top-10">'
                +'<div class="col-md-6 col-5"><span class="font-600 label-payment">Email Address</span></div>'
                +'<div class="col-md-6 col-6"><span class="font-400 desc-payment ">'+data.email_address+'</span></div>'
            +'</div>'


            +'<div class="row margin-top-10">'
                +'<div class="col-md-6 col-5"> <span class="font-600 label-payment">Payment Method</span></div>'
                +'<div class="col-md-6 col-6"><span class="font-400 desc-payment">'+data.payment_method+'</span></div>'
            +'</div>'

            +'<div class="row margin-top-10">'
                +'<div class="col-md-6 col-5"><span class="font-600 label-payment">Subtotal</span></div>'
                +'<div class="col-md-6 col-6"><span class="font-400 desc-payment">₱ '+data.sub_total+'</span></div>'
            +'</div>'

             +'<div class="row margin-top-10">'
                +'<div class="col-md-6 col-5"><span class="font-600 label-payment">Processing fee</span></div>'
                +'<div class="col-md-6 col-6"><span class="font-400 desc-payment">₱ '+data.service_charge+'</span></div>'
            +'</div>'

            +'<div class="row margin-top-10">'
                +'<div class="col-md-6 col-5"><span class="font-600 label-payment">'+payment_status+'</span></div>'
                +'<div class="col-md-6 col-6"><span class="font-800 desc-payment">₱ '+data.amount+'</span></div>'
            +'</div>'

           
            +'<div class="row margin-top-10">'
                +'<div class="col-md-6 col-5"><span class="font-600 label-payment">'+date_status+'</span></div>'
                +'<div class="col-md-6 col-6"><span class="font-400 desc-payment">'+data.date_ordered_update+'</span></div>'
            +'</div>'
            +'<div style="border-bottom: 1px dashed #ababab;" class="margin-top-30"></div></div><input type="hidden" id="amountToPay" value="'+data.amount+'">'
        +'</div>'

        +parag
    $("#transaction_summary_wrapper").html(string);
    $("#loader").attr('hidden','hidden');
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
        if (data.status == '4') {
            transactionStatus(data);
            checkOrderStatus(data.reference_no) 
        }
        else if (data.status == '2') {
            getTransactionData(data);
            // checkOrderStatus(data.reference_no) 
        }
        else if (data.status == '1') {
            transactionStatus(data);

            if (data.payment_method == 'Paypal') {
                getPaypalOrdersData(data.payment_reference_no);
            }
            else if(data.payment_method == 'Paymaya'){
                // getPaymayaOrderData(data.payment_reference_no, data.auth.api);
            }
        }
    })
}

function getPaypalOrdersData(payment_reference_no){
  $.ajax({
    url: base_url+'paypal/getOrderDetails',
    type: 'GET',
    dataType: 'JSON',
    data: {payment_reference_no:payment_reference_no},
  })
  .done(function(data) {
    order_payment_id = data.data.purchase_units[0].payments.captures[0].id;
    $("#paypal_payment_tx_id").text(order_payment_id)
  })    
}