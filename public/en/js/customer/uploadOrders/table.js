$(function () {
    drawSearch({
        0: {span:2},
        OrderID: {num: true},
        BuyerID: {},
        StoreName: {},
        SKU: {}, 
        Title: {bound: 200, title: 'Product Title'},
        ProductDetails: {bound: 200},
        Price: {type: 'num', prefix: '$', suffix: 'USD'},
        Quantity: {type: 'num'},
        RecipientName: {bound: 50},
        Address: {span: 2, bound: 300},
        PhoneNumber: {num: true, bound: 'maxlength: 15, limdec: 0, noleadzero: false, nodashes: false'},
        Remarks: {bound: 200},
        OrderRemarks: {bound: 200},
        BuyerMessage: {bound: 200}, 
        OrderStatus: {bound: 200},
        OrderTime: {type: 'dt', span: [1,2]},
        PayTime: {type: 'dt', span: [1,2]},
        PaymentAccount: {},
        PaymentID: {},
        WaitPeriodElapsed: {type: 'sel', opt: ['All', 'Yes', 'No'], span: [1,2]}
    }, [
        ['OrderID', 'BuyerID', 'StoreName', 'SKU'], 
        ['Title', 'ProductDetails', 'Price', 'Quantity'], 
        ['RecipientName', 'Address', 'PhoneNumber'], 
        ['Remarks', 'OrderRemarks', 'BuyerMessage', 'OrderStatus'], 
        ['OrderTime', 'PayTime', 'PaymentAccount', 'PaymentID'], 
        ['_assoc', 'WaitPeriodElapsed', '_Search']
    ], [
        ['OrderID', 'BuyerID'], ['StoreName', 'SKU'], 
        ['Title', 'ProductDetails'], ['Price', 'Quantity'], 
        ['RecipientName', 'PhoneNumber'], ['Address'], 
        ['Remarks', 'OrderRemarks'], ['BuyerMessage', 'OrderStatus'], 
        ['OrderTime'], ['PayTime'], ['PaymentAccount', 'PaymentID'], 
        ['WaitPeriodElapsed'], ['_Search']
    ]);
    loadTable('uploadOrders');
    _opNotifs = {'search': '% pending orders found.', 'upload/standard': '% shipments created.', 'upload/merge': '% orders merged into one shipment.', 'upload/split': 'Order split into % shipments.'};
    $('#j_LX-WarehouseWeight').change(function() {
        setCurrency($('#j_LX-WarehouseWeight').val());
    });
    $('#consentbox').change(function() {
        $('#finalcreatebutton').prop('disabled', !$(this).prop('checked'));
    });
    $('[id$="uploadorderbutton"]').click(function () {
        displayOperationMode($(this).prop('id').replace('uploadorderbutton', ''));
        $('.t_Qrow:visible').find('.odidinput').each(function (i) {
            $(this).prop('name', 'odinfo[' + i + '][1]');
        }).prop('disabled', false);
        $('.t_Qrow:visible').find('.odindexinput').each(function (i) {
            $(this).prop('name', 'odinfo[' + i + '][0]');
        }).prop('disabled', false);
        addElementToTable('Category', 'od', {type: 'select', innerHtml: '<option value="">Select Category...</option>', attrs: 'required'});
        ajaxLoadBox('/getCategories/', $('.Categoryselector, #changeAll_CategoryBox'));
        $('#j_toggleSearch').prop('disabled', true);
    });
    $('#standarduploadorderbutton').click(function () {
        addElementToTable('DeclaredWeight', 'od', { attrs: 'oninput="numberBoundCheck(this, {limdec: 0})" type="number" placeholder="Weight..." required'});
        addElementToTable('DeclaredVolume', 'od', { attrs: 'oninput="numberBoundCheck(this, {limdec: 0})" type="number" placeholder="Volume..."'});
        $('#changeAll_DeclaredWeightBox, #changeAll_DeclaredVolumeBox').css('width', '70%');
        $('#changeAll_DeclaredWeightCell').append('<input class="c_input removable j_i-LX-WarehouseWeight" style="width:30%" disabled>');
        $('#changeAll_DeclaredVolumeCell').append('<input class="c_input removable j_i-LX-WarehouseVolume" style="width:30%" disabled>');
        $('#j_LX-WarehouseWeight').change();
    });
    $('[id$="uploadorderbutton"]').click(function () {
        $('#j_t-back').click(function () {
            $('.odidinput').each(function (i) {
                $(this).prop('name', 'odinfo[' + i + '][1]');
            }).prop('disabled', true);
            $('.odindexinput').each(function (i) {
                $(this).prop('name', 'odinfo[' + i + '][0]');
            }).prop('disabled', true);
            exitOperationMode($('#j_toggleSearch').html() === 'Show Search');
            $('#j_toggleSearch').prop('disabled', false);
        });
    });
    $('.validateorderbutton').click(function () {
        var mode = $(this).data('mode');
        if (!checkEmptyFields($(mode === 'Standard' ? '#j_LX-WarehouseWeight, #j_LX-Currency, .Categoryselector, .DeclaredWeightselector' 
        : mode === 'Merge' ? '#j_LX-WarehouseWeight, #j_LX-Currency, .Categoryselector, #groupWeight'
        : '#j_LX-WarehouseWeight, #j_LX-Currency, .Categoryselector, #distributeSet, #distributeWeight'), $('#validateerrorlabel')))
            return;
        $.ajax({url: '/uploadOrders/a_prepare' + mode, method: 'POST', headers: {'X-Requested-With': 'XMLHttpRequest'}, data: $('#orderoperationform').serialize(), success: function(result) {
            result = parseAjaxResponse(result);
            if(!result) return;
            result = result['data'];
            loadPayment();
            var balance = $('#j_i-bal-cy-' + $('#j_LX-Currency').val()).html();
            var price = parseFloat(result['ExcPrice'] || result['TotalPrice']);
            $('.j_i-pc-finalpayment').html(balance.substring(0, balance.search(/[1-9]/)) + price.toFixed(2));
            var err = (price - parseFloat(balance.substring(balance.search(/[1-9]/))) > 0.005);
            $('#consentbox, #finalcreatebutton').prop('disabled', err);
            $('#balanceerrorlabel').prop('hidden', !err);
            if(result['UnitPrice']) {
                $('#j_i-pc-unit').html(result['UnitPrice']);
                $('.unitpricearea').prop('hidden', false);
            }
            if(result['Orders'])
                $.each(result['Orders'], function(i, item) {
                    $('.odindexinput[value="' + item[0] + '"]').parents('.t_Qrow').find('.Price_cell').html('<a class="removable" style="font-weight:700">' + $('.j_i-cy').html() + parseFloat(item['Price']).toFixed(2) + '</a>');
                });
            if(result['Rate']) {
                $('#exchangecurrencyarea').prop('hidden', false);
                $('#j_i-pc-preferredcurrency').html(parseFloat(result['TotalPrice']).toFixed(2));
                $('#j_i-exc').html(result['Rate']);
                $('#finalcreatebutton').prop('disabled', true);
            }
            $('#pkcreatemode').html('Make Package(s) From Orders');
        }, fail: function(xhr) {showNotif("Error: " + xhr.status + " " + xhr.statusText);}});
    });
    $('#editorderbutton').click(exitPayment);
    $('#finalcreatebutton').click(function () {
        var mode = $('[id$="_submit_function"]:disabled').data('mode');
        exitPayment();
        refreshTable('upload/' + mode.toLowerCase(), {'consent' : $('#consentbox').prop('checked')}, 'POST');
    });
    refreshTable('search', {'search': 'all'});
});

function loadPayment() {
    $('#consentbox').prop('checked', false).change();
    $('[id$="_submit_function"]:visible').prop({disabled: true, hidden: true});
    $('#editorderbutton, #paymentpricearea').prop('hidden', false);
    $('#j_t-back, #orderoperationform input, #orderoperationform select').prop('disabled', true);
}

function exitPayment() {
    $('.j_i-pc-payment').html('**Error**');
    $('.Price_cell').html('');
    $('[id$="_submit_function"]:disabled').prop({disabled: false, hidden: false});
    $('#editorderbutton, #unitpricearea, #exchangecurrencyarea, #paymentpricearea').prop('hidden', true);
    $('#j_t-back, #orderoperationform input:visible:not(.j_i-LX-WarehouseWeight, .j_i-LX-WarehouseVolume), #orderoperationform select:visible, .t_Qrow:visible .odindexinput, .t_Qrow:visible .odidinput').prop('disabled', false);
}

function configureMenu(checkCount) {
    $('#mergeuploadorderbutton').prop('disabled', checkCount < 2);
    $('#splituploadorderbutton').prop('disabled', checkCount > 1 || $('.selectbox:checked').parents('.t_Qrow').find('.DeclaredQuantity_cell').html() == '1');
}

function displayTableRow_uploadOrders(i, item) {
    $.each([0, 'PayTime', 'Qty', 'BuyerID', 'ProductDetails', 'Price', 'Price', 'Remarks', 
    'OrderRemarks', 'PaymentAccount', 'PaymentID', 'Recipient', 'Address', 'Phone'], function (j, jtem) {
        if(item[jtem] === undefined)
            item[jtem] = 'N/A';
    });
    var row = '<tbody class="t_Qrow';
    if (!item['WaitPeriodElapsed'])
        row += ' c_t_red';
    row += '"><tr><td rowspan="2"><input type="checkbox" class="selectbox"><input class="odindexinput" name="odinfo[' + i + '][0]" value="' + i + '" disabled hidden></td>'
            + '<td>' + item[0] + '<input class="odidinput" name="odinfo[' + i + '][1]" value="' + item[0] + '" disabled hidden></td>'
            + '<td';
    if (item['WaitPeriodElapsed'])
        row += ' class="timeelapsedcell"';
    row += '>' + item['PayTime'] + '</td><td class="Category_cell standard_removablecell merge_removablecell split_removablecell" hidden></td><td>' + item['Title'] + '</td>'
            + '<td class="DeclaredQuantity_cell">' + item['Qty'] + '</td><td>' + item['BuyerID'] + '</td>'
            + '<td class="DeclaredWeight_cell standard_removablecell" hidden></td>'
            + '<td class="DeclaredVolume_cell standard_removablecell" hidden></td>'
            + '<td class="Price_cell standard_removablecell" hidden></td>'
            + component('updown')
            + '</tr><tr hidden><td class="t_ic-wrapper" colspan="20">'
            + '<table class="c_table-s">'
            + '<td><b>Item Details: </b>' + item['ProductDetail'] + '</td>'
            + '<td><b>Price: </b>' + item['Price'] + '</td>'
            + '<td><b>Remarks: </b>' + item['OrderRemarks'] + '</td>'
            + '<td><b>Pay Acct: </b>' + item['PaymentAccount'] + '</td></table><table class="c_table-s">'
            + '<td><b>Recipient: </b>' + item['Recipient'] + '</td>'
            + '<td colspan="2"><b>Address: </b>' + item['Address'] + '</td>'
            + '<td><b>Phone Number: </b>' + item['Phone'] + '</td></table></td></tr></tbody>';
    return row;
}
