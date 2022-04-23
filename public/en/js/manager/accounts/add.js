$(() => {
   generateForm('#j_dy-form', [
    {Currency: {type: 'sel', nofill: true, req: true, def: 'Currency...'}, Bank: {type: 'sel', nofill: true, req: true, def: 'Bank...'}},
    {AccountNumber: {title: 'Account No.', num: true, bound: 'limdec: 0, maxlength: 20, noleadzero: false', req: true},
    RoutingNumber: {title: 'Routing No.', num: true, bound: 'limdec: 0, maxlength: 15, noleadzero: false'}},
    {AccountName: {bound: 200, req: true}, SwiftNumber: {title: 'SWIFT No.', num: true, bound: 'limdec: 0, maxlength: 12, noleadzero: false, allowcaps: true'}},
    {BankAddress: {type: 'address', span: 2, req: true}}, {TransactionCap: {type: 'cur', span: 2, num: true, bound: 'maxlength:7', nofill: true, req: true}}
    ], 'j_f-create');
    $('<input>', {class: 'c_input-n', name: 'Bank', id: 'bankInput', form: 'j_f-create', disabled: true, hidden: true, required: true, placeholder: 'Type Bank Name...'}).prop('oninput', 'maxLengthCheck(this, 30)').insertAfter('#j_LX-Bank');
    load('manageaccounts');
    loadNav();
    $('#j_create').click(function() {
        if(checkEmptyFields($('[form="j_f-create"]:required:enabled'), $('#j_err-create'))) {
            var selBank = $('#j_LX-Bank'); 
            if(selBank.val() === 'Other')
                $('#j_LX-Bank').prop('disabled', true);
            ajaxSubmit('manageaccounts/a_create', 'manageaccounts/find', $('#j_f-create').serialize());
            selBank.prop('disabled', false);
        }
    });
});