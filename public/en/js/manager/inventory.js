$(function () {
    drawSearch({
        0: {span: [1,2]},
        Warehouse: {type: 'sel'},
        Username: {},
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
        UnitPrice: {type: 'num', prefix: '$', suffix: 'USD'},
        TransactionTime: {type: 'dt', horiz: true, span: 2},
        ForecastID: {num: true, bound: 'limdec: 0'}
    }, [
        ['Warehouse', 'Username', 'RootCategory', 'Subcategory'],
        ['Brand', 'ItemName', 'ItemQty'],
        ['Color', 'Size', 'Materials', 'StyleNo'],
        ['UPC', 'Specifications', 'UnitPrice'],
        ['TransactionTime', 'ForecastID', '_Search']
        ], [
        ['Warehouse', 'Username'], ['RootCategory', 'Subcategory'],
        ['ItemName'], ['Brand', 'StyleNo'],
        ['Color', 'Size'], ['Materials', 'Specifications'],
        ['UPC', 'UnitPrice'], 
        ['ForecastID', 'ItemQty'],
        ['TransactionTime'],
        ['_Search']
        ]);
    loadNav();
    loadTable('manageproducts');
    _opNotifs = {'search': 'Search successful. % status line(s) found.', 'list': '% shipment(s) imported from list.', 'sign': '% shipment(s) signed.', 'edit': '% shipment(s) updated.', 'send': '% shipment(s) sent.',
        'updatestatus': 'Status added for % shipment(s).', 'updatestatustransfer': '% shipment(s) transferred to other transporters.', 'sendmessage': '% text messages were sent.'};
    $('#productssearchlabel').prop('disabled', true).prop('class', 'c_tab selsearchlabel');
});

function displayTableRow_managestatus(i, item) {
    return '<tbody class="t_Qrow"><tr><td><input type="checkbox" class="selectbox"></td>'
            + '<td class="pkidcell">' + item['PKID'] + '</td>'
            + '<td class="trackingnumbercell">' + item['TrackingNumber'] + '</td>'
            + '<td>' + item['StatusTime'] + '</td>'
            + '<td>' + item['Status'] + '</td>'
            + '<td>' + item['Activity'] + '</td>'
            + '<td>' + item['Location'] + '</td></tr></tbody>';
}
//old
function configureMenu(checkCount) {
    $('#verifyidbutton').prop('disabled', !(checkCount == 1 && $('.selectbox:checked').parents('.t_Qrow').find('.idstatuscell').html() == 'Unverified'));
    $('#signpackagebutton, #editpackagebutton, #sendpackagebutton, #updatestatuspackagebutton, #deletepackagebutton').prop('disabled', false);
    $('#viewstatusbutton, #viewdeliverybutton').prop('disabled', checkCount > 1);
    $('.selectbox:checked').parents('.t_Qrow').find('.pkstatuscell').each(function() {
        switch($(this).html()) {
            case 'Declared':
                $('#sendpackagebutton, #updatestatuspackagebutton, #viewdeliverybutton').prop('disabled', true);
                if($('#signpackagebutton').prop('disabled') && $('#editpackagebutton').prop('disabled') && $('#deletepackagebutton').prop('disabled'))
                    return false;
                break;
            case 'Signed':
            case 'Handled':
                $('#signpackagebutton, #updatestatuspackagebutton, #viewdeliverybutton').prop('disabled', true);
                if($('#sendpackagebutton').prop('disabled') && $('#editpackagebutton').prop('disabled') && $('#deletepackagebutton').prop('disabled'))
                    return false;
                break;
            case 'Delivery':
                $('#signpackagebutton, #editpackagebutton, #sendpackagebutton, #deletepackagebutton').prop('disabled', true);
                if($('#updatestatuspackagebutton').prop('disabled') && $('#viewdeliverybutton').prop('disabled'))
                    return false;
                break;
            default:
                $('#signpackagebutton, #editpackagebutton, #sendpackagebutton, #updatestatuspackagebutton, #viewdeliverybutton, #deletepackagebutton').prop('disabled', true);
                return false;
        }
    });
}