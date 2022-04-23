$(() => {
    var optlist = {};
    var optmode = '';
    var pics = [];
    var colorpics = {};
    generateForm('#j_dy-form', [
       {Visibility: {type: 'sel', nofill: true, opt: ['Listed', 'Unlisted'], span: 3}, Country: {type: 'sel', nofill: true, req: true, def: 'Country...', span: 3}},
       {StoreRootCategory: {type: 'sel', req: true, def: 'Root Category...', span: 2}, StoreSubcategory: {type: 'sel', req: true, def: 'Subcategory...', span: 2}, Currency: {type: 'sel', req: true, def: 'Currency...', span: 2}},
       {Title: {bound: 200, span: 4, req: true}, Subtitle: {bound: 200, span: 2}}, {Description: {type: 'desc', span: 6}}, 
       {Options: {type: 'sel', id: 'j_optmode', nofill: true, span: 6, opt: ['None', 'Color', 'Size', 'Color and Size']}}], 'j_f-broad');
    generateForm('#j_dy-form-det', [{SalePrice: {type: 'cur', nofill: true, req: true}, InStock: {nofill: true, num: true, req: true, bound: 'min:0'}}], 'j_f-opt')
    generateForm('#j_dy-form-opt', [{Color: {id: 'a_optColor', nofill: true, req: true}, Size: {id: 'a_optSize', nofill: true, req: true}}], 'j_f-opt')
    generateForm('#j_dy-form-prod', [{RootCategory: {type: 'sel', req: true}, Subcategory: {type: 'sel', req: true}, Brand: {}}, 
    {Name: {req: true}, UPC: {}, Materials: {}}, {PColor: {title: 'Color', ph: 'Color...'}, PSize: {title: 'Size', ph: 'Size...'}, StyleNo: {}}, {Specification: {}, UnitPrice: {type: 'cur', req: true}, Currency: {type: 'sel', opt: [], id: 'j_valcur'}}], 'j_f-opt')
    load('managecatalog');
    loadNav();
    loadImg(pics, '#j_selpic', '#a_picdisplay');
    loadSelProduct('#j_dprodbutton', displayDbProd);

    $('#j_valcur').change(function() {
        $('#j_dy-form-prod .j_i-LX-Currency').html($(this).val());
    });
    $('#j_broad').click(function() {
        if(checkEmptyFields($('[form="j_f-broad"]:required:enabled'), $('#j_err-broad'))) {
            var sum = $('#a_summarytable').html('<tr><td>Visibility</td><td>' + ($('#j_dy-form').find('[name="Visibility"]').val() ? 'Unlisted' : 'Listed') + '</td></tr>');
            $.each(['Country', 'StoreRootCategory', 'StoreSubcategory', 'Currency', 'Title', 'Subtitle'], function(i, item) {
                sum.append('<tr><td>' + sanitize(item) + '</td><td>' + $('#j_dy-form').find('[name="' + item + '"]').val() + '</td></tr>');
            });
            sum.append('<tr><td colspan="2"><b>Description</b></td></tr><tr><td colspan="2">' + $('#j_dy-form').find('[name="Description"]').val() + '</td></tr>');
            $('#a_ctdetails').prop('hidden', true);
            $('#a_summary').prop('hidden', false);
            $('#j_valcur').html($('#j_LX-Currency').html()).val($('#j_LX-Currency').val()).change().children().first().remove();
            if(optmode !== $('#j_optmode').val()) {
                $('#a_opttable tr:not(.c_table-head-pd)').remove();
                optlist = {};
                pics.length = 0;
                colorpics = {};
                $('#a_picdisplay').html('');
                $('#c_im-zoomedarea').prop('hidden', true);
                optmode = $('#j_optmode').val();
            }
            if(optmode) {
                $('#j_dy-form-opt td:first-child, #a_opt-head-color').prop('hidden', optmode === 'Size');
                $('#j_dy-form-opt td:last-child, #a_opt-head-size').prop('hidden', optmode === 'Color');
                if(optmode === 'Color') {
                    $('#a_prodoptname, #a_prodopt, #a_picupload, #a_addColorOption, #a_prodoptlist, #a_finalize').prop('hidden', false);
                    $('#j_submit').prop('disabled', !Object.keys(optlist).length);
                    $('#j_addColorOption').prop('disabled', !$('#a_prodsummary').data('pid'));
                } else {
                    $('#a_prodoptname, #a_prodopt, #a_addSizeOption, #a_finishSizeOption, #a_prodoptlist').prop('hidden', false);
                    $('#j_finishSizeOption').prop('disabled', !Object.keys(optlist).length);
                    $('#j_addSizeOption').prop('disabled', !$('#a_prodsummary').data('pid'));
                }
            } else
                $('#a_prodopt, #a_picupload, #a_finalize').prop('hidden', false);
        }
    });
    
    $('#j_backedit').click(function() {
        $('#a_ctdetails').prop('hidden', false);
        $('#j_submit').prop('disabled', false);
        $('.c_L-err, #a_summary, #a_prodoptname, #a_picupload, #a_prodopt, #a_prodoptlist, #a_finalize, #a_addColorOption, #a_addSizeOption, #a_finishSizeOption').prop('hidden', true);
    });
    $('#j_mprodbutton').click(function() {
        $('#a_prodsummary').prop('hidden', true).data('pid', 'new').removeData('spec');
        $('#j_e-det, #j_e-final').prop('hidden', true);
        $('#j_dy-form-prod').prop('hidden', false);
        $('#j_addColorOption, #j_addSizeOption').prop('disabled', false);
    });
    $('#j_selpic').click(function() {
        $('#j_e-pics, #j_e-final').prop('hidden', true);
    });
    $('#j_addColorOption').click(function() {
        var optrow = validateOption();
        if(!optrow) 
            return;
        var fpics = pics.filter(x => x);
        if(!fpics.length) {
            $('#j_e-pics, #j_e-newopt').prop('hidden', false);
            return;
        }
        optrow.pics = fpics;
        pics.length = 0;
        $('#a_picdisplay').html('');
        $('#c_im-zoomedarea').prop('hidden', true);
        optlist[sanitize(optrow.Color, 'lower')] = optrow;
        addOption(optrow);
    });
    $('#j_addSizeOption').click(function() {
        var optrow = validateOption();
        if(!optrow)
            return;
        if(optmode === 'Color and Size') {
            var Color = sanitize(optrow.Color, 'lower');
            if(!optlist[Color])
                optlist[Color] = {_pics: []};
            optlist[Color][optrow.Size] = optrow;
        } else 
            optlist[optrow.Size] = optrow;
        addOption(optrow);
    });

    var validateOption = () => {
        $('.c_L-err').prop('hidden', true);
        if(checkEmptyFields($('[form="j_f-opt"]:visible[required]'))) {
            var pid = $('#a_prodsummary').data('pid');
            if(!pid) {
                $('.j_e-newopt, #j_e-det').prop('hidden', false);
                return false;
            }
            var optrow;
            if(optmode === 'Color and Size') {
                var Color = $('#a_optColor').val();
                var Size = $('#a_optSize').val();
                if(optlist[sanitize(Color, 'lower')] && optlist[sanitize(Color, 'lower')][Size]) {
                    $('#j_e-name, .j_e-newopt').prop('hidden', false);
                    return false;
                }
                optrow = {pid, Color, Size};
            } else {
                var Attr = $('#a_opt' + optmode).val();
                if(optlist[sanitize(Attr, 'lower')]) {
                    $('#j_e-name, .j_e-newopt').prop('hidden', false);
                    return false;
                }
                optrow = {pid};
                optrow[optmode] = Attr;
            }
            if(pid !== 'new')
                optrow.spec = $('#a_prodsummary').data('spec');
            $('#j_dy-form-det, #j_dy-form-prod:visible').find('input, select').each(function() {
                if($(this).val())
                    optrow[$(this).prop('name')] = $(this).val();
            });
            return optrow;
        } else
            $('.j_e-newopt').prop('hidden', false);
        return false;
    }
    var deled = component('modify', 'edit', 'Edit', 'j_editopt') + component('modify', 'cancel', 'Delete', 'j_deleteopt');
    var addOption = (optrow) => {
        $('#a_opttable').append('<tr data-optname="' 
        + (optmode === 'Color and Size' ? optrow.Color + '" data-optsize="' + optrow.Size : optrow[optmode]) + '">' 
        + (optmode === 'Size' ? '' : '<td>' + optrow.Color + '</td>') + (optmode === 'Color' ? '' : '<td>' + optrow.Size + '</td>') +
        ['Name', 'Brand', 'StyleNo', 'SalePrice', 'InStock'].map(key => '<td>' + (optrow[key] || (optrow.spec && optrow.spec[key]) || 'N/A') + '</td>').join('') 
        + (optmode === 'Color' ? '<td>Pics: ' + optrow.pics.length + '</td>' : '')
        + '<td class="a_deled">' + deled + '</td></tr>');
        $('#j_dy-form-opt, #j_dy-form-det, #j_dy-form-prod').find('input, select:not(#j_valcur)').val('');
        $('#a_prodsummary').removeData(['pid', 'spec']);
        $('#a_prodsummary, #j_dy-form-prod').prop('hidden', true);
        $('#j_submit, #j_finishSizeOption').prop('disabled', false);
        showNotif('Option ' + (optmode === 'Color and Size' ? optrow.Color + ' (' + optrow.Size + ')' : optrow[optmode]) + ' added.');
        $('#j_add' + (optmode === 'Color' ? 'Color' : 'Size') + 'Option').prop('disabled', true);
    }
    $(document).on('click', '.j_editopt', function() {
        $('.c_L-err').prop('hidden', true);
        var optrow = deleteOption($(this).parents('tr'));
        if(optrow.pid === 'new')
            $('#j_mprodbutton').click();
        else
            displayDbProd(optrow.pid, optrow.spec);
        $('#j_dy-form-opt, #j_dy-form-det, #j_dy-form-prod:visible').find('input, select').each(function() {
            $(this).val(optrow[$(this).prop('name')] || '');
        });
        if(optrow.pics) {
            pics.length = 0;
            pics.push(...optrow.pics);
            displayPics(pics, '#a_picdisplay');
        }
    }).on('click', '.j_deleteopt', function() {
        deleteOption($(this).parents('tr'));
    });
    var deleteOption = (tr) => {
        var optrow;
        var optname = tr.data('optname');
        if(optmode === 'Color and Size') {
            optrow = optlist[optname][tr.data('optsize')];
            delete optlist[optname][tr.data('optsize')];
            if(Object.keys(optlist[optname]).length <= 1)
                delete optlist[optname];
        } else {
            optrow = optlist[optname];
            delete optlist[optname];
        }
        tr.remove();
        if(!Object.keys(optlist).length) 
            $('#j_submit, #j_finishSizeOption').prop('disabled', true);
        return optrow;
    }

    $('#j_finishSizeOption').click(function() {
        if(Object.keys(optlist).length) {
            $('#a_finishSizeOption, #a_prodopt, #a_prodoptname, #j_backedit').prop('hidden', true);
            $('#a_editSizeOption, #a_finalize').prop('hidden', false);
            $('#a_picupload').insertAfter('#a_prodoptlist').prop('hidden', false);
            $('.j_editopt, .j_deleteopt').remove();
            if(optmode === 'Color and Size') {
                $('#a_picsopt').html(Object.keys(optlist).map(color => '<tr><td>' + color + '</td><td style="vertical-align:middle"><a id="j_i-pcount-' 
                + color + '">0</a> picture(s) <button class="c_button-ir c_t_blue j_aepic" data-color="' 
                + color + '">Add/Edit Pictures</button></td></tr>').join(''));
                $('#a_pics').prop('hidden', true);
            }
        } else
            $('#j_e-opt').prop('hidden', false);
    });
    
    $(document).on('click', '.j_aepic', function() {
        $('.j_aepic, #j_editSizeOption, #j_submit').prop('disabled', true);
        $('#a_colorheading').prop('hidden', false).html('Pictures for color: ' + $(this).data('color'));
        $('#j_addColorPics').data('color', $(this).data('color'));
        pics.length = 0;
        pics.push(...optlist[$(this).data('color')]['_pics']);
        displayPics(pics, '#a_picdisplay');
        $('#a_pics, #a_addColorPics').prop('hidden', false);
    });
    
    $('#j_addColorPics').click(function() {
        var fpics = pics.filter(x => x);
        optlist[$(this).data('color')]['_pics'] = fpics;
        $('#j_i-pcount-' + $(this).data('color')).html(fpics.length).parents('tr').css('color', '');
        $('.j_aepic, #j_editSizeOption, #j_submit').prop('disabled', false);
        $('#a_colorheading').prop('hidden', true).html('');
        pics.length = 0;
        $('#a_picdisplay').html('');
        $('#a_pics, #a_addColorPics, #c_im-zoomedarea').prop('hidden', true);
    });
    
    $('#j_editSizeOption').click(function() {
        $('.c_L-err').prop('hidden', true);
        $('#a_finishSizeOption, #a_prodopt, #a_prodoptname, #j_backedit, #a_pics').prop('hidden', false);
        $('#a_editSizeOption, #a_finalize').prop('hidden', true);
        $('#a_picupload').insertBefore('#a_prodoptlist').prop('hidden', true);
        $('.a_deled').html(deled);
        $('#a_picsopt').html('');
    });
    
    $('#j_submit').click(() => {
        $('.c_L-err').prop('hidden', true);
        switch(optmode) {
            case 'Color and Size':
                var fail = false;
                Object.keys(optlist).forEach(color => {
                    if(optlist[color]['_pics'].length === 0) {
                        fail = true;
                        $('#j_i-pcount-' + color).parents('tr').css('color', 'red');
                    }
                });
                if(fail)
                    $('#j_e-pics, #j_e-final').prop('hidden', false);
                else {
                    var formData = new FormData($('#j_f-broad')[0]);
                    $.each(optlist, (color, optrow) => {
                        $.each(optrow['_pics'], (i, pic) => {
                            formData.append('pic_' + color + '_' + i, pic);
                        });
                        delete optlist[color]['_pics'];
                    });
                    formData.append('ctinfo', JSON.stringify(Object.keys(optlist).reduce((a, key) => {$.each(optlist[key], (i, row) => {a.push(row)}); return a}, [])));
                    ajaxSubmit('managecatalog/a_add', 'managecatalog', formData, '', 'POST', true);
                }
                break;
            case 'Size':
                var fpics = pics.filter(x => x);
                if(fpics.length) {
                    var formData = new FormData($('#j_f-broad')[0]);
                    formData.append('ctinfo', JSON.stringify(optlist));
                    $.each(pics, (i, pic) => {
                        formData.append('pic_' + i, pic);
                    });
                    ajaxSubmit('managecatalog/a_add', 'managecatalog', formData, '', 'POST', true);
                } else
                    $('#j_e-pics, #j_e-final').prop('hidden', false);
                break;
            case 'Color':
                if(Object.keys(optlist).length) {
                    var formData = new FormData($('#j_f-broad')[0]);
                    $.each(optlist, (color, optrow) => {
                        $.each(optrow.pics, (i, pic) => {
                            formData.append('pic_' + color + '_' + i, pic);
                        });
                        delete optlist[color].pics;
                    });
                    formData.append('ctinfo', JSON.stringify(optlist));
                    ajaxSubmit('managecatalog/a_add', 'managecatalog', formData, '', 'POST', true);
                } else
                    $('#j_e-final, #j_e-opt').prop('hidden', false);
                break;
            default: 
                if($('#a_prodsummary').data('pid')) {
                    var fpics = pics.filter(x => x);
                    if(fpics.length) {
                        if(checkEmptyFields($('[form="j_f-opt"]:visible[required]'), $('#j_e-final'))) {
                            var pid = $('#a_prodsummary').data('pid');
                            if(pid !== 'new')
                                $('#j_dy-form-prod').find('input, select').prop('disabled', true);
                            $('#j_dy-form-opt input').prop('disabled', true);

                            var formData = new FormData($('#j_f-broad')[0]);
                            formData.append('ctinfo', JSON.stringify([$('#j_f-opt').serializeArray().reduce((a,x) => {if(x.value) a[x.name] = x.value; return a;}, {pid})]))

                            $.each(fpics, function(i, pic) {
                                formData.append('pic_' + i, pic);
                            });
                            
                            ajaxSubmit('managecatalog/a_add', 'managecatalog', formData, '', 'POST', true);
                            
                            $('#j_dy-form-opt, #j_dy-form-prod').find('input, select').prop('disabled', false);
                            $('#j_LX-Subcategory').prop('disabled', !$('#j_LX-RootCategory').val());
                        }
                    } else {
                        $('#j_e-final, #j_e-pics').prop('hidden', false);
                    }
                } else {
                    $('#j_e-final, #j_e-det').prop('hidden', false);
                }
                break;
        }
    });
});

function displayDbProd(pid, spec) {
    $('#a_prodsummarytable').html('').html(Object.keys(spec).map(key => '<tr><td>' + key + '</td><td>' + spec[key] + '</td></tr>').join(''));
    $('#a_prodsummary').prop('hidden', false).data({pid, spec});
    $('#j_addColorOption, #j_addSizeOption').prop('disabled', false);
}