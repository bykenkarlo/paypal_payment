var base_url;

$('#send_email_game_credit_success').on('click', function(e){
    e.preventDefault();
    sendCredits();
})
$("#send_error_email").on('click', function(e) {
    e.preventDefault();
    sendErorEmail();
})
$('#all-delivered-orders').hide();
$('#hide-all-orders').hide();
$("#show-all-orders").on('click', function(){
    $('#all-delivered-orders').show();
    $('#hide-all-orders').show();
    $(this).hide();
})

$("#hide-all-orders").on('click', function(){
    $('#all-delivered-orders').hide();
    $('#show-all-orders').show();
    $(this).hide();
})
function deletePendingOrderAlert() { //alert message confirm
	sweetAlert({
    	title: "Delete all.",
    	text: "Are you sure you want to delete all pending orders?",
    	type: "warning",
    	showCancelButton: true,
    	confirmButtonText: 'Yes, proceed!'
    },function(isConfirm){
        alert('ok');
    });
    $('.swal2-confirm').click(function(){
        deleteAllPendingOrders();
    });
}
function deleteAllPendingOrders() {

    $.ajax({
        url: base_url+'auth-process/delete-all-pending-orders',
        type: 'POST',
    })
    .done(function(data){
        if(data == 'success'){
            sweetAlert({
                title: "Success",
                text: "All pending orders are removed! Please Wait while reloading the page...",
                type: "success",
                confirmButtonText: 'Okay'
            })
        }
        setTimeout(function() {location.reload()}, 3000)
    })
}
function openOrder(order_id){
    $('#loader').removeAttr('hidden');
    $.ajax({
        url: base_url+'auth-process/getOrderListByID',
        type: 'POST',
        dataType: 'JSON',
        data: {order_id:order_id},
    })
    .done(function(data) {
        $('#gcash_order_wrapper').hide();
        $('#bitcoin_order_wrapper').hide();
        $('#palawan_order_wrapper').hide();

        if (data.payment_method == 'Bitcoin') {
            $('#bitcoin_order_wrapper').hide();
        }
        else if(data.payment_method == 'Gcash') {
            $('#gcash_order_wrapper').hide();

        }
        else if(data.payment_method == 'Palawan Pawnshop'){
            $('#palawan_order_wrapper').hide();
        }

        if (!data.payment_reference_no) {
            $("#view_payment_ref_no").html(data.input_ref_no);
        }
        else{
            $("#view_payment_ref_no").html(data.payment_reference_no);
        }

        agent = data.agent;
        credits = data.credits;
        if (agent) {
             $("#view_platform").html(agent.platform);
            $("#view_browser").html(agent.browser);
        }
        $('#view_game_credit').html(data.game_credit);
        $("#view_email_address").html(data.email_address);
        $("#view_order_title").html('<i class="fa fa-shopping-cart"></i> Order Ref.No '+data.reference_no);
        // $("#view_order_id").val(data.order_id)
        $("#view_order_item").html(data.order_item);
        $("#view_reference_no").html(data.reference_no);
        $("#view_payment_method").html(data.payment_method);
        $("#view_amount").html('P '+data.price+'.00 <span style="color: #1cdb7b;"><i class="fa fa-check-circle"></i>');
        $("#view_email_address").html(data.email_address);
        $("#credits_pid").html(data.pid);
        $("#view_ip_address").html(data.ip_address);
        $("#view_date_ordered").html(data.date_ordered);
        $("#viewThisOrder").modal('show');
        $('#loader').attr('hidden','hidden');
    })
    
}
function openSendGameCredits(order_id){
    $('#loader').removeAttr('hidden');
    $.ajax({
        url: base_url+'auth-process/getOrderListByID',
        type: 'POST',
        dataType: 'JSON',
        data: {order_id:order_id},
    })
    .done(function(data) {
        if (!data.game_credit) {
            getPaidCredits(data.pid);
        }
        else{
            $('#game_credits').val(data.game_credit)
        }
        $("#client_email_address").val(data.email_address)
        $("#modal-title-credits").html('<i class="fa fa-shopping-cart"></i> Send Game Credits - Ref.No '+data.reference_no);
        $("#order_id").val(data.order_id)
        $("#send_order_item").html(data.order_item);
        $("#send_reference_no").html(data.reference_no);
        $("#send_payment_method").html(data.payment_method);
        $("#send_amount").html('P '+data.price+'.00 <span style="color: #1cdb7b;"><i class="fa fa-check-circle"></i>');
        $("#send_email_address").html(data.email_address);
        $("#credits_pid").html(data.pid);
        $("#sendGameCreditsModal").modal('show');
        $('#loader').attr('hidden','hidden');
    })
}
function showErrorNotice(order_id){
    $('#loader').removeAttr('hidden');
    $.ajax({
        url: base_url+'auth-process/getOrderListByID',
        type: 'POST',
        dataType: 'JSON',
        data: {order_id:order_id},
    })
    .done(function(data) {
        if (data.game_credit.legnth > 0) {
            getPaidCredits(data.pid);
        }
        else{
            $('#game_credits').val(data.game_credit)
        }
        $("#client_email_address").val(data.email_address);
        $("#error_input_email_address").val(data.email_address);
        $("#error_ref_no").html('<i class="fa fa-envelope"></i> Send Error Mail - Ref.No  '+data.reference_no);
        $("#error_order_id").val(data.order_id);
        $("#error_order_item").html(data.order_item);
        $("#error_reference_no").html(data.reference_no);
        $("#error_payment_method").html(data.payment_method);
        $("#error_amount").html('P '+data.price+'.00');
        $("#error_email_address").html(data.email_address);
        $("#credits_pid").html(data.pid);
        $("#error_date_ordered").html(data.date_ordered);
        $("#sendErrorEmail").modal('show');
        $('#loader').attr('hidden','hidden');
    })
    
}
function getPaidCredits(pid){
    $.ajax({
        url: base_url+'auth-process/getPaidCredits',
        type: 'POST',
        dataType: 'JSON',
        data: {pid:pid},
    })
    .done(function(data) {
       $('#game_credits').val(data.credits)
       $("#credits_id").val(data.credits_id)
    })
}
function sendCredits(){
    $('#loader').removeAttr('hidden');
    order_id = $("#order_id").val();
    credits_id = $("#credits_id").val();
    game_credits = $("#game_credits").val();
    client_email_address = $("#client_email_address").val();

    $.ajax({
        url: base_url+'order/sendCredits',
        type: 'POST',
        dataType: 'JSON',
        data: {
            order_id:order_id,
            credits_id:credits_id,
            game_credits:game_credits,
        },
    })
    .done(function(data) {
       if (data.resultStatus == 'success') {
            const toast = swal.mixin({
              toast: true,
              position: 'top-end',
              showConfirmButton: false,
              timer:5000
            });

            toast({
              type: 'success',
              title: 'Game Credits Sent to '+client_email_address+''
            });
            $('#loader').attr('hidden','hidden');
            $("#sendGameCreditsModal").modal('hide');
            setTimeout(function() {location.reload()},2000);
        }
        
    })
}
function sendErorEmail(){
    $('#loader').removeAttr('hidden');
    order_id = $("#error_order_id").val();
    email_address = $("#error_input_email_address").val();

    $.ajax({
        url: base_url+'order/sendErrorEmail',
        type: 'POST',
        dataType: 'JSON',
        data: {
            order_id:order_id,
        },
    })
    .done(function(data) {
       if (data.resultStatus == 'success') {
            const toast = swal.mixin({
              toast: true,
              position: 'top-end',
              showConfirmButton: false,
              timer:5000
            });

            toast({
              type: 'success',
              title: 'Error message sent to '+email_address+''
            });
            $("#sendErrorEmail").modal('hide');
            $('#loader').attr('hidden','hidden');
            setTimeout(function() {location.reload()},2000);
        }
        
    })
}