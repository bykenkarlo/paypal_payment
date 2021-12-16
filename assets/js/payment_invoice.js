var base_url;
var ref_no;
var pid;
var orderStatus;

// getTransactionData()

if (orderStatus == '1') {
   getOrderData(ref_no);
}

function getOrderData(ref_no){
    $.ajax({
        url: base_url+'v3/order/get-orders-data',
        type: 'GET',
        dataType: 'JSON',
        data: {reference_no:ref_no},
    })
    .done(function(data) {
        if (data.status == '1') {
            transactionStatus(data);
        }
    })
}


function transactionStatus(data){
    // $("#loader").removeAttr('hidden');
    string = '';
    paid_credit ='';
    parag = '';
    img_status = base_url+'assets/images/check.png';
    order_title = 'Transaction Complete!';
    amount = data.price * data.qty;
    order_data = '';

    if (data.payment_method == 'paypal' || data.payment_method == 'Paypal') {
        getOrdersData(data.payment_reference_no);
    }


     if (data.payment_method == 'paypal' || data.payment_method == 'Paypal') {
        order_data +='<div class="row margin-top-5">'
            +'<div class="col-md-6 col-6"><span class="font-600" >Sold to:</span> <span id="sold_to">Loading....</span> <br> <span id="paypal_email_address" >...</span> <br> <span class="font-600">Paypal Transaction No: </span> <span id="paypal_id"></span> <br><span class="font-600">Order Ref. No:</span> '+data.reference_no+'</div>'
            +'<div class="col-md-6 col-6"><span class="font-600" >Address:</span> <span id="paypal_shipping_address" >Loding...</span> <br> <span class="font-600" >Date: </span> '+data.invoice_date_ordered+' </div>'
         +'</div>'
                    
    }
    else{
        order_data +='<div class="row margin-top-5">'
            +'<div class="col-md-6 col-6"><span class="font-600">Sold to:</span> '+data.email_address+' <br> <span class="font-600">Order Ref. No:</span> '+data.reference_no+'</div>'
            +'<div class="col-md-6 col-6"><span class="font-600">Date:</span> '+data.invoice_date_ordered+'</div>'
        +'</div>'
   }

    $("#payment_button_wrapper").hide();
    string+='<div class="margin-bottom-10" id="">'
        +'<div class="margin-top-5">'
            +'<div class="row invoice-header-wrapper" >'
                +"<div class='col-xs-9 invoice-header' ><h4 class='font-300'>Order's Receipt</h4></div>"
                +'<div class="col-xs-3 text-right print-wrapper"><a class="btn btn-default print-btn" href="#print-invoice" onclick="printInvoice()" ><i class="fa fa-print"></i> Print</a></div>'
            +'</div>'
           
            +'<div id="invoice_container">'
                +'<div class="text-center margin-top-20"><img class="img-fluid" style="height: 45px;" src="https://xquareshop.com/assets/images/xquareshop-logo.png"></div>'
                +'<div class="margin-bottom-20  margin-top-15">'
                    +'<div class="margin-bottom-20 text-center">'
                        +'<h2 id="product-title" class="text-uppercase font-suez-one title-invoice" class="text-capitalize tx-success-title" class="margin-top-10">KenKarlo Digital</h2>'
                        +'<h2 id="product-title" class="text-uppercase font-suez-one title-sub-invoice" style="margin-top: -5px;" class="text-capitalize" class="margin-top-10">E-load and Prepaid Cards Retailing</h2>'
                        +'<div class="font-black" style="margin-top: -5px;">Gemini St. V&G, Brgy. 109-A Tacloban City</div>'
                        +'<div class="font-black">NON-VAT Reg. TIN: 767-023-592-000</div>'
                    +'</div>'

                    +'<div><h2 class="text-uppercase text-left title-sub-invoice link-color ">Sales Invoice</h2></div>'
                    
                    +order_data
                    
                +'</div>'

                +'<table class="table table-hover table-bordered">'
                    +'<thead>'
                        +'<tr>'
                            +'<th>QTY</th>'
                            +'<th>UNIT</th>'
                            +'<th>ITEM</th>'
                            +'<th>UNIT PRICE</th>'
                            +'<th>AMOUNT</th>'
                        +'</tr>'
                    +'</thead>'
                    +'<tbody>'
                        +'<tr>'
                            +'<td>1</td>'
                            +'<td>Pc.</td>'
                            +'<td> '+data.order_item+': "'+data.game_credit+'"</td>'
                            +'<td>₱ '+data.price+'</td>'
                            +'<td>'+data.price+'</td>'
                        +'</tr>'
                    +'</tbody>'
                +'</table>'

                    +'<div class="text-right total-amount-invoice margin-top-20">'
                        +'<div class="pull-right margin-bottom-5"><span class="font-400 cursor-pointer"> Processing Fee: <span class="font-400">₱ '+data.charge+'</span></div>'
                        +'<div class="pull-right"><span class="font-600 desc-payment cursor-pointer"> TOTAL AMOUNT DUE: <span class="link-color font-700">₱ '+data.total_amt+'</span></div>'
                    +'</div>'
                +'</div>'

                +'<hr>'

                // +'<div class="text-right margin-top-30 invoice-contact">'
                //     +'<div class="pull-right"><span class="font-400 desc-payment cursor-pointer invoice-contact"> info@xquareshop.com</span></div>'
                //     +'<div class="pull-right"><span class="font-400 font-sm text-center invoice-contact"> KenKarlo Digital </span></div>'
                //     +'</div>'
                // +'</div>'
            +'</div>'
        +'</div>'

        +parag
    $("#payment_invoice_wrapper").html(string);
    // $("#loader").attr('hidden','hidden');
    window.scrollTo(800,0);
}

function printInvoice() {
    var printContents = $("#invoice_container").html();
    var originalContents = document.body.innerHTML;
    var originalTitle = document.title;

    document.title = "Print Invoice";
    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
}

function getOrdersData(payment_reference_no){
  $.ajax({
    url: base_url+'paypal/getOrderDetails',
    type: 'GET',
    dataType: 'JSON',
    data: {payment_reference_no:payment_reference_no},
  })
  .done(function(data) {
    address_line_1 = '';
    address_line_2 = '';
    admin_area_2 = '';
    admin_area_1 = '';
    postal_code = '';
    country_code = '';


    order_payment_id = data.data.purchase_units[0].payments.captures[0].id;
    given_name = data.data.payer.name.given_name;
    surname = data.data.payer.name.surname;
    email_address = data.data.payer.email_address;

    if (data.data.purchase_units[0].shipping.address.address_line_1) {
        address_line_1 = data.data.purchase_units[0].shipping.address.address_line_1;
    }

    if (data.data.purchase_units[0].shipping.address.address_line_2) {
        address_line_2 = data.data.purchase_units[0].shipping.address.address_line_2;
    }
    if (data.data.purchase_units[0].shipping.address.admin_area_2) {
        admin_area_2 = data.data.purchase_units[0].shipping.address.admin_area_2;
    }
    if (data.data.purchase_units[0].shipping.address.admin_area_1) {
        admin_area_1 = data.data.purchase_units[0].shipping.address.admin_area_1;
    }
    if (data.data.purchase_units[0].shipping.address.postal_code) {
        postal_code = data.data.purchase_units[0].shipping.address.postal_code;
    }
    if (data.data.purchase_units[0].shipping.address.country_code) {
        country_code = data.data.purchase_units[0].shipping.address.country_code;
    }

    shipping = address_line_1+' '+address_line_1+' '+address_line_2+' '+admin_area_2+' '+admin_area_1+' '+postal_code+' '+country_code;
    $("#paypal_id").text(order_payment_id)
    $("#sold_to").text(given_name+' '+surname)
    $("#paypal_email_address").text('"'+email_address+'"')
    $("#paypal_shipping_address").text(shipping)
  })    
}