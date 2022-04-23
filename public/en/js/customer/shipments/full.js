$(function () {
    drawSearch({
        0: {viewAll: true, span: 2},
        TrackingNumber: {title: '<span id="j_trackNumTitle" style="position:absolute;bottom:0">Tracking #:</span>'},
        Service: {type: 'sel'},
        Warehouse: {type: 'sel'},
        IdStatus: {type: 'sel', opt: ['All', 'Unsubmitted', 'Unverified', 'Verified', 'Invalid']},
        RecipientName: {},
        RecipientAddress: {type: 'address', span: 2},
        Status: {type: 'sel', opt: ['Undelivered', 'All', 'Declared', 'Forecasted', 'Picking', 'Boxed', 'Signed', 'Delivery', 'Delivered', 'Unboxed']},
        DeclaredVolume: {type: 'num', suffix: 'ft^3'},
        DeclaredWeight: {type: 'num', suffix: 'lb'},
        ActualVolume: {type: 'num', suffix: 'ft^3'},
        ActualWeight: {type: 'num', suffix: 'lb'},
        CreateTime: {type: 'dt', horiz: true, span: 2}
    }, [
        ['TrackingNumber', 'Service', 'Warehouse', 'IdStatus'],
        ['RecipientName', 'RecipientAddress', 'Status'],
        ['DeclaredWeight', 'DeclaredVolume', 'ActualVolume', 'ActualWeight'],
        ['CreateTime', '_Search']
        ], [
            ['TrackingNumber', 'Service'],
            ['Warehouse', 'Status'],
            ['RecipientName', 'IdStatus'],
            ['RecipientAddress'],
            ['DeclaredWeight', 'DeclaredVolume'],
            ['ActualWeight', 'ActualVolume'],
            ['CreateTime'],
            ['_Search']
            ]);
    loadTable('shipments');
    loadNav();
    _opNotifs = {'search': 'Search successful. % shipment(s) found.', 'list': '% shipment(s) imported from list.', 'edit': '% shipment(s) updated.'};
    $('.c_content').on('change', '#importtracknuminput', function () {
        uploadFile(this, function (numlist, lengthError) {
            refreshTable('list', {'numlist': numlist}, 'POST', lengthError);
        });
    });
    $('[id$="packagebutton"]').click(function () {
        displayOperationMode($(this).prop('id').replace('packagebutton', ''));
        //hides search form and pagebar, hides all rows except the ones selected, then unhides go back button. calls toggleMenu to animate the menu down
        $('.t_Qrow:visible .tracknuminput').prop('disabled', false);
    });
    $('#editpackagebutton').click(function() {
        displayEdit();
        $('.t_Qrow:visible .tracknuminput').each(function (i) {
            $(this).prop('name', 'pkinfo[' + i + '][0]');
        });
    });//creates the edit inputs, the edit buttons and the trash edit buttons
    $('#deletepackagebutton').click(function () {
        $('.selectbox, #selectAllBox').prop('disabled', true);
        $('#refundpkgindic').html($.map($('#genpkgtable .pricecell:visible').map(function() {return $(this).html()}).get().reduce(function(a, x) {
            var currency = x.substring(0, 5);
            var amount = parseFloat(x.substring(5));
            if(a[currency]) a[currency] += amount;
            else a[currency] = amount;
            return a;}, {}), function(v, k) {return '' + k + v.toFixed(2);}).join(', '));
        $('#pkrefundarea').prop('hidden', false);
    });
    //complicated
    $('[id$="packagebutton"]').click(function () {
        $('#j_t-back').click(function () {
            $('.tracknuminput').prop('name', 'pkinfo[]').prop('disabled', true);
            exitOperationMode();
            $('#pkrefundarea').prop('hidden', true);
        });
        //sets an event listener for the back button
        //the back button unhides the search form and the rest of the result rows that were originally hidden, hides the go back button. toggle menu back up
        //one line that removes the edit buttons doesn't actually work.
    });
    $('#edit_submit_function').click(validateEdit);
    $('#delete_submit_function').click(function () {
        refreshTable('delete', $('#shipmentoperationform').serialize(), 'POST');
    });
    $('#unbox_submit_function').click(function () {
        refreshTable('unbox', $('#shipmentoperationform').serialize(), 'POST');
    });
    const importButton = $('<button>', {type: 'button', class: 'c_button c_button-import', id: 'importtracknumbutton'}).html('Import csv').click(function () {
        $('#importtracknuminput').prop('disabled', false).click();
    });
    $(window).on('resize', function() {
        importButton.detach().insertAfter(window.innerWidth > 500 ? $('#j_trackNumTitle') : $('#shipmentsearchlabel'));
    });
    //creates the import csv button and sets event listenr to shift its position if window is resized
});

function configureMenu(checkCount) {
    $('#editpackagebutton, #deletepackagebutton, #unboxpackagebutton').prop('disabled', false);
    $('#viewstatusbutton').prop('disabled', checkCount > 1);
    $('.selectbox:checked').parents('.t_Qrow').find('.pkstatuscell').each(function () {
        if ($(this).html() !== 'Declared') {
            $('#editpackagebutton, #deletepackagebutton').prop('disabled', true);
            if($('#unboxpackagebutton').prop('disabled'))
                return false;
        } if ($(this).html() !== 'Picking') {
            $('#unboxpackagebutton').prop('disabled', true);
            if($('#editpackagebutton').prop('disabled'))
                return false;
        }
    });
}