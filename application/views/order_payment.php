<!DOCTYPE html>
<html lang="en">
<head>
<title>Order Transasction <?=$ref_no?></title>

</head>
<body class="payment-body">
<script src="<?=base_url()?>assets/js/jquery-3.4.1.min.js"></script>
<script src="<?=base_url('assets/js/')?>sweetalert2.all.min.js"></script> 

<?php if ($orderData['status'] == 'pending' && $orderData['payment_method'] == 'paypal'){ ?>
<script src="<?=PAYPAL_ENV?>"></script>
<?php } ?>
<script>
    var base_url = '<?=base_url()?>';
    var ref_no = '<?=$ref_no?>';
    var payment_ref_no = '';
    var payment_method = '<?=$orderData['payment_method']?>';
    var pid = '<?=$orderData['pid']?>';
    var orderStatus = '<?=$orderData['status'] ?>';
    var item_name = '<?=$orderData['order_item']?>';
    var item_description = '<?=$orderData['order_description']?>';
    var sku = '<?=$orderData['sku']?>';
    var env = '<?= ($orderData['payment_method'] == 'Paypal') ? PAYPAL_ENVIRONMENT : $orderData['payment_method'] ?>';
    var currency = 'PHP';
    var category = 'PHYSICAL_GOODS';
    var dp_amount = '<?=$orderData['amount']?>';
</script>

<div class="container">
  <div class="">
    <?php if($orderData['status'] == 'pending' && $orderData['payment_method'] == 'paypal') { ?>
    <div id="payment_button_wrapper" class="margin-top-20"></div>
    <?php } ?>
  </div>
</div>


<script src="<?=base_url()?>assets/styles/bootstrap4/popper.min.js"></script>
<script src="<?=base_url()?>assets/styles/bootstrap4/bootstrap.min.js"></script>
<?php if($orderData['status'] == 'pending' && $orderData['payment_method'] == 'paypal') { ?>
  <script src="<?=base_url()?>assets/js/auth/_paypal.js?v=<?=filemtime('assets/js/auth/_paypal.js')?>"></script>
<?php } ?>
