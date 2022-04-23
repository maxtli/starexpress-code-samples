$(function() {
    var colpics = {};
    var pics = [];
    var deletes = [];
    var picChanges = {};
    var itd;
    generateForm('#j_dy-form-prod', [{RootCategory: {type: 'sel', req: true}, Subcategory: {type: 'sel', req: true}, Brand: {}}, 
    {ProductName: {req: true}, UPC: {}, Materials: {}}, {Color: {}, Size: {}, StyleNo: {}}, {Specification: {}, Value: {type: 'cur', req: true}, Currency: {type: 'sel', opt: [], id: 'j_valcur'}}], 'j_f-opt');
    loadImg(pics, '#j_selpic', '#a_picdisplay');
    $('#j_valcur').change(function() {
        $('#a_newprodcont .j_i-LX-Currency').html($(this).val());
    });
    loadSelProduct('#j_dprodbutton', function(PID, spec) {
        $('#a_newprodcont').prop('hidden', true);
        const sopt = $('.a_tgtopt');
        if(PID === sopt.data('odet').PID) {
            sopt.find('.j_resetOpt').click();
        }
        spec = {PID, ProductName: spec['Name'], StyleNo: spec['Style Code'], Value: spec['Price'], ...spec};
        sopt.data({ndet: spec, npid: PID}).find('.j_resetOpt, .a_edithist').prop('hidden', false);
        $('#a_optdetNew').html(tbfill(spec)).parent().css('display', 'inline-block');
    });
    loadNav();

    $('#a_summarytable').css({
        width: 'auto',
        margin: 'auto'
    });
    $('#bm0_edit').click(() => {
        if($('#c_menu-L:visible').length)
            $('#j_nav').click();
        $('#c_overlay2').prop('hidden', false);
        $('#a_editcat').css({top: '100%', bottom: '-100%'}).prop('hidden', false).animate({top: '160px', bottom: '0'}, 500).children('.j_load').prop('hidden', false);
        $('#j_toCountry').html($('#j_LX-Country').html()).children().eq(0).remove();
        $('#j_toCurrency, #j_valcur').html($('#j_LX-Currency').html()).children(':first-child').remove();
        toggleMenu();
        
        $('#a_newprodcont .j_i-LX-Currency').css('display', 'inline-block').html($('#j_valcur').val());


        itd = $('.selectbox:checked').parents('.t_Qrow').data('details');
        $('#j_edF-Category').html(itd.RootCategory + ' > ' + itd.HomeCategory);
        ['Title', 'SubTitle', 'Description', 'Country', 'Currency', 'Display'].forEach(key => $('#j_edF-' + key).html(itd[key]).siblings().eq(0).val(itd[key]));
        $('#a_optlist').html(itd.SetII.map((opt, i) => 
            '<div class="c_box-f a_selopt c_t_red" data-coid="' + opt['COID'] + '" data-index="' + i + '"><button class="c_button j_resetOpt" hidden>Reset</button><div class="c_L-step"><div class="s_stext">Option: <a style="font-weight:400">' + opt['OptName'] + '</a></div><div class="s_stext">' + opt['Price'] 
            + (opt['DiscountPrice'] ? ' (' + opt['DiscountPrice'] + ')' : '') + '</div></div><div><div class="s_stext"><b>In Stock</b>: '
            + opt['InStock'] + '</div><b>Last Sold</b>: ' + (opt['LastBought'] || 'N/A') + '<div class="s_stext"><b>Total Sold</b>: ' + opt['SoldQty'] 
            + '</div></div><div class="c_hline"><a class="c_L-err a_edithist" hidden>Product changed</a></div></div>'
            + '</div>'));
        $('.a_selopt').each(function () {
            $(this).data('odet', itd.SetII[$(this).data('index')]);
        });
        
        colpics = {};
        picChanges = {};
        ajaxRequest('/managecatalog/a_findPictures', data => {
            colpics = data['Pics'];
            if(data['Mode']) {
                $('#a_picupload').data('standard-opt', false);
                $('#a_picsopt').html(Object.keys(colpics).map(color => '<tr><td>' + color + '</td><td style="vertical-align:middle"><a id="j_i-pcount-' 
                + color + '">' + colpics[color].length + '</a> picture(s) <button class="c_button-ir c_t_blue j_aepic" data-color="' 
                + color + '">Edit Pictures</button></td></tr>').join(''));
                colpics = data['Pics'];
                 $('#a_pics').prop('hidden', true);
            } else {
                $('#a_picupload').data('standard-opt', true);
                colpics.forEach((path, i) => {
                    $('<img>', {class: 'c_im-g j_im-bf', src: path}).appendTo($('<div>', {class: 'c_im-frame'})
                    .html('<button class="c_button c_im-remove j_im-remove-bf c_t_red">X</button><button class="c_button c_im-zoom c_t_blue">Zoom</button>')
                    .data('bfpos', i).appendTo($('#a_picdisplay')))
                })
                $('#a_pics').prop('hidden', false);
            }
        }, {'cid' : itd.CID});
    });
    $(document).on('click', '.j_aepic', function() {
        const color = $(this).data('color');
        $('.j_aepic, #j_svedit').prop('disabled', true);
        $('#j_e-pics').prop('hidden', true);
        $('#a_colorheading').prop('hidden', false).html('Pictures for color: ' + color);
        $('#j_addColorPics').data('color', color);
        
        pics.length = 0;
        deletes = picChanges[color] ? picChanges[color].deletes : [];
        
        colpics[color].forEach((path, i) => {
            if(!deletes.includes(i))
                $('<img>', {class: 'c_im-g j_im-bf', src: path}).appendTo($('<div>', {class: 'c_im-frame'})
                .html('<button class="c_button c_im-remove j_im-remove-bf c_t_red">X</button><button class="c_button c_im-zoom c_t_blue">Zoom</button>')
                .data('bfpos', i).appendTo($('#a_picdisplay')))
        })

        if(picChanges[color]) {
            pics.push(...picChanges[color].fpics);
            displayPics(pics, '#a_picdisplay');
        }
        $('#a_pics, #a_addColorPics').prop('hidden', false);
    }).on('click', '.j_im-remove-bf', function() {
        deletes.push($(this).parent().data('bfpos'));
        $(this).parent().remove();
        $('#j_im-min').click();
    });
    
    $('#j_addColorPics').click(function() {
        const color = $(this).data('color');
        const fpics = pics.filter(x => x);
        if(!fpics.length && deletes.length >= colpics[color].length) {
            $('#j_e-pics').prop('hidden', false);
            return;
        }
        
        $('#j_e-pics').prop('hidden', true);
        picChanges[color] = {deletes, fpics};
        
        $('#j_i-pcount-' + color).html(fpics.length).parents('tr').css('color', '');
        $('.j_aepic, #j_svedit').prop('disabled', false);
        $('#a_colorheading').prop('hidden', true).html('');

        $('#a_picdisplay').html('');
        $('#a_pics, #a_addColorPics, #c_im-zoomedarea').prop('hidden', true);

        pics.length = 0;
        deletes.length = 0;
    });

    $('#j_hidenewprod').click(function() {
        $('#a_newprodcont').prop('hidden', true);
    })
    $('#j_savenewprod').click(function() {
        if(checkEmptyFields($('#j_dy-form-prod').find('input:required, select:required'))) {
            const sopt = $('.a_tgtopt').data({npid: 'new', ndet: $('#j_f-opt').serializeArray().reduce((a,x) => {a[x.name] = x.value; return a}, {})});
            sopt.find('.j_resetOpt, .a_edithist').prop('hidden', false);
            $('#a_optdetNew').html(tbfill(sopt.data('ndet'))).parent().css('display', 'inline-block');
            $('#j_dy-form-prod').find('input, select:not(#j_valcur)').val('').change();
            $('#j_hidenewprod').click();
        }
    });
    $('#j_mprodbutton').click(function() {
        $('#a_newprodcont').prop('hidden', false);
    });
    $('#a_editcat').on('click', '.j_resetOpt', function(e) {
        const sopt = $(this).prop('hidden', true).parents('.a_selopt').removeData(['ndet', 'npid']);
        if(sopt.data('sel'))
            sopt.click();
        sopt.find('.a_edithist').prop('hidden', true);
        e.stopPropagation();
    });
    const rm = $('#a_edoptRm');
    const tbfill = opt => ['PID', 'ProductName', 'Brand', 'Color', 'Size', 'UPC', 'StyleNo', 'Materials', 'Specification', 'Value'].map(col => '<tr><td>' + sanitize(col) + '</td><td>' + (opt[col] || 'N/A') + '</td></tr>').join('')
    $('#a_editcat').on('mouseover', '.a_selopt', function() {
        switchTheme($(this), 'yellow');
    }).on('mouseout', '.a_selopt', function () {
        if(!$(this).data('sel'))
            switchTheme($(this));
    }).on('click', '.a_selopt', function() {
        const sel = $(this).data('sel');
        rm.prop('hidden', true);
        switchTheme($('.a_selopt').removeData('sel').removeClass('a_tgtopt'));
        $('#a_newprodcont').prop('hidden', true);
        if(!sel) {
            switchTheme($(this), 'yellow');
            $(this).data('sel', true).addClass('a_tgtopt').after(rm.prop('hidden', false));
            const ndet = $(this).data('ndet');
            $('#a_optdetNew').html(ndet ? tbfill(ndet) : '').parent().css('display', ndet ? 'inline-block' : 'none');
            $('#a_optdetOld').html(tbfill($(this).data('odet')));
        }
    });
    $('.j_edFmain, .j_edFclear').click(function () {
        $(this).prop('hidden', true).siblings().prop('hidden', false);
        var tf = $(this).is('.j_edFclear');
        $(this).parents('tr').find('.j_edFinput').prop({hidden: tf, disabled: tf});
        $(this).parents('tr').children().eq(1).children('a').prop({hidden: !tf});
    });
    $('#j_svedit').click(e => {
        if(checkEmptyFields($('.j_edFinput:visible'))) {
            var attrs = {};
            $('.j_edFinput:visible').each(function () {
                if($(this).val() !== $(this).siblings('a').html())
                    attrs[$(this).prop('name')] = $(this).val();
            });
            var optChanges = {};
            $('.a_selopt').each(function () {
                if($(this).data('npid'))
                    optChanges[$(this).data('coid')] = [$(this).data('npid'), $(this).data('ndet')];
            });
            var formdata = new FormData();
            var standardOpt = $('#a_picupload').data('standard-opt');
            if(standardOpt) {
                var fpics = pics.filter(x => x);
                if(!fpics.length && deletes.length >= colpics.length) {
                    $('#j_e-pics').prop('hidden', false);
                    e.stopPropagation();
                    return;
                }
                $('#j_e-pics').prop('hidden', true);
                if(deletes.length || fpics.length) {
                    picChanges = {deletes, fpics: fpics.length};
                    $.each(fpics, (j, pic) => {
                        formdata.append('pic_' + color + '_' + j, pic);
                    });
                }
            } else if (Object.keys(picChanges).length) {
                $.each(picChanges, (color, item) => {
                    $.each(item.fpics, (j, pic) => {
                        formdata.append('pic_' + color + '_' + j, pic);
                    });
                    picChanges[color].fpics = item.fpics.length;
                });
            }
            if(Object.keys(attrs).length || Object.keys(optChanges).length || Object.keys(picChanges).length) {
                formdata.append('cid', itd.CID);
                if(Object.keys(attrs).length)
                    formdata.append('attrs', JSON.stringify(attrs));
                if(Object.keys(optChanges).length)
                    formdata.append('opts', JSON.stringify(optChanges));
                ajaxRequest('/managecatalog/a_edit', function({data}) {
                    showNotif('Catalog item edited successfully.');
                    refreshTable('search', {CID: data, Visibility: 'All'});
                    _bottommenuenabled = true;
                }, formdata, 'POST', true);
            } else
                toggleMenu(true);
        } else
            e.stopPropagation();
    });
    $('#j_exedit, #j_svedit').click(() => {
        $('.j_edFclear:visible').click();
        $('#c_overlay2, #a_addColorPics, #j_e-pics').prop('hidden', true);
        $('#a_optlist, #a_picsopt').html('');
        $('#a_picupload').removeData('standard-opt');
        $('#a_editcat').animate({top: '100%', bottom: '-100%'}, 500, function() {
            $(this).prop('hidden', true);
        });
    });
    $('#j_exedit').click(() => {toggleMenu(true);});
});

function configureMenu (checkCount) {
    $('#bm0_edit').prop('disabled', checkCount > 1);
}

