<?php

class ManageShipments extends Controller {

    use SearchListController;

    function __construct() {
        parent::__construct();
        if ($this->uid['Access'] !== 'Supervisor')
            Utils::error();
        $this->SLC = 'pk';
    }

    function index() {
        Session::unsets('pkbox');
        $this->view->pageDetails = [
            'title' => 'Manage Shipments',
            'css' => ['innerstyles.css', 'manager/index.css'],
            'js' => ['table.js', 'shipments.js', 'manager/shipments/index.js']];
        $this->view->statusOptions = ['包裹已到达纽约分拣中心',
            '离开纽约分拣中心，发往纽约肯尼迪机场。',
            '纽约肯尼迪机场等待安排航班。',
            '离开纽约肯尼迪机场，飞往中国。',
            '航班中转已到达__。',
            '已到达__，等待清关中。', 
            '包裹开始清关中。',
            '包裹清关已完成。'];
        $this->view->messageOptions = ['Request ID', 'Passed Customs', 'Package Delivered'];
        $this->view->render('manager/shipments/index.php');
        exit;
    }
    
    function viewBox() {
        $this->view->boxMode = 'box';
        $this->index();
    }
    
    function viewUnbox() {
        $this->view->boxMode = 'unbox';
        $this->index();
    }

    function viewId($mode = '') {
        switch($mode) {
            case 'get':
                $this->view->idDetails = (Session::get('idid') === false || Session::get('imgKey') === false || Session::get('imgBackKey') === false) ? $this->fn_idError() : ($this->model->getIdentificationDetails(Session::get('idid')) ?: $this->fn_idError());
                $this->view->pageDetails = [
                    'title' => 'Verify ID',
                    'css' => ['innerstyles.css', 'manager/verifyid.css']];
                $this->view->render('manager/shipments/viewid.php');
                exit;
            case 'img':
                $this->fn_retrieveImage('imgKey');
                exit;
            case 'imgBack':
                $this->fn_retrieveImage('imgBackKey');
                exit;
        }
        $pkid = $_POST['idsubmit'] ?: $this->fn_idError();
        $tracknum = $_POST['tracknumsubmit'] ?: $this->fn_idError();
        $result = $this->model->findIDFromPackage($pkid, $tracknum);
        if(empty($result) || $result['IDStatus'] === 'Unsubmitted') {
            $this->fn_idError();
        }
        Session::set('idid', $result['ID']);
        Session::set('imgKey', $result['ID']);
        Session::set('imgBackKey', $result['ID'] . 'b');
        header('location: ' . WEBURL . 'manageshipments/viewId/get');
        exit;
    }
    
    function a_verifyId() {
        $verified = $_POST['verify'];
        $idid = Session::get('idid');
        Session::unsets(['idid', 'imgKey', 'imgBackKey']);
        if(!($idid && $verified && ($verified === '1' || $verified = '-1') && $this->model->markIdentification($idid, $verified)))
            Utils::error();
    }
    
    function fn_idError() {
        Session::unsets(['idid', 'imgKey', 'imgBackKey']);
        header('location: ' . WEBURL . 'manageshipments?notif=expired');
        exit;
    }
    
    function fn_retrieveImage($name) {
        $key = Session::get($name);
        $directory = '/home1/thestar/thestarexpress/libs/helper/function/';
        //$directory = URL.IDUPLOADS;
        $found = false;
        if($key) {
            foreach(['png', 'jpg', 'jpeg', 'bmp'] as $extension) {
                if(file_exists($directory.$key.'.'.$extension)) {
                    $found = true;
                    header('Content-Type: image/'.$extension);
                    echo file_get_contents($directory.$key.'.'.$extension);
                    break;
                }
            }
            if($found === false) {
                header('Content-Type: image/jpg');
                echo file_get_contents($directory.'Not Found.jpg');
            }
        } else
            $this->fn_idError();
        Session::unsets($name);
    }
    
    function box($tracknum = '') {
        if(empty($tracknum)) {
            $this->view->success = $_GET['success'];
            $pk = $this->model->getFirstBox() ?: $this->viewBox();
            $this->view->createTime = $pk['CreateTime'];
        } else {
            $pk = $this->model->findPackage($tracknum, $_POST['pkid'] ?: Utils::error()) ?: Utils::error();
            if($pk['Status'] !== 'Picking')
                Utils::error();
            $this->view->createTime = $pk['CreateTime'];
            $pk = ['TrackingNumber' => $tracknum, 'ID' => $_POST['pkid']];
        }
        $this->view->tracknum = $pk['TrackingNumber'];
        $this->view->packageContents = $this->model->getPackageContents($pk['TrackingNumber']);
        $this->view->pageDetails = ['title' => 'Box Package', 'css' => ['innerstyles.css', 'manager/index.css'], 'js' => 'manager/shipments/box.js'];
        Session::set('pkbox', $pk);
        $this->view->render('manager/shipments/box.php');
    }
    
    function a_box() {
        $pk = Session::get('pkbox') ?: Utils::error();
        Session::unsets('pkbox');
        if(!($_GET['tracknum'] === $pk['TrackingNumber'] && $this->model->boxPackage($pk['TrackingNumber'], $pk['ID'])))
            Utils::error();
    }

    function export() {
        $this->fn_export(array('Tracking Number', 'Package ID', 'Create Time', 'Buyer ID', 'Delivery Tracking Number', 'ID Status',
            'Platform SKU', 'Item Qty', 'Actual Qty', 'Order Remarks', 'Product Detail', 'Price', 'Remarks',
            'Buyer Message', 'Phone Number', 'ID Upload Time', 'ID Number', 'Recipient', 'Address', 'Zip Code', 'City',
            'State/Province', 'Country', 'Order Platform', 'Order ID', 'Item Title',
            'Order Status', 'Order Time', 'Pay Time', 'Payment Type',
            'Payment Account', 'Payment ID', 'Store Name', 'Item Category',
            'UPC', 'SKU', 'Item Name', 'Brand', 'Style Code', 'Color',
            'Size', 'Specification', 'Materials', 'Unit Price', 'Item Category',
            'Actual Weight (lb)', 'Actual Volume (in^3)',
            'Declared Weight (lb)', 'Declared Volume (in^3)', 'Package Status',
            'Shipping Service', 'Username', 'Warehouse', 'Sign Time', 'Signer', 'Handle Time', 'Handler', 'Delivery Transporter', 'Delivery Service',
            'Outbound Time', 'Transfer Transporter',
            'Transfer Tracking Number'));
    }

    function exportTransferNums() {
        $this->fn_export(['Tracking Number', 'ID', 'Transfer Transporter', 'Transfer Number'], true);
    }
 
    function a_search() {
        return $this->fn_search(['TrackingNumber', 'Service', 'Warehouse', 'Username', 'RecipientName', 'Address', 'City', 'State', 'Country', 'Zip', 'IdStatus', 'Status', 'PackageID', 'Signer', 'Handler'],
            ['CreateTimeSt', 'CreateTimeEnd', 'SignTimeSt', 'SignTimeEnd', 'HandleTimeSt', 'HandleTimeEnd'], ['DeclaredWeight', 'ActualWeight', 'DeclaredVolume', 'ActualVolume']);
    }

    function a_list($numlist = [], $invalid = []) {
        $result = $this->fn_list(['numlist' => $numlist]);
        if (count($invalid)) {
            $result['count'] -= count($invalid);
            $result['invalid'] = implode(', ', $invalid);
        }
        return $result;
    }
    
    function a_page($pageNo = 0) {
        return ['data' => $this->fn_getRows($pageNo)];
    }
    
    function a_perPage($perPage = 0) {
        return $this->fn_changeItemsPerPage($perPage);
    }

    function a_sign() {
        $statustime = Utils::validate([$_POST['customdate'], $_POST['customtime']], 'dt');
        $pkinfo = $this->fn_validateOperation('sign', [0, 1, 'ActualWeight', 'ActualVolume'], [0, 1, 'ActualWeight']);
        foreach ($pkinfo as $package) {
            if ($this->model->signPackage($package, $this->uid[0], $this->uid[0]['WarehouseID'], $statustime) === false)
                Utils::error('Some packages altered');
        }
        return $this->a_list(array_column($pkinfo, 0));
    }

    function fn_validateSign($row) {
        $pk = $this->model->findPackage($row[0], $row[1]);
        if (empty($pk) || $pk['Status'] !== 'Declared' || floatval($row['ActualWeight']) === 0 || (!empty($row['ActualVolume']) && floatval($row['ActualVolume']) === 0))
            Utils::error();
        $row['OverWeight'] = ceil(round($row['ActualWeight'] * 2, 2)) - ceil(round($pk['DeclaredWeight'] * 2, 2)) > 0.01;
        return $row;
    }

    function a_edit() {
        $pkinfo = $this->fn_validateOperation('edit', [0, 1, "RecipientName", "Address", "City", "State", "Country", "Zip"]);
        foreach ($pkinfo as $package) {
            if ($this->model->updatePackage($package) === false)
                Utils::error('Some packages altered');
        }
        return $this->a_list(array_column($pkinfo, 0));
    }

    function fn_validateEdit($row) {
        $pk = $this->model->findPackage($row[0], $row[1]);
        if (count($row) < 3 || empty($pk) || !in_array($pk['Status'], ['Declared', 'Signed', 'ExtraWeight', 'Handled']))
            Utils::error();
        $emptyAddress = empty($row["Address"]);
        foreach (["City", "State", "Country"] as $addressElement) {
            if (empty($row[$addressElement]) !== $emptyAddress)
                Utils::error();
        }
        if ($emptyAddress === false)
            $row["State"] = $this->model->getIdByName('States', $row["State"], 'Countries', $row['Country']);
        return $row;
    }

    function a_send() {
        $statustime = Utils::validate([$_POST['customdate'], $_POST['customtime']], 'dt');
        $keys = [0, 1, 'Transporter', 'Service', 'TransporterTrackNum'];
        $pkinfo = $this->fn_validateOperation('send', $keys, $keys);
        foreach ($pkinfo as $package) {
            if ($this->model->sendPackage($package, $this->uid[0], $this->uid[0]['WarehouseID'], $statustime) === false) {
                Utils::error('Some packages altered');
            }
        }
        return $this->a_list(array_column($pkinfo, 0));
    }

    function fn_validateSend($row) {
        $pk = $this->model->findPackage($row[0], $row[1]);
        $row['TransporterServiceID'] = $this->model->findTransporterService($row['Transporter'], $row['Service']);
        if (empty($pk) || !in_array($pk['Status'], ['Signed', 'ExtraWeight', 'Handled']) || $row['TransporterServiceID'] === false)
            Utils::error();
        return $row;
    }

    function a_delete() {
        $pkinfo = $this->fn_validateOperation('delete');
        foreach ($pkinfo as $package) {
            if ($this->model->deletePackage($package[1]) === false)
                Utils::error('Some packages altered');
        }
        return ['count' => count($pkinfo)];
    }

    function fn_validateDelete($row) {
        $pk = $this->model->findPackage($row[0], $row[1]);
        if (empty($pk) || !in_array($pk['Status'], ['Declared', 'Signed', 'ExtraWeight', 'Handled']))
            Utils::error();
        return $row;
    }

    function a_sendmessage() {
        $messagecode = $_POST['messagemode'];
        $messagecustom = $_POST['messagecustom'];
        if (empty(trim($messagecustom))) {
            $intmessagecode = Utils::validate($messagecode, 'qty');
            if ($intmessagecode > 3)
                Utils::error('Empty');
            $messagecustom = array(
                1 => "【星际快递】 您有一个包裹发往星际美国分拨中心，等待运往国内。中国海关监管要求，个人包裹入关需核实收件人真实身份。为了您能顺利收到包裹，请尽快访问thestarexpress.com/customDocSubmit输入您的真实姓名和包裹单号 [##] 提交个人身份证明。",
                2 => "【时代代购】亲，您的包裹[##]出关了。转国内配送[%%]，单号[###]。快到了！请注意接收。",
                3 => "【时代代购】 亲，您的包裹 [##] 到了，觉得好，评价拍个小视频，上两张图，5分好评。")[$intmessagecode];
        }
        $pkinfo = $this->fn_validateOperation('sendmessage', [0, 1], [0, 1], array('param' => !(strpos($messagecustom, '###') === false && strpos($messagecustom, '%%') === false)));
        $failedNumbers = [];
        foreach ($pkinfo as $package) {
            $message = str_replace(['###', '%%', '##'], [$package['TransferTrackingNumber'], $package['TransferTransporter'], $package[0]], $messagecustom);
           // if (Mailer::sendMessage($message, $package['PhoneNumber']) === false)
              //  $failedNumbers[] = $package[0];
        }
        return $this->a_list(array_column($pkinfo, 0), $failedNumbers);
    }

    function fn_validateSendMessage($row, $transfer = false) {
        $phone = $this->model->findPackagePhone($row[0], $row[1]);
        if (empty($phone) || ($transfer && (empty($phone['TransferTransporter']) || empty($phone['TransferTrackingNumber']))))
            Utils::error();
        return array_merge($row, $phone);
    }

    function a_updatestatus($mode = '') {
        if ($mode === 'custom') {
            $params = [];
            $custom = $_POST['packagestatuscustom'];
            $params['location'] = $_POST['statuslocation'];
            if (empty($custom) || empty($params['location']))
                Utils::error('Empty');
            $activity = explode('/', $custom, 2);
            if (count($activity) === 1) {
                $params['status'] = '';
                $params['activity'] = $activity[0];
            } else {
                $params['status'] = trim($activity[0]);
                $params['activity'] = trim($activity[1]);
            }
        } else {
            $activity = $_POST['packagestatus'];
            $location = $_POST['statuslocation'];
            if (empty($activity))
                Utils::error('Empty');
            $intactivity = Utils::validate($activity, 'qty');
            if ($intactivity > 8 || $intactivity >= 5 && empty($location))
                Utils::error();
            $params = array(1 => ['activity' => '包裹已到达纽约分拣中心', 'location' => 'New York', 'status' => 'Ground US'],
                2 => ['activity' => '离开纽约分拣中心，发往纽约肯尼迪机场。', 'location' => 'New York', 'status' => 'Ground US'],
                3 => ['activity' => '纽约肯尼迪机场等待安排航班。', 'location' => 'New York', 'status' => 'Flight to China'],
                4 => ['activity' => '离开纽约肯尼迪机场，飞往中国。', 'location' => 'New York', 'status' => 'Flight to China'],
                5 => ['activity' => '航班中转已到达' . $location . '。', 'location' => $location, 'status' => 'Flight to China'],
                6 => ['activity' => '已到达' . $location . '，等待清关中。', 'location' => $location, 'status' => 'Flight to China'],
                7 => ['activity' => '包裹开始清关中。', 'location' => $location, 'status' => 'Customs'],
                8 => ['activity' => '包裹清关已完成。', 'location' => $location, 'status' => 'Customs'])[$intactivity];
        }
        $statustime = Utils::validate([$_POST['statusdate'], $_POST['statustime']], 'dt');
        $pkinfo = $this->fn_validateOperation('updatestatus');
        $failedNumbers = [];
        foreach ($pkinfo as $package) {
            if ($this->model->updateStatus($package[1], $params, $statustime) === false)
                $failedNumbers[] = $package[0];
        }
        return $this->a_list(array_column($pkinfo, 0), $failedNumbers);
    }

    function fn_validateUpdateStatus($row) {
        $pk = $this->model->findPackage($row[0], $row[1]);
        if (empty($pk) || $pk['Status'] !== 'Delivery' || empty($this->model->findPackageDelivery($row[0], $row[1])))
            Utils::error();
        return $row;
    }

    function a_updatestatustransfer() {
        $location = $_POST['statuslocation'];
        if (empty($location))
            Utils::error('Empty');
        $statustime = Utils::validate([$_POST['statusdate'], $_POST['statustime']], 'dt');
        $keys = [0, 1, 'Transporter', 'TransporterTrackNum'];
        $pkinfo = $this->fn_validateOperation('updatestatustransfer', $keys, $keys);
        $failedNumbers = [];
        foreach ($pkinfo as $package) {
            if ($this->model->updateTransferStatus($package, $location, $statustime) === false)
                $failedNumbers[] = $package[0];
        }
        return $this->a_list(array_column($pkinfo, 0), $failedNumbers);
    }

    function fn_validateUpdateStatusTransfer($row) {
        $pk = $this->model->findPackage($row[0], $row[1]);
        $row['TransporterID'] = $this->model->getIdByName('Transporters', $row['Transporter']);
        if (empty($pk) || $pk['Status'] !== "Delivery" || empty($this->model->findPackageDelivery($row[0], $row[1])))
            Utils::error();
        return $row;
    }
}
