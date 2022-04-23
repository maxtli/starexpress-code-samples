<?php

class UploadOrders_Model extends Model {

    function __construct() {
        parent::__construct();
    }
    
    function getPriceStandard($wid, $cid, $oinfo) {
        $totalprice = 0;
        foreach($oinfo as $key => $order) {
            $raw = $this->db->select("SELECT TRUNCATE(Price, 2) AS Price FROM UnitPrices WHERE WarehousesID = :wid AND HomeCategoriesID = :hcid AND PackageType = 'Declaration'", ['wid' => $wid, 'hcid' => $order['Category']]);
            if(empty($raw) || !$raw[0]) return false;
            $price = $order['DeclaredWeight'] * floatval($raw[0]['Price']);
            $oinfo[$key]['Price'] = $price;
            $totalprice += $price;
        }
        $warehousecurrency = $this->db->select("SELECT CurrenciesID FROM Warehouses WHERE ID = :wid", ['wid' => $wid])[0]['CurrenciesID'];
        if($cid === $warehousecurrency) return ['TotalPrice' => round($totalprice, 2), 'Orders' => $oinfo];
        $raw2 = $this->db->select("SELECT CE.ConversionRate, CONCAT(FC.Abbreviation, ' ', FC.Symbol, '1.00 >> ', TC.Abbreviation, ' ', TC.Symbol, TRUNCATE(CE.ConversionRate, 3)) AS Rate "
        . "FROM CurrenciesExchange AS CE INNER JOIN Currencies AS FC ON CE.FromCurrency = FC.ID INNER JOIN Currencies AS TC ON CE.ToCurrency = TC.ID WHERE CE.FromCurrency = :from AND CE.ToCurrency = :to", 
        ['from' => $cid, 'to' => $warehousecurrency]);
        if(empty($raw2) || !$raw2[0]) return false;
        $finalprice = round($totalprice / floatval($raw2[0]['ConversionRate']), 2);
        return ['TotalPrice' => round($totalprice, 2), 'WarehouseCurrency' => $warehousecurrency, 'Rate' => $raw2[0]['Rate'], 'ExcPrice' => $finalprice, 'Orders' => $oinfo];
    }
    
    function getPrice($wid, $cid, $categories, $weight) {
        $raw = $this->db->select("SELECT W.CurrenciesID, W.WeightUnit, MAX(UP.Price) AS MaxPrice, MIN(UP.Price) AS MinPrice FROM Warehouses AS W "
        . "INNER JOIN UnitPrices AS UP ON UP.WarehousesID = W.ID WHERE W.ID = :wid AND UP.PackageType = 'Declaration' AND HomeCategoriesID IN ('" . $categories . "')", ['wid' => $wid]);
        if(empty($raw) || !$raw[0]) return false;
        $price = floatval($raw[0]['MaxPrice']);
        if(abs($price - floatval($raw[0]['MinPrice'])) > 0.01) return false;
        if($cid === $raw[0]['CurrenciesID']) return ['UnitPrice' => round($price, 2) . ' per ' . $raw[0]['WeightUnit'], 'TotalPrice' => round($weight * $price, 2)];
        $raw2 = $this->db->select("SELECT CE.ConversionRate, CONCAT(FC.Abbreviation, ' ', FC.Symbol, '1.00 >> ', TC.Abbreviation, ' ', TC.Symbol, TRUNCATE(CE.ConversionRate, 3)) AS Rate "
        . "FROM CurrenciesExchange AS CE INNER JOIN Currencies AS FC ON CE.FromCurrency = FC.ID INNER JOIN Currencies AS TC ON CE.ToCurrency = TC.ID WHERE CE.FromCurrency = :from AND CE.ToCurrency = :to", 
        ['from' => $cid, 'to' => $raw[0]['CurrenciesID']]);
        if(empty($raw2) || !$raw2[0]) return false;
        $finalprice = round($weight * $price / floatval($raw2[0]['ConversionRate']), 2);
        return ['UnitPrice' => round($price, 2) . ' per ' . $raw[0]['WeightUnit'], 'TotalPrice' => round($weight * $price, 2), 'WarehouseCurrency' => $raw[0]['CurrenciesID'], 'Rate' => $raw2[0]['Rate'], 'ExcPrice' => $finalprice];
    }

    function uploadOrderStandard($user, $acid, $pk, $pkcbalance, $wcbalance = false) {
        $this->db->beginTransaction();
        $odinfo = $pk['odinfo'];
        $this->db->iudProc("INSERT INTO Orders (CreateTime, OrderType, TotalQuantity, TotalPrice, CurrenciesID, Status, CreateUser) VALUES (NOW(), 'Package', :count, :price, :cid, 'Placed', :user)", 
            ['count' => count($odinfo), 'price' => $pk['Price'], 'cid' => $pk['WarehouseCurrency'] ?: $pk['Currency'], 'user' => $user]);
        $pk['oid'] = $this->db->lastInsertId();
        if($pk['WarehouseCurrency']) {
            $this->db->iudProc("INSERT INTO Exchanges (ExchangeTime, BaseCurrency, ToCurrency, BaseCurrencyAmount, ToCurrencyAmount, AccountsUsersID) "
                . "VALUES (NOW(), :from, :to, :fromamount, :toamount, :user)", ['from' => $pk['Currency'], 'to' => $pk['WarehouseCurrency'], 'fromamount' => $pk['ExcPrice'], 'toamount' => $pk['Price'], 'user' => $user]);
            $eid = $this->db->lastInsertId();
            $this->db->iudProc("INSERT INTO Transactions (TransactionTime, TransactionType, TransactionKey, ChangeAmount, CurrenciesID, Balance, AccountsID) "
                . "VALUES (NOW(), 'Exchange', :eid, :excprice, :cid, :newbal, :acid)", ['eid' => $eid, 'excprice' => -1*$pk['ExcPrice'], 'cid' => $pk['Currency'], 'newbal' => round($pkcbalance - $pk['ExcPrice'], 2), 'acid' => $acid]);
            $this->db->iudProc("INSERT INTO Transactions (TransactionTime, TransactionType, TransactionKey, ChangeAmount, CurrenciesID, Balance, AccountsID) "
                . "VALUES (NOW(), 'Exchange', :eid, :price, :cid, :newbal, :acid)", ['eid' => $eid, 'price' => $pk['Price'], 'cid' => $pk['WarehouseCurrency'], 'newbal' => round($wcbalance + $pk['Price'], 2), 'acid' => $acid]);
        }
        $this->db->iudProc("INSERT INTO Transactions (TransactionTime, TransactionType, TransactionKey, ChangeAmount, CurrenciesID, Balance, AccountsID) VALUES (NOW(), 'Order', :oid, :price, :cid, :newbal, :acid)", 
        ['oid' => $pk['oid'], 'price' => -1*$pk['Price'], 'cid' => $pk['WarehouseCurrency'] ?: $pk['Currency'], 'newbal' => $pk['WarehouseCurrency'] ? $wcbalance : round($pkcbalance - $pk['Price'], 2), 'acid' => $acid]);
        foreach($odinfo as $order) {
            $origrow = $order['Info'];
            $origrow['HomeCategoriesID'] = $order['Category'];
            $packageParams = $this->configurePackageParams($user, $origrow['Recipient'], $origrow['Address'], $origrow['Phone'], $pk['Warehouse'], $order['Price'], $pk['oid'], $order['DeclaredWeight'], $order['DeclaredVolume']);
            $packageParams['Qty'] = $origrow['Qty'];
            $paramTitles = $this->configureOrderParams($origrow);
            $sql = "CALL upload_order_standard (" . implode(', ', $paramTitles)
                . ", :Qty, :Phone, :User, 'Air', :FirstName, :LastName, :Address, :City, :State, :Weight, " . ($row['DeclaredVolume'] ? ':Volume' : 'NULL') . ", :Warehouse, :PackagePrice, :oid, @out)";
            $this->db->outParamProc($sql, array_merge($origrow, $packageParams));
        }
        $this->db->commit();
        return true;
    }

    function uploadOrderMerge($user, $acid, $pk, $pkcbalance, $wcbalance = false) {
        $this->db->beginTransaction();
        $odinfo = $pk['odinfo'];
        $this->db->iudProc("INSERT INTO Orders (CreateTime, OrderType, TotalQuantity, TotalPrice, CurrenciesID, Status, CreateUser) VALUES (NOW(), 'Package', :count, :price, :cid, 'Placed', :user)", 
            ['count' => 1, 'price' => $pk['Price'], 'cid' => $pk['WarehouseCurrency'] ?: $pk['Currency'], 'user' => $user]);
        $pk['oid'] = $this->db->lastInsertId();
        if($pk['WarehouseCurrency']) {
            $this->db->iudProc("INSERT INTO Exchanges (ExchangeTime, BaseCurrency, ToCurrency, BaseCurrencyAmount, ToCurrencyAmount, AccountsUsersID) "
                . "VALUES (NOW(), :from, :to, :fromamount, :toamount, :user)", ['from' => $pk['Currency'], 'to' => $pk['WarehouseCurrency'], 'fromamount' => $pk['ExcPrice'], 'toamount' => $pk['Price'], 'user' => $user]);
            $eid = $this->db->lastInsertId();
            $this->db->iudProc("INSERT INTO Transactions (TransactionTime, TransactionType, TransactionKey, ChangeAmount, CurrenciesID, Balance, AccountsID) "
                . "VALUES (NOW(), 'Exchange', :eid, :excprice, :cid, :newbal, :acid)", ['eid' => $eid, 'excprice' => -1*$pk['ExcPrice'], 'cid' => $pk['Currency'], 'newbal' => round($pkcbalance - $pk['ExcPrice'], 2), 'acid' => $acid]); 
            $this->db->iudProc("INSERT INTO Transactions (TransactionTime, TransactionType, TransactionKey, ChangeAmount, CurrenciesID, Balance, AccountsID) "
                . "VALUES (NOW(), 'Exchange', :eid, :price, :cid, :newbal, :acid)", ['eid' => $eid, 'price' => $pk['Price'], 'cid' => $pk['WarehouseCurrency'], 'newbal' => round($wcbalance + $pk['Price'], 2), 'acid' => $acid]);
        }
        $this->db->iudProc("INSERT INTO Transactions (TransactionTime, TransactionType, TransactionKey, ChangeAmount, CurrenciesID, Balance, AccountsID) VALUES (NOW(), 'Order', :oid, :price, :cid, :newbal, :acid)", 
        ['oid' => $pk['oid'], 'price' => -1*$pk['Price'], 'cid' => $pk['WarehouseCurrency'] ?: $pk['Currency'], 'newbal' => $pk['WarehouseCurrency'] ? $wcbalance : round($pkcbalance - $pk['Price'], 2), 'acid' => $acid]);
        $pdcurrency = $pk['WarehouseCurrency'] ?: $pk['Currency'];
        $packageParams = $this->configurePackageParams($user, $odinfo[0]['Info']['Recipient'], $odinfo[0]['Info']['Address'], $odinfo[0]['Info']['Phone'], $pk['Warehouse'], $pk['Price'], $pk['oid'], $pk['Weight'], $pk['Volume'] ?: false);
        $pkid = $this->db->outParamProc("CALL create_package (:Phone, :User, 1, :FirstName, :LastName, :Address, NULL, :City, :State, :Weight, " 
        . ($volume ? ":Volume" : "NULL") . ", :Warehouse, :PackagePrice, :oid, @out)", $packageParams);
        foreach($odinfo as $order) {
            $origrow = $order['Info'];
            $qty = $origrow['Qty'];
            $origrow['HomeCategoriesID'] = $order['Category'];
            $paramTitles = $this->configureOrderParams($origrow);
            $this->db->iudProc("INSERT INTO OrdersInfo (" . implode(', ', array_keys($paramTitles)) . ') VALUES (' . implode(', ', $paramTitles) . ')', $origrow);
            $this->db->iudProc("INSERT INTO PackagesDeclaration (DeclaredQuantity, OrdersInfoID, PackagesID) VALUES (:qty, :oid, :pkid)", ['qty' => $qty, 'oid' => $this->db->lastInsertId(), 'pkid' => $pkid]);
        }
        $this->db->commit();
        return true;
    }

    function uploadOrderSplit($user, $acid, $pk, $pkcbalance, $wcbalance = false) {
        $this->db->beginTransaction();
        $odinfo = $pk['odinfo'];
        $this->db->iudProc("INSERT INTO Orders (CreateTime, OrderType, TotalQuantity, TotalPrice, CurrenciesID, Status, CreateUser) VALUES (NOW(), 'Package', :count, :price, :cid, 'Placed', :user)", 
            ['count' => 1, 'price' => $pk['Price'], 'cid' => $pk['WarehouseCurrency'] ?: $pk['Currency'], 'user' => $user]);
        $pk['oid'] = $this->db->lastInsertId();
        if($pk['WarehouseCurrency']) {
            $this->db->iudProc("INSERT INTO Exchanges (ExchangeTime, BaseCurrency, ToCurrency, BaseCurrencyAmount, ToCurrencyAmount, AccountsUsersID) "
                . "VALUES (NOW(), :from, :to, :fromamount, :toamount, :user)", ['from' => $pk['Currency'], 'to' => $pk['WarehouseCurrency'], 'fromamount' => $pk['ExcPrice'], 'toamount' => $pk['Price'], 'user' => $user]);
            $eid = $this->db->lastInsertId();
            $this->db->iudProc("INSERT INTO Transactions (TransactionTime, TransactionType, TransactionKey, ChangeAmount, CurrenciesID, Balance, AccountsID) "
                . "VALUES (NOW(), 'Exchange', :eid, :excprice, :cid, :newbal, :acid)", ['eid' => $eid, 'excprice' => -1*$pk['ExcPrice'], 'cid' => $pk['Currency'], 'newbal' => round($pkcbalance - $pk['ExcPrice'], 2), 'acid' => $acid]); 
            $this->db->iudProc("INSERT INTO Transactions (TransactionTime, TransactionType, TransactionKey, ChangeAmount, CurrenciesID, Balance, AccountsID) "
                . "VALUES (NOW(), 'Exchange', :eid, :price, :cid, :newbal, :acid)", ['eid' => $eid, 'price' => $pk['Price'], 'cid' => $pk['WarehouseCurrency'], 'newbal' => round($wcbalance + $pk['Price'], 2), 'acid' => $acid]);
        }
        $this->db->iudProc("INSERT INTO Transactions (TransactionTime, TransactionType, TransactionKey, ChangeAmount, CurrenciesID, Balance, AccountsID) VALUES (NOW(), 'Order', :oid, :price, :cid, :newbal, :acid)", 
        ['oid' => $pk['oid'], 'price' => -1*$pk['Price'], 'cid' => $pk['WarehouseCurrency'] ?: $pk['Currency'], 'newbal' => $pk['WarehouseCurrency'] ? $wcbalance : round($pkcbalance - $pk['Price'], 2), 'acid' => $acid]);

        $packageParams = $this->configurePackageParams($user, $odinfo['Info']['Recipient'], $odinfo['Info']['Address'], $odinfo['Info']['Phone'], $pk['Warehouse'], $pk['Price'], $pk['oid']);
        $origrow = $odinfo['Info'];
        $origrow['HomeCategoriesID'] = $odinfo['Category'];
        $paramTitles = $this->configureOrderParams($origrow);
        $this->db->iudProc("INSERT INTO OrdersInfo (" . implode(', ', array_keys($paramTitles)) . ') VALUES (' . implode(', ', $paramTitles) . ')', $origrow);
        $oid = $this->db->lastInsertId();
        $weightsum = array_sum($pk['Specs']['weights']);
        foreach ($pk['Specs']['weights'] as $key => $weight) {
            $packageParams['Weight'] = $weight;
            $packageParams['PackagePrice'] = round($pk['Price'] * $weight / $weightsum, 2);
            if ($pk['Specs']['volumes'])
                $packageParams['Volume'] = $pk['Specs']['Volumes'][$key];
            $pkid = $this->db->outParamProc("CALL create_package (:Phone, :User, 1, :FirstName, :LastName, :Address, NULL, :City, :State, :Weight, " 
            . ($volumeArray ? ":Volume" : "NULL") . ", :Warehouse, :PackagePrice, :oid, @out)", $packageParams);
            $this->db->iudProc("INSERT INTO PackagesDeclaration (DeclaredQuantity, OrdersInfoID, PackagesID) VALUES (:qty, :oid, :pid)", ['qty' => $pk['Specs']['items'][$key], 'oid' => $oid, 'pid' => $pkid]);
        }
        $this->db->commit();
        return true;
    }

    function configureOrderParams(&$orderData) {
        $orderData['OrderID'] = $orderData[0];
        $paramTitles = array("HomeCategoriesID" => 'NULL', "Platform" => '"淘宝"', "BuyerID" => 'NULL', "OrderID" => 'NULL', "SKU" => 'NULL', "Price" => 'NULL',
            "Title" => 'NULL', "ProductDetail" => 'NULL', "Remarks" => 'NULL', "OrderRemarks" => 'NULL',
            "BuyerMessage" => 'NULL', "OrderStatus" => 'NULL', "OrderTime" => 'NULL', "PayTime" => 'NULL', "PaymentType" => '"支付宝"',
            "PaymentAccount" => 'NULL', "PaymentID" => 'NULL', "StoreName" => 'NULL');
        foreach ($orderData as $key => $dataPoint) {
            if ($paramTitles[$key])
                $paramTitles[$key] = ':' . $key;
            else
                unset($orderData[$key]);
        }
        return $paramTitles;
    }

    function configurePackageParams($user, $recip, $address, $phone, $warehouse, $pkprice, $oid, $weight = false, $volume = false) {
        $namelen = strlen($recip) < 10 ? 3 : 6;
        $lastName = substr($recip, 0, $namelen);
        $firstName = substr($recip, $namelen);
        $address = explode(' ', $address, 3);
        $params = ['User' => $user, 'FirstName' => $firstName, 'LastName' => $lastName, 'Address' => $address[2], 'City' => $address[1], 
        'State' => $this->getIdByName('States', $address[0]), 'Phone' => $phone, 'Warehouse' => $warehouse, 'PackagePrice' => $pkprice, 'oid' => $oid];
        if ($weight)
            $params['Weight'] = $weight;
        if ($volume)
            $params['Volume'] = $volume;
        return $params;
    }
}

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

