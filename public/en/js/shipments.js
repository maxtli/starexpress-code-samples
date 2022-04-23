function displayEdit() {
    addElementToTable('RecipientName', 'pk', {classes: 'editinput ', mimic: true, attrs: 'placeholder="Recipient Name..." required'});
    addElementToTable('Address', 'pk', {classes: 'editinput editaddressselector ', mimic: true, attrs: 'placeholder="Address..." required'});
    addElementToTable('City', 'pk', {classes: 'editinput editaddressselector ', mimic: true, attrs: 'placeholder="City..." required'});
    addElementToTable('State', 'pk', {type: 'select', classes: 'editinput editaddressselector ', innerHtml: '<option value="">State...</option>', attrs: 'required'});
    addElementToTable('Country', 'pk', {type: 'select', classes: 'editinput editaddressselector ', innerHtml: $('#j_LX-Country').html(), mimic: true, attrs: 'required'});
    addElementToTable('Zip', 'pk', {classes: 'editinput editaddressselector ', mimic: true, attrs: 'placeholder="Zip..."'});
    $(".Countryselector").change(function () {
        ajaxGetValues('/retrieveDep/State?dep=', $(this).val(), $(this).siblings('.Stateselector'), 'State...');
    }).each(function() {
        ajaxGetValues('/retrieveDep/State?dep=', $(this).val(), $(this).siblings('.Stateselector'), 'State...', {postVal: $(this).parents('.t_Qrow').find('.State_label').html()});
    });
    generateEditInputs();
} 

function validateEdit() {
    var success = true;
    $('#editerrorlabel').prop('hidden', true);
    $('.t_Qrow:visible').each(function () {
        var row = $(this);
        if (!row.find('.editinput:visible').length) {
            success = false;
            return true;
        }
        //checks if an edit input isn't modified at all
        var empty = row.find('.editinput:visible').filter(function () {
            return $.trim($(this).val()) === row.find($(this).prop('class').replace('c_input removable editinput ', '.').replace('editaddressselector ', '').replace('selector', '') + '_label').html();
        });
        var nonAddress = empty.filter(':not(.editaddressselector)');
        if (nonAddress.length) {
            setEmptyField(nonAddress);
            success = false;
        }
        var address = empty.filter('.editaddressselector');
        if (address.length === 5) {
            setEmptyField(address);
            success = false;
        }
    });
    if (checkEmptyFields($('#shipmentoperationform').find('.removable[required]:visible')) && success)
        refreshTable('edit', $('#shipmentoperationform').serialize(), 'POST');
    else
        $('#editerrorlabel').prop('hidden', false);
}
