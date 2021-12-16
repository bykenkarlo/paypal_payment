var base_url;

showCredits();
$("#add_credit_form").on('submit',function(e){
	e.preventDefault();
	add_credit_form();
})
function showCredits(){
	$.ajax({
		url: base_url+'auth-process/showCredits',
		type: 'POST',
		dataType: 'JSON',
	})
	.done(function(data) {
		string = '';
		if (data.length > 0) {
			for(var i = 0; i < data.length; i++){
				status = data[i].status;
				if (status == 'new') {
					btn = 'btn-success';
				}
				else{
					btn = 'btn-secondary'
				}
				string+='<tr>'
					+'<td>'+data[i].name+'</td>'
					+'<td>'+data[i].credits+'</td>'
					+'<td>'
						// +'<button class="btn btn-sm font-sm font-capitalize '+btn+'">'+status+'</button>'
						+'<span class="dropdown">'
						+'<button style="font-size: 11.5px; height: 28px;" class="btn '+btn+' btn-xs dropdown-toggle" type="button" data-toggle="dropdown">'+status+''
							+'<span class="caret"></span></button>'
						 	+'<ul class="dropdown-menu" style="padding-left: 20px; font-size: 14.5px;">'
								+'<li><a href="#update-status" data-toggle="modal" onclick="updateStatusCredit('+data[i].credits_id+',\'new\')">New</a></li>'
							    +'<li><a href="#update-status" onclick="updateStatusCredit('+data[i].credits_id+',\'used\')">Used</a></li>'
							+'</ul>'
						+'</span>'
					+'</td>'
					+'<td>'+data[i].created_at+'</td>'
					+'<td>'
						+'<span class="dropdown">'
						+'<button style="font-size: 11.5px; height: 28px;" class="btn btn-primary btn-xs dropdown-toggle" type="button" data-toggle="dropdown">Action'
							+'<span class="caret"></span></button>'
						 	+'<ul class="dropdown-menu" style="padding-left: 20px; font-size: 14.5px;">'
								+'<li><a href="#edit-product" data-toggle="modal" onclick="editCredit()">Edit</a></li>'
							    +'<li><a href="#delete-product" onclick="confirmDeleteCredit('+data[i].credits_id+')">Delete</a></li>'
							+'</ul>'
						+'</span>'
					+'</td>'
				+'</tr>'
			}
			$("#credits-list").html(string);
		}
	})
	
}
function add_credit_form(){
	product_id = $("#product_id").val();
	credit = $("#credit").val();
	$.ajax({
		url: base_url+'auth-process/addCredit',
		type: 'POST',
		dataType: 'JSON',
		data: {product_id:product_id, credit:credit},
	})
	.done(function(data) {

		if (data.resultStatus == 'fail') {
			swal({
				type: 'error',
				title: 'Error',
				text: 'Credit is already added!',
			});
		}
		else if(data.resultStatus == 'success'){
			swal({
				type: 'success',
				title: 'Success',
				text: 'Credit Added!',
			});
		}
		$("#addCredits").modal('hide');
		$("#add_credit_form input").val('');
		showCredits();
	})
	
}
function confirmDeleteCredit(credits_id){
	sweetAlert({
        title:'Warning!',
        text: 'Are you sure you want to remove this item?',
        type:'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, proceed!'
   },function(isConfirm){
        alert('ok');
    });
    $('.swal2-confirm').click(function(){
       	deleteCredit(credits_id)
    })
}
function deleteCredit(credits_id){
	$.ajax({
       		url: base_url+'auth-process/deleteCredit',
       		type: 'POST',
       		data: {credits_id:credits_id},
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
	              title: 'Credit item has been deleted!'
	            });
	       	}
	       	showCredits();
    })
}
function updateStatusCredit(credits_id, status){
	sweetAlert({
        title:'Update!',
        text: 'Are you sure you want to update the status of this item to '+status+'?',
        type:'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, proceed!'
   },function(isConfirm){
        alert('ok');
    });
    $('.swal2-confirm').click(function(){
       	$.ajax({
       		url: base_url+'auth-process/updateStatusCredit',
       		type: 'POST',
       		data: {credits_id:credits_id, status:status},
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
	              title: 'Credit item has been updated!'
	            });
	       	}
	       	showCredits();
    	})
    })
}