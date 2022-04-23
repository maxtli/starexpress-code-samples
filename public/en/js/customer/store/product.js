$(function() {
    $(window).resize(() => {
        const mobile = window.innerWidth < 700;
        $('#j_ctg-order, #j_ctg-account').prop('hidden', mobile);
        $('#j_addcart').appendTo(mobile ? $('#j_ctg-add') : $('#a_prodaction'));
        $('#j_ctg-add').prop('hidden', !mobile);
    }).resize();
    $('.c_content').on('mouseover', '.a_imicon', function() {
        $('#a_imdisplay').prop('src', $(this).prop('src'));
    });
    let selectedColor = '';
    let selectedSize = '';
    const details = JSON.parse($('#j_i-data').html());
    $('.j_coloropt').click(function() {
        $('#a_cart').prop('hidden', true);
        $('.j_coloropt').prop('style', '');
        $(this).css('background', 'var(--shade2)');
        const option = details.Options[$(this).data('color')];
        selectedColor = $(this).data('color');
        if(details.OptionType === 'ColorSize') {
            $('.j_sizeopt').prop('style', '').prop('disabled', true);
            $.each(option, function(i, item) {
                $('#j_size-' + details.Sizes[item.Size]).prop('disabled', item.InStock == false);
            });
            var sizebuttons = $('.j_sizeopt:enabled');
            $('#j_buyqty, #j_addcart').prop('disabled', !sizebuttons.length);
            if(sizebuttons.length)
                sizebuttons.first().click();
        } else   
            displayOption(option, details.CurrencyPrefix);
        loadImages(option.Pics);
    });
    $('.j_sizeopt').click(function() {
        $('#a_cart').prop('hidden', true);
        selectedSize = $(this).data('size');
        $('.j_sizeopt').prop('style', '');
        $(this).css('background', 'var(--shade2)');
        displayOption((details.OptionType === 'ColorSize' ? details.Options[selectedColor] : details.Options)[selectedSize], details.CurrencyPrefix);
    });
    if(details.OptionType === 'None') {
        displayOption(details.Options[0], details.CurrencyPrefix);
        loadImages(details.Pics);
    } 
    else if (details.OptionType === 'Size') {
        $.each(details.Options, function(i, item) {
            if(item.InStock)
                $('#j_size-' + i).prop('disabled', false);
        });
        $('.j_sizeopt:enabled').first().click();
        loadImages(details.Pics);
    } else
        $('.j_coloropt:enabled').first().click();

    $('#j_addcart').click(() => {
        if(checkEmptyFields($('#j_buyqty'))) {
            const coid = (() => {
                switch (details.OptionType) {
                    case 'None': return details.Options[0];
                    case 'Color': return details.Options[selectedColor];
                    case 'Size': return details.Options[selectedSize];
                    case 'ColorSize': return details.Options[selectedColor][selectedSize];
                }
            })()['COID'];
            ajaxRequest('/catalog/a_addCart/' + coid, result => {
                window.location = result['data'] ? '/cart?success=true' : '/login?redir=catalog/product/' + details.CID;
            }, {qty: $('#j_buyqty').val()});
        }
    });
});

function displayOption(option, currency) {
    const cartq = (JSON.parse($('#j_i-cart').html()) || [])[option.COID] || 0;
    $('#a_standardprice, #a_discountprice').prop('hidden', true);
    $('#j_i-saleprice, #j_i-regprice, #j_i-standardprice').html('');
    if(option.DiscountPrice) {
        $('#a_discountprice').prop('hidden', false);
        $('#j_i-saleprice').html(currency + option.DiscountPrice);
        $('#j_i-regprice').html(currency + option.SalePrice);
    } else {
        $('#a_standardprice').prop('hidden', false);
        $('#j_i-standardprice').html(currency + option.SalePrice);
    }
    if(cartq) {
        $('#j_i-cartqty').html(cartq);
        $('#a_cart').prop('hidden', false);
        $('#j_addcart').prop('disabled', cartq >= option.InStock);
    }
    $('#j_i-stock').html(option.InStock);
    $('#j_buyqty').off('input').on('input', function() {
        numberBoundCheck(this, {min: 1, max: option.InStock - cartq});
    }).trigger('input');
}

function loadImages(imgsrc) {
    $('#a_imother').html('');
    if(imgsrc && imgsrc[0]) {
        $('#a_imdisplay').prop('src', imgsrc[0]);
        $.each(imgsrc, function(i, item) {
            $('#a_imother').append('<img class="a_imicon" src="' + item + '">');
        });
    } else
        $('#a_imdisplay').prop('src', _V_ASSETS + 'images/catalog/productpicmissing.png');    
}