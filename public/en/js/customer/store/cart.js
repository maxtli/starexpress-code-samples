$(() => {
    load('cart');
    const recalcTotal = () => {
        $('#j_i-total').html(($($('.a_tgtitem').length ? '.a_tgtitem' : '.a_cartitem')
        .map((i, item) => $(item).data('qty') * $(item).data('price')).get().reduce((acc, cur) => acc + cur) / 100).toFixed(2));
    }; 
    const toggleItem = () => {
        const len = $('.a_tgtitem').length;
        switchTheme($('#j_checkout').html(len ? 'Checkout selected' : 'Checkout all'), len ? 'yellow' : 'purple');
        $('#j_remove').prop('disabled', !len);
        $('#j_checkout').prop('disabled', $(len ? '.j_overfill.a_tgtitem': '.j_overfill').length);
        recalcTotal();
    };
    const cancelQty = saveQty => {
        saveQty.prop('hidden', true).siblings('.E-itemqty').prop('hidden', true)
        .siblings('.j_editqty').prop('hidden', false).siblings('.a_qtydisplay').children('.j_i-itemqty').prop('hidden', false);
    }
    $(document).on('click', '.a_cartitem', function(e){
        if($(e.target).is('input, button'))
            return;
        $(this).is('.a_tgtitem') ? $(this).removeClass('a_tgtitem') : $(this).addClass('a_tgtitem');
        toggleItem();
    }).on('click', '#j_selAll', function(){
        const mode = $(this).data('mode');
        if(mode)
            $('.a_cartitem').removeClass('a_tgtitem');
        else 
            $('.a_cartitem').addClass('a_tgtitem');
        $(this).html(mode ? 'Select all' : 'Deselect all').data('mode', !mode);
        toggleItem();
    }).on('click', '.j_editqty', function() {
        $(this).siblings('.j_saveqty, .E-itemqty').prop('hidden', false);
        $(this).prop('hidden', true).siblings('.a_qtydisplay').children('.j_i-itemqty').prop('hidden', true);
    }).on('click', '.j_saveqty', function() {
        const saveQty = $(this);
        if(checkEmptyFields(saveQty.siblings('.E-itemqty'))) {
            const qty = saveQty.siblings('.E-itemqty').val();
            if(qty === saveQty.parents('.a_cartitem').data('qty').toString())
                cancelQty(saveQty);
            else
                ajaxRequest('/cart/a_editQty', result => {
                    cancelQty(saveQty);
                    saveQty.siblings('.a_qtydisplay').children('.j_i-itemqty').html(qty)
                    .parents('.a_cartitem').removeClass(['j_overfill', 'c_t_red']).addClass('c_t_blue').data('qty', qty).find('.j_err-overfill').remove();
                    recalcTotal();
                }, {qty, scid: $(this).parents('.a_cartitem').data('scid')});
        }
    }).on('click', '#j_remove', function() {
        ajaxRequest('/cart/a_remove', () => {
            $('.a_tgtitem').remove();
            toggleItem();
        }, {'scinfo' : $('.a_tgtitem').map((i, item) => [[$(item).data('scid')]]).get()}, 'POST');
    }).on('click', '#j_checkout', () => {
        if($('.a_tgtitem').length) {
            $('<form>', {action: '/cart/checkout', method: 'POST', hidden: true})
            .html($('.a_tgtitem').map((i, item) => '<input name="scinfo[' + i + '][0]" value="' + $(item).data('scid') + '">').get().join('')).appendTo('body').submit();
        } else
            window.location = '/cart/checkout';
    });
    toggleItem();
});