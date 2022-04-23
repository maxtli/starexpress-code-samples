$(function() {
    load('account');
    loadNav();
    var menu = {msh : false, push: false};
    $('#announcementsbox').height(300);
    $(window).resize(function() {
        var width = $('.c_content').width();
        if(width <= 500) {
            $('.c_tab:not(#summaryheading)').css({display: 'block', margin: '5px 0', borderRadius: '0'});
            $('.actiontablerow').css({width: '100%'});
        } else
            $('.c_tab:not(#summaryheading), .actiontablerow').prop('style', '');
        if(width >= 725) {
            $('#middlebox').css({width: '66.5%', marginRight: '0'});
            $('#announcementsbox').css('width', '27%').height($('#middlebox').height());
        } else {
            $('#announcementsbox, #middlebox').css({width: '96%', marginRight: '2%'});
            $('#announcementsbox').height(400);
        }
        if(width <= 1000)
            $('#summaryheading').css({display: 'block', margin: '0'});
        else
            $('#summaryheading').prop('style', '');
        $('.j_row-xpand').prop('hidden', width >= 650);
        $('.j_col-lapse').prop('hidden', width < 650);
    });
    setTimeout(function() {
        $(window).resize();
    }, 100);
    $('.j_tab').click(function() {
        $('.c_box').prop('hidden', true);
        $('#j_G-box-' + $(this).data('key')).prop('hidden', false);
        if($('.c_content').width() >= 725)
            $('#announcementsbox').height($('#middlebox').height());
    });
    if($('.j_t-expand').length) {
        const depTicket = $('#depositticket');
        const listBox = $('#transactionlistbox');
        depTicket.on('click', '.j_t-expand', function() {
            var sibling = $(this).prop({hidden: true, disabled: true}).siblings('.j_t-collapse').prop({hidden: false});
            if(listBox.html().length) {
                listBox.show();
                const height = depTicket.height() - 24;
                listBox.hide();
                depTicket.animate({display: 'block', width: '96%', height}, 400, 'swing', function() {
                    depTicket.css('height', 'auto');
                    listBox.fadeIn(function() {
                        sibling.prop('disabled', false);
                    });
                });
                return;
            } 
            ajaxRequest('/account/a_findTransactions', function(result) {
                var transactionlist = listBox.append('<tr id="toptransactionrow"><td>Status</td>'
                + '<td>Create Time</td><td class="j_col-lapse">Your Payment Account</td><td>Amount</td></tr>');
                result = result['data'];
                $.each(result, function(i, item) { 
                    var row = $('<tbody class="transTb"></tbody>').html((item['Status'] === 'Processing' ? ('<tr><td>' + item['TransactionType'] + ': '
                        + (item['TransactionType'] === 'Deposit' ? 'waiting to receive deposit' : 'processing') + '</td><td>')
                        : '<tr><td>Deposit - needs your confirmation</td><td>') 
                        + item['CreateTime'] + '</td><td class="j_col-lapse">' 
                        + item['CustomerAccount'] + '</td><td>' + item['Amount'] + '</td></tr>');
                    var paymentaddress = $('<td></td>', {class: 'paymentaddressdisplay', colspan: '4'}).append('<div class="j_row-xpand" hidden><b>Your Payment Account</b>: ' + item['CustomerAccount'] + '</div>')
                    if(item['TransactionType'] === 'Deposit') {
                        paymentaddress.append((item['Status'] === 'Processing' ? 'Deposit payment made to:' : 'Please deposit the amount listed above from your payment account to:') + '<br>');
                        if(item['PaymentType'] === 'ThirdPartyPayment') {
                            paymentaddress.append((item['AccountName'] ? '<b>Account Name</b>: ' + item['AccountName'] + '<br>' : '') + '<b>Payment Address</b>: ' + item['PaymentAddress'] + ' (' + item['AccountType'] + ')' +'<br>');
                        } else {
                            paymentaddress.append('<b>Bank Name</b>: ' + item['BankName'] + '<br><b>Account Name</b>: ' + item['AccountName'] + '<br><b>Account Number</b>: ' + item['AccountNumber'] + '<br>' + 
                            (item['RoutingNumber'] ? '<b>Routing Number</b>: ' + item['RoutingNumber'] + '<br>' : '') + (item['SwiftNumber'] ? '<b>SWIFT Number</b>: ' + item['SwiftNumber'] + '<br>' : '')
                            + '<b>Bank Address</b>: ' + generateAddress(item) + '<br>');
                        }
                        if(item['Status'] === 'Awaiting Deposit')
                            paymentaddress.append($('<button class="c_button-ir confirmdepositbutton c_t_yellow">Confirm deposit</button>').data('id', item['ID'])).append(
                                $('<button class="c_button-ir canceldepositbutton c_t_red">Cancel deposit</button>').data('id', item['ID']));
                    }
                    row.append($('<tr></tr>').append(paymentaddress));
                    transactionlist.append(row);
                });
                $(window).resize();
                listBox.show();
                const height = depTicket.height() - 24;
                listBox.hide();
                depTicket.animate({display: 'block', width: '96%', height}, 400, 'swing', function() {
                    depTicket.css('height', 'auto');
                    listBox.fadeIn(function() {
                        sibling.prop('disabled', false);
                    });
                });
            });
        }).on('click', '.j_t-collapse', function() {
            var sibling = $(this).prop({hidden: true, disabled: true}).siblings('.j_t-expand').prop({hidden: false});
            depTicket.css('display', 'inline-block');
            const origHeight = depTicket.height();
            depTicket.height(origHeight);
            listBox.fadeOut(function() {
                const width = depTicket.css({width: 'auto', height: 'auto'}).width() + 24;
                const height = depTicket.height() + 19;
                depTicket.css({width: '96%', height: origHeight}).animate({width, height}, 400, 'swing', function() {
                    depTicket.css({width: 'auto', height: 'auto'})
                    sibling.prop('disabled', false);
                });
            });
        }).on('click', '.confirmdepositbutton, .canceldepositbutton', function() {
            ajaxRequest('/transactions/a_depAction' + ($(this).is('.canceldepositbutton') ? 'delete' : ''), function() {
                location.reload();
            }, {'tsid' : $(this).data('id')});
        });
    }
});