var base_url;
var ref_no;
var pid;
var item_name;
var item_description;
var sku;
var currency;
var category;
var env;
var shop_url;

paypal.Buttons({
  env: env,

  createOrder: function() {
  let formData = new FormData();
  formData.append('item_name', item_name);
  formData.append('item_description', item_description);
  formData.append('sku', sku);
  formData.append('currency',  currency);
  formData.append('ref_no', ref_no);
  formData.append('category', category);


  return fetch(
    base_url+'api/paypal/order/_create',
    {
      method: 'POST',
      body: formData
    })

    .then(function(response) {
      return response.json();
    })
    .then(function(resJson) {
      if (resJson.status == 'failed') {
        sweetAlert({
          title:'Error!',
          text: resJson.message,
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

      else{
        return resJson.data.id;
        var payment_ref_no = resJson.data.id;
        $("title").text('Order Transasction ' + payment_ref_no);
        console.log(payment_ref_no)
      }
    });
  },

  onApprove: function(data, actions) {
    $("#loader").removeAttr('hidden');
    return fetch(
    base_url+'api/paypal/order/_capture',
    {
      method: 'GET'
    })

    .then(function(res) {
      return res.json();
    })
    .then(function(res) {
      capture_amount = res.data.purchase_units[0].payments.captures[0].amount.value;
      callbackTransaction(data.orderID, capture_amount);
      
      console.log('Order ID: '+res.data.id)
      console.log('Amount: '+capture_amount)
    });
  }
}).render('#payment_button_wrapper');



function callbackTransaction(orderID, capture_amount){
    let kenSrf = $("#kenSrf").val();

    $.ajax({
        url: base_url+'api/order/callback/_paypal',
        type: 'POST',
        dataType: 'JSON',
        data: {
            ref_no:ref_no,
            orderID:orderID,
            kenSrf:kenSrf,
            pid:pid,
            capture_amount:capture_amount
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
            if (data.payment_method == 'Paypal') {
              getPaypalOrdersData(orderID)
            }
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
