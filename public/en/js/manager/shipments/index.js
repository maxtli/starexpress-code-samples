$(function () {
    drawSearch({
        0: {span: [1,2]},
        TrackingNumber: {title: '<span id="j_trackNumTitle">Tracking #:</span>'},
        Service: {type: 'sel'},
        Warehouse: {type: 'sel'},
        Username: {},
        RecipientName: {},
        RecipientAddress: {type: 'address', span: 2},
        IdStatus: {type: 'sel', opt: ['All', 'Verified', 'Unverified', 'Invalid', 'Unsubmitted']},
        DeclaredWeight: {type: 'num', suffix: 'lb'},
        ActualWeight: {type: 'num', suffix: 'lb'},
        DeclaredVolume: {type: 'num', suffix: 'ft^3'},
        ActualVolume: {type: 'num', suffix: 'ft^3'},
        CreateTime: {type: 'dt'},
        SignTime: {type: 'dt'},
        HandleTime: {type: 'dt'},
        Status: {type: 'sel', opt: ['Undelivered', 'All', 'Declared', 'Forecasted', 'Picking', 'Boxed', 'Signed', 'Delivery', 'Delivered', 'Unboxed']},
        PackageID: {title: 'PKID'},
        Signer: {},
        Handler: {}
    }, [
        ['TrackingNumber', 'Service', 'Warehouse', 'Username'], 
        ['RecipientName', 'RecipientAddress', 'IdStatus'], 
        ['DeclaredWeight', 'ActualWeight', 'DeclaredVolume', 'ActualVolume'], 
        ['CreateTime', 'SignTime', 'HandleTime', 'Status'], 
        ['_assoc', 'PackageID', 'Signer', 'Handler', '_Search']
    ], [
        ['Warehouse', 'Service'], ['TrackingNumber', 'Username'], 
        ['RecipientName', 'IdStatus'], 
        ['RecipientAddress'], 
        ['DeclaredWeight', 'ActualWeight'], 
        ['DeclaredVolume', 'ActualVolume'], 
        ['CreateTime'], ['SignTime'], ['HandleTime'], ['Signer', 'Handler'], ['PackageID', 'Status'], ['_Search']]);
    loadTable('manageshipments');
    loadNav();
    _opNotifs = {'search': 'Search successful. % shipment(s) found.', 'list': '% shipment(s) imported from list.', 'sign': '% shipment(s) signed.', 'edit': '% shipment(s) updated.', 'send': '% shipment(s) sent.',
        'updatestatus': 'Status added for % shipment(s).', 'updatestatustransfer': '% shipment(s) transferred to other transporters.', 'sendmessage': '% text messages were sent.'};
    $('#exporttransfernumbutton').click(function () {
        if (checkEmptyFields($('.transporterselector')))
            $('#shipmentoperationform').prop('action', '/manageshipments/exportTransferNums').submit().prop('action', '');
    });
    $('#importtracknuminput').change(function () {
        uploadFile(this, function (numlist, lengthError) {
            refreshTable('list', {'numlist': numlist}, 'POST', lengthError);
        });
    });
    $('#statusselector').change(function () {
        $('#statusentry').prop({hidden: $(this).val() !== 'Custom', disabled: $(this).val() !== 'Custom'});
        var locationdisabled = (!isNaN($(this).val()) && $(this).val() < 5);
        $('#locationselector, .locationselectorlabel').prop({hidden: locationdisabled, disabled: locationdisabled});
        var notTransfer = ($(this).val() !== 'Transfer');
        if (notTransfer && $('#uploadtransfernumarea').prop('hidden'))
            return;
        $('.updatetransferstatus_removablecell').prop('hidden', notTransfer);
        $('#uploadtransfernumarea').prop('hidden', notTransfer);
        if (notTransfer)
            $('.rightremovable').remove();
        else {
            addElementToTable('Transporter', 'pk', {type: 'select', innerHtml: '<option value="">Select Transporter...</option>', attrs: 'required'});
            ajaxLoadBox('/getTransportersAll/', $('.Transporterselector, #changeAll_TransporterBox'));
            addElementToTable('TransporterTrackNum', 'pk', {classes: 'rightremovable ', attrs: 'oninput="maxLengthCheck(this, 20)" placeholder="Transporter Tracking Number..." required'});
        }
    });
    $('#messageselector').change(function () {
        $('#messageentry').val('').prop('disabled', $(this).val().length > 0);
        if ($(this).val())
            $('#messageentry').val(["", "【星际快递】 您有一个包裹发往星际美国分拨中心，等待运往国内。中国海关监管要求，个人包裹入关需核实收件人真实身份。为了您能顺利收到包裹，请尽快访问thestarexpress.com/customDocSubmit输入您的真实姓名和包裹单号 [##] 提交个人身份证明。",
                "【时代代购】亲，您的包裹[##]出关了。转国内配送[%%]，单号[###]。快到了！请注意接收。",
                "【时代代购】 亲，您的包裹 [##] 到了，觉得好，评价拍个小视频，上两张图，5分好评。"][parseInt($(this).val(), 10)]);
    });
    $('#verifyidbutton').click(function () {
        var row = $(".selectbox:checked").first().parents(".t_Qrow");
        $('<form action="/manageshipments/viewId" method="POST" hidden><input name="idsubmit" value="' + row.find('.pkidcell').find(".pkidinput").val() + 
        '"><input name="tracknumsubmit" value="' + row.find('.tracknumcell').find(".tracknuminput").val() + '"></form>').appendTo('.c_content').submit();
    });
    $('#viewstatusbutton').click(function () {
        window.location = '/managestatus/find/' + $('.selectbox:checked').parents('.t_Qrow').find('.trackingnum').html();
    });
    $('#boxpkbutton').click(function() {
        var row = $('.selectbox:checked').parents('.t_Qrow');
        $('<form hidden action="/manageshipments/box/' + row.find('.trackingnum').html() + '" method="POST"><input name="pkid" value="' + row.find('.pkidinput').val() + '"></form>').appendTo('.c_content').submit();
    });
    $('.j_bmtOp').click(function () {
        displayOperationMode($(this).data('op'));
        $('.t_Qrow:visible').find('.pkidinput').each(function (i) {
            $(this).prop('name', 'pkinfo[' + i + '][1]');
        }).prop('disabled', false);
        $('.t_Qrow:visible').find('.tracknuminput').each(function (i) {
            $(this).prop('name', 'pkinfo[' + i + '][0]');
        }).prop('disabled', false);
    });
    $('#bm_sign').click(function () {
        addElementToTable('ActualWeight', 'pk', { attrs: 'oninput="numberBoundCheck(this)" type="number" placeholder="Weight..." required'});
        addElementToTable('ActualVolume', 'pk', { attrs: 'oninput="numberBoundCheck(this)" type="number" placeholder="Volume..."'});
        $('#changeAll_ActualWeightBox').css('width', '70%');
        $('#changeAll_ActualWeightCell').append('<select class="c_input removable" name="weightunits" style="width:30%"><option value="">lb</option><option>kg</option></select>').click(function () {
            $(this).css("box-shadow", "0 0 7px 3px " + getComputedStyle(this).getPropertyValue("--shade3"));
        });
    });
    $('#bm_edit').click(displayEdit);
    $('#bm_send').click(function () {
        addElementToTable('Transporter', 'pk', {type: 'select', innerHtml: '<option value="">Select Transporter...</option>', triggerEvent: false, attrs: 'required'});
        ajaxLoadBox('/getTransportersAll/', $('.Transporterselector, #changeAll_TransporterBox'));
        addElementToTable('Service', 'pk', {type: 'select', innerHtml: '<option value="">Select Service...</option>', attrs: 'required disabled'});
        addElementToTable('TransporterTrackNum', 'pk', {classes: 'rightremovable ', attrs: 'oninput="maxLengthCheck(this, 20)" placeholder="Transporter Tracking Number..." required'});
        $('#changeAll_TransporterBox').on('change', function () {
            ajaxGetValues('/getTransportersServices/', $(this).val(), $('.selectbox:checked').parents('.t_Qrow').find('.Serviceselector').add('#changeAll_ServiceBox'), 'Select Service...');
        });
        $('.Transporterselector').on('change', function () {
            ajaxGetValues('/getTransportersServices/', $(this).val(), $(this).parents('.t_Qrow').find('.Serviceselector'), 'Select Service...', {method: additionalBoxAction});
        });
    });
    $('.j_bmtOp').click(function () {
        $('#j_t-back').click(function () {
            $('.pkidinput').each(function (i) {
                $(this).prop('name', 'pkinfo[' + i + '][1]');
            }).prop('disabled', true);
            $('.tracknuminput').each(function (i) {
                $(this).prop('name', 'pkinfo[' + i + '][0]');
            }).prop('disabled', true);
            exitOperationMode();
        });
    });
    $('#sign_submit_function').click(function () {
        if (checkEmptyFields($('#customdateselector, #customtimeselector')) && checkEmptyFields($('#shipmentoperationform').find('.removable[required]:visible')))
            refreshTable('sign', $('#shipmentoperationform').serialize(), 'POST');
    });
    $('#edit_submit_function').click(validateEdit);
    $('#send_submit_function').click(function () {
        if (checkEmptyFields($('#customdateselector, #customtimeselector')) && checkEmptyFields($('#shipmentoperationform').find('.removable[required]:visible')))
            refreshTable('send', $('#shipmentoperationform').serialize(), 'POST');
    });
    $('#importsend_submit_function').click(function () {
        if (checkEmptyFields($('#shipmentoperationform').find('#customdateselector, #customtimeselector, .Transporterselector, .Serviceselector')))
            $('#sendnumfileinput').prop('disabled', false).click();
    });
    $('#sendnumfileinput').change(function () {
        uploadFile(this, function (numlist) {
            var failedNumbers = [];
            $('.tracknumcell:visible').find('.tracknuminput').each(function () {
                var value = numlist[$(this).val()];
                if (value)
                    $(this).parents('.t_Qrow').find('.TransporterTrackNumselector').val(numlist[$(this).val()]);
                else
                    failedNumbers.push($(this).val());
            });
            if (failedNumbers.length) {
                $('.sendcarriertracknuminput').val('');
                showNotif('Error: Not all packages had information listed in the csv file. No packages were modified. The following packages had no info: ' + failedNumbers.join(', '));
            } else
                refreshTable('send', $('#shipmentoperationform').serialize(), 'POST');
        }, {cols: [0, null, null, 'TransporterTrackNum'], flattenArray: 'TransporterTrackNum'});
    });
    $('#updatestatus_submit_function').click(function () {
        if (checkEmptyFields($('#statusdateselector, #statustimeselector, #locationselector:enabled, #statusselector, #statusentry:visible')) && checkEmptyFields($('#shipmentoperationform').find('.removable[required]:visible'))) {
            var transfer = 'updatestatus';
            if ($('#statusselector').val() === 'Transfer')
                transfer += 'transfer';
            refreshTable(transfer, $('#shipmentoperationform').serialize(), 'POST');
        }
    });
    $('#importtransfernumbutton').click(function () {
        if (checkEmptyFields($('#locationselector, #statusdateselector, #statustimeselector, .transporterselector')))
            $('#transfernumfileinput').prop('disabled', false).click();
    });
    $('#transfernumfileinput').change(function () {
        uploadFile(this, function (numlist, lengthError) {
            refreshTable('uploadtransferstatus',
                    {'statuslocation': $('#locationselector').val(), 'statusdate': $('#statusdateselector').val(), 'statustime': $('#statustimeselector').val(), 'pkinfo': numlist}, 'POST', lengthError);
        }, {cols: [0, 1, 'Transporter', 'TransporterTrackNum']});
    });
    $('#sendmessage_submit_function').click(function () {
        if (checkEmptyFields($('#messageentry:enabled')) && checkEmptyFields($('#shipmentoperationform').find('.removable[required]:visible')))
            refreshTable('sendmessage', $('#shipmentoperationform').serialize(), 'POST');
    });
    $('#delete_submit_function').click(function () {
        refreshTable('delete', $('#shipmentoperationform').serialize(), 'POST');
    });
    const importButton = $('<button>', {type: 'button', class: 'c_button c_button-import', id: 'importtracknumbutton'}).html('Import csv').click(function () {
        $('#importtracknuminput').prop('disabled', false).click();
    });
    $(window).on('resize', function() {
        importButton.detach().insertAfter(window.innerWidth > 500 ? $('#j_trackNumTitle') : $('#shipmentsearchlabel'));
    });
});

function displayTableRow_manageshipments(i, item) {
    return '<tbody class="t_Qrow"><tr><td rowspan="2"><input type="checkbox" class="selectbox"></td>'
            + '<td class="pkidcell">' + item['ID'] + '<input class="pkidinput" name="pkinfo[' + i + '][1]" value="' + item['ID'] + '" hidden disabled/></td>'
            + '<td class="tracknumcell"><a class="trackingnum">' + item['TrackingNumber'] + '</a>'
            + '<input class="tracknuminput" name="pkinfo[' + i + '][0]" value="' + item['TrackingNumber'] + '" hidden disabled/></td>'
            + '<td class="pkstatuscell">' + item['Status'] + '</td>'
            + '<td class="idstatuscell">' + item['IDStatus'] + '</td>'
            + '<td>' + item['Service'] + '</td>'
            + '<td>' + item['Warehouse'] + '</td>'
            + '<td class="ActualWeight_cell"><b>Declared: </b>' + item['DeclaredWeight'] + '<br><b>Actual: </b>' + item['ActualWeight'] + '</td>'
            + '<td class="ActualVolume_cell"><b>Declared: </b>' + item['DeclaredVolume'] + '<br><b>Actual: </b>' + item['ActualVolume'] + '</td>'
            + '<td class="Transporter_cell send_removablecell updatetransferstatus_removablecell" hidden></td><td class="Service_cell send_removablecell" hidden></td>'
            + '<td class="TransporterTrackNum_cell send_removablecell updatetransferstatus_removablecell" hidden></td>'
            + component('updown')
            + '</tr>'
            + '<tr hidden><td class="t_ic-wrapper" colspan="12"><table class="c_table-s">'
            + '<td><b>Username: </b>' + item['UserName'] + '</td>'
            + '<td class="RecipientName_editcell"><b>Recipient Name: </b><a class="RecipientName_label">' + item['Recipient'] + '</a></td>'
            + '<td class="RecipientName_editboxcell" hidden><table><td class="RecipientName_cell"></td><td class="trashbuttoncell"></td></table></td>'
            + '<td class="RecipientAddress_editcell" colspan="3"><b>Recipient Address: </b>' + generateAddress(item) + '</td>'
            + '<td class="RecipientAddress_editboxcell" colspan="3" hidden><table><td class="Address_cell City_cell State_cell Country_cell Zip_cell"></td><td class="trashbuttoncell"></td></table></td></tr>'
            + '<tr><td><b>Created: </b>' + item['CreateTime'] + '</td>'
            + '<td><b>Signed By: </b>' + item['Signer'] + '</td>'
            + '<td><b>Signed: </b>' + item['SignTime'] + '</td>'
            + '<td><b>Handled By: </b>' + item['Handler'] + '</td>'
            + '<td><b>Handled: </b>' + item['HandlingTime'] + '</td></table></td></tr>'
            + '</tbody>';
}

function configureMenu(checkCount) {
    $('#verifyidbutton').prop('disabled', (checkCount !== 1 || $('.selectbox:checked').parents('.t_Qrow').find('.idstatuscell').html() === 'Unsubmitted'));
    $('#bm_sign, #bm_edit, #bm_send, #bm_updatestatus, #bm_delete').prop('disabled', false);
    $('#viewstatusbutton, #boxpkbutton').prop('disabled', checkCount > 1);
    $('.selectbox:checked').parents('.t_Qrow').find('.pkstatuscell').each(function () {
        switch ($(this).html()) {
            case 'Declared':
                $('#bm_send, #bm_updatestatus, #boxpkbutton').prop('disabled', true);
                if ($('#bm_sign').prop('disabled') && $('#bm_edit').prop('disabled') && $('#bm_delete').prop('disabled'))
                    return false;
                break;
            case 'Signed':
            case 'ExtraWeight':
            case 'Handled':
                $('#bm_sign, #bm_updatestatus, #boxpkbutton').prop('disabled', true);
                if ($('#bm_send').prop('disabled') && $('#bm_edit').prop('disabled') && $('#bm_delete').prop('disabled'))
                    return false;
                break;
            case 'Delivery':
                $('#bm_sign, #bm_edit, #bm_send, #bm_delete, #boxpkbutton').prop('disabled', true);
                if ($('#bm_updatestatus').prop('disabled'))
                    return false;
                break;
            case 'Boxed':
            case 'Picking':
                $('#bm_sign, #bm_edit, #bm_send, #bm_updatestatus, #bm_delete').prop('disabled', true);
                return false;
            default:
                $('#bm_sign, #bm_edit, #bm_send, #bm_updatestatus, #bm_delete, #boxpkbutton').prop('disabled', true);
                return false;
        }
    });
}

function additionalBoxAction() {
    if (!$('#changeAll_ServiceBox'))
        return;
    $('#changeAll_ServiceBox').html('<option value="">Select Services...</option>');
    var checkedBoxes = $('.selectbox:visible:checked');
    if (checkedBoxes.length === 0)
        return;
    var firstRow = $(checkedBoxes[0]).parents('.t_Qrow');
    var checkIndex = firstRow.find('.Transporterselector').prop('selectedIndex');
    if (checkIndex === 0)
        return;
    var check = true;
    checkedBoxes.each(function () {
        if ($(this).parents('.t_Qrow').find('.Transporterselector').prop('selectedIndex') !== checkIndex) {
            check = false;
            return false;
        }
    });
    if (check)
        $('#changeAll_ServiceBox').html(firstRow.find('.Serviceselector').html());
}