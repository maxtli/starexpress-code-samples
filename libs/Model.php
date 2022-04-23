<?php

class Model {

    function __construct() {
        try {
            $this->db = new Database(DBTYPE, DBHOST, DBNAME, DBUSER, DBPASS);
        } catch (Exception $ex) {
            echo "Error";
            $log = fopen("error_log.txt", "a");
            fwrite($log, "Error at time " . date("Y-m-d h:i:sa") . "  \r\n" . $ex . "\r\n\r\n");
            fclose($log);
            exit;
        }
    }

    //put 'field AS Name' 
    function getList($field, $table, $where = '', $params = []) {
        $raw = $this->db->select('SELECT ' . $field . ' FROM ' . $table . ' ' . $where, $params);
        //echo "SELECT ' . $field . ' FROM ' . $table . ' ' . $where";
        //print_r($raw);
        $output = [];
        foreach ($raw as $num => $row) {
            $output[] = $row['Name'];
        }
        //print_r($output);
        return $output;
    }
    
    function getCorrespondingList($field1, $field2, $table) {
        $raw = $this->db->select('SELECT ' . $field1 . ', ' . $field2 . ' FROM ' . $table);
        $output = [];
        foreach($raw as $row) {
            $output[$row[$field1]] = $row[$field2];
        }
        return $output;
    }
    
    function getId($table, $id, $acid = false) {
        return $this->db->select('SELECT ID FROM ' . $table . ' WHERE ID = :id' . ($acid ? ' AND AccountsID = :acid' : ''),
        $acid ? ['id' => $id, 'acid' => $acid] : ['id' => $id], true)[0]['ID'];
    }

    function getIdByName($table, $name, $depTable = false, $depName = false) {
        return $this->db->select('SELECT A.ID FROM ' . $table . ' AS A ' 
        . ($depTable ? 'INNER JOIN ' . $depTable . ' AS B ON A.' . $depTable . 'ID = B.ID ' : '') 
        . 'WHERE A.Name = :name' . ($depName ? ' AND B.Name = :depname' : ''), 
        $depName ? ['name' => $name, 'depname' => $depName] : ['name' => $name], true)[0]['ID'];
    }
    
    function getCurrency($abbr) {
        return $this->db->select("SELECT ID, Name FROM Currencies WHERE Abbreviation = :abbr", ['abbr' => $abbr], true)[0];
    }
    
    function insertItem($table, $product) {
        $allCols = ['Brand', 'StyleNo', 'Color', 'Size', 'Specification', 'Materials'];
        $idet = [];
        foreach ($allCols as $i => $col) {
            if($product[$col]) {
                $idet[$col] = $product[$col];
                unset($product[$col], $allCols[$i]);
            }
        }
        $raw = $this->db->select('SELECT ID FROM ItemDetails WHERE ' . implode(' AND ', array_map(function($v){ return "$v = :$v"; }, array_keys($idet))) 
        . (empty($idet) || empty($allCols) ? '' : ' AND ') . (empty($allCols) ? '' : implode(' IS NULL AND ', $allCols) . ' IS NULL'), $idet);
        if(empty($raw)) {
            $this->db->iudProc('INSERT INTO ItemDetails (' . implode(', ', array_keys($idet)) . ') VALUES (:' . implode(', :', array_keys($idet)) . ')', $idet);
            if($table === 'OrderTickets')
                return $this->db->lastInsertId();
            $product['ItemDetailsID'] = $this->db->lastInsertId();
            $this->db->iudProc('INSERT INTO ' . $table . ' (' . implode(', ', array_keys($product)) . ') VALUES (:' . implode(', :', array_keys($product)) . ')', $product);
            return $this->db->lastInsertId();
        } else if ($table === 'OrderTickets')
            return $raw[0]['ID'];
        else {
            $product['ItemDetailsID'] = $raw[0]['ID'];
            $raw = $this->db->select('SELECT ID FROM ' . $table . ' WHERE ' . implode(' AND ', array_map(function($v){ return "$v = :$v"; }, array_keys($product))) 
            . (empty($product['UPC']) ? ' AND UPC IS NULL ' : ''), $product);
            if($raw && $raw[0])
                return $raw[0]['ID'];
            $this->db->iudProc('INSERT INTO ' . $table . ' (' . implode(', ', array_keys($product)) . ') VALUES (:' . implode(', :', array_keys($product)) . ')', $product);
            return $this->db->lastInsertId();
        }
    }

    function searchList($numlist) {
        return $this->db->resultSetProcMultiple('CALL check_track_num_list ("' . $numlist . '", :uid)', ['uid' => Session::get('ID')[0]]);//call the procedure
    }

    function getBalance($user, $currency = false) {
        // return 30000;
        $balance = ['user' => $user];
        if($currency) $balance['cid'] = $currency;
        $raw = $this->db->select('CALL get_account_balance (:user, ' . ($currency ? ':cid' : 'NULL') . ')', $balance);
        if($currency) return empty($raw) ? 0 : round(floatval($raw[0]['Balance']), 2);
        $balance = [];
        if (!empty($raw)) {    
            foreach($raw as $row){
                $balance[$row['Abbreviation']] = $row['Balance'];
            }
        } else {
            $balance = ["USD" => "0"];
        }
        return $balance;
    }
}