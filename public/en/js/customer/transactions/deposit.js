$(function() {
    generateForm('#bank_contentbox', [
        {Bank: {type: 'sel', span: 2, nofill: true, req: true, def: 'Bank...'}},
        {AccountNumber: {id: 'accountnobox', title: 'Account No.', num: true, bound: 'limdec: 0, maxlength: 20, noleadzero: false', req: true},
        RoutingNumber: {id: 'routingnobox', title: 'Routing No.', num: true, bound: 'limdec: 0, maxlength: 15, noleadzero: false', req: true}},
        {AccountName: {bound: 200, title: 'Name associated with account', req: true}, SwiftNumber: {title: 'SWIFT No.', num: true, bound: 'limdec: 0, maxlength: 12, noleadzero: false, allowcaps: true'}},
        {BankAddress: {type: 'address', span: true, req: true}}
    ], 'newbankaccount')
    $('<input>', {class: 'c_input-n', id: 'bankInput', disabled: true, hidden: true, required: true, placeholder: 'Type Bank Name...', form: 'newbankaccount'})
    .prop('oninput', 'maxLengthCheck(this, 30)').insertAfter('#j_LX-Bank')
    load('deposit');
    loadNav();
    var paymode = '';
    $('.c_content').on('click', '.nextbutton', function() {
        $(this).prop('hidden', true);
        $('#ts_step' + (parseInt($(this).prop('id').substr(-1), 10) + 1)).prop('hidden', false);
    }).on('change', '#j_LX-Currency', function() {
        $('#selPayMethod').val('').change();
        $('#routingnobox').prop('required', $(this).val() === 'USD');
        $('#nextbutton_step1').prop({hidden: false, disabled: !$(this).val()});
        $('#ts_step2').prop('hidden', true);
    }).on('click', '#nextbutton_step1', function() {
        ajaxGetValues('/getThirdPartyPaymentServices/', $('#j_LX-Currency').val(), $('#selPayMethod'), 'Select Payment Method...</option><option value="Bank">Bank Account');
    }).on('change', '#selPayMethod', function() {
        $('#tsamountinput').trigger('input');
        $('#selectareastep2, #ts_step3').prop('hidden', true);
        $('#nextbutton_step2').prop({disabled: true, hidden: false});
        $('#paymentmethodlist, #newpaymethodarea').html('');
        paymode = $(this).val();
        if(!paymode) return;
        $(this).prop('disabled', true);
        $('.j_load').prop('hidden', false);
        $('.extindic').html('Add');
        $('#addpaymentmethodbutton').prop('class', 'c_button');
        $('#c_overlay-box').find('input, select').trigger('mousedown').val('').change();
        $('.newpaymentmethodbox').prop('hidden', true);
        if(paymode === 'Bank')
            $('#bank_contentbox').prop('hidden', false);
        else
            $('#tps_contentbox').prop('hidden', false);
        $('.paymodeindic').html(paymode);
        $.ajax({url: '/transactions/a_findAccounts/deposit', type: 'POST', headers: {'X-Requested-With': 'XMLHttpRequest'},
            data: {'currency' : $('#j_LX-Currency').val(), 'paymethod' : paymode},
            success: function (result) {
                $('.j_load').prop('hidden', true);
                $('#selPayMethod').prop('disabled', false);
                result = parseAjaxResponse(result);
                if(result === false) return;
                if(result['accounts'].length)
                    $.each(result['accounts'], function(i, item) {
                        $('#paymentmethodlist').append('<label class="radiocont"><input type="radio" class="paymethodradio" name="paymethodid" value="' + i + '">' + item['Account'] + '<span class="radiomark"></span></label>');
                    });
                else
                    $('#paymentmethodlist').html('No existing payment methods to show');
                $('#selectareastep2').prop('hidden', false);
            },
            fail: function (xhr) {
                showNotif("Error: " + xhr.status + " " + xhr.statusText);
                $('.j_load').prop('hidden', true);
            }
        });
    }).on('change', '.paymethodradio', function() {
        $('#tsamountinput').trigger('input');
        $('.radiocont').prop('style', '');
        $(this).parents('.radiocont').css({backgroundColor: 'var(--shade1)', fontWeight: '1000'});
        $('#ts_step3').prop('hidden', true);
        $('#nextbutton_step2').prop({hidden: false, disabled: false});
    }).on('click', '#addpaymentmethodbutton', function() {
        $('#c_overlay').fadeIn();
    }).on('input', '#tsamountinput', function() {
        $('#consentbox').prop('checked', false).change();
        $('#nextbutton_step3').prop({hidden: false, disabled: !$(this).val()});
        $('#ts_step4').prop('hidden', true);
    }).on('click', '#nextbutton_step3', function() {
        $('#companyaccountindic').html('Loading...');
        $.ajax({url: '/transactions/a_getPaymentAddress', type: 'POST', headers: {'X-Requested-With': 'XMLHttpRequest'},
            data: {'amount' : $('#tsamountinput').val(), 'selection' : $('.paymethodradio:checked').val(), 'country' : paymode === 'Bank' && $('#newmethodradio:checked').length ? $('#j_LX-Country').val() : ''},
            success: function (result) {
                result = parseAjaxResponse(result);
                if(result === false || !result['address']) {
                    $('#tsamountinput').val('').trigger('input');
                    return;
                }
                result = result['address'];
                var acctdisplay = '';
                $.each(['BankName', 'AccountName', 'AccountNumber', 'RoutingNumber', 'SwiftNumber', 'AccountType', 'PaymentAddress'], function(i, item) {
                    if(result[item])
                        acctdisplay += '<b>' + sanitize(item) + '</b>: ' + result[item] + '<br>';
                });
                if(result['Address'])
                    acctdisplay += '<b>Bank Address</b>: ' + generateAddress(result);
                $('#companyaccountindic').html(acctdisplay);
            }, fail: function (xhr) {
                showNotif("Error: " + xhr.status + " " + xhr.statusText);
            }
        });
    }).on('change', '#consentbox', function() {
        $('#finalconfirmbutton').prop('disabled', !$(this).prop('checked'));
    }).on('click', '#finalconfirmbutton', function() {
        $(this).prop('hidden', true);
        var data = {'consent' : $('#consentbox').val()};
        if($('#newmethodradio:checked').length)
            data['tsinfo'] = [(($('#selPayMethod').val() === 'Bank') ? $('#newbankaccount') : $('#newthirdparty')).serializeArray().reduce(function(a, x) {a[x.name] = x.value; return a;}, {})];
        ajaxSubmit('transactions/a_placeDeposit', 'account', data);
    });
    $('#c_overlay-box').on('change', '#j_LX-Country', function() {
        $('.paymethodradio').change();
    }).on('change', '#tpsmodebox', function() {
        $('.tpsmode').prop('hidden', true).find('input, select').prop('disabled', true);
        if($(this).val()) $('.tpsmode_' + $(this).val()).prop('hidden', false).find('input[name], select').prop('disabled', false);
    }).on('click', '#g_clearItemButton', function() {
        $('#c_overlay').fadeOut();
    }).on('click', '#g_addItemButton', function() {
        if(!checkEmptyFields($('#' + ((paymode === 'Bank') ? 'bank_contentbox' : 'tps_contentbox')).find('.c_input:required:enabled'))) return;
        $('.extindic').html('Edit');
        $('#addpaymentmethodbutton').prop('class', 'c_button c_t_yellow');
        var radiocontent = '';
        if(paymode === 'Bank') {
            radiocontent = ($('#j_LX-Bank').val() === 'Other' ? $('#bankinput').val() : $('#j_LX-Bank').val()) + ' Account ending in ' + $('#accountnobox').val().slice(-4);
        } else {
            var tpsmode = $('#tpsmodebox').val();
            var input = (tpsmode === 'phone') ? $('#phonenumberbox').val() : $('#emailbox').val();
            var offset = (input.length > 7 ? 4 : (input.length > 2 ? 2 : 0));
            radiocontent = $('#selPayMethod').val() + ' Account for ' + tpsmode + ' ' + ((tpsmode === 'phone') ? ('*'.repeat(input.length - offset) + (offset > 0 ? input.slice(offset*-1) : '')) 
            : input.slice(0, offset/2) + '*'.repeat(input.length - offset) + (offset > 0 ? input.slice(offset*-1/2) : '') + '@' + $('#emaildomainbox').val());
        }
        if($('#newmethodradio:checked').length)
            $('#newpaylabel').html(radiocontent);
        else
            $('#newpaymethodarea').html('<label class="radiocont"><input type="radio" class="paymethodradio" id="newmethodradio" name="paymethodid" value="New"><a id="newpaylabel">' 
            + radiocontent + '</a><span class="radiomark"></span></label>').find('label').click();
        $('#g_clearItemButton').click();
    });
});