var pkiv = [];
$(function() {
    var itemrows = [];
    generateForm('#j_dy-form', [
        {Service: {type: 'sel', nofill: true, defEmpty: true, title: 'StarExpress Service', req: true}, 
        Warehouse: {type: 'sel', defEmpty: true, nofill: true, selName: 'WarehouseWeight', title: 'Ship From', req: true}},
        {Destination: {type: 'address', span: 2, req: true}},
        {RecipientName: {type: 'name', req: true}, PhoneNumber: {type: 'phone', req: true}}
    ]);
    generateForm('#j_dy-form2', [
        {Weight: {type: 'wgt', title: 'Weight (always round up)', req: true}, Volume: {type: 'vol', title: 'Dimensions (only if oversize)'}}
    ]);
    loadProduct(itemrows);
    load('shipments/create');
    loadNav();
    $('#j_LX-WarehouseWeight').data('prevW', '').change(function() {
        if(!itemrows.every(function(item) {
            return item === null;
        }) || pkiv.length) {
            $('#c_overlay').fadeIn();
            $('#c_overlay-box').css('width', '60%').children(':not(#warehousechangearea)').prop('hidden', true);
            $('#warehousechangearea').prop('hidden', false);
            $(this).data('newW', $(this).val()).val($(this).data('prevW'));
        } else {
            $(this).data('newW', $(this).val());
            $('#yeschangewarehousebutton').click();
        }
    });
    $('#yeschangewarehousebutton').click(function() {
        itemrows.length = 0;
        pkiv = [];
        $('.itemcontentrow').remove();
        calculateTotalPrice(itemrows);
        $('#decpricebutton, #invpricebutton').prop('disabled', true).change();
        $('#selectinvbutton').off('click').click(resetInvWindow);
        var selWarehouse = $('#j_LX-WarehouseWeight');
        setCurrency(selWarehouse.val(selWarehouse.data('newW')).data({prevW : selWarehouse.val(), newW : ''}).val());
        ajaxGetValues('/getTransporters/', selWarehouse.val(), $('#j_LX-Carrier'), 'Select Carrier...');
    });
    $('#j_LX-Currency').change(function() {
        $('#' + $('.moderadio:checked').val() + 'pricebutton').prop('hidden', !($(this).val() && $('#j_i-bal-cy-' + $(this).val()).length));
    });
    $('#invconsentbox').change(function() {
       $('#finalinvcreatebutton').prop('disabled', !$(this).prop('checked'));
    });
    $('#decconsentbox').change(function() {
       $('#finaldeccreatebutton').prop('disabled', !$(this).prop('checked'));
    });
    $('#invpricebutton, #decpricebutton').change(function() {
        $('#paymentcurrencyarea').prop('hidden', $(this).prop('disabled'));
    });
    $('.moderadio').click(function() {
        var mode = $('.moderadio:checked').val();
        $('[class^="pkmode_"]').prop('hidden', true);
        $('.pkmode_' + mode).prop('hidden', false);
        $('#paymentcurrencyarea').prop('hidden', $('#' + mode + 'pricebutton').prop('disabled'));
    });
    $('#selectinvbutton').click(resetInvWindow);
    $('#invpricebutton').click(function() {
        if(!checkEmptyFields($('[form="j_f-create"][required]:visible'), $('#createerrorlabel')) || makeSummary(true))
            return;
        var submitData = $('#j_f-create').serializeArray().reduce(function(a, x) {a[x.name] = x.value; return a;}, {ivinfo: pkiv});
        ajaxRequest('/shipments/create/a_getCreateFee', function(result) {
            result = result['data'];
            $('#j_i-pc-invunit').html(result['UnitPrice']);
            var balance = $('#j_i-bal-cy-' + $('#j_LX-Currency').val()).html();
            var fee = parseFloat(result['ExcFee'] || result['Fee']);
            $('.paymentfeeindic').html(balance.substring(0, balance.search(/[1-9]/)) + fee.toFixed(2));
            var err = (fee - parseFloat(balance.substring(balance.search(/[1-9]/))) > 0.005);
            $('#invconsentbox').prop('disabled', err);
            $('#invbalanceerrorlabel').prop('hidden', !err);
            if(result['Rate']) {
                $('#j_i-pc-invexcunit').html(balance.substring(0, balance.search(/[1-9]/)) + result['ExcUnitPrice']);
                $('#j_i-exc-inv').html(result['Rate']);
                $('#invexchangecurrencyarea').prop('hidden', false);
            }
            $('#paymentinvnoticearea').prop('hidden', false);
        }, submitData, 'POST');
    });
    $('#decpricebutton').click(function() {
        var submitData = verifyItemForm('shipment', {pdinfo: itemrows.filter(Boolean)});
        if(!submitData || makeSummary()) return;
        ajaxRequest('/shipments/create/a_getCreatePrice', function(result) {
            result = result['data'];
            $('#j_i-pc-decunit').html(result['UnitPrice']);
            var balance = $('#j_i-bal-cy-' + $('#j_LX-Currency').val()).html();
            var price = parseFloat(result['ExcPrice'] || result['TotalPrice']);
            $('.j_i-pc-finalpayment').html(balance.substring(0, balance.search(/[1-9]/)) + price.toFixed(2));
            var err = (price - parseFloat(balance.substring(balance.search(/[1-9]/))) > 0.005);
            $('#decconsentbox, #finaldeccreatebutton').prop('disabled', err);
            $('#balanceerrorlabel').prop('hidden', !err);
            if(result['Rate']) {
                $('#decexchangecurrencyarea').prop('hidden', false);
                $('#j_i-pc-preferredcurrency').html(parseFloat(result['TotalPrice']).toFixed(2));
                $('#j_i-exc-dec').html(result['Rate']);
                $('#finaldeccreatebutton').prop('disabled', true);
            }
            $('#paymentpricearea').prop('hidden', false);
        }, submitData, 'POST');
    });
    $('#finalinvcreatebutton').click(function() {
        ajaxSubmit('shipments/create/a_createInv', 'shipments/find', {'consent': $('#invconsentbox').prop('checked')}, 'num');
    });
    $('#finaldeccreatebutton').click(function() {
        ajaxSubmit('shipments/create/a_create', 'shipments/find', {'consent': $('#decconsentbox').prop('checked')}, 'num');
    });
    $('#editpackagebutton').click(function() {
        $('#packagesummaryarea, #paymentpricearea, #paymentinvnoticearea, #balanceerrorlabel').prop('hidden', true);
        $('.c_tab, #pkcreatearea, #paymentcurrencyarea').prop('hidden', false);
        $('#a_summarytable, .paymentfeeindic, .j_i-pc-payment').html('');
        $('#insertcontentbox').remove();
    });
});

function makeSummary(inv = false) {
    $('#invconsentbox, #decconsentbox').prop('checked', false).change();
    $('#packagesummaryarea').prop('hidden', false);
    $('.c_tab, #pkcreatearea, #paymentcurrencyarea, .exchangecurrencyarea').prop('hidden', true);
    var destination = {};
    $.each(['Country', 'State', 'City', 'Address', 'Zip'], function(i, item) {
        destination[item] = $('#j_dy-form').find('[name="' + i + '"]').val();
    });
    $.each(['Service', 'Warehouse', 'Destination', 'Recipient', 'Phone', 'Currency'], function(i, item) {
        $('#a_summarytable').append('<tr><td>' + item + '</td><td>' + (item === 'Destination' ? generateAddress(destination) : 
        item === 'Recipient' ? ($('#j_LX-CountryPhone').val() === 'USA' ? $('[name="FirstName"]').val() + ' ' + $('[name="LastName"]').val() : $('[name="LastName"]').val() + $('[name="FirstName"]').val()) 
        : $('#j_dy-form').find('[name="' + i + '"]').val()) + '</td></tr>');
    });
    if(!inv) {
        $('#a_summarytable').append('<tr><td>Weight</td><td>' + $('[name="Weight"]').val() + ' ' + $('.j_i-LX-WarehouseWeight').val() + '</td></tr>');
        if($('.j_volDim').val()) $('#a_summarytable').append('<tr><td>Volume</td><td>' + $('#voldim1').val() + ' x ' + $('#voldim2').val() + ' x ' + $('#voldim3').val() + ' ' + $('.j_i-LX-WarehouseVolume').val() + '</td></tr>');
    }
    $('#packagesummaryarea').append($('#' + (inv ? 'inv' : 'item' ) + 'bottomcontentbox').clone().prop('id', 'insertcontentbox'));
    $('#insertcontentbox').find('button').remove();
    return false;
}
function resetInvWindow() {
    $('#selectinvbutton').off('click').click(function() {
        _OPC = "#c_overlay-box "; 
        $('#c_overlay').fadeIn().children('#c_overlay-box').css('width', '90%').children(':not(#z_invcontentbox)').prop('hidden', true);
        $('#z_invcontentbox').prop('hidden', false).trigger('savePrevContent');
    }).click();
    $.ajax({url: '/inventory/a_loadWindow', headers: {'X-Requested-With': 'XMLHttpRequest'}, success: function (result) {
        $('#z_invcontentbox').html(result);
        //$("#confirmchangesbutton").on("click", function(){$('#selectinvbutton').text("Edit Inventory Items");})
        //To be inplemented
    }, error: function (xhr) {
        showNotif("Error: " + xhr.status + " " + xhr.statusText);
        $('#c_overlay').fadeOut();
    }});
}