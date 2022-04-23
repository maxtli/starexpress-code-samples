<?php

class ManageCatalog extends Controller {

    use SearchListController;

    function __construct() {
        parent::__construct();
        if ($this->uid['Access'] !== 'Supervisor')
            Utils::error();
        $this->SLC = 'ct';
    }

    function index() {
        $this->view->pageDetails = ['title' => 'Manage Catalog',
            'css' => ['innerstyles.css', 'manager/index.css', 'manager/catalog.css'],
            'js' => ['table.js', 'manager/catalog/index.js', 'manager/catalog/full.js', 'manager/catalog/selproduct.js']];
        $this->view->render('manager/catalog/index.php');
        exit;
    }
    
    function add() {
        $this->view->pageDetails = ['title' => 'New Catalog Item',
            'css' => ['innerstyles.css', 'manager/index.css'],
            'js' => ['table.js', 'manager/catalog/add.js', 'manager/catalog/selproduct.js']];
        $this->view->render('manager/catalog/add.php');
        exit;
    }
    
    function ticket($otid = '') {
        $this->view->success = $_GET['success'];
        $this->view->ticket = $this->model->getTicket($otid) ?: Utils::error();
        Session::set('otid', $otid ?: $this->view->ticket['ID']);
        $this->view->pageDetails = ['title' => 'Order Ticket',
            'css' => ['innerstyles.css', 'manager/index.css'],
            'js' => ['manager/catalog/ticket.js']];
        $this->view->render('manager/catalog/ticket.php');
        exit;
    }

    function viewTicketImg($index = 0) {
        $otid = Session::get('otid') ?: Utils::error();
        $directory = '/home1/thestar/mvc.thestarexpress.com/en/views/orderTicket/pictures/';
        $found = false;
        foreach(IMGACCEPT as $extension) {
            if(file_exists($directory.$otid.'-'.$index.'.'.$extension)) {
                $found = true;
                header('Content-Type: image/'.$extension);
                echo file_get_contents($directory.$otid.'-'.$index.'.'.$extension);
                break;
            }
        }
        if($found === false) {
            header('Content-Type: image/jpg');
            echo file_get_contents($directory.'Not Found.jpg');
        }
    }

    function a_loadWindow() {
        $this->view->render('manager/catalog/index.php', false);
    }
    
    function a_ticket() {
        return $this->model->completeTicket($_POST['otid'] ?: Utils::error(), $_POST['cid'] ?: Utils::error(), $this->uid[0]) ?: Utils::error();
    }

    function a_findPictures() {
        $cid = $_GET['cid'] ?: Utils::error();
        $colors = array_unique(array_map(function ($color) {return Utils::sanitize($color, 'lower');}, $this->model->getColors($cid))) ?: Utils::error();
        if(count($colors) > 1 || $colors[0]) {
            $picCount = ['Mode' => 1];
            foreach($colors as $color) {
                $picCount['Pics'][$color] = $this->fn_findPictures($cid, $color);
            }
        } else 
            $picCount = ['Mode' => 0, 'Pics' => $this->fn_findPictures($cid)];
        return $picCount;
    }
        
    function a_add() {
        $form = $this->fn_validateForm(['Country', 'StoreRootCategory', 'StoreSubcategory', 'Currency', 'Title'], ['Subtitle', 'Description', 'Visibility', 'Options'], false);
        $form['Category'] = $this->model->getIdByName('StoreHomeCategories', $form['StoreSubcategory'], 'StoreRootCategories', $form['StoreRootCategory']);
        unset($form['StoreRootCategory'], $form['StoreSubcategory']);
        $optlist = $this->fn_validateOperation('add', ['pid', 'spec', 'Color', 'Size', 'SalePrice', 'InStock', 'RootCategory', 'Subcategory', 'Brand', 'Name', 'UPC', 'Materials', 'PColor', 'PSize', 'StyleNo', 'Specification', 'UnitPrice', 'Currency'], ['pid', 'SalePrice', 'InStock'], ['nopage' => true, 'param' => $form['Options'], 'dupl' => true]) ?: Utils::error();
        $pics = [];
        if($form['Options'] === 'Color and Size' || $form['Options'] === 'Color') {
            foreach($optlist as $option) {
                $i = 0;
                $color = Utils::sanitize($option[0]['Color'], 'lower');
                if($pics[$color]) {
                    if($form['Options'] === 'Color')
                        Utils::error();
                    continue;
                }
                while ($i < 10 && $_FILES['pic_' . $color . '_' . $i] && $_FILES['pic_' . $color . '_' . $i]['name']) {
                    $pic = $_FILES['pic_' . $color . '_' . $i];
                    $ext = substr($pic['name'], strrpos($pic['name'], '.'));
                    if (!in_array(strtolower($ext), IMGACCEPT) || $pic['size'] > 5000000 || $pic['error']) Utils::error('hi');
                    $pics[$color][] = ['src' => $pic['tmp_name'], 'ext' => $i . strtolower($ext)];
                    $i++;
                }
                if(empty($pics[$color]))
                    Utils::error('hello');
            }
            $cid = $this->model->addCatalog($form, $optlist) ?: Utils::error();
            foreach($pics as $key => $opt)
                foreach($opt as $pic)
                    if(!move_uploaded_file($pic['src'], URL . CATALOGIMAGES . $cid . '-' . $key . '-' . $pic['ext'])) $uploaderror = true;
        } else {
            $i = 0;
            while ($i < 10 && $_FILES['pic_' . $i] && $_FILES['pic_' . $i]['name']) {
                $pic = $_FILES['pic_' . $i];
                $ext = substr($pic['name'], strrpos($pic['name'], '.'));
                if (!in_array(strtolower($ext), IMGACCEPT) || $pic['size'] > 5000000 || $pic['error']) Utils::error($pic);
                $pics[] = ['src' => $pic['tmp_name'], 'ext' => $i . strtolower($ext)];
                $i++;
            }
            if(empty($pics))
                Utils::error();
            $cid = $this->model->addCatalog($form, $optlist) ?: Utils::error();
            foreach($pics as $pic)
                if(!move_uploaded_file($pic['src'], URL . CATALOGIMAGES . $cid . $pic['ext'])) $uploaderror = true;
        }
        if($uploaderror) Utils::error('Some pictures failed to upload.');
        return $cid;
    }
    
    function fn_validateAdd($row, $optmode = '') {
        $catrow = [];
        $catrow['SalePrice'] = Utils::validate($row['SalePrice'], 'float');
        $catrow['InStock'] = Utils::validate($row['InStock'], 'index');
        if($row['pid'] === 'new') {
            foreach(['RootCategory', 'Subcategory', 'Name', 'UnitPrice', 'Currency'] as $col)
                if(empty($row[$col])) Utils::error('a');
            $row['HomeCategoriesID'] = $this->model->getIdByName('HomeCategories', $row['Subcategory'], 'RootCategories', $row['RootCategory']);
            $row['CurrenciesID'] = $this->model->getCurrency($row['Currency'])['ID'];
            $row['UnitPrice'] = Utils::validate($row['UnitPrice'], 'float');
            unset($row['RootCategory'], $row['Subcategory'], $row['Currency']);
        } else 
            $row['pid'] = $this->model->getId('Products', $row['pid']);
        if($optmode === 'Color and Size') {
            if(empty(Utils::sanitize($row['Color'], 'lower')) || empty($row['Size']) || empty($_FILES['pic_' . $row['Color'] . '_0'])) Utils::error();
        } else if($optmode === 'Color') {
            if(empty($row['Color']) || empty($_FILES['pic_' . $row['Color'] . '_0']))
                Utils::error();
            unset($row['Size']);
        } else if($optmode === 'Size') {
            if(empty($row['Size']))
                Utils::error();
            unset($row['Color']);
        } else
            unset($row['Color'], $row['Size']);
        if($row['Color'])
            $catrow['Color'] = $row['Color'];
        if($row['Size'])
            $catrow['Size'] = $row['Size'];
        if($row['PColor'])
            $row['Color'] = $row['PColor'];
        else
            unset($row['Color']);
        if($row['PSize'])
            $row['Size'] = $row['PSize'];
        else
            unset($row['Size']);
        unset($row['SalePrice'], $row['InStock'], $row['PColor'], $row['PSize'], $row['spec']);
        $row[0] = $catrow;
        return $row;
    }
    
    function export() {
        $this->fn_export([]);
    }
    
    function a_edit() {
        return $_POST['cid'];
        Utils::error([$_FILES]);
        $form = $this->fn_validateForm(['Country', 'StoreRootCategory', 'StoreSubcategory', 'Currency', 'Title'], ['Subtitle', 'Description', 'Visibility', 'Options'], false);
        $form['Category'] = $this->model->getIdByName('StoreHomeCategories', $form['StoreSubcategory'], 'StoreRootCategories', $form['StoreRootCategory']);
        unset($form['StoreRootCategory'], $form['StoreSubcategory']);
        $optlist = $this->fn_validateOperation('add', ['pid', 'spec', 'Color', 'Size', 'SalePrice', 'InStock', 'RootCategory', 'Subcategory', 'Brand', 'Name', 'UPC', 'Materials', 'PColor', 'PSize', 'StyleNo', 'Specification', 'UnitPrice', 'Currency'], ['pid', 'SalePrice', 'InStock'], ['nopage' => true, 'param' => $form['Options'], 'dupl' => true]) ?: Utils::error();
        $pics = [];
        $accepted = IMGACCEPT;
    }

    function a_search() {
        return $this->fn_search(['CID', 'StoreRootCategory', 'StoreSubcategory', 'Title', 'Visibility', 'Subtitle', 'Country', 'Currency', 'Discount', 'Brand', 'Color', 'Size', 'StyleNo', 'Materials', 'Description', 'Specification', 'search'],
        ['StockTimeSt', 'StockTimeEnd', 'LastBoughtSt', 'LastBoughtEnd'], ['InStock', 'SalePrice']);
    }

    function a_page($pageNo = 0) {
        return ['data' => $this->fn_getRows($pageNo)];
    }
    
    function a_perPage($perPage = 0) {
        return $this->fn_changeItemsPerPage($perPage);
    }
}
