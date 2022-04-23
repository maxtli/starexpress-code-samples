$(function () {
    var pics = [];
    load('orderTicket');
    loadProduct();
    loadNav();
    loadImg(pics, '#uploadimagebutton', '#a_picdisplay');
    $('#finalsubmitbutton').click(function () {
        $('#j_LX-RootCategory, #j_LX-Subcategory').prop('disabled', true);
        var valid = verifyForm($('#pkcreatearea'), false);
        $('input, select').prop('disabled', false);
        if(!$('#j_LX-RootCategory').val()) $('#j_LX-Subcategory').prop('disabled', true);
        if(pics.some(x => x) || $('#additionalinfobox').val() || valid) {
            var formData = new FormData();
            $.each(pics, function(i, item) {
                if(item) formData.append('pic' + i, item);
            });
            $('.crpriteminput').each(function() {
                if($(this).val()) formData.append($(this).prop('id').replace('crpritem_', ''), $(this).val());
            });
            if($('#additionalitembox').val()) formData.append('Description', $('#additionalitembox').val());
            ajaxSubmit('orderTicket/a_submit', 'account', formData, false, 'POST', true);
        }
    });
});