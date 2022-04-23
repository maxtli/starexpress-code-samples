function displayTableRow_shipments(i, item) {
    var weightText = '<b>Declared: </b>' + item['DeclaredWeight'] + '<br><b>Actual: </b>' + item['ActualWeight'];
    if (item['ActualWeight'] === 'N/A' || parseFloat(item['DeclaredWeight'].substring(0, item['DeclaredWeight'].indexOf(' '))) >= parseFloat(item['ActualWeight'].substring(0, item['ActualWeight'].indexOf(' '))) - 0.01)
        weightText = item['DeclaredWeight'];
    var volumeText = '<b>Declared: </b>' + item['DeclaredVolume'] + '<br><b>Actual: </b>' + item['ActualVolume'];
    if (item['ActualVolume'] === 'N/A' || parseFloat(item['DeclaredVolume']) >= parseFloat(item['ActualVolume']) - 0.01)
        volumeText = item['ActualVolume'];
    var row = $('<tbody class="t_Qrow"><tr><td rowspan="2"><input type="checkbox" class="selectbox"></td>'
            + '<td class="tracknumcell"><a class="trackingnum">' + item['TrackingNumber'] + '</a>'
            + '<input class="tracknuminput" name="pkinfo[]" value="' + item['TrackingNumber'] + '" hidden disabled/></td>'
            + '<td class="pkstatuscell">' + item['Status'] + '</td>'
            + '<td>' + item['IDStatus'] + '</td>'
            + '<td>' + item['Service'] + '</td>'
            + '<td>' + item['Warehouse'] + '</td>'
            + '<td class="weightcell">' + weightText + '</td>'
            + '<td class="volumecell">' + volumeText + '</td>'
            + '<td class="pricecell">' + item['Price'] + '</td>'
            + component('updown')
            + '</tr>'
            + '<tr><td class="t_ic-wrapper" colspan="9"><table class="c_table-s"><td><b>Created: </b>' + item['CreateTime'] + '</td>'
            + '<td class="RecipientName_editcell"><b>Recipient Name: </b><a class="RecipientName_label">' + item['Recipient'] + '</a></td>'
            + '<td class="RecipientName_editboxcell" hidden><table><td class="RecipientName_cell"></td><td class="trashbuttoncell"></td></table></td>'
            + '<td class="RecipientAddress_editcell" colspan="3"><b>Recipient Address: </b>' + generateAddress(item) + '</td>'
            + '<td class="RecipientAddress_editboxcell" colspan="3" hidden><table><td class="Address_cell City_cell State_cell Country_cell Zip_cell"></td><td class="trashbuttoncell"></td></table></td></tr>'
            + '</table></td></tr></tbody>').data('tn', item['TrackingNumber']);
    if (_OPC && fcpk.includes(item['TrackingNumber'])) {
        row.prop('class', 't_Qrow c_t_yellow').find('.selectbox').prop({checked: true, disabled: true});
        highlightRow(row, true, 2, 'yellow');
    };
    return row;
}