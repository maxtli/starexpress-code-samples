$(() => {
    load('managecatalog');
    loadImgFrame('#a_picdisplay');
    $('#j_selcat').click(resetWindow);
    if($('#a_picdisplay').data('count') === 0)
        $('#a_picdisplay').html('No pictures submitted.');
    else for (var i = 0; i < $('#a_picdisplay').data('count'); i++) {
        appendImg('/managecatalog/viewTicketImg/' + i, '#a_picdisplay');
    }
    $('#j_complete').click(function() {
        ajaxSubmit('managecatalog/a_ticket', ($('#j_continue').prop('checked') ? 'managecatalog/ticket?success=' + $(this).data('otid') : 'dash'), {'otid' : $(this).data('otid'), 'cid' : $('#j_i-cid').html()});
    });
})

function resetWindow() {
    $('#j_selcat').off('click').click(function() {
        _OPC = "#c_overlay-box "; 
        $('#c_overlay').fadeIn();
    }).click();
    $.ajax({url: '/managecatalog/a_loadWindow', headers: {'X-Requested-With': 'XMLHttpRequest'}, success: function (result) {
        $('#c_overlay-box').html(result);
    }, error: function (xhr) {
        showNotif("Error: " + xhr.status + " " + xhr.statusText);
        $('#c_overlay').fadeOut();
    }});
}