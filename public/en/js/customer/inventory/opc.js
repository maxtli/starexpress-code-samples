$(function () {
    var prevContent = '';
    loadTable('inventory');
    $('.Warehouseindic').html($('#j_LX-WarehouseWeight').val());
    $('#Warehouseindicinput').val($('#j_LX-WarehouseWeight').val());
    _opNotifs = {'search': 'Search successful. % item(s) found.'};
    $(_OPC + '#viewallbutton').off('click').click(function () {
        refreshTable('search', {'Warehouse' : $('#Warehouseindicinput').val()});
    });
    $('#z_invcontentbox').on('savePrevContent', function () {
        prevContent = $('#pkivtable').html();
    }).trigger('savePrevContent').on('change', '#pkivtable .selectbox', function () {
        $('#removepkivbutton').prop('disabled', !($('#pkivtable .selectbox:checked').length));
    }).on('click', '#addpkivbutton', function () {
        var selected = $('#geninvtable .selectbox:enabled:checked').prop('disabled', true).parents('.t_Qrow');
        selected.clone(true).appendTo('#pkivtable').each(function() {
            $(this).find('.selectbox').prop({disabled: false, checked: false}).change();
            var qtycell = $(this).find('.qtycell');
            qtycell.prepend('<input class="c_input-n Qtydisplay" style="max-width:' + (15 + qtycell.html().length * 10) + 'px" oninput="numberBoundCheck(this, {min: 1, max: ' + qtycell.html() + ', limdec: 0})" value="1"> / ');
        });
        highlightRow(selected.prop('class', 't_Qrow c_t_yellow'), true, 2);
        displayMenu();
    }).on('click', '#removepkivbutton', function() {
        var indices = [];
        $('#pkivtable .selectbox:enabled:checked').parents('.t_Qrow').each(function() {
            indices.push($(this).data('pid'));
        }).remove();
        $('#geninvtable .t_Qrow.c_t_yellow').filter(function () {return indices.includes($(this).data('pid'));}).prop('class', 't_Qrow').find('.selectbox').prop({disabled: false, checked: false}).change();
        $(this).prop('disabled', true);
    }).on('click', '#confirmchangesbutton', function() {
        if(!checkEmptyFields($('#pkivtable .Qtydisplay')))
            return;
        $('#invtable tr:not(:first-child)').remove();
        pkiv = [];
        var price = 0;
        $.each($('#pkivtable .t_Qrow'), function() {
            var qtyindic = $(this).find('.Qtydisplay');
            qtyindic.attr('value', qtyindic.val());
            pkiv.push({0: $(this).data('pid'), 'Qty': qtyindic.val()});
            var fullprice = $(this).find('.pricecell').html();
            fullprice = fullprice.substring(fullprice.search(/[0-9.]/));
            $('#invtable').append('<tr class="itemcontentrow"><td>' + $(this).find('.Qtydisplay').val() + '</td><td>' + $(this).find('.categorycell').html() + '</td><td>' + $(this).find('.brandcell').html()
            + '</td><td>' + $(this).find('.itemcell').html() + '</td><td>' + $(this).find('.upccell').html() + '</td><td>' + fullprice + '</td></tr>');
            price += qtyindic.val() * fullprice;
        });
        $('#j_i-pc-inv').html(price.toString().replace(/^0+([^.])/, '$1'));
        prevContent = '';
        dissipateBox();
    });
    $('#discardchangesbutton').click(function() {
        $('#pkivtable').html(prevContent);
        prevContent = '';
        dissipateBox();
    });
    refreshTable('search', {Warehouse : $('#j_LX-WarehouseWeight').val()});
});

function dissipateBox() {
    _OPC = '#maincontentarea ';
    $('#c_overlay').fadeOut();
    $('#invpricebutton').prop('disabled', !pkiv.length).change();
}