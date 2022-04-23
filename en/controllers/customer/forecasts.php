<?php

class Forecasts extends Controller {

    use SearchListController;

    function __construct() {
        parent::__construct();
        $this->fn_checkCustomerCredentials('forecasts');
        $this->SLC = 'fc';
    }

    function index() {
        $this->view->pageDetails = [
            'title' => 'My Forecasts',
            'css' => ['innerstyles.css', 'customer/forecasts.css'],
            'js' => ['table.js', 'findproduct.js', 'customer/forecasts/index.js']];
        $this->view->render('customer/forecasts/index.php');
    }
    
    function create() {
        $this->view->pageDetails = [
            "title" => "Create Forecast", 
            "css" => ["innerstyles.css", "customer/createForecast.css"],
            "js" => ["findproduct.js", "customer/forecasts/create.js"]];
        $this->view->render('customer/forecasts/create.php'); 
    }

    function find($num = '') {
        if(empty($num))
            exit(header('location: '.WEBURL.'forecasts'));
        $this->view->preset = Session::get('crfc') ? 'crfc' : 'find';
        $this->view->num = $num;
        Session::unsets('crfc');
        $this->index();
    }
    
    function export() {
        $this->fn_export(['Forecast ID', 'Create Time', 'Warehouse', 'Transporter', 'Tracking Number', 'Sign Time', 'Handle Time', 'Declared Weight', 'Declared Volume', 
        'Category', 'Item', 'Brand', 'Forecasted Quantity', 'Actual Quantity', 'State', 'UPC', 'Materials', 'Color', 'Style Code', 'Size', 'Specs', 'Price', 'Packages inside forecast']);
    }

    function a_search() {
        return $this->fn_search(['search', 'fcid', 'Warehouse', 'Transporter', 'TrackingNumber', 'Status'], ['CreateTimeSt', 'CreateTimeEnd', 'SignTimeSt', 'SignTimeEnd', 'HandleTimeSt', 'HandleTimeEnd'], ['DeclaredWeight', 'DeclaredVolume', 'ItemQty', 'PackageQty']);
    }
    
    function a_page($pageNo = 0) {
        return ['data' => $this->fn_getRows($pageNo)];
    }

    function a_create() {
        $this->SLC = 'fg';
        $fc = $this->fn_validateForm(['Warehouse', 'Transporter', 'tracknum'], ['Weight', 'Volume']);
        $fginfo = $this->fn_validate_Product(true);//alidates produts
        $pklist = $this->fn_list(['opt' => true]);//gets shiptents list
        if ($pklist['invalid'])
            Utils::error();
        $fcid = $this->model->createForecast($fc, $fginfo, $pklist['data']);//alls proedure to reate foreast
        Session::set('crfc', true);
        return ['num' => $fcid];
    }
    
    function a_delete() {
        $numlist = Utils::sanitize($_POST['fcinfo'], 'idlist');
        $this->model->deleteForecasts($numlist['str'], $this->uid[0]);
        return ['count' => $numlist['count']];
    }
}
