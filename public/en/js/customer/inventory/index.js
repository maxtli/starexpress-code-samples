function configureMenu(checkCount) {
    $('#viewhistorybutton').prop('disabled', checkCount > 1);
}

function displayTableRow_inventory(i, item) {
    var row = $('<tbody class="t_Qrow" data-pid="' + item['ProductID'] + '"><tr><td rowspan="2"><input type="checkbox" class="selectbox"></td>'
            + '<td class="qtycell">' + item['TotalAmount'] + '</a>'
            + '<td class="upccell">' + item['UPC'] + '</td>'
            + '<td class="categorycell">' + item['Category'] + '</td>'
            + '<td class="brandcell">' + item['Brand'] + '</td>'
            + '<td class="itemcell">' + item['Item'] + '</td>'
            + '<td class="pricecell">' + item['Price'] + '</td>'
            + (_OPC ? '' : '<td>' + item['Warehouse'] + '</td>')
            + component('updown')
            + '</tr><tr><td class="t_ic-wrapper" colspan="20"><table class="c_table-s"><td><b>Color: </b>' + item['Color'] + '</td>'
            + '<td><b>Size: </b>' + item['Size'] + '</td>'
            + '<td><b>Style Code: </b>' + item['StyleNo'] + '</td>'
            + '<td><b>Material: </b>' + item['Materials'] + '</td>'
            + '<td><b>Spec: </b>' + item['Specification'] + '</td></table></td></tr></tbody>');
    if (_OPC && pkiv[item['ProductID']]) {
        row.prop('class', 't_Qrow c_t_yellow').find('.selectbox').prop({checked: true, disabled: true});
        highlightRow(row, true, 2, 'yellow');
    }
    return row;
}