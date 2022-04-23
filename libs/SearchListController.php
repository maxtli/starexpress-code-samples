<?php

trait SearchListController {

    function fn_search($arraypairs = [], $datetimepairs = [], $ints = []) {
        Session::unsets([$this->SLC . 'sq', $this->SLC . 'list']);
        //unsets some variables in the session
        $sq = $this->fn_validateSearch($arraypairs, $datetimepairs, $ints);
        //sets variable $sq to the value of fn_validateSearch
        $query = $this->model->buildSearchQuery($sq);
        $result = array('success' => true, 'count' => $this->model->getSearchCount($query));
        if ($result['count'] === false) 
            Utils::error();
        else if ($result['count'] == 0)
            return $result;
        Session::set($this->SLC . 'sq', $query);
        $result['data'] = $this->fn_getRows(1);
        $result['perPage'] = Session::get('perPage') ?: 25;
        return $result; 
    }
    
    function fn_validateSearch($arraypairs = [], $datetimepairs = [], $ints = []) {
        $sq = [];
        foreach ($arraypairs as $value) {
            if (isset($_GET[$value])) {
                $sq[$value] = $_GET[$value];
            }
        }
        //resets $sq and puts everything in $_GET that matches the keys of $arraypairs into $sq
        foreach ($datetimepairs as $value) {
            $rawdate = $_GET[$value . '-date'];
            $rawtime = $_GET[$value . '-time'];
            //sets variables as $_GET ones provided that the keys in $_GET match the values in $datetimepairs
            if (empty($rawdate)) {
                if (empty($rawtime))
                    continue;
                    //if there is no date nor time stop the loop and go to the next key
            } else if (empty($rawtime) || preg_match("/^(?:2[0-3]|[01][0-9]):[0-5][0-9]$/", $rawtime)) {
                $properDate = DateTime::createFromFormat('Y-m-d', $rawdate);
                if ($properDate !== false && date_format($properDate, 'Y-m-d') === $rawdate) {
                    $timestring = empty($rawtime) ? (strpos($value, 'st') === false ? '23:59:59' : '00:00:00') : $rawtime . ':00';
                    $sq[$value] = $rawdate . ' ' . $timestring;
                    continue;
                }
            }
            Utils::error('1');
        }
        foreach ($ints as $value) {
            if(isset($_GET[$value . '-min']))
                $sq[$value . 'Min'] = floor(floatval(($_GET[$value . '-min'])));
            if(isset($_GET[$value . '-max']))
                $sq[$value . 'Max'] = ceil(floatval(($_GET[$value . '-max'])));
        }
        if (empty($sq))
            Utils::error('2');
        else if ($sq['search'])
            unset($sq['search']);
        return $sq;
    }
    
    function fn_getRows($pageNo, $noPageLimit = false) {
        //$pageNo is target page
        $intPageNo = intval($pageNo);
        if ($intPageNo <= 0)
            Utils::error('Invalid page number');
        $perPage = Session::get('perPage') ?: 25;
        if ($list = Session::get($this->SLC . 'list'))
            $data = $this->model->getSearchDataList(implode(',', $noPageLimit ? $list : array_slice($list, ($intPageNo - 1) * $perPage, $perPage)), false);
            //shows the elements needed to grab
        else if ($sq = Session::get($this->SLC . 'sq'))
            $data = $this->model->getSearchData($sq, false, $intPageNo, $perPage);
        else
            Utils::error('Search expired');
        if (empty($data))
            Utils::error();
        return $data;
    }

    function fn_changeItemsPerPage($itemsPerPage = 25) {
        $itemsPerPage = Utils::validate($itemsPerPage, 'qty');
        if($itemsPerPage > 100)
            Utils::error();
        Session::set('perPage', $itemsPerPage);
        return ['count' => $_GET['count'], 'perPage' => $itemsPerPage, 'data' => $this->fn_getRows(1)];
    }

    function fn_export($topline = [], $inputOnly = false) {
        if ($inputOnly) {
            $pklist = [];
            $data = $this->fn_validateOperation('pk', [0, 1, 'Transporter'], [0, 1, 'Transporter', 'TransporterTrackNum']);
            foreach($data as $key => $row) {
                $id = $data[$key][1];
                $data[$key][1] = $data[$key][0];
                $data[$key][0] = $id;
            }
        } else {
            $list = Session::get($this->SLC . 'list');
            $sq = Session::get($this->SLC . 'sq');
            $data = $list ? $this->model->getSearchDataList(implode(',', $list), true) : ($sq ? $this->model->getSearchData($sq, true) : false);
        }
        if (empty($data)) {
            echo 'No items in list for export.';
            exit;
        }
        try {
            $filename = $this->SLC . ($inputOnly ? 'Transfer' : '') . date('Y-m-d-his');
            header('Content-Type: text/csv; charset = utf-8');
            header("Content-Disposition: attachment; filename = $filename.csv");
            $output = fopen('php://output', 'w');
            fputcsv($output, $topline);
            foreach ($data as $rowNum => $row) {
                foreach ($row as $key => $value) {
                    if (preg_match('/^[0-9]+$/', $value))
                        $row[$key] = '="' . $value . '"';
                }
                fputcsv($output, $row);
            }
            fclose($output);
        } catch (Exception $e) {
            echo "An error occured while exporting your file. Please try again later or, if the problem persists, contact us.";
        }
    }

    //settings: ['param' - parameter for callback, 'firstrow' - parameter = first row, 'nopage' - no page limit, 'dupl' - duplicates in index allowed, 'allowempty' - allow empty]
    function fn_validateOperation($operation, $sufficient = [0, 1], $necessary = [0, 1], $settings = []) {
        $info = $_POST[$this->SLC . 'info'];
        if (empty($info) || !($settings['nopage'] || (Session::get('perPage') ?: 25) >= count($info)))
            if ($settings['allowempty'])
                return [];
            else
                Utils::error('Empty');
                //checks if theres nothing in case someone edits js
        if(!is_array($info)) {
            $info = json_decode($info, true);
            if(empty($info) || !is_array($info))
                Utils::error();
        }//checks the array to see if theres anything inside of it
        $list = [];
        if($settings['firstrow'])
            $settings['param'] = (isset($info[0][0]) ? $info[0][0] : Utils::error());//unused
        foreach ($info as $rowNum => $row) {//format is [num => [name => value]]
            if (!is_array($row))
                Utils::error('a');
            foreach ($row as $key => $dataPoint) {
                if (!in_array($key, $sufficient))//if name isn't an actual input
                    Utils::error('s' . $key);
                if (!is_string($dataPoint))//if the value isn't a string
                    unset($row[$key]);
                else {
                    $row[$key] = trim($dataPoint, " =`'\"\t\r\n");//removes all new lines/tabs
                    if ((empty($row[$key]) && $row[$key] !== '0') || $row[$key] == 'null')
                        unset($row[$key]);//if its empty remove it
                }
            }
            if(empty($row)) {//if the entirety of the row is empty after going through all the elements remove it
                unset($info[$rowNum]);
                continue;
            }
            foreach ($necessary as $key) {//makes sure all rows have the necessary inputs changed
                if (is_null($row[$key])) {
                    Utils::error('n' . $key);
                }
            }
            if (!$settings['dupl']) {
                if (in_array($row[0], $list)) {
                    unset($info[$rowNum]);
                    continue;
                } else
                    $list[] = $row[0];
            }//used
            if ($settings['param'])
                $info[$rowNum] = $this->{'fn_validate' . $operation}($row, $settings['param']);
            else
                $info[$rowNum] = $this->{'fn_validate' . $operation}($row);
        }
        return array_values($info) ?: false;//returns the remaining values numerically
    }
    
    function fn_validate_Product($allowempty = false) {
        return $this->fn_validateOperation('product', ['Qty', 'RootCategory', 'SubCategory', 'Brand', 'Price', 'Name', 'Materials', 'Color', 'StyleNo', 'UPC', 'Size', 'Specification'], 
        ['Qty', 'RootCategory', 'SubCategory', 'Price', 'Name'], 
        ['dupl' => true, 'nopage' => true, 'allowempty' => $allowempty]);
    }
    
    function fn_validateProduct($row) {
        $row['Qty'] = Utils::validate($row['Qty'], 'qty');
        $row['HomeCategoriesID'] = $this->model->getIdByName('HomeCategories', $row['SubCategory'], 'RootCategories', $row['RootCategory']);
        $row['UnitPrice'] = Utils::validate($row['Price'], 'float');
        unset($row['RootCategory'], $row['SubCategory'], $row['Price']);
        return $row;
    }
}