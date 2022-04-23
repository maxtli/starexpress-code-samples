const _V_ASSETS = '/public/';

$(() => {
    $('body').on('click', '.j_link', function() {
        window.location = '/' + $(this).data('url');
    });
});

var _pageURL = '';
var _OPC = '';
function load(path, disableEnter = true) {
    _pageURL = path;
    //changes variable to parameter variable
    if(disableEnter)
        $('.wrapper').keypress(function (e) {
            if (e.which == '13')
                e.preventDefault();
        });
    //disables the enter key
    $.each({Service: {}, Warehouse: {}, Country: {}, RootCategory: {}, StoreRootCategory: {},
        WarehouseWeight: {dual: '.j_i-LX-WarehouseWeight'}, 
        CountryPhone: {dual: '#j_i-LX-CountryPhone'}, 
        Currency: {method: function(selector) {
        $(selector).children(':not([value=""])').each(function() {
            $(this).prop('value', $(this).html().substr($(this).html().indexOf('(')+1, 3));
        }).change();
    }}}, (name, options) => {
        const selector = $(_OPC + '#j_LX-' + name);
        if(selector.length)
            ajaxLoadBox('/retrieve/' + name, selector, options);
    });
    $.each({State: [['Country', 'CountryPhone']], Subcategory: [['RootCategory']], StoreSubcategory: [['StoreRootCategory']], Bank: [['Currency'], {method: (selector) => {
        selector.append('<option>Other</option>');
    }}]}, (name, root) => {
        const selector = $(_OPC + '#j_LX-' + name);
        if(selector.length) {
            selector.prop('disabled', true);
            $(root[0].map(r => _OPC + ' #j_LX-' + r).join(', ')).change(function() {
                var defOpt = selector.children().first();
                ajaxGetValues('/retrieveDep/' + name + '?dep=', $(this).val(), selector, defOpt ? defOpt.html() : name + '...', root[1]);
            });
        }
    });
    $('.j_i-LX-WarehouseWeight').first().change(function() {
        $('.j_i-LX-WarehouseVolume').val($(this).val() === 'lb' ? 'ft' : 'm');
    });
    $(document).on('change', '#j_LX-Currency', function() {
        $('.j_i-bal').prop('hidden', true);
        $('.j_i-LX-Currency').html($(this).val()).css('display', $(this).val() ? '' : 'none');
        if($(this).val())
            $('#j_i-bal-cy-' + $(this).val() + ', #j_i-bal-0').first().prop('hidden', false);
    }).on('change', '#j_LX-Bank', function() {
        var other = $(this).val() !== 'Other';
        $('#bankInput').prop({hidden: other, disabled: other});
    });
    $('#j_catSearch').on('keyup', function(e) {
        if(e.which === 13)
            window.location = 'catalog?sq=' + $(this).val();
    });
    if ($('#j_i-notif').length && $('#j_i-notif').html().length)
        showNotif();
}

function ajaxGetValues(url, param, populatedSelector, defaultText = false, {method = false, postVal = false} = {}) {
    populatedSelector.empty().val('').change().prop('disabled', false);
    if (defaultText)
        populatedSelector.append('<option value = "">' + defaultText + '</option>');
    if (param.length)
        ajaxLoadBox(url + param, populatedSelector, {method: method, postVal: postVal});
    else
        populatedSelector.prop('disabled', true);
}

function ajaxLoadBox(url, populatedSelector, {dual = '', method = false, postVal = false} = {}) {
    $.ajax({url: "/api" + url, type: 'GET', headers: {'X-Requested-With': 'XMLHttpRequest'},
    //gets a function from API class with request type get and header x-requested-with
        success: function (result) {
            result = parseAjaxResponse(result);
            if(result === false)
                return;
            $.each(result, function (i, item) {
                populatedSelector.append('<option>' + (dual ? i : item) + '</option>');
            });
            if (dual.length > 1) populatedSelector.change(function() {
                $(dual).val(result[$(this).val()] || '').change();
            });
            if (postVal) 
               populatedSelector.click().val(postVal);
            if (method)
                method(populatedSelector);
            populatedSelector.change();
        },
        error: function (xhr) {
            showNotif("Error: " + xhr.status + " " + xhr.statusText);
        }
    });
}

function switchTheme(elt, color = '') {
    if(color)
        elt.css({
            '--shade1': 'var(--' + color + '1)',
            '--shade2': 'var(--' + color + '2)',
            '--shade3': 'var(--' + color + '3)'
        });
    else
        elt.css({
            '--shade1': '',
            '--shade2': '',
            '--shade3': ''
        });
}

function loadNav() {
    let msh = false;
    $('.c_content').click(function() {
        if(msh && window.innerWidth <= 1000)
            $('#j_nav').click();
    });
    $('#j_nav').click(function() {
        msh = !msh;
        const foot = $('#c_ctg-foot');
        foot.css('bottom', msh ? -1*foot.height() : '0');
        const menu = $('#c_menu-L');
        menu.css('margin-left', msh ? '0' : -1*menu.width());
        $(window).resize();
        $(this).html(msh ? '<<' : '>>').css('background-color', (msh ? 'var(--menugrey)' : ''));
    });
    $(window).resize(() => {
        $('.c_content').css(window.innerWidth > 1000 && msh ? {marginLeft: '22%', width: '75.5%'} : {marginLeft: '', width: ''});
    });
}

function loadImg(piclist, button, display, max = 10) {
    var imDialog = $('<input>', {type: 'file'});
    var errSize = $('<a>', {class: 'c_L-err', hidden: true}).html('<br><br>The image you uploaded is too large. Please upload an image under 5MB in size.<br>');
    var errType = $('<a>', {class: 'c_L-err', hidden: true}).html('<br><br>Please upload a valid image. Only .jpg, .jpeg, .bmp, or .png files are accepted.<br>');
    $(button).click(() => {
        imDialog.click();
    }).after(errSize).after(errType);

    imDialog.change(function () {
        errSize.prop('hidden', this.files[0].size <= 5000000);
        errType.prop('hidden', ['image/jpeg', 'image/jpg', 'image/bmp', 'image/png'].indexOf(this.files[0].type) > -1);
        if(errSize.prop('hidden') && errType.prop('hidden')) {
            if($('.img_display').length >= max) 
                $('.img_display').first().remove();
            var reader = new FileReader();
            reader.onload = e => {
                appendImg(e.target.result, display, piclist.length);
                piclist.push(this.files[0]);
                $(this).prop('type', 'text').prop('type', 'file');
            };
            reader.readAsDataURL(this.files[0]);
        } else
            $(this).prop('type', 'text').prop('type', 'file');
    });
    
    $(display).on('click', '.j_im-remove', function () {
        delete piclist[$(this).parent().data('position')];
        $(this).parent().remove();
        $('#j_im-min').click();
    });
    loadImgFrame(display);
}

function appendImg(src, display, position = false) {
    $('<img>', {class: 'c_im-g', src}).appendTo($('<div>', {class: 'c_im-frame'})
    .html((position === false ? '' : '<button class="c_button c_im-remove j_im-remove c_t_red">X</button>') + '<button class="c_button c_im-zoom c_t_blue">Zoom</button>')
    .data('position', position).appendTo(display));
}

function loadImgFrame(display) {
    var zoomedIm = $('<img>', {class: 'c_im-zoomed'});
    var minButton = $('<button>', {class: 'c_button c_im-remove c_t_blue', id: 'j_im-min', style: 'font-size:20px'}).html('Minimize').click(function() {
        zoomedIm.prop('src', '').parent().prop('hidden', true);
    });
    var zoomedArea = $('<div>', {class: 'c_im-zoomedarea', hidden: true}).append(zoomedIm).append(minButton).insertAfter(display);
    $(display).on('click', '.c_im-zoom', function() {
        zoomedArea.prop('hidden', false);
        zoomedIm.prop('src', $(this).siblings('.c_im-g').prop('src'));
    })
}

function displayPics(pics, display) {
    var reader = new FileReader();
    $.each(pics, (i, pic) => {
        reader.onload = (function(i) {
            return e => $('<img>', {class: 'c_im-g', src: e.target.result}).appendTo($('<div>', {class: 'c_im-frame'})
                .html('<button class="c_button c_im-remove j_im-remove c_t_red">X</button><button class="c_button c_im-zoom c_t_blue">Zoom</button>')
                .data('position', i).appendTo(display))
        })(i);
        reader.readAsDataURL(pic);
    });
}

function checkEmptyFields(fields, errlabel = false) {
    if (!fields)
        return false;
    if (errlabel)
        errlabel.prop('hidden', true);
    var empty = fields.filter(function () {
        return !$.trim(this.value).length;
    });
    if (empty.length === 0)
        return true;
    setEmptyField(empty);
    if (errlabel)
        errlabel.prop('hidden', false);
    return false;
}

function setEmptyField(empty) {
    empty.css('--specialplaceholder', '#FF0000').css('box-shadow', '0 0 5px 2px red').css('color', 'red').each(function() {
        $(this).data('placeholder', $(this).prop('placeholder'));
    }).prop('placeholder', 'Required field').on('mousedown', function() {
        $(this).css('--specialplaceholder', '').css({color: '', boxShadow: ''}).prop('placeholder', $(this).data('placeholder')).removeData('placeholder').off('mousedown');
    });
}

function parseAjaxResponse(result) {
    try {
        result = JSON.parse(result);
    } catch (error) {
        //showNotif('Error: Page timed out after 15 minutes of inactivity, please refresh. If you believe this message is in error, please contact us.');
        showNotif('Internal server error: ' + result, true);
        return false;
    }
    if (result && typeof result === 'object' && 'success' in result && result['success'] === false) {
        if (result['msg'].length)
            if(result['msg'] === 'Timeout')
                window.location = '/login&redir=' + _pageURL + '&msg=timeout';
            else
                showNotif('Error: ' + result['msg']);
        else
            showNotif('Error: Unknown');
        return false;
    }
    return result;
}

function ajaxSubmit(url, redirect, data = {}, field = '', method = 'POST', formdata = false) {
    ajaxRequest('/' + url, function(result) { 
        $(window).off('beforeunload');
        window.location = '/' + redirect + '/' + (field ? result[field] : '');
    }, data, method, formdata);
}

function ajaxRequest(url, callback = function(result) {}, data = {}, method = 'GET', formdata = false) {
    var obj = {url: url, data: data, type: method, headers: {'X-Requested-With': 'XMLHttpRequest'},
        success: function(result){
            $('.j_load').prop('hidden', true);
            result = parseAjaxResponse(result);
            if(result)
                callback(result);
        },
        error: function(xhr){
          alert("An error occured: " + xhr.status + " " + xhr.statusText);
          $('#c_overlay-box').fadeOut();
        }
    };
    if(formdata) {
        obj['processData'] = false;
        obj['contentType'] = false;
    }
    $.ajax(obj);
}

function showNotif(text = $('#j_i-notif').html(), err = false) {
    if ($('#c_notif:visible').length && text !== 'No results found.')
        return;
    //if notification is already visible and the text doesn't = no results found do nothing.
    if (text.length && !$('#j_i-notif').html().length)
        $('#j_i-notif').html(text);
    //if there is a specified message but there is no message inside #j_i-notif then change the html inside #j_i to the text.
    $('#c_notif').css('--notif', (text.substring(0, 5) === 'Error' || err) 
    ? 'var(--fail)' : (text.substring(0, 6) === 'Notice' ? 'var(--warning)' : 'var(--success)')).show().animate({top: '50%'}, 500);
    //change the css to match if the notification is a positive or negative one.
    $('#c_notif > button').on('mouseup', hideNotif);
    $('.wrapper').on('mouseup', ':not(#c_notif, #j_i-notif)', hideNotif);
}

function hideNotif() {
    $('#c_notif').fadeOut(300, function () {
        $(this).css('top', '0');
        $('#j_i-notif').html('');
    });
    //removes the event listener for the close button on the notification
    $('#c_notif > button, .wrapper').off('mouseup');
}

function uploadFile(fileInput, callback = function() {}, {cols = [0], flattenArray = false, reset = true, skip = false, encoding = 'UTF-8', indic = undefined} = {}) {
    if(!fileInput.files || !fileInput.files.length) {
        showNotif('Error: file input is empty.');
        return;
    }
    var csv = fileInput.files[0];
    var types = ["text/plain", "application/vnd.ms-excel", "text/x-csv", "application/csv", "application/x-csv",
        "text/csv", "text/comma-separated-values", "text/x-comma-separated-values", "text/tab-separated-values"];
    if (csv.size > 1000000 || types.indexOf(csv.type) === -1) {
        showNotif('Error: File(s) must be a .csv or .txt no larger than 1MB.');
        $(fileInput).val('').prop('type', 'text').prop('type', 'file');
        return;
    }
    var fr = new FileReader();
    fr.onload = function () {
        var lengthError = false;
        var numlist;
        if (flattenArray)
            numlist = {};
        else
            numlist = [];
        var lines = this.result.split(/\r?\n/);
        if (skip)
            lines.shift();
        $.each(lines, function (i, line) {
            var split = line.replace(/[=`'"]/g, '').split(/[,\t]+/);
            if (split.length < cols.length)
                return true;
            var row = {};
            for (var j = 0; j < cols.length; j++) {
                if (cols[j] === null)
                    continue;
                row[cols[j]] = split[j].trim();
                if(row[cols[j]] === 'null')
                    row[cols[j]] = '';
            }
            if (row[0] === "Tracking Number" || row.length === 0 || (row['Indic'] !== indic))
                return true;
            delete row['Indic'];
            if (flattenArray)
                numlist[row[0]] = row[flattenArray];
            else if (cols.length > 1)
                numlist.push(row);
            else
                numlist.push(row[0]);
            i++;
            if (i === 4000) {
                lengthError = true;
                return false;
            }
        });
        if (reset)
            $(fileInput).val('').prop('type', 'text').prop('type', 'file').prop('disabled', true);
        if (Object.keys(numlist).length)
            callback(numlist, lengthError);
        else
            showNotif('Error: File has no relevant rows or is incorrectly formatted.');
    };
    fr.readAsText(fileInput.files[0], encoding);
}

function maxLengthCheck(object, chars) {
    if (object.value.length > chars)
        object.value = object.value.slice(0, chars)
}

function numberBoundCheck(object, settings = {}) {
    if(!object.value.length) 
        return;
    var newVal = sanitizeNumber(object.value, settings)
    if (object.value === newVal) 
        return;
    var cursor = $(object).prop('selectionStart');
    if (object.value.slice(cursor - 1, cursor).toUpperCase() != newVal.slice(cursor - 1, cursor))
        cursor = cursor - 1;
    object.value = newVal;
    $(object).prop({selectionStart: cursor, selectionEnd: cursor});
}

function sanitizeNumber(val, {min = 0, maxlength = 5, max = false, limdec = 2, noleadzero = true, nodashes = true, allowcaps = false} = {}) {
    var val = val.replace(allowcaps ? /[^-.a-zA-Z0-9]/g : /[^-.0-9]/g, '');
    if (allowcaps)
        val = val.toUpperCase();
    if (noleadzero) {
        val = val.replace(/^-?0+/, '');
        if(!val.length)
            val = '0';
    }
    if (nodashes) {
        val = val.replace(/([^\n])-/, '$1');
        if (min >= 0)
            val = val.replace('-', '');
    }
    var integer = val;
    var dec = '';
    if (limdec === 0)
        integer = integer.replace('.', '');
    else if (val.includes('.')) {
        var split = val.split('.', 2);
        integer = split[0];
        dec = '.' + split[1].replace('.', '');
        if (dec.length > limdec + 1)
            dec = dec.slice(0, limdec + 1);
    }
    if (max && parseInt(integer, 10) > max)
        integer = max.toString();
    else if (integer.length > maxlength)
        integer = integer.slice (0, maxlength);
    var newVal = integer + dec;
    if(min && parseFloat(newVal) < min)
        newVal = min.toString();
    return newVal;
}

function generateAddress(item) {
    var address = "";
    if (item['Country'] === '中国') {
        address = "<a class='Country_label'>" + item['Country']
                + "</a> <a class='State_label'>" + item['State']
                + "</a> <a class='City_label'>" + item['City']
                + "</a> <a class='Address_label'>" + item['Address']
                + "</a> <a class='Zip_label'>";
    } else {
        address = "<a class='Address_label'>" + item['Address']
                + "</a>, <a class='City_label'>" + item['City']
                + "</a>, <a class='State_label'>" + item['State']
                + "</a>, <a class='Country_label'>" + item['Country']
                + "</a> <a class='Zip_label'>";
    }
    if (item['Zip'].length && item['Zip'] !== 'N/A')
        address += item['Zip'];
    address += "</a>";
    return address;
}

function generateForm(cont, inputs, form = null, ast = false) {
    $(cont).empty();
    $.each(inputs, (i, row) => {
        const inputRow = $('<tr>', { class: 'c_row-ipt' });
        const labelRow = $('<tr>');
        $.each(row, (name, item) => {
            const span = item.span || 1;
            labelRow.append('<td class="c_L-bold" colspan="' + span + '">' + (item.title || sanitize(name)) + (ast && item.req ? '*' : '') + '</td>');
            inputRow.append($('<td>', { colspan: span }).html(item.specialInput || generateInput(name, item, form)));
        });
        $(cont).append(labelRow, inputRow);
    });
}

//item: {type: [boxes [opt: box-options], sel [ opt: (sel-options), def: (default-option || All)], num [prefix: num-unit, suffix: num-unit], dt: datetime [horiz: horizontal], assoc: rightwide [num]], bound: length/num-bounds, span: colspan}
function generateInput(name, item = {}, form = null) {
    switch (item.type) {
        case 'boxes':
            return $('<div>', { class: 'c_input c_box-lh' }).html('<table class="c_table-s"><tr>' + item.opt.map((val) => '<td><label class="checkboxlabel"><input type="checkbox" name="' + name + '[]" value="' + val[0] + '" checked> ' + val[0] + '</label></td>'
                + '<td><label class="checkboxlabel"><input type="checkbox" name="' + name + '[]" value="' + val[1] + '" checked> ' + val[1] + '</label></td>').join('</tr><tr>') + '</tr></table>')
        case 'num':
            return $('<div>').html((item.prefix || '') + '<input class="c_input-num" oninput="numberBoundCheck(this, {' + (item.bound || '') + '})" placeholder="Min" name="' + name + '-min"><a> to ' + (item.prefix || '') + '</a>'
                + '<input class="c_input-num" oninput="numberBoundCheck(this, {' + (item.bound || '') + '})" placeholder="Max" name="' + name + '-max"><a> ' + (item.cur ? '<div class="c_input-n c_t_green c_box-cy j_i-LX-Currency"></div>' : (item.suffix || '')) + '</a>');
        case 'dt':
            return $('<table>', { class: 'c_box-dt' + (item.horiz ? 'h' : '') }).html('<td><a>Start: </a><input class="c_input-n" type="date" name="' + name + 'St-date"><input class="c_input-n" type="time" name="' + name + 'St-time"></td>'
                + '<td><a>End: </a><input class="c_input-n" type="date" name="' + name + 'End-date"><input class="c_input-n" type="time" name="' + name + 'End-time"></td>');
        case 'phone':
            return $('<div>', {class: 'c_box-phone'}).append('<input class="c_input" id="j_i-LX-CountryPhone" placeholder="Country..." disabled>').append(generateInput('PhoneNumber', {num: true, bound: 'maxlength: 15, limdec: 0, noleadzero: false, nodashes: false', req: item.req}, form))
        case 'name':
            return $('<div>', {class: 'c_box-name'}).append(generateInput('FirstName', {req: item.req}, form), generateInput('LastName', {req: item.req}, form))
        case 'wgt':
            return $('<div>', {class: 'c_box-wgt'}).append(generateInput('Weight', {num: true, bound: 'limdec:0', req: item.req}, form)).append('<input class="c_input j_i-LX-WarehouseWeight" placholder="Unit" disabled></input>')
        case 'vol':
            return $('<div>', {class: 'c_box-vol'}).append(generateInput('Volume[]', {num: true, bound: 'limdec:0', ph: 'Dim1'}, form), 
            generateInput('Volume[]', {num: true, bound: 'limdec:0', ph: 'Dim2'}, form), generateInput('Volume[]', {num: true, bound: 'limdec:0', ph: 'Dim3'}, form)).append('<input class="c_input j_i-LX-WarehouseVolume" placeholder="Unit" disabled />')
        case 'address':
            return $('<div>', { class: 'c_box-address' }).append(generateInput('StreetAddress', {req: item.req}, form), 
            generateInput('City', {req: item.req}, form), generateInput('State', { type: 'sel', def: 'State...', req: item.req}, form), 
            generateInput('Country', { type: 'sel', def: 'Country...', req: item.req }, form), generateInput('Zip', {num: true, bound: 'noleadzero: false, nodashes: false, maxlength: 10'}, form));
        case 'cur':
            return $('<div>', {class: 'c_box-cur'}).append(generateInput(name, {...item, type: '', num: true}, form)).append('<div class="c_input-n c_t_green c_box-cy j_i-LX-Currency"></div>');
        case 'desc': 
            return $('<textarea>', { form, required: item.req || false, class: 'c_input', oninput: 'maxLengthCheck(this, 2000)', placeholder: 'Description...', name});
        case 'sel':
            return $('<select>', { form, required: item.req || false, class: 'c_input' + (item.nofill ? '-n' : ''), name, 
            id: (item.opt ? item.id || null : 'j_LX-' + (item.selName || name)) }).html(item.opt ? '<option value="">' + item.opt.join('</option><option>') + '</option>' : item.defEmpty ? '' : '<option value="">' + (item.def || 'All') + '</option>');
        default:
            return $('<input>', { form, id: item.id || null, required: item.req || false, class: 'c_input' + (item.nofill ? '-n' : ''), 
            oninput: item.num ? 'numberBoundCheck(this, {' + (item.bound || '') + '})' : 'maxLengthCheck(this, ' + (item.bound || '20') + ')', placeholder: item.ph || sanitize(name) + '...', name });
    }
}

function setCurrency(warehouse) {
    $('.j_i-cy').html('');
    $.ajax({url: "/api/getWarehouseCurrency/", type: 'GET', headers: {'X-Requested-With': 'XMLHttpRequest'},
        data: {"warehouse" : warehouse},
        success: function (result) {
            result = parseAjaxResponse(result);
            if (result === false) return;
            $('.j_i-cy').html(result['currency']);
        },
        error: function (xhr) {
            showNotif("Error: " + xhr.status + " " + xhr.statusText);
        }
    });
}

function verifyForm(form, disable = true) {
    var fail = false;
    form.find('.nocriterialabel, .nodatelabel').prop('hidden', true);
    form.find("input[type='time']").each(function () {
        if ($(this).val().length !== 0 && $(this).siblings("input[type='date']").val().length === 0) {
            fail = true;
            return false;
        }
    });
    if (fail) {
        form.find('.nodatelabel').prop('hidden', false);
        return false;
    }
    var emptyInputs = form.find('input:enabled, select:enabled').filter(function () {
        return !($(this).prop('type') === 'checkbox' ? $(this).prop('checked') : $.trim(this.value).length);
    });
    if (emptyInputs.length < form.find('input:enabled, select:enabled').length) {
        if(disable)
            emptyInputs.prop('disabled', true);
    } else {
        form.find('.nocriterialabel').prop('hidden', false);
        return false;
    }
    return true;
}

function sanitize(input, filtCase = 'camel') {
    switch(filtCase) {
        case 'lower':
            return input.replace(/[^a-zA-Z0-9 ]/, "").toLowerCase();
        case 'camel':
            return input.replace(/([a-z])([A-Z])/g, "$1 $2");
    }
}

function component(input, ...args) {
    switch(input) {
        case 'updown':
            return '<td class="buttoncell">'
            + '<button type="button" class="c_button-ic j_t-expand"><img src="' + _V_ASSETS + 'images/expand.png" alt="expand"></button>'
            + '<button type="button" class="c_button-ic j_t-collapse"><img src="' + _V_ASSETS + 'images/collapse.png" alt="collapse"></button>'
            + '</td>';
        case 'modify':
            return '<button type="button" class="c_button-ti ' + (args[2] || '') + '"><img src="' + _V_ASSETS + 'images/' 
            + args[0] + '.png" alt="' + (args[1] || '') + '"></button>';//returns edit/delete/misc. button with pencil icon
    }
}