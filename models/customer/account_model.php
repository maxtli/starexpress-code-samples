<?php

class Account_Model extends Model {

    function __construct() {
        parent::__construct();
    }
    
    function findTransactions($user) {
        $raw = $this->db->resultSetProcMultiple('CALL find_account_transactions (:user)', ['user' => $user], false);
        return array_merge($raw[0], $raw[1]);
    }
    
    public function getPersonalInfo($id) {
        $raw = $this->db->select("SELECT AU.Nickname, A.Type AS AccountType, U.SignUpDate, E.Email, CONCAT('+', C.PhoneCode, ' ', Ph.Number) AS Phone, Ad.Address, P.FirstName, "
        . "P.LastName, P.Birthday FROM AccountsUsers AS AU INNER JOIN Accounts AS A ON AU.AccountsID = A.ID INNER JOIN Users AS U ON AU.UsersID = U.ID "
        . "INNER JOIN Emails AS E ON U.EmailsID = E.ID INNER JOIN Phones AS Ph ON U.PhonesID = Ph.ID INNER JOIN Countries AS C ON Ph.CountriesID = C.ID "
        . "INNER JOIN AddressPeople AS AP ON U.AddressPeopleID = AP.ID INNER JOIN Address AS Ad ON AP.AddressID = Ad.ID INNER JOIN People AS P ON AP.PeopleID = P.ID "
        . "WHERE AU.ID = :id LIMIT 1", ['id' => $id]);
        return $raw && $raw[0] ? $raw[0] : false;
    }
    
    function getAccountDetails($user) {
        try {
            $acid = $this->db->select("SELECT Username, AccountsID FROM AccountsUsers WHERE ID = :user", ['user' => $user])[0];
            $aid = " IN (" . implode(', ', array_column($this->db->select("SELECT ID FROM AccountsUsers WHERE AccountsID = :acid", ['acid' => $acid['AccountsID']]), 'ID')) . ")";
        } catch (Exception $ex) {
            return false;
        }
        $output = ['user' => $acid['Username']];
        $sql = ["fccount" => "SELECT COUNT(*) AS Count FROM Forecasts WHERE SignTime IS NULL AND AccountsUsersID" . $aid,
            "fcrecent" => "SELECT F.CreateTime, T.Name AS Transporter, F.TrackingNumber FROM Forecasts AS F INNER JOIN Transporters AS T ON F.TransportersID = T.ID WHERE F.AccountsUsersID" . $aid . " AND SignTime IS NULL ORDER BY F.ID DESC LIMIT 5",
            "ivcount" => "SELECT SUM(FG.RemainingQuantity) AS Count FROM ForecastsGoods AS FG INNER JOIN Forecasts AS F ON FG.ForecastsID = F.ID WHERE FG.State = 'Verified' AND F.AccountsUsersID" . $aid,
            "ivrecent" => "SELECT SUM(FG.RemainingQuantity) AS Qty, H.Name AS Category, ID.Brand, P.Name AS Item FROM ForecastsGoods AS FG INNER JOIN Products AS P ON FG.ProductsID = P.ID INNER JOIN (SELECT DISTINCT ProductsID FROM Inventory WHERE AccountsID = " 
            . $acid['AccountsID'] . " ORDER BY ID DESC LIMIT 10) AS IP ON P.ID = IP.ProductsID INNER JOIN ItemDetails AS ID ON P.ItemDetailsID = ID.ID INNER JOIN HomeCategories AS H ON P.HomeCategoriesID = H.ID WHERE FG.State = 'Verified' GROUP BY P.ID HAVING SUM(FG.RemainingQuantity) > 0",
            "pkcount" => "SELECT COUNT(*) AS Count FROM Packages WHERE Status NOT IN ('Delivered', 'Unboxed', 'Deleted') AND AccountsUsersID" . $aid,
            "pkrecent" => "SELECT P.CreateTime, P.TrackingNumber, IFNULL(P.ActualWeight, P.DeclaredWeight) AS Weight, P.Status FROM Packages AS P "
            . "INNER JOIN (SELECT DISTINCT PackagesID FROM PackagesStatus ORDER BY ID DESC LIMIT 10) AS PS ON P.ID = PS.PackagesID WHERE P.Status <> 'Deleted' AND P.AccountsUsersID" . $aid . " LIMIT 5",
            "tscount" => "SELECT COUNT(*) AS Count FROM Payments AS T WHERE T.Status IN ('Awaiting Deposit', 'Processing') AND T.CreateUser" . $aid,
            "tsdepcount" => "SELECT COUNT(*) AS Count FROM Payments AS T WHERE T.Status = 'Awaiting Deposit' AND T.CreateUser" . $aid];
        foreach($sql as $key => $query) 
            $output[$key] = $this->db->select($query);
        return $output;
    }
}
/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

