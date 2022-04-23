$(function() {
    drawSearch({
        0: {viewAll: true, span: [1,2]},
        Warehouse: {type: 'sel'},
        Transporter: {type: 'sel'},
        TrackingNumber: {title: 'Tracking #'},
        Username: {},
        Status: {type: 'sel', opt: ['Forecasted', 'All', 'All Received', 'Signed', 'Handled']},
        DeclaredWeight: {type: 'num', suffix: 'lb'},
        DeclaredVolume: {type: 'num', suffix: 'in^3'},
        ItemQty: {type: 'num', bound: 'limdec:0'},
        PackageQty: {type: 'num', bound: 'limdec:0'},
        CreateTime: {type: 'dt'},
        SignTime: {type: 'dt'},
        HandleTime: {type: 'dt'},
        ForecastID: {num: true, bound: 'limdec:0', title: 'Fc ID'},
        Signer: {},
        Handler: {}
    }, [
        ['Warehouse', 'Transporter', 'TrackingNumber', 'Username'],
        ['DeclaredWeight', 'DeclaredVolume', 'ItemQty', 'PackageQty'],
        ['CreateTime', 'SignTime', 'HandleTime', 'Status'],
        ['_assoc', 'ForecastID', 'Signer', 'Handler', '_Search']
        ], [
            ['Warehouse', 'Transporter'],
            ['Username', 'TrackingNumber'],
            ['DeclaredWeight', 'DeclaredVolume'],
            ['ItemQty', 'PackageQty'],
            ['CreateTime'], ['SignTime'], ['HandleTime'], ['Signer', 'Handler'], ['ForecastID', 'Status'], ['_Search']
            ]);
    loadNav();
    loadTable('manageforecasts');
});