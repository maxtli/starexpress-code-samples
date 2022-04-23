var handleItems;
var fginfo = [];
var itemIndex = 0;
$(function() {
    var temppics = {};
    load('dash', false);
    loadNav();
    $('#signforecastbutton').click(function(e) {
        e.preventDefault();
        $('#forecastinfo').prop('hidden', true);
        $('#forecastmessage').html('');
        $('#row_PackageHandler, #row_InboundTime').prop('hidden', 'true');
        $('#handleforecastbutton').prop({hidden: true, disabled: true});
        $('.fcindicator').html('');
        if(checkEmptyFields($('#forecastbarcodeinput'))) {
            $('#forecastinfowrapper .j_load').prop('hidden', false);
            ajaxRequest("/dash/a_signForecast/" + $('#forecastbarcodeinput').val(), displayForecastDetails);
        }
    });
    $('#signpkbutton').click(function(e) {
        e.preventDefault();
        $('#pkinfo').prop('hidden', true);
        $('#pkmessage').html('');
        if(checkEmptyFields($('#pkbarcodeinput, #signpkweightinput'))) {
            $('#pkinfowrapper .j_load').prop('hidden', false);
            ajaxRequest('/manageshipments/a_signExp/', function() {
                
            },{});
        }
    });
    
    $('.c_content').on('click', '#handleforecastbutton', function () {
        $('#c_overlay').prop('hidden', false);
        $('#handleforecastarea').css({top: '100%', bottom: '-100%'}).prop('hidden', false).animate({top: '160px', bottom: '0'}, 500).children('.j_load').prop('hidden', false);
        ajaxRequest('/dash/a_getForecastContents', function (result) {
            $('#pkcountindic').html(result['data']['pkcount']);
            if(result['data']['fgdata']) {
                handleItems = result['data']['fgdata'];
                temppics = {};
                toggleItem();
            } else {
                $('#endheading').prop('hidden', true);
                $('.enditemcontent, #endheadingnone').prop('hidden', false);
            }
        });
    }).on('click', '#handleclosebutton', function() {
        $('#pkitemdetails').html('');
        $('#c_overlay').prop('hidden', true);
        $('#handleforecastarea').animate({top: '100%', bottom: '-100%'}, 500, function() {
            $(this).prop('hidden', true);
            temppics = {};
            resetHandleArea();
            $('.handlecontent').prop({hidden: true, style:''});
            $('#endheading').prop('hidden', false);
            $('#endheadingnone').prop('hidden', true);
        });
        handleItems = null;
        fginfo = [];
        itemIndex = 0;
    }).on('click', '#handlemissingbutton', function() {
        fginfo.push({'ID': $('.handlecontent').data('fgid'), 'State': 'Missing'});
        temppics = {};
        toggleItem();
    }).on('click', '#backbutton', function() {
        fginfo.pop();
        itemIndex -= 2;
        temppics = {};
        toggleItem();
    }).on('click', '#handlenoupcbutton', function() {
        $(this).prop('disabled', true);
        $('.handlecontent').removeData('prid');
        $('#righthandlearea').show();
        $('.productsindicator').html('');
        $('.j_handleField').prop({hidden: false}).filter(':not(#productsinput_UPC, #productsinput_SKU, #j_LX-Subcategory)').prop('disabled', false);
        $('#productsinput_UPC, #productsinput_SKU').val('');
        $('#nextstepbutton').prop('hidden', false);
    }).on('click', '#searchhandleitembutton', function(e) {
        e.preventDefault();
        if(checkEmptyFields($('#handleitembarcodeinput'))) {
            $('.productsindicator').html('');
            $('.handlecontent').removeData('prid');
            $('#righthandlearea').hide();
            $('#handleforecastarea > .j_load').prop('hidden', false);
            $('.j_handleField').prop({hidden: true, disabled: true});
            ajaxRequest('/api/getProduct/' + $('#handleitembarcodeinput').val(), showProductDetails);
        }
    }).on('click', '#nextstepbutton', function() {
        if(!checkEmptyFields($('.j_handleField:visible[required]')))
            return;
        $(this).prop('hidden', true);
        $('#editfieldsbutton').prop('hidden', false);
        $('#uploadpicarea, #completeinputarea').show();
        $('#itemactionarea').hide();
        $('.j_handleField').prop('disabled', true);
    }).on('click', '#editfieldsbutton', function() {
        $(this).prop('hidden', true);
        $('#nextstepbutton').prop('hidden', false);
        $('#uploadpicarea, #completeinputarea, #logItemerrorlabel').hide();
        $('#itemactionarea').show();
        $('.j_handleField:visible:not(#productsinput_UPC, #productsinput_SKU, #j_LX-Subcategory)').prop('disabled', false);
    }).on('click', '#logItemButton', function() {
        if(checkEmptyFields($('#logItemStatus')) && temppics['frontpicbutton_display'] && temppics['backpicbutton_display']) {
            var row = {'ID': $('.handlecontent').data('fgid'), 'State': $('#logItemStatus').val(), 'FrontPic': temppics['frontpicbutton_display'], 'BackPic': temppics['backpicbutton_display']};
            if($('.handlecontent').data('prid'))
                row['PID'] = $('.handlecontent').data('prid');
            $('.j_handleField:visible').each(function(item){
                if($(this).val()) 
                    row[$(this).prop('name')] = $(this).val();
            });
            fginfo.push(row);
            temppics = {};
            toggleItem();
        } else
            $('#logItemerrorlabel').show();
    }).on('click', '#frontpicbutton, #backpicbutton', function () {
        $('#uploadimagefileinput').data('output', $(this).prop('id') + '_display').prop('disabled', false).click();
    }).on('change', '#uploadimagefileinput', function () {
        $('#imagesizeerrorlabel, #imagetypeerrorlabel').prop('hidden', true);
        if(this.files[0].size <= 5000000) {
            var type = this.files[0].type;
            if (type === "image/jpeg" || type === "image/jpg" || type === "image/bmp" || type === "image/png") {
                var reader = new FileReader();
                var input = this;
                reader.onload = function (e) {
                    $('<img>', {class: 'productimagedisplay'}).appendTo($('<div>', {class: 'productimageframe'}).html('<button type="button" class="c_button removepicbutton closepicbutton c_t_red">X</button><button type="button" class="c_button zoompicbutton c_t_blue">Zoom</button>')
                    .appendTo('#' + $(input).data('output'))).prop('src', e.target.result);
                    temppics[$(input).data('output')] = input.files[0];
                    $(input).data('output', null).prop('type', 'text').prop('type', 'file');
                };
                reader.readAsDataURL(this.files[0]);
                return;
            } else
                $('#imagetypeerrorlabel').prop('hidden', false);
        } else
            $('#imagesizeerrorlabel').prop('hidden', false);
        $(this).prop('type', 'text').prop('type', 'file');
    }).on('click', '.zoompicbutton', function () {
        $('#zoompicturedisplayarea').prop('hidden', false).children('#zoomedimagedisplay').prop('src', $(this).siblings('.productimagedisplay').prop('src'));
    }).on('click', '.closepicbutton', function() {
        temppics[$(this).parents('td').prop('id')] = null;
        $(this).parent().remove();
        $('#closezoombutton:visible').click();
    }).on('click', '#closezoombutton', function() {
        $('#zoomedimagedisplay').prop('src', '').parent().prop('hidden', true);
    }).on('click', '#continuetopackagebutton', function() {
        $('.enditemcontent').prop('hidden', true);
        $('.packagecontent').prop('hidden', false);
    }).on('click', '#searchhandlepkgbutton', function(e) {
        e.preventDefault();
        var tn = $('#handlepkgbarcodeinput').val();
        if(checkEmptyFields($('#handlepkgbarcodeinput'))) 
            ajaxRequest('/dash/a_getForecastPackage', function(result) {
                if(result['data'] === 'Already signed')
                    showNotif('Error: Package #' + tn + ' has already been signed.');
                else {
                    $('#pkitemdetails').append('<tr><td class="pktndisplay">' + tn + '</td><td>' + component('modify', 'cancel', 'Cancel', 'delpkbutton') + '</td></tr>');
                    if(result['data'] === 'Undeclared')
                        showNotif('Notice: Package #' + tn + ' was not declared in this forecast.');
                }
                $('#handlepkgbarcodeinput').val('');
            }, {'tracknum' : tn});
    }).on('click', '.delpkbutton', function() {
        $(this).parents('tr').remove();
    }).on('click', '#logPackageButton', function() {
        $('.packagecontent').prop('hidden', true);
        $('#handleforecastarea > .j_load').prop('hidden', false);
        var formdata = new FormData();
        $('.pktndisplay').each(function() {
            formdata.append('pklist[]', $(this).html());
        });
        $.each(fginfo, function(i,item){
            formdata.append(item['ID'] + '_Front', item['FrontPic']);
            formdata.append(item['ID'] + '_Back', item['BackPic']);
            delete item['FrontPic'];
            delete item['BackPic'];
            $.each(item, function(j, jtem) {
                formdata.append('fginfo[' + i + '][' + j + ']', jtem);
            });
        });
        ajaxRequest('/dash/a_handleForecast', function(result) {
            showNotif('Forecast handled successfully.');
            $('#handleclosebutton').click();
        }, formdata, 'POST', true);
    });
});
 
function showProductDetails(result) {
    if(result === 'DNE') {
        $('.j_handleField').prop({hidden: false}).filter(':not(#productsinput_UPC, #productsinput_SKU, #j_LX-Subcategory)').prop('disabled', false);
        $('#productsinput_UPC').val($('#handleitembarcodeinput').val());
        $('#productsinput_SKU').val('');
        showNotif('Notice: Product not found in database. Please enter the product details manually.');
    } else {
        $('.handlecontent').data('prid', result['ID']);
        $('#Qtybox').prop({hidden: false, disabled: false});
        showNotif('Product details autofilled from database.');
        $.each(result, function(i, item){
            var indic = $('#productsindicator_' + i);
            if(indic.length)
                indic.html((item == null) ? 'N/A' : item);
        });
    }
    $('#righthandlearea').show();
    $('#handlenoupcbutton').prop('disabled', false);
    $('#nextstepbutton').prop('hidden', false);
}

function toggleItem() {
    $('.handlecontent').slideUp(300, function() {
        resetHandleArea();
        if(handleItems[itemIndex]) {
            $('.handlecontent').data('fgid', handleItems[itemIndex]['FGID']);
            $.each(handleItems[itemIndex], function(i, item) {
                var indic = $('#goodsindicator_' + i);
                if(indic.length)
                    indic.html((item == null) ? 'N/A' : item);
            });
            $('.handlecontent').slideDown(500);
            if(itemIndex === 0)
                $('#backbutton').hide();
            else
                $('#backbutton').show();
            itemIndex++;
            $('#itixindic').html(itemIndex);
        } else {
            $('.enditemcontent').prop('hidden', false);
            $('#backbutton').hide();
        }
        $('#handleclosebutton').show();
    });
}

function resetHandleArea() {
    $('.handlecontent').removeData('prid');
    $('.handlecontent').removeData('fgid');
    $('#handleitembarcodeinput, #handlepkgbarcodeinput, #logItemStatus').val('');
    $('#itemactionarea').show();
    $('.goodsindicator, .productsindicator').html('');
    $('.j_handleField').val('').change().prop({hidden: true, disabled: true});
    $('#handlemissingbutton, #handlenoupcbutton, #searchhandleitembutton').prop('disabled', false);
    $('.closepicbutton').click();
    $('#backbutton, #handleclosebutton, #righthandlearea, #uploadpicarea, #completeinputarea, #logItemerrorlabel').hide();
    $('#nextstepbutton, #editfieldsbutton, .enditemcontent, .packagecontent').prop('hidden', true);
}

function displayForecastDetails(output) {
    $('#forecastbarcodeinput').val("");
    $('#forecastinfo').prop('hidden', false);
    switch(output['message']) {
        case 'No results':
        case 'Error':
            $('#forecastmessage').html('Forecast not found').css('color', getComputedStyle($('#forecastmessage')[0]).getPropertyValue('--red3'));
            $('#forecastdetails').prop('hidden', true);
            $('#handleforecastbutton').prop({hidden: true, disabled: true});
            return;
        case 'Multiple forecasts':
            $('#forecastmessage').html('Multiple forecasts found with same tracking number. Please specify').css('color', getComputedStyle($('#forecastmessage')[0]).getPropertyValue('--yellow3'));
            $('#forecastdetails').prop('hidden', true);
            $('#handleforecastbutton').prop({hidden: true, disabled: true});
            return;
        case 'Successful':
            $('#forecastmessage').html('Forecast signed successfully!').css('color', getComputedStyle($('#forecastmessage')[0]).getPropertyValue('--green3'));
            $('#forecastindicator_Signer').html('you');
            $('#forecastindicator_SignTime').html('now');
            $('#handleforecastbutton').prop({hidden: false, disabled: false});
            break;
        case 'Already signed':
            $('#forecastmessage').html('Forecast already signed').css('color', getComputedStyle($('#forecastmessage')[0]).getPropertyValue('--blue3'));
            $('#forecastindicator_Signer').html(output['details']['Signer']);
            $('#forecastindicator_SignTime').html(output['details']['SignTime']);
            $('#handleforecastbutton').prop({hidden: false, disabled: false});
            break;
        case 'Already handled':
            $('#forecastmessage').html('Forecast already signed').css('color', 'grey');
            $('#forecastindicator_Signer').html(output['details']['Signer']);
            $('#forecastindicator_SignTime').html(output['details']['SignTime']);
            $('#row_PackageHandler, #row_InboundTime').prop('hidden', 'false');
            $('#forecastindicator_PackageHandler').html(output['details']['PackageHandler']);
            $('#forecastindicator_InboundTime').html(output['details']['InboundTime']);
            $('#handleforecastbutton').prop({hidden: true, disabled: true});
            break;
    }
    $.each(['CreateTime', 'UserName', 'Carrier', 'TrackingNumber', 'Warehouse', 'DeclaredWeight', 'DeclaredVolume'], function(i, item) {
        $('#forecastindicator_' + item).html(output['details'][item]);
    });
    $('#forecastdetails').prop('hidden', false);
}