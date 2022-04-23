$(() => {
    drawSearch({
        0: {span: [10,2], viewAll: true},
        StoreRootCategory: {type: 'sel', title: 'Root Category', span: [2,1]},
        StoreSubcategory: {type: 'sel', title: 'Subcategory', span: [2,1]},
        Title: {bound: 200, span: [2,1]},
        Subtitle: {bound: 200, span: [2,1]},
        Description: {bound: 1000, span: [3,1]},
        Visibility: {type: 'sel', opt: ['Listed', 'All', 'Unlisted'], span: [2,1]},
        Currency: {type: 'sel', span: [2,1]},
        Country: {type: 'sel', span: [2,1]},
        Color: {span: [2,1]},
        Size: {span: [2,1]},
        InStock: {type: 'num', bound: 'limdec: 0', span: [3,1]},
        SalePrice: {type: 'num', cur: true, span: [3,1]},
        Discount: {type: 'sel', opt: ['All', 'Sale', 'Regular'], span: [2,1]},
        StockTime: {type: 'dt', horiz: true, span: [5,2]},
        LastBought: {type: 'dt', horiz: true, span: [5,2]},
        SoldQty: {type: 'num', bound: 'limdec: 0', span: [3,1]},
        Brand: {span: [2,1]},
        Materials: {span: [2,1]},
        StyleNo: {span: [2,1]},
        Specification: {bound: 100, span: [2,1]}
    }, [
        ['StoreRootCategory', 'StoreSubcategory', 'Title', 'Country', 'Visibility'], 
        ['Subtitle', 'Description', 'SalePrice', 'Currency'],
        ['Brand', 'InStock', 'StockTime'], 
        ['SoldQty', 'LastBought', 'Discount'],
        [ 'Color', 'Size', 'StyleNo', 'Materials', 'Specification'],
        [ '_Search']
    ], [
        ['StoreRootCategory', 'StoreSubcategory'], 
        ['Title', 'Subtitle'],
        ['Description', 'SoldQty'], 
        ['Visibility', 'Country'],
        ['SalePrice', 'Discount'], 
        ['Currency', 'InStock'],
        ['StockTime'],
        ['LastBought'],
        ['Brand', 'Materials'],
        ['Color', 'Size'], 
        ['StyleNo', 'Specification'],
        ['_Search']
    ]);
    loadTable('managecatalog', '', !_OPC, true);
});

function displayTableRow_managecatalog(i, item) {
    var row = $('<tbody class="t_Qrow"><tr><td rowspan="2"><input type="' + (_OPC ? 'radio' : 'checkbox') + '" class="selectbox" name="cid" value="' + item['CID'] + '"></td>'
            + '<td>' + item['RootCategory'] + ' > ' + item['HomeCategory'] + '</td>'
            + ['Title', 'SubTitle', 'Description', 'Country', 'Display'].map(key => '<td>' + (item[key].length > 100 ? item[key].substring(0, 100) + '...' : item[key]) + '</td>').join('')
            + component('updown')
            + '</tr>'
            + '<tr hidden><td class="t_ic-wrapper" colspan="20"></td></tr>'
            + '</tbody>');
    row.find('.t_ic-wrapper').append($('<table>', {class: 'c_table-s'}).append(item['SetII'].map((opt, i) => {
        const replfn = col => '<td><b>' + sanitize(col) + '</b>: ' + (opt[col] || 'N/A') + '</td>';
        opt['Price'] = item['Currency'] + opt['SalePrice'];
        if(opt['DiscountPrice'])
            opt['DiscountPrice'] = item['Currency'] + opt['DiscountPrice'];
        opt['OptName'] = ((opt['OColor'] || '') + (opt['OSize'] ? (opt['OColor'] ? ' > ' + opt['OSize'] : 'Size ' + opt['OSize']) : '')) || 'Standard';
        item['SetII'][i] = opt;
        return '<tbody class="s_t-opt"><tr><td colspan="2"><div class="itemleftarea c_t_yellow"><b>Option</b>: ' + opt['OptName'] + '</div></td>' + ['InStock', 'StockTime', 'LastBought', 'SoldQty', 'Price'].map(replfn).join('') + '</tr><tr>' +
        ['Brand', 'StyleNo', 'Color', 'Size', 'Materials', 'Specification', 'DiscountPrice'].map(replfn).join('') + '</tr></tbody>';}
    ).join('')));
    item['Currency'] = item['Currency'].slice(0, -2);
    return row.data('details', item);
}