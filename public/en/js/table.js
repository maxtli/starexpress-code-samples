var _bottommenuenabled = true;
var _opNotifs = {};
let _mobile;
let _allowResize = true;
var _setII;
function loadTable(path, OPCurl = '', effects = true, II = false) {
    load(path);
    _setII = II;
    $(_OPC + '.t_menu').width(150*$(_OPC + '.t_menu td').length);
    $(_OPC + '#j_t-perPage').change(function () {
        refreshTable('perPage/' + $(this).val(), { 'count': $('#totalcountindicator').html() });
    });
    $(_OPC + '#j_toggleSearch').click(function () {
        var show = ($(this).html() === ($(this).data('showheading') || 'Show Search'));
        $(_OPC + '#j_t-top').prop('hidden', !show);
        if (show)
            $(this).prop('class', $(this).prop('class').replace('blue', 'yellow')).html($(this).data('hideheading') || 'Hide Search');
        else
            $(this).prop('class', $(this).prop('class').replace('yellow', 'blue')).html($(this).data('showheading') || 'Show Search');
    });
    $(_OPC + '#j_t-search').on('submit', function (e) {
        e.preventDefault();
        if (verifyForm($(this))) {
            $('#finalsearchbutton, #viewallbutton').prop('disabled', true);
            $('.hidinput').prop('disabled', false);
            refreshTable('search' + OPCurl, $(this).serialize());
            $(this).find('input, select').prop('disabled', false);
        }
    });
    $(_OPC + '#viewallbutton').click(function () {
        refreshTable('search', { 'search': 'all' });
    });
    $(_OPC + '#j_t-prev').click(function () {
        changePage(-1 + parseInt($('#pageindicator').html()));
    });
    $(_OPC + '#j_t-next').click(function () {
        changePage(1 + parseInt($('#pageindicator').html()));
    });
    $(_OPC + '#j_t-page').change(function () {
        changePage(parseInt($(this).val()));
    });
    if (effects === false) return;
    $(_OPC + '.c_table').on({
        mouseenter: function () {
            if (!$(this).find('.selectbox').prop('checked'))
                highlightRow($(this), true, 1);
        }, mouseleave: function () {
            if (!$(this).find('.selectbox').prop('checked'))
                highlightRow($(this), false, 1);
        }
    }, '.t_Qrow').on('click', '.t_Qrow', function (e) {
        if ($(e.target).is('input, select, button, img') === false)
            $(this).find('.selectbox').click();
    }).on('change', ".selectbox", function () {
        highlightRow($(this).parents('.t_Qrow'), this.checked, 2);
    }).on('click', '#selectAllBox', function () {
        $(this).parents('.c_table').find('.selectbox:visible').prop('checked', $(this).prop('checked')).change();
    }).on('click', ".j_t-expand", function () {
        $(this).parents('.t_Qrow').addClass('t_Qrow-exp');
    }).on('click', ".j_t-collapse", function () {
        $(this).parents('.t_Qrow').removeClass('t_Qrow-exp');
    }).on('click', "#j_t-expand-A", function () {
        $(this).parents('.c_table').find('.j_t-expand:visible:enabled').click();
        var sibling = $(this).prop({ hidden: true, disabled: true }).siblings('#j_t-collapse-A').prop('hidden', false);
        setTimeout(function () {
            sibling.prop('disabled', false);
        }, 1000);
    }).on('click', "#j_t-collapse-A", function () {
        $(this).parents('.c_table').find('.j_t-collapse:visible:enabled').click();
        var sibling = $(this).prop({ hidden: true, disabled: true }).siblings('#j_t-expand-A').prop('hidden', false);
        setTimeout(function () {
            sibling.prop('disabled', false);
        }, 1000);
    });
    $(_OPC + '.searchresulttable').on('click', '.selectbox, #selectAllBox', function () {
        displayMenu();
        $(this).prop('disabled', true);
        setTimeout(() => {
            $(this).prop('disabled', false);
        }, 200);
    });
}

function drawSearch(obj, screenOrder, mobileOrder) {
    _mobile = (window.innerWidth <= 900);
    const inputs = { '_Search': { 0: $('<div>').html('<button class="c_button" id="finalsearchbutton">Search</button>' + (obj[0].viewAll ? ' <button type="button" class="c_button" id="viewallbutton">View All</button>' : '')), span: obj[0].span || 1 } };
    delete obj[0];
    $.each(obj, (name, item) => {
        const input = { 0: generateInput(name, item) };
        if (item.span)
            input.span = item.span;
        else if (item.type === 'dt')
            input.span = [1, 2];
        if (item.title)
            input.title = item.title;
        inputs[name] = input;
    });
    redrawSearch(inputs, _mobile ? mobileOrder : screenOrder);
    $(window).on('resize', () => {
        if (_allowResize && _mobile === (window.innerWidth > 900)) {
            _mobile = !_mobile;
            redrawSearch(inputs, _mobile ? mobileOrder : screenOrder);
        }
    });
}

function redrawSearch(inputs, order) {
    _allowResize = false;
    const form = $(_OPC + '#j_t-top #j_t-search').html('<div class="j_load"><div></div></div>');
    const table = $('<table>', { class: 'c_table-s' });
    $.each(order, (i, row) => {
        const inputRow = $('<tr>', { class: 'c_row-ipt' });
        if (row[0] === '_assoc') {
            $.each(row, (i, name) => {
                if (i === 0)
                    return;
                const input = inputs[name];
                if (name === '_Search') {
                    table.find('tr:last-child > td:last-child').css({verticalAlign: 'top', textAlign: 'center'}).append('<br><br><a class="c_L-err nocriterialabel" hidden>Please enter a search criteria.</a><a class="c_L-err nodatelabel" hidden>You entered a time without a date.</a>');
                    inputRow.append($('<td>', { class: 'c_center', colspan: input.span }).html(input[0]));
                } else
                    inputRow.append($('<td>', { class: 'c_L-bold', colspan: input.span }).css('text-align', 'right').append($('<div>', { class: 'c_box-rwi' }).html(input[0])).prepend('<a>' + (input.title || sanitize(name)) + ': </a>'));
            });
            table.append(inputRow);
        } else {
            const labelRow = $('<tr>');
            $.each(row, (i, name) => {
                const input = inputs[name];
                let span = 1;
                if (input.span)
                    if (Array.isArray(input.span))
                        span = _mobile ? input.span[1] : input.span[0];
                    else
                        span = input.span;
                labelRow.append(name === '_Search' ? '<td colspan="' + span + '" class="c_L-bold c_L-err nocriterialabel" hidden>Please enter a search criteria.</td><td colspan="' + span + '" class="c_L-bold c_L-err nodatelabel" hidden>You entered a time without a date.</td>'
                    : '<td class="c_L-bold" colspan="' + span + '">' + (input.title || sanitize(name)) + '</td>');
                inputRow.append($('<td>', { rowspan: !_mobile && input[0].prop('class') === 'c_input c_box-lh' ? 2 : 1, colspan: span, class: name === '_Search' ? 'c_center' : '' }).html(input[0]));
                /* I don't like this condition - fix later */
            });
            table.append(labelRow, inputRow);
        }
    });
    form.empty().append(table);
    setTimeout(() => {
        _allowResize = true;
        $(window).resize();
    }, 500);
}

function refreshTable(mode, input, request = 'GET', lengthError = false, notifText = '') {
    startLoad(true);
    $.ajax({
        url: '/' + _pageURL + '/a_' + mode, type: request, headers: { 'X-Requested-With': 'XMLHttpRequest' },
        data: input,
        success: function (result) {
            $('#finalsearchbutton, #viewallbutton').prop('disabled', false);
            $('.predicatebutton').prop({ hidden: false, disabled: false });
            result = parseAjaxResponse(result);
            if (result === false) {
                $(_OPC + '.j_load').prop('hidden', true);
                return;
            }
            if (result['count'] == '0' && !result['invalid']) {
                $(_OPC + '#j_t-noResults').prop('hidden', false);
                showNotif('No results found.');
                $(_OPC + '.j_load').prop('hidden', true);
                return;
            }
            //if there are results, but it's empty, unhide #j_t-noResults, show a notification and hide the loading icon, then return.
            var notif = '';
            if (result['invalid'])
                notif += 'Error: Some entries were invalid: ' + result['invalid'] + '. ';
            if (_pageURL !== 'uploadOrders')
                mode = mode.split('/', 2)[0];
            if (mode === 'delete') {
                $('.j_load').prop('hidden', true);
                showNotif(result['count'] + ' entry(s) deleted.' + (result['refundprices'] ? ' ' + result['refundprices'] + ' refunded to your account balance.' : ''));
                return;
            } else
                notif += (notifText || _opNotifs[mode] || '').replace('%', result['count']);
            if (lengthError)
                notif += ' Only first 4000 records shown.';
            if (notif)
                showNotif(notif);
            if (result['remainingCount']) {
                if (result['remainingCount'] === 0) {
                    $('.j_load').prop('hidden', true);
                    $('#remainingCountZero').prop('hidden', false);
                    $('#j_t-top, #j_toggleSearch').remove();
                    return;
                }
                result['count'] = result['remainingCount'];
            }
            $(_OPC + '#totalcountindicator').html(result['count']);
            var pages = Math.ceil(result['count'] / result['perPage']);
            $(_OPC + '#maxpageindicator').html(pages);
            var options = '';
            for (var i = 1; i <= pages; i++) {
                options += '<option>' + i + '</option>';
            }
            $(_OPC + '.t_pageFlip').prop('hidden', pages === 1);
            $(_OPC + '#j_t-page').html(options);
            $(_OPC + '#j_q1t-perPage').val(result['perPage']);
            setIterator(result['data']);
            finishLoad(1);
        },
        error: function (xhr) {
            showNotif("Error: " + xhr.status + " " + xhr.statusText);
            $('.j_load').prop('hidden', true);
        }
    });
}

function changePage(page) {
    startLoad();
    //resets the table
    $.ajax({
        url: '/' + _pageURL + '/a_page/' + page, type: 'GET', headers: { 'X-Requested-With': 'XMLHttpRequest' },
        success: function (result) {
            result = parseAjaxResponse(result);
            if (result === false)
                return;
            setIterator(result['data']);
            finishLoad(page);
        },
        error: function (xhr) {
            showNotif("Error: " + xhr.status + " " + xhr.statusText);
            $('.j_load').prop('hidden', true);
        }
    });
}

function setIterator(data) {
    let index = 0;
    $.each(_setII ? data[0] : data, function(i, item) {
        $.each(item, function(j, jtem) {
            if(jtem === null)
                item[j] = 'N/A';
        });
        if(_setII) {
            item['SetII'] = [];
            while(data[1][index] && data[1][index]['CID'] === item['CID']) {
                item['SetII'].push(data[1][index]);
                index++;
            }
        }
        $(_OPC + '.searchresulttable').append(window['displayTableRow_' + _pageURL](i, item));
    });
}

function startLoad(newOp = false) {
    if ($(_OPC + '#j_t-back:visible'))
        $(_OPC + '#j_t-back').click();
    $(_OPC + '.searchresulttable').prop('hidden', true).children(':not(.c_table-head)').remove();
    $(_OPC + '.j_load').prop('hidden', false);
    $(_OPC + '#selectAllBox').prop('checked', false);
    $(_OPC + '.t_menu').prop('hidden', true);
    $(_OPC + '#j_t-prev, ' + _OPC + '#j_t-next, ' + _OPC + '#j_t-page, .predicatebutton').prop('disabled', true);
    if (newOp) {
        $(_OPC + '#j_t-noResults, ' + _OPC + '#t_pageBar, ' + _OPC + '#editerrorlabel').prop('hidden', true);
        $(_OPC + '#totalcountindicator').html('0');
        $(_OPC + '#j_t-page, ' + _OPC + + '#maxpageindicator, ' + _OPC + '#pageindicator').html('');
    }
}

function finishLoad(page) {
    $(_OPC + '#j_t-prev, ' + _OPC + '#j_t-next, ' + _OPC + '#j_t-page, .predicatebutton').prop({ disabled: false, hidden: false });
    if (page === 1)
        $(_OPC + '#j_t-prev').prop({ hidden: true, disabled: true });
    if (page == $(_OPC + '#maxpageindicator').html())
        $(_OPC + '#j_t-next').prop({ hidden: true, disabled: true });
    $(_OPC + '#pageindicator').html(page);
    $(_OPC + '#j_t-page').val(page);
    $(_OPC + '.j_load').prop('hidden', true);
    $(_OPC + '#t_pageBar, ' + _OPC + '.searchresulttable').prop('hidden', false);
}

function displayMenu() { 
    if (typeof additionalBoxAction === 'function')
        additionalBoxAction();
    if (_OPC.length === 0 && _bottommenuenabled === false)
        return;
    var checkCount = $(_OPC + ".searchresulttable .selectbox:enabled:checked").length;
    $(_OPC + '#selectedcountindicator').html(checkCount);
    var bm = $(_OPC + '.t_menu');
    if (checkCount > 0) {
        if (bm.prop('hidden'))
            bm.prop('hidden', false).css("bottom", "-25%").animate({ bottom: '+=25%' }, 400);
        if (_OPC.length === 0 && typeof configureMenu === 'function')
            configureMenu(checkCount);
    } else
        bm.animate({ bottom: '-=25%' }, 200, function () {
            $(this).prop('hidden', true);
        });
}

function displayOperationMode(marker) {
    $('#j_t-top, #t_pageBar').prop('hidden', true);
    $('#c_subtitle, #' + marker + '_titlediv_function, [id$="' + marker + '_submit_function"], .' + marker + '_removablecell').prop('hidden', false);
    $('.selectbox:not(:checked)').parents('.t_Qrow').prop('hidden', true);
    if ($('.operationarea_' + marker))
        $('.operationarea_' + marker).prop('hidden', false).find('input, select').filter(':visible:not(.j_i-LX-WarehouseWeight, .j_i-LX-WarehouseVolume)').prop('disabled', false);
    toggleMenu();
}

function toggleMenu(show = false) {
    _bottommenuenabled = show;
    if(show)
        $(_OPC + '.t_menu').prop('hidden', false);
    $(_OPC + ".t_menu").animate({ bottom: show ? '0' : '-20%' }, 400, function () {
        $(this).prop('hidden', !show);
    });
}

function exitOperationMode(topHidden = false) {
    $('.j_t-opArea').prop('hidden', true).find('input').prop('disabled', true).filter(':not(.datetimeinput)').val("");
    $('.j_t-opArea').find('select').prop('disabled', true).prop('selectedIndex', 0).change();
    $('#c_subtitle, [id$="_function"], #editerrorlabel, .operationerrorlabel, [class$="_removablecell"]').prop('hidden', true);
    $('.selectbox, #selectAllBox').prop('disabled', false);
    $('.selectbox:visible:not(:checked)').each(function () {
        $(this).prop('checked', true).change();
    });
    $('#t_pageBar, .t_Qrow').prop('hidden', false);
    $('#j_t-top').prop('hidden', topHidden);
    toggleMenu(true);
    $(".removable").remove();
    $('#j_t-back').off('click');
}

function generateEditInputs() {
    $('.editinput').prop('disabled', true);
    var editButton = $(component('modify', 'edit', 'Edit', 'removable modifyeditbutton')).click(function () {
        var row = $(this).parents('.t_Qrow');
        row.find('.' + $(this).parents('[class$="_editcell"]').prop('hidden', true).prop('class').replace('_editcell', '') + '_editboxcell').prop('hidden', false).find('.editinput').prop('disabled', false);
        row.find('.j_t-collapse').prop({hidden: true, disabled: true});
    });
    var trashButton = $(component('modify', 'cancel', 'Cancel', 'removable closeeditbutton')).click(function () {
        var row = $(this).parents('.t_Qrow');
        var editboxcell = $(this).parents('[class$="_editboxcell"]').prop('hidden', true);
        editboxcell.find('.editinput').prop('disabled', true);
        row.find('.' + editboxcell.prop('class').replace('_editboxcell', '') + '_editcell').prop('hidden', false);
        if (!row.find('.editinput:visible').length)
            row.find('.j_t-collapse').prop({hidden: false, disabled: false});
    });
    var rows = $('.t_Qrow:visible');
    rows.find('[class$="_editcell"]').append(editButton);
    rows.find('.trashbuttoncell').append(trashButton);
    //append edit and trash button to all rows
    $('#j_t-back').click(function () {
        $('.closeeditbutton:visible').click();
        $('.t_Qrow').each(function () {
            if ($(this).find('.j_t-expand').prop('hidden') && $(this).find('.j_t-collapse').prop('hidden'))
                $(this).find('.j_t-collapse').prop({hidden: false, disabled: false});
        });
    });
    //sets onclick listener so that when back button is clicked, close all edits, then unhide all collapse buttons
}

function addElementToTable(attribute, item, { type = 'input', mimic = false, classes = '', innerHtml = '', triggerEvent = true, attrs = '' } = {}, props = {}) {
    var newElement = '<' + type + ' data-field="' + attribute + '" class="c_input removable ' + classes + attribute + 'selector" ' + attrs + '>';
    if (type === 'select') {
        newElement += '</select>';
        type = 'change';
    }
    $('.t_Qrow:visible').find('.' + attribute + '_cell').append(newElement);
    $('.' + attribute + 'selector').prop(props).html(innerHtml).each(function (i) {
        $(this).prop('name', item + 'info[' + i + ']' + '[' + attribute + ']');
        if (mimic)
            $(this).val($(this).parent().data('init') || $(this).parents('.t_Qrow').find('.' + attribute + '_label').html());
    });
    //add extra features
    if ($('#changeAll_' + attribute + 'Cell')) {
        if (type === 'select')
            type = 'change';
        $('#changeAll_' + attribute + 'Cell').append(newElement.replace(attribute + 'selector"', '" id="changeAll_' + attribute + 'Box"').replace('required', ''));
        $('#changeAll_' + attribute + 'Box').prop(props).html(innerHtml).on(type, function () {
            var selectors = $('.selectbox:visible:checked').parents('.t_Qrow').find('.' + attribute + 'selector');
            selectors.val($(this).val()).trigger('mousedown').click();
            if (triggerEvent)
                selectors.trigger(type);
        });
    }
}

function highlightRow(tbody, boolean, depth, color = 'shade') {
    if(boolean)
        tbody.addClass('t_Qrow-hl').css({'--filling': 'var(--' + color + depth + ')', '--border': 'var(--' + color + (depth + 1) + ')'})
        .children(':visible:last').addClass('t_Qrow-hl-bottom');
    else
        tbody.removeClass('t_Qrow-hl').children().removeClass('t_Qrow-hl-bottom');
}