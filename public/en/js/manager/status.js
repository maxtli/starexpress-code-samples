$(function () {
    drawSearch({
        0: {span: [1,2]},
        StatusTime: {type: 'dt', horiz: true, span: 2},
        PackageID: {num: true, bound: 'limdec:0'},
        TrackingNumber: {title: 'Package Tracking #'},
        Status: {},
        Location: {},
        Activity: {bound: 100, span:[1,2]}
    }, [
        ['PackageID', 'TrackingNumber', 'Status', 'Location'], ['StatusTime', 'Activity', '_Search']
        ], [
            ['StatusTime'],
            ['PackageID', 'TrackingNumber'],
            ['Status', 'Location'],
            ['Activity'],
            ['_Search']
            ]);
    loadTable('managestatus');
    loadNav();
    _opNotifs = {'search': 'Search successful. % status line(s) found.', 'edit': '% status line(s) updated.'};
    $('.j_bmtOp').click(function () {
        displayOperationMode($(this).data('op'));
        $('.t_Qrow:visible').find('.stidinput').each(function (i) {
            $(this).prop('name', 'stinfo[' + i + '][0]');
        }).prop('disabled', false);
    });
    $('.j_bmtOp').click(function () {
        $('#j_t-back').click(function () {
            $('.stidinput').each(function (i) {
                $(this).prop('name', 'stinfo[' + i + '][0]');
            }).prop('disabled', true);
            exitOperationMode();
        });
    });
    $('#delete_submit_function').click(function () {
        refreshTable('delete', $('#g_operationform').serialize(), 'POST');
    });
});

function displayTableRow_managestatus(i, item) {
    return '<tbody class="t_Qrow"><tr><td><input type="checkbox" class="selectbox"></td>'
            + '<td class="pkidcell"><input class="stidinput" name="stinfo[' + i + '][0]" value="' + item['ID'] + '" hidden disabled/>' + item['PKID'] + '</td>'
            + '<td class="trackingnumbercell">' + item['TrackingNumber'] + '</td>'
            + '<td>' + item['StatusTime'] + '</td>'
            + '<td>' + item['Status'] + '</td>'
            + '<td>' + item['Activity'] + '</td>'
            + '<td>' + item['Location'] + '</td></tr></tbody>';
}

function configureMenu(checkCount) {
    $('#bm_edit').prop('disabled', true);
    $('#bm_delete').prop('disabled', false);
}