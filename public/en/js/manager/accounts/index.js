$(() => {
    _opNotifs = {'search': '% accounts found.'};
    drawSearch({
        0: {span: [4,2], viewAll: true},        
        CustomerCount: {type: 'num', span: [1,1]},
        AccountTransAmount: {type: 'num', prefix: '$', suffix: 'USD', span: [1,1]},
        TransactionCap: {type: 'num', prefix: '$', suffix: 'USD', bound: 'maxlength:7', span: [1,1]},
        LastReset: {type: 'dt', horiz: true, span: [2,2]},

        AccountName: {span: [1,1]},
        Bank: {span: [1,1]},
        AccountNumber: {num: true, bound: 'maxlength: 20, limdec: 0', span: [1,1]},
        RoutingNumber: {num: true, bound: 'maxlength: 20, limdec: 0', span: [1,1]},
        SwiftNumber: {span: [1,1]},
        BankAddress: {type: 'address', span: [2,2]}
        }, [
            ['Bank', 'AccountName', 'AccountNumber', 'RoutingNumber'], ['BankAddress', 'SwiftNumber', 'CustomerCount'],
            ['AccountTransAmount', 'TransactionCap', 'LastReset'], ['_Search']
        ], [
            ['Bank', 'AccountName'], ['AccountNumber', 'RoutingNumber'], ['BankAddress'], ['SwiftNumber', 'CustomerCount'],
            ['AccountTransAmount', 'TransactionCap'], ['LastReset'], ['_Search']
            ]);
    loadTable('manageaccounts');
    loadNav();
    $('.j_bmtOp').click(function () {
        displayOperationMode($(this).data('op'));
        $('.t_Qrow:visible').find('.j_cbaidinput').each(function (i) {
            $(this).prop('name', 'cacinfo[' + i + '][0]');
        }).prop('disabled', false);
    });
    $('#bm_edit').click(function () {
        addElementToTable('TransactCap', 'cac', {classes: 'editinput ', mimic: true, attrs: 'placeholder="Transaction Cap..." oninput="numberBoundCheck(this, {maxlength:7})" required'});
        generateEditInputs();
    });
    $('.j_bmtOp').click(function () {
        $('#j_t-back').click(function () {
            $('.j_cbaidinput').each(function (i) {
                $(this).prop('name', 'cacinfo[' + i + '][0]');
            }).prop('disabled', true);
            exitOperationMode();
        });
    });
    $('#edit_submit_function').click(function() {
        var success = true;
        $('#editerrorlabel').prop('hidden', true);
        $('.t_Qrow:visible').each(function () {
            var row = $(this);
            if (!row.find('.editinput:visible').length) {
                success = false;
                return true;
            }
            var empty = row.find('.editinput:visible').filter(function () {
                return $.trim($(this).val()) == $(this).parent().data('init');
            });
            if (empty.length) {
                setEmptyField(empty);
                success = false;
            }
        });
        if (checkEmptyFields($('#j_t-operation').find('.removable[required]:visible')) && success)
            refreshTable('edit', $('#j_t-operation').serialize(), 'POST');
        else
            $('#editerrorlabel').prop('hidden', false);
    });
});

function displayTableRow_manageaccounts(i, item) {
    return '<tbody class="t_Qrow"><tr><td rowspan="2">'
            + '<input type="checkbox" class="selectbox">'
            + '<input class="j_cbaidinput" name="cacinfo[' + i + '][0]" value="' + item['ID'] + '" hidden disabled>'
            + '</td>' 
            + ['BankName', 'AccountName', 'AccountNo', 'RoutingNo', 'CustomerCount', 'Currency'].map((col) => '<td>' + item[col] + '</td>').join('') 
            + component('updown')
            + '</tr><tr hidden><td class="t_ic-wrapper" colspan="12"><table class="c_table-s"><tr>'
            + '<td><b>SWIFT No</b>: ' + item['SwiftNo'] + '</td>'
            + '<td colspan="2"><b>Bank Address</b>: ' + generateAddress(item) + '</td></tr><tr>'
            + '<td class="TransactCap_editcell"><b>Transact Cap</b>: ' + item['TransactCap'] + '</td>'
            + '<td class="TransactCap_editboxcell" hidden><table><td class="TransactCap_cell" data-init="' + sanitizeNumber(item['TransactCap']) + '"></td><td class="trashbuttoncell"></td></table></td>'
            + '<td><b>Transact Amt</b>: ' + item['TransactAmt'] + '</td>'
            + '<td><b>Last Reset</b>: ' + item['LastReset'] + '</td></tr></table></td></tr></tbody>';
}
