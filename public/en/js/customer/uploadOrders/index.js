$(function () {
    load('uploadOrders');
    loadNav();
    if ($('#j_i-notif').html().length)
        showNotif();
    $("#uploadButton").click(function () {
        uploadFile($('#uploadOrderFile')[0], function (numlistOrders) {
            uploadFile($('#uploadProductFile')[0], function (numlistProducts) {
                $.ajax({url: '/uploadOrders/a_uploadFiles', type: 'POST', headers: {'X-Requested-With': 'XMLHttpRequest'},
                    data: {'odinfo': numlistOrders, 'prinfo': numlistProducts}, success: function (result) {
                        if(parseAjaxResponse(result) !== false)
                            window.location = "/uploadOrders/orders";
                    }, fail: function (xhr) {
                        showNotif("Error: " + xhr.status + " " + xhr.statusText);
                    }});
            }, {cols: [0, 'Title', 'Price', 'Qty', null, 'ProductDetail', null, 'Remarks', 'Indic', 'SKU'], reset: false, skip: true, encoding: 'GBK', indic: "买家已付款，等待卖家发货"});
        }, {cols: [0, 'BuyerID', 'PaymentAccount', 'PaymentID', null, null, null, null, 'OrderStatus', null,
                null, null, null, 'BuyerMessage', 'Recipient', 'Address', null, null, 'Phone', 'OrderTime',
                'PayTime', null, null, null, null, 'OrderRemarks', null, null, 'StoreName', null,
                null, null, null, null, null, null, null, null, null, null,
                null, 'AddressAlt'], reset: false, skip: true});
    });
});