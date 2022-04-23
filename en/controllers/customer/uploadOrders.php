<?php

class UploadOrders extends Controller {
    
    use SearchListController;
    
    function __construct() {
        parent::__construct();
        $this->fn_checkCustomerCredentials('uploadOrders');
        $this->view->pageDetails = array(
            'title' => 'Upload Orders',
            'css' => ['innerstyles.css', 'customer/uploadOrders.css'],
            'js' => 'customer/uploadOrders/index.js');
        $this->SLC = 'od';
    }

    function index() {
        $this->view->render('customer/uploadOrders/index.php');
    }

    function orders() {
        Session::unsets(['uploadorderstandard', 'uploadordermerge', 'uploadordersplit']);
        if (Session::get('displayOrderData')) {
            $this->view->balance = $this->model->getBalance($this->uid[0]);
            $this->view->pageDetails['js'] = ['table.js', 'customer/uploadOrders/table.js'];
            $this->view->render('customer/uploadOrders/orders.php');
        } else {
            $this->view->notif = 'orders';
            $this->index();
        }
    }
    
    function a_uploadFiles() {
        Session::unsets(["displayOrderData", 'uploadorderstandard', 'uploadordermerge', 'uploadordersplit']);
        $this->SLC = 'pr';
        $prinfo = $this->fn_validateOperation('productfile', 
        [0, 'Title', 'Price', 'Qty', 'ProductDetail', 'Remarks', 'SKU'], [0, 'Title', 'Price', 'Qty'], ['nopage' => true, 'dupl' => true]);
        $this->SLC = 'od';
        $oinfo = $this->fn_validateOperation('orderfile', 
        [0, 'BuyerID', 'PaymentAccount', 'PaymentID', 'OrderStatus', 'BuyerMessage', 'Recipient', 'Address', 'Phone', 'OrderTime', 'PayTime', 'OrderRemarks', 'StoreName', 'AddressAlt'],
        [0, 'BuyerID', 'Recipient', 'Address', 'Phone', 'OrderTime', 'PayTime', 'StoreName'], ['nopage' => true]);
        $displayOrderData = [];
        foreach ($prinfo as $key => $product) {
            foreach ($oinfo as $order)
                if ($product[0] === $order[0]) {
                    if (strpos($order[25], '555') !== false) 
                        continue 2;
                    unset($order[0]);
                    $displayOrderData[] = array_merge($product, $order);
                    continue 2;
                }
            Utils::error('Some products did not have matching orders.');
        }
        if (empty($displayOrderData))
            Utils::error('No orders are ready at this time.');
        Session::set('displayOrderData', $displayOrderData);
    }
    
    function fn_validateOrderFile($row) {
        $row['OrderTime'] = Utils::validate([$row['OrderTime'], 'Y-m-d H:i:s'], 'date');
        $row['PayTime'] = Utils::validate([$row['PayTime'], 'Y-m-d H:i:s'], 'date');
        $row['WaitPeriodElapsed'] = strtotime($row['PayTime']) < strtotime("-1 day");
        $address = $row['AddressAlt'] ?: $row['Address'];
        $row['Address'] = substr_count($address, ' ') < 2 ? Utils::error('4') : $address;
        unset($row['AddressAlt']);
        return $row;
    }

    function fn_validateProductFile($row) {
        $row['Qty'] = Utils::validate($row['Qty'], 'qty');
        return $row;
    }
    
    function a_search() {
        $orders = Session::get('displayOrderData');
        Session::unsets(['uploadorderstandard', 'uploadordermerge', 'uploadordersplit']);
        if (empty($orders))
            Utils::error('No orders uploaded.');
        $sq = $this->fn_validateSearch(array('all', 'OrderID', 'BuyerID', 'StoreName', 'SKU', 'Title', 'ProductDetail', 'Recipient', 
        'Address', 'Phone', 'Remarks', 'OrderRemarks', 'BuyerMessage', 'OrderStatus', 'PaymentAccount', 'PaymentID', 'WaitPeriodElapsed', 'search'), 
        ['OrderTimemin', 'OrderTimemax', 'PayTimemin', 'PayTimemax'], ['Price', 'Qty']);
        if (empty($sq))
            return ['count' => count($orders), 'data' => array_slice($orders, 0, Session::get('perPage') ?: 25)];
        $extra = [];
        foreach (['OrderTimemin', 'OrderTimemax', 'PayTimemin', 'PayTimemax', 'Pricemin', 'Pricemax', 'Qtymin', 'Qtymax'] as $key) {
            if(isset($sq[$key])) {
                $extra[$key] = $sq[$key];
                unset($sq[$key]);
            }
        }
        $orderRows = [];
        foreach ($orders as $order) {
            foreach ($sq as $key => $item)
                if (is_null($order[$key]) || $order[$key] != $item)
                    continue 2;
            foreach ($extra as $key => $item)
                if (!($order[substr($key, 0, -3)] == $item || (substr($key, -3) === 'min') === ($order[substr($key, 0, -3)] > $item)))
                    continue 2;
            $orderRows[] = $order;
        }
        return ['count' => count($orderRows), 'data' => $orderRows];
    }

    function a_page($pageNo = 0) {
        $orders = Session::get('displayOrderData');
        Session::unsets(['uploadorderstandard', 'uploadordermerge', 'uploadordersplit']);
        $intPageNo = intval($pageNo);
        if (empty($orders) || empty($intPageNo))
            Utils::error();
        $perPage = Session::get('perPage') ?: 25;
        return ['data' => array_slice($orders, ($intPageNo - 1) * $perPage, $perPage)];
    }
    
    function a_prepareStandard() {
        $orders = Session::get('displayOrderData') ?: Utils::error('Empty');
        Session::unsets(['uploadorderstandard', 'uploadordermerge', 'uploadordersplit']);
        $warehouse = $this->model->getIdByName('Warehouses', $_POST["warehouse"] ?: Utils::error('Empty'));
        $currency = $this->model->getCurrency($_POST['Currency'] ?: Utils::error('Empty'));
        $currency = $currency['ID'];
        $oinfo = $this->fn_validateOperation('standard', [0, 1, 'Category', 'DeclaredWeight', 'DeclaredVolume'], [0, 1, 'Category', 'DeclaredWeight'], ['nopage' => true]);
        $pricelist = $this->model->getPriceStandard($warehouse, $currency, $oinfo) ?: Utils::error();
        Session::set('uploadorderstandard', ['Warehouse' => $warehouse, 'Currency' => $currency, 'Price' => $pricelist['TotalPrice'], 
        'ExcPrice' => $pricelist['ExcPrice'] ?: false, 'WarehouseCurrency' => $pricelist['WarehouseCurrency'] ?: false, 'odinfo' => $pricelist['Orders']]);
        return ['data' => $pricelist];
    }

    function fn_validateStandard($row) {
        $orders = Session::get('displayOrderData');
        $row[0] = Utils::validate($row[0], 'index');
        $row['DeclaredWeight'] = Utils::validate($row['DeclaredWeight'], 'qty');
        $row['Category'] = $this->model->getIdByName('HomeCategories', $row['Category']);
        if (!$orders[$row[0]] || $row[1] !== $orders[$row[0]][0])
            Utils::error();
        if($row['DeclaredVolume'])
            $row['DeclaredVolume'] = Utils::validate($row['DeclaredVolume'], 'qty');
        $row['Info'] = $orders[$row[0]];
        return $row;
    }

    function a_prepareMerge() {
        $orders = Session::get('displayOrderData') ?: Utils::error('Empty');
        Session::unsets(['uploadorderstandard', 'uploadordermerge', 'uploadordersplit']);
        $warehouse = $this->model->getIdByName('Warehouses', $_POST["warehouse"] ?: Utils::error('Empty'));
        $currency = $this->model->getCurrency($_POST['Currency'] ?: Utils::error('Empty'));
        $currency = $currency['ID'];
        $combinedWeight = Utils::validate($_POST['weightGroup'], 'qty');
        $combinedVolume = $_POST['volumeGroup'] ? Utils::validate($_POST['volumeGroup'], 'qty') : false;
        $oinfo = $this->fn_validateOperation('mergesplit', [0, 1, 'Category'], [0, 1, 'Category'], ['nopage' => true, 'firstrow' => true]);
        $pricelist = $this->model->getPrice($warehouse, $currency, Utils::sanitize(array_column($oinfo, 'Category'), 'idopt'), $combinedWeight) ?: Utils::error();
        Session::set('uploadordermerge', ['Warehouse' => $warehouse, 'Currency' => $currency, 'Weight' => $combinedWeight, 'Volume' => $combinedVolume, 'Price' => $pricelist['TotalPrice'], 
        'ExcPrice' => $pricelist['ExcPrice'] ?: false, 'WarehouseCurrency' => $pricelist['WarehouseCurrency'] ?: false, 'odinfo' => $oinfo]);
        return ['data' => $pricelist];
    }
    
    function fn_validateMergeSplit($row, $firstindex) {
        $orders = Session::get('displayOrderData');
        $row[0] = Utils::validate($row[0], 'index');
        $row['Category'] = $this->model->getIdByName('HomeCategories', $row['Category']);
        if (!($orders[$row[0]] && $row[1] === $orders[$row[0]][0] && $row['Category']))
            Utils::error();
        $row['Info'] = $orders[$row[0]];
        $firstrow = $orders[$firstindex];
        if (!($row['Info']['Recipient'] === $firstrow['Recipient'] && $row['Info']['Address'] === $firstrow['Address'] && $row['Info']['Phone'] === $firstrow['Phone']))
            Utils::error('Selected orders do not share the same address and recipient.');
        return $row;
    }
    
    function a_prepareSplit() {
        $orders = Session::get('displayOrderData') ?: Utils::error('Empty');
        Session::unsets(['uploadorderstandard', 'uploadordermerge', 'uploadordersplit']);
        $warehouse = $this->model->getIdByName('Warehouses', $_POST["warehouse"] ?: Utils::error('Empty'));
        $currency = $this->model->getCurrency($_POST['Currency'] ?: Utils::error('Empty'))['ID'];
        $items = explode('-', $_POST['itemDist'] ?: Utils::error('Empty'));
        $weights = explode('-', $_POST['weightDist'] ?: Utils::error('Empty'));
        $volumes = empty($_POST['volumeDist']) ? false : explode('-', $_POST['volumeDist']);
        $oinfo = $this->fn_validateOperation('mergesplit', [0, 1, 'Category'], [0, 1, 'Category'], ['nopage' => true, 'firstrow' => true]);
        if (count($oinfo) !== 1 || $oinfo[0]['Info']['Qty'] < 2 || count($items) < 2 || !(count($items) === count($weights) && ($volumes === false || count($weights) === count($volumes))))
            Utils::error('Please make sure there is more than one package and the number of packages indicated in each text box is the same.');
        $oinfo = $oinfo[0];
        foreach ($items as $key => $item) {
            $items[$key] = Utils::validate($item, 'qty');
            $weights[$key] = Utils::validate($weights[$key], 'qty');
            if ($volumes)
                Utils::validate($volumes[$key], 'qty');
        }
        if (array_sum($items) !== $oinfo['Info']['Qty'])
            Utils::error('Please make sure the items allocated to each package add up to the total.');
        $pricelist = $this->model->getPrice($warehouse, $currency, $oinfo['Category'], array_sum($weights)) ?: Utils::error();
        Session::set('uploadordersplit', ['Warehouse' => $warehouse, 'Currency' => $currency, 'Specs' => ['items' => $items, 'weights' => $weights, 'volumes' => $volumes], 'Price' => $pricelist['TotalPrice'], 
        'ExcPrice' => $pricelist['ExcPrice'] ?: false, 'WarehouseCurrency' => $pricelist['WarehouseCurrency'] ?: false, 'odinfo' => $oinfo]);
        return ['data' => $pricelist];
    }
    
    function a_upload($mode = '') {
        if(!($mode === 'standard' || $mode === 'merge' || $mode === 'split'))
            Utils::error();
        $orders = Session::get('displayOrderData') ?: Utils::error();
        $pk = Session::get('uploadorder' . $mode) ?: Utils::error();
        Session::unsets(['uploadorderstandard', 'uploadordermerge', 'uploadordersplit']);
        $pkcbalance = $this->model->getBalance($this->uid[0], $pk['Currency']);
        $wcbalance = $pk['WarehouseCurrency'] ? $this->model->getBalance($this->uid[0], $pk['WarehouseCurrency']) : false;
        if(($pk['ExcPrice'] && !$_POST['consent']) || round($pkcbalance - ($pk['ExcPrice'] ?: $pk['Price']), 2) < 0 
        || empty($this->model->{'uploadOrder' . $mode}($this->uid[0], $this->uid['AccountID'], $pk, $pkcbalance, $wcbalance))) Utils::error();
        foreach($mode === 'split' ? [$pk['odinfo'][0]] : array_column($pk['odinfo'], 0) as $index)
            unset($orders[$index]);
        $orders = array_values($orders);
        Session::set('displayOrderData', $orders ?: null);
        return ['count' => count($pk['odinfo']), 'remainingCount' => count($orders), 'data' => array_slice($orders, 0, Session::get('perPage') ?: 25)];
    }
}
