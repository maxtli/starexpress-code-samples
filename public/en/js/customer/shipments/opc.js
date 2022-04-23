$(function () {
    drawSearch({
        0: {viewAll: true, span: 2},
        TrackingNumber: {title: '<span id="j_trackNumTitle" style="position:absolute;bottom:0">Tracking #:</span>'},
        Service: {type: 'sel'},
        IdStatus: {type: 'sel', opt: ['All', 'Unsubmitted', 'Unverified', 'Verified', 'Invalid']},
        RecipientName: {},
        RecipientAddress: {type: 'address', span: 2},
        DeclaredVolume: {type: 'num', suffix: 'ft^3'},
        DeclaredWeight: {type: 'num', suffix: 'lb'},
        CreateTime: {type: 'dt', horiz: true, span: 2}
    }, [
        ['TrackingNumber', 'Service', 'CreateTime'],
        ['RecipientName', 'RecipientAddress', 'IdStatus'],
        ['DeclaredWeight', 'DeclaredVolume', '_Search']
        ], [
            ['TrackingNumber', 'Service'],
            ['RecipientName', 'IdStatus'],
            ['RecipientAddress'],
            ['DeclaredWeight', 'DeclaredVolume'],
            ['CreateTime'],
            ['_Search']
            ]);
    $('#z_pkgcontentbox').on('click', '#importtracknumbutton', function () {
        $('#importtracknuminput').prop('disabled', false).click();
    }).on('change', '#importtracknuminput', function () {
        uploadFile(this, function (numlist, lengthError) {
            refreshTable('list/' + $(_OPC).data('fcid'), {'numlist': numlist}, 'POST', lengthError);
        });
    }).on('change', '#fcpktable .selectbox', function () {
        $('#removefcpkbutton').prop('disabled', !($('#fcpktable .selectbox:checked').length));
    }).on('click', '#addfcpkbutton', function () {
        var selected = $('#genpkgtable .selectbox:enabled:checked').prop('disabled', true).parents('.t_Qrow');
        selected.clone(true).appendTo('#fcpktable').each(function() {
            fcpk.push($(this).data('tn'));
            $(this).data('tn', fcpk.length - 1).find('.selectbox').prop({disabled: false, checked: false}).change();
        });
        highlightRow(selected.prop('class', 't_Qrow c_t_yellow fcpkselectedrow'), true, 2);
        displayMenu();
    }).on('click', '#removefcpkbutton', function() {
        var indices = [];
        $('#fcpktable .selectbox:enabled:checked').parents('.t_Qrow').each(function() {
            indices.push(fcpk[$(this).data('tn')]);
            delete fcpk[$(this).data('tn')];
        }).remove();
        $('#genpkgtable .t_Qrow.c_t_yellow').filter(function () {return indices.includes($(this).data('tn'));}).prop('class', 't_Qrow').find('.selectbox').prop({disabled: false, checked: false}).change();
        $('#removefcpkbutton').prop('disabled', true);
    }).on('click', '#confirmchangesbutton', function() {
        var empty = false;
        fcpk = fcpk.filter(function(item) {return item;});
        if (fcpk.length === 0) {
            fcpk = [''];
            empty = true;
        }
        var pkrow = $('.forecastpkrow:visible');
        if(pkrow.length) {
            pkrow.data({pktn: fcpk.slice(), modified: true});
            var origpktn = pkrow.data('origpktn');
            if (origpktn.every(function (item) {
                var index = fcpk.indexOf(item);
                if (index === -1)
                    return false;
                fcpk.splice(index, 1);
                return true;
            }) && fcpk.length === 0) pkrow.find('.undoeditpackagebutton').click();
            else {
                if(empty)
                    pkrow.find('.fcpklist').html('None');
                else
                    pkrow.find('.fcpklist').html(pkrow.data('pktn').join(', '));
                pkrow.css('background-color', 'var(--yellow2)').find('.modifiedpkindic').html(' (MODIFIED)').parent().css('background-color', 'white');
                pkrow.find('.undoeditpackagebutton').prop('hidden', false);
            }
        } else {
            $('#showpkgtextarea').data('fcpk', fcpk.slice()).html(fcpk.join(', '));
            if(empty)
                $('#showpkgtextarea').html('None');
            else
                $('#finalcreatebutton').prop('disabled', false);
        }
        $('#discardchangesbutton').click();
    });
    loadOPC();
});

function loadOPC() {
    var opNotifs = Object.assign({}, _opNotifs);
    _opNotifs = {'search': 'Search successful. % shipment(s) found.', 'list': '% shipment(s) imported from list.'};
    loadTable('shipments', '/' + $(_OPC).data('fcid'));
    $('#discardchangesbutton').click(function() {
        fcpk = [''];
        _OPC = '';
        _opNotifs = opNotifs;
        $('#c_overlay-box').removeData('fcid').children('#z_pkgcontentbox').html('<div class="j_load"><div></div></div>');
        $('#c_overlay').fadeOut();
    });
    refreshTable('search', {'fcido': $(_OPC).data('fcid') || 'new'});
}