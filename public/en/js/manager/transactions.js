$(() => {
    drawSearch({
        0: {span: [10,2]},
        AccountID: {num: true, bound: 'limdec: 0', span: [2,1]},
        Username: {span: [2,1]},
        Amount: {type: 'num', cur: true, span: [4,1]},
        Currency: {type: 'sel', span: [2,1]},
        
        CreateTime: {type: 'dt', horiz: true, span: [5,2]},
        CompleteTime: {type: 'dt', horiz: true, span: [5,2]},
        
        TransactionType: {type: 'sel', opt: ['All Payments', 'All Transactions', 'Deposits', 'Withdrawals', 
        'Exchanges', 'All Purchases', 'Package Purchases', 'Product Purchases', 'Package Fees', 'Refunds'], span: [2,2]},
        
        PaymentType: {type: 'sel', opt: ['All', 'Bank', 'Third-Party'], span: [2,2]},
        ApproveEmployee: {span: [2,1]},
        PaymentStatus: {type: 'sel', opt: ['Processing', 'All', 'Awaiting Deposit', 'Verified', 'Error', 'Expired'], span: [2,1]},
        
        CustomerCount: {type: 'num', span: [3,1]},
        AccountTransAmount: {type: 'num', cur: true, span: [4,1]},
        TransactionCap: {type: 'num', cur: true, span: [4,1]},
        LastReset: {type: 'dt', horiz: true, span: [5,2]},

        AccountName: {span: [2,1]},
        Bank: {span: [2,1]},
        AccountStatus: {type: 'sel', opt: ['Not deleted', 'All', 'Verified', 'Pending', 'Unverified', 'Deleted'], span: [2,1]},
        AccountNumber: {num: true, bound: 'maxlength: 20, limdec: 0', span: [3,1]},
        RoutingNumber: {num: true, bound: 'maxlength: 20, limdec: 0', span: [3,1]},
        SwiftNumber: {span: [2,1]},
        BankAddress: {type: 'address', span: [5,2]},
        
        CBank: {span: [2,1]},
        CAccountName: {span: [2,1]},
        CAccountNumber: {num: true, bound: 'maxlength: 20, limdec: 0', span: [3,1]},
        CRoutingNumber: {num: true, bound: 'maxlength: 20, limdec: 0', span: [3,1]},
        CSwiftNumber: {span: [2,1]},
        CBankAddress: {type: 'address', span: [5,2]},

        ThirdPartyPaymentService: {type: 'sel', span: [2,2]},
        AccountType: {type: 'sel', opt: ['All', 'Email', 'Phone'], span: [2,1]},
        EmailPhone: {span: [2,1]},
        CAccountType: {type: 'sel', opt: ['All', 'Email', 'Phone'], span: [2,1]},
        CEmailPhone: {span: [2,1]},

        }, [
            ['AccountID', 'Username', 'Amount', 'Currency'], ['CreateTime', 'CompleteTime'],
            ['TransactionType', 'PaymentType', 'PaymentStatus', 'AccountName', 'AccountStatus'], 
            ['CAccountName', 'AccountTransAmount', 'TransactionCap'],
            ['LastReset', 'CustomerCount', 'ApproveEmployee'],
            ['Bank', 'AccountNumber', 'RoutingNumber', 'SwiftNumber'],
            ['CBank', 'CAccountNumber', 'CRoutingNumber', 'CSwiftNumber'], ['BankAddress', 'CBankAddress'],
            ['ThirdPartyPaymentService', 'AccountType', 'EmailPhone', 'CAccountType', 'CEmailPhone'],
            ['_Search']
        ], [
            ['AccountID', 'Username'], ['Amount', 'Currency'],
            ['CreateTime'], ['CompleteTime'], ['TransactionType'],
            ['ApproveEmployee', 'PaymentStatus'], ['AccountName', 'AccountStatus'],
            ['CAccountName', 'CustomerCount'], ['AccountTransAmount', 'TransactionCap'], ['LastReset'],
            ['PaymentType'],
            ['Bank', 'SwiftNumber'], ['AccountNumber', 'RoutingNumber'], ['BankAddress'],
            ['CBank', 'CSwiftNumber'], ['CAccountNumber', 'CRoutingNumber'], ['CBankAddress'],
            ['ThirdPartyPaymentService'], ['AccountType', 'EmailPhone'], ['CAccountType', 'CEmailPhone'],
            ['_Search']
            ]);
    loadNav();
    loadTable('managetransactions');
});