$(function() {
    drawSearch({
        0: {viewAll: true, span: 2},
       OrderType: {type: 'sel', opt: ['Product Orders', 'Shipment Orders', 'Product Refunds', 'Package Refunds']},
       TotalQty: {type: 'num', bound: 'limdec:0'},
       TotalPrice: {type: 'num', prefix: '$', suffix: 'USD'},
       Currency: {type: 'sel', title: 'Payment Currency'},
       TrackingNumber: {title: '<span id="j_trackNumTitle" style="position: absolute; bottom: 0">Tracking #:</span>'},
       RecipientName: {},
       ShippingAddress: {type: 'address', span: 2},
       ProductTitle: {bound: 200, span: [1, 2]},
       RootCategory: {type: 'sel', title: 'Product Root Category'},
       Subcategory: {type: 'sel', title: 'Product Subcategory'},
       Status: {type: 'sel', opt: ['All', 'Awaiting Confirmation', 'Placed', 'Deleted']},
       CreateTime: {type: 'dt', horiz: true, span: 2}
    }, [
        ['OrderType', 'TotalQty', 'TotalPrice', 'Currency'],
        ['TrackingNumber', 'RecipientName', 'ShippingAddress'],
        ['ProductTitle', 'RootCategory', 'Subcategory', 'Status'],
        ['CreateTime', '_Search']
        ], [
        ['OrderType', 'Status'], ['TotalQty', 'TotalPrice'],
        ['TrackingNumber', 'RecipientName'], ['ShippingAddress'],
        ['ProductTitle'], ['RootCategory', 'Subcategory'],
        ['CreateTime'], ['_Search']
        ]);
   loadTable('orders');
   loadNav();
   _opNotifs = {'search' : '% orders found.'};
});