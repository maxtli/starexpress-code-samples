$(() => {
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

    $('#j_exsel').click(function() {
        $('#c_overlay').fadeOut();
        _OPC = '';
    });
    $('#j_choisir').click(function() {
        _OPC = '';
        $('#c_overlay').fadeOut();
        $('#a_cid').prop('hidden', false);
        $('#j_complete').prop('disabled', false);
        $('#j_i-cid').html($('#c_overlay-box .selectbox:checked').val());
    });
})