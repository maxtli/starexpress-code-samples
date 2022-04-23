<?php
require '/home1/thestar/thestarexpress/libs/config.php';
require URL .'libs/helper/UpdateStatus.php';
require URL .'libs/Database.php';
//post 
//for china mailer
//require URL .'libs/mailer/chinamailer.php';
//for phpmailer
//use PHPMailer\PHPMailer\PHPMailer;
//use PHPMailer\PHPMailer\Exception;
//require URL .'libs/mailer/PHPMailer/src/PHPMailer.php';
//require URL .'libs/mailer/PHPMailer/src/Exception.php';
//require URL .'libs/mailer/PHPMailer/src/SMTP.php';
$transporterName = 'TST';

$log = fopen("getTSTStatus_log.txt", "a");
fwrite($log, "Get Delivery Status Task Started. " . date("Y-m-d h:i:sa")."  \r\n");

$db = new Database(DBTYPE, DBHOST, DBNAME, DBUSER, DBPASS);
$sql="SELECT D.ID, D.PackagesID, D.TrackingNumber, D.OutboundTime, D.TransferTransportersID, 
    D.TransferTrackingNumber, Tr.Website FROM Packages AS P INNER JOIN Deliveries As D ON P.ID = D.PackagesID 
    INNER JOIN TransportersServices AS TS ON D.TransportersServicesID = TS.ID 
    INNER JOIN Transporters AS Tr ON TS.TransportersID = Tr.ID WHERE P.Status = 'delivery' AND Tr.name = " . $transporterName;
$Deliveries = $db->select($sql, ['status'=>'Delivery']);

foreach ($Deliveries as $Delivery) {
    $inputData = ['data' => $Delivery["TrackingNumber"]];
    fwrite($log, "\r\nAttempting to retrieve data for tracking number "
            . $Delivery["TrackingNumber"] . " from site " . $Delivery["Website"] . "...."."\r\n");
    $result = submit($inputData,$Delivery["Website"]);
    
    //process data for this delivery id.
    $result = rtrim($result, '}');
    $result = str_replace('{"data":[[{', '', $result);
    $result = explode('}]],"success":', $result);

    if ($result[1] != 'true') {
        fwrite($log, "Failed");
        continue;
    }

    $result = explode('},{', $result[0]);
    if (strpos($result[0],"不存在")) {
        if ($Delivery["Status"]!="No info" && strtotime("-3 Days")>strtotime($Delivery["OutboundTime"])){
            $sql="UPDATE Deliveries SET Status = :status WHERE ID = " . $Delivery['ID'];
            $db->iud($sql, ['status'=>"No info"]);
        }
        continue;
    }
    else{
        if($Delivery["Status"]=="No info"){
            $sql="UPDATE Deliveries SET Status = :status WHERE ID = " . $Delivery['ID'];
            $db->iud($sql, ['status'=>NULL]);
        }
        if (strpos($result[0],"韵达")||strpos($result[0],"果果")){
            $transfer = explode($Delivery["TrackingNumber"], $result[0]);
            $transfer[1] = rtrim($transfer[1], '\"');
            if ($Delivery['Transfer']!=$transfer[1]){
                $sql="UPDATE Deliveries SET Transfer = :transfer WHERE ID = " . $Delivery['ID'];
                $db->iud($sql, ['transfer'=>$transfer[1]]);
            }
            array_shift($result);
        }
    }
    $sql="SELECT StatusTime FROM DeliveriesStatus WHERE DeliveriesID = :deliveriesID ORDER BY StatusTime DESC";
    $lastTime = $db->select($sql, ['deliveriesID' => $Delivery['ID']])[0]['StatusTime'];

    $newestStatus = NULL;
    $newestTime = NULL;
    foreach ($result as $entry) {
        $pattern = "/\"date\":\"(.*)\",\"info\":\"(.*)\",\"status\":(.*)/";
        preg_match($pattern, $entry, $entryDetails);
        
        $date = $entryDetails[1];
        if ($date <= $lastTime) {
            break;
        }
        $activity = $entryDetails[2];
        preg_match("/^【(.*?)】/", $activity, $locationData);
        $location="";
        if (isset($locationData[1])) {
            $location = $locationData[1];
            $activity = str_replace("【" . $location . "】", " ", $activity);
        }
        
        switch ($entryDetails[3]) {
            case 500:
                $status = "Ground China";
                if(strpos($activity,"签收")){
                    $sql="UPDATE Packages SET Status = :status WHERE ID = ".$Delivery['PackagesID'];
                    $db->iud($sql, ['status'=>"Delivered"]);
                }
                break;
            case 300:
                $status = 'On Flight To China';
                break;
            case 100:
            case 200:
                $status = 'Ground US';
                break;
            case 400:
                $status = 'Customs';
                break;
            default:
                $status = '';break;
        }

        $insertArray = array(
            'statusTime' => $date,
            'status' => $status,
            'activity' => $activity,
            'location' => $location,
            'deliveriesID' => $Delivery['ID'],
        );
        
        $sql="INSERT INTO DeliveriesStatus (StatusTime, Status, Activity, Location, DeliveriesID) VALUES (:statusTime, :status, :activity, :location, :deliveriesID)";
        $db->iud($sql, $insertArray);
        
        if($date > $newestTime){
            $newestTime = $date;
            $newestStatus = $insertArray;
        }
    }
    
    if ($newestStatus){
        $sql="SELECT P.TrackingNumber, Ph.Number, Pr.SMSDomain, C.PhoneCode FROM "
        . "((((Packages AS P INNER JOIN Recipients As R ON P.RecipientsID = R.ID) INNER JOIN Phones AS Ph ON R.PhonesID = Ph.ID)"
        . "INNER JOIN Countries AS C ON Ph.CountriesID = C.ID) LEFT JOIN Providers AS Pr ON Ph.ProvidersID = Pr.ID) WHERE P.ID = :packagesID";
        $sender = $db->select($sql, ['packagesID'=>$Delivery['PackagesID']]);
        $message = wordwrap("【星际快递】单号：" . $sender[0]['TrackingNumber'] . ",".$newestStatus['activity'] . " " . $newestStatus['statusTime'], 70);
        fwrite($log, "Attempting to text the customer for tracking number: ". $sender[0]['TrackingNumber']."  \r\n");
        switch ($sender[0]["PhoneCode"]) {
            case "1":
                $to = $sender[0]['Number'] . '@' . $sender[0]['SMSDomain'];
                $subject = "";
                $body = $message;
                $from = "trackingupdate@thestarexpress.com";
                $headers = "From: $from\r\n";
                if (mail ($to, $subject, $body, $headers)) {
                    fwrite($log, "texts succeed. \r\n");
                } else {
                    fwrite($log, "texts failed. \r\n");
                }
                break;
            case "86":
                $postData['username']='18342910453';
                $postData['password']='F36524A535FA82CDB97D90FD34C02580';
                $postData['gwid']='638ed9a0';
                
                $postData['mobile']=$sender[0]["Number"];
                $postData['message']=$message;
                fwrite($log, postSMS($url,$postData) ."  \r\n");
                break;
            default:
                $sms = new PHPMailer(TRUE);
                try {
                    $sms->setFrom('trackingupdate@thestarexpress.com', 'StarExpress Customer Service');
                    $sms->addAddress($sender[0]['Number'] . '@' . $sender[0]['Domain']);
                    $sms->Subject = '';
                    $sms->Body = $message;
                    $sms->send();
                } catch (Exception $ex) {
                    fwrite($log, "texts failed. Error codes: " . $ex->errorMessage()."  \r\n");
                }
                break;
        }
    }
}

fwrite($log, "\r\nUpdate finished.\r\n");
fclose($log);

