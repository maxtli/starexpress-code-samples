$(function () {
    drawSearch({
        0: {viewAll: true, span: [1,2]},
        Warehouse: {type: 'sel'},
        RootCategory: {type: 'sel'},
        Subcategory: {type: 'sel'},
        ItemQty: {type: 'num', bound: 'limdec:0'},
        Brand: {},
        ItemName: {span: 2, bound: 100},
        UPC: {},
        Color: {},
        Size: {},
        Materials: {},
        StyleNo: {},
        Specifications: {span: [2,1], bound: 100},
        UnitPrice: {type: 'num', prefix: '$', suffix: 'USD'}
    }, [
        ['Warehouse', 'RootCategory', 'Subcategory', 'ItemQty'],
        ['Brand', 'ItemName', 'UPC'],
        ['Color', 'Size', 'Materials', 'StyleNo'],
        ['Specifications', 'UnitPrice', '_Search']
        ], [
        ['Warehouse', 'ItemQty'], ['RootCategory', 'Subcategory'],
        ['ItemName'], ['Brand', 'StyleNo'],
        ['Color', 'Size'], ['Materials', 'Specifications'],
        ['UPC', 'UnitPrice'], 
        ['_Search']
        ]);
    loadTable('inventory');
    loadNav();
    _opNotifs = {'search': 'Search successful. % inventory item(s) found.'};
    var historymode = false;
    $('#viewinvhistorybutton').click(function () {
        $('.c_content').prop('hidden', !historymode);
        $('#invhistoryarea').prop('hidden', historymode);
        $('#contentheading').html(historymode ? 'My Current Inventory' : 'My Inventory History');
        $(this).html(historymode ? 'View My Inventory History' : 'View My Current Inventory');
        _bottommenuenabled = historymode;
        if (_bottommenuenabled === false)
            $(".t_menu").animate({bottom: '-=20%'}, 400, function () {
                $(this).prop('hidden', true);
            });
        else if ($('.selectbox:enabled:checked').length)
            $('.t_menu').prop('hidden', false).animate({bottom: '+=20%'}, 400, function () {
                $(this).css("bottom", "0");
            });
        historymode = !historymode;
        $('#viewallhistorybutton').click();
    });
    $('#viewallhistorybutton').click(function() {
        $('#specifichistoryarea').prop('hidden', true);
        $('.invhistoryrow, .invhistorydisclaimer').prop('hidden', false);
        $(this).prop('disabled', true);
    });
    $('#viewhistorybutton').click(function() {
        var row = $('.selectbox:enabled:checked').parents('.t_Qrow');
        $('#viewinvhistorybutton').click();
        $('#specifichistoryarea').prop('hidden', false);
        $('#viewallhistorybutton').prop('disabled', false);
        $('.invhistorydisclaimer, .invhistoryrow:not([data-pid="' + row.data('pid') + '"])').prop('hidden', true);
        $('#upcskuindic').html(row.find('.upccell').html());
    });
    refreshTable('search', {'search' : 'all'});
});