<?php

class Controller {

    function __construct() {
        $this->view = new View();
        $this->uid = Session::get('ID', true);
    }
    
    function fn_loadModel($url0) {
        $path = URL . "models/" . (PAGES[$url0] ?: '') . $url0 . '_model.php';
        $url0 = $url0 . '_model';
        if(file_exists($path)) {
            require $path;
            $this->model = new $url0();            
        }
    }

    function fn_checkCustomerCredentials($page, $soft = false) {
        if($this->uid[0] == false) {
            if($soft)
                return false;
            Session::destroy();
            if(Session::get('ajax', true))
                Utils::error('You need to log in.');
            header('location: '.WEBURL.'login?redir=' . $page);
            exit;
        }
        if($this->uid['Access'] === 'Supervisor') {
            if($soft)
                return false;
            if(Session::get('ajax', true))
                Utils::error('You cannot access that page.');
            header('location: '.WEBURL.'dash');
            exit;
        }
        return true;
    }

    function fn_validateForm($requiredInputs = [], $optionalInputs = [], $user = true) {
        $inputs = [];
        foreach ($requiredInputs as $value) {
            if($_POST[$value])
                $inputs[$value] = $_POST[$value];
            else
                Utils::error('Empty');
        }
        foreach ($optionalInputs as $value) {
            if($_POST[$value])
                $inputs[$value] = $_POST[$value];
        }
        foreach (['Warehouse', 'Service', 'Transporter', 'State'] as $key) {
            if($inputs[$key])
                $inputs[$key] = $this->model->getIdByName($key . 's', $inputs[$key]);
        }
        if($inputs['State'])
            unset($inputs['Country']);
        else if ($inputs['Country'])
            $inputs['Country'] = $this->model->getIdByName('Countries', $inputs['Country']);
        
        if($inputs['Currency'])
            $inputs['Currency'] = $this->model->getCurrency($inputs['Currency'])['ID'];
        if($inputs['Weight']) {
            $inputs['Weight'] = Utils::validate($inputs['Weight'], 'qty');
        }
        if($inputs['TransactionCap']) {
            $inputs['TransactionCap'] = Utils::validate($inputs['TransactionCap'], 'float');
        }
        if ($inputs['Volume']) {
            if (!(is_array($inputs['Volume']) && count($inputs['Volume']) === 3))
                Utils::error();
            foreach ($inputs['Volume'] as $key => $item)
                $inputs['Volume'][$key] = Utils::validate($item, 'qty');
            $inputs['Volume'] = $inputs['Volume'][0] * $inputs['Volume'][1] * $inputs['Volume'][2];
        }
        if($user)
            $inputs['User'] = $this->uid[0];
        return $inputs;
    }
    
    //settings: numlist => predetermined tracking number list, all => no page limit, opt => accept empty list
    function fn_list($settings = []) {
        Session::unsets(['pksq', 'pklist']);//removes any preexisting search query or package list
        $numlist = $settings['numlist'] ?: $_POST['numlist'];
        if(empty($numlist))
            if($settings['opt'])
                return ['data' => []];
            else
                Utils::error('hi');//if there are no tracking numbers in the list
        $numlist = Utils::sanitize($numlist, 'idlist')['str'];//turns the tracking number array into a string, then removes anything except numbers and commas
        if (count($numlist) === 0)//if theres nothing after sanitizing just return
            return ['invalid' => '', 'count' => 0, 'data' => []];
        $sorted = $this->model->searchList($numlist);
        if (empty($sorted[1]['ValidNumList']))//if theres no package for the tracking number(s) return error
            return ['invalid' => $sorted[0]['FailedNumList'], 'count' => 0];
        $numlist = explode(',', "'" . $sorted[1]['ValidNumList'] . "'");//turn it back into an array
        Session::set('pklist', $numlist);//set a predetermined tracking number list
        return ['invalid' => $sorted[0]['FailedNumList'], 'count' => count($numlist), 'perPage' => Session::get('perPage') ?: 25,
        'data' => method_exists($this, 'fn_getRows') ? $this->{'fn_getRows'}(1, $settings['all']) : "'" . $sorted[1]['ValidNumList'] . "'"];//return
    }

    function fn_findPictures($cid, $color = false, $findAll = true) {
        $pics = [];
        $i = 0;
        while (true) {
            foreach(IMGACCEPT as $ext) {
                $path = CATALOGIMAGES . $cid . ($color ? '-' . Utils::sanitize($color, 'lower') : '') . '-' . $i . $ext;
                if(file_exists(URL . $path)) {
                    $pics[] = $path;
                    $i++;
                    if($findAll)
                        continue 2;
                    else
                        break 2;
                }
            }
            break;
        }
        return $findAll ? $pics : ($pics[0] ?: CATALOGIMAGES . 'productpicmissing.png');
    }
}
/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

