$(function() {
    const voidTn = () => {
        const match = $('#j_u-tn').val().match(/^[A-Za-z]{2}[0-9]{6,}$/);
        if(!match)
            setEmptyField($('#j_u-tn'));
        $('#trackingCodeErrorLabel').prop('hidden', match);  
        return !match;
    }
    $('#j_track').click(e => {
        e.preventDefault();
        if(voidTn())
            return;
        var tn = $('#j_u-tn').val();
        $('#j_i-tn').html(tn);
        $('#j_i-notn, #j_i-notfound, #a_trackinfo').prop('hidden', true);
        $('#j_tracktable > :not(#j_tracktable-head').remove();
        $('.j_load').prop('hidden', false);
        history.pushState({}, 'Track Package', '/tracking/package/' + tn);
        ajaxRequest('/tracking/a_track', ({data}) => {
            if(data.length) {
                $('#j_i-destination').html('Transport to ' + data[0]['CityName']);
                $('#j_i-delivered').prop('hidden', data[0]['PackageStatus'] !== 'Delivered');

                let prevDate = '';
                let currentStatus = data[0]['Status'];
                let currentTbody = [], trackData = [];
                const produceRow = () => {
                    trackData.unshift($('<tbody>', {class: 'a_tQrow'}).append(['<tr><td rowspan="' 
                    + (currentTbody.length + 2) + '"><img class="icon" src="' + _V_ASSETS 
                    + 'images/tracking/' 
                    + {'Ground China': 'icon-ground-china',
                    'Ground US': 'icon-ground-us',
                    'Customs': 'icon-customs',
                    'Flight To China': 'icon-flight',
                    'Label Ready': 'icon-label-ready'}[currentStatus] + '.png"></td>'
                    + '<td colspan="2"></td>'
                    + '<td rowspan="' + (currentTbody.length + 2) 
                    + '"><div class="timeline_line"></div></td><td colspan="4"></td></tr>', ...currentTbody, '<tr><td colspan="5"></td></tr>']));
                };
                $.each(data, (i, item) => {
                    const date = item['StatusTime'].split(' ');
                    if(date[0] === prevDate)
                        date[0] = '';
                    else
                        prevDate = date[0];
                    if(item['Status'] !== currentStatus) {
                        produceRow();
                        currentTbody = [];
                        currentStatus = item['Status'];
                    }
                    currentTbody.unshift('<tr>' + [date[0], 
                    '<div class="timelinedot"></div>', date[1], item['Activity'], item['Location']].map(entry => '<td>' + (entry || '') + '</td>').join('') + '</tr>');
                });
                produceRow();
                $('#j_tracktable').append(trackData);
                $('#a_trackinfo').prop('hidden', false);
            } else
                $('#j_i-notfound').prop('hidden', false);
        }, {tn});
    }); 
	$(window).on('resize', () => {
        $(".timeline_line").each(function(){
            var width = $(this).parent().parent().find(".j_tracktable_datecolumn").width() + 6;
            $(this).css("left", width + "px");
        });
    }).resize();
    $("#j_u-tn").focusout(voidTn);
    if($('#j_u-tn').val())
        $('#j_track').click();
});