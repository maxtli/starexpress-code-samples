
//callback: pid, spec
function loadSelProduct(trigger, callback) {
    var oBox = $('#c_overlay-box');
    oBox.detach();
    const revertURL = _pageURL;
    $(trigger).click(function() {
        _OPC = '#c_overlay-box ';
        oBox.appendTo($('#c_overlay').fadeIn());
        drawSearch({
            0: {span: 2, viewAll: true},
            RootCategory: {type: 'sel'},
            Subcategory: {type: 'sel'},
            Brand: {},
            ItemName: {span: 2, bound: 100},
            UPC: {},
            Color: {},
            Size: {},
            Materials: {},
            StyleNo: {},
            Specification: {span: [2,1], bound: 100},
            UnitPrice: {type: 'num', cur: true},
            Currency: {type: 'sel'}
        }, [
            ['RootCategory', 'Subcategory', 'Brand', 'UPC'],
            ['ItemName', 'Color', 'Size'],
            ['Materials', 'StyleNo', 'UnitPrice', 'Currency'],
            ['Specification', '_Search']
            ], [
            ['RootCategory', 'Subcategory'],
            ['ItemName'], ['Brand', 'StyleNo'],
            ['Color', 'Size'], ['Materials', 'UPC'],
            ['Specification'], 
            ['UnitPrice', 'Currency'],
            ['_Search']
            ]);
        loadTable('manageproducts', '', false);
        
        $(_OPC + '.c_table').on({
            mouseenter: function () {
                if (!$(this).find('.selectbox').prop('checked'))
                    highlightRow($(this), true, 1);
            }, mouseleave: function () {
                if (!$(this).find('.selectbox').prop('checked'))
                    highlightRow($(this), false, 1);
            }
        }, '.t_Qrow').on('click', '.t_Qrow', function (e) {
            if ($(e.target).is('input, select, button, img') === false && !$(this).find('.selectbox').prop('checked'))
                $(this).find('.selectbox').prop('checked', true).change();
        }).on('change', ".selectbox", function () {
            highlightRow($('.t_Qrow'), false, 2);
            highlightRow($(this).parents('.t_Qrow'), true, 2);
            displayMenu();
        });
        
        $('#j_discardprod').click(function() {
            $('#c_overlay').fadeOut();
            oBox.detach();
            _pageURL = revertURL;
            _OPC = '';
        });
        $('#a_choisir').click(function() {
            _OPC = '';
            _pageURL = revertURL;
            $('#c_overlay').fadeOut();
            var prod = $('#c_overlay-box .selectbox:checked').first();
            $('#j_dy-form-prod').prop('hidden', true);
            callback(prod.val(), prod.parents('.t_Qrow').data('spec'));
            oBox.detach();
        });
        refreshTable('search', {'search': 'all'});
        $(this).off('click').click(function() {
            _pageURL = 'manageproducts';
            _OPC = '#c_overlay-box ';
            oBox.appendTo($('#c_overlay').fadeIn());
            refreshTable('search', {'search': 'all'});
        });
    });
}

function displayTableRow_manageproducts(i, {ProductID, RootCategory, Subcategory, ItemName, Brand, Color, Size, StyleNo, UPC, Price, Materials, Specification}) {
    var revItem = {Category: RootCategory + ' > ' + Subcategory, Name: ItemName, Brand, Color, Size, 'Style Code': StyleNo, UPC, Price};
    var row = $('<tbody class="t_Qrow"><tr><td rowspan="2"><input type="radio" class="selectbox" name="pid" value="' + ProductID + '"></td>'
        + Object.keys(revItem).map(key => '<td>' + revItem[key] + '</td>').join('')
        + '</tr></tbody>').data('spec', {...revItem, Materials, Specification});
    return row;
}