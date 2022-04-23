<?php

class Shipments extends Controller {

    use SearchListController;

    function __construct() {
        parent::__construct();
        $this->fn_checkCustomerCredentials('shipments');
        $this->SLC = 'pk';
    }
    
    function index() {
        $this->view->pageDetails = [
            'title' => 'My Shipments',
            'css' => ['innerstyles.css'],
            'js' => ['table.js', 'shipments.js', 'customer/shipments/index.js', 'customer/shipments/full.js']];
        $this->view->render('customer/shipments/index.php');
    }
    
    function create() {
        $this->view->pageDetails = [
            "title" => "Create Shipment", 
            "css" => ["innerstyles.css", "customradio.css", "customer/createShipment.css"],
            "js" => ['findproduct.js', "customer/shipments/create.js", "table.js"]];
        Session::unsets(['crpk', 'crpkinv']);
        $this->view->balance = $this->model->getBalance($this->uid[0]);
        $this->view->render('customer/shipments/create.php');        
    }

    function find($num = '') {
        if(empty($num))
            exit(header('location: '.WEBURL.'shipments'));
        $this->view->preset = Session::get('crpk') ? 'crpk' : (is_numeric($num) ? 'fcid' : 'find');
        $this->view->num = $num;
        Session::unsets('crpk');
        $this->index();
    }

    function export() {
        $this->fn_export(['Tracking Number', 'Create Time', 'Buyer ID', 'ID Status',
            'Platform SKU', 'Item Qty', 'Order Remarks', 'Product Detail', 'Price', 'Remarks',
            'Buyer Message', 'Phone Number', 'Recipient', 'Address', 'Zip Code', 'City',
            'State/Province', 'Country', 'Order Platform', 'Order ID', 'Item Title',
            'Order Status', 'Order Time', 'Pay Time', 'Payment Type',
            'Payment Account', 'Payment ID', 'Store Name', 'Item Category',
            'UPC', 'SKU', 'Item Name', 'Brand', 'Style Code', 'Color',
            'Size', 'Specification', 'Materials', 'Unit Price', 'Item Category',
            'Actual Weight (lb)', 'Actual Volume (in^3)',
            'Declared Weight (lb)', 'Declared Volume (in^3)', 'Package Status',
            'Shipping Service', 'Package Price', 'Username', 'Warehouse', 'Sign Time']);
    }
    
    function a_loadWindow() {
        $list = $this->fn_list(['opt' => true, 'all' => true]);
        if($list['invalid']) {
            echo 'Error. Please reload.'; 
            exit;
        }
        $this->view->fcpk = $list['data'];
        $this->view->render('customer/shipments/index.php', false);
    }
    
    function a_getCreateFee() {
        Session::unsets(['crpk', 'crpkinv']);
        $pk = $this->fn_validateForm(['Service', 'Warehouse', 'Country', 'State', 'City', 'Address', 'FirstName', 'LastName', 'Phone', 'Currency'], ['Zip']);
        $this->SLC = 'iv';
        $pk['ivinfo'] = $this->fn_validateOperation('inventory', [0, 'Qty'], [0, 'Qty'], ['nopage' => true, 'param' => $pk['Warehouse']]);
        $pricelist = $this->model->getFee($pk['Warehouse'], $pk['Currency'], Utils::sanitize(array_column($pk['ivinfo'], 'HomeCategoriesID'), 'idopt')['str']) ?: Utils::error(
            'Your package contains two or more categories of items that may not be placed within the same package. Please consult our packing guidelines for more information, or contact us if the issue persists.');
        $pk['Fee'] = $pricelist['Fee'];
        $pk['ExcFee'] = $pricelist['ExcFee'] ?: false;
        $pk['WarehouseCurrency'] = $pricelist['WarehouseCurrency'] ?: false;
        Session::set('crpkinv', $pk);
        return ['data' => $pricelist];
    }
    
    function fn_validateInventory($row, $wid) {
        $row[0] = Utils::validate($row[0], 'qty');
        $row['Qty'] = Utils::validate($row['Qty'], 'qty');
        $itemdetails = $this->model->findInventoryItem($this->uid['AccountID'], $row[0], $wid);
        if(empty($itemdetails) || empty($itemdetails['TotalAmount'])) Utils::error();
        $row['HomeCategoriesID'] = $itemdetails['HomeCategoriesID'];
        $row['TotalAmount'] = Utils::validate($itemdetails['TotalAmount'], 'qty');
        if($row['TotalAmount'] < $row['Qty']) Utils::error();
        return $row;
    }
    
    function a_getCreatePrice() {
        Session::unsets(['crpk', 'crpkinv']);
        $pk = $this->fn_validateForm(['Service', 'Warehouse', 'Country', 'State', 'City', 'Address', 'FirstName', 'LastName', 'Phone', 'Currency', 'Weight'], ['Zip', 'Volume']);
        $this->SLC = 'pd';
        $pk['pdinfo'] = $this->fn_validate_Product();
        $pricelist = $this->model->getPrice($pk['Warehouse'], $pk['Currency'], Utils::sanitize(array_column($pk['pdinfo'], 'HomeCategoriesID'), 'idopt')['str'], $pk['Weight']) ?: Utils::error(
            'Your package contains two or more categories of items that may not be placed within the same package. Please consult our packing guidelines for more information, or contact us if the issue persists.');
        $pk['Price'] = $pricelist['TotalPrice'];
        $pk['ExcPrice'] = $pricelist['ExcPrice'] ?: false;
        $pk['WarehouseCurrency'] = $pricelist['WarehouseCurrency'] ?: false;
        Session::set('crpk', $pk);
        return ['data' => $pricelist];
    }
    
    function a_createInv() {
        $pk = Session::get('crpkinv') ?: Utils::error('hi');
        $user = $this->uid[0];
        //Session::unsets(['crpk', 'crpkinv']);
        if(!$_POST['consent']) Utils::error();
        $pkcbalance = $this->model->getBalance($user, $pk['Currency']);
        $wcbalance = $pk['WarehouseCurrency'] ? $this->model->getBalance($user, $pk['WarehouseCurrency']) : false;
        if(round($pkcbalance - $pk['Fee'], 2) < 0) Utils::error();
        $tracknum = $this->model->createPackageInv($user, $this->uid['AccountID'], $pk, $pkcbalance, $wcbalance);
        if($tracknum === false)
            Utils::error();
        Session::set('crpk', true);
        return ['num' => $tracknum];
    }
    
    function a_create() {
        $pk = Session::get('crpk') ?: Utils::error();
        $user = $this->uid[0];
        Session::unsets(['crpk', 'crpkinv']);
        $pkcbalance = $this->model->getBalance($user, $pk['Currency']);
        $wcbalance = $pk['WarehouseCurrency'] ? $this->model->getBalance($user, $pk['WarehouseCurrency']) : false;
        if(($pk['ExcPrice'] && !$_POST['consent']) || round($pkcbalance - ($pk['ExcPrice'] ?: $pk['Price']), 2) < 0) Utils::error('ii');
        $tracknum = $this->model->createPackageDec($user, $this->uid['AccountID'], $pk, $pkcbalance, $wcbalance);
        if($tracknum === false)
            Utils::error();
        Session::set('crpk', true);
        return ['num' => $tracknum];
    }

    function a_search() {
        return $this->fn_search(['search', 'fcido', 'fcid', 'TrackingNumber', 'Service', 'Warehouse', 'IdStatus', 'RecipientName', 'StreetAddress', 'City', 'State', 'Country', 'Zip', 'Status'], ['CreateTimeSt', 'CreateTimeEnd'], ['DeclaredWeight', 'DeclaredVolume', 'ActualVolume', 'ActualWeight']);
    }

    function a_list($numlist = []) {
        return $this->fn_list(['numlist' => $numlist]);
    }
    
    function a_page($pageNo = 0) {
        return ['data' => $this->fn_getRows($pageNo)];
    }

    function a_edit() {
        $pkinfo = $this->fn_validateOperation('edit', [0, "RecipientName", "Address", "City", "State", "Country", "Zip"], [0]);
        foreach ($pkinfo as $package)
            $this->model->updatePackage($package);//actually updates the recipient
        return $this->a_list(array_column($pkinfo, 0));//calls a_list with all the tracking numbers
    }

    function fn_validateEdit($row) {
        $pk = $this->model->findPackage($this->uid['AccountID'], $row[0]);
        count($row) >= 2 && $pk['Status'] === 'Declared' ?: Utils::error();//if the package is already shipping out you can't change it
        if ($row['Address']) {
            $row['City'] && $row['State'] && $row['Country'] ?: Utils::error();
            $row["State"] = $this->model->getIdByName('States', $row['State'], 'Countries', $row['Country']);
        } else
            unset($row['Address'], $row['City'], $row['State'], $row['Country']);
        $row[1] = $pk['ID'];
        return $row;
    }

    function a_delete() {
        $pklist = preg_replace("/[^SE0-9',]/i", '', implode("','", $_POST['pkinfo'])); 
        $refunds = $this->model->deletePackages($this->uid[0], $this->uid['AccountID'], $pklist['str'], $pklist['count']);
        return ['count' => $pklist['count'], 'refundprices' => $refunds];
    }
    
    function a_unbox() {
        $pkinfo = $this->fn_validateOperation('unbox', [0], [0]);
        foreach ($pkinfo as $package) {
            Utils::error($this->model->unboxPackage($package[1]));
            if ($this->model->unboxPackage($package[1]) === false)
                Utils::error('Some packages altered');
        }
        return $this->a_list(array_column($pkinfo, 0));
    }
    
    function fn_validateUnbox($row) {
        $pk = $this->model->findPackage($this->uid['AccountID'], $row[0]);
        if (empty($pk) || !($pk['Status'] === 'Picking' || $pk['Status'] === 'Boxed'))
            Utils::error();
        $row[1] = $pk['ID'];
        return $row;
    }
}
